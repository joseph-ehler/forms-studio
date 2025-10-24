/**
 * ToggleRecipe - Type-aware template for toggle switches
 * 
 * Part of the factory system for generating field components.
 * 
 * Key Differences from CheckboxRecipe:
 * 1. Uses role="switch" for proper semantics
 * 2. Emits .ds-toggle instead of .ds-checkbox
 * 3. Supports size variants (sm, md, lg)
 * 4. Optional onLabel/offLabel for state indication
 * 5. Visual affordance: pill track + sliding thumb
 * 
 * @module ToggleRecipe
 * @since 2025-10-23
 */

import type { FieldValues } from 'react-hook-form';

export interface ToggleSpec {
  name: string;
  type: 'toggle';
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  ui?: {
    size?: 'sm' | 'md' | 'lg';
    onLabel?: string;   // e.g., "Enabled"
    offLabel?: string;  // e.g., "Disabled"
    fullWidth?: boolean;
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
 * Generate toggle switch implementation
 * 
 * Key features:
 * - Uses <input type="checkbox" role="switch">
 * - Emits .ds-toggle class
 * - Label wraps input for ≥ 44×44px hit area
 * - Boolean value/onChange handling
 * - Optional size variants
 * - Optional on/off state labels
 * - All ARIA attributes
 */
export function ToggleRecipe(spec: ToggleSpec): string {
  const {
    name,
    label,
    description,
    required = false,
    disabled = false,
    ui = {},
    aria = {},
    value = {},
  } = spec;
  
  const { size = 'md', onLabel, offLabel, fullWidth = false } = ui;
  const { live = 'polite' } = aria;
  const defaultValue = value.default ?? false;
  
  // Generate class names
  const sizeClass = size !== 'md' ? ` ds-toggle--${size}` : '';
  
  // Generate state label expression
  const stateLabel = onLabel && offLabel 
    ? `
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: 'var(--ds-color-text-muted)' }}>
                    {field.value ? '${onLabel}' : '${offLabel}'}
                  </span>`
    : '';
  
  // Capitalize field name for component
  const componentName = name.charAt(0).toUpperCase() + name.slice(1) + 'Field';
  
  return `import { Controller, type Control, type FieldErrors, type FieldValues } from 'react-hook-form';
import { FormLabel, FormHelperText } from '@intstudio/ds';

interface ${componentName}Props {
  name: string;
  control: Control<FieldValues>;
  errors: FieldErrors<FieldValues>;
  label?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
}

export function ${componentName}({
  name,
  control,
  errors,
  label = '${label || ''}',
  description = '${description || ''}',
  disabled = ${disabled},
  required = ${required},
}: ${componentName}Props) {
  const error = errors[name];
  const hasError = !!error;
  
  return (
    <div${fullWidth ? ' style={{ width: "100%" }}' : ''}>
      <Controller
        name={name}
        control={control}
        defaultValue={${defaultValue}}
        rules={{ required: required ? 'This field is required' : undefined }}
        render={({ field }) => (
          <label 
            htmlFor={name}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              minHeight: '44px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              userSelect: 'none',
            }}
          >
            <input
              {...field}
              type="checkbox"
              role="switch"
              className="ds-toggle${sizeClass}"
              id={name}
              aria-checked={field.value ?? ${defaultValue}}
              aria-invalid={hasError || undefined}
              aria-describedby={description ? \`\${name}-desc\` : undefined}
              aria-required={required || undefined}
              checked={field.value ?? ${defaultValue}}
              onChange={(e) => field.onChange(e.target.checked)}
              onBlur={field.onBlur}
              disabled={disabled}
            />
            {label && (
              <span style={{ opacity: disabled ? 0.5 : 1 }}>
                {label}
                {required && <span style={{ color: 'var(--ds-color-state-danger)', marginLeft: '0.25rem' }}>*</span>}${stateLabel}
              </span>
            )}
          </label>
        )}
      />
      
      {description && (
        <div id={\`\${name}-desc\`} style={{ marginTop: '0.5rem' }}>
          <FormHelperText size="sm" aria-live="${live}">
            {description}
          </FormHelperText>
        </div>
      )}
      
      {hasError && (
        <div style={{ marginTop: '0.5rem' }}>
          <FormHelperText size="sm" variant="error" aria-live="assertive">
            {error?.message as string}
          </FormHelperText>
        </div>
      )}
    </div>
  );
}
`;
}
