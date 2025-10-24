import { Controller, type Control, type FieldErrors, type FieldValues } from 'react-hook-form';
import { FormLabel, FormHelperText } from '@intstudio/ds';

interface ToggleFieldProps {
  name: string;
  control: Control<FieldValues>;
  errors: FieldErrors<FieldValues>;
  label?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
}

export function ToggleField({
  name,
  control,
  errors,
  label = '',
  description = '',
  disabled = false,
  required = false
}: ToggleFieldProps) {
  const error = errors[name];
  const hasError = !!error;

  return (
    <div>
      <Controller
        name={name}
        control={control}
        defaultValue={false}
        rules={{ required: required ? 'This field is required' : undefined }}
        render={({ field }) =>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            minHeight: '44px',
            padding: '11px 0',
          }}>

            <input
            {...field}
            type="checkbox"
            role="switch"
            className="ds-toggle ds-toggle"
            id={name}
            aria-checked={field.value ?? false}
            aria-invalid={hasError || undefined}
            aria-describedby={description ? `${name}-desc` : undefined}
            aria-required={required || undefined}
            aria-label={label || name}
            checked={field.value ?? false}
            onChange={(e) => field.onChange(e.target.checked)}
            onBlur={field.onBlur}
            disabled={disabled}
            style={{ flexShrink: 0 }} />

            {label &&
          <label
            htmlFor={name}
            style={{
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? 'not-allowed' : 'pointer',
              userSelect: 'none'
            }}>

                {label}
                {required && <span style={{ color: 'var(--ds-color-state-danger)', marginLeft: '0.25rem' }}>*</span>}
              </label>
          }
          </div>
        } />

      
      {description &&
      <div id={`${name}-desc`} style={{ marginTop: '0.5rem' }}>
          <FormHelperText size="sm" aria-live="polite">
            {description}
          </FormHelperText>
        </div>
      }
      
      {hasError &&
      <div style={{ marginTop: '0.5rem' }}>
          <FormHelperText size="sm" variant="error" aria-live="assertive">
            {error?.message as string}
          </FormHelperText>
        </div>
      }
    </div>);

}