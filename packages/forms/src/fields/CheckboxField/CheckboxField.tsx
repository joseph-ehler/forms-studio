/**
 * CheckboxField Component
 * 
 * Boolean checkbox/toggle field with Zod validation via react-hook-form.
 * Simple, portable contract - no DS typography complexity.
 */

import React from 'react';
import { Controller, type FieldValues } from 'react-hook-form';
import type { FieldComponentProps } from '../../form-core/types';
import { FormLabel, FormHelperText, Stack } from '@intstudio/ds';

export function CheckboxField<T extends FieldValues = FieldValues>({
  name,
  control,
  errors,
  label,
  required,
  disabled,
  description
}: Omit<FieldComponentProps<T>, 'placeholder'>) {
  const hasError = Boolean((errors as any)?.[name]);
  const errorMessage = (errors as any)?.[name]?.message;

  return (
    <Stack spacing="tight">
      <Controller
        name={name as any}
        control={control as any}
        render={({ field }) =>
        <label
          htmlFor={name}>








            <input
            type="checkbox"
            id={name}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={description ? `${name}-desc` : undefined}
            aria-required={required || undefined}
            checked={field.value ?? false}
            onChange={(e) => {
              field.onChange(e.target.checked);
            }}
            onBlur={field.onBlur} className="ds-input w-full" />






            {label &&
          <span>
                {label}
                {required && <span>*</span>}
              </span>
          }
          </label>
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
          {errorMessage as string}
        </FormHelperText>
      }
    </Stack>);

}