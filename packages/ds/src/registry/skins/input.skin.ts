import type { InputSkinKeys, SkinRecord } from '../../control/skin-contracts';
import type { InputVariant } from '../../control/variants.config';

/**
 * Input SKIN map:
 *  - Each variant maps semantic roles → local --input-* variables
 *  - Input.css only reads --input-*; never references tokens/roles directly
 *  - TypeScript enforces completeness (no ESLint rule needed)
 */
export const INPUT_SKIN: SkinRecord<InputVariant, InputSkinKeys> = {
  default: {
    '--input-fg': 'var(--ds-role-text)',
    '--input-bg': 'var(--ds-role-surface)',
    '--input-placeholder': 'var(--ds-neutral-8)',
    '--input-border': 'var(--ds-role-border)',
    '--input-hover-border': 'var(--ds-neutral-7)',
    '--input-focus-ring': 'var(--ds-state-focus-ring)',
    '--input-disabled-fg': 'color-mix(in oklab, var(--ds-role-text) 50%, transparent)',
    '--input-disabled-bg': 'color-mix(in oklab, var(--ds-role-text) 5%, transparent)',
    '--input-disabled-border': 'var(--ds-neutral-5)',
    '--input-invalid-border': 'var(--ds-role-danger-bg)'
  },

  success: {
    '--input-fg': 'var(--ds-role-text)',
    '--input-bg': 'var(--ds-role-surface)',
    '--input-placeholder': 'var(--ds-neutral-8)',
    '--input-border': 'var(--ds-success-7)',
    '--input-hover-border': 'var(--ds-success-8)',
    '--input-focus-ring': 'color-mix(in oklab, var(--ds-role-success-bg) 45%, transparent)',
    '--input-disabled-fg': 'color-mix(in oklab, var(--ds-role-text) 50%, transparent)',
    '--input-disabled-bg': 'color-mix(in oklab, var(--ds-role-text) 5%, transparent)',
    '--input-disabled-border': 'var(--ds-neutral-5)',
    '--input-invalid-border': 'var(--ds-role-danger-bg)'
  },

  warning: {
    '--input-fg': 'var(--ds-role-text)',
    '--input-bg': 'var(--ds-role-surface)',
    '--input-placeholder': 'var(--ds-neutral-8)',
    '--input-border': 'var(--ds-warning-7)',
    '--input-hover-border': 'var(--ds-warning-8)',
    '--input-focus-ring': 'color-mix(in oklab, var(--ds-role-warning-bg) 45%, transparent)',
    '--input-disabled-fg': 'color-mix(in oklab, var(--ds-role-text) 50%, transparent)',
    '--input-disabled-bg': 'color-mix(in oklab, var(--ds-role-text) 5%, transparent)',
    '--input-disabled-border': 'var(--ds-neutral-5)',
    '--input-invalid-border': 'var(--ds-role-danger-bg)'
  },

  danger: {
    '--input-fg': 'var(--ds-role-text)',
    '--input-bg': 'var(--ds-role-surface)',
    '--input-placeholder': 'var(--ds-neutral-8)',
    '--input-border': 'var(--ds-danger-7)',
    '--input-hover-border': 'var(--ds-danger-8)',
    '--input-focus-ring': 'color-mix(in oklab, var(--ds-role-danger-bg) 45%, transparent)',
    '--input-disabled-fg': 'color-mix(in oklab, var(--ds-role-text) 50%, transparent)',
    '--input-disabled-bg': 'color-mix(in oklab, var(--ds-role-text) 5%, transparent)',
    '--input-disabled-border': 'var(--ds-neutral-5)',
    '--input-invalid-border': 'var(--ds-role-danger-bg)'
  },

  info: {
    '--input-fg': 'var(--ds-role-text)',
    '--input-bg': 'var(--ds-role-surface)',
    '--input-placeholder': 'var(--ds-neutral-8)',
    '--input-border': 'var(--ds-info-7)',
    '--input-hover-border': 'var(--ds-info-8)',
    '--input-focus-ring': 'color-mix(in oklab, var(--ds-role-info-bg) 45%, transparent)',
    '--input-disabled-fg': 'color-mix(in oklab, var(--ds-role-text) 50%, transparent)',
    '--input-disabled-bg': 'color-mix(in oklab, var(--ds-role-text) 5%, transparent)',
    '--input-disabled-border': 'var(--ds-neutral-5)',
    '--input-invalid-border': 'var(--ds-role-danger-bg)'
  }
} as const;
