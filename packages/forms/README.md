# @intstudio/forms

Schema-driven form fields that compose `@intstudio/ds` primitives.

## Features

- 🎯 **Schema-driven**: Define forms with TypeScript configs
- 🧩 **Composable**: Built on DS primitives (Button, Input, Select, etc.)
- ✅ **Validated**: Powered by Zod + React Hook Form
- ♿ **Accessible**: ARIA attributes, keyboard navigation, screen reader support
- 🎨 **Themeable**: Inherits DS design tokens
- 🏭 **Generated**: Use `pnpm forms:new` to create new fields

## Installation

```bash
pnpm add @intstudio/forms
```

## Usage

```tsx
import { TextField } from '@intstudio/forms';

function MyForm() {
  return (
    <TextField
      name="email"
      label="Email Address"
      placeholder="you@example.com"
      required
      hint="We'll never share your email"
    />
  );
}
```

## Generating Fields

```bash
# Generate a new field (composes DS primitives)
pnpm forms:new TextField

# Custom DS component
pnpm forms:new PhoneField --ds-component Input

# Validate
pnpm doctor
```

## Architecture

```
src/
  ├── control/           # Field contracts (types)
  │   └── field-contracts.ts
  ├── registry/          # Field type mapping
  │   └── field-types.ts
  └── fields/            # Individual field components
      ├── TextField/
      ├── EmailField/
      └── SelectField/
```

## Principles

- **Compose DS primitives**: Never import Flowbite directly
- **Type-safe**: All fields extend `BaseFieldConfig`
- **Registry pattern**: Centralized field type mapping
- **Auto-wiring**: Field registration automated by generators

## Documentation

- [Generators Guide](../../docs/handbook/GENERATORS_GUIDE.md)
- [Factory Operating Manual](../../docs/handbook/FACTORY_OPERATING_MANUAL.md)

## License

Apache-2.0
