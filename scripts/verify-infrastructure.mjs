#!/usr/bin/env node
/**
 * Infrastructure Verification Script
 * 
 * Validates that all generator infrastructure is in place and working.
 * Run before first component generation.
 * 
 * Usage:
 *   pnpm verify:infra
 *   node scripts/verify-infrastructure.mjs
 */

import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';

const ROOT = process.cwd();
let errors = [];
let warnings = [];
let checks = 0;

function error(msg) {
  errors.push(msg);
}

function warn(msg) {
  warnings.push(msg);
}

function check(label, condition, errorMsg, warnMsg) {
  checks++;
  if (condition === true) {
    console.log(`✅ ${label}`);
    return true;
  } else if (condition === 'warn') {
    console.log(`⚠️  ${label}`);
    if (warnMsg) warn(warnMsg);
    return false;
  } else {
    console.log(`❌ ${label}`);
    if (errorMsg) error(errorMsg);
    return false;
  }
}

console.log('');
console.log('🔍 Verifying Generator Infrastructure');
console.log('');

// ============================================
// 1. Package Structure
// ============================================

console.log('📦 Package Structure');
console.log('');

check(
  'DS package exists',
  existsSync(join(ROOT, 'packages/ds/package.json')),
  'Missing packages/ds/package.json'
);

check(
  'Forms package exists',
  existsSync(join(ROOT, 'packages/forms/package.json')),
  'Missing packages/forms/package.json - Critical for generators!'
);

check(
  'DS src/ exists',
  existsSync(join(ROOT, 'packages/ds/src')),
  'Missing packages/ds/src/'
);

check(
  'Forms src/ exists',
  existsSync(join(ROOT, 'packages/forms/src')),
  'Missing packages/forms/src/'
);

console.log('');

// ============================================
// 2. DS Infrastructure
// ============================================

console.log('🎨 DS Infrastructure');
console.log('');

check(
  'variants.config.ts exists',
  existsSync(join(ROOT, 'packages/ds/src/control/variants.config.ts')),
  'Missing variants.config.ts'
);

check(
  'skin-contracts.ts exists',
  existsSync(join(ROOT, 'packages/ds/src/control/skin-contracts.ts')),
  'Missing skin-contracts.ts'
);

check(
  'SKIN registry exists',
  existsSync(join(ROOT, 'packages/ds/src/registry/skins')),
  'Missing SKIN registry directory'
);

check(
  'Button SKIN exists',
  existsSync(join(ROOT, 'packages/ds/src/registry/skins/button.skin.ts')),
  'Missing button.skin.ts (reference implementation)'
);

check(
  'Field component exists',
  existsSync(join(ROOT, 'packages/ds/src/fb/Field.tsx')),
  'Missing Field.tsx (needed by form fields)'
);

console.log('');

// ============================================
// 3. Forms Infrastructure
// ============================================

console.log('📋 Forms Infrastructure');
console.log('');

check(
  'field-contracts.ts exists',
  existsSync(join(ROOT, 'packages/forms/src/control/field-contracts.ts')),
  'Missing field-contracts.ts'
);

check(
  'field-types.ts exists',
  existsSync(join(ROOT, 'packages/forms/src/registry/field-types.ts')),
  'Missing field-types.ts'
);

check(
  'fields/ directory exists',
  existsSync(join(ROOT, 'packages/forms/src/fields')),
  'Missing fields/ directory'
);

console.log('');

// ============================================
// 4. Generator Scripts
// ============================================

console.log('🏭 Generator Scripts');
console.log('');

check(
  'ds:new generator exists',
  existsSync(join(ROOT, 'scripts/ds-new.mjs')),
  'Missing scripts/ds-new.mjs'
);

check(
  'forms:new generator exists',
  existsSync(join(ROOT, 'scripts/forms-new.mjs')),
  'Missing scripts/forms-new.mjs'
);

