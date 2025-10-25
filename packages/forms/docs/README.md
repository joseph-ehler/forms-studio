# @intstudio/forms

Form field layer for Intelligence Studio - schema-driven form rendering using DS primitives.

## Architecture

Follows the **exact same pattern** as `@intstudio/ds`:

```
control/          → TypeScript contracts (like skin-contracts.ts)
registry/         → Field type registry (like SKIN registry)
fields/           → Field components (compose DS primitives)
FormRenderer.tsx  → Schema → Fields (declarative rendering)
```

## Pattern Consistency

| DS Layer | Forms Layer |
|----------|-------------|
| `variants.config.ts` | `field-contracts.ts` |
| `BUTTON_SKIN: SkinRecord<...>` | `FIELD_TYPES: Record<...>` |
| TypeScript enforces SKIN | TypeScript enforces configs |
| Flowbite → DS primitives | DS primitives → Fields |

## Usage

### Basic Example (RHF-controlled)

```tsx
import { useForm } from 'react-hook-form';
import { FormRenderer } from '@intstudio/forms';

const schema = {
  fields: [
    {
      type: 'select',
      name: 'country',
      label: 'Country',
      placeholder: 'Choose one',
      options: [
        { label: 'United States', value: 'us' },
        { label: 'Canada', value: 'ca' },
      ],
      validation: [{ type: 'required', message: 'Please choose a country' }],
    }
  ],
} as const;

export default function Demo() {
  const form = useForm({ defaultValues: { country: '' } });

  return (
    <form onSubmit={form.handleSubmit(console.log)} className="space-y-4">
      <FormRenderer schema={schema} control={form.control} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Uncontrolled Example

```tsx
import { FormRenderer } from '@intstudio/forms';

const schema = {
  fields: [
    {
      type: 'select',
      name: 'country',
      label: 'Country',
      options: [...],
    }
  ],
};

export default function Demo() {
  const handleChange = (name: string, value: unknown) => {
    console.log({ [name]: value });
  };

  return (
    <FormRenderer 
      schema={schema} 
      onChangeUncontrolled={handleChange} 
    />
  );
}
```

## Adding a New Field Type

### 1. Define Contract

```typescript
// src/control/field-contracts.ts
export type TextFieldConfig = BaseFieldProps & {
  type: 'text';
  placeholder?: string;
  maxLength?: number;
  validation?: ValidationSpec;
};

export type FieldConfig =
  | SelectFieldConfig
  | TextFieldConfig; // Add here
```

### 2. Create Field Component

```typescript
// src/fields/TextField/TextField.tsx
import { Input } from '@intstudio/ds/fb'; // Use DS primitive
import { Field } from '@intstudio/ds/fb';

export const TextField: React.FC<TextFieldConfig & {...}> = ({
  name, label, placeholder, ...
}) => {
  return (
    <Field id={name} label={label}>
      <Input 
        id={name}
        name={name}
        placeholder={placeholder}
        // ... compose DS primitive
      />
    </Field>
  );
};
```

### 3. Register in Registry

```typescript
// src/registry/field-types.ts
import { TextField } from '../fields/TextField';

export const FIELD_TYPES: Record<FieldType, ComponentType<FieldConfig>> = {
  select: SelectField,
  text: TextField, // Add here
};
```

### 4. Export from Package

```typescript
// src/index.ts
export * from './fields/TextField';
```

## Validation

Same as DS layer:

```bash
pnpm --filter @intstudio/forms typecheck  # ✅
pnpm --filter @intstudio/forms build      # ✅
pnpm doctor                                # ✅ (full monorepo gate)
```

## Key Principles

1. **TypeScript Contracts > JSON Schemas**: Compile-time enforcement
2. **Compose DS Primitives**: Never import Flowbite directly
3. **Registry Pattern**: Central mapping, easy to extend
4. **RHF-Friendly**: Controller wiring when control provided
5. **Uncontrolled Fallback**: Local state when no control

## Field Components Available

- ✅ **SelectField** - Uses `@intstudio/ds/fb/Select`
- 🚧 **TextField** - Coming soon
- 🚧 **EmailField** - Coming soon
- 🚧 **CheckboxField** - Coming soon

## Dependencies

- `react` (>=18) - UI framework
- `react-hook-form` (>=7) - Form state management
- `@intstudio/ds` - Design system primitives (Flowbite-wrapped)

## Philosophy

Forms layer **composes** DS primitives, never reimplements them:

- ✅ Use `@intstudio/ds/fb/Select` (not raw Flowbite)
- ✅ Use `@intstudio/ds/fb/Field` (label/hint/error)
- ✅ Use DS variants (danger/success)
- ✅ Follow same contract/registry pattern

**Result**: Forms get DS quality (SKIN-driven, tokens, a11y) for free.
