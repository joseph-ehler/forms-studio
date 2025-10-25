/**
 * FormRenderer: Schema-driven form rendering
 * 
 * Pattern: Same as DS layer (declarative, registry-driven)
 * - Takes typed FieldConfig[]
 * - Uses FIELD_TYPES registry to render
 * - Wires RHF Controller when control provided
 * - Falls back to uncontrolled when no control
 */

import * as React from 'react';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import type { FieldConfig } from './control/field-contracts';
import { getFieldComponent } from './registry/field-types';

export type FormRendererProps<TFieldValues extends FieldValues = FieldValues> = {
  /** Typed schema: array of FieldConfig */
  schema: { fields: FieldConfig[] };
  /** (Optional) RHF control; when provided we wire Controller automatically */
  control?: Control<TFieldValues>;
  /** Per-field error map (e.g., from RHF or custom) */
  errors?: Record<string, string | undefined>;
  /** When no RHF control provided, call here on any field change */
  onChangeUncontrolled?: (name: string, value: unknown) => void;
};

export function FormRenderer<T extends FieldValues = FieldValues>({
  schema,
  control,
  errors = {},
  onChangeUncontrolled,
}: FormRendererProps<T>) {
  return (
    <>
      {schema.fields.map((cfg) => {
        const Comp = getFieldComponent(cfg.type);
        const error = errors[cfg.name];

        if (control) {
          // RHF-controlled rendering
          return (
            <Controller
              key={cfg.name}
              name={cfg.name as Path<T>}
              control={control}
              render={({ field }) => (
                <Comp
                  {...(cfg as any)}
                  value={field.value}
                  onChange={(v: any) => field.onChange(v)}
                  error={error}
                />
              )}
            />
          );
        }

        // Uncontrolled rendering (local state inside fields)
        return (
          <Comp
            key={cfg.name}
            {...(cfg as any)}
            error={error}
            onChange={(v: any) => onChangeUncontrolled?.(cfg.name, v)}
          />
        );
      })}
    </>
  );
}
