#!/usr/bin/env node
/**
 * AST-Based DS Import Normalizer
 * 
 * Comprehensive, semantic codemod for DS internal imports:
 * 1. Self-package imports → relative imports
 * 2. Overlay/picker paths → ../components/
 * 3. Composite utils split (typography-display + field-json-config)
 * 4. DSShims → real primitives
 * 
 * Usage:
 *   node scripts/codemods/normalize-ds-imports.mjs          # dry-run
 *   node scripts/codemods/normalize-ds-imports.mjs --fix    # apply
 */

import { Project } from 'ts-morph';
import path from 'node:path';

const FIX = process.argv.includes('--fix');
const ROOT = process.cwd();

console.log('🔧 AST-Based DS Import Normalizer');
console.log(FIX ? '✏️  APPLYING CHANGES\n' : '📋 DRY RUN\n');

const project = new Project({
  tsConfigFilePath: path.join(ROOT, 'packages/ds/tsconfig.json'),
  skipAddingFilesFromTsConfig: true,
});

// Add all DS source files
project.addSourceFilesAtPaths('packages/ds/src/**/*.{ts,tsx}');

const sourceFiles = project.getSourceFiles();
let totalChanges = 0;
let filesChanged = 0;

for (const sourceFile of sourceFiles) {
  const filePath = sourceFile.getFilePath();
  const relativeFilePath = path.relative(ROOT, filePath);
  let fileChanges = 0;

  // Get file directory for relative path calculations
  const fileDir = path.dirname(filePath);
  const dsSourceRoot = path.join(ROOT, 'packages/ds/src');

  // Rule 1: Fix self-package imports (@intstudio/ds/*)
  for (const importDecl of sourceFile.getImportDeclarations()) {
    const moduleSpecifier = importDecl.getModuleSpecifierValue();

    // Self-package import?
    if (moduleSpecifier.startsWith('@intstudio/ds')) {
      let targetPath;

      if (moduleSpecifier === '@intstudio/ds') {
        targetPath = 'primitives';
      } else if (moduleSpecifier === '@intstudio/ds/utils') {
        targetPath = 'utils';
      } else if (moduleSpecifier === '@intstudio/ds/primitives') {
        targetPath = 'primitives';
      } else if (moduleSpecifier === '@intstudio/ds/a11y') {
        targetPath = 'a11y';
      } else if (moduleSpecifier === '@intstudio/ds/white-label') {
        targetPath = 'white-label';
      } else if (moduleSpecifier === '@intstudio/ds/patterns') {
        targetPath = 'patterns';
      } else if (moduleSpecifier === '@intstudio/ds/shell') {
        targetPath = 'shell';
      } else {
        continue; // Unknown subpath
      }

      const absoluteTarget = path.join(dsSourceRoot, targetPath);
      let relativePath = path.relative(fileDir, absoluteTarget);
      relativePath = relativePath.replace(/\\/g, '/');
      if (!relativePath.startsWith('.')) {
        relativePath = './' + relativePath;
      }

      console.log(`  📦 ${relativeFilePath}`);
      console.log(`     "${moduleSpecifier}" → "${relativePath}"`);
      
      importDecl.setModuleSpecifier(relativePath);
      fileChanges++;
    }

    // Rule 2: Fix overlay/picker paths (primitives → components)
    else if (moduleSpecifier.match(/^\.\.(\/\.\.)?\/primitives\/(overlay|picker)/)) {
      const fixed = moduleSpecifier.replace(/\/primitives\/(overlay|picker)/, '/components/$1');
      console.log(`  🔀 ${relativeFilePath}`);
      console.log(`     "${moduleSpecifier}" → "${fixed}"`);
      
      importDecl.setModuleSpecifier(fixed);
      fileChanges++;
    }

    // Rule 3: Fix DSShims (primitives/DSShims → components/DSShims)
    else if (moduleSpecifier === '../primitives/DSShims' || moduleSpecifier === '../../primitives/DSShims') {
      const fixed = moduleSpecifier.replace(/primitives\/DSShims/, 'components/DSShims');
      console.log(`  🗑️  ${relativeFilePath}`);
      console.log(`     "${moduleSpecifier}" → "${fixed}"`);
      
      importDecl.setModuleSpecifier(fixed);
      fileChanges++;
    }

    // Rule 4: Split composite utils imports (typography-display + field-json-config)
    else if (
      moduleSpecifier === '../utils/typography-display' &&
      relativeFilePath.includes('fields/composite')
    ) {
      const namedImports = importDecl.getNamedImports();
      const importedNames = namedImports.map(ni => ni.getName());

      // Check if mergeFieldConfig is imported alongside typography utils
      const hasMergeFieldConfig = importedNames.includes('mergeFieldConfig');
      const hasTypographyUtils = 
        importedNames.includes('resolveTypographyDisplay') ||
        importedNames.includes('getTypographyFromJSON');

      if (hasMergeFieldConfig && hasTypographyUtils) {
        console.log(`  ✂️  ${relativeFilePath}`);
        console.log(`     Splitting utils import`);

        // Remove mergeFieldConfig from this import
        const mergeFieldConfigImport = namedImports.find(ni => ni.getName() === 'mergeFieldConfig');
        if (mergeFieldConfigImport) {
          mergeFieldConfigImport.remove();
        }

        // Add new import for mergeFieldConfig
        const importDeclIndex = sourceFile.getImportDeclarations().indexOf(importDecl);
        sourceFile.insertImportDeclaration(importDeclIndex + 1, {
          moduleSpecifier: '../utils/field-json-config',
          namedImports: ['mergeFieldConfig'],
        });

        fileChanges++;
      }
    }
  }

  // Rule 5: Fix JSX Stack props (gap → spacing)
  for (const jsxElement of sourceFile.getDescendantsOfKind(254)) { // JsxOpeningElement
    const tagName = jsxElement.getTagNameNode().getText();
    if (tagName !== 'Stack') continue;

    for (const attr of jsxElement.getAttributes()) {
      if (attr.getKind() !== 287) continue; // JsxAttribute
      
      const attrName = attr.getNameNode().getText();
      
      // Replace gap with spacing
      if (attrName === 'gap') {
        console.log(`  🎨 ${relativeFilePath}`);
        console.log(`     Stack: gap → spacing`);
        
        attr.getNameNode().replaceWithText('spacing');
        fileChanges++;
      }
      
      // Remove unsupported props
      else if (['justify', 'align'].includes(attrName)) {
        console.log(`  🗑️  ${relativeFilePath}`);
        console.log(`     Stack: removing unsupported prop "${attrName}"`);
        
        attr.remove();
        fileChanges++;
      }
    }
  }

  if (fileChanges > 0) {
    filesChanged++;
    totalChanges += fileChanges;

    if (FIX) {
      sourceFile.saveSync();
    }
  }
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📊 Summary:`);
console.log(`   Files scanned: ${sourceFiles.length}`);
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
