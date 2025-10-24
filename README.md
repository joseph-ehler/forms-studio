# Intelligence Studio Forms

**Fresh, minimal monorepo for building platforms quickly.**

## 📦 **Packages**

### `@intstudio/ds`
Route shells + hooks + design tokens (your IP)
- `FullScreenRoute`, `RoutePanel`, `FlowScaffold`
- `useFocusTrap`, `useSubFlow`, `useOverlayPolicy`
- Design tokens (colors, spacing, shadows, z-index)

### `@intstudio/core`
Zod schemas + form specs + utilities
- Schema-first validation
- Light JSON form specs (optional)
- Type-safe helpers

### `@intstudio/ui-bridge`
Flowbite wrappers with React Hook Form
- `Form` (Zod + RHF integration)
- `Input`, `Select`, `Button` (with label/hint/error)
- Re-exports of Flowbite components

## 🚀 **Quick Start**

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run playground
pnpm play
```

## 💡 **Usage Example**

```tsx
import { FullScreenRoute } from '@intstudio/ds';
import { Form, Input, Select, Button } from '@intstudio/ui-bridge';
import { CreateProjectSchema } from '@intstudio/core';

export function CreateProject() {
  return (
    <FullScreenRoute ariaLabel="Create project">
      <div className="max-w-md mx-auto p-6">
        <Form
          schema={CreateProjectSchema}
          defaultValues={{ visibility: 'private' }}
          onSubmit={(data) => console.log(data)}
        >
          <Input name="name" label="Project name" required />
          <Input name="email" label="Owner email" type="email" />
          <Select
            name="visibility"
            label="Visibility"
            options={[
              { value: 'private', label: 'Private' },
              { value: 'team', label: 'Team' },
              { value: 'public', label: 'Public' },
            ]}
          />
          <Button type="submit">Create</Button>
        </Form>
      </div>
    </FullScreenRoute>
  );
}
```

## 🎯 **Philosophy**

**Speed > Perfection**
- Use Flowbite for UI (battle-tested, fast)
- Custom route shells for app structure
- Schema-first with Zod (type-safe, validated)
- AI-friendly (minimal boilerplate)

**What This Is NOT:**
- ❌ Not a component factory
- ❌ Not trying to be one-size-fits-all
- ❌ Not reinventing Flowbite

**What This IS:**
- ✅ Fast platform for building platforms
- ✅ Schema-first forms with Zod + RHF
- ✅ High-value route shells (your IP)
- ✅ Clean, minimal, organized

## 🔄 **Rollback**

Safety tag created: `pre-nuke-2025-10-24`

```bash
git checkout pre-nuke-2025-10-24
```

---

**Built for velocity. Optimized for clarity.**
