import type { CSSProperties } from 'react';

import type { InputVariant } from '../../control/variants.config';

/**
 * Input SKIN map:
 *  - Each variant maps semantic roles → local --input-* variables
 *  - Input.css only reads --input-*; never references tokens/roles directly
 */
export const INPUT_SKIN: Record<InputVariant, CSSProperties> = {
  default: {
    ['--input-fg' as any]: 'var(--ds-role-text)',
    ['--input-bg' as any]: 'var(--ds-role-surface)',
    ['--input-placeholder' as any]: 'var(--ds-neutral-8)',
    ['--input-border' as any]: 'var(--ds-role-border)',
    // TEMPORARILY REMOVED FOR TEST: ['--input-hover-border' as any]: 'var(--ds-neutral-7)',
    ['--input-focus-ring' as any]: 'var(--ds-state-focus-ring)',
    ['--input-disabled-fg' as any]: 'color-mix(in oklab, var(--ds-role-text) 50%, transparent)',
    ['--input-disabled-bg' as any]: 'color-mix(in oklab, var(--ds-role-text) 5%, transparent)',
    ['--input-disabled-border' as any]: 'var(--ds-neutral-5)',
    ['--input-invalid-border' as any]: 'var(--ds-role-danger-bg)'
  },

  success: {
    ['--input-fg' as any]: 'var(--ds-role-text)',
    ['--input-bg' as any]: 'var(--ds-role-surface)',
    ['--input-placeholder' as any]: 'var(--ds-neutral-8)',
    ['--input-border' as any]: 'var(--ds-success-7)',
    ['--input-hover-border' as any]: 'var(--ds-success-8)',
    ['--input-focus-ring' as any]: 'color-mix(in oklab, var(--ds-role-success-bg) 45%, transparent)',
    ['--input-disabled-fg' as any]: 'color-mix(in oklab, var(--ds-role-text) 50%, transparent)',
    ['--input-disabled-bg' as any]: 'color-mix(in oklab, var(--ds-role-text) 5%, transparent)',
    ['--input-disabled-border' as any]: 'var(--ds-neutral-5)',
    ['--input-invalid-border' as any]: 'var(--ds-role-danger-bg)'
  },

  warning: {
    ['--input-fg' as any]: 'var(--ds-role-text)',
    ['--input-bg' as any]: 'var(--ds-role-surface)',
    ['--input-placeholder' as any]: 'var(--ds-neutral-8)',
    ['--input-border' as any]: 'var(--ds-warning-7)',
    ['--input-hover-border' as any]: 'var(--ds-warning-8)',
    ['--input-focus-ring' as any]: 'color-mix(in oklab, var(--ds-role-warning-bg) 45%, transparent)',
    ['--input-disabled-fg' as any]: 'color-mix(in oklab, var(--ds-role-text) 50%, transparent)',
    ['--input-disabled-bg' as any]: 'color-mix(in oklab, var(--ds-role-text) 5%, transparent)',
    ['--input-disabled-border' as any]: 'var(--ds-neutral-5)',
    ['--input-invalid-border' as any]: 'var(--ds-role-danger-bg)'
  },

  danger: {
    ['--input-fg' as any]: 'var(--ds-role-text)',
    ['--input-bg' as any]: 'var(--ds-role-surface)',
    ['--input-placeholder' as any]: 'var(--ds-neutral-8)',
    ['--input-border' as any]: 'var(--ds-danger-7)',
    ['--input-hover-border' as any]: 'var(--ds-danger-8)',
    ['--input-focus-ring' as any]: 'color-mix(in oklab, var(--ds-role-danger-bg) 45%, transparent)',
    ['--input-disabled-fg' as any]: 'color-mix(in oklab, var(--ds-role-text) 50%, transparent)',
    ['--input-disabled-bg' as any]: 'color-mix(in oklab, var(--ds-role-text) 5%, transparent)',
    ['--input-disabled-border' as any]: 'var(--ds-neutral-5)',
    ['--input-invalid-border' as any]: 'var(--ds-role-danger-bg)'
  },

  info: {
    ['--input-fg' as any]: 'var(--ds-role-text)',
    ['--input-bg' as any]: 'var(--ds-role-surface)',
    ['--input-placeholder' as any]: 'var(--ds-neutral-8)',
    ['--input-border' as any]: 'var(--ds-info-7)',
    ['--input-hover-border' as any]: 'var(--ds-info-8)',
    ['--input-focus-ring' as any]: 'color-mix(in oklab, var(--ds-role-info-bg) 45%, transparent)',
    ['--input-disabled-fg' as any]: 'color-mix(in oklab, var(--ds-role-text) 50%, transparent)',
    ['--input-disabled-bg' as any]: 'color-mix(in oklab, var(--ds-role-text) 5%, transparent)',
    ['--input-disabled-border' as any]: 'var(--ds-neutral-5)',
    ['--input-invalid-border' as any]: 'var(--ds-role-danger-bg)'
  }
} as const;
