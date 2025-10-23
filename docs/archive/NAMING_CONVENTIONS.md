# 🔤 Naming Conventions - Intelligence Studio

**Taxonomically correct, enforced by tooling, impossible to violate.**

---

## 📋 Quick Reference Table

| Thing | Rule | Examples |
|-------|------|----------|
| **NPM packages** | `@intstudio/<kebab-case>` | `@intstudio/ds`, `@intstudio/forms` |
| **Directories** | `kebab-case` | `src/primitives`, `src/white-label` |
| **React components** | `PascalCase.tsx` | `Stack.tsx`, `FormCard.tsx`, `TopBar.tsx` |
| **Hooks** | `useCamelCase.ts` | `useMotion.ts`, `useContrastGuard.ts` |
| **Utils & modules** | `camelCase.ts` | `toneResolver.ts`, `semanticSizing.ts` |
| **Interfaces & Types** | `PascalCase` | `interface StackProps {}`, `type LayoutPreset` |
| **Enums** | `PascalCase` | `enum Tone { Light, Dark }` |
| **Constants** | `UPPER_SNAKE_CASE` | `DEFAULT_GAP`, `JS_MAX_BYTES` |
| **CSS files** | `kebab-case.css` | `ds-typography.css`, `ds-prose.css` |
| **CSS classes** | `ds-<kebab-case>` | `.ds-border`, `.ds-prose` |
| **CSS custom props** | `--ds-<domain>-<name>` | `--ds-color-text-primary`, `--ds-space-6` |
| **Data attributes** | `data-<kebab>` | `data-tenant="b2b"`, `data-ds-role="nav"` |
| **ARIA ids** | `kebab-case` | `aria-labelledby="section-title"` |
| **Stories** | `Component.stories.tsx` | `Stack.stories.tsx` |
| **Tests** | `Component.spec.ts(x)` | `Stack.spec.tsx`, `AppShell.e2e.ts` |
| **Scripts** | `kebab-case.(m)js` | `import-doctor.mjs` |
| **Docs** | `kebab-case.md` | `onboarding.md` |
| **ADRs** | `YYYY-MM-DD-title.md` | `2025-10-22-naming-standard.md` |
| **RFCs** | `NNNN-title.md` | `0001-field-extraction.md` |
| **Branches** | `<type>/<area>-<desc>` | `feat/ds-shell-presets` |
| **Commits** | Conventional Commits | `feat(ds): add Section tone resolver` |

---

## 🎯 Detailed Rules

### **NPM Packages**
```
@intstudio/<kebab-case>
```
- ✅ `@intstudio/ds`
- ✅ `@intstudio/forms`
- ✅ `@intstudio/core`
- ❌ `@intstudio/DesignSystem`
- ❌ `@intstudio/design_system`

### **Directories**
```
kebab-case (lowercase with hyphens)
```
- ✅ `src/primitives`
- ✅ `src/white-label`
- ✅ `docs/handbook`
- ❌ `src/whiteLable`
- ❌ `src/White-Label`

### **React Components**
```
PascalCase.tsx (one component per file)
```
- ✅ `Stack.tsx`
- ✅ `FormCard.tsx`
- ✅ `TopBar.tsx`
- ✅ `MediaContainer.tsx`
- ❌ `stack.tsx`
- ❌ `form-card.tsx`

**File structure:**
```
primitives/
  Stack.tsx          # Component
  Stack.stories.tsx  # Stories
  Stack.spec.tsx     # Tests
```

### **Hooks**
```
useCamelCase.ts (must start with 'use')
```
- ✅ `useMotion.ts`
- ✅ `useContrastGuard.ts`
- ✅ `useDebounce.ts`
- ❌ `motion.ts` (not a hook)
- ❌ `UseMotion.ts` (PascalCase)

### **Utils & Modules**
```
camelCase.ts
```
- ✅ `toneResolver.ts`
- ✅ `semanticSizing.ts`
- ✅ `layoutConfig.ts`
- ❌ `ToneResolver.ts`
- ❌ `tone-resolver.ts`

