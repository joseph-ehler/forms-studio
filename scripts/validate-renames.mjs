#!/usr/bin/env node
/**
 * Rename Sanity Check - prevents bad renames from merging
 * 
 * Checks:
 * 1. No dangling imports to old paths
 * 2. No spaces or duplicate suffixes in filenames
 * 3. No PascalCase directories under routes/ (macOS case trap)
 * 
 * Run in CI before merge, or locally with: pnpm doctor:rename
 */

import { execSync } from 'node:child_process';

let errors = 0;

// Helper: run ripgrep and return output
function rg(pattern, path = 'packages') {
  try {
    return execSync(`rg -n "${pattern}" ${path} --hidden || true`, { encoding: 'utf-8' });
  } catch {
    return '';
  }
}

console.log('🔍 Running rename sanity checks...\n');

// Check 1: Dangling legacy imports to old route names
console.log('1️⃣  Checking for dangling legacy imports...');
const legacyImports = rg("from './(FlowScaffold|FullScreenRoute|RoutePanel)");
if (legacyImports.trim()) {
  console.error('❌ Dangling legacy imports detected:\n');
  console.error(legacyImports);
  console.error('\nThese imports reference old paths. Run: pnpm refactor:rename\n');
  errors++;
} else {
  console.log('✅ No dangling imports\n');
}

// Check 2: Spaces or duplicate suffixes in filenames
console.log('2️⃣  Checking for illegal filenames...');
try {
  const badNames = execSync(`git ls-files | rg -n " 2\\\\.|\\\\s" || true`, { encoding: 'utf-8' });
  if (badNames.trim()) {
    console.error('❌ Illegal filenames (spaces or "* 2.*" duplicates):\n');
    console.error(badNames);
    console.error('\nRemove spaces and duplicate files\n');
    errors++;
  } else {
    console.log('✅ No illegal filenames\n');
  }
} catch {
  console.log('✅ No illegal filenames\n');
}

// Check 3: PascalCase directories under routes/ (macOS case-sensitivity trap)
console.log('3️⃣  Checking for PascalCase directories in routes/...');
try {
  const caseDirs = execSync(
    `find packages -path "*/src/routes/*" -type d 2>/dev/null || true`,
    { encoding: 'utf-8' }
  );
  
  // Only check the basename (last part of path) for PascalCase
  const problematic = caseDirs
    .split('\n')
    .filter(line => line.trim())
    .filter(line => !line.includes('node_modules'))
    .filter(line => !line.includes('dist'))
    .filter(line => !line.includes('.git'))
    .filter(line => {
      const basename = line.split('/').pop();
      // Check if basename has uppercase (PascalCase) but not all uppercase (acronyms OK)
      return basename && /[A-Z]/.test(basename) && basename !== basename.toUpperCase();
    });
  
  if (problematic.length > 0) {
    console.error('❌ PascalCase directories under routes/ (use kebab-case):\n');
    problematic.forEach(dir => console.error(`  ${dir}`));
    console.error('\nUse: pnpm refactor:rename <old-path> <new-kebab-case-path>\n');
    errors++;
  } else {
    console.log('✅ All routes/ directories use kebab-case\n');
  }
} catch {
  console.log('✅ All routes/ directories use kebab-case\n');
}

// Check 4: Mixed case files that might break on Linux
console.log('4️⃣  Checking for case-sensitivity issues...');
const mixedCase = rg('import.*from.*[A-Z].*/', 'packages/**/src/routes');
if (mixedCase.includes('FlowScaffold') || mixedCase.includes('FullScreenRoute') || mixedCase.includes('RoutePanel')) {
  console.error('❌ Found imports with old PascalCase route names\n');
  console.error('Run: pnpm barrels && pnpm typecheck to fix\n');
  errors++;
} else {
  console.log('✅ No case-sensitivity issues\n');
}

// Summary
if (errors > 0) {
  console.error(`\n❌ ${errors} rename sanity check(s) failed`);
  console.error('\nFixes:');
  console.error('  - Use: pnpm refactor:rename <from> <to>');
  console.error('  - Then: pnpm barrels && pnpm typecheck');
  process.exit(1);
}

console.log('✅✅✅ All rename sanity checks passed!\n');
