/**
 * SelectField: Example field using DS primitives
 * 
 * Pattern: Compose DS primitives (Flowbite-wrapped)
 * - Uses @intstudio/ds/fb/Select (DS primitive)
 * - DS Select handles label/hint/error internally
 * - Wires RHF (value/onChange) when provided
 * - Falls back to local state when uncontrolled
 */

import { Select } from '@intstudio/ds/fb'; // DS primitive (Flowbite-wrapped)
import * as React from 'react';

import type { SelectFieldConfig } from '../../control/field-contracts';

export const SelectField: React.FC<SelectFieldConfig & {
  /** RHF wiring (optional): value + onChange from Controller */
  value?: string;
  onChange?: (value: string) => void;
  /** error message (computed by RHF/Zod) */
  error?: string;
}> = ({
  name,
  label,
  hint,
  disabled,
  required,
  variant = 'default',
  options,
  placeholder,
  defaultValue,
  value,
  onChange,
  error,
  'data-testid': testid,
}) => {
  // local uncontrolled fallback (if not RHF-controlled)
  const [internal, setInternal] = React.useState<string | undefined>(defaultValue);

  const current = value ?? internal;
  const handleChange = (newValue: string) => {
    onChange ? onChange(newValue) : setInternal(newValue);
  };

  // derive DS variant based on error (danger wins)
  const dsVariant = error ? 'danger' : variant;

  const id = name;
  return (
    <Select
      id={id}
      value={current}
      onChange={handleChange}
      options={options}
      placeholder={placeholder}
      disabled={disabled}
      error={error}
      hint={hint}
    />
  );
};