### **TypeScript Types**
```typescript
// Interfaces: PascalCase
interface StackProps {
  spacing?: 'tight' | 'normal' | 'relaxed';
}

// Types: PascalCase
type LayoutPreset = 'narrow' | 'standard' | 'wide';

// Generics: TPascalCase
type Result<TData, TError> = ...

// Enums: PascalCase enum, PascalCase members
enum Tone {
  Light,
  Dark,
}
```

### **Constants**
```typescript
// UPPER_SNAKE_CASE
const DEFAULT_GAP = 16;
const JS_MAX_BYTES = 750 * 1024;
const API_BASE_URL = 'https://...';
```

### **CSS Files**
```
kebab-case.css
```
- ✅ `ds-typography.css`
- ✅ `ds-calendar.css`
- ✅ `color.vars.css`
- ❌ `Typography.css`
- ❌ `ds_typography.css`

### **CSS Classes**
```css
/* Utility classes: ds-<kebab> */
.ds-border
.ds-prose
.ds-divider
.ds-section

/* BEM-style modifiers: ds-thing--modifier */
.ds-divider--strong
.ds-button--primary
```

### **CSS Custom Properties**
```css
/* --ds-<domain>-<property>-<variant> */
--ds-color-text-primary
--ds-color-bg-surface
--ds-space-6
--ds-font-size-body
--ds-shadow-overlay-sm
--ds-content-b2c-form-max-width

/* Semantic aliases */
--ds-section-bg: var(--ds-color-surface-primary);
```

### **Data Attributes**
```html
<!-- kebab-case -->
<div data-tenant="b2b">
<nav data-ds-role="nav">
<section data-theme="dark">
```

### **ARIA Attributes**
```html
<!-- kebab-case for ids/labels -->
<h2 id="section-title">...</h2>
<div aria-labelledby="section-title">
<button aria-describedby="help-text">
```

### **Storybook Stories**
```typescript
// File: Component.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from './Stack';

const meta: Meta<typeof Stack> = {
  title: 'Primitives/Stack',  // Category/Subcategory/Component
  component: Stack,
};

export default meta;
```

### **Tests**
```
Component.spec.ts(x)   # Unit/integration
Component.e2e.ts       # End-to-end
```
- ✅ `Stack.spec.tsx`
- ✅ `AppShell.e2e.ts`
- ✅ `toneResolver.spec.ts`

### **Docs**
```
kebab-case.md (with YAML front matter)
```
- ✅ `onboarding.md`
- ✅ `release-process.md`
- ❌ `Onboarding.md`
- ❌ `release_process.md`

**Front matter required:**
```yaml
---
title: My Document
owner: @joseph-ehler
status: active
lastReviewed: 2025-10-22
---
```

### **ADRs (Architecture Decision Records)**
```
YYYY-MM-DD-title.md
```
- ✅ `2025-10-22-naming-standard.md`
- ✅ `2025-01-15-css-layer-system.md`
- ❌ `naming-standard.md`
- ❌ `2025-10-22-NamingStandard.md`

### **RFCs (Request for Comments)**
```
NNNN-title.md (4 digits, zero-padded)
```
- ✅ `0001-field-extraction.md`
- ✅ `0042-visual-regression.md`
- ❌ `1-field-extraction.md`
- ❌ `field-extraction.md`

### **Git Branches**
```
<type>/<area>-<short-description>
```
**Types:** `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`

- ✅ `feat/ds-shell-presets`
- ✅ `fix/overlay-footer-visibility`
- ✅ `chore/repo-hygiene`
- ❌ `feature/DS-Shell-Presets`
- ❌ `ds_shell_presets`

### **Commits**
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```
**Conventional Commits format**

- ✅ `feat(ds): add Section tone resolver`
- ✅ `fix(forms): DateField keyboard navigation`
- ✅ `chore(repo): add name police enforcement`
- ❌ `Add feature`
- ❌ `Fixed bug in forms`

---

## 🎨 Content Conventions

### **Props Naming**
```typescript
// Booleans: is/has/can prefix
isOpen: boolean
hasIcon: boolean
canSubmit: boolean

// Events: on<Event> prefix
onSubmit: () => void
onClick: () => void
onChange: (value: string) => void

