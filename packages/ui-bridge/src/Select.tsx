import { Label, Select as FlowbiteSelect, type SelectProps as FlowbiteSelectProps } from 'flowbite-react';

export interface SelectProps extends FlowbiteSelectProps {
  label?: string;
  hint?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

/**
 * Select wrapper around Flowbite Select
 * Provides consistent label/hint/error pattern
 */
export function Select({ label, hint, error, options, id, ...rest }: SelectProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <Label htmlFor={id} value={label} />}
      <FlowbiteSelect
        id={id}
        color={error ? 'failure' : undefined}
        helperText={error || hint}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </FlowbiteSelect>
    </div>
  );
}
