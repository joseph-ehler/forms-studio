#!/usr/bin/env node
/**
 * Refiner v1.2 - Retroactive Code Upgrades
 * 
 * The "Service Bay" for the factory system.
 * Applies pattern upgrades to all existing fields retroactively.
 * 
 * When the generator learns a new pattern (prop filtering, composites, a11y),
 * the Refiner brings ALL legacy code up to the same standard.
 * 
 * Usage:
 *   pnpm refine:dry   # Preview changes
 *   pnpm refine:run   # Apply changes
 *   pnpm refine:run --scope=packages/forms/src/fields/TextField/**  # Specific files
 * 
 * Transforms:
 * - v1.1: filter-dom-props - Remove custom props from DOM elements
 * - v1.2: dedupe-jsx-attrs - Remove duplicate JSX attributes
 * 
 * Safe & Idempotent:
 * - Running twice yields no changes
 * - Dry-run first (always)
 * - Reports changes before applying
 * - Leaves @refiner(<transform>@<version>) annotations
 */

import { glob } from 'glob';
import fs from 'node:fs/promises';
import path from 'node:path';
import { filterDomPropsV1_1 } from './transforms/filter-dom-props-v1.1.mjs';
import { dedupeJSXAttributesV1_2 } from './transforms/dedupe-jsx-attrs-v1.2.mjs';

const TRANSFORMS = [
  filterDomPropsV1_1(), // v1.1: AST-based auto-fix for prop leakage
  dedupeJSXAttributesV1_2(), // v1.2: Remove duplicate JSX attributes
  // Future transforms:
  // normalizeImports({ canonical: { useMotion: '@intstudio/ds/utils' } }),
  // hardenA11y(),
  // extractComposite(),
];

/**
 * Run refiner on files
 */
export async function run({ dryRun = true, scope = 'packages/forms/src/**/*.{ts,tsx}' } = {}) {
  const startTime = Date.now();
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🔧 REFINER v1.2 - ${dryRun ? 'DRY RUN' : 'APPLYING CHANGES'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log(`Scope: ${scope}`);
  console.log(`Transforms: ${TRANSFORMS.length}`);
  console.log('');
  
  // Find files
  const files = await glob(scope, {
    ignore: ['**/node_modules/**', '**/dist/**', '**/*.test.*', '**/*.spec.*', '**/demo/**']
  });
  
  console.log(`Found ${files.length} files`);
  console.log('');
  
  let touched = 0;
  const changes = [];
  
  // Process each file
  for (const file of files) {
    let code = await fs.readFile(file, 'utf8');
    let fileChanged = false;
    const fileIssues = [];
    
    // Apply transforms
    for (const transform of TRANSFORMS) {
      try {
        const result = await transform.apply({ file, code });
        
        if (result.changed) {
          code = result.code;
          fileChanged = true;
        }
        
        if (result.issues && result.issues.length > 0) {
          fileIssues.push(...result.issues.map(issue => ({
            ...issue,
            transform: transform.name
          })));
        }
      } catch (error) {
        console.error(`   ❌ Error in ${transform.name} on ${file}:`, error.message);
      }
    }
    
    if (fileChanged) {
      touched++;
      changes.push({ file, issues: fileIssues });
      
      if (!dryRun) {
        await fs.writeFile(file, code, 'utf8');
        console.log(`   ✅ Updated: ${file}`);
      }
    }
  }
  
  const duration = Date.now() - startTime;
  
  // Summary
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 REFINER SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log(`Files scanned: ${files.length}`);
  console.log(`Files with issues: ${touched}`);
  console.log(`Duration: ${duration}ms`);
  console.log('');
  
  if (touched > 0) {
    console.log(`${dryRun ? '⚠️  DRY RUN' : '✅ APPLIED'}: ${touched} file(s) need updates`);
    
    if (dryRun) {
      console.log('');
      console.log('Run `pnpm refine:run` to apply changes.');
    }
  } else {
    console.log('✅ All files are up to standard!');
  }
  
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  return {
    touched,
    total: files.length,
    changes,
    duration
  };
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--apply');
  const scopeArg = args.find(a => a.startsWith('--scope='))?.split('=')[1];
  
  run({ dryRun, scope: scopeArg })
    .then(result => {
      if (dryRun && result.touched > 0) {
        process.exitCode = 1; // Signal that changes are needed
      }
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export default run;