check(
  'validate-generated script exists',
  existsSync(join(ROOT, 'scripts/validate-generated.mjs')),
  'Missing scripts/validate-generated.mjs'
);

console.log('');

// ============================================
// 5. Package.json Commands
// ============================================

console.log('⚙️  NPM Scripts');
console.log('');

const pkgJson = JSON.parse(
  await readFile(join(ROOT, 'package.json'), 'utf-8')
);

check(
  'ds:new command exists',
  'ds:new' in pkgJson.scripts,
  'Missing pnpm ds:new command'
);

check(
  'forms:new command exists',
  'forms:new' in pkgJson.scripts,
  'Missing pnpm forms:new command'
);

check(
  'validate:generated command exists',
  'validate:generated' in pkgJson.scripts,
  'Missing pnpm validate:generated command'
);

check(
  'doctor includes validation',
  pkgJson.scripts.doctor?.includes('validate:generated'),
  null,
  'doctor command does not include validate:generated (recommended)'
);

console.log('');

// ============================================
// 6. CI/CD
// ============================================

console.log('🔄 CI/CD');
console.log('');

check(
  'Generator CI workflow exists',
  existsSync(join(ROOT, '.github/workflows/generators.yml')),
  'Missing .github/workflows/generators.yml'
);

console.log('');

// ============================================
// 7. Documentation
// ============================================

console.log('📚 Documentation');
console.log('');

check(
  'Generators Guide exists',
  existsSync(join(ROOT, 'docs/handbook/GENERATORS_GUIDE.md')),
  'Missing GENERATORS_GUIDE.md'
);

check(
  'Factory Manual exists',
  existsSync(join(ROOT, 'docs/handbook/FACTORY_OPERATING_MANUAL.md')),
  'Missing FACTORY_OPERATING_MANUAL.md'
);

check(
  'Pre-Flight Checklist exists',
  existsSync(join(ROOT, 'docs/handbook/PRE_FLIGHT_CHECKLIST.md')),
  'Missing PRE_FLIGHT_CHECKLIST.md'
);

console.log('');

// ============================================
// 8. Dependencies
// ============================================

console.log('📦 Dependencies');
console.log('');

const formsPkg = JSON.parse(
  await readFile(join(ROOT, 'packages/forms/package.json'), 'utf-8')
);

check(
  'Forms depends on DS',
  '@intstudio/ds' in formsPkg.dependencies,
  'Forms package missing @intstudio/ds dependency'
);

check(
  'Forms has react-hook-form',
  'react-hook-form' in formsPkg.dependencies,
  null,
  'Forms package missing react-hook-form (recommended)'
);

check(
  'Forms has zod',
  'zod' in formsPkg.dependencies,
  null,
  'Forms package missing zod (recommended)'
);

console.log('');

// ============================================
// Summary
// ============================================

console.log('═'.repeat(60));
console.log('');
console.log(`📊 Verification Summary`);
console.log(`   Checks run: ${checks}`);
console.log(`   Errors: ${errors.length}`);
console.log(`   Warnings: ${warnings.length}`);
console.log('');

if (errors.length > 0) {
  console.log('❌ VERIFICATION FAILED');
  console.log('');
  console.log('Errors:');
  errors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
  console.log('');
  console.log('❗ Fix these errors before using generators.');
  process.exit(1);
}

if (warnings.length > 0) {
  console.log('⚠️  VERIFICATION PASSED WITH WARNINGS');
  console.log('');
  console.log('Warnings:');
  warnings.forEach((w, i) => console.log(`  ${i + 1}. ${w}`));
  console.log('');
  console.log('Consider addressing these for best practices.');
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ ALL CHECKS PASSED');
  console.log('');
  console.log('🚀 Infrastructure is ready!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. pnpm install              # Install new dependencies');
  console.log('  2. pnpm build                # Build all packages');
  console.log('  3. pnpm ds:new Select        # Test DS generator');
  console.log('  4. pnpm forms:new TextField  # Test forms generator');
  console.log('');
}

console.log('');
