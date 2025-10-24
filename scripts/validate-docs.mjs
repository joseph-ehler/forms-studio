#!/usr/bin/env node
/**
 * Documentation Placement Validator
 * 
 * Enforces strict rules:
 * - No .md files in repository root
 * - No .md files in package roots
 * - All docs must be in approved subdirectories
 */

import { readdir, stat } from 'fs/promises';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// Allowed markdown file names in roots (exceptions)
const ALLOWED_ROOT_FILES = new Set([
  'README.md',
  'CHANGELOG.md',
  'LICENSE.md',
  'CONTRIBUTING.md',
]);

// Forbidden root directories (no .md files allowed except allowed list)
const FORBIDDEN_ROOTS = [
  ROOT,
  join(ROOT, 'packages', 'ds'),
  join(ROOT, 'packages', 'core'),
  join(ROOT, 'packages', 'ui-bridge'),
];

// Approved doc directories
const APPROVED_DIRS = [
  'docs',
  '.cascade',
  'packages/ds/docs',
  'packages/core/docs',
  'packages/ui-bridge/docs',
];

/**
 * Find all .md files in a directory (non-recursive)
 */
async function findMarkdownFiles(dir) {
  try {
    const entries = await readdir(dir);
    const files = [];
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stats = await stat(fullPath);
      
      if (stats.isFile() && entry.endsWith('.md')) {
        files.push({ path: fullPath, name: entry });
      }
    }
    
    return files;
  } catch (err) {
    // Directory doesn't exist, skip
    return [];
  }
}

/**
 * Validate documentation placement
 */
async function validateDocs() {
  console.log('🔍 Validating documentation placement...\n');
  
  const violations = [];
  
  // Check each forbidden root
  for (const root of FORBIDDEN_ROOTS) {
    const files = await findMarkdownFiles(root);
    
    for (const file of files) {
      // Skip allowed files
      if (ALLOWED_ROOT_FILES.has(file.name)) {
        continue;
      }
      
      violations.push({
        file: file.path.replace(ROOT, ''),
        location: root.replace(ROOT, '') || '/',
        suggestion: suggestLocation(file.name),
      });
    }
  }
  
  // Report results
  if (violations.length === 0) {
    console.log('✅ All documentation files are correctly placed!\n');
    console.log('Approved directories:');
    APPROVED_DIRS.forEach(dir => console.log(`  ✅ ${dir}/`));
    return true;
  }
  
  console.error('❌ Documentation placement violations found:\n');
  
  violations.forEach(({ file, location, suggestion }) => {
    console.error(`  ❌ ${file}`);
    console.error(`     Location: ${location}/`);
    console.error(`     → Move to: ${suggestion}\n`);
  });
  
  console.error('📋 Approved directories for documentation:');
  APPROVED_DIRS.forEach(dir => console.error(`  ✅ ${dir}/`));
  
  console.error('\n💡 Quick fixes:');
  violations.forEach(({ file, suggestion }) => {
    const fileName = basename(file);
    console.error(`  mv .${file} ${suggestion}${fileName}`);
  });
  
  console.error('\n📖 See .cascade/DOC_PLACEMENT_RULES.md for details\n');
  
  return false;
}

/**
 * Suggest correct location based on file name
 */
function suggestLocation(fileName) {
  const name = fileName.toLowerCase();
  
  if (name.includes('adr') || name.includes('architecture')) {
    return 'docs/adr/';
  }
  
  if (name.includes('session')) {
    return 'docs/sessions/';
  }
  
  if (name.includes('guide') || name.includes('tutorial')) {
    return 'docs/guides/';
  }
  
  if (name.includes('plan') || name.includes('progress')) {
    return '.cascade/work-plans/';
  }
  
  // Default to docs/
  return 'docs/';
}

// Run validation
validateDocs().then(isValid => {
  process.exit(isValid ? 0 : 1);
});
