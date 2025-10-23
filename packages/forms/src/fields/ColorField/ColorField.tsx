/**
 * ColorField Component
 * 
 * Color picker using native color input
 * Simple, portable contract - no DS typography complexity.
 */

import React from 'react';
import { Controller, type FieldValues } from 'react-hook-form';
import type { FieldComponentProps } from '../../form-core/types';
import { FormLabel, FormHelperText, Stack } from '@intstudio/ds';

export interface ColorFieldProps<T extends FieldValues = FieldValues> extends
  Omit<FieldComponentProps<T>, 'placeholder'> {
  label?: string; // Field label
  description?: string; // Helper text
  required?: boolean; // Required field indicator
  disabled?: boolean; // Disabled state
}

export function ColorField<T extends FieldValues = FieldValues>({
  name,
  control,
  errors,
  label,
  description,
  required = false,
  disabled = false
}: ColorFieldProps<T>) {
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
          type="color"
          id={name}
          disabled={disabled}
          required={required}
          aria-invalid={hasError || undefined}
          aria-describedby={description ? `${name}-desc` : undefined}
          value={field.value ?? "#000000"}
          onChange={(e) => field.onChange(e.target.value)}
          onBlur={field.onBlur} className="ds-input w-full" />








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