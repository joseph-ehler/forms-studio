/**
 * Form Core Types
 */

import type { z } from 'zod';
import type { UseFormReturn, FieldValues } from 'react-hook-form';

/**
 * Base field configuration
 */
export interface FieldConfig {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  defaultValue?: any;
}

/**
 * Form schema with Zod validation
 */
export interface FormSchema<T extends z.ZodType = z.ZodType> {
  schema: T;
  defaultValues?: Partial<z.infer<T>>;
}

/**
 * Form instance (react-hook-form integration)
 */
export type FormInstance<T extends FieldValues = FieldValues> = UseFormReturn<T>;

/**
 * Field component props
 */
export interface FieldProps<T extends FieldValues = FieldValues> extends FieldConfig {
  control: FormInstance<T>['control'];
  errors: FormInstance<T>['formState']['errors'];
}

/**
 * Field component props (migrated fields pattern)
 */
export interface FieldComponentProps<TFieldValues extends FieldValues = FieldValues> {
  name: string;
  control: FormInstance<TFieldValues>['control'];
  errors: FormInstance<TFieldValues>['formState']['errors'];
  label?: string;
  required?: boolean;
  disabled?: boolean;
  description?: string;
  placeholder?: string;
}

/**
 * Field render props (ARIA attributes)
 */
export type FieldRenderProps = {
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
};
