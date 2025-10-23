/**
 * EmailEnhancedField Component
 * 
 * Email input with async validation and telemetry (God Tier demo)
 * Simple, portable contract - no DS typography complexity.
 * 
 * ⚡ Telemetry enabled (focus, blur events)
 */

import React from 'react';
import { Controller, type FieldValues } from 'react-hook-form';
import type { FieldComponentProps } from '../../form-core/types';
import { FormLabel, FormHelperText, Stack } from '@intstudio/ds';
import { telemetryAdapter } from './adapters';

export interface EmailEnhancedFieldProps<T extends FieldValues = FieldValues>
  extends Omit<FieldComponentProps<T>, 'placeholder'> {
  label?: string;  // Field label
  description?: string;  // Helper text
}

export function EmailEnhancedField<T extends FieldValues = FieldValues>({
  name,
  control,
  errors,
  label,
  required,
  disabled,
  description
}: EmailEnhancedFieldProps<T>) {
  const err = (errors as any)?.[name];
  const hasError = Boolean(err);
  const errorMessage = err?.message as string | undefined;

  const onFocusTelemetry = () => {
    telemetryAdapter.emit('field_focus', { schemaPath: name as string, fieldType: 'email' });
  };
  const onBlurTelemetry = () => {
    telemetryAdapter.emit('field_blur', { schemaPath: name as string, fieldType: 'email' });
  };

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
            className="ds-input w-full"
            type="email"
            id={name}
            disabled={disabled}
            required={required}
            aria-invalid={hasError || undefined}
            aria-describedby={description ? `${name}-desc` : undefined}
            value={field.value ?? ''}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={() => { field.onBlur(); onBlurTelemetry(); }}
            onFocus={onFocusTelemetry}
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
