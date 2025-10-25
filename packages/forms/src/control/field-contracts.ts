/**
 * TypeScript contracts for form fields: single source of truth.
 * 
 * Pattern: Same as DS layer (control/skin-contracts.ts)
 * - TypeScript types (not JSON schemas)
 * - Compile-time enforcement
 * - Single source of truth for field configs
 */

export type BaseFieldProps = {
  /** RHF field name, e.g. "user.email" */
  name: string;
  /** Visual label */
  label?: string;
  /** Help text under the field */
  hint?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Mark as required (UI); validation still defined below */
  required?: boolean;
  /** DS variant flow-through (danger/success/etc.) — usually driven by error state */
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  /** Optional test id */
  'data-testid'?: string;
};

export type ValidationRule =
  | { type: 'required'; message?: string }
  | { type: 'minLength'; value: number; message?: string }
  | { type: 'maxLength'; value: number; message?: string }
  | { type: 'pattern'; value: RegExp; message?: string }
  | { type: 'custom'; validate: (value: unknown) => true | string };

export type ValidationSpec = ValidationRule[];

// ---- SELECT ---------------------------------------------------------------

export type SelectOption = { label: string; value: string; disabled?: boolean };

export type SelectFieldConfig = BaseFieldProps & {
  type: 'select';
  /** Options to render */
  options: SelectOption[];
  /** Placeholder (first option) */
  placeholder?: string;
  /** Default value for uncontrolled forms */
  defaultValue?: string;
  /** Validation rules (RHF-friendly) */
  validation?: ValidationSpec;
};

// ---- Extend here for more field types ------------------------------------
// export type TextFieldConfig = BaseFieldProps & { type: 'text'; ... };
// export type EmailFieldConfig = BaseFieldProps & { type: 'email'; ... };

export type FieldConfig =
  | SelectFieldConfig;
// | TextFieldConfig | EmailFieldConfig | ...

export type FieldType = FieldConfig['type'];
