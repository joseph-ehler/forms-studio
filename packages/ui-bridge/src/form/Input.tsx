/**
 * Input wrapper with RHF integration
 */
import { Controller, useFormContext } from 'react-hook-form';
import { Label, TextInput, type TextInputProps } from 'flowbite-react';
import { useFieldIds } from './Field';

export type InputProps = Omit<TextInputProps, 'name'> & {
  name: string;
  label?: string;
  hint?: string;
  required?: boolean;
  fullWidth?: boolean;
};

/**
 * Text input with label, hint, and error handling
 * Auto-wired with React Hook Form
 * 
 * @example
 * ```tsx
 * <Input name="email" label="Email" type="email" required />
 * ```
 */
export function Input({
  name,
  label,
  hint,
  required,
  fullWidth,
  ...rest
}: InputProps) {
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
            <TextInput
              {...field}
              {...rest}
              id={ids.id}
              color={error ? 'failure' : undefined}
              aria-required={required || undefined}
              aria-invalid={!!error || undefined}
              aria-describedby={describedBy}
            />
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
