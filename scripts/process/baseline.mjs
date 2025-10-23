#!/usr/bin/env node
/**
 * Step 2: Baseline - Tag and snapshot current state
 * 
 * Usage: pnpm process:baseline
 * 
 * Creates:
 * - Git tag: migration-baseline-YYYY-MM-DD
 * - Build log: .reports/baseline/build.log
 * - Guard log: .reports/baseline/guard.log
 * - API snapshots: .reports/api/
 * - Commits baseline
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';

function run(cmd, options = {}) {
  try {
    execSync(cmd, { stdio: options.silent ? 'pipe' : 'inherit', ...options });
    return true;
  } catch (error) {
    if (!options.allowFail) throw error;
    return false;
  }
}

const today = new Date().toISOString().slice(0, 10);
const tag = `migration-baseline-${today}`;

console.log(`📸 Creating baseline snapshot...`);
console.log(``);

// Create baseline directory
fs.mkdirSync('.reports/baseline', { recursive: true });

// 1. Tag current state
console.log(`🏷️  Tagging: ${tag}`);
const tagExists = run(`git tag ${tag}`, { allowFail: true });
if (!tagExists) {
  console.log(`   ⚠️  Tag already exists (OK if resuming migration)`);
}

// 2. Build and capture log
console.log(`🔨 Building packages...`);
run('pnpm -w build > .reports/baseline/build.log 2>&1', { allowFail: true, shell: '/bin/bash' });

// 3. Guard and capture log
console.log(`🛡️  Running guard...`);
run('pnpm guard > .reports/baseline/guard.log 2>&1', { allowFail: true, shell: '/bin/bash' });

// 4. API snapshots
console.log(`📊 Extracting API reports...`);
run('pnpm -F @intstudio/ds api:extract', { allowFail: true });
run('pnpm -F @intstudio/forms api:extract', { allowFail: true });

// 5. Commit baseline
console.log(`💾 Committing baseline...`);
run('git add .reports/api .reports/baseline', { allowFail: true });
run(`git commit -m "chore: baseline snapshots for migration" || true`, { shell: '/bin/bash', allowFail: true });

console.log(``);
console.log(`✅ Baseline complete!`);
console.log(``);
console.log(`📋 Baseline files:`);
console.log(`   - Tag: ${tag}`);
console.log(`   - Build log: .reports/baseline/build.log`);
console.log(`   - Guard log: .reports/baseline/guard.log`);
console.log(`   - API reports: .reports/api/`);
console.log(``);
console.log(`📋 Next steps:`);
console.log(`   1. Write/test codemod: pnpm codemod:fields --dry-run`);
console.log(`   2. Migrate field: pnpm process:migrate-field <FieldName>`);
console.log(`   3. Verify: pnpm process:verify`);
console.log(``);
