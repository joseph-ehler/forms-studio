/**
 * Field Type Registry
 * 
 * Maps field type strings to React components.
 * Used by FormRenderer to instantiate correct field based on schema.
 * 
 * Pattern matches DS SKIN registry:
 * - Centralized mapping (single source of truth)
 * - Type-safe (TypeScript enforces)
 * - Auto-updated by generators
 */

import type { ComponentType } from 'react';
import type { FieldConfig } from '../control/field-contracts';

/**
 * Field component type
 * 
 * All field components must accept:
 * - Field config (name, label, etc.)
 * - Value (current field value)
 * - onChange (update handler)
 * - Error (validation error message)
 */
export type FieldComponent<T extends FieldConfig = FieldConfig> = ComponentType<
  T & {
    value?: any;
    onChange?: (value: any) => void;
    error?: string;
  }
>;

/**
 * Field registry - maps type string to component
 * 
 * Generators will add entries here:
 * ```typescript
 * import { TextField } from '../fields/TextField/TextField';
 * registerField('text', TextField);
 * ```
 */
export const FIELD_REGISTRY: Record<string, FieldComponent> = {};

/**
 * Register a field component
 * 
 * @param type - Field type identifier (e.g., 'text', 'email', 'select')
 * @param component - React component implementing the field
 * 
 * @example
 * ```typescript
 * registerField('text', TextField);
 * registerField('email', EmailField);
 * ```
 */
export function registerField<T extends FieldConfig>(
  type: string,
  component: FieldComponent<T>
): void {
  if (FIELD_REGISTRY[type]) {
    console.warn(`[Forms] Field type '${type}' is already registered. Overwriting.`);
  }
  FIELD_REGISTRY[type] = component as FieldComponent;
}

/**
 * Get a registered field component
 * 
 * @param type - Field type identifier
 * @returns Field component or undefined if not registered
 * 
 * @example
 * ```typescript
 * const TextField = getFieldComponent('text');
 * if (TextField) {
 *   return <TextField {...config} />;
 * }
 * ```
 */
export function getFieldComponent(type: string): FieldComponent | undefined {
  return FIELD_REGISTRY[type];
}

/**
 * Check if a field type is registered
 * 
 * @param type - Field type identifier
 * @returns True if field type is registered
 */
export function isFieldRegistered(type: string): boolean {
  return type in FIELD_REGISTRY;
}

/**
 * Get all registered field types
 * 
 * @returns Array of registered field type identifiers
 */
export function getRegisteredFieldTypes(): string[] {
  return Object.keys(FIELD_REGISTRY);
}
