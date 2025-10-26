/**
 * Form Field Contracts - TypeScript-based validation
 * 
 * Single source of truth for field configurations.
 * All fields extend BaseFieldConfig for consistency.
 * 
 * Pattern matches DS SKIN contracts:
 * - control/ defines types (contracts)
 * - registry/ implements mapping (field types)
 * - fields/ consume contracts (components)
 */

/**
 * Base configuration for all form fields
 * 
 * Every field extends this to ensure consistency.
 */
export type BaseFieldConfig = {
  /**
   * Field name (maps to form data key)
   */
  name: string;
  
  /**
   * Display label
   */
  label: string;
  
  /**
   * Optional hint text (shown below label)
   */
  hint?: string;
  
  /**
   * Whether field is required
   */
  required?: boolean;
  
  /**
   * Whether field is disabled
   */
  disabled?: boolean;
  
  /**
   * Placeholder text
   */
  placeholder?: string;
  
  /**
   * Visual variant (maps to DS variants)
   */
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
};

/**
 * All field configuration types
 * 
 * This union will grow as fields are added via generators.
 * Each field type extends BaseFieldConfig with field-specific properties.
 * 
 * Example (after generating):
 * export type FieldConfig = 
 *   | TextFieldConfig
 *   | EmailFieldConfig
 *   | SelectFieldConfig;
 */
export type FieldConfig = BaseFieldConfig & {
  // Placeholder - will be replaced by generators
  type: string;
};
