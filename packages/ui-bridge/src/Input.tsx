import { Label, TextInput, type TextInputProps } from 'flowbite-react';

export interface InputProps extends Omit<TextInputProps, 'sizing'> {
  label?: string;
  hint?: string;
  error?: string;
}

/**
 * Input wrapper around Flowbite TextInput
 * Provides consistent label/hint/error pattern
 */
export function Input({ label, hint, error, id, ...rest }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <Label htmlFor={id} value={label} />}
      <TextInput
        id={id}
        color={error ? 'failure' : undefined}
        helperText={error || hint}
        {...rest}
      />
    </div>
  );
}
