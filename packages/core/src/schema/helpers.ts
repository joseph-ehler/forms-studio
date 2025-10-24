/**
 * Zod helper utilities
 */
import { z } from 'zod';

/**
 * Extract default values from a Zod schema
 * Useful for initializing forms
 */
export function getDefaults<T extends z.ZodTypeAny>(
  schema: T
): Partial<z.infer<T>> {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const defaults: any = {};
    
    for (const key in shape) {
      const field = shape[key];
      if (field instanceof z.ZodDefault) {
        defaults[key] = field._def.defaultValue();
      } else if (field instanceof z.ZodOptional) {
        // Skip optional fields without defaults
        continue;
      }
    }
    
    return defaults;
  }
  
  return {};
}

/**
 * Create a safe parser that returns { success, data, error }
 */
export function createSafeParser<T extends z.ZodTypeAny>(schema: T) {
  return (data: unknown) => {
    const result = schema.safeParse(data);
    if (result.success) {
      return { success: true as const, data: result.data, error: null };
    }
    return { 
      success: false as const, 
      data: null, 
      error: result.error.format() 
    };
  };
}
