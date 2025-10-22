/**
 * Zod Resolver for React Hook Form
 * 
 * Bridges Zod validation with RHF error handling.
 */

import type { ZodSchema } from 'zod'
import { ZodIssueCode } from 'zod'

export const zodResolver = (schema: ZodSchema) => async (values: any) => {
  try {
    const parsed = await schema.parseAsync(values)
    return { values: parsed, errors: {} }
  } catch (e: any) {
    const formErrors: Record<string, any> = {}
    ;(e?.issues ?? []).forEach((iss: any) => {
      const path = iss.path?.join('.') || ''
      formErrors[path] = {
        type: iss.code ?? ZodIssueCode.custom,
        message: iss.message,
      }
    })
    return { values: {}, errors: formErrors }
  }
}
