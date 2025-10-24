#!/usr/bin/env node
/**
 * CSS Contrast Checker
 * 
 * Scans CSS files for color values and validates WCAG 2.1 AA contrast ratios.
 * Specifically checks:
 * - Text colors on background colors (4.5:1 minimum)
 * - Button/interactive colors
 * - All semantic color tokens
 * 
 * Usage:
 *   node scripts/refiner/check-css-contrast.mjs packages/ds/src/styles/tokens/color.vars.css
 *   node scripts/refiner/check-css-contrast.mjs --all  # Scan all CSS
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';

/**
 * Calculate relative luminance (WCAG 2.1 formula)
 */
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1, color2) {
  const l1 = getLuminance(...color1);
  const l2 = getLuminance(...color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parse hex color to RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
}

/**
 * Extract CSS custom properties and their values
 */
function extractCSSVariables(css) {
  const variables = new Map();
  const varRegex = /--([a-z0-9-]+):\s*([^;]+);/gi;
  
  let match;
  while ((match = varRegex.exec(css)) !== null) {
    const name = `--${match[1]}`;
    let value = match[2].trim();
    
    // Resolve var() references
    const varRefRegex = /var\((--[a-z0-9-]+)\)/gi;
    let resolved = value;
    let refMatch;
    while ((refMatch = varRefRegex.exec(value)) !== null) {
      const refName = refMatch[1];
      if (variables.has(refName)) {
        resolved = resolved.replace(refMatch[0], variables.get(refName));
      }
    }
    
    variables.set(name, resolved);
  }
  
  return variables;
}

/**
 * Get final hex color value (resolve references)
 */
function resolveColor(value, variables) {
  if (value.startsWith('#')) {
    return value;
  }
  
  if (value.startsWith('var(')) {
    const varName = value.match(/var\((--[a-z0-9-]+)\)/)?.[1];
    if (varName && variables.has(varName)) {
      return resolveColor(variables.get(varName), variables);
    }
  }
  
  return null;
}

/**
 * Check contrast for a color pair
 */
function checkContrast(foreground, background, minRatio = 4.5) {
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);
  
  if (!fgRgb || !bgRgb) {
    return null;
  }
  
  const ratio = getContrastRatio(fgRgb, bgRgb);
  
  return {
    ratio: ratio.toFixed(2),
    passes: ratio >= minRatio,
    level: ratio >= 7.0 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'FAIL',
  };
}

/**
 * Scan CSS file for contrast issues
 */
async function scanCSSFile(filePath) {
  const css = await fs.readFile(filePath, 'utf8');
  const variables = extractCSSVariables(css);
  
  const issues = [];
  
  // Define color pairings to check
  const pairingsToCheck = [
    // Text on backgrounds
    { fg: '--ds-color-text-primary', bg: '--ds-color-surface-base', context: 'Primary text on base surface' },
    { fg: '--ds-color-text-secondary', bg: '--ds-color-surface-base', context: 'Secondary text on base surface' },
    { fg: '--ds-color-text-muted', bg: '--ds-color-surface-base', context: 'Muted text on base surface' },
    { fg: '--ds-color-text-primary', bg: '--ds-color-surface-subtle', context: 'Primary text on subtle surface' },
    { fg: '--ds-color-text-secondary', bg: '--ds-color-surface-subtle', context: 'Secondary text on subtle surface' },
    { fg: '--ds-color-text-muted', bg: '--ds-color-surface-subtle', context: 'Muted text on subtle surface' },
    
    // Primary button
    { fg: '--ds-color-primary-text', bg: '--ds-color-primary-bg', context: 'Primary button text' },
    
    // State colors (assuming they're used on white/base)
    { fg: '--ds-color-state-danger', bg: '--ds-color-surface-base', context: 'Danger text on base' },
    { fg: '--ds-color-state-success', bg: '--ds-color-surface-base', context: 'Success text on base' },
    { fg: '--ds-color-state-warning', bg: '--ds-color-surface-base', context: 'Warning text on base' },
    { fg: '--ds-color-state-info', bg: '--ds-color-surface-base', context: 'Info text on base' },
  ];
  
  // Check each pairing
  for (const pairing of pairingsToCheck) {
    if (!variables.has(pairing.fg) || !variables.has(pairing.bg)) {
      continue;
    }
    
    const fgColor = resolveColor(variables.get(pairing.fg), variables);
    const bgColor = resolveColor(variables.get(pairing.bg), variables);
    
    if (!fgColor || !bgColor) {
      continue;
    }
    
    const result = checkContrast(fgColor, bgColor);
    
    if (result && !result.passes) {
      issues.push({
        context: pairing.context,
        foreground: {
          token: pairing.fg,
          value: fgColor,
        },
        background: {
          token: pairing.bg,
          value: bgColor,
        },
        contrast: result.ratio,
        level: result.level,
        minRequired: '4.5:1',
      });
    }
  }
  
  return { variables, issues };
}

