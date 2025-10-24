/**
 * @intstudio/ui-bridge - Flowbite wrappers with RHF
 */

// Form with Zod integration
export { Form } from './rhf/Form';
export type { FormProps } from './rhf/Form';

// Form fields
export { Input } from './form/Input';
export type { InputProps } from './form/Input';

export { Select } from './form/Select';
export type { SelectProps } from './form/Select';

export { Button } from './form/Button';
export type { ButtonProps } from './form/Button';

// Field utilities
export { useFieldIds } from './form/Field';

// Re-export commonly used Flowbite components
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
