/**
 * Badge SKIN Registry
 * 
 * Single source of truth for badge variant → CSS variable mappings.
 * Consumed by: Badge.tsx, ESLint validation, tests
 * 
 * Pattern: Map semantic roles to local component variables
 * Result: Universal CSS layer reads only --badge-* vars
 */

import type { BadgeSkinKeys, SkinRecord } from '../../control/skin-contracts';
import type { BadgeVariant } from '../../control/variants.config';

/**
 * Badge SKIN map:
 *  - Each variant maps semantic roles → local --badge-* variables
 *  - Badge.css only reads --badge-*; never references tokens/roles directly
 *  - TypeScript enforces completeness (no ESLint rule needed)
 */
export const BADGE_SKIN: SkinRecord<BadgeVariant, BadgeSkinKeys> = {
  default: {
    '--badge-fg': 'var(--ds-role-text)',
    '--badge-bg': 'var(--ds-role-surface)',
    '--badge-border': 'var(--ds-neutral-8)',
    '--badge-hover-border': 'var(--ds-neutral-9)',
    '--badge-focus-ring': 'var(--ds-state-focus-ring)',
  },
  success: {
    '--badge-fg': 'var(--ds-role-success-text)',
    '--badge-bg': 'var(--ds-role-success-bg)',
    '--badge-border': 'var(--ds-success-8)',
    '--badge-hover-border': 'var(--ds-success-9)',
    '--badge-focus-ring': 'color-mix(in oklab, var(--ds-role-success-bg) 40%, transparent)',
  },
  warning: {
    '--badge-fg': 'var(--ds-role-warning-text)',
    '--badge-bg': 'var(--ds-role-warning-bg)',
    '--badge-border': 'var(--ds-warning-8)',
    '--badge-hover-border': 'var(--ds-warning-9)',
    '--badge-focus-ring': 'color-mix(in oklab, var(--ds-role-warning-bg) 40%, transparent)',
  },
  danger: {
    '--badge-fg': 'var(--ds-role-danger-text)',
    '--badge-bg': 'var(--ds-role-danger-bg)',
    '--badge-border': 'var(--ds-danger-8)',
    '--badge-hover-border': 'var(--ds-danger-9)',
    '--badge-focus-ring': 'color-mix(in oklab, var(--ds-role-danger-bg) 40%, transparent)',
  },
  info: {
    '--badge-fg': 'var(--ds-role-info-text)',
    '--badge-bg': 'var(--ds-role-info-bg)',
    '--badge-border': 'var(--ds-info-8)',
    '--badge-hover-border': 'var(--ds-info-9)',
    '--badge-focus-ring': 'color-mix(in oklab, var(--ds-role-info-bg) 40%, transparent)',
  }
};
