#!/usr/bin/env node
/**
 * Fix Internal Imports Codemod
 * 
 * Comprehensive fix for all internal import issues in DS package:
 * 1. @intstudio/ds/* → relative imports (prevents build circular deps)
 * 2. ../primitives/overlay|picker → ../components/overlay|picker
 * 3. ../primitives/DSShims → ../components/DSShims (or remove)
 * 4. FormLabel/FormHelperText → ../components/typography
 * 5. TagInputField: gap="x" → spacing="x"
 * 
 * Usage:
 *   node scripts/codemods/fix-internal-imports.mjs          # dry-run
 *   node scripts/codemods/fix-internal-imports.mjs --fix    # apply
 */

import fs from 'node:fs';
import path from 'node:path';
import { globSync } from 'glob';

const ROOT = process.cwd();
const DS_SRC = 'packages/ds/src';
const FIX = process.argv.includes('--fix');

const files = globSync(`${DS_SRC}/**/*.{ts,tsx}`, {
  ignore: ['**/node_modules/**', '**/dist/**', '**/*.d.ts']
});

let totalChanges = 0;
let filesChanged = 0;

console.log('🔧 Fix Internal Imports Codemod');
console.log(FIX ? '✏️  APPLYING CHANGES' : '📋 DRY RUN\n');

/**
 * Calculate relative path from file to target
 */
function getRelativePath(fromFile, toPath) {
  const fromDir = path.dirname(fromFile);
  const targetPath = path.join(DS_SRC, toPath);
  let rel = path.relative(fromDir, targetPath);
  rel = rel.replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel;
}

/**
 * Determine which DS subpath is being imported
 */
function resolvePackageImport(file, spec) {
  // @intstudio/ds/utils → ../utils
  if (spec === '@intstudio/ds/utils') {
    return getRelativePath(file, 'utils');
  }
  
  // @intstudio/ds/white-label → ../white-label
  if (spec === '@intstudio/ds/white-label') {
    return getRelativePath(file, 'white-label');
  }
  
  // @intstudio/ds/a11y → ../a11y
  if (spec === '@intstudio/ds/a11y') {
    return getRelativePath(file, 'a11y');
  }
  
  // @intstudio/ds/primitives → ../primitives
  if (spec === '@intstudio/ds/primitives') {
    return getRelativePath(file, 'primitives');
  }
  
  // @intstudio/ds/patterns → ../patterns
  if (spec === '@intstudio/ds/patterns') {
    return getRelativePath(file, 'patterns');
  }
  
  // @intstudio/ds/shell → ../shell
  if (spec === '@intstudio/ds/shell') {
    return getRelativePath(file, 'shell');
  }
  
  // @intstudio/ds → need to analyze what's being imported
  // For now, map to primitives (most common)
  if (spec === '@intstudio/ds') {
    return getRelativePath(file, 'primitives');
  }
  
  return null;
}

for (const file of files) {
  const fullPath = path.join(ROOT, file);
  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;
  let fileChanges = 0;
  
  // Rule 1: @intstudio/ds/* → relative imports
  const dsImportRegex = /from ['"]@intstudio\/ds(\/[^'"]*)?['"]/g;
  content = content.replace(dsImportRegex, (match, subpath) => {
    const spec = '@intstudio/ds' + (subpath || '');
    const relative = resolvePackageImport(file, spec);
    if (relative) {
      fileChanges++;
      console.log(`  📦 ${file}`);
      console.log(`     "${spec}" → "${relative}"`);
      return `from '${relative}'`;
    }
    return match;
  });
  
  // Rule 2: ../primitives/overlay → ../components/overlay
  content = content.replace(
    /from ['"]\.\.\/primitives\/(overlay[^'"]*)['"]/g,
    (match, rest) => {
      fileChanges++;
      console.log(`  🔀 ${file}`);
      console.log(`     "../primitives/${rest}" → "../components/${rest}"`);
      return `from '../components/${rest}'`;
    }
  );
  
  // Rule 3: ../primitives/picker → ../components/picker
  content = content.replace(
    /from ['"]\.\.\/primitives\/(picker[^'"]*)['"]/g,
    (match, rest) => {
      fileChanges++;
      console.log(`  🔀 ${file}`);
      console.log(`     "../primitives/${rest}" → "../components/${rest}"`);
      return `from '../components/${rest}'`;
    }
  );
  
  // Rule 4: ../primitives/DSShims → ../components/DSShims
  content = content.replace(
    /from ['"]\.\.\/primitives\/DSShims['"]/g,
    () => {
      fileChanges++;
      console.log(`  🗑️  ${file}`);
      console.log(`     "../primitives/DSShims" → "../components/DSShims"`);
      return `from '../components/DSShims'`;
    }
  );
  
  // Rule 5: ../../primitives/overlay → ../../components/overlay (for composite fields)
  content = content.replace(
    /from ['"]\.\.\/\.\.\/primitives\/(overlay[^'"]*)['"]/g,
    (match, rest) => {
      fileChanges++;
      console.log(`  🔀 ${file}`);
      console.log(`     "../../primitives/${rest}" → "../../components/${rest}"`);
      return `from '../../components/${rest}'`;
    }
  );
  
  // Rule 6: ../../primitives/picker → ../../components/picker
  content = content.replace(
    /from ['"]\.\.\/\.\.\/primitives\/(picker[^'"]*)['"]/g,
    (match, rest) => {
      fileChanges++;
      console.log(`  🔀 ${file}`);
      console.log(`     "../../primitives/${rest}" → "../../components/${rest}"`);
      return `from '../../components/${rest}'`;
    }
  );
  
  // Rule 7: TagInputField - gap prop → spacing prop
  if (file.includes('TagInputField')) {
    content = content.replace(
      /(<Stack[^>]*)\bgap=["']([^"']+)["']/g,
      (match, before, value) => {
        fileChanges++;
        console.log(`  🎨 ${file}`);
        console.log(`     gap="${value}" → spacing="${value}"`);
        return `${before}spacing="${value}"`;
      }
    );
  }
  
  // Save if changed
  if (content !== originalContent) {
    filesChanged++;
    totalChanges += fileChanges;
    
    if (FIX) {
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📊 Summary:`);
console.log(`   Files scanned: ${files.length}`);
console.log(`   Files changed: ${filesChanged}`);
console.log(`   Total changes: ${totalChanges}`);

if (FIX) {
  console.log('\n✅ Changes applied!');
  console.log('\nNext steps:');
  console.log('  1. pnpm barrels');
  console.log('  2. pnpm -F @intstudio/ds build');
  console.log('  3. pnpm guard');
} else {
  console.log('\n💡 Run with --fix to apply changes');
}
