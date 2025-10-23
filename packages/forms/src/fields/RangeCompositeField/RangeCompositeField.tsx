/**
 * RangeCompositeField Component
 * 
 * Min-max range selector with two number inputs
 * Composite field with parts: min, max
 */

import React from 'react';
import { Controller, type FieldValues } from 'react-hook-form';
import type { FieldComponentProps } from '../../form-core/types';
import { FormLabel, FormHelperText, Stack } from '@intstudio/ds';

export interface RangeCompositeFieldProps<T extends FieldValues = FieldValues> extends
  FieldComponentProps<T> {

  // Composite field - no additional props
}
export function RangeCompositeField<T extends FieldValues = FieldValues>({
  name,
  control,
  errors,
  label,
  required,
  disabled,
  description
}: RangeCompositeFieldProps<T>) {
  // Aggregate errors from all parts
  const hasError = Boolean((errors as any)?.[name]?.min || (errors as any)?.[name]?.max);
  const errorMessage = [(errors as any)?.[name]?.min?.message, (errors as any)?.[name]?.max?.message].find(Boolean) as string | undefined;

  return (
    <Stack spacing="tight">
      {label &&
      <FormLabel htmlFor={name} required={required} size="md">
          {label}
        </FormLabel>
      }

      {/* Composite parts - row layout */}
      <div>

        {/* min part */}
        <Controller
          name={`${name}.min` as any}
          control={control as any}
          render={({ field }) =>
          <div>
              <FormLabel htmlFor={`${name}-min`} size="sm">Min</FormLabel>
              <input
              type="number"
              id={`${name}-min`}
              disabled={disabled}
              aria-invalid={hasError || undefined}
              aria-describedby={description ? `${name}-desc` : undefined}

              value={field.value ?? 0}
              onChange={(e) => field.onChange(Number(e.target.value))}
              onBlur={field.onBlur} className="ds-input w-full" />








            </div>
          } />

        <span>to</span>

        {/* max part */}
        <Controller
          name={`${name}.max` as any}
          control={control as any}
          render={({ field }) =>
          <div>
              <FormLabel htmlFor={`${name}-max`} size="sm">Max</FormLabel>
              <input
              type="number"
              id={`${name}-max`}
              disabled={disabled}
              aria-invalid={hasError || undefined}
              aria-describedby={description ? `${name}-desc` : undefined}

              value={field.value ?? 0}
              onChange={(e) => field.onChange(Number(e.target.value))}
              onBlur={field.onBlur} className="ds-input w-full" />








            </div>
          } />

        
      </div>

      {description &&
      <div id={`${name}-desc`}>
          <FormHelperText size="sm">
            {description}
          </FormHelperText>
        </div>
      }

      {hasError &&
      <FormHelperText variant="error" size="sm">
          {errorMessage}
        </FormHelperText>
      }
    </Stack>);

}