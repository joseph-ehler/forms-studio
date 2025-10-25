/**
 * Button SKIN Registry
 * 
 * Single source of truth for button variant → CSS variable mappings.
 * Consumed by: Button.tsx, ESLint validation, tests
 * 
 * Pattern: Map semantic roles to local component variables
 * Result: Universal CSS layer reads only --btn-* vars
 */

import type { ButtonSkinKeys, SkinRecord } from '../../control/skin-contracts';
import type { ButtonVariant } from '../../control/variants.config';

/**
 * Button SKIN map:
 *  - Each variant maps semantic roles → local --btn-* variables
 *  - Button.css only reads --btn-*; never references tokens/roles directly
 *  - TypeScript enforces completeness (no ESLint rule needed)
 */
export const BUTTON_SKIN: SkinRecord<ButtonVariant, ButtonSkinKeys> = {
  primary: {
    '--btn-fg': 'var(--ds-role-primary-text)',
    '--btn-bg': 'var(--ds-role-primary-bg)',
    '--btn-hover-bg': 'var(--ds-role-primary-hover)',
    '--btn-active-bg': 'var(--ds-role-primary-active)',
  },
  secondary: {
    '--btn-fg': 'var(--ds-role-text)',
    '--btn-bg': 'transparent',
    '--btn-hover-bg': 'var(--ds-state-hover-bg)',
    '--btn-active-bg': 'var(--ds-state-active-bg)',
  },
  ghost: {
    '--btn-fg': 'var(--ds-role-text)',
    '--btn-bg': 'transparent',
    '--btn-hover-bg': 'var(--ds-state-hover-bg)',
    '--btn-active-bg': 'var(--ds-state-active-bg)',
  },
  success: {
    '--btn-fg': 'var(--ds-role-success-text)',
    '--btn-bg': 'var(--ds-role-success-bg)',
    '--btn-hover-bg': 'var(--ds-role-success-hover)',
    '--btn-active-bg': 'var(--ds-role-success-active)',
  },
  warning: {
    '--btn-fg': 'var(--ds-role-warning-text)',
    '--btn-bg': 'var(--ds-role-warning-bg)',
    '--btn-hover-bg': 'var(--ds-role-warning-hover)',
    '--btn-active-bg': 'var(--ds-role-warning-active)',
  },
  danger: {
    '--btn-fg': 'var(--ds-role-danger-text)',
    '--btn-bg': 'var(--ds-role-danger-bg)',
    '--btn-hover-bg': 'var(--ds-role-danger-hover)',
    '--btn-active-bg': 'var(--ds-role-danger-active)',
  },
  info: {
    '--btn-fg': 'var(--ds-role-info-text)',
    '--btn-bg': 'var(--ds-role-info-bg)',
    '--btn-hover-bg': 'var(--ds-role-info-hover)',
    '--btn-active-bg': 'var(--ds-role-info-active)',
  },
};
