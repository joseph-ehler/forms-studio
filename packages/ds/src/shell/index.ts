/**
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
