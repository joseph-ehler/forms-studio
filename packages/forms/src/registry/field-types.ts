/**
 * Field registry: centralized field type mapping
 * 
 * Pattern: Same as DS layer (registry/skins/*)
 * - Central registry of all field types
 * - TypeScript-enforced completeness
 * - Easy to extend (add new field type → update here)
 */

import type { ComponentType } from 'react';

import type { FieldConfig, FieldType, SelectFieldConfig } from '../control/field-contracts';
import { SelectField } from '../fields/SelectField';

type FieldComponentMap = {
  select: ComponentType<SelectFieldConfig>;
  // text: ComponentType<TextFieldConfig>;
  // email: ComponentType<EmailFieldConfig>;
};

export const FIELD_TYPES: Record<FieldType, ComponentType<FieldConfig>> = {
  select: SelectField as ComponentType<FieldConfig>,
  // text: TextField as ComponentType<FieldConfig>,
  // email: EmailField as ComponentType<FieldConfig>,
} as const;

/** Safe accessor (useful inside FormRenderer) */
export function getFieldComponent<T extends FieldType>(
  type: T
): ComponentType<Extract<FieldConfig, { type: T }>> {
  return FIELD_TYPES[type] as any;
}
