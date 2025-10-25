#!/usr/bin/env node
/**
 * File/Folder Naming Convention Enforcer
 * 
 * Enforces strict naming conventions:
 * - Files: kebab-case (lowercase, hyphens)
 * - Folders: kebab-case (lowercase, hyphens)
 * - React components: PascalCase.tsx
 * - Type files: PascalCase.ts or kebab-case.ts
 * 
 * Usage:
 *   node scripts/validate-naming.mjs
 *   node scripts/validate-naming.mjs --paths "file1.ts file2.md"
 */

import { readdir, stat, readFile } from 'fs/promises';
import { join, relative, basename, extname, sep } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { parseArgs } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// Load exceptions from registry
const EXCEPTIONS_FILE = join(__dirname, 'validators', '.naming-exceptions.json');
let LOADED_EXCEPTIONS = { files: [], dirs: [], patterns: [] };
try {
  const data = await readFile(EXCEPTIONS_FILE, 'utf8');
  LOADED_EXCEPTIONS = JSON.parse(data);
} catch (err) {
  // File doesn't exist yet, use defaults
}

// Parse arguments
const { values } = parseArgs({
  options: {
    paths: { type: 'string' },
    fix: { type: 'boolean' },
    'dry-run': { type: 'boolean' },
  },
});

// Naming conventions
const CONVENTIONS = {
  // Files that MUST be PascalCase
  PASCAL_CASE_FILES: /\.(tsx|jsx)$/,
  
  // Files that SHOULD be kebab-case
  KEBAB_CASE_FILES: /\.(ts|js|mjs|css|md|json|yaml|yml|html|sh)$/,
  
  // Allowed special files (loaded from registry + defaults)
  ALLOWED_SPECIAL: new Set([
    ...LOADED_EXCEPTIONS.files,
    'SESSION',
    'ADR',
  ]),
  
  // Allowed special directories (loaded from registry)
  ALLOWED_DIRS: new Set([
    ...LOADED_EXCEPTIONS.dirs,
  ]),
  
  // Allowed patterns (SESSION_, ADR_, etc.)
  ALLOWED_PATTERNS: LOADED_EXCEPTIONS.patterns || [],
  
  // Hook files: allow camelCase (useModal.ts, useDrawer.tsx)
  HOOK_PATTERN: /^use[A-Z][a-zA-Z0-9]*\.(ts|tsx)$/,
  
  // Ignored directories
  IGNORED_DIRS: new Set([
    'node_modules',
    '.git',
    'dist',
    'build',
    'coverage',
    '.turbo',
    '.next',
    '.cache',
  ]),
};

/**
 * Check if string is kebab-case
 */
function isKebabCase(str) {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(str);
}

/**
 * Check if string is PascalCase
 */
function isPascalCase(str) {
  return /^[A-Z][a-zA-Z0-9]*$/.test(str);
}

/**
 * Check if filename has correct extension
 */
function hasCorrectExtension(name, conventions) {
  const ext = extname(name);
  return conventions.test(name);
}

/**
 * Validate a file name
 */
