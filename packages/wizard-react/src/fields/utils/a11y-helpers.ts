/**
 * Accessibility Helpers
 * 
 * Single source of truth for ARIA attributes across all fields.
 * Mobile-first, screen-reader friendly, WCAG 2.1 AA compliant.
 */

import type { FieldErrors } from 'react-hook-form'

export interface A11yConfig {
  name: string
  label?: string
  description?: string
  required?: boolean
  disabled?: boolean
  errors?: FieldErrors
  ariaLabel?: string
  ariaDescribedBy?: string
  ariaLabelledBy?: string
}

export interface AriaProps {
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-required'?: boolean
  'aria-invalid'?: boolean
  'aria-disabled'?: boolean
  'aria-live'?: 'polite' | 'assertive' | 'off'
  'aria-atomic'?: boolean
  id?: string
}

/**
 * Generate complete ARIA props for any field
 * 
 * Priority:
 * 1. Explicit ariaLabel/ariaLabelledBy in config
 * 2. Label element (via labelledby)
 * 3. Fallback to label text as aria-label
 * 
 * @example
 * <input {...getAriaProps('email', config, errors)} />
 */
export function getAriaProps(
  name: string,
  config: A11yConfig,
  errors?: FieldErrors
): AriaProps {
  const hasError = !!(errors?.[name])
  const hasDescription = !!config.description
  
  // Build describedby chain
  const describedByParts: string[] = []
  if (hasDescription) describedByParts.push(`${name}-description`)
  if (hasError) describedByParts.push(`${name}-error`)
  
  const props: AriaProps = {
    id: name,
    'aria-required': config.required ?? undefined,
    'aria-invalid': hasError,
    'aria-disabled': config.disabled ?? undefined,
  }
  
  // Label strategy (prefer labelledby for better SR experience)
  if (config.ariaLabelledBy) {
    props['aria-labelledby'] = config.ariaLabelledBy
  } else if (config.ariaLabel) {
    props['aria-label'] = config.ariaLabel
  } else if (config.label) {
    // Point to the <FormLabel> element
    props['aria-labelledby'] = `${name}-label`
  }
  
  // Description chain
  if (describedByParts.length > 0) {
    props['aria-describedby'] = describedByParts.join(' ')
  }
  
  // Live region for errors (polite = don't interrupt)
  if (hasError) {
    props['aria-live'] = 'polite'
    props['aria-atomic'] = true
  }
  
  return props
}

/**
 * Generate props for the label element
 * 
 * @example
 * <FormLabel {...getLabelProps('email', config)}>Email</FormLabel>
 */
export function getLabelProps(name: string, config: A11yConfig) {
  return {
    id: `${name}-label`,
    htmlFor: name,
  }
}

/**
 * Generate props for description/helper text
 * 
 * @example
 * <FormHelperText {...getDescriptionProps('email', config)}>...</FormHelperText>
 */
export function getDescriptionProps(name: string, config: A11yConfig) {
  return {
    id: `${name}-description`,
    role: 'note',
  }
}

/**
 * Generate props for error message
 * 
 * @example
 * <FormErrorMessage {...getErrorProps('email', config)}>...</FormErrorMessage>
 */
export function getErrorProps(name: string, config: A11yConfig) {
  return {
    id: `${name}-error`,
    role: 'alert',
    'aria-live': 'polite' as const,
  }
}

/**
 * Touch target helpers (44x44 minimum per iOS HIG)
 */
export const TOUCH_TARGET = {
  sm: 'min-h-[44px] min-w-[44px]', // Mobile minimum
  md: 'min-h-[48px] min-w-[48px]', // Comfortable
  lg: 'min-h-[60px] min-w-[60px]', // Large/senior-friendly
} as const

/**
 * Input mode helpers for mobile keyboards
 */
export function getInputMode(type?: string): 'text' | 'email' | 'tel' | 'url' | 'numeric' | 'decimal' | 'search' {
  switch (type) {
    case 'email': return 'email'
    case 'tel': return 'tel'
    case 'url': return 'url'
    case 'number': return 'numeric'
    case 'search': return 'search'
    default: return 'text'
  }
}

/**
 * Enter key hint for mobile keyboards
 */
export function getEnterKeyHint(type?: string): 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send' {
  switch (type) {
    case 'search': return 'search'
    case 'email': return 'send'
    case 'url': return 'go'
    default: return 'done'
  }
}

/**
 * Autocomplete hints
 */
export function getAutocomplete(fieldName: string, type?: string): string | undefined {
  // Common patterns
  if (fieldName.includes('email')) return 'email'
  if (fieldName.includes('phone') || fieldName.includes('tel')) return 'tel'
  if (fieldName.includes('name')) return 'name'
  if (fieldName.includes('password')) return 'current-password'
  if (fieldName.includes('address')) return 'street-address'
  if (fieldName.includes('city')) return 'address-level2'
  if (fieldName.includes('state')) return 'address-level1'
  if (fieldName.includes('zip') || fieldName.includes('postal')) return 'postal-code'
  if (fieldName.includes('country')) return 'country'
  
  // Type-based
  if (type === 'email') return 'email'
  if (type === 'tel') return 'tel'
  if (type === 'url') return 'url'
  
  return undefined
}

/**
 * Screen reader only text (visually hidden)
 */
export const SR_ONLY = 'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0'
