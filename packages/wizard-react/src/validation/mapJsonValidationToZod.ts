/**
 * JSON Validation → Zod Schema Mapper
 * 
 * Converts Forms Studio JSON field validation rules into Zod schemas.
 */

import { z } from 'zod'

/**
 * Convert a single field's JSON validation to a Zod schema
 */
export function jsonFieldToZod(field: any) {
  const v = field.validation ?? {}
  let s: any = z.any()

  switch (field.type) {
    case 'text':
    case 'textarea':
      s = z.string({ required_error: 'Required' })
      if (v.minLength) s = s.min(v.minLength)
      if (v.maxLength) s = s.max(v.maxLength)
      if (v.pattern) s = s.regex(new RegExp(v.pattern))
      if (!v.required) s = s.optional()
      break

    case 'number':
      s = z.number({ invalid_type_error: 'Must be a number' })
      if (v.min !== undefined) s = s.min(v.min)
      if (v.max !== undefined) s = s.max(v.max)
      if (!v.required) s = s.optional()
      break

    case 'select':
      // Single select returns string, multi-select returns array
      if (field.multiple) {
        s = z.array(z.string())
        if (v.minItems) s = s.min(v.minItems)
        if (v.maxItems) s = s.max(v.maxItems)
      } else {
        s = z.string({ required_error: 'Required' })
      }
      if (!v.required) s = s.optional()
      break

    case 'chips':
      s = z.array(z.string())
      if (v.minItems) s = s.min(v.minItems, `Select at least ${v.minItems}`)
      if (v.maxItems) s = s.max(v.maxItems, `Select at most ${v.maxItems}`)
      if (!v.required) s = s.optional()
      break

    case 'toggle':
      s = z.boolean()
      if (v.mustBeTrue) s = s.refine((val: boolean) => val === true, { message: 'Must be enabled' })
      if (!v.required) s = s.optional()
      break

    case 'date':
    case 'time':
    case 'datetime':
      s = z.string({ required_error: 'Required' })
      // Validate format if needed
      if (field.type === 'date') {
        s = s.regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
      }
      if (field.type === 'time') {
        s = s.regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)')
      }
      if (field.type === 'datetime') {
        s = s.regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Invalid datetime format')
      }
      if (!v.required) s = s.optional()
      break

    case 'daterange':
      // DateRange returns an object with start and end
      s = z.object({
        start: z.string().optional(),
        end: z.string().optional(),
      })
      if (v.required) {
        s = s.refine(
          (val: { start?: string; end?: string }) => val.start && val.end,
          { message: 'Both start and end dates are required' }
        )
      }
      // Validate that start is before end
      s = s.refine(
        (val: { start?: string; end?: string }) => {
          if (!val.start || !val.end) return true
          return new Date(val.start) <= new Date(val.end)
        },
        { message: 'Start date must be before end date' }
      )
      break

    default:
      // fallback—let schema be permissive
      if (!v.required) s = z.any().optional()
      else s = z.any()
  }

  return s
}

/**
 * Build a form-level Zod schema from an array of fields
 */
export function buildFormSchema(fields: any[]) {
  const shape: Record<string, any> = {}
  fields.forEach((f) => {
    // use explicit bind if provided, otherwise id
    const key = f.bind || f.id
    shape[key] = jsonFieldToZod(f)
  })
  return z.object(shape)
}
