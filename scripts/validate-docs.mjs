#!/usr/bin/env node
/**
 * Documentation Placement Validator (Enhanced)
 * 
 * Features:
 * - Staged-file validation (fast) or full scan
 * - Allowlist-based (explicit approved paths)
 * - Symlink protection (realpath checks)
 * - Case normalization (macOS/APFS safe)
 * - Third-party ignorance (node_modules, etc.)
 */

import { readdir, stat, realpath } from 'fs/promises';
import { join, relative, sep } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { parseArgs } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = await realpath(join(__dirname, '..'));

// Parse arguments
const { values } = parseArgs({
  options: {
    paths: { type: 'string' },
  },
  allowPositionals: true,
});

// Allowlist: Approved directory patterns (globby style)
const ALLOWED_PATTERNS = [
  /^docs\//,
  /^\.cascade\//,
  /^packages\/[^/]+\/docs\//,
  /^\.github\//,  // Allow GitHub-specific files
];

// Explicit exceptions (allowed .md files in roots)
const ALLOWED_ROOT_FILES = new Set([
  'README.md',
  'CHANGELOG.md',
  'LICENSE.md',
  'CONTRIBUTING.md',
]);

// Ignored patterns (third-party, generated)
const IGNORED_PATTERNS = [
  /^node_modules\//,
  /^\.git\//,
  /^dist\//,
  /^build\//,
  /^coverage\//,
];

/**
 * Normalize path for cross-platform comparison
 */
function normalizePath(path) {
  return path.split(sep).join('/').toLowerCase();
}

/**
 * Check if path matches any pattern
 */
function matchesPattern(path, patterns) {
  const normalized = normalizePath(path);
  return patterns.some(pattern => pattern.test(normalized));
}

/**
 * Check if file is in allowed location
 */
function isAllowed(filePath) {
  const relativePath = relative(ROOT, filePath);
  const fileName = relativePath.split('/').pop();
  
  // Check if it's an allowed root file
  if (!relativePath.includes('/') && ALLOWED_ROOT_FILES.has(fileName)) {
    return true;
  }
  
  // Check if it's in an ignored location
  if (matchesPattern(relativePath, IGNORED_PATTERNS)) {
    return true;
  }
  
  // Check if it matches allowed patterns
  if (matchesPattern(relativePath, ALLOWED_PATTERNS)) {
    return true;
  }
  
  return false;
}

/**
 * Validate a single file
 */
async function validateFile(filePath) {
  try {
    // Resolve realpath (protects against symlinks)
    const realPath = await realpath(filePath);
    
    // Ensure file is within repo (no symlink escapes)
    if (!realPath.startsWith(ROOT)) {
      return {
        valid: false,
        file: filePath,
        reason: 'Symlink escapes repository',
        suggestion: 'Remove symlink or move file into repository',
      };
    }
    
    // Check if allowed
    if (!isAllowed(realPath)) {
      const relativePath = relative(ROOT, realPath);
      return {
        valid: false,
        file: relativePath,
        reason: 'Not in approved directory',
        suggestion: suggestLocation(relativePath),
      };
    }
    
    return { valid: true, file: relative(ROOT, realPath) };
  } catch (err) {
    // File doesn't exist or can't be read
    return { valid: true, file: filePath, skipped: true };
  }
}

/**
 * Find all .md files recursively
 */
async function findMarkdownFiles(dir, files = []) {
  try {
    const entries = await readdir(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const relativePath = relative(ROOT, fullPath);
      
      // Skip ignored directories
      if (matchesPattern(relativePath, IGNORED_PATTERNS)) {
        continue;
      }
      
      const stats = await stat(fullPath);
      
      if (stats.isDirectory()) {
        await findMarkdownFiles(fullPath, files);
      } else if (stats.isFile() && entry.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  } catch (err) {
    // Directory doesn't exist or can't be read, skip
  }
  
  return files;
}

/**
 * Suggest correct location based on file name
 */
function suggestLocation(fileName) {
  const name = fileName.toLowerCase();
  
  if (name.includes('adr') || name.includes('decision')) {
    return 'docs/adr/';
  }
  
  if (name.includes('session')) {
    return 'docs/sessions/';
  }
  
  if (name.includes('guide') || name.includes('tutorial') || name.includes('how')) {
    return 'docs/guides/';
  }
  
  if (name.includes('plan') || name.includes('progress') || name.includes('todo')) {
    return '.cascade/work-plans/';
  }
  
  if (name.includes('architecture') || name.includes('design') || name.includes('system')) {
    return 'docs/architecture/';
  }
  
  // Default
  return 'docs/';
}

/**
 * Main validation function
 */
async function validateDocs() {
  console.log('🔍 Validating documentation placement...\n');
  
  let filesToCheck = [];
  
  // Check if specific paths provided (staged files)
  if (values.paths) {
    const paths = values.paths.trim().split(/\s+/).filter(Boolean);
    filesToCheck = paths
      .filter(p => p.endsWith('.md'))
      .map(p => join(ROOT, p));
    
    if (filesToCheck.length === 0) {
      console.log('✅ No markdown files to validate\n');
      return true;
    }
    
    console.log(`📄 Checking ${filesToCheck.length} staged file(s)...\n`);
  } else {
    // Full scan
    console.log('📂 Scanning repository for markdown files...\n');
    filesToCheck = await findMarkdownFiles(ROOT);
  }
  
  // Validate each file
  const results = await Promise.all(filesToCheck.map(validateFile));
  const violations = results.filter(r => !r.valid && !r.skipped);
  
  // Report results
  if (violations.length === 0) {
    console.log('✅ All documentation files are correctly placed!\n');
    console.log('Approved patterns:');
    console.log('  ✅ docs/**');
    console.log('  ✅ .cascade/**');
    console.log('  ✅ packages/*/docs/**');
    return true;
  }
  
  console.error('❌ Documentation placement violations found:\n');
  
  violations.forEach(({ file, reason, suggestion }) => {
    console.error(`  ❌ ${file}`);
    console.error(`     Reason: ${reason}`);
    console.error(`     → Move to: ${suggestion}\n`);
  });
  
  console.error('📋 Approved locations:');
  console.error('  ✅ docs/adr/');
  console.error('  ✅ docs/guides/');
  console.error('  ✅ docs/sessions/');
  console.error('  ✅ docs/architecture/');
  console.error('  ✅ .cascade/sessions/');
  console.error('  ✅ .cascade/work-plans/');
  console.error('  ✅ packages/*/docs/');
  
  console.error('\n💡 Quick fixes:');
  violations.forEach(({ file, suggestion }) => {
    const fileName = file.split('/').pop();
    console.error(`  mv ${file} ${suggestion}${fileName}`);
  });
  
  console.error('\n📖 See .cascade/DOC_PLACEMENT_RULES.md for details\n');
  
  return false;
}

// Run validation
validateDocs().then(isValid => {
  process.exit(isValid ? 0 : 1);
});
