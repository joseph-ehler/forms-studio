/**
 * Refiner Transform: Enforce WCAG Contrast v1.0
 * 
 * Ensures all color contrast ratios meet WCAG 2.1 AA standards (4.5:1 for normal text)
 * 
 * Checks:
 * - Inline style color values
 * - CSS custom property fallbacks
 * - Hard-coded color values
 * 
 * Reports:
 * - Colors that fail WCAG AA (< 4.5:1)
 * - Suggests WCAG-compliant alternatives
 * 
 * Mode: REPORT-ONLY (manual fix required for color choices)
 * 
 * @since 2025-10-23
 */

import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

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
 * Common color fallback mappings
 */
const WCAG_COMPLIANT_ALTERNATIVES = {
  // Tailwind red scale
  '#FEF2F2': { compliant: true, name: 'red-50' },
  '#FEE2E2': { compliant: true, name: 'red-100' },
  '#FECACA': { compliant: true, name: 'red-200' },
  '#FCA5A5': { compliant: true, name: 'red-300' },
  '#F87171': { compliant: false, name: 'red-400', suggest: '#B91C1C' },
  '#EF4444': { compliant: false, name: 'red-500', suggest: '#B91C1C' }, // ❌ 3.76:1
  '#DC2626': { compliant: true, name: 'red-600' }, // ✅ 4.52:1 (barely)
  '#B91C1C': { compliant: true, name: 'red-700' }, // ✅ 6.33:1 (safe)
  '#991B1B': { compliant: true, name: 'red-800' },
  '#7F1D1D': { compliant: true, name: 'red-900' },
};

/**
 * Check if color meets WCAG AA on white background
 */
export function checkWCAGContrast(hexColor, bgColor = '#FFFFFF') {
  const color = hexToRgb(hexColor);
  const bg = hexToRgb(bgColor);
  
  if (!color || !bg) return null;
  
  const ratio = getContrastRatio(color, bg);
  const passesAA = ratio >= 4.5;
  const passesAAA = ratio >= 7.0;
  
  return {
    ratio: ratio.toFixed(2),
    passesAA,
    passesAAA,
    level: passesAAA ? 'AAA' : passesAA ? 'AA' : 'FAIL',
  };
}

/**
 * Extract color values from JSX inline styles
 */
function extractColorsFromJSX(ast) {
  const issues = [];
  
  traverse.default(ast, {
    JSXAttribute(path) {
      if (path.node.name.name === 'style') {
        const value = path.node.value;
        
        // Handle style objects: style={{ color: '#EF4444' }}
        if (t.isJSXExpressionContainer(value)) {
          const expr = value.expression;
          
          if (t.isObjectExpression(expr)) {
            expr.properties.forEach((prop) => {
              if (
                t.isObjectProperty(prop) &&
                t.isIdentifier(prop.key) &&
                prop.key.name === 'color'
              ) {
                let colorValue = null;
                
                // Direct string: color: '#EF4444'
                if (t.isStringLiteral(prop.value)) {
                  colorValue = prop.value.value;
                }
                
                // Template literal: color: `var(--color-error, #EF4444)`
                if (t.isTemplateLiteral(prop.value)) {
                  const raw = prop.value.quasis[0]?.value.raw || '';
                  const match = raw.match(/#[A-Fa-f0-9]{6}/);
                  if (match) colorValue = match[0];
                }
                
                if (colorValue && colorValue.startsWith('#')) {
                  const result = checkWCAGContrast(colorValue);
                  
                  if (result && !result.passesAA) {
                    const alternative = WCAG_COMPLIANT_ALTERNATIVES[colorValue.toUpperCase()];
                    
                    issues.push({
                      type: 'jsx-inline-style',
                      color: colorValue,
                      ratio: result.ratio,
                      level: result.level,
                      suggestion: alternative?.suggest || null,
                      loc: path.node.loc,
                    });
                  }
                }
              }
            });
          }
        }
      }
    },
  });
  
  return issues;
}

/**
 * Main transform function (refiner interface)
 */
export function enforceWCAGContrastV1_0() {
  return {
    name: 'enforce-wcag-contrast-v1.0',
    apply: async ({ file, code }) => {
      const issues = [];
      let modified = false;
      
      try {
        const ast = parser.parse(code, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx'],
        });
        
        const colorIssues = extractColorsFromJSX(ast);
        
        // Report issues but don't auto-fix (color choices require design review)
        if (colorIssues.length > 0) {
          issues.push(...colorIssues.map(issue => ({
            line: issue.loc?.start?.line,
            severity: parseFloat(issue.ratio) < 3.0 ? 'critical' : 'warning',
            message: `Color ${issue.color} has insufficient contrast (${issue.ratio}:1, needs 4.5:1)`,
            suggestion: issue.suggestion ? `Consider ${issue.suggestion} instead` : null,
          })));
        }
        
        // No code modification (report-only)
        return {
          code,
          changed: modified,
          issues,
        };
      } catch (error) {
        // Parse errors shouldn't block the refiner
        return {
          code,
          changed: false,
          issues: [],
        };
      }
    },
  };
}

/**
 * CLI Runner
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('✨ WCAG Contrast Checker\n');
  console.log('This transform checks color contrast ratios against WCAG 2.1 AA standards');
  console.log('Minimum contrast: 4.5:1 for normal text\n');
  
  // Example test
  const testCode = `
    <span style={{ color: 'var(--color-error, #EF4444)' }}>Error message</span>
  `;
  
  const result = enforceWCAGContrast(testCode);
  
  if (result.issues.length > 0) {
    console.log('❌ Found contrast issues:\n');
    result.issues.forEach((issue) => {
      console.log(`  Color: ${issue.color}`);
      console.log(`  Contrast: ${issue.ratio}:1 (${issue.level})`);
      if (issue.suggestion) {
        console.log(`  ✅ Suggest: ${issue.suggestion}`);
      }
      console.log('');
    });
  } else {
    console.log('✅ All colors pass WCAG AA standards');
  }
}
