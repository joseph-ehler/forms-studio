# Flowbite Migration Plan

**Date:** 2025-10-24  
**Status:** In Progress  
**Goal:** Pivot from custom field factory to Flowbite for 10x velocity  
**Estimated Time:** 2-3 days for full migration

---

## 📋 **Overview**

**What We're Doing:**
- Adding Flowbite + Tailwind for all form fields & UI primitives
- Keeping route shells, tokens, and behavioral hooks (high-value)
- Archiving field factory, recipes, refiner (overhead)

**What We're NOT Doing:**
- Deleting anything (archive only)
- Touching route shells (`FullScreenRoute`, `FlowScaffold`, `RoutePanel`)
- Removing tokens or core hooks

---

## ✅ **Progress Tracker**

### **Phase 1: Preflight & Baseline** ⏳
- [x] Write ADR (`docs/adr/2025-10-24-pivot-to-flowbite.md`)
- [x] Create this migration plan
- [ ] Git baseline: `git tag pivot-baseline-2025-10-24`
- [ ] Commit: `git commit -m "chore: baseline before Flowbite pivot"`
- [ ] Snapshot build status: `pnpm build > .reports/baseline/build.log 2>&1`

### **Phase 2: Add Speed Layer** 🔄
- [ ] Install Flowbite + Tailwind
- [ ] Configure `tailwind.config.js` with DS tokens
- [ ] Create `packages/ui-bridge/` wrapper layer
- [ ] Update ESLint rules (soften inline-appearance)
- [ ] Add `globals.css` with Tailwind imports
- [ ] Verify build passes

### **Phase 3: Archive Factory** 📦
- [ ] Create `_archive/` directory structure
- [ ] Move `scripts/factory/` → `_archive/factory/`
- [ ] Move `packages/forms/src/recipes/` → `_archive/recipes/`
- [ ] Move `packages/ds/src/primitives/fields/` → `_archive/ds-fields-legacy/`
- [ ] Update `packages/ds/src/primitives/index.ts` (remove field exports)
- [ ] Document what was archived in `_archive/README.md`

### **Phase 4: Proof of Concept** 🧪
- [ ] Pick a simple form (e.g., login, contact)
- [ ] Convert to Flowbite components
- [ ] Wrap in `FullScreenRoute` or `FlowScaffold`
- [ ] Run axe accessibility scan
- [ ] Verify tokens apply correctly
- [ ] Compare velocity (old vs. new)

### **Phase 5: Update Documentation** 📝
- [ ] Update main README
- [ ] Update `COMPONENT_WORK_PROTOCOL.md`
- [ ] Create `docs/guides/FLOWBITE_USAGE.md`
- [ ] Update `.cascade/README.md` with new workflow
- [ ] Archive factory-specific docs

### **Phase 6: Gradual Migration** 🔄
- [ ] Identify all existing forms
- [ ] Migrate opportunistically (no rush)
- [ ] New forms: Always use Flowbite
- [ ] Document patterns as they emerge

---

## 📦 **Phase 1: Git Baseline**

### **Commands to Run**

```bash
# 1. Tag current state
git tag pivot-baseline-2025-10-24

# 2. Commit baseline
git add -A
git commit -m "chore: baseline before Flowbite pivot

- ADR: docs/adr/2025-10-24-pivot-to-flowbite.md
- Migration plan: docs/FLOWBITE_MIGRATION.md
- Keeping: route shells, tokens, hooks
- Archiving: factory, recipes, DS fields
- Adding: Flowbite, Tailwind, UI bridge"

# 3. Snapshot build status
mkdir -p .reports/baseline
pnpm build > .reports/baseline/build-status.log 2>&1
git add .reports/baseline/build-status.log
git commit -m "chore: snapshot build status before pivot"
```

---

## 🚀 **Phase 2: Add Speed Layer**

### **Step 1: Install Dependencies**

```bash
# Install Flowbite + Tailwind
pnpm add flowbite-react flowbite

# Install Tailwind (dev dependencies)
pnpm add -D tailwindcss postcss autoprefixer

# Initialize Tailwind config
npx tailwindcss init -p
```

### **Step 2: Configure Tailwind with DS Tokens**

