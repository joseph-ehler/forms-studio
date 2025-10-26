/**
 * Textarea SKIN Registry
 * 
 * Single source of truth for textarea variant → CSS variable mappings.
 * Consumed by: Textarea.tsx, ESLint validation, tests
 * 
 * Pattern: Map semantic roles to local component variables
 * Result: Universal CSS layer reads only --textarea-* vars
 */

import type { TextareaSkinKeys, SkinRecord } from '../../control/skin-contracts';
import type { TextareaVariant } from '../../control/variants.config';

/**
 * Textarea SKIN map:
 *  - Each variant maps semantic roles → local --textarea-* variables
 *  - Textarea.css only reads --textarea-*; never references tokens/roles directly
 *  - TypeScript enforces completeness (no ESLint rule needed)
 */
export const TEXTAREA_SKIN: SkinRecord<TextareaVariant, TextareaSkinKeys> = {
  default: {
    '--textarea-fg': 'var(--ds-role-text)',
    '--textarea-bg': 'var(--ds-role-surface)',
    '--textarea-border': 'var(--ds-neutral-8)',
    '--textarea-hover-border': 'var(--ds-neutral-9)',
    '--textarea-focus-ring': 'var(--ds-state-focus-ring)',
  },
  success: {
    '--textarea-fg': 'var(--ds-role-success-text)',
    '--textarea-bg': 'var(--ds-role-success-bg)',
    '--textarea-border': 'var(--ds-success-8)',
    '--textarea-hover-border': 'var(--ds-success-9)',
    '--textarea-focus-ring': 'color-mix(in oklab, var(--ds-role-success-bg) 40%, transparent)',
  },
  warning: {
    '--textarea-fg': 'var(--ds-role-warning-text)',
    '--textarea-bg': 'var(--ds-role-warning-bg)',
    '--textarea-border': 'var(--ds-warning-8)',
    '--textarea-hover-border': 'var(--ds-warning-9)',
    '--textarea-focus-ring': 'color-mix(in oklab, var(--ds-role-warning-bg) 40%, transparent)',
  },
  danger: {
    '--textarea-fg': 'var(--ds-role-danger-text)',
    '--textarea-bg': 'var(--ds-role-danger-bg)',
    '--textarea-border': 'var(--ds-danger-8)',
    '--textarea-hover-border': 'var(--ds-danger-9)',
    '--textarea-focus-ring': 'color-mix(in oklab, var(--ds-role-danger-bg) 40%, transparent)',
  },
  info: {
    '--textarea-fg': 'var(--ds-role-info-text)',
    '--textarea-bg': 'var(--ds-role-info-bg)',
    '--textarea-border': 'var(--ds-info-8)',
    '--textarea-hover-border': 'var(--ds-info-9)',
    '--textarea-focus-ring': 'color-mix(in oklab, var(--ds-role-info-bg) 40%, transparent)',
  }
};
