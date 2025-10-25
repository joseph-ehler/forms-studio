#!/usr/bin/env node
/**
 * Circular Dependency Detector
 * 
 * Uses madge to detect circular dependencies in source files.
 * Runs as part of CI to prevent circular imports.
 * 
 * Usage:
 *   pnpm deps:cycles              # Check all packages
 *   pnpm deps:cycles --package ds # Check specific package
 * 
 * Exit codes:
 *   0 - No cycles found
 *   1 - Cycles detected or error
 */

import madge from 'madge';
import { parseArgs } from 'util';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');
const ROOT = resolve(__dirname, '..');

// Parse CLI args
const { values } = parseArgs({
  options: {
    package: { type: 'string', short: 'p' },
    verbose: { type: 'boolean', short: 'v' },
  },
});

const PACKAGES = [
  { name: 'ds', path: 'packages/ds/src' },
  { name: 'core', path: 'packages/core/src' },
  { name: 'datasources', path: 'packages/datasources/src' },
];

/**
 * Check a single package for circular dependencies
 */
async function checkPackage(pkg) {
  const packagePath = join(ROOT, pkg.path);
  
  console.log(`🔍 Checking ${pkg.name}...`);
  
  try {
    const result = await madge(packagePath, {
      fileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs'],
      detectiveOptions: {
        ts: {
          skipTypeImports: true,
        },
      },
      excludeRegExp: [
        /\.test\./,
        /\.spec\./,
        /\.stories\./,
        /__tests__/,
        /dist/,
        /node_modules/,
      ],
    });

    const circular = result.circular();

    if (circular.length === 0) {
      console.log(`✅ ${pkg.name}: No circular dependencies\n`);
      return { pkg: pkg.name, cycles: [] };
    }

    console.log(`❌ ${pkg.name}: Found ${circular.length} circular dependencies\n`);
    
    circular.forEach((cycle, idx) => {
      console.log(`   Cycle ${idx + 1}:`);
      cycle.forEach((file, fileIdx) => {
        const arrow = fileIdx < cycle.length - 1 ? ' →' : ' ⮎';
        console.log(`      ${file}${arrow}`);
      });
      console.log('');
    });

    return { pkg: pkg.name, cycles: circular };
  } catch (error) {
    console.error(`❌ Error checking ${pkg.name}:`, error.message);
    return { pkg: pkg.name, error: error.message };
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🔄 Circular Dependency Check\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Filter packages if --package specified
  const packagesToCheck = values.package
    ? PACKAGES.filter(p => p.name === values.package)
    : PACKAGES;

  if (packagesToCheck.length === 0) {
    console.error(`❌ Unknown package: ${values.package}`);
    console.log(`Available packages: ${PACKAGES.map(p => p.name).join(', ')}`);
    process.exit(1);
  }

  // Check all packages
  const results = await Promise.all(packagesToCheck.map(checkPackage));

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 Summary:\n');

  let totalCycles = 0;
  let hasErrors = false;

  results.forEach(result => {
    if (result.error) {
      console.log(`   ${result.pkg}: ⚠️  Error - ${result.error}`);
      hasErrors = true;
    } else if (result.cycles.length > 0) {
      console.log(`   ${result.pkg}: ❌ ${result.cycles.length} cycle(s)`);
      totalCycles += result.cycles.length;
    } else {
      console.log(`   ${result.pkg}: ✅ Clean`);
    }
  });

  console.log('');

  if (hasErrors) {
    console.log('❌ Check completed with errors\n');
    process.exit(1);
  }

  if (totalCycles > 0) {
    console.log(`❌ Found ${totalCycles} circular dependencies across ${results.length} package(s)\n`);
    console.log('💡 Tips:');
    console.log('   • Extract shared code to a common module');
    console.log('   • Use dependency injection instead of direct imports');
    console.log('   • Consider using interfaces/types to break cycles');
    console.log('   • Review your module architecture\n');
    process.exit(1);
  }

  console.log('✅ No circular dependencies found!\n');
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
