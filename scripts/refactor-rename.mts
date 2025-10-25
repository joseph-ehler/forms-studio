#!/usr/bin/env tsx
/**
 * Safe rename command that updates imports + barrels automatically
 * 
 * Usage: pnpm refactor:rename packages/ds/src/routes/OldName packages/ds/src/routes/new-name
 * 
 * What it does:
 * 1. git mv (preserves history)
 * 2. Updates all imports using ts-morph
 * 3. Regenerates barrels
 * 4. Runs typecheck to verify
 */

import { Project } from 'ts-morph';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { basename } from 'node:path';

const [, , from, to] = process.argv;

if (!from || !to) {
  console.error('❌ Usage: pnpm refactor:rename <from-path> <to-path>');
  console.error('');
  console.error('Example:');
  console.error('  pnpm refactor:rename packages/ds/src/routes/FlowScaffold packages/ds/src/routes/flow-scaffold');
  process.exit(1);
}

if (!existsSync(from)) {
  console.error(`❌ Path not found: ${from}`);
  process.exit(1);
}

if (existsSync(to)) {
  console.error(`❌ Target path already exists: ${to}`);
  process.exit(1);
}

console.log('🔄 Safe rename starting...\n');

// Step 1: git mv (preserves history)
console.log(`📦 Step 1: Moving ${from} → ${to}`);
try {
  execSync(`git mv "${from}" "${to}"`, { stdio: 'inherit' });
  console.log('✅ Path moved\n');
} catch (error) {
  console.error('❌ Failed to move path');
  process.exit(1);
}

// Step 2: Update imports with ts-morph
console.log('📝 Step 2: Updating imports...');
const project = new Project({
  tsConfigFilePath: './tsconfig.base.json',
  skipAddingFilesFromTsConfig: false,
});

project.addSourceFilesAtPaths(['packages/**/src/**/*.{ts,tsx}']);

const fromSegment = basename(from);
const toSegment = basename(to);
let updatedFiles = 0;

for (const sourceFile of project.getSourceFiles()) {
  let changed = false;
  
  for (const importDeclaration of sourceFile.getImportDeclarations()) {
    const moduleSpecifier = importDeclaration.getModuleSpecifierValue();
    
    // Only update relative imports that reference the old path
    if (moduleSpecifier.startsWith('.') && moduleSpecifier.includes(fromSegment)) {
      const newSpecifier = moduleSpecifier.replace(
        new RegExp(fromSegment, 'g'),
        toSegment
      );
      
      if (newSpecifier !== moduleSpecifier) {
        importDeclaration.setModuleSpecifier(newSpecifier);
        changed = true;
      }
    }
  }
  
  if (changed) {
    sourceFile.saveSync();
    updatedFiles++;
  }
}

console.log(`✅ Updated imports in ${updatedFiles} files\n`);

// Step 3: Regenerate barrels
console.log('🔨 Step 3: Regenerating barrels...');
try {
  execSync('pnpm barrels', { stdio: 'inherit' });
  console.log('✅ Barrels regenerated\n');
} catch (error) {
  console.error('❌ Failed to regenerate barrels');
  process.exit(1);
}

// Step 4: Typecheck to verify everything still works
console.log('🔍 Step 4: Type checking...');
try {
  execSync('pnpm typecheck', { stdio: 'inherit' });
  console.log('✅ Type check passed\n');
} catch (error) {
  console.error('❌ Type check failed - imports may need manual fixes');
  process.exit(1);
}

console.log('✅✅✅ Rename complete!\n');
console.log('Next steps:');
console.log('  1. Review changes: git status');
console.log('  2. Commit: git commit -m "refactor: rename <from> → <to>"');
console.log('  3. Run tests if needed');