/**
 * Format and display results
 */
function displayResults(filePath, results) {
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📄 ${filePath}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (results.issues.length === 0) {
    console.log('');
    console.log('✅ All color combinations pass WCAG AA (4.5:1)');
    console.log('');
    return;
  }
  
  console.log('');
  console.log(`❌ Found ${results.issues.length} contrast issue(s):`);
  console.log('');
  
  for (const issue of results.issues) {
    console.log(`  ${issue.context}`);
    console.log(`  ├─ Foreground: ${issue.foreground.token} = ${issue.foreground.value}`);
    console.log(`  ├─ Background: ${issue.background.token} = ${issue.background.value}`);
    console.log(`  ├─ Contrast: ${issue.contrast}:1 (${issue.level})`);
    console.log(`  └─ Required: ${issue.minRequired}`);
    console.log('');
  }
}

/**
 * Suggest fixes
 */
function suggestFixes(issues) {
  if (issues.length === 0) return;
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💡 SUGGESTED FIXES');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  
  const uniqueTokens = new Set(issues.map(i => i.foreground.token));
  
  for (const token of uniqueTokens) {
    const tokenIssues = issues.filter(i => i.foreground.token === token);
    const firstIssue = tokenIssues[0];
    
    console.log(`  ${token}:`);
    console.log(`    Current: ${firstIssue.foreground.value} (${firstIssue.contrast}:1)`);
    
    // Suggest darker/lighter alternatives
    if (token.includes('text')) {
      console.log(`    → Use a darker shade (higher number) for better contrast`);
      console.log(`    → Example: If using neutral-400, try neutral-600 or neutral-700`);
    } else if (token.includes('primary-bg')) {
      console.log(`    → Use a darker shade for backgrounds with white text`);
      console.log(`    → Example: If using blue-500, try blue-600 or blue-700`);
    }
    console.log('');
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  let filesToScan = [];
  
  if (args.includes('--all')) {
    // Scan all CSS files in DS
    filesToScan = await glob('packages/ds/src/styles/**/*.css', {
      ignore: ['**/node_modules/**', '**/dist/**'],
    });
  } else if (args.length > 0) {
    // Scan specific file
    filesToScan = args.filter(arg => !arg.startsWith('--'));
  } else {
    // Default: scan color.vars.css
    filesToScan = ['packages/ds/src/styles/tokens/color.vars.css'];
  }
  
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎨 CSS CONTRAST CHECKER (WCAG 2.1 AA)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log(`Scanning ${filesToScan.length} file(s)...`);
  
  let totalIssues = 0;
  const allIssues = [];
  
  for (const file of filesToScan) {
    try {
      const results = await scanCSSFile(file);
      displayResults(file, results);
      totalIssues += results.issues.length;
      allIssues.push(...results.issues);
    } catch (error) {
      console.error(`❌ Error scanning ${file}:`, error.message);
    }
  }
  
  if (totalIssues > 0) {
    suggestFixes(allIssues);
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log(`Files scanned: ${filesToScan.length}`);
  console.log(`Total issues: ${totalIssues}`);
  console.log('');
  
  if (totalIssues === 0) {
    console.log('✅ All color combinations pass WCAG AA standards!');
  } else {
    console.log('❌ Fix the issues above to meet WCAG AA standards.');
  }
  
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  process.exit(totalIssues > 0 ? 1 : 0);
}

main();