**File:** `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./packages/**/*.{ts,tsx,html}",
    "./node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Bridge DS tokens → Tailwind utilities
      colors: {
        primary: "var(--ds-color-primary)",
        "primary-hover": "var(--ds-color-primary-hover)",
        surface: "var(--ds-color-surface-base)",
        "surface-subtle": "var(--ds-color-surface-subtle)",
        text: "var(--ds-color-text)",
        "text-subtle": "var(--ds-color-text-subtle)",
        border: "var(--ds-color-border-subtle)",
        error: "var(--ds-color-feedback-error)",
        success: "var(--ds-color-feedback-success)",
      },
      spacing: {
        // Use DS spacing tokens
        3: "var(--ds-space-3)",
        4: "var(--ds-space-4)",
        5: "var(--ds-space-5)",
        6: "var(--ds-space-6)",
        8: "var(--ds-space-8)",
      },
      borderRadius: {
        lg: "var(--ds-radius-lg)",
        full: "var(--ds-radius-full)",
      },
      boxShadow: {
        "layer-1": "var(--ds-shadow-layer-1)",
        "layer-2": "var(--ds-shadow-layer-2)",
      },
      zIndex: {
        panel: "var(--ds-z-lane-panel)",
        modal: "var(--ds-z-lane-modal)",
        overlay: "var(--ds-z-lane-overlay)",
      },
      minHeight: {
        touch: "var(--ds-touch-target)",
      },
      minWidth: {
        touch: "var(--ds-touch-target)",
      },
    },
  },
  plugins: [
    require("flowbite/plugin"),
  ],
};
```

### **Step 3: Add Global CSS**

**File:** `packages/ds/src/globals.css` (or in your app entry)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Ensure DS tokens are loaded */
@import './tokens/tokens.css';

/* Optional: Layer utilities for common patterns */
@layer utilities {
  .touch-target {
    min-width: var(--ds-touch-target);
    min-height: var(--ds-touch-target);
  }
  
  .stack-4 {
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-4);
  }
}
```

### **Step 4: Create UI Bridge Layer**

**Create package structure:**

```bash
mkdir -p packages/ui-bridge/src
touch packages/ui-bridge/package.json
touch packages/ui-bridge/tsconfig.json
```

**File:** `packages/ui-bridge/package.json`

```json
{
  "name": "@intstudio/ui-bridge",
  "version": "0.1.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./*": "./src/*.tsx"
  },
  "dependencies": {
    "flowbite-react": "workspace:*",
    "react": "^18.2.0"
  }
}
```

**File:** `packages/ui-bridge/src/Input.tsx`

```tsx
import { Label, TextInput, type TextInputProps } from 'flowbite-react';

export interface InputProps extends Omit<TextInputProps, 'sizing'> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Input({ label, hint, error, id, ...rest }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <Label htmlFor={id} value={label} />}
      <TextInput
        id={id}
        color={error ? 'failure' : undefined}
        helperText={error || hint}
        {...rest}
      />
    </div>
  );
}
```

**File:** `packages/ui-bridge/src/Button.tsx`

```tsx
import { Button as FlowbiteButton, type ButtonProps as FlowbiteButtonProps } from 'flowbite-react';

export interface ButtonProps extends FlowbiteButtonProps {
  // Add any custom props
}

export function Button(props: ButtonProps) {
  return <FlowbiteButton {...props} />;
}
```

**File:** `packages/ui-bridge/src/Select.tsx`

```tsx
import { Label, Select as FlowbiteSelect, type SelectProps as FlowbiteSelectProps } from 'flowbite-react';

