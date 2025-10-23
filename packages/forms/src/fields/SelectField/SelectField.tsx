/**
 * SelectField Component
 * 
 * Select field with Zod validation via react-hook-form.
 * Simple, portable contract - no DS typography complexity.
 */

import React from 'react';
import { Controller, type FieldValues } from 'react-hook-form';
import type { FieldComponentProps } from '../../form-core/types';
import { FormLabel, FormHelperText, Stack } from '@intstudio/ds';

export interface SelectFieldProps<T extends FieldValues = FieldValues> extends FieldComponentProps<T> {
  options: Array<{value: string;label: string;}>;
}

export function SelectField<T extends FieldValues = FieldValues>({
  name,
  control,
  errors,
  label,
  required,
  disabled,
  description,
  placeholder,
  options
}: SelectFieldProps<T>) {
  const hasError = Boolean((errors as any)?.[name]);
  const errorMessage = (errors as any)?.[name]?.message;

  return (
    <Stack spacing="tight">
      {label &&
      <FormLabel htmlFor={name} required={required} size="md">
          {label}
        </FormLabel>
      }

      <Controller
        name={name as any}
        control={control as any}
        render={({ field }) =>
        <select
          id={name}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={description ? `${name}-desc` : undefined}
          value={field.value ?? ''}
          onChange={(e) => field.onChange(e.target.value)}
          onBlur={field.onBlur}>









            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) =>
          <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
          )}
          </select>
        } />


      {description &&
      <div id={`${name}-desc`}>
          <FormHelperText size="sm" aria-live="polite">
            {description}
          </FormHelperText>
        </div>
      }
      
      {hasError && errorMessage &&
      <FormHelperText variant="error" size="sm" aria-live="polite">
          {errorMessage as string}
        </FormHelperText>
      }
    </Stack>);

}