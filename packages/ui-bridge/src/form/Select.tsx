/**
 * Select wrapper with RHF integration
 */
import { Label, Select as FlowbiteSelect, type SelectProps as FlowbiteSelectProps } from 'flowbite-react';
import { Controller, useFormContext } from 'react-hook-form';

import { useFieldIds } from './Field';

export type SelectProps = Omit<FlowbiteSelectProps, 'name'> & {
  name: string;
  label?: string;
  hint?: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
  fullWidth?: boolean;
};

/**
 * Select dropdown with label, hint, and error handling
 * Auto-wired with React Hook Form
 * 
 * @example
 * ```tsx
 * <Select
 *   name="visibility"
 *   label="Visibility"
 *   options={[
 *     { value: 'private', label: 'Private' },
 *     { value: 'public', label: 'Public' },
 *   ]}
 * />
 * ```
 */
export function Select({
  name,
  label,
  hint,
  required,
  options,
  fullWidth,
  ...rest
}: SelectProps) {
  const { control } = useFormContext();
  const ids = useFieldIds(name);

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required }}
      render={({ field, fieldState }) => {
        const error = fieldState.error?.message;
        const describedBy = ids.describedBy(!!hint, !!error);

        return (
          <div className={`flex flex-col gap-2 ${fullWidth ? 'w-full' : ''}`}>
            {label && (
              <Label htmlFor={ids.id} value={label + (required ? ' *' : '')} />
            )}
            <FlowbiteSelect
              {...field}
              {...rest}
              id={ids.id}
              color={error ? 'failure' : undefined}
              aria-required={required || undefined}
              aria-invalid={!!error || undefined}
              aria-describedby={describedBy}
            >
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </FlowbiteSelect>
            {hint && !error && (
              <p id={ids.hintId} className="text-sm text-gray-500">
                {hint}
              </p>
            )}
            {error && (
              <p id={ids.errId} className="text-sm text-red-600">
                {error}
              </p>
            )}
          </div>
        );
      }}
    />
  );
}
