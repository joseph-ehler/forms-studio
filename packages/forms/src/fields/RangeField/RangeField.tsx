/**
 * RangeField Component
 * 
 * Range selector with min and max values
 * Simple, portable contract - no DS typography complexity.
 */

import React from 'react';
import { Controller, type FieldValues } from 'react-hook-form';
import type { FieldComponentProps } from '../../form-core/types';
import { FormLabel, FormHelperText, Stack } from '@intstudio/ds';

export interface RangeFieldProps<T extends FieldValues = FieldValues> extends
  Omit<FieldComponentProps<T>, 'placeholder'> {
  minBound?: number; // Minimum allowed value
  maxBound?: number; // Maximum allowed value
  step?: number; // Step increment
}

export function RangeField<T extends FieldValues = FieldValues>({
  name,
  control,
  errors,
  label,
  required,
  disabled,
  description,
  minBound = 0,
  maxBound = 100,
  step = 1
}: RangeFieldProps<T>) {
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
        render={({ field }) => {
          const value = field.value || { min: minBound, max: maxBound };
          const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newMin = Number(e.target.value);
            field.onChange({ ...value, min: Math.min(newMin, value.max) });
          };
          const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newMax = Number(e.target.value);
            field.onChange({ ...value, max: Math.max(newMax, value.min) });
          };

          return (
            <div>
              <input
                type="number"
                id={`${name}-min`}
                disabled={disabled}
                aria-invalid={hasError || undefined}
                aria-describedby={description ? `${name}-desc` : undefined}
                aria-label="Minimum value"
                min={minBound}
                max={maxBound}
                step={step}
                value={value.min ?? minBound}
                onChange={handleMinChange}
                onBlur={field.onBlur} className="ds-input w-full" />








              <span>to</span>
              <input
                type="number"
                id={`${name}-max`}
                disabled={disabled}
                aria-invalid={hasError || undefined}
                aria-describedby={description ? `${name}-desc` : undefined}
                aria-label="Maximum value"
                min={minBound}
                max={maxBound}
                step={step}
                value={value.max ?? maxBound}
                onChange={handleMaxChange}
                onBlur={field.onBlur} className="ds-input w-full" />








            </div>);

        }} />


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