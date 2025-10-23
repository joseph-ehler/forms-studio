/**
 * LocationField Component
 * 
 * Geographic coordinates with latitude and longitude inputs
 * Composite field with parts: lat, lng
 */

import React from 'react';
import { Controller, type FieldValues } from 'react-hook-form';
import type { FieldComponentProps } from '../../form-core/types';
import { FormLabel, FormHelperText, Stack } from '@intstudio/ds';

export interface LocationFieldProps<T extends FieldValues = FieldValues>
  extends FieldComponentProps<T> {
  // Composite field - no additional props
}

export function LocationField<T extends FieldValues = FieldValues>({
  name,
  control,
  errors,
  label,
  required,
  disabled,
  description,
}: LocationFieldProps<T>) {
  // Aggregate errors from all parts
  const hasError = Boolean((errors as any)?.[name]?.lat || (errors as any)?.[name]?.lng);
  const errorMessage = [(errors as any)?.[name]?.lat?.message, (errors as any)?.[name]?.lng?.message].find(Boolean) as string | undefined;

  return (
    <Stack spacing="tight">
      {label && (
        <FormLabel htmlFor={name} required={required} size="md">
          {label}
        </FormLabel>
      )}

      {/* Composite parts - row layout */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: '12px', alignItems: 'flex-start' }}>

        {/* lat part */}
        <Controller
          name={`${name}.lat` as any}
          control={control as any}
          render={({ field }) => (
            <div style={{ flex: 1 }}>
              <FormLabel htmlFor={`${name}-lat`} size="sm">Latitude</FormLabel>
              <input
                type="number"
                id={`${name}-lat`}
                disabled={disabled}
                aria-invalid={hasError || undefined}
                aria-describedby={description ? `${name}-desc` : undefined}
                
                value={field.value ?? 0}
                onChange={(e) => field.onChange(Number(e.target.value))}
                onBlur={field.onBlur}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: hasError ? '1px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              />
            </div>
          )}
        />
        

        {/* lng part */}
        <Controller
          name={`${name}.lng` as any}
          control={control as any}
          render={({ field }) => (
            <div style={{ flex: 1 }}>
              <FormLabel htmlFor={`${name}-lng`} size="sm">Longitude</FormLabel>
              <input
                type="number"
                id={`${name}-lng`}
                disabled={disabled}
                aria-invalid={hasError || undefined}
                aria-describedby={description ? `${name}-desc` : undefined}
                
                value={field.value ?? 0}
                onChange={(e) => field.onChange(Number(e.target.value))}
                onBlur={field.onBlur}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: hasError ? '1px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              />
            </div>
          )}
        />
        
      </div>

      {description && (
        <div id={`${name}-desc`}>
          <FormHelperText size="sm">
            {description}
          </FormHelperText>
        </div>
      )}

      {hasError && (
        <FormHelperText variant="error" size="sm">
          {errorMessage}
        </FormHelperText>
      )}
    </Stack>
  );
}