function validateFileName(filePath) {
  const name = basename(filePath);
  const nameWithoutExt = basename(filePath, extname(filePath));
  
  // Check for special allowed files
  if (CONVENTIONS.ALLOWED_SPECIAL.has(name)) {
    return { valid: true };
  }
  
  // Check for hook files
  if (CONVENTIONS.HOOK_PATTERN.test(name)) {
    return { valid: true };
  }
  
  // Check for uppercase prefix patterns (SESSION_, ADR_)
  for (const prefix of CONVENTIONS.ALLOWED_PATTERNS) {
    if (name.startsWith(prefix)) {
      return { valid: true };
    }
  }
  
  // React components must be PascalCase
  if (CONVENTIONS.PASCAL_CASE_FILES.test(name)) {
    if (!isPascalCase(nameWithoutExt)) {
      return {
        valid: false,
        reason: 'React components must be PascalCase',
        suggestion: toPascalCase(nameWithoutExt) + extname(name),
        rule: 'pascal-case-components',
      };
    }
    return { valid: true };
  }
  
  // All non-component files should be kebab-case
  if (CONVENTIONS.KEBAB_CASE_FILES.test(name)) {
    if (!isKebabCase(nameWithoutExt)) {
      return {
        valid: false,
        reason: 'Files must be kebab-case (lowercase with hyphens)',
        suggestion: toKebabCase(nameWithoutExt) + extname(name),
        rule: 'kebab-case-files',
      };
    }
    return { valid: true };
  }
  
  // Unknown extension, check for common issues
  if (/[A-Z]/.test(nameWithoutExt)) {
    return {
      valid: false,
      reason: 'Filenames should not contain uppercase letters (use kebab-case)',
      suggestion: toKebabCase(nameWithoutExt) + extname(name),
      rule: 'no-uppercase',
    };
  }
  
  if (/\s/.test(name)) {
    return {
      valid: false,
      reason: 'Filenames must not contain spaces',
      suggestion: name.replace(/\s+/g, '-'),
      rule: 'no-spaces',
    };
  }
  
  if (/_/.test(nameWithoutExt)) {
    return {
      valid: false,
      reason: 'Use hyphens instead of underscores (kebab-case)',
      suggestion: nameWithoutExt.replace(/_/g, '-') + extname(name),
      rule: 'no-underscores',
    };
  }
  
  return { valid: true };
}

/**
 * Validate a directory name
 */
function validateDirName(dirPath) {
  const name = basename(dirPath);
  
  // Check if in allowed list
  if (CONVENTIONS.ALLOWED_DIRS && CONVENTIONS.ALLOWED_DIRS.has(name)) {
    return { valid: true };
  }
  
  // Ignore dot directories (except special ones)
  if (name.startsWith('.')) {
    return { valid: true };
  }
  
  // Check if in ignored list
  if (CONVENTIONS.IGNORED_DIRS.has(name)) {
    return { valid: true };
  }
  
  // Directories should be kebab-case
  if (!isKebabCase(name)) {
    return {
      valid: false,
      reason: 'Directories must be kebab-case (lowercase with hyphens)',
      suggestion: toKebabCase(name),
      rule: 'kebab-case-dirs',
    };
  }
  
  return { valid: true };
}

/**
 * Convert string to kebab-case
 */
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convert string to PascalCase
 */
