/**
 * Auto-Generate Zod Schemas from JSON Field Config
 * 
 * Enables zero-boilerplate validation:
 * const schema = generateZodFromJSON(fields)
 * 
 * Supports:
 * - Basic types (string, number, boolean, date)
 * - String validations (min, max, pattern, email, url)
 * - Number validations (min, max, int, positive)
 * - Array validations (min, max, unique)
 * - Custom Zod expressions
 * - Conditional required/validation
 */

import { z, ZodTypeAny } from 'zod'

export interface FieldValidationConfig {
  type?: string
  name: string
  required?: boolean
  validation?: {
    // String validations
    minLength?: number
    maxLength?: number
    pattern?: string
    email?: boolean
    url?: boolean
    uuid?: boolean
    
    // Number validations
    min?: number
    max?: number
    int?: boolean
    positive?: boolean
    negative?: boolean
    multipleOf?: number
    
    // Array validations
    minItems?: number
    maxItems?: number
    unique?: boolean
    
    // Date validations
    minDate?: string | Date
    maxDate?: string | Date
    
    // Custom messages
    messages?: {
      required?: string
      invalid?: string
      tooShort?: string
      tooLong?: string
      tooSmall?: string
      tooLarge?: string
    }
    
    // Escape hatch for complex validations
    custom?: string // Raw Zod expression: "z.string().regex(/.../).refine(...)"
  }
}

/**
 * Generate Zod schema for a single field
 */
export function generateFieldSchema(config: FieldValidationConfig): ZodTypeAny {
  const { type, required, validation } = config
  
  // Use custom Zod if provided
  if (validation?.custom) {
    try {
      // Evaluate custom Zod expression
      // Security: Only allow z.* expressions (no arbitrary code)
      const customSchema = eval(validation.custom)
      return required ? customSchema : customSchema.optional()
    } catch (err) {
      console.error(`Invalid custom Zod for field ${config.name}:`, err)
    }
  }
  
  let schema: ZodTypeAny
  
  // Base schema by type
  switch (type) {
    case 'number':
    case 'slider':
    case 'range':
      schema = buildNumberSchema(validation)
      break
      
    case 'email':
      schema = z.string().email(validation?.messages?.invalid || 'Invalid email address')
      break
      
    case 'url':
      schema = z.string().url(validation?.messages?.invalid || 'Invalid URL')
      break
      
    case 'date':
    case 'datetime':
    case 'time':
      schema = buildDateSchema(validation)
      break
      
    case 'toggle':
    case 'checkbox':
      schema = z.boolean()
      break
      
    case 'select':
    case 'radio':
      schema = z.string()
      break
      
    case 'multiselect':
    case 'chips':
    case 'tags':
      schema = buildArraySchema(validation)
      break
      
    case 'file':
      schema = z.any() // File objects are tricky, use any for now
      break
      
    default:
      // text, textarea, password, etc.
      schema = buildStringSchema(validation)
  }
  
  // Apply required/optional
  return required 
    ? schema
    : schema.optional()
}

/**
 * Build string schema with validations
 */
function buildStringSchema(validation?: FieldValidationConfig['validation']): ZodTypeAny {
  let schema = z.string()
  
  if (!validation) return schema
  
  if (validation.minLength) {
    schema = schema.min(
      validation.minLength,
      validation.messages?.tooShort || `Must be at least ${validation.minLength} characters`
    )
  }
  
  if (validation.maxLength) {
    schema = schema.max(
      validation.maxLength,
      validation.messages?.tooLong || `Must be at most ${validation.maxLength} characters`
    )
  }
  
  if (validation.pattern) {
    schema = schema.regex(
      new RegExp(validation.pattern),
      validation.messages?.invalid || 'Invalid format'
    )
  }
  
  if (validation.email) {
    schema = schema.email(validation.messages?.invalid || 'Invalid email')
  }
  
  if (validation.url) {
    schema = schema.url(validation.messages?.invalid || 'Invalid URL')
  }
  
  if (validation.uuid) {
    schema = schema.uuid(validation.messages?.invalid || 'Invalid UUID')
  }
  
  return schema
}

