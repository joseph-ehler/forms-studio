#!/usr/bin/env node
/**
 * Docs Autostow - Automatically moves misplaced docs to correct locations
 * 
 * Heuristics:
 * - DS_*.md or *_DS.md → packages/ds/docs/
 * - FORMS_*.md or *_FORMS.md → packages/forms/docs/
 * - PHASE_*.md, AUTOMAGIC_*.md → docs/handbook/
 * - ADR_*.md → docs/adr/
 * - RFC_*.md → docs/rfc/
 * - Everything else → docs/handbook/
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();

// Get staged .md files at root
const staged = execSync('git diff --name-only --staged', { stdio: 'pipe' })
  .toString()
  .trim()
  .split('\n')
  .filter(f => f && !f.includes('/') && f.endsWith('.md'));

const moves = [];

for (const file of staged) {
  // Skip if it's an allowed root file
  if (['README.md', 'CONTRIBUTING.md', 'SECURITY.md', 'CODE_OF_CONDUCT.md', 'LICENSE', 'CHANGELOG.md'].includes(file)) {
    continue;
  }
  
  let dest = 'docs/handbook/';
  
  // Package-specific
  if (/^(DS_|.*_DS\.md$)/i.test(file)) {
    dest = 'packages/ds/docs/';
  } else if (/^(FORMS_|.*_FORMS\.md$)/i.test(file)) {
    dest = 'packages/forms/docs/';
  }
  // Doc types
  else if (/^ADR[-_]/i.test(file)) {
    dest = 'docs/adr/';
  } else if (/^RFC[-_]/i.test(file)) {
    dest = 'docs/rfc/';
  } else if (/^(PHASE|AUTOMAGIC|MIGRATION|REORGANIZATION)[-_]/i.test(file)) {
    dest = 'docs/handbook/';
  }
  
  moves.push({ from: file, to: dest + file });
}

if (moves.length === 0) {
  console.log('✅ Docs Autostow: no misplaced docs to move');
  process.exit(0);
}

console.log('\n📚 Docs Autostow: moving misplaced docs...\n');

for (const { from, to } of moves) {
  const dir = path.dirname(to);
  
  // Ensure directory exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`   📁 Created directory: ${dir}`);
  }
  
  // Move file
  fs.renameSync(from, to);
  console.log(`   ✓ Moved: ${from} → ${to}`);
  
  // Update git staging
  execSync(`git rm --cached ${from}`, { stdio: 'pipe' });
  execSync(`git add ${to}`, { stdio: 'pipe' });
}

console.log('\n✅ Docs Autostow: moved ${moves.length} file(s)');
console.log('💡 Commit these changes with: git commit --amend --no-edit\n');
