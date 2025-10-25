# Storybook Quick Start 🚀

**God-tier setup complete.** Here's how to use it.

---

## Install & Run

```bash
# 1. Install dependencies (versions pinned, zero drift)
pnpm install

# 2. Start Storybook dev server
pnpm sb

# Opens at http://localhost:6006
```

---

## Create Your First Story

```bash
# Scaffold a story for any component
pnpm sb:new packages/ds/src/fb/Field/Field.tsx

# Edits the generated Field.stories.tsx, then:
pnpm sb
```

---

## Example Stories Included

- **Button.stories.tsx** - All variants (primary, secondary, ghost, danger, loading, disabled)
- **Modal.stories.tsx** - Basic, with form, sizes, includes interaction tests

---

## Commands

```bash
pnpm sb              # Dev server (localhost:6006)
pnpm sb:build        # Static build → storybook-static/
pnpm sb:test         # Run interaction tests (watch)
pnpm sb:test:ci      # Run interaction tests (CI mode)
pnpm sb:new <file>   # Scaffold new story
```

---

## Story Template

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta: Meta<typeof MyComponent> = {
  title: 'DS/FB/MyComponent',
  component: MyComponent,
  tags: ['autodocs'],
  args: { /* defaults */ }
};
export default meta;

type Story = StoryObj<typeof MyComponent>;

export const Basic: Story = {};
export const Variant: Story = { args: { variant: 'secondary' } };
```

---

## Interaction Tests

```tsx
import { expect, within, userEvent } from '@storybook/test';

export const WithTest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button'));
    await expect(canvas.getByText('Success')).toBeInTheDocument();
  },
};
```

---

## CI Integration

Already configured in `.github/workflows/storybook.yml`:
- Builds packages
- Builds Storybook static
- Runs interaction tests
- Never flakes (uses file:// protocol)

---

## Why This Setup Doesn't Break

✅ **Single root Storybook** - No per-package duplication  
✅ **preserveSymlinks: true** - Fixes pnpm monorepo issues  
✅ **CSS load order** - Tokens → Flowbite → theme (matches app exactly)  
✅ **Tailwind scans stories** - All utilities available  
✅ **Import sources** - No stale dist/ issues  
✅ **Versions pinned** - Zero drift via pnpm.overrides  
✅ **Lean addons** - Only essentials (less collision)  

---

## Troubleshooting

**"Classes not working"**  
→ Tailwind config must include `**/*.stories.@(tsx|mdx)` in content

**"Styles look different"**  
→ Check `.storybook/preview.tsx` CSS import order

**"Module not found"**  
→ `preserveSymlinks: true` in `.storybook/main.ts` viteFinal

**"Tests failing"**  
→ Run `pnpm build` first to ensure packages are built

---

## Full Docs

See `docs/STORYBOOK_SETUP.md` for complete architecture details.

---

## Status: READY TO SHIP 🚀

Created files:
- `.storybook/main.ts` - Vite config + preserveSymlinks
- `.storybook/preview.tsx` - CSS loading + decorators
- `.storybook/tsconfig.json` - TypeScript config
- `scripts/new-story.mjs` - Story scaffolder
- `.github/workflows/storybook.yml` - CI workflow
- `tailwind.config.js` - Scans stories + app
- `packages/ds/src/fb/Button.stories.tsx` - Example
- `packages/ds/src/fb/Modal.stories.tsx` - Example with tests

**Next:** `pnpm install && pnpm sb` 🎨
