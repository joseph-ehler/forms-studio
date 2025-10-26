#!/usr/bin/env node
/**
 * Codemod: Restructure Shell Directories (Macro/Meso/Micro)
 * 
 * Description: Organizes shells by tier for clearer mental model
 * Usage: node scripts/codemods/restructure-shell-dirs.mjs [--dry-run]
 * Risk: MEDIUM (many file moves, import updates needed)
 * Rollback: git restore packages/ds/src/shell/
 */

import { parseArgs } from 'util';
import { mkdirSync, readFileSync, writeFileSync, renameSync, existsSync } from 'fs';
import { dirname, join } from 'path';

const { values } = parseArgs({
  options: {
    'dry-run': { type: 'boolean', default: false }
  }
});

const dryRun = values['dry-run'];
const basePath = 'packages/ds/src/shell';

// Migration plan
const moves = [
  // Core utilities
  { from: `${basePath}/useAppEnvironment.ts`, to: `${basePath}/core/useAppEnvironment.ts` },
  { from: `${basePath}/usePanels.tsx`, to: `${basePath}/core/usePanels.tsx` },
  
  // Macro shells (app-level)
  { from: `${basePath}/AppShell.tsx`, to: `${basePath}/macro/AppShell/AppShell.tsx` },
  { from: `${basePath}/AppShell.css`, to: `${basePath}/macro/AppShell/AppShell.css` },
  { from: `${basePath}/PageShell.tsx`, to: `${basePath}/macro/PageShell/PageShell.tsx` },
  { from: `${basePath}/PageShell.css`, to: `${basePath}/macro/PageShell/PageShell.css` },
  { from: `${basePath}/NavShell.tsx`, to: `${basePath}/macro/NavShell/NavShell.tsx` },
  { from: `${basePath}/NavShell.css`, to: `${basePath}/macro/NavShell/NavShell.css` },
  
  // Note: recipes/ stays in place for now
];

// Import updates needed
const importUpdates = [
  // In macro shells, update imports from '../' to '../../core/'
  {
    file: `${basePath}/macro/AppShell/AppShell.tsx`,
    changes: [
      { from: `from './useAppEnvironment'`, to: `from '../../core/useAppEnvironment'` },
      { from: `from './usePanels'`, to: `from '../../core/usePanels'` },
    ]
  },
  {
    file: `${basePath}/macro/PageShell/PageShell.tsx`,
    changes: [
      { from: `from './useAppEnvironment'`, to: `from '../../core/useAppEnvironment'` },
    ]
  },
  {
    file: `${basePath}/macro/NavShell/NavShell.tsx`,
    changes: [
      { from: `from './AppShell'`, to: `from '../AppShell/AppShell'` },
      { from: `from './useAppEnvironment'`, to: `from '../../core/useAppEnvironment'` },
    ]
  },
  
  // Recipes need to update paths
  {
    file: `${basePath}/recipes/DashboardShell.tsx`,
    changes: [
      { from: `from '../AppShell'`, to: `from '../macro/AppShell/AppShell'` },
    ]
  },
  {
    file: `${basePath}/recipes/WorkbenchShell.tsx`,
    changes: [
      { from: `from '../AppShell'`, to: `from '../macro/AppShell/AppShell'` },
    ]
  },
];

console.log('\n🔄 Restructure Shell Directories\n');
console.log(`Mode: ${dryRun ? '🔍 DRY RUN (no changes)' : '✏️  APPLY CHANGES'}\n`);

// Phase 1: Create directories
const dirsToCreate = [
  `${basePath}/core`,
  `${basePath}/macro/AppShell`,
  `${basePath}/macro/PageShell`,
  `${basePath}/macro/NavShell`,
  `${basePath}/meso`,
  `${basePath}/micro`,
];

