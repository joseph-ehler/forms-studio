#!/usr/bin/env node
/**
 * Codemod: Rename Sheet → BottomSheet
 * 
 * Description: Aligns code with taxonomy ("frames, not skins")
 * Usage: node scripts/codemods/rename-sheet-to-bottomsheet.mjs [--dry-run]
 * Risk: LOW (adds deprecation aliases, no breaking changes)
 * Rollback: git restore packages/ds/src/primitives/BottomSheet/
 */

import { parseArgs } from 'util';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const { values } = parseArgs({
  options: {
    'dry-run': { type: 'boolean', default: false }
  }
});

const dryRun = values['dry-run'];

// Files to transform
const updates = [];

// 1. Update BottomSheet.tsx internal references
const bottomSheetFile = 'packages/ds/src/primitives/BottomSheet/BottomSheet.tsx';
let bottomSheetContent = readFileSync(bottomSheetFile, 'utf-8');

// Update CSS import
const cssImportBefore = `import './Sheet.css';`;
const cssImportAfter = `import './BottomSheet.css';`;
if (bottomSheetContent.includes(cssImportBefore)) {
  bottomSheetContent = bottomSheetContent.replace(cssImportBefore, cssImportAfter);
  updates.push({ file: bottomSheetFile, change: 'CSS import updated' });
}

// Update SheetContext import
const contextImportBefore = `from './SheetContext'`;
const contextImportAfter = `from './BottomSheetContext'`;
bottomSheetContent = bottomSheetContent.replaceAll(contextImportBefore, contextImportAfter);

// Update comment header
bottomSheetContent = bottomSheetContent.replace(
  /\/\*\*\s*\n\s*\* Sheet - Capability-aware overlay/,
  '/**\n * BottomSheet - Capability-aware bottom drawer'
);

// Update export (find and replace pattern)
bottomSheetContent = bottomSheetContent.replace(
  /export function Sheet\(/g,
  'export function BottomSheet('
);

if (!dryRun) {
  writeFileSync(bottomSheetFile, bottomSheetContent);
}

// 2. Update BottomSheetContext.tsx
const contextFile = 'packages/ds/src/primitives/BottomSheet/BottomSheetContext.tsx';
let contextContent = readFileSync(contextFile, 'utf-8');

contextContent = contextContent.replaceAll('SheetProvider', 'BottomSheetProvider');
contextContent = contextContent.replaceAll('SheetUnderlayValue', 'BottomSheetUnderlayValue');
contextContent = contextContent.replaceAll('SheetContext', 'BottomSheetContext');

// Keep old exports as aliases for compat
if (!contextContent.includes('// @deprecated')) {
  contextContent += `
// @deprecated Use BottomSheetProvider
export { BottomSheetProvider as SheetProvider };
// @deprecated Use BottomSheetUnderlayValue
export type { BottomSheetUnderlayValue as SheetUnderlayValue };
`;
}

if (!dryRun) {
  writeFileSync(contextFile, contextContent);
}
updates.push({ file: contextFile, change: 'Renamed Sheet* → BottomSheet* with compat aliases' });

// 3. Update index.ts with deprecation exports
const indexFile = 'packages/ds/src/primitives/BottomSheet/index.ts';
const newIndexContent = `/**
 * @intstudio/ds/primitives/BottomSheet
 * 
 * Capability-aware bottom drawer/sheet component.
 * 
 * @packageDocumentation
 */

// Primary exports
export { BottomSheet } from './BottomSheet';
export type { SheetProps as BottomSheetProps } from './BottomSheet';
export { BottomSheetProvider } from './BottomSheetContext';
export type { BottomSheetUnderlayValue } from './BottomSheetContext';
export { UnderlayEffects } from './UnderlayEffects';
export type { UnderlayEffectsProps } from './UnderlayEffects';
export { DSModalBackdrop } from './DSModalBackdrop';
export type { DSModalBackdropProps, BackdropVariant } from './DSModalBackdrop';
export { dsFlowbiteTheme } from './flowbiteTheme';

// Deprecated aliases (remove in v3.0.0)
/** @deprecated Use BottomSheet */
export { BottomSheet as Sheet } from './BottomSheet';
/** @deprecated Use BottomSheetProps */
export type { SheetProps } from './BottomSheet';
/** @deprecated Use BottomSheetProvider */
export { BottomSheetProvider as SheetProvider } from './BottomSheetContext';
/** @deprecated Use BottomSheetUnderlayValue */
export type { BottomSheetUnderlayValue as SheetUnderlayValue } from './BottomSheetContext';
`;

if (!dryRun) {
  writeFileSync(indexFile, newIndexContent);
}
updates.push({ file: indexFile, change: 'Added BottomSheet exports with Sheet aliases' });

// 4. Update primitives/index.ts
const primitivesIndexFile = 'packages/ds/src/primitives/index.ts';
let primitivesContent = readFileSync(primitivesIndexFile, 'utf-8');

primitivesContent = primitivesContent.replace(
  `export * from './Sheet';`,
  `export * from './BottomSheet';`
);

if (!dryRun) {
  writeFileSync(primitivesIndexFile, primitivesContent);
}
updates.push({ file: primitivesIndexFile, change: 'Updated barrel export' });

// Report
console.log('\n🔄 Rename Sheet → BottomSheet Codemod\n');
console.log(`Mode: ${dryRun ? '🔍 DRY RUN (no changes)' : '✏️  APPLY CHANGES'}\n`);
console.log('Files affected:');
updates.forEach(({ file, change }) => {
  console.log(`  ✓ ${file}`);
  console.log(`    ${change}`);
});

console.log(`\nTotal files: ${updates.length}`);

if (dryRun) {
  console.log('\n➡️  Run without --dry-run to apply changes');
} else {
  console.log('\n✅ Changes applied');
  console.log('\nNext steps:');
  console.log('  1. pnpm barrels');
  console.log('  2. pnpm typecheck');
  console.log('  3. pnpm build');
  console.log('  4. Search codebase for remaining "Sheet" references');
}
