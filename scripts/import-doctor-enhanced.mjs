#!/usr/bin/env node
/**
 * Import Doctor Enhanced - God-Tier Import Hygiene
 * 
 * Check mode: node scripts/import-doctor-enhanced.mjs
 * Fix mode: node scripts/import-doctor-enhanced.mjs --fix
 * 
 * NEW: Detects & auto-fixes internal self-package imports:
 * - @intstudio/ds/utils → ../utils (for files in ds package)
 * - @intstudio/ds/primitives → ../../primitives (correct relative path)
 * 
 * Also detects:
 * - Deep imports (e.g. @intstudio/ds/src/...)
 * - Cross-package relative imports
 * - Non-canonical DS paths
 */

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { globSync } from 'glob';

const ROOT = process.cwd();
const rules = yaml.load(fs.readFileSync(path.join(ROOT, 'repo.imports.yaml'), 'utf8'));
const FIX = process.argv.includes('--fix');

const SRC_GLOBS = [
  'packages/*/src/**/*.{ts,tsx}',
  '!**/*.d.ts',
  '!**/*.stories.*',
  '!**/*.spec.*',
  '!**/*.test.*',
];

const fileList = globSync(SRC_GLOBS, { 
  dot: false,
  ignore: ['**/node_modules/**', '**/demo/**', '**/dist/**']
});

const RE_IMPORT = /from\s+['"]([^'"]+)['"];?$/;
const problems = [];

// Package metadata
const PACKAGES = {
  ds: {
    name: '@intstudio/ds',
    root: 'packages/ds',
    srcRoot: 'packages/ds/src'
  },
  forms: {
    name: '@intstudio/forms',
    root: 'packages/forms',
    srcRoot: 'packages/forms/src'
  }
};

/**
 * Detect which package a file belongs to
 */
function detectPackage(file) {
  for (const [key, pkg] of Object.entries(PACKAGES)) {
    if (file.startsWith(pkg.srcRoot)) {
      return { key, ...pkg };
    }
  }
  return null;
}

/**
 * Check if an import is a self-package import
 * e.g., file in packages/ds/src importing from @intstudio/ds/*
 */
function isSelfPackageImport(pkg, importSpec) {
  if (!pkg) return false;
  return importSpec.startsWith(pkg.name + '/');
}

/**
 * Convert package import to relative import
 * e.g., @intstudio/ds/utils → ../utils (from packages/ds/src/fields/TextField.tsx)
 */
function toRelativeImport(file, importSpec, pkg) {
  // Extract the sub-path after the package name
  // e.g., @intstudio/ds/utils → utils
  // e.g., @intstudio/ds/primitives/overlay → primitives/overlay
  const subPath = importSpec.replace(pkg.name + '/', '');
  
  // Get the directory of the current file relative to src root
  const fileDir = path.dirname(file);
  const targetPath = path.join(pkg.srcRoot, subPath);
  
  // Calculate relative path
  let relativePath = path.relative(fileDir, targetPath);
  
  // Normalize to forward slashes and ensure it starts with ./
  relativePath = relativePath.replace(/\\\\/g, '/');
  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath;
  }
  
  return relativePath;
}

// Load whitelist
function getWhitelistFiles() {
  const whitelists = [];
  for (const [, pkg] of Object.entries(rules.packages || {})) {
    if (pkg.whitelistFiles) {
      whitelists.push(...pkg.whitelistFiles);
    }
  }
  return whitelists;
}

const WHITELIST_FILES = getWhitelistFiles();

function isWhitelisted(file) {
  return WHITELIST_FILES.includes(file);
}

function applyMap(spec) {
  for (const [, pkg] of Object.entries(rules.packages || {})) {
    const map = pkg.map || {};
    for (const [pat, target] of Object.entries(map)) {
      const re = new RegExp(pat);
      if (re.test(spec)) return spec.replace(re, target);
    }
  }
  return null;
}

