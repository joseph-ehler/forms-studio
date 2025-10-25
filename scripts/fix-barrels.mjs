#!/usr/bin/env node
/**
 * Unified Barrel & Import Fixer
 * 
 * One command to align the entire repo:
 * 1. Generate/update barrel files (index.ts)
 * 2. Fix import paths and sorting
 * 3. Verify no cycles introduced
 * 
 * Usage:
 *   pnpm fix:barrels              # Full fix
 *   pnpm fix:barrels --dry-run    # Preview changes
 *   pnpm fix:barrels --verify     # Just verify, don't fix
 */

import { execSync } from 'child_process';
import { parseArgs } from 'util';

const { values } = parseArgs({
  options: {
    'dry-run': { type: 'boolean' },
    verify: { type: 'boolean' },
  },
});

const isDryRun = values['dry-run'];
const isVerify = values.verify;

/**
 * Execute command with nice output
 */
function run(cmd, description, { optional = false, silent = false } = {}) {
  const prefix = isDryRun ? '🔍 [DRY RUN]' : '🔧';
  
  if (!silent) {
    console.log(`${prefix} ${description}...`);
  }

  if (isDryRun) {
    console.log(`   Would run: ${cmd}\n`);
    return;
  }

  try {
    const output = execSync(cmd, {
      encoding: 'utf8',
      stdio: silent ? 'pipe' : 'inherit',
    });
    
    if (!silent) {
      console.log('');
    }
    
    return output;
  } catch (error) {
    if (optional) {
      console.log(`   ⚠️  Skipped (${error.message})\n`);
      return null;
    }
    console.error(`\n❌ Failed: ${description}`);
    console.error(error.message);
    process.exit(1);
  }
}

/**
 * Main execution
 */
async function main() {
  const mode = isDryRun ? 'DRY RUN' : isVerify ? 'VERIFY' : 'FIX';
  
  console.log('╔═══════════════════════════════════════╗');
  console.log(`║  Barrel & Import Fixer (${mode})  ║`);
  console.log('╚═══════════════════════════════════════╝\n');

  if (isDryRun) {
    console.log('🔍 Dry run mode - no changes will be made\n');
  } else if (isVerify) {
    console.log('🔍 Verify mode - checking without fixing\n');
  }

  // Step 1: Generate barrel files
  if (!isVerify) {
    run(
      'barrelsby --config .barrelsby.json',
      'Generate barrel files (index.ts)'
    );
  }

  // Step 2: Check for uncommitted barrel changes
  if (!isDryRun) {
    const status = run(
      'git diff --name-only "packages/**/index.ts"',
      'Check for barrel changes',
      { silent: true }
    );

    if (status && status.trim()) {
      console.log('📝 Updated barrels:');
      status.split('\n').filter(Boolean).forEach(file => {
        console.log(`   • ${file}`);
      });
      console.log('');
    } else {
      console.log('✅ All barrels are up to date\n');
    }
  }

  // Step 3: Fix import paths (if ESLint is configured)
  if (!isVerify) {
    run(
      'eslint --config .eslintrc.import-hygiene.cjs --fix "packages/**/*.{ts,tsx,js,jsx}"',
      'Fix and sort imports',
      { optional: true }
    );
  }

  // Step 4: Check for circular dependencies
  run(
    'node scripts/check-cycles.mjs',
    'Check for circular dependencies'
  );

  // Step 5: Type check
  if (!isDryRun && !isVerify) {
    run(
      'pnpm -r --filter "./packages/**" typecheck',
      'Type check packages',
      { optional: true }
    );
  }

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (isDryRun) {
    console.log('✅ Dry run complete - no changes made\n');
    console.log('Run without --dry-run to apply changes.\n');
  } else if (isVerify) {
    console.log('✅ Verification complete\n');
  } else {
    console.log('✅ Barrel & import alignment complete!\n');
    console.log('Next steps:');
    console.log('  • Review changed files');
    console.log('  • Run tests: pnpm test');
    console.log('  • Commit: git add -u && git commit\n');
  }
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
