#!/usr/bin/env node
/**
 * Step 7: Close - Create changeset, update docs, schedule removal
 * 
 * Usage: pnpm process:close
 * 
 * Interactive prompts for:
 * - Creating changeset (if API changed)
 * - Updating ADR
 * - Creating session summary
 * - Scheduling compat removal
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

console.log(`📝 Closing migration...`);
console.log(``);

// Step 1: Changeset
console.log(`🧾 Step 1: Changeset`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(``);
console.log(`   If you changed the public API, create a changeset:`);
console.log(``);

try {
  execSync('pnpm changeset', { stdio: 'inherit' });
} catch (error) {
  console.log(`   ⏭️  Skipped (OK if no API changes)`);
}

// Step 2: Documentation reminder
console.log(``);
console.log(`📚 Step 2: Documentation`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(``);

// Find recent ADR
const adrDir = 'docs/adr';
if (fs.existsSync(adrDir)) {
  const adrs = fs.readdirSync(adrDir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .reverse();
  
  if (adrs.length > 0) {
    const recentADR = path.join(adrDir, adrs[0]);
    console.log(`   📝 Update ADR: ${recentADR}`);
    console.log(`      - Mark status: Implemented`);
    console.log(`      - Add results/metrics`);
    console.log(`      - Document any deviations`);
  }
}

const today = new Date().toISOString().slice(0, 10);
const sessionFile = `docs/archive/SESSION_${today}_[name].md`;
console.log(``);
console.log(`   📝 Create session summary: ${sessionFile}`);
console.log(`      - What changed`);
console.log(`      - Why it changed`);
console.log(`      - Migration command (if breaking)`);
console.log(`      - Time/quality metrics`);

// Step 3: Compat façade removal
console.log(``);
console.log(`🗓️  Step 3: Schedule Compat Removal`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(``);
console.log(`   If you added compat façades:`);
console.log(``);
console.log(`   1. Set removal date: 1-2 releases (v2.0.0)`);
console.log(`   2. Create GitHub issue: "Remove [Field] façade"`);
console.log(`   3. Add ESLint rule forbidding old pattern`);
console.log(`   4. Schedule in calendar/roadmap`);

// Step 4: Final checklist
console.log(``);
console.log(`✅ Final Checklist`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(``);
console.log(`   Before committing:`);
console.log(`   - [ ] All tests pass`);
console.log(`   - [ ] Storybook works`);
console.log(`   - [ ] ADR updated`);
console.log(`   - [ ] Session summary created`);
console.log(`   - [ ] Changeset created (if breaking)`);
console.log(`   - [ ] Deprecation warnings added`);
console.log(`   - [ ] Removal scheduled (if compat)`);
console.log(`   - [ ] API diff reviewed`);
console.log(``);

// Step 5: Commit template
console.log(`📋 Suggested commit message:`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(``);
console.log(`feat: [description]`);
console.log(``);
console.log(`- [what changed]`);
console.log(`- [why it changed]`);
console.log(`- [how to migrate if breaking]`);
console.log(``);
console.log(`Migration: pnpm codemod:fields`);
console.log(`Closes #[issue]`);
console.log(``);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`✅ Migration complete!`);
console.log(``);
