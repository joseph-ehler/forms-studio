/**
 * Shell Core - Environment Layer (Layer 3)
 * 
 * Single source of truth for device capabilities, breakpoints, and density.
 * Provides deterministic testing overrides for Storybook/Playwright.
 */

export * from './useAppEnvironment';
export * from './useDeviceType';
export * from './useTheme';
export * from './setShellEnvironment';
export * from './useHaptics';
