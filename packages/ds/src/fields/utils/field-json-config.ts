/**
 * Field JSON Configuration Utilities
 * 
 * Enables all form fields to accept comprehensive JSON configuration.
 * Extends the base json-config utilities with field-specific helpers.
 * 
 * Pattern:
 * 1. Field receives props and json
 * 2. getFieldConfigFromJSON() extracts all field config from json
 * 3. mergeFieldConfig() merges props → JSON → defaults
 * 4. Field uses resolved configuration
 * 
 * Priority: Props → JSON → Defaults → Component defaults
 */

import { getConfigFromJSON, mergeConfig } from '../../components/utils/json-config'

/**
 * Common field configuration interface
 */
export interface FieldConfig {
  // Basic field props
  label?: string
  placeholder?: string
  description?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  
  // Input attributes
  inputType?: string // For TextField: email, tel, url, etc.
  inputMode?: string // text, numeric, decimal, tel, search, email, url
  autoComplete?: string
  autoCapitalize?: string
  autoCorrect?: string
  spellCheck?: boolean
  enterKeyHint?: string // enter, done, go, next, previous, search, send
  
  // Validation
  validation?: {
    maxLength?: number
    minLength?: number
    max?: number
    min?: number
    pattern?: string
    custom?: (value: any) => boolean | string
  }
  
  // Field-specific options
  options?: any[] // For select, radio, checkbox, etc.
  multiple?: boolean
  searchable?: boolean
  clearable?: boolean
  
  // Appearance
  variant?: string
  size?: string
  
  // Typography (from previous migration)
  typographyDisplay?: any
  typographyVariant?: string
}

/**
 * Extract all field configuration from JSON
 * 
 * @param json - Raw JSON configuration
 * @returns Extracted field configuration
 */
export function getFieldConfigFromJSON(json: any): Partial<FieldConfig> {
  if (!json || typeof json !== 'object') return {}
  
  return {
    // Basic props
    label: json.label,
    placeholder: json.placeholder,
    description: json.description,
    required: json.required,
    disabled: json.disabled,
    readOnly: json.readOnly,
    
    // Input attributes
    inputType: json.inputType,
    inputMode: json.inputMode,
    autoComplete: json.autoComplete,
    autoCapitalize: json.autoCapitalize,
    autoCorrect: json.autoCorrect,
    spellCheck: json.spellCheck,
    enterKeyHint: json.enterKeyHint,
    
    // Validation
    validation: json.validation,
    
    // Field-specific
    options: json.options,
    multiple: json.multiple,
    searchable: json.searchable,
    clearable: json.clearable,
    
    // Appearance
    variant: json.variant,
    size: json.size,
    
    // Typography
    typographyDisplay: json.typographyDisplay,
    typographyVariant: json.typographyVariant,
  }
}

/**
 * Merge field props with JSON config
 * 
 * @param props - Field props from component
 * @param json - Raw JSON configuration
 * @param defaults - Default values
 * @returns Merged field configuration
 */
export function mergeFieldConfig<T extends Partial<FieldConfig>>(
  props: T,
  json: any,
  defaults: Partial<T> = {}
): T {
  const jsonConfig = getFieldConfigFromJSON(json)
  
  return {
    ...defaults,
    ...jsonConfig,
    ...props,
  } as T
}

/**
 * Helper to get autocomplete hint based on field name and type
 */
export function getAutoCompleteHint(name: string, type?: string): string {
  const lowerName = name.toLowerCase()
  
  // Email
  if (type === 'email' || lowerName.includes('email')) return 'email'
  
  // Names
  if (lowerName === 'firstname' || lowerName === 'first_name' || lowerName === 'fname') return 'given-name'
  if (lowerName === 'lastname' || lowerName === 'last_name' || lowerName === 'lname') return 'family-name'
  if (lowerName === 'name' || lowerName === 'fullname') return 'name'
  
  // Phone
  if (type === 'tel' || lowerName.includes('phone') || lowerName.includes('tel')) return 'tel'
  
  // Address
  if (lowerName.includes('address')) return 'street-address'
  if (lowerName.includes('city')) return 'address-level2'
  if (lowerName.includes('state') || lowerName.includes('province')) return 'address-level1'
  if (lowerName.includes('zip') || lowerName.includes('postal')) return 'postal-code'
  if (lowerName.includes('country')) return 'country'
  
  // Organization
  if (lowerName.includes('company') || lowerName.includes('organization')) return 'organization'
  
  // Payment
  if (lowerName.includes('cc') || lowerName.includes('card')) return 'cc-number'
  if (lowerName.includes('cvv') || lowerName.includes('cvc')) return 'cc-csc'
  if (lowerName.includes('expiry') || lowerName.includes('exp')) return 'cc-exp'
  
  // Auth
  if (lowerName.includes('password') || lowerName.includes('pwd')) return 'current-password'
  if (lowerName.includes('username') || lowerName === 'user') return 'username'
  
  // URLs
  if (type === 'url' || lowerName.includes('url') || lowerName.includes('website')) return 'url'
  
  return 'off'
}

/**
 * Helper to get auto-capitalize setting based on input type
 */
export function getAutoCapitalize(type?: string): string {
  if (type === 'email' || type === 'url' || type === 'tel') return 'off'
  return 'sentences'
}

/**
 * Helper to resolve validation from JSON
 */
export function getValidationFromJSON(json: any): FieldConfig['validation'] {
  if (!json?.validation) return undefined
  
  return {
    maxLength: json.validation.maxLength,
    minLength: json.validation.minLength,
    max: json.validation.max,
    min: json.validation.min,
    pattern: json.validation.pattern,
    custom: json.validation.custom,
  }
}
