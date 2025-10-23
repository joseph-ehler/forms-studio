#!/usr/bin/env node
/**
 * Check Import Canonical Sources
 * 
 * Post-build assertion to catch import drift early.
 * Run after: pnpm -F @intstudio/ds build
 * 
 * Checks:
 * - useMotion imports transitions from '../utils' (canonical)
 * - No internal DS files import from @intstudio/ds subpaths
 */

import fs from 'node:fs';
import { globSync } from 'glob';

const checks = [];
let failed = 0;

// Check 1: useMotion transitions canonical source
const useMotionPath = 'packages/ds/src/utils/useMotion.ts';
if (fs.existsSync(useMotionPath)) {
  const content = fs.readFileSync(useMotionPath, 'utf8');
  
  // Should import from '../utils' (canonical), not '../tokens/transitions'
  if (content.includes("from '../tokens/transitions'")) {
    console.error(`❌ ${useMotionPath}: imports from '../tokens/transitions'`);
    console.error(`   Expected: from '../utils' (canonical source)`);
    console.error(`   Fix: pnpm imports:fix`);
    failed++;
  } else if (content.includes("from '../utils'") || content.includes('from "./')) {
    console.log(`✅ ${useMotionPath}: using canonical import`);
  }
} else {
  console.warn(`⚠️  ${useMotionPath}: not found`);
}

// Check 2: Internal DS files should use relative imports, not @intstudio/ds subpaths
const dsFiles = globSync('packages/ds/src/**/*.{ts,tsx}', {
  ignore: ['**/*.d.ts', '**/*.stories.*', '**/node_modules/**', '**/dist/**']
});

for (const file of dsFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, i) => {
    // Internal DS files should NOT import from @intstudio/ds/primitives, /utils, etc.
    // They should use relative imports
    const badPatterns = [
      '@intstudio/ds/primitives',
      '@intstudio/ds/utils',
      '@intstudio/ds/patterns',
      '@intstudio/ds/shell',
      '@intstudio/ds/a11y',
      '@intstudio/ds/white-label'
    ];
    
    for (const pattern of badPatterns) {
      if (line.includes(`from '${pattern}'`) || line.includes(`from "${pattern}"`)) {
        console.error(`❌ ${file}:${i + 1}: internal file imports ${pattern}`);
        console.error(`   Expected: relative import (e.g., '../primitives' or './primitives')`);
        console.error(`   Fix: git restore or manual correction`);
        failed++;
        break; // Only report once per line
      }
    }
  });
}

if (failed === 0) {
  console.log('');
  console.log('✅ All import canonical source checks passed');
  process.exit(0);
} else {
  console.log('');
  console.error(`❌ ${failed} import canonical source violation(s) found`);
  console.error('');
  console.error('This usually happens after running pnpm imports:fix on DS internal files.');
  console.error('To fix: git restore packages/ds/src');
  process.exit(1);
}
