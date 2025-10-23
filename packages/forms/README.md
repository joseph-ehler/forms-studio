# @intstudio/forms

**Form Studio** - Declarative forms with Zod validation

## Overview

The Forms package provides a complete form solution built on:
- **Zod** for schema validation
- **react-hook-form** for state management
- **@intstudio/ds** for UI primitives
- **@intstudio/core** for utilities

## Structure

```
src/
├── form-core/       # Zod schemas, validation, form state
├── fields/          # Base fields (TextField, DateField, etc.)
├── composites/      # Complex fields (Address, Phone, etc.)
├── renderer/        # JSON spec → React components
└── adapters/        # Data source integrations
```

## Usage

```typescript
import { createForm, TextField } from '@intstudio/forms';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

const form = createForm({ schema });

<form>
  <TextField name="email" label="Email" control={form.control} />
  <TextField name="name" label="Name" control={form.control} />
</form>
```

## Migration Status

**Phase 3 - In Progress**

- [x] Package scaffold created
- [ ] form-core implementation
- [ ] Migrate TextField
- [ ] Migrate remaining fields
- [ ] Renderer implementation
- [ ] Adapter integrations

## Dependencies

- `@intstudio/ds` - UI primitives
- `@intstudio/core` - Utilities
- `react-hook-form` - Form state
- `zod` - Validation

## Development

```bash
# Build
pnpm -F @intstudio/forms build

# Watch mode
pnpm -F @intstudio/forms dev

# Test
pnpm -F @intstudio/forms test
```
