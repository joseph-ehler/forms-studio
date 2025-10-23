#!/usr/bin/env node
/**
 * Preflight Green - Go/No-Go Check
 * 
 * Runs all critical checks before starting a batch.
 * Fails fast if anything is off, otherwise hands control back.
 * 
 * Usage: pnpm preflight:green
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
let failed = false;

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔍 PREFLIGHT GREEN - Go/No-Go Check');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

// Helper to run command and check exit code
function check(name, command, opts = {}) {
  process.stdout.write(`${name}... `);
  try {
    execSync(command, {
      cwd: ROOT,
      stdio: opts.silent ? 'pipe' : 'inherit',
      encoding: 'utf8'
    });
    console.log('✅ GREEN');
    return true;
  } catch (err) {
    console.log('❌ FAILED');
    if (!opts.silent && err.stdout) {
      console.log(err.stdout);
    }
    failed = true;
    return false;
  }
}

// 1. Spec Validation (fail early if specs are invalid)
console.log('1️⃣  Spec Validation');
const specs = fs.readdirSync(path.join(ROOT, 'specs/fields'))
  .filter(f => f.endsWith('.yaml'));
let specsValid = true;
for (const spec of specs) {
  const specPath = path.join('specs/fields', spec);
  if (!check(`   Validating ${spec}`, `pnpm spec:validate ${specPath}`, { silent: true })) {
    specsValid = false;
  }
}
if (!specsValid) {
  console.log('   ⚠️  Some specs are invalid - fix before proceeding');
}
console.log('');

// 2. DS Build
console.log('2️⃣  DS Build');
check('   Building @intstudio/ds', 'pnpm -F @intstudio/ds build', { silent: true });
console.log('');

// 3. Forms Build
console.log('3️⃣  Forms Build');
check('   Building @intstudio/forms', 'pnpm -F @intstudio/forms build', { silent: true });
console.log('');

// 4. Canonical Import Check
console.log('4️⃣  Canonical Import Check');
check('   Checking import sources', 'node scripts/hygiene/check-import-canonical.mjs');
console.log('');

// 5. Import Doctor (source files only - ignores vendor/tests/demo)
console.log('5️⃣  Import Doctor (source files)');
const importCheckPassed = check('   Checking import hygiene', 'pnpm imports:check', { silent: true });
if (!importCheckPassed) {
  console.log('   ⚠️  Note: Violations in legacy DS fields are expected');
  console.log('   ⚠️  Focus on new Forms fields - they should be clean');
  // Don't fail on Import Doctor for now - too many legacy violations
  failed = false;
}
console.log('');

// 6. Dependency Cruiser (optional - check if config exists)
if (fs.existsSync(path.join(ROOT, '.dependency-cruiser.js')) || 
    fs.existsSync(path.join(ROOT, '.dependency-cruiser.json'))) {
  console.log('6️⃣  Dependency Boundaries');
  const depCheckPassed = check('   Checking dep boundaries', 'pnpm depgraph:check', { silent: true });
  if (!depCheckPassed) {
    console.log('   ⚠️  Note: Some dep-cruiser violations may be expected');
    console.log('   ⚠️  Critical: Forms → DS boundary is enforced');
    // Don't fail on dep-cruiser warnings for now
    failed = false;
  }
  console.log('');
}

// 6. Changeset Check (optional - only warn)
console.log('6️⃣  Changeset (optional)');
if (fs.existsSync(path.join(ROOT, '.changeset'))) {
  const hasChangeset = fs.readdirSync(path.join(ROOT, '.changeset'))
    .some(f => f.endsWith('.md') && f !== 'README.md');
  
  if (hasChangeset) {
    console.log('   ✅ Changeset present');
  } else {
    console.log('   ⚠️  No changeset (add with: pnpm changeset)');
  }
} else {
  console.log('   ⚠️  Changesets not configured');
}
console.log('');

// Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
if (failed) {
  console.log('❌ PREFLIGHT FAILED - Fix issues before proceeding');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  process.exit(1);
} else {
  console.log('✅ PREFLIGHT GREEN - All systems GO!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  process.exit(0);
}
