/** @refiner(filter-dom-props@1.1.0 applied 2025-10-23) */
/**
 * MultiSelectField Component
 * 
 * Multi-select dropdown with native select element
 * Simple, portable contract - no DS typography complexity.
 */

import React from 'react';
import { Controller, type FieldValues } from 'react-hook-form';
import type { FieldComponentProps } from '../../form-core/types';
import { FormLabel, FormHelperText, Stack } from '@intstudio/ds';

export interface MultiSelectFieldProps<T extends FieldValues = FieldValues> extends
  Omit<FieldComponentProps<T>, 'placeholder'> {
  label?: string; // Field label
  description?: string; // Helper text
  multiple?: boolean; // Enable multiple selection
  size?: number; // Number of visible options
}

export function MultiSelectField<T extends FieldValues = FieldValues>({
  name,
  control,
  errors,
  required,
  disabled,
  label,
  description,
  size,
  multiple = true
}: MultiSelectFieldProps<T>) {
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

          id={name}
          disabled={disabled}
          required={required}
          aria-invalid={hasError || undefined}
          aria-describedby={description ? `${name}-desc` : undefined}
          value={field.value ?? ""}
          onChange={(e) => field.onChange(e.target.value)}
          onBlur={field.onBlur}
          multiple={multiple}
          size={size}
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