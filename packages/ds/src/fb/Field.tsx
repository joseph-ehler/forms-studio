import { Label } from 'flowbite-react';
import { cloneElement,ReactElement, ReactNode } from 'react';

import { devAssert } from '../utils';

export type FieldProps = {
  /**
   * Label text
   */
  label: string;
  
  /**
   * Input ID (REQUIRED for htmlFor accessibility)
   * Throws in dev mode if missing
   */
  id: string;
  
  /**
   * Whether field is required
   * Shows visual indicator and adds aria-required
   * @default false
   */
  required?: boolean;
  
  /**
   * Error message (displayed below input)
   * Auto-wires aria-invalid and aria-describedby
   */
  error?: string;
  
  /**
   * Hint text (displayed below label, above input)
   * Auto-wires aria-describedby
   */
  hint?: string;
  
  /**
   * Input element (must accept id, aria-* props)
   */
  children: ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
};

/**
 * Field - Composition wrapper for label + input + error + hint
 * 
 * Adds:
 * - Enforces htmlFor contract (throws if id missing)
 * - Auto-wires aria-describedby (hint + error)
 * - Auto-wires aria-invalid when error present
 * - Consistent error/hint display
 * - Required indicator
 * 
 * @example
 * ```tsx
 * <Field
 *   label="Product Name"
 *   id="name"
 *   required
 *   error={errors.name}
 *   hint="Enter a unique name"
 * >
 *   <Input id="name" value={name} onChange={...} />
 * </Field>
 * ```
 */
export function Field({
  label,
  id,
  required,
  error,
  hint,
  children,
  className,
}: FieldProps) {
  // Runtime contract (dev mode only)
  devAssert(id, '[DS.Field] id is required for htmlFor accessibility');

  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  // Clone child and inject aria props
  const enhancedChild = typeof children === 'object' &&
    children !== null &&
    'props' in children
    ? cloneElement(children as ReactElement, {
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
        'aria-required': required,
      } as any)
    : children;

  return (
    <div className={className} data-component="field" data-field-id={id}>
      <Label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
        {required && (
          <span
            className="ml-1 text-danger"
            aria-label="required"
            data-required
          >
            *
          </span>
        )}
      </Label>

      {hint && (
        <p id={hintId} className="mb-2 text-sm text-text-subtle">
          {hint}
        </p>
      )}

      <div data-field-control>{enhancedChild}</div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-2 text-sm text-danger"
          data-field-error
        >
          {error}
        </p>
      )}
    </div>
  );
}
