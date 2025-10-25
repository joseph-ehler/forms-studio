# feat(forms): TypeScript contracts + renderer (schema-driven forms)

## Summary

Forms layer following the **exact same pattern** as DS layer (TypeScript contracts, centralized registry, composable primitives).

- **TypeScript contracts** (`field-contracts.ts`) - no JSON schemas
- **Field registry** (`field-types.ts`) - central mapping, extensible
- **SelectField example** - composes `@intstudio/ds/fb/Select`
- **FormRenderer MVP** - schema → fields, RHF-friendly

## Why

Same pattern as DS = same benefits:
- **Compile-time enforcement** (missing configs fail in editor)
- **One-place edits** (contracts + registry)
- **Composable** (fields use DS primitives, never Flowbite directly)
- **Intelligence Studio ready** (schema-driven form generation)

## Architecture

### Pattern Consistency with DS:

| DS Layer | Forms Layer | ✅ |
|----------|-------------|-----|
| `variants.config.ts` | `field-contracts.ts` | Same pattern |
| `BUTTON_SKIN: SkinRecord<...>` | `FIELD_TYPES: Record<...>` | Same pattern |
| TypeScript enforces SKIN | TypeScript enforces configs | Same pattern |
| Flowbite → DS primitives | DS primitives → Fields | Same pattern |

### Files Created:

```
packages/forms/
  src/
    control/
      field-contracts.ts         # TypeScript contracts (like skin-contracts.ts)
    registry/
      field-types.ts              # Field registry (like SKIN registry)
    fields/
      SelectField/
        SelectField.tsx           # Composes @intstudio/ds/fb/Select
        SelectField.stories.tsx   # Storybook tests
    FormRenderer.tsx              # Schema → Fields MVP
  docs/README.md                  # Usage guide
```

## Usage Example

```typescript
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

export default function MyForm() {
  const form = useForm({ defaultValues: { country: '' } });

  return (
    <form onSubmit={form.handleSubmit(console.log)}>
      <FormRenderer schema={schema} control={form.control} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Validation

```bash
✅ pnpm lint:prod       # 0 errors
✅ pnpm typecheck       # All 5 packages pass
✅ pnpm build           # All packages compile
```

## Dependencies on PR #1

This PR builds on the DS layer from PR #1 (`feat/ds-flowbite-skin`):
- ✅ Uses `@intstudio/ds/fb/Select` (Flowbite wrapper)
- ✅ Fields compose DS primitives (never import Flowbite directly)
- ✅ Same contract/registry pattern

## Breaking Changes

None. This is a **new package** (`@intstudio/forms`).

## Follow-ups

- **P1**: Add more field types (TextField, EmailField, CheckboxField)
- **P2**: Validation integration (Zod schemas → RHF)
- **P3**: Advanced fields (DatePicker, AsyncSelect, FileUpload)
- **P4**: Storybook matrix tests for all fields

## Reviewer Checklist

- [ ] Contracts present (`field-contracts.ts`)
- [ ] Registry centralized (`field-types.ts`)
- [ ] Fields compose DS primitives (no Flowbite imports)
- [ ] FormRenderer handles RHF + uncontrolled
- [ ] CI checks green (lint/type/build)

---

**Philosophy**: Forms compose DS primitives. DS composes Flowbite. Clean separation, no coupling.

Same pattern, proven approach. 🚀
