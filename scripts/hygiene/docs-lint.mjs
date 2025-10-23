#!/usr/bin/env node
/**
 * Docs Lint - Comprehensive documentation linting
 * 
 * Checks:
 * 1. Front matter presence (YAML at top of file)
 * 2. Markdown style (markdownlint)
 * 3. Broken links (remark-validate-links)
 * 4. Spelling (cspell)
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';
import yaml from 'js-yaml';

const ROOT = process.cwd();
const errors = [];

// Required front matter fields
const REQUIRED_FIELDS = ['title', 'owner', 'status', 'lastReviewed'];

console.log('📚 Running docs linter...\n');

// Get all markdown files
const mdFiles = glob.sync('docs/**/*.md', { cwd: ROOT });

// 1. Check front matter
console.log('1️⃣  Checking front matter...');
for (const file of mdFiles) {
  if (file.endsWith('/README.md') || file.endsWith('/template.md')) continue;
  
  const content = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  
  if (!frontMatterMatch) {
    errors.push({
      file,
      check: 'front-matter',
      message: 'Missing YAML front matter',
      fix: 'Add front matter at top of file (see docs/README.md for template)',
    });
    continue;
  }
  
  try {
    const frontMatter = yaml.load(frontMatterMatch[1]);
    const missing = REQUIRED_FIELDS.filter(field => !frontMatter[field]);
    
    if (missing.length > 0) {
      errors.push({
        file,
        check: 'front-matter',
        message: `Missing required fields: ${missing.join(', ')}`,
        fix: 'Add missing fields to front matter',
      });
    }
  } catch (e) {
    errors.push({
      file,
      check: 'front-matter',
      message: 'Invalid YAML front matter',
      fix: 'Fix YAML syntax',
    });
  }
}
console.log(`   ✓ Checked ${mdFiles.length} files\n`);

// 2. Run markdownlint
console.log('2️⃣  Running markdownlint...');
try {
  execSync('markdownlint "docs/**/*.md" "packages/*/docs/**/*.md" --ignore node_modules', {
    cwd: ROOT,
    stdio: 'pipe',
  });
  console.log('   ✓ No markdown style issues\n');
} catch (e) {
  const output = e.stdout?.toString() || e.stderr?.toString() || '';
  if (output) {
    errors.push({
      file: 'multiple',
      check: 'markdownlint',
      message: 'Markdown style violations',
      details: output.split('\n').slice(0, 10).join('\n'),
    });
  }
}

// 3. Run remark (validate links)
console.log('3️⃣  Validating links...');
try {
  execSync('remark docs --use remark-validate-links --frail --quiet', {
    cwd: ROOT,
    stdio: 'pipe',
  });
  console.log('   ✓ No broken links\n');
} catch (e) {
  const output = e.stdout?.toString() || e.stderr?.toString() || '';
  if (output) {
    errors.push({
      file: 'multiple',
      check: 'links',
      message: 'Broken links detected',
      details: output.split('\n').slice(0, 10).join('\n'),
    });
  }
}

// 4. Run cspell
console.log('4️⃣  Spell checking...');
try {
  execSync('cspell "docs/**/*.md" "packages/*/docs/**/*.md" --no-progress', {
    cwd: ROOT,
    stdio: 'pipe',
  });
  console.log('   ✓ No spelling errors\n');
} catch (e) {
  const output = e.stdout?.toString() || e.stderr?.toString() || '';
  if (output) {
    errors.push({
      file: 'multiple',
      check: 'spelling',
      message: 'Spelling errors found',
      details: output.split('\n').slice(0, 10).join('\n'),
    });
  }
}

// Report
if (errors.length > 0) {
  console.error('\n❌ Docs linting failed:\n');
  errors.forEach(e => {
    console.error(`  ${e.file}`);
    console.error(`    [${e.check}] ${e.message}`);
    if (e.fix) console.error(`    💡 ${e.fix}`);
    if (e.details) console.error(`\n${e.details}\n`);
  });
  console.error('\n💡 Run: pnpm docs:lint:fix to auto-fix some issues\n');
  process.exit(1);
}

console.log('✅ All docs linting passed!\n');