console.log('📁 Creating directories:');
dirsToCreate.forEach(dir => {
  console.log(`  • ${dir}`);
  if (!dryRun && !existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

// Phase 2: Move files
console.log('\n📦 Moving files:');
moves.forEach(({ from, to }) => {
  console.log(`  ${from}`);
  console.log(`    → ${to}`);
  
  if (!dryRun && existsSync(from)) {
    const toDir = dirname(to);
    if (!existsSync(toDir)) {
      mkdirSync(toDir, { recursive: true });
    }
    renameSync(from, to);
  }
});

// Phase 3: Update imports
console.log('\n🔧 Updating imports:');
importUpdates.forEach(({ file, changes }) => {
  if (!existsSync(file)) {
    console.log(`  ⚠️  ${file} not found (will exist after moves)`);
    return;
  }
  
  let content = readFileSync(file, 'utf-8');
  let updated = false;
  
  changes.forEach(({ from, to }) => {
    if (content.includes(from)) {
      content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
      updated = true;
      console.log(`  ✓ ${file}`);
      console.log(`      ${from} → ${to}`);
    }
  });
  
  if (updated && !dryRun) {
    writeFileSync(file, content);
  }
});

// Phase 4: Create index files for new structure
const indexFiles = [
  {
    path: `${basePath}/core/index.ts`,
    content: `/**
 * Shell Core - Shared hooks and utilities
 */

export { useAppEnvironment } from './useAppEnvironment';
export type {
  AppEnvironment,
  ShellMode,
  PointerType,
  DensityLevel,
  Breakpoints,
} from './useAppEnvironment';

export { usePanels, PanelsProvider } from './usePanels';
export type { PanelId, PanelState, PanelsContextValue } from './usePanels';
`
  },
  {
    path: `${basePath}/macro/AppShell/index.ts`,
    content: `/**
 * AppShell - Global layout OS
 */

export { AppShell, useNav } from './AppShell';
export type {
  AppShellProps,
  NavConfig,
  PanelsConfig,
  DockConfig,
  HeaderConfig,
  LayoutState,
} from './AppShell';
`
  },
  {
    path: `${basePath}/macro/PageShell/index.ts`,
    content: `/**
 * PageShell - Page-level structure
 */

export { PageShell, usePageShell } from './PageShell';
export type { PageShellProps, PageLayoutState } from './PageShell';
`
  },
  {
    path: `${basePath}/macro/NavShell/index.ts`,
    content: `/**
 * NavShell - Navigation coordinator
 */

export { NavShell } from './NavShell';
export type { NavShellProps } from './NavShell';
`
  },
  {
    path: `${basePath}/macro/index.ts`,
    content: `/**
 * Macro Shells - App-level structure
 */

export * from './AppShell';
export * from './PageShell';
export * from './NavShell';
`
  },
  {
    path: `${basePath}/meso/index.ts`,
    content: `/**
 * Meso Shells - Workspace patterns
 * 
 * Future: WorkbenchShell, CanvasShell, DataShell
 */

// Empty for now - shells will be added here
`
  },
  {
    path: `${basePath}/micro/index.ts`,
    content: `/**
 * Micro Shells - Overlays & HUD
 * 
 * Future: ModalShell, DrawerShell, PopoverShell, TooltipShell, etc.
 */

// Empty for now - shells will be added here
`
  },
];

console.log('\n📝 Creating index files:');
indexFiles.forEach(({ path, content }) => {
  console.log(`  • ${path}`);
  if (!dryRun) {
    const dir = dirname(path);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(path, content);
  }
});

// Phase 5: Update main shell barrel
const mainBarrelPath = `${basePath}/index.ts`;
const newMainBarrel = `/**
 * @intstudio/ds/shell
 * 
 * Shell System - "Frames, not skins"
 * 
 * Organized by tier:
 * - core/   → Shared hooks/utils
 * - macro/  → App-level structure (AppShell, PageShell, NavShell)
 * - meso/   → Workspace patterns (future)
 * - micro/  → Overlays & HUD (future)
 * - recipes → High-level compositions
 */

// Core (shared utilities)
export * from './core';

// Macro shells (app-level)
export * from './macro';

// Meso shells (workspace patterns)
export * from './meso';

// Micro shells (overlays & HUD)
export * from './micro';

// Recipes (high-level compositions)
export { DashboardShell } from './recipes/DashboardShell';
export type { DashboardShellProps } from './recipes/DashboardShell';

export { WorkbenchShell } from './recipes/WorkbenchShell';
export type { WorkbenchShellProps } from './recipes/WorkbenchShell';
`;

console.log('\n📄 Updating main barrel:');
console.log(`  • ${mainBarrelPath}`);
if (!dryRun) {
  writeFileSync(mainBarrelPath, newMainBarrel);
}

console.log(`\nTotal moves: ${moves.length}`);
console.log(`Total import updates: ${importUpdates.length}`);
console.log(`Total index files: ${indexFiles.length}`);

if (dryRun) {
  console.log('\n➡️  Run without --dry-run to apply changes');
} else {
  console.log('\n✅ Restructure complete');
  console.log('\nNext steps:');
  console.log('  1. pnpm barrels (regenerate all barrels)');
  console.log('  2. pnpm typecheck');
  console.log('  3. pnpm build');
  console.log('  4. Verify all imports resolve');
  console.log('\nNote: This is NOT a breaking change - all exports remain accessible');
  console.log('from @intstudio/ds/shell (barrel re-exports everything)');
}
