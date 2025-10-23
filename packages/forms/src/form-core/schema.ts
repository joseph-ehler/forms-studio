/**
 * Form Schema Helpers
 * 
 * Utilities for working with Zod schemas
 */

import { z } from 'zod';
import type { FormSchema } from './types';

/**
 * Create a form schema with default values
 */
export function createSchema<T extends z.ZodType>(
  schema: T,
  defaultValues?: Partial<z.infer<T>>
): FormSchema<T> {
  return {
    schema,
    defaultValues,
  };
}

/**
 * Extract field schemas from a form schema
 * Useful for generating field-level validation
 */
export function getFieldSchema<T extends z.ZodObject<any>>(
  schema: T,
  fieldName: keyof z.infer<T>
): z.ZodType | undefined {
  if (schema instanceof z.ZodObject) {
    return schema.shape[fieldName as string];
  }
  return undefined;
}
