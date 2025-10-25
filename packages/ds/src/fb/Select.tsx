import * as React from 'react';

import { withContract } from '../utils/withContract';

type Option = { label: string; value: string; disabled?: boolean };

type Props = {
  id: string;                 // required
  value?: string;
  onChange?: (value: string) => void;
  options: Option[];
  placeholder?: string;       // renders as disabled first option
  error?: string;
  hint?: string;
  disabled?: boolean;
  debug?: boolean;
};

function SelectCore({
  id,
  value,
  onChange,
  options,
  placeholder,
  error,
  hint,
  disabled,
}: Props) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(' ') || undefined;

  return (
    <div data-component="select" data-state={error ? 'error' : 'ok'}>
      <select
        id={id}
        className="block w-full rounded-lg border border-[var(--ds-color-border-subtle)] bg-surface p-2"
        aria-invalid={!!error || undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange?.(e.currentTarget.value)}
      >
        {placeholder && (
          <option value="" disabled>{placeholder}</option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>

      {hint && (
        <p id={hintId} className="mt-1 text-sm text-text/70">
          {hint}
        </p>
      )}
      {error && (
        <p id={errId} role="alert" className="mt-1 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

const requireId = (p: Props) => {
  if (process.env.NODE_ENV !== 'production' && !p.id) {
    throw new Error('[DS.Select] id is required for accessibility');
  }
};
const requireOptions = (p: Props) => {
  if (process.env.NODE_ENV !== 'production' && (!p.options || p.options.length === 0)) {
    throw new Error('[DS.Select] options[] is required');
  }
};

export const Select = withContract<Props>(SelectCore, [requireId, requireOptions], 'Select');