export interface SelectProps extends FlowbiteSelectProps {
  label?: string;
  hint?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({ label, hint, error, options, id, ...rest }: SelectProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <Label htmlFor={id} value={label} />}
      <FlowbiteSelect
        id={id}
        color={error ? 'failure' : undefined}
        helperText={error || hint}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </FlowbiteSelect>
    </div>
  );
}
```

**File:** `packages/ui-bridge/src/index.ts`

```ts
export { Input } from './Input';
export { Button } from './Button';
export { Select } from './Select';
// Export more as you create them
```

### **Step 5: Update ESLint Rules**

**File:** `.eslintrc.js` (or wherever your rules are)

```javascript
// Replace strict no-inline-appearance with softer rule
rules: {
  // Old: "cascade/no-inline-appearance": "error",
  
  // New: Allow Tailwind classes, block inline style prop
  "cascade/no-inline-style-prop": "error",
  
  // Keep these (route shells)
  "cascade/routes-require-aria-label": "error",
  "cascade/sheet-no-panel-on-dialog": "error",
}
```

**File:** `tools/eslint-plugin-cascade/index.js` (add new rule)

```javascript
module.exports = {
  rules: {
    'no-inline-style-prop': {
      create(context) {
        return {
          JSXAttribute(node) {
            if (node.name.name === 'style' && node.value?.type === 'JSXExpressionContainer') {
              context.report({
                node,
                message: 'Avoid inline style prop. Use Tailwind classes or co-located CSS.',
              });
            }
          },
        };
      },
    },
    // ... other rules
  },
};
```

### **Step 6: Verify Build**

```bash
# Build all packages
pnpm build

# Check for errors
pnpm typecheck

# Run linter
pnpm lint
```

---

## 📦 **Phase 3: Archive Factory**

### **Create Archive Structure**

```bash
# Create archive directory
mkdir -p _archive/{factory,recipes,ds-fields-legacy}

# Archive factory
mv scripts/factory _archive/
mv scripts/refiner _archive/

# Archive recipes
mv packages/forms/src/recipes _archive/

# Archive DS field primitives
mv packages/ds/src/primitives/fields _archive/ds-fields-legacy/

# Create archive README
touch _archive/README.md
```

**File:** `_archive/README.md`

```markdown
# Archived Components

**Date:** 2025-10-24  
**Reason:** Pivoted to Flowbite for velocity (see ADR: docs/adr/2025-10-24-pivot-to-flowbite.md)

## What's Here

### `/factory`
- Field generator (spec → component)
- Refiner (AST-based quality enforcement)
- Not deleted, just archived for reference

### `/recipes`
- Field recipes (TextField, SelectField, CheckboxField, etc.)
- Recipe system for systematic field generation
- Replaced by Flowbite components

### `/ds-fields-legacy`
- Custom DS field primitives (Input, Checkbox, Select, etc.)
- Co-located CSS with DS tokens
- Replaced by Flowbite + UI bridge

## Rollback

To restore factory:
```bash
mv _archive/factory scripts/
mv _archive/recipes packages/forms/src/
mv _archive/ds-fields-legacy packages/ds/src/primitives/fields
```

Then:
```bash
git checkout pivot-baseline-2025-10-24
pnpm install
pnpm build
```

## Why Archived (Not Deleted)

- Reference for patterns
- Rollback safety
- Learning resource
- May extract useful utilities later
```

### **Update Barrel Exports**

**File:** `packages/ds/src/primitives/index.ts`

```typescript
// Remove field exports (archived)
// export { Input } from './fields/Input';
// export { Checkbox } from './fields/Checkbox';
// etc.

// Keep route shells
export { FullScreenRoute } from './routes/FullScreenRoute';
export { FlowScaffold } from './routes/FlowScaffold';
export { RoutePanel } from './routes/RoutePanel';

// Keep UI primitives that aren't fields
export { Option } from './Option';
// etc.
```

### **Commit Archive**

```bash
git add -A
git commit -m "refactor: archive field factory, recipes, DS fields

- Moved to _archive/ (not deleted)
- Rollback: see _archive/README.md
- Reason: ADR 2025-10-24 (velocity pivot)"
```

---

## 🧪 **Phase 4: Proof of Concept**

### **Pick a Simple Form**

Let's convert a login form as proof of concept.

**File:** `packages/demo-app/src/forms/LoginForm.tsx`

```tsx
import { FullScreenRoute } from '@intstudio/ds/routes';
import { Input, Button } from '@intstudio/ui-bridge';
import { useState } from 'react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <FullScreenRoute ariaLabel="Log in">
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <form className="stack-4 w-full max-w-md p-6 bg-surface-subtle rounded-lg shadow-layer-2">
          <h1 className="text-2xl font-bold text-text">Log In</h1>
          
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <Button type="submit" className="touch-target">
            Log In
          </Button>
        </form>
      </div>
    </FullScreenRoute>
  );
}
```

### **Verify:**

1. **Build:** `pnpm build`
2. **Run:** `pnpm dev`
3. **Test:** Open in browser, verify tokens apply
4. **A11y:** Run axe DevTools scan
5. **Compare:** Time to build this vs. old factory way

---

## 📝 **Phase 5: Update Documentation**

### **Update Main README**

Add section about UI approach:

```markdown
## UI Architecture

