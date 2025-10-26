/**
 * Toggle SKIN Registry
 * 
 * Single source of truth for toggle variant → CSS variable mappings.
 * Consumed by: Toggle.tsx, ESLint validation, tests
 * 
 * Pattern: Map semantic roles to local component variables
 * Result: Universal CSS layer reads only --toggle-* vars
 */

import type { ToggleSkinKeys, SkinRecord } from '../../control/skin-contracts';
import type { ToggleVariant } from '../../control/variants.config';

/**
 * Toggle SKIN map:
 *  - Each variant maps semantic roles → local --toggle-* variables
 *  - Toggle.css only reads --toggle-*; never references tokens/roles directly
 *  - TypeScript enforces completeness (no ESLint rule needed)
 */
export const TOGGLE_SKIN: SkinRecord<ToggleVariant, ToggleSkinKeys> = {
  default: {
    '--toggle-fg': 'var(--ds-role-text)',
    '--toggle-bg': 'var(--ds-role-surface)',
    '--toggle-border': 'var(--ds-neutral-8)',
    '--toggle-hover-border': 'var(--ds-neutral-9)',
    '--toggle-focus-ring': 'var(--ds-state-focus-ring)',
  },
  success: {
    '--toggle-fg': 'var(--ds-role-success-text)',
    '--toggle-bg': 'var(--ds-role-success-bg)',
    '--toggle-border': 'var(--ds-success-8)',
    '--toggle-hover-border': 'var(--ds-success-9)',
    '--toggle-focus-ring': 'color-mix(in oklab, var(--ds-role-success-bg) 40%, transparent)',
  },
  warning: {
    '--toggle-fg': 'var(--ds-role-warning-text)',
    '--toggle-bg': 'var(--ds-role-warning-bg)',
    '--toggle-border': 'var(--ds-warning-8)',
    '--toggle-hover-border': 'var(--ds-warning-9)',
    '--toggle-focus-ring': 'color-mix(in oklab, var(--ds-role-warning-bg) 40%, transparent)',
  },
  danger: {
    '--toggle-fg': 'var(--ds-role-danger-text)',
    '--toggle-bg': 'var(--ds-role-danger-bg)',
    '--toggle-border': 'var(--ds-danger-8)',
    '--toggle-hover-border': 'var(--ds-danger-9)',
    '--toggle-focus-ring': 'color-mix(in oklab, var(--ds-role-danger-bg) 40%, transparent)',
  },
  info: {
    '--toggle-fg': 'var(--ds-role-info-text)',
    '--toggle-bg': 'var(--ds-role-info-bg)',
    '--toggle-border': 'var(--ds-info-8)',
    '--toggle-hover-border': 'var(--ds-info-9)',
    '--toggle-focus-ring': 'color-mix(in oklab, var(--ds-role-info-bg) 40%, transparent)',
  }
};