function violates(pkgKey, spec) {
  const pkg = rules.packages?.[pkgKey];
  if (!pkg) return false;
  const denies = pkg.deny || [];
  for (const d of denies) {
    const re = new RegExp(d);
    if (re.test(spec)) return true;
  }
  return false;
}

let totalFixed = 0;
let selfPackageImports = 0;

console.log('🔍 Import Doctor Enhanced - Scanning...');
console.log(`Found ${fileList.length} files to check\n`);

for (const file of fileList) {
  const pkg = detectPackage(file);
  if (!pkg) {
    // console.log(`Skipping ${file} - no package detected`);
    continue;
  }
  
  const src = fs.readFileSync(file, 'utf8').split('\n');
  let changed = false;
  const whitelisted = isWhitelisted(file);
  
  src.forEach((line, i) => {
    const m = line.match(RE_IMPORT);
    if (!m) return;
    const spec = m[1];

    // NEW: Check for self-package imports
    if (!whitelisted && isSelfPackageImport(pkg, spec)) {
      const relativePath = toRelativeImport(file, spec, pkg);
      if (FIX) {
        src[i] = line.replace(spec, relativePath);
        changed = true;
        totalFixed++;
        selfPackageImports++;
        console.log(`  🔧 ${file}:${i + 1}`);
        console.log(`     "${spec}" → "${relativePath}"`);
      } else {
        problems.push({
          file,
          line: i + 1,
          reason: 'Internal file should use relative import',
          spec,
          fixed: relativePath,
          type: 'self-package-import'
        });
      }
    }
    // Existing deny rules
    else if (!whitelisted && violates(pkg.key, spec)) {
      const fixed = applyMap(spec);
      if (fixed && FIX) {
        src[i] = line.replace(spec, fixed);
        changed = true;
        totalFixed++;
        console.log(`  ✓ ${file}:${i + 1}  "${spec}" → "${fixed}"`);
      } else if (fixed) {
        problems.push({
          file,
          line: i + 1,
          reason: 'Violates import rules',
          spec,
          fixed,
          type: 'deny-rule'
        });
      } else {
        problems.push({
          file,
          line: i + 1,
          reason: 'Violates import rules (no auto-fix available)',
          spec,
          type: 'deny-rule'
        });
      }
    }
  });

  if (changed) {
    fs.writeFileSync(file, src.join('\n'));
  }
}

// Report
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (FIX) {
  if (totalFixed > 0) {
    console.log(`✅ Import Doctor: fixed ${totalFixed} imports.`);
    if (selfPackageImports > 0) {
      console.log(`   🔧 Self-package imports: ${selfPackageImports}`);
    }
  } else {
    console.log('✅ Import Doctor: all imports are canonical.');
  }
} else {
  if (problems.length === 0) {
    console.log('✅ Import Doctor: all imports are canonical.');
  } else {
    console.log(`❌ Import Doctor: found ${problems.length} violations.\n`);
    
    // Group by type
    const selfPackage = problems.filter(p => p.type === 'self-package-import');
    const denyRule = problems.filter(p => p.type === 'deny-rule');
    
    if (selfPackage.length > 0) {
      console.log(`🔧 Self-Package Imports (${selfPackage.length}):`);
      console.log('   Internal files should use relative imports, not package imports\n');
      selfPackage.forEach(p => {
        console.log(`   ${p.file}:${p.line}`);
        console.log(`   "${p.spec}" → "${p.fixed}"\n`);
      });
    }
    
    if (denyRule.length > 0) {
      console.log(`⛔ Import Rule Violations (${denyRule.length}):\n`);
      denyRule.forEach(p => {
        console.log(`   ${p.file}:${p.line}`);
        console.log(`   ${p.reason}: "${p.spec}"`);
        if (p.fixed) console.log(`   Fix: "${p.fixed}"`);
        console.log('');
      });
    }
    
    console.log('\nRun with --fix to auto-correct');
    process.exit(1);
  }
}
