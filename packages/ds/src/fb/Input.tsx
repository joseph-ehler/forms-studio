/**
 * Input - Control-panel-driven, token-only implementation
 * 
 * Pattern:
 * - Imports SKIN from registry
 * - CSS reads only --input-* vars
 * - Variants auto-expand from control/variants.config.ts
 */

import './Input.css';

import * as React from 'react';

import { InputVariant } from '../control/variants.config';
import { INPUT_SKIN } from '../registry/skins/input.skin';

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  variant?: InputVariant;
  size?: 'sm' | 'md' | 'lg';
  id: string;                 // required for Field htmlFor
  error?: string;
  hint?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  onClear?: () => void;
  debug?: boolean;
};

export function Input({
  id,
  error,
  hint,
  iconLeft,
  iconRight,
  onClear,
  variant = 'default',
  size = 'md',
  disabled,
  style,
  className,
  ...rest
}: Props) {
  const skin = INPUT_SKIN[variant];
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(' ') || undefined;

  return (
    <div data-component="input" data-variant={variant} data-size={size} style={skin as React.CSSProperties}>
      <div className="relative">
        {iconLeft && <span className="absolute inset-y-0 left-3 flex items-center">{iconLeft}</span>}
        <input
          id={id}
          aria-invalid={!!error || undefined}
          aria-describedby={describedBy}
          style={style}
          disabled={disabled}
          className={className}
          {...rest}
        />
        {iconRight && <span className="absolute inset-y-0 right-3 flex items-center">{iconRight}</span>}
        {onClear && (
          <button
            type="button"
            className="absolute inset-y-0 right-3 flex items-center"
            aria-label="Clear"
            onClick={onClear}
          >
            ×
          </button>
        )}
      </div>
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

// Re-export types
export type { InputVariant };