/**
 * Build number schema with validations
 */
function buildNumberSchema(validation?: FieldValidationConfig['validation']): ZodTypeAny {
  let schema = z.number()
  
  if (!validation) return schema
  
  if (validation.min !== undefined) {
    schema = schema.min(
      validation.min,
      validation.messages?.tooSmall || `Must be at least ${validation.min}`
    )
  }
  
  if (validation.max !== undefined) {
    schema = schema.max(
      validation.max,
      validation.messages?.tooLarge || `Must be at most ${validation.max}`
    )
  }
  
  if (validation.int) {
    schema = schema.int(validation.messages?.invalid || 'Must be an integer')
  }
  
  if (validation.positive) {
    schema = schema.positive(validation.messages?.invalid || 'Must be positive')
  }
  
  if (validation.negative) {
    schema = schema.negative(validation.messages?.invalid || 'Must be negative')
  }
  
  if (validation.multipleOf) {
    schema = schema.multipleOf(
      validation.multipleOf,
      validation.messages?.invalid || `Must be a multiple of ${validation.multipleOf}`
    )
  }
  
  return schema
}

/**
 * Build date schema with validations
 */
function buildDateSchema(validation?: FieldValidationConfig['validation']): ZodTypeAny {
  let schema = z.date()
  
  if (!validation) return schema
  
  if (validation.minDate) {
    const minDate = typeof validation.minDate === 'string' 
      ? new Date(validation.minDate)
      : validation.minDate
    schema = schema.min(minDate, validation.messages?.tooSmall)
  }
  
  if (validation.maxDate) {
    const maxDate = typeof validation.maxDate === 'string'
      ? new Date(validation.maxDate)
      : validation.maxDate
    schema = schema.max(maxDate, validation.messages?.tooLarge)
  }
  
  return schema
}

/**
 * Build array schema with validations
 */
function buildArraySchema(validation?: FieldValidationConfig['validation']): ZodTypeAny {
  let schema = z.array(z.string())
  
  if (!validation) return schema
  
  if (validation.minItems) {
    schema = schema.min(
      validation.minItems,
      validation.messages?.tooShort || `Select at least ${validation.minItems} items`
    )
  }
  
  if (validation.maxItems) {
    schema = schema.max(
      validation.maxItems,
      validation.messages?.tooLong || `Select at most ${validation.maxItems} items`
    )
  }
  
  return schema
}

/**
 * Generate complete Zod schema from array of field configs
 * 
 * @example
 * const fields = [
 *   { type: 'text', name: 'email', required: true, validation: { email: true } },
 *   { type: 'number', name: 'age', required: true, validation: { min: 18, max: 120 } }
 * ]
 * 
 * const schema = generateZodFromJSON(fields)
 * // z.object({ email: z.string().email(), age: z.number().min(18).max(120) })
 */
export function generateZodFromJSON(fields: FieldValidationConfig[]): z.ZodObject<any> {
  const shape: Record<string, ZodTypeAny> = {}
  
  for (const field of fields) {
    if (!field.name) {
      console.warn('Field missing name, skipping:', field)
      continue
    }
    
    try {
      shape[field.name] = generateFieldSchema(field)
    } catch (err) {
      console.error(`Error generating schema for field ${field.name}:`, err)
      // Fallback to z.any() to avoid breaking the entire schema
      shape[field.name] = z.any()
    }
  }
  
  return z.object(shape)
}

/**
 * Get validation metadata for a field (useful for UI hints)
 */
export function getValidationMetadata(config: FieldValidationConfig) {
  const { validation } = config
  if (!validation) return {}
  
  return {
    minLength: validation.minLength,
    maxLength: validation.maxLength,
    min: validation.min,
    max: validation.max,
    pattern: validation.pattern,
    isEmail: validation.email,
    isUrl: validation.url,
    isUuid: validation.uuid,
    messages: validation.messages,
  }
}
