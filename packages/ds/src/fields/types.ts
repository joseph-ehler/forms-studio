/**
 * Field Component Types
 * 
 * Core types for the field registry system with typography control.
 */

import type { Control, FieldErrors } from 'react-hook-form'

export type FieldVariant = 'auto' | 'native' | 'custom'

/**
 * Typography Display Configuration
 * 
 * Controls visibility of typography elements.
 * All default to true (show) for safety.
 */
export type TypographyDisplay = {
  /** Show field label */
  showLabel?: boolean
  /** Show helper text / description */
  showDescription?: boolean
  /** Show error messages */
  showError?: boolean
  /** Show required indicator */
  showRequired?: boolean
  /** Show optional indicator */
  showOptional?: boolean
}

/**
 * Typography Variants
 * 
 * Pre-configured display patterns for common use cases.
 */
export type TypographyVariant = 
  | 'default'    // All visible (label, description, error, required)
  | 'minimal'    // Label + error only
  | 'compact'    // Label only (no description, no required indicator)
  | 'hidden'     // No typography at all (input only)
  | 'error-only' // Only show errors

export type FieldComponentProps = {
  name: string
  label?: string
  description?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  defaultValue?: unknown
  // JSON-specific bits
  json: any // raw field JSON if needed
  control: Control<any>
  errors: FieldErrors
  variant?: FieldVariant
  // Typography display control
  typographyDisplay?: TypographyDisplay
  typographyVariant?: TypographyVariant
}

export type FieldComponent = React.FC<FieldComponentProps>

export type FieldFactory = (json: any) => FieldComponent

export type FieldRegistry = {
  register: (type: string, factory: FieldFactory) => void
  resolve: (type: string) => FieldFactory | undefined
  list: () => string[]
}
