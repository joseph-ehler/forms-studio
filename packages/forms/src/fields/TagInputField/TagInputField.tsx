/**
 * TagInputField Component
 * 
 * Tag input field with comma separation
 * Simple, portable contract - no DS typography complexity.
 */

import React from 'react';
import { Controller, type FieldValues } from 'react-hook-form';
import type { FieldComponentProps } from '../../form-core/types';
import { FormLabel, FormHelperText, Stack } from '@intstudio/ds';

export interface TagInputFieldProps<T extends FieldValues = FieldValues> extends
  Omit<FieldComponentProps<T>, 'placeholder'> {
  separator?: string; // Tag separator character
  maxTags?: number; // Maximum number of tags allowed
}

export function TagInputField<T extends FieldValues = FieldValues>({
  name,
  control,
  errors,
  label,
  required,
  disabled,
  description,
  separator = ',',
  maxTags = 10
}: TagInputFieldProps<T>) {
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
          type="text"
          id={name}
          placeholder={`Enter tags separated by ${separator}`}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={description ? `${name}-desc` : undefined}
          value={field.value ?? ''}
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