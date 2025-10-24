/**
 * Light FormSpec for simple JSON-driven forms
 * Keep this minimal - not a factory replacement
 */

export type FieldSpec =
  | { kind: 'text'; name: string; label: string; required?: boolean; inputType?: 'text' | 'email' | 'password' | 'tel' | 'url' }
  | { kind: 'select'; name: string; label: string; options: { label: string; value: string }[]; required?: boolean }
  | { kind: 'checkbox'; name: string; label: string; required?: boolean }
  | { kind: 'textarea'; name: string; label: string; required?: boolean; rows?: number };

export type FormSpec = {
  title?: string;
  description?: string;
  fields: FieldSpec[];
};
