/**
 * Create Form
 * 
 * Factory function for creating Zod-validated forms with react-hook-form
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import type { FormSchema, FormInstance } from './types';

/**
 * Create a form instance with Zod validation
 * 
 * @example
 * ```tsx
 * const schema = z.object({
 *   email: z.string().email(),
 *   name: z.string().min(2),
 * });
 * 
 * function MyForm() {
 *   const form = createForm({ schema });
 *   
 *   return (
 *     <form onSubmit={form.handleSubmit(console.log)}>
 *       <TextField name="email" control={form.control} />
 *     </form>
 *   );
 * }
 * ```
 */
export function createForm<T extends z.ZodType>(
  config: FormSchema<T>
): FormInstance<z.infer<T>> {
  return useForm<z.infer<T>>({
    resolver: zodResolver(config.schema),
    defaultValues: config.defaultValues as any,
    mode: 'onBlur', // Validate on blur for better UX
  });
}

/**
 * Shorthand for creating a form with just a schema
 */
export function useFormWithSchema<T extends z.ZodType>(
  schema: T,
  defaultValues?: Partial<z.infer<T>>
): FormInstance<z.infer<T>> {
  return createForm({ schema, defaultValues });
}
