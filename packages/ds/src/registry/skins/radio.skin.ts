/**
 * Radio SKIN Registry
 * 
 * Single source of truth for radio variant → CSS variable mappings.
 * Consumed by: Radio.tsx, ESLint validation, tests
 * 
 * Pattern: Map semantic roles to local component variables
 * Result: Universal CSS layer reads only --radio-* vars
 */

import type { RadioSkinKeys, SkinRecord } from '../../control/skin-contracts';
import type { RadioVariant } from '../../control/variants.config';

/**
 * Radio SKIN map:
 *  - Each variant maps semantic roles → local --radio-* variables
 *  - Radio.css only reads --radio-*; never references tokens/roles directly
 *  - TypeScript enforces completeness (no ESLint rule needed)
 */
export const RADIO_SKIN: SkinRecord<RadioVariant, RadioSkinKeys> = {
  default: {
    '--radio-fg': 'var(--ds-role-text)',
    '--radio-bg': 'var(--ds-role-surface)',
    '--radio-border': 'var(--ds-neutral-8)',
    '--radio-hover-border': 'var(--ds-neutral-9)',
    '--radio-focus-ring': 'var(--ds-state-focus-ring)',
  },
  success: {
    '--radio-fg': 'var(--ds-role-success-text)',
    '--radio-bg': 'var(--ds-role-success-bg)',
    '--radio-border': 'var(--ds-success-8)',
    '--radio-hover-border': 'var(--ds-success-9)',
    '--radio-focus-ring': 'color-mix(in oklab, var(--ds-role-success-bg) 40%, transparent)',
  },
  warning: {
    '--radio-fg': 'var(--ds-role-warning-text)',
    '--radio-bg': 'var(--ds-role-warning-bg)',
    '--radio-border': 'var(--ds-warning-8)',
    '--radio-hover-border': 'var(--ds-warning-9)',
    '--radio-focus-ring': 'color-mix(in oklab, var(--ds-role-warning-bg) 40%, transparent)',
  },
  danger: {
    '--radio-fg': 'var(--ds-role-danger-text)',
    '--radio-bg': 'var(--ds-role-danger-bg)',
    '--radio-border': 'var(--ds-danger-8)',
    '--radio-hover-border': 'var(--ds-danger-9)',
    '--radio-focus-ring': 'color-mix(in oklab, var(--ds-role-danger-bg) 40%, transparent)',
  },
  info: {
    '--radio-fg': 'var(--ds-role-info-text)',
    '--radio-bg': 'var(--ds-role-info-bg)',
    '--radio-border': 'var(--ds-info-8)',
    '--radio-hover-border': 'var(--ds-info-9)',
    '--radio-focus-ring': 'color-mix(in oklab, var(--ds-role-info-bg) 40%, transparent)',
  }
};
