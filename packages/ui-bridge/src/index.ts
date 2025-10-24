/**
 * UI Bridge - Thin wrapper around Flowbite components
 * Provides consistent defaults and easy future swaps
 */

export { Input } from './Input';
export type { InputProps } from './Input';

export { Button } from './Button';
export type { ButtonProps } from './Button';

export { Select } from './Select';
export type { SelectProps } from './Select';

// Re-export commonly used Flowbite components directly
export {
  Checkbox,
  Textarea,
  ToggleSwitch,
  Radio,
  FileInput,
  Card,
  Badge,
  Spinner,
  Tooltip,
  Dropdown,
  Modal,
  Tabs,
} from 'flowbite-react';
