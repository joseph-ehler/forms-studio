/**
 * @intstudio/ui-bridge - Flowbite wrappers with RHF
 */

// Form with Zod integration
export type { FormProps } from './rhf/Form';
export { Form } from './rhf/Form';

// Form fields
export type { ButtonProps } from './form/Button';
export { Button } from './form/Button';
export type { InputProps } from './form/Input';
export { Input } from './form/Input';
export type { SelectProps } from './form/Select';
export { Select } from './form/Select';

// Field utilities
export { useFieldIds } from './form/Field';

// Re-export commonly used Flowbite components
export {
  Badge,
  Card,
  Checkbox,
  Dropdown,
  FileInput,
  Modal,
  Radio,
  Spinner,
  Tabs,
  Textarea,
  ToggleSwitch,
  Tooltip,
} from 'flowbite-react';
