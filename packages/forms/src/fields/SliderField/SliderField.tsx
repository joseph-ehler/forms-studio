/**
 * SliderField Component
 * 
 * Simple slider field using native range input
 * Simple, portable contract - no DS typography complexity.
 */

import React from 'react';
import { Controller, type FieldValues } from 'react-hook-form';
import type { FieldComponentProps } from '../../form-core/types';
import { FormLabel, FormHelperText, Stack } from '@intstudio/ds';

export interface SliderFieldProps<T extends FieldValues = FieldValues> extends
  Omit<FieldComponentProps<T>, 'placeholder'> {
  min?: number; // Minimum value
  max?: number; // Maximum value
  step?: number; // Step increment
}

export function SliderField<T extends FieldValues = FieldValues>({
  name,
  control,
  errors,
  label,
  required,
  disabled,
  description,
  min = 0,
  max = 100,
  step = 1
}: SliderFieldProps<T>) {
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
          type="range"
          id={name}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={description ? `${name}-desc` : undefined}
          min={min}
          max={max}
          step={step}
          value={field.value ?? min ?? 0}
          onChange={(e) => field.onChange(Number(e.target.value))}
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