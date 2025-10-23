#!/usr/bin/env node
/**
 * Golden Batch Orchestrator
 * 
 * Migrates multiple fields in one command.
 * Runs the complete 7-step process for a batch.
 * 
 * Usage: pnpm process:migrate-batch <Field1> <Field2> <Field3> ...
 * 
 * Example:
 *   pnpm process:migrate-batch NumberField CheckboxField TextareaField SwitchField
 */

import { execSync } from 'node:child_process';

const fields = process.argv.slice(2);

if (!fields.length) {
  console.error('❌ Usage: pnpm process:migrate-batch <FieldA> <FieldB> <FieldC> ...');
  console.error('');
  console.error('Example:');
  console.error('  pnpm process:migrate-batch NumberField CheckboxField TextareaField SwitchField');
  console.error('');
  console.error('This will:');
  console.error('  1. Run preflight (create ADR)');
  console.error('  2. Create baseline snapshot');
  console.error('  3. Migrate each field');
  console.error('  4. Verify all checks');
  console.error('  5. Close with changeset prompt');
  process.exit(1);
}

function run(cmd, options = {}) {
  try {
    execSync(cmd, { stdio: 'inherit', ...options });
  } catch (error) {
    console.error(`\n❌ Command failed: ${cmd}`);
    console.error('Fix the issue and resume with:');
    console.error(`  pnpm process:verify && pnpm process:close`);
    process.exit(1);
  }
}

const batchName = `batch-${fields.join('-').toLowerCase()}`;
const startTime = Date.now();

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🚀 Golden Batch Migration');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log(`📦 Migrating ${fields.length} fields:`);
fields.forEach((f, i) => console.log(`   ${i + 1}. ${f}`));
console.log('');

// Step 1: Preflight
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🚦 Step 1/5: Preflight');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
run(`pnpm process:preflight ${batchName}`);

// Step 2: Baseline
console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📸 Step 2/5: Baseline');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
run('pnpm process:baseline');

// Step 3: Migrate each field
console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🚚 Step 3/5: Migrate Fields');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

for (const field of fields) {
  const fieldStart = Date.now();
  console.log(`\n▶️  Migrating ${field}...`);
  run(`pnpm process:migrate-field ${field}`);
  const fieldTime = Math.round((Date.now() - fieldStart) / 1000);
  console.log(`✅ ${field} complete (${fieldTime}s)`);
}

// Step 4: Verify
console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🧪 Step 4/5: Verify');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
run('pnpm process:verify');

// Step 5: Close
console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🧾 Step 5/5: Close');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
run('pnpm process:close');

// Summary
const totalTime = Math.round((Date.now() - startTime) / 1000);
const avgTime = Math.round(totalTime / fields.length);

console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ Batch Migration Complete!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log(`📊 Stats:`);
console.log(`   Fields migrated: ${fields.length}`);
console.log(`   Total time: ${totalTime}s (${Math.round(totalTime / 60)} min)`);
console.log(`   Average per field: ${avgTime}s`);
console.log('');
console.log('📋 Next steps:');
console.log('   1. Update Field Lab stories (FieldLab.stories.tsx)');
console.log('   2. Visual QA: pnpm storybook');
console.log('   3. Migrate app imports: pnpm codemod:fields');
console.log('   4. Review changes: git diff');
console.log('   5. Commit and push');
console.log('');
