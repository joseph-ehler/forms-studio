# WHERE TO EDIT (No Hunting Map)

**Quick reference for making changes. Zero hunting, zero guessing.**

---

## 🎨 Design Tokens & Colors

| What | Where |
|------|-------|
| **Brand colors** (primary/success/warning/danger/info) | `packages/tokens/src/tokens.css` |
| **Semantic roles** (text/surface/border/primary-bg/etc.) | `packages/tokens/src/tokens.css` |
| **OKLCH ramps** (12-step color scales) | `packages/tokens/src/tokens.css` |
| **Tailwind theme** (exposing tokens to Tailwind) | `packages/tokens/src/tailwind-theme.ts` |

**Rule**: Never hardcode colors. Always use `--ds-role-*` or `--ds-{color}-{step}`.

---

## 🧩 DS Layer (Primitives)

### Control Panel

| What | Where |
|------|-------|
| **Add/edit variants** (button/input/select) | `packages/ds/src/control/variants.config.ts` |
| **Add SKIN keys** (TypeScript contracts) | `packages/ds/src/control/skin-contracts.ts` |

### SKIN Maps (Variant → CSS Variables)

| What | Where |
|------|-------|
| **Button SKIN** (--btn-fg/bg/hover/active) | `packages/ds/src/registry/skins/button.skin.ts` |
| **Input SKIN** (--input-fg/bg/border/etc.) | `packages/ds/src/registry/skins/input.skin.ts` |
| **Add new SKIN** (e.g., Select) | `packages/ds/src/registry/skins/select.skin.ts` |

**Pattern**: Each variant maps semantic roles → local `--component-*` variables.

### Components (Flowbite Wrappers)

| What | Where |
|------|-------|
| **Button wrapper** | `packages/ds/src/fb/Button.tsx` |
| **Input wrapper** | `packages/ds/src/fb/Input.tsx` |
| **Add new wrapper** (e.g., Select) | `packages/ds/src/fb/Select.tsx` |
| **Component CSS** (reads only `--component-*` vars) | `packages/ds/src/fb/Button.css` |

**Rule**: Wrappers apply SKIN, never reference `--ds-role-*` tokens directly.

---

## 📝 Forms Layer

### Contracts (TypeScript Types)

| What | Where |
|------|-------|
| **Field configs** (SelectFieldConfig, TextFieldConfig) | `packages/forms/src/control/field-contracts.ts` |
| **Base props** (name/label/hint/disabled/required) | `packages/forms/src/control/field-contracts.ts` |
| **Validation rules** (required/minLength/pattern) | `packages/forms/src/control/field-contracts.ts` |

### Registry (Field Type Mapping)

| What | Where |
|------|-------|
| **Field registry** (type → component mapping) | `packages/forms/src/registry/field-types.ts` |

### Fields (DS Primitive Composers)

| What | Where |
|------|-------|
| **SelectField** | `packages/forms/src/fields/SelectField/SelectField.tsx` |
| **Add new field** (e.g., TextField) | `packages/forms/src/fields/TextField/TextField.tsx` |
| **Field stories** (Storybook tests) | `packages/forms/src/fields/SelectField/SelectField.stories.tsx` |

**Rule**: Fields compose `@intstudio/ds/fb/*` primitives, never import Flowbite directly.

### Renderer

| What | Where |
|------|-------|
| **FormRenderer** (schema → fields) | `packages/forms/src/FormRenderer.tsx` |

---

## 📚 Documentation

| What | Where |
|------|-------|
| **ADRs** (architectural decisions) | `docs/adr/*.md` |
| **Guides** (how-to) | `docs/guides/*.md` |
| **Session summaries** | `docs/archive/*.md` |
| **Package docs** | `packages/*/docs/*.md` |

---

## 🧪 Testing & Quality

| What | Where |
|------|-------|
| **E2E tests** (Playwright) | `tests/*.spec.ts` |
| **ESLint config** | `.eslintrc.*.{js,json,cjs}` |
| **TypeScript config** | `tsconfig.json`, `tsconfig.base.json` |

---

## 🛠️ Scripts & Tooling

| What | Where |
|------|-------|
| **Barrel generator** | `scripts/gen-barrels.mts` |
| **Contrast checker** | `scripts/design-contrast.mts` |
| **Custom ESLint rules** | `tools/eslint-plugin-cascade/` |

---

## 🚀 Adding Something New

### Add a DS Primitive (10 min)

1. **Variants** → `control/variants.config.ts` (add if new)
2. **SKIN keys** → `control/skin-contracts.ts` (TypeScript types)
3. **SKIN map** → `registry/skins/<component>.skin.ts` (variant → vars)
4. **Wrapper** → `fb/<Component>.tsx` (Flowbite + SKIN)
5. **CSS** → `fb/<Component>.css` (reads only `--component-*`)
6. **Verify** → `pnpm doctor`

### Add a Form Field (15 min)

1. **Contract** → `control/field-contracts.ts` (add config type)
2. **Field** → `fields/<Field>/<Field>.tsx` (compose DS primitive)
3. **Registry** → `registry/field-types.ts` (register type)
4. **Story** → `fields/<Field>/<Field>.stories.tsx` (optional)
5. **Verify** → `pnpm doctor`

---

## ⚡ Quick Commands

```bash
# Full validation (prod-only lint, typecheck, build)
pnpm doctor

# Just lint production code
pnpm lint:prod

# Just typecheck
pnpm typecheck

# Build all packages
pnpm -r --filter './packages/**' build

# Generate barrels
pnpm barrels

# Verify barrels are up-to-date
pnpm barrels:check
```

---

## 🎯 Key Principles

1. **TypeScript > Custom Tooling** - Use the compiler, not custom validators
2. **Contracts First** - Define types, derive implementation
3. **Single Source of Truth** - One place per concept (variants, SKIN, fields)
4. **Compose, Don't Reimplement** - Forms use DS primitives, DS wraps Flowbite
5. **No Hunting** - Clear file structure, predictable locations

---

**If you can't find where to edit something, this guide should have the answer. If it doesn't, update this guide!**