function toPascalCase(str) {
  return str
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Find all files recursively
 */
async function findFiles(dir, files = []) {
  try {
    const entries = await readdir(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const relativePath = relative(ROOT, fullPath);
      
      // Skip ignored directories
      if (CONVENTIONS.IGNORED_DIRS.has(entry)) {
        continue;
      }
      
      const stats = await stat(fullPath);
      
      if (stats.isDirectory()) {
        files.push({ type: 'dir', path: fullPath });
        await findFiles(fullPath, files);
      } else if (stats.isFile()) {
        files.push({ type: 'file', path: fullPath });
      }
    }
  } catch (err) {
    // Skip unreadable directories
  }
  
  return files;
}

/**
 * Apply fixes by renaming files
 */
async function applyFixes(violations) {
  const { execSync } = await import('child_process');
  
  console.log('\n🔧 Applying fixes...\n');
  
  let fixedCount = 0;
  const failed = [];
  
  for (const violation of violations) {
    const oldPath = violation.path;
    const newPath = join(dirname(oldPath), violation.suggestion);
    
    try {
      if (values['dry-run']) {
        console.log(`  [DRY-RUN] Would rename: ${oldPath} → ${newPath}`);
      } else {
        execSync(`git mv "${oldPath}" "${newPath}"`, { cwd: ROOT });
        console.log(`  ✅ Renamed: ${oldPath} → ${newPath}`);
        fixedCount++;
      }
    } catch (err) {
      console.error(`  ❌ Failed to rename ${oldPath}: ${err.message}`);
      failed.push({ oldPath, newPath, error: err.message });
    }
  }
  
  if (values['dry-run']) {
    console.log(`\n📋 Dry-run complete. Would fix ${violations.length} file(s).`);
    console.log('Run without --dry-run to apply changes.');
  } else if (fixedCount > 0) {
    console.log(`\n✅ Fixed ${fixedCount} file(s)!`);
    if (failed.length > 0) {
      console.log(`⚠️  Failed to fix ${failed.length} file(s).`);
    }
    console.log('\n⚠️  IMPORTANT: You may need to update import paths!');
    console.log('Run your build to check for broken imports.');
  }
  
  return { fixedCount, failed };
}

/**
 * Main validation function
 */
async function validateNaming() {
  const isFixMode = values.fix || values['dry-run'];
  
  if (isFixMode) {
    console.log('🔧 Running in fix mode...\n');
    if (values['dry-run']) {
      console.log('📋 DRY-RUN: No changes will be made\n');
    }
  } else {
    console.log('🔍 Validating file/folder naming conventions...\n');
  }
  
  let itemsToCheck = [];
  
  // Check if specific paths provided
  if (values.paths) {
    const paths = values.paths.trim().split(/\s+/).filter(Boolean);
    itemsToCheck = paths.map(p => ({
      type: p.includes('.') ? 'file' : 'dir',
      path: join(ROOT, p),
    }));
  } else {
    // Full scan
    itemsToCheck = await findFiles(ROOT);
  }
  
  const violations = [];
  
  for (const item of itemsToCheck) {
    const result = item.type === 'file'
      ? validateFileName(item.path)
      : validateDirName(item.path);
    
    if (!result.valid) {
      violations.push({
        path: relative(ROOT, item.path),
        type: item.type,
        ...result,
      });
    }
  }
  
  // Report results
  if (violations.length === 0) {
    console.log('✅ All files and folders follow naming conventions!\n');
    return true;
  }
  
  // If in fix mode, apply fixes
  if (values.fix || values['dry-run']) {
    console.log(`📋 Found ${violations.length} naming violation(s)\n`);
    
    // Group and show violations
    const byRule = {};
    violations.forEach(v => {
      if (!byRule[v.rule]) byRule[v.rule] = [];
      byRule[v.rule].push(v);
    });
    
    for (const [rule, items] of Object.entries(byRule)) {
      console.log(`${rule}: ${items.length} file(s)`);
    }
    
    const { fixedCount, failed } = await applyFixes(violations);
    
    if (values['dry-run']) {
      return false; // Exit with error in dry-run to show what would change
    }
    
    return failed.length === 0;
  }
  
  console.error('❌ Naming convention violations found:\n');
  
  // Group by rule
  const byRule = {};
  violations.forEach(v => {
    if (!byRule[v.rule]) byRule[v.rule] = [];
    byRule[v.rule].push(v);
  });
  
  for (const [rule, items] of Object.entries(byRule)) {
    console.error(`\n📋 ${rule}:\n`);
    items.forEach(({ path, type, reason, suggestion }) => {
      console.error(`  ❌ ${type === 'file' ? '📄' : '📁'} ${path}`);
      console.error(`     Reason: ${reason}`);
      console.error(`     → Rename to: ${suggestion}\n`);
    });
  }
  
  console.error('📖 Naming Conventions:\n');
  console.error('  Files:');
  console.error('    • React components (.tsx): PascalCase (Button.tsx)');
  console.error('    • Other files: kebab-case (button-styles.css)');
  console.error('    • No spaces, no underscores');
  console.error('  Folders:');
  console.error('    • Always kebab-case (my-component)');
  console.error('    • No spaces, no underscores');
  console.error('\n💡 Quick fixes:');
  violations.forEach(({ path, suggestion }) => {
    console.error(`  mv "${path}" "${dirname(path)}/${suggestion}"`);
  });
  console.error('');
  
  return false;
}

// Run validation
validateNaming().then(isValid => {
  process.exit(isValid ? 0 : 1);
});
