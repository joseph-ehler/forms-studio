#!/usr/bin/env node
/**
 * Step 6: Verify - Run all quality gates
 * 
 * Usage: pnpm process:verify
 * 
 * Runs (in locked order):
 * 1. Barrels (regenerate)
 * 2. Build (all packages)
 * 3. dep-cruiser (boundaries)
 * 4. Guard (imports + deps + names)
 * 5. API Extractor (both packages)
 * 6. Show API diffs
 */

import { execSync } from 'node:child_process';

function run(cmd, options = {}) {
  const label = options.label || cmd;
  console.log(`\n${options.icon || '▶️'} ${label}...`);
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`   ✅ Passed`);
    return true;
  } catch (error) {
    console.error(`   ❌ Failed`);
    if (!options.allowFail) {
      console.error(`\n💥 Verification failed at: ${label}`);
      console.error(`\nFix the issue and run: pnpm process:verify`);
      process.exit(1);
    }
    return false;
  }
}

console.log(`🔍 Running verification (locked sequence)...`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

// Step 1: Barrels
run('pnpm barrels', {
  label: 'Barrels (regenerate)',
  icon: '📦'
});

// Step 2: Build
run('pnpm -w build', {
  label: 'Build (all packages)',
  icon: '🔨'
});

// Step 3: Dependency boundaries
run('pnpm depgraph:check', {
  label: 'Dependency boundaries',
  icon: '🔗'
});

// Step 4: Guard
run('pnpm guard', {
  label: 'Guard (imports + deps + names)',
  icon: '🛡️'
});

// Step 5: API Extractor (DS)
run('pnpm -F @intstudio/ds api:extract', {
  label: 'API Extractor (DS)',
  icon: '📊'
});

// Step 6: API Extractor (Forms)
run('pnpm -F @intstudio/forms api:extract', {
  label: 'API Extractor (Forms)',
  icon: '📊'
});

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`✅ All verifications passed!`);
console.log(``);
console.log(`📋 Review API changes:`);
console.log(`   git diff .reports/api/`);
console.log(``);
console.log(`📋 Next steps:`);
console.log(`   1. Review changes: git diff`);
console.log(`   2. Test manually (Storybook/app)`);
console.log(`   3. Close: pnpm process:close`);
console.log(``);
