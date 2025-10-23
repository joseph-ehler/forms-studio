/**
 * RatingField Component
 * 
 * Simple rating field (1..max) with Zod validation via react-hook-form.
 * Uses radio buttons for accessibility - can be styled as stars later.
 * Simple, portable contract - no DS typography complexity.
 */

import React from 'react';
import { Controller, type FieldValues } from 'react-hook-form';
import type { FieldComponentProps } from '../../form-core/types';
import { FormLabel, FormHelperText, Stack } from '@intstudio/ds';

export interface RatingFieldProps<T extends FieldValues = FieldValues> extends
  Omit<FieldComponentProps<T>, 'placeholder'> {
  max?: number; // default 5
}

export function RatingField<T extends FieldValues = FieldValues>({
  name,
  control,
  errors,
  label,
  required,
  disabled,
  description,
  max = 5
}: RatingFieldProps<T>) {
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
        <div role="radiogroup" aria-labelledby={name}>
            {Array.from({ length: max }).map((_, i) => {
            const val = i + 1;
            const id = `${name}-${val}`;
            return (
              <label key={val} htmlFor={id}>
                  <input
                  type="radio"
                  id={id}
                  name={name}
                  value={val}
                  disabled={disabled}
                  checked={Number(field.value ?? 0) === val}
                  onChange={() => field.onChange(val)}
                  onBlur={field.onBlur} className="ds-input w-full" />


                  {' '}{val}
                </label>);

          })}
          </div>
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