// Spacing: semantic tokens only
spacing: 'tight' | 'normal' | 'relaxed'  // ✅
gap: number  // ❌ no raw pixels in props

// Width: preset tokens only
width: 'narrow' | 'standard' | 'wide' | 'max'  // ✅
maxWidth: '600px'  // ❌ no raw values
```

### **A11Y Conventions**
```typescript
// Hooks/components in a11y/
import { applyA11y, FocusZone } from '../a11y';

// Focus tokens
--a11y-focus-color
--a11y-focus-width
```

### **White-label Conventions**
```typescript
// Brand APIs in white-label/
import { applyBrand, toneResolver } from '../white-label';

// Token prefix
--ds-color-...
--ds-space-...
--ds-content-...
```

---

## 🛡️ Enforcement

### **Name Police (Pre-commit)**
```bash
pnpm name-police
```
Checks all filenames against conventions.

### **ESLint Rules**
- No deep imports
- PascalCase components
- Hooks start with `use`

### **Stylelint Rules**
- Classes: `ds-<kebab>`
- Custom props: `--ds-<domain>-<name>`
- No raw colors/widths/shadows

### **Generators (Auto-compliant)**
```bash
pnpm new:ds:primitive Button
pnpm new:docs:adr naming-standard
```
Automatically creates correctly-named files.

---

## 💡 Quick Decision Tree

**Creating a file? Ask:**

1. **Is it a React component?** → `PascalCase.tsx`
2. **Is it a hook?** → `useCamelCase.ts`
3. **Is it a utility?** → `camelCase.ts`
4. **Is it CSS?** → `kebab-case.css`
5. **Is it docs?** → `kebab-case.md` (+ front matter)
6. **Is it an ADR?** → `YYYY-MM-DD-title.md`
7. **Is it a script?** → `kebab-case.mjs`

**Not sure?** → Use a generator! `pnpm new:<type> <name>`

---

## 🚨 Common Mistakes

| ❌ Wrong | ✅ Correct | Why |
|---------|-----------|-----|
| `stack.tsx` | `Stack.tsx` | Components are PascalCase |
| `UseMotion.ts` | `useMotion.ts` | Hooks are camelCase |
| `ToneResolver.ts` | `toneResolver.ts` | Utils are camelCase |
| `ds_typography.css` | `ds-typography.css` | CSS files are kebab-case |
| `.stack-component` | `.ds-stack` | CSS classes prefixed with `ds-` |
| `--color-primary` | `--ds-color-primary` | Tokens prefixed with `--ds-` |
| `onboarding_guide.md` | `onboarding-guide.md` | Docs are kebab-case |
| `naming-standard.md` | `2025-10-22-naming-standard.md` | ADRs need date prefix |
| `Field-Extraction.md` | `0001-field-extraction.md` | RFCs need number prefix |

---

## 📚 Examples by Package

### **@intstudio/ds**
```
src/
  primitives/
    Stack.tsx
    Stack.stories.tsx
    Stack.spec.tsx
  styles/
    tokens/
      color.vars.css
      typography.vars.css
  utils/
    toneResolver.ts
    semanticSizing.ts
  a11y/
    applyA11y.ts
    useContrastGuard.ts
```

### **@intstudio/forms**
```
src/
  fields/
    TextField.tsx
    TextField.spec.tsx
  composites/
    DateRangeField.tsx
  renderer/
    renderForm.ts
```

### **Docs**
```
docs/
  handbook/
    onboarding.md
    release-process.md
  adr/
    2025-10-22-naming-standard.md
    2025-01-15-css-layer-system.md
  rfc/
    0001-field-extraction.md
    0002-visual-regression.md
```

---

## ✅ Checklist

Before committing:
- [ ] All files follow naming conventions
- [ ] Run `pnpm name-police` (auto-runs in pre-commit)
- [ ] TypeScript types are PascalCase
- [ ] CSS classes prefixed with `ds-`
- [ ] Tokens prefixed with `--ds-`
- [ ] Docs have front matter
- [ ] Commit message is conventional format

---

**Enforced by:** Name Police, ESLint, Stylelint, Generators  
**Blocked by:** Pre-commit hooks, CI checks  
**Can't violate:** Literally impossible with our tooling 🎯

