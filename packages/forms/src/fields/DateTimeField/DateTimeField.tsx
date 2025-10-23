/**
 * DateTimeField Component
 * 
 * Date and time picker using native datetime-local input
 * Simple, portable contract - no DS typography complexity.
 */

import React from 'react';
import { Controller, type FieldValues } from 'react-hook-form';
import type { FieldComponentProps } from '../../form-core/types';
import { FormLabel, FormHelperText, Stack } from '@intstudio/ds';

export interface DateTimeFieldProps<T extends FieldValues = FieldValues>
  extends Omit<FieldComponentProps<T>, 'placeholder'> {
  min?: string;  // Minimum datetime (ISO format)
  max?: string;  // Maximum datetime (ISO format)
}

export function DateTimeField<T extends FieldValues = FieldValues>({
  name,
  control,
  errors,
  label,
  required,
  disabled,
  description,
  min = undefined,
  max = undefined,
}: DateTimeFieldProps<T>) {
  const err = (errors as any)?.[name];
  const hasError = Boolean(err);
  const errorMessage = err?.message as string | undefined;

  return (
    <Stack spacing="tight">
      {label && (
        <FormLabel htmlFor={name} required={required} size="md">
          {label}
        </FormLabel>
      )}

      <Controller
        name={name as any}
        control={control as any}
        render={({ field }) => (
          <input
            type="datetime-local"
            id={name}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={description ? `${name}-desc` : undefined}
            min={min}
            max={max}
            value={field.value ?? ''}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: hasError ? '1px solid #ef4444' : '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />
        )}
      />

      {description && (
        <div id={`${name}-desc`}>
          <FormHelperText size="sm" aria-live="polite">
            {description}
          </FormHelperText>
        </div>
      )}

      {hasError && errorMessage && (
        <FormHelperText variant="error" size="sm" aria-live="polite">
          {errorMessage}
        </FormHelperText>
      )}
    </Stack>
  );
}
