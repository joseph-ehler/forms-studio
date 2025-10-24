#!/usr/bin/env node
/**
 * Architecture Audit Script
 * 
 * Validates DS ↔ Forms layer separation and generates audit.json
 * 
 * Usage:
 *   node scripts/audit/run-architecture-audit.mjs
 *   node scripts/audit/run-architecture-audit.mjs --json > audit.json
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '../..');

// Color output helpers
const colors = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  blue: (s) => `\x1b[34m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

// Run ripgrep command safely
function rg(pattern, path, flags = []) {
  try {
    const cmd = `rg ${flags.join(' ')} '${pattern}' ${path}`;
    const output = execSync(cmd, { cwd: ROOT, encoding: 'utf-8' });
    return output.trim().split('\n').filter(Boolean);
  } catch (err) {
    // rg exits 1 if no matches
    return [];
  }
}

// Find files
function fd(pattern, path) {
  try {
    const cmd = `fd '${pattern}' ${path}`;
    const output = execSync(cmd, { cwd: ROOT, encoding: 'utf-8' });
    return output.trim().split('\n').filter(Boolean);
  } catch (err) {
    return [];
  }
}

// Check if file exists
function fileExists(path) {
  return existsSync(join(ROOT, path));
}

// Audit checks
const audits = {
  // 1. Forms should have ZERO .css files
  formsCssFiles() {
    const files = fd('\\.css$', 'packages/forms');
    return {
      name: 'Forms CSS Files',
      description: 'Forms layer should have no .css files (use DS classes only)',
      target: 0,
      actual: files.length,
      passing: files.length === 0,
      violations: files,
    };
  },

  // 2. DS components must co-locate CSS
  dsComponentsMissingCss() {
    const tsxFiles = fd('[A-Z].*\\.tsx$', 'packages/ds/src');
    const missing = [];
    
    tsxFiles.forEach(tsx => {
      // Skip index files, hooks, utils
      const base = basename(tsx, '.tsx');
      if (base === 'index' || base.startsWith('use') || base.toLowerCase() === base) {
        return;
      }
      
      const cssPath = tsx.replace('.tsx', '.css');
      if (!fileExists(cssPath)) {
        missing.push(tsx);
      }
    });

    return {
      name: 'DS Components Missing Co-located CSS',
      description: 'Every DS component should have Component.css next to Component.tsx',
      target: 0,
      actual: missing.length,
      passing: missing.length === 0,
      violations: missing,
    };
  },

  // 3. Inline appearance styles
  inlineAppearanceStyles() {
    const patterns = [
      'padding',
      'margin',
      'background',
      'color',
      'border',
      'boxShadow',
      'fontSize',
      'width',
      'height',
    ];
    
    const violations = [];
    patterns.forEach(prop => {
      const hits = rg(
        `style=\\{\\{[^}]*${prop}`,
        'packages',
        ['-n', '--glob', '!**/node_modules/**']
      );
      violations.push(...hits);
    });

    return {
      name: 'Inline Appearance Styles',
      description: 'Appearance must be in CSS (DS layer) or DS classes (Forms layer)',
      target: 0,
      actual: violations.length,
      passing: violations.length === 0,
      violations,
    };
  },

  // 4. Magic numbers in DS CSS
  magicNumbersInDsCss() {
    const violations = rg(
      ':\\s*(\\d+px|#[0-9a-fA-F]{3,6})',
      'packages/ds',
      ['-n', '--glob', '*.css']
    );

    return {
      name: 'Magic Numbers in DS CSS',
      description: 'All CSS values must use --ds-* tokens',
      target: 0,
      actual: violations.length,
      passing: violations.length === 0,
      violations,
    };
  },

  // 5. Missing ARIA on route components
  missingAriaOnRoutes() {
    const components = ['FullScreenRoute', 'RoutePanel', 'FlowScaffold'];
    const violations = [];

    components.forEach(comp => {
      const hits = rg(
        `<${comp}(?![^>]*aria(Label|LabelledBy))`,
        'packages',
        ['-n', '-U', '--glob', '*.tsx']
      );
      violations.push(...hits);
    });

    return {
      name: 'Missing ARIA on Route Components',
      description: 'Route components require ariaLabel or ariaLabelledBy',
      target: 0,
      actual: violations.length,
      passing: violations.length === 0,
      violations,
    };
  },

  // 6. Hard-coded z-index
  hardCodedZIndex() {
    const violations = rg(
      'z-index\\s*:\\s*(\\d+)(?!.*--ds-z-)',
      'packages',
      ['-n', '--glob', '*.{css,tsx}']
    );

    return {
      name: 'Hard-coded Z-Index',
      description: 'Use --ds-z-lane-* tokens for z-index',
      target: 0,
      actual: violations.length,
      passing: violations.length === 0,
      violations,
    };
  },

  // 7. Custom focus logic (should use useFocusTrap)
  customFocusLogic() {
    const patterns = ['focusTrap', 'trapFocus', 'keydown.*Tab'];
    const violations = [];

    patterns.forEach(pattern => {
      const hits = rg(pattern, 'packages', ['-n', '--glob', '*.{tsx,ts}']);
      violations.push(...hits);
    });

    // Filter out useFocusTrap itself
    const filtered = violations.filter(v => !v.includes('useFocusTrap'));

    return {
      name: 'Custom Focus Logic',
      description: 'Use useFocusTrap hook instead of custom focus management',
      target: 0,
      actual: filtered.length,
      passing: filtered.length === 0,
      violations: filtered,
    };
  },

  // 8. Illegal composition (RoutePanel in SheetDialog)
  illegalComposition() {
    const violations = rg(
      '<SheetDialog[>\\s\\S]*<RoutePanel',
      'packages',
      ['-n', '-U', '--glob', '*.tsx']
    );

    return {
      name: 'Illegal Component Composition',
      description: 'RoutePanel cannot be inside SheetDialog (modal violation)',
      target: 0,
      actual: violations.length,
      passing: violations.length === 0,
      violations,
    };
  },
};

// Run all audits
function runAudits() {
  const results = {};
  let totalViolations = 0;
  let passingChecks = 0;

  console.log(colors.bold('\n🔍 Architecture Audit\n'));

  Object.keys(audits).forEach(key => {
    const result = audits[key]();
    results[key] = result;

    const status = result.passing 
      ? colors.green('✓ PASS')
      : colors.red('✗ FAIL');
    
    const count = result.passing
      ? colors.green(`${result.actual}/${result.target}`)
      : colors.red(`${result.actual}/${result.target}`);

    console.log(`${status} ${result.name}: ${count}`);
    
    if (!result.passing && result.violations.length > 0) {
      console.log(colors.yellow(`  Found ${result.violations.length} violations:`));
      result.violations.slice(0, 5).forEach(v => {
        console.log(colors.yellow(`    - ${v}`));
      });
      if (result.violations.length > 5) {
        console.log(colors.yellow(`    ... and ${result.violations.length - 5} more`));
      }
    }

    if (result.passing) {
      passingChecks++;
    } else {
      totalViolations += result.actual;
    }
  });

  const totalChecks = Object.keys(audits).length;
  const score = Math.round((passingChecks / totalChecks) * 100);

  console.log(colors.bold(`\n📊 Summary:`));
  console.log(`  Passing: ${passingChecks}/${totalChecks} checks`);
  console.log(`  Violations: ${totalViolations}`);
  console.log(`  Score: ${score}%`);

  if (score === 100) {
    console.log(colors.green(colors.bold('\n✅ Architecture is clean!')));
  } else {
    console.log(colors.yellow(colors.bold('\n⚠️  Architecture needs cleanup')));
  }

  return {
    timestamp: new Date().toISOString(),
    score,
    passingChecks,
    totalChecks,
    totalViolations,
    results,
  };
}

// Main
const jsonOutput = process.argv.includes('--json');
const audit = runAudits();

if (jsonOutput) {
  console.log(JSON.stringify(audit, null, 2));
  process.exit(audit.score === 100 ? 0 : 1);
}

process.exit(audit.score === 100 ? 0 : 1);
