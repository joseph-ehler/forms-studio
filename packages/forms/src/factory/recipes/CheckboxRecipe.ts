/**
 * CheckboxRecipe - Type-aware template for checkbox fields
 * 
 * Part of Phase 1 beautification - replaces generic TextInput recipe
 * for checkbox type fields.
 * 
 * @module CheckboxRecipe
 * @since 2025-10-23
 */

import type { FieldValues } from 'react-hook-form';

export interface CheckboxSpec {
  name: string;
  type: 'checkbox';
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  ui?: {
    fullWidth?: boolean; // Optional: allow full-width (default false for checkboxes)
  };
  aria?: {
    invalid?: string;
    describedby?: string;
    live?: 'polite' | 'assertive' | 'off';
  };
  value?: {
    default?: boolean;
  };
}

/**
 * Generate checkbox field implementation
 * 
 * Key differences from TextInput recipe:
 * 1. Uses .ds-checkbox instead of .ds-input
 * 2. No w-full by default (checkboxes are inline)
 * 3. type="checkbox"
 * 4. value/onChange uses boolean (checked/e.target.checked)
 * 5. Label wraps checkbox for larger hit area
 */
export function CheckboxRecipe(spec: CheckboxSpec): string {
  const {
    name,
    label,
    description,
    required = false,
    disabled = false,
    ui = {},
    aria = {},
    value = {}
  } = spec;

  const fullWidthClass = ui.fullWidth ? ' w-full' : '';
  const defaultValue = value.default !== undefined ? value.default : false;
  const ariaLive = aria.live || 'polite';

  return `/**
 * ${name} Component
 * 
 * Boolean checkbox field with Zod validation via react-hook-form.
 * Simple, portable contract - no DS typography complexity.
 */

import React from 'react';
import { Controller, type FieldValues } from 'react-hook-form';
import type { FieldComponentProps } from '../../form-core/types';
import { FormLabel, FormHelperText, Stack } from '@intstudio/ds';

export interface ${name}Props<T extends FieldValues = FieldValues>
  extends Omit<FieldComponentProps<T>, 'placeholder'> {
  label?: string;      // Checkbox label text
  description?: string; // Helper text
}

export function ${name}<T extends FieldValues = FieldValues>({
  name,
  control,
  errors,
  label,
  required,
  disabled,
  description
}: ${name}Props<T>) {
  const err = (errors as any)?.[name];
  const hasError = Boolean(err);
  const errorMessage = err?.message as string | undefined;

  return (
    <Stack spacing="tight">
      <Controller
        name={name as any}
        control={control as any}
        render={({ field }) => (
          <label
            htmlFor={name}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: disabled ? 'not-allowed' : 'pointer' }}
          >
            <input
              type="checkbox"
              id={name}
              className="ds-checkbox${fullWidthClass}"
              disabled={disabled}
              aria-invalid={hasError || undefined}
              aria-describedby={description ? \`\${name}-desc\` : undefined}
              aria-required={required || undefined}
              checked={field.value ?? ${defaultValue}}
              onChange={(e) => field.onChange(e.target.checked)}
              onBlur={field.onBlur}
            />
            {label && (
              <span style={{ userSelect: 'none' }}>
                {label}
                {required && <span style={{ color: 'var(--ds-color-state-danger)', marginLeft: '0.25rem' }}>*</span>}
              </span>
            )}
          </label>
        )}
      />

      {description && (
        <div id={\`\${name}-desc\`}>
          <FormHelperText size="sm" aria-live="${ariaLive}">
            {description}
          </FormHelperText>
        </div>
      )}

      {hasError && errorMessage && (
        <FormHelperText variant="error" size="sm" aria-live="${ariaLive}">
          {errorMessage}
        </FormHelperText>
      )}
    </Stack>
  );
}
`;
}

/**
 * Export for use in generator dispatch
 */
export default CheckboxRecipe;
