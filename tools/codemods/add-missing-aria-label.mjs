#!/usr/bin/env node
/**
 * Codemod: Add Missing ariaLabel
 * 
 * Adds ariaLabel prop to route components that are missing it
 * 
 * Usage:
 *   node tools/codemods/add-missing-aria-label.mjs [--dry-run]
 * 
 * Risk: LOW (only adds required prop, doesn't change behavior)
 * Rollback: git restore packages/
 */

import { Project, SyntaxKind } from 'ts-morph';
import { parseArgs } from 'util';

const { values } = parseArgs({
  options: {
    'dry-run': { type: 'boolean', default: false },
  },
});

const dryRun = values['dry-run'];
const ROUTE_COMPONENTS = ['FullScreenRoute', 'RoutePanel', 'FlowScaffold'];

console.log('🔍 Finding route components missing ariaLabel...\n');

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

const changes = [];

// Find all TSX files
const sourceFiles = project.getSourceFiles('packages/**/*.tsx');

sourceFiles.forEach(sourceFile => {
  const filePath = sourceFile.getFilePath();
  let fileModified = false;

  sourceFile.forEachDescendant(node => {
    if (node.getKind() !== SyntaxKind.JsxOpeningElement) return;

    const element = node;
    const tagName = element.getTagNameNode().getText();

    // Check if it's a route component
    if (!ROUTE_COMPONENTS.includes(tagName)) return;

    // Check if it already has ariaLabel or ariaLabelledBy
    const attributes = element.getAttributes();
    const hasAria = attributes.some(attr => {
      const name = attr.getNameNode()?.getText();
      return name === 'ariaLabel' || name === 'ariaLabelledBy';
    });

    if (hasAria) return;

    // Missing ARIA - add it
    const componentName = tagName.replace(/([A-Z])/g, ' $1').trim();
    
    if (!dryRun) {
      element.addAttribute({
        name: 'ariaLabel',
        initializer: `"${componentName}"`,
      });
      fileModified = true;
    }

    changes.push({
      file: filePath,
      component: tagName,
      line: element.getStartLineNumber(),
      added: `ariaLabel="${componentName}"`,
    });
  });

  if (fileModified && !dryRun) {
    sourceFile.saveSync();
  }
});

// Report results
if (changes.length === 0) {
  console.log('✅ No missing ariaLabel attributes found!\n');
  process.exit(0);
}

console.log(`Found ${changes.length} components missing ariaLabel:\n`);

changes.forEach(({ file, component, line, added }) => {
  console.log(`  ${file}:${line}`);
  console.log(`    <${component}> → <${component} ${added}>`);
  console.log('');
});

if (dryRun) {
  console.log('🔍 DRY RUN - No files modified');
  console.log(`\nTo apply changes, run without --dry-run flag\n`);
} else {
  console.log('✅ Added ariaLabel to all route components\n');
  console.log('Next steps:');
  console.log('  1. Review changes: git diff');
  console.log('  2. Run tests: pnpm test');
  console.log('  3. Commit: git commit -m "chore: add missing ariaLabel to route components"');
}

console.log(`\n📊 Summary: ${changes.length} components updated`);