**Route Shells (Custom):**
- `FullScreenRoute`, `FlowScaffold`, `RoutePanel`
- Handle navigation, focus, layout
- Token-driven, accessible

**Form Fields (Flowbite):**
- All fields use Flowbite components
- Themed with DS tokens via Tailwind
- Wrapped in UI bridge for consistency

**Tokens (Design System DNA):**
- `--ds-color-*`, `--ds-space-*`, `--ds-z-*`
- Applied via Tailwind config
- Single source of truth
```

### **Create Usage Guide**

**File:** `docs/guides/FLOWBITE_USAGE.md`

```markdown
# Using Flowbite in Forms

## Quick Start

```tsx
import { Input, Button, Select } from '@intstudio/ui-bridge';

function MyForm() {
  return (
    <form className="stack-4">
      <Input label="Name" id="name" required />
      <Select 
        label="Country" 
        id="country" 
        options={[
          { value: 'us', label: 'United States' },
          { value: 'ca', label: 'Canada' },
        ]} 
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

## UI Bridge

We wrap Flowbite components for:
- Consistent label/hint/error patterns
- Easier future swaps
- Sane defaults

## Theming

Flowbite uses DS tokens automatically via `tailwind.config.js`.

Change token → Everything updates.

## When to Go Bespoke

If Flowbite doesn't fit:
1. Build custom component
2. Use DS tokens directly
3. Follow accessibility contracts
4. Co-locate CSS if complex

No factory overhead!
```

---

## 🔄 **Phase 6: Gradual Migration**

### **Strategy**

- **New forms:** Always use Flowbite
- **Existing forms:** Migrate opportunistically
- **No rush:** Convert as you touch them
- **Keep route shells:** Don't touch FullScreenRoute, FlowScaffold, RoutePanel

### **Checklist Per Form**

- [ ] Replace DS field imports → UI bridge imports
- [ ] Convert field props (minimal changes needed)
- [ ] Verify tokens apply (colors, spacing)
- [ ] Run axe scan
- [ ] Test keyboard navigation
- [ ] Test with screen reader (spot-check)

---

## ✅ **Success Criteria**

**Velocity:**
- ✅ New form built in < 30 min
- ✅ AI can generate Flowbite forms
- ✅ No factory overhead

**Quality:**
- ✅ Route shells pass all 40 E2E tests
- ✅ Forms pass axe scans
- ✅ Tokens apply correctly

**Maintenance:**
- ✅ < 10 core files to maintain (tokens, shells, hooks)
- ✅ Factory archived, not deleted
- ✅ Rollback available if needed

---

## 🚨 **Rollback Plan**

If this doesn't work:

```bash
# 1. Restore baseline
git checkout pivot-baseline-2025-10-24

# 2. Restore factory
mv _archive/factory scripts/
mv _archive/recipes packages/forms/src/
mv _archive/ds-fields-legacy packages/ds/src/primitives/fields

# 3. Uninstall Flowbite
pnpm remove flowbite flowbite-react tailwindcss

# 4. Rebuild
pnpm install
pnpm build
```

---

## 📞 **Questions & Support**

- **ADR:** See `docs/adr/2025-10-24-pivot-to-flowbite.md` for full context
- **Rollback:** See "Rollback Plan" above
- **Issues:** Check `_archive/` for reference patterns

---

## 📊 **Progress Summary**

**Phase 1:** ⏳ In Progress  
**Phase 2:** 🔜 Not Started  
**Phase 3:** 🔜 Not Started  
**Phase 4:** 🔜 Not Started  
**Phase 5:** 🔜 Not Started  
**Phase 6:** 🔜 Not Started

---

**Next Step:** Run git baseline commands (Phase 1)
