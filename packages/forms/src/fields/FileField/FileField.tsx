/** @refiner(filter-dom-props@1.1.0 applied 2025-10-23) */
/**
 * FileField Component
 * 
 * File upload with native file input
 * Simple, portable contract - no DS typography complexity.
 */

import React from 'react';
import { Controller, type FieldValues } from 'react-hook-form';
import type { FieldComponentProps } from '../../form-core/types';
import { FormLabel, FormHelperText, Stack } from '@intstudio/ds';

export interface FileFieldProps<T extends FieldValues = FieldValues> extends
  Omit<FieldComponentProps<T>, 'placeholder'> {
  label?: string; // Field label
  description?: string; // Helper text
  accept?: string; // File types to accept (e.g., "image/*")
  multiple?: boolean; // Allow multiple file selection
}

export function FileField<T extends FieldValues = FieldValues>({
  name,
  control,
  errors,
  required,
  disabled,
  label,
  description,
  accept,
  multiple = false
}: FileFieldProps<T>) {
  const err = (errors as any)?.[name];
  const hasError = Boolean(err);
  const errorMessage = err?.message as string | undefined;

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
        <input
          type="file"
          id={name}
          disabled={disabled}
          required={required}
          aria-invalid={hasError || undefined}
          aria-describedby={description ? `${name}-desc` : undefined}

          onChange={(e) => field.onChange(e.target.files)}
          onBlur={field.onBlur}
          accept={accept}
          multiple={multiple}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: hasError ? '1px solid #ef4444' : '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }} />

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
          {errorMessage}
        </FormHelperText>
      }
    </Stack>);

}