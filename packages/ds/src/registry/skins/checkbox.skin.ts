/**
 * Checkbox SKIN Registry
 * 
 * Single source of truth for checkbox variant → CSS variable mappings.
 * Consumed by: Checkbox.tsx, ESLint validation, tests
 * 
 * Pattern: Map semantic roles to local component variables
 * Result: Universal CSS layer reads only --checkbox-* vars
 */

import type { CheckboxSkinKeys, SkinRecord } from '../../control/skin-contracts';
import type { CheckboxVariant } from '../../control/variants.config';

/**
 * Checkbox SKIN map:
 *  - Each variant maps semantic roles → local --checkbox-* variables
 *  - Checkbox.css only reads --checkbox-*; never references tokens/roles directly
 *  - TypeScript enforces completeness (no ESLint rule needed)
 */
export const CHECKBOX_SKIN: SkinRecord<CheckboxVariant, CheckboxSkinKeys> = {
  default: {
    '--checkbox-fg': 'var(--ds-role-text)',
    '--checkbox-bg': 'var(--ds-role-surface)',
    '--checkbox-border': 'var(--ds-neutral-8)',
    '--checkbox-hover-border': 'var(--ds-neutral-9)',
    '--checkbox-focus-ring': 'var(--ds-state-focus-ring)',
  },
  success: {
    '--checkbox-fg': 'var(--ds-role-success-text)',
    '--checkbox-bg': 'var(--ds-role-success-bg)',
    '--checkbox-border': 'var(--ds-success-8)',
    '--checkbox-hover-border': 'var(--ds-success-9)',
    '--checkbox-focus-ring': 'color-mix(in oklab, var(--ds-role-success-bg) 40%, transparent)',
  },
  warning: {
    '--checkbox-fg': 'var(--ds-role-warning-text)',
    '--checkbox-bg': 'var(--ds-role-warning-bg)',
    '--checkbox-border': 'var(--ds-warning-8)',
    '--checkbox-hover-border': 'var(--ds-warning-9)',
    '--checkbox-focus-ring': 'color-mix(in oklab, var(--ds-role-warning-bg) 40%, transparent)',
  },
  danger: {
    '--checkbox-fg': 'var(--ds-role-danger-text)',
    '--checkbox-bg': 'var(--ds-role-danger-bg)',
    '--checkbox-border': 'var(--ds-danger-8)',
    '--checkbox-hover-border': 'var(--ds-danger-9)',
    '--checkbox-focus-ring': 'color-mix(in oklab, var(--ds-role-danger-bg) 40%, transparent)',
  },
  info: {
    '--checkbox-fg': 'var(--ds-role-info-text)',
    '--checkbox-bg': 'var(--ds-role-info-bg)',
    '--checkbox-border': 'var(--ds-info-8)',
    '--checkbox-hover-border': 'var(--ds-info-9)',
    '--checkbox-focus-ring': 'color-mix(in oklab, var(--ds-role-info-bg) 40%, transparent)',
  }
};
