/**
 * Design System Variants Registry
 * 
 * Single source of truth for component variants.
 * Adding a variant here auto-propagates to:
 * - TypeScript types
 * - ESLint validation
 * - Storybook matrix tests
 * - Documentation
 */

export const variants = {
  button: [
    'primary',
    'secondary',
    'ghost',
    'success',
    'warning',
    'danger',
    'info',
  ] as const,
  
  input: [
    'default',
    'success',
    'warning',
    'danger',
    'info',
  ] as const,
  
  textarea: [
    'default',
    'success',
    'warning',
    'danger',
    'info',
  ] as const,
  
  checkbox: [
    'default',
    'success',
    'warning',
    'danger',
    'info',
  ] as const,
  
  radio: [
    'default',
    'success',
    'warning',
    'danger',
    'info',
  ] as const,
  
  toggle: [
    'default',
    'success',
    'warning',
    'danger',
    'info',
  ] as const,
  
  badge: [
    'default',
    'success',
    'warning',
    'danger',
    'info',
  ] as const,
  
  // Add more components as they're built
  // select: ['default', 'success', 'warning', 'danger', 'info'] as const,
} as const;

// Auto-generated types from registry
export type ButtonVariant = typeof variants.button[number];
export type InputVariant = typeof variants.input[number];
export type TextareaVariant = typeof variants.textarea[number];
export type CheckboxVariant = typeof variants.checkbox[number];
export type RadioVariant = typeof variants.radio[number];
export type ToggleVariant = typeof variants.toggle[number];
export type BadgeVariant = typeof variants.badge[number];
// export type SelectVariant = typeof variants.select[number];

/**
 * Component variant metadata
 * Optional - provides additional context for generators/docs
 */
export const variantMeta = {
  button: {
    semantic: ['success', 'warning', 'danger', 'info'],
    neutral: ['primary', 'secondary', 'ghost'],
    default: 'primary',
  },
} as const;
