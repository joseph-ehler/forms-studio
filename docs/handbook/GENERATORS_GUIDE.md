# Toyota-Grade Component Generators

**TL;DR**: Generate production-ready components in 10-15 minutes with built-in quality, consistency, and zero boilerplate.

---

## Philosophy: Toyota Production System

Our generators embody three core TPS principles:

### 🛑 **Jidoka (Built-in Quality)**
Every generated component includes:
- Complete SKIN registry (DS)
- Field contracts & registration (Forms)
- TypeScript type safety
- Storybook matrix tests
- A11y attributes
- Design token usage

**Result**: Cannot generate incomplete components.

### 🚫 **Poka-Yoke (Mistake-Proofing)**
Generators enforce:
- Naming conventions (PascalCase, *Field suffix)
- File structure (co-located CSS, stories, SKIN)
- Registry patterns (single source of truth)
- Standard Work (identical patterns everywhere)

**Result**: Cannot deviate from best practices.

### 📊 **Standard Work**
Every component follows:
- Identical file structure
- Same API patterns
- Consistent testing approach
- Predictable timing (10-15 min)

**Result**: Zero variation, maximum throughput.

---

## Quick Start

### Generate DS Component
```bash
# Basic (uses default variants)
pnpm ds:new Select

# Custom variants
pnpm ds:new Checkbox --variants default,success,danger,info

# Then validate
pnpm barrels && pnpm doctor
```

### Generate Forms Field
```bash
# Auto-detects DS component from name
pnpm forms:new TextField

# Explicit DS component
pnpm forms:new EmailField --ds-component Input

# Complex field
pnpm forms:new SelectField --ds-component Select

# Then validate
pnpm barrels && pnpm doctor
```

---

## DS Component Generator (`ds:new`)

### What Gets Generated

```
packages/ds/src/
  fb/
    <Component>.tsx         # Component with SKIN pattern
    <Component>.css         # Token-driven styles
    <Component>.stories.tsx # Matrix stories
  registry/skins/
    <component>.skin.ts     # SKIN map
  control/
    variants.config.ts      # Updated with new variants
    skin-contracts.ts       # Updated with SKIN keys type
```

### Example: Generate Select Component

```bash
pnpm ds:new Select
```

**Generated `Select.tsx`:**
```tsx
import './Select.css';
import { SelectHTMLAttributes, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { SelectVariant } from '../control/variants.config';
import { SELECT_SKIN } from '../registry/skins/select.skin';

const SKIN = SELECT_SKIN;

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  variant?: SelectVariant;
  children?: ReactNode;
};

export function Select({
  variant = 'default',
  className,
  style,
  children,
  ...rest
}: SelectProps) {
  const skin = SKIN[variant];
  
  return (
    <select
      data-component="select"
      data-variant={variant}
      className={twMerge(className)}
      style={{ ...skin, ...style }}
      {...rest}
    >
      {children}
    </select>
  );
}
```

**Generated `select.skin.ts`:**
```tsx
import type { SelectSkinKeys, SkinRecord } from '../../control/skin-contracts';
import type { SelectVariant } from '../../control/variants.config';

export const SELECT_SKIN: SkinRecord<SelectVariant, SelectSkinKeys> = {
  default: {
    '--select-fg': 'var(--ds-role-text)',
    '--select-bg': 'var(--ds-role-surface)',
    '--select-border': 'var(--ds-neutral-8)',
    '--select-hover-border': 'var(--ds-neutral-9)',
    '--select-focus-ring': 'var(--ds-state-focus-ring)',
  },
  // ... other variants
};
```

**Generated `Select.css`:**
```css
@layer ds-interactions {
  :where([data-component="select"]) {
    color: var(--select-fg);
    background: var(--select-bg);
    border: 1px solid var(--select-border);
    border-radius: var(--ds-radius-control);
    /* ... more token-driven styles */
  }
}
```

**Generated `Select.stories.tsx`:**
```tsx
export const Matrix: Story = {
  render: () => (
    <div>
      {/* All variants × light/dark × states */}
    </div>
  ),
};
```

### Standard Work (10 minutes)

1. **Generate** (2 min): `pnpm ds:new <Component>`
2. **Validate** (2 min): `pnpm barrels && pnpm typecheck`
3. **Review** (2 min): Check generated files
4. **Test** (4 min): `pnpm doctor` (full validation)

---

## Forms Field Generator (`forms:new`)

### What Gets Generated

```
packages/forms/src/
  fields/<Field>/
    <Field>.tsx             # Field component
    <Field>.stories.tsx     # Matrix stories
  control/
    field-contracts.ts      # Updated with config type
  registry/
    field-types.ts          # Updated with registration
```

### Example: Generate TextField

```bash
pnpm forms:new TextField
```

**Generated `TextField.tsx`:**
```tsx
import { forwardRef } from 'react';
import { Input } from '@intstudio/ds/fb';
import { Field } from '@intstudio/ds/fb';
import type { TextFieldConfig } from '../../control/field-contracts';

export type TextFieldProps = TextFieldConfig & {
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
      name,
      label,
      hint,
      required = false,
      disabled = false,
      placeholder,
      variant = 'default',
      value,
      onChange,
      error,
      ...rest
    },
    ref
  ) {
    const inputId = `field-${name}`;
    
    return (
      <Field
        id={inputId}
        label={label}
        hint={hint}
        required={required}
        error={error}
      >
        <Input
          ref={ref}
          id={inputId}
          name={name}
          placeholder={placeholder}
          disabled={disabled}
          variant={error ? 'danger' : variant}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          {...rest}
        />
      </Field>
    );
  }
);
```

**Updated `field-contracts.ts`:**
```tsx
export type TextFieldConfig = BaseFieldConfig & {
  type: 'text';
  // Add field-specific config here
};

export type FieldConfig = TextFieldConfig; // Union type
```

**Updated `field-types.ts`:**
```tsx
import { TextField } from '../fields/TextField/TextField';

registerField('text', TextField);
```

### Standard Work (15 minutes)

1. **Generate** (3 min): `pnpm forms:new <Field>`
2. **Validate** (3 min): `pnpm barrels && pnpm typecheck`
3. **Review** (3 min): Check generated files
4. **Test** (6 min): `pnpm doctor` (full validation)

---

## Validation (Jidoka)

Every generation is validated automatically:

### Local Validation
```bash
pnpm validate:generated
```

Checks:
- ✅ All SKIN keys present
- ✅ All variants registered
- ✅ All fields registered
- ✅ Stories exist
- ✅ No direct Flowbite imports (Forms)
- ✅ TypeScript compiles
- ✅ Builds successfully

### CI Validation

GitHub Actions runs validation on every PR:
- Validates generated code structure
- TypeChecks (validates SKIN completeness)
- Builds all packages
- Posts helpful comments on failure

**Workflow**: `.github/workflows/generators.yml`

---

## Customization

### Custom Variants (DS)

```bash
# Generate with specific variants
pnpm ds:new Badge --variants neutral,brand,success,warning,danger
```

Generator will:
1. Create SKIN entries for each variant
2. Update `variants.config.ts`
3. Generate stories covering all variants

### Custom DS Component (Forms)

```bash
# Field name doesn't match DS component
pnpm forms:new PhoneNumberField --ds-component Input

# Complex component
pnpm forms:new DateRangeField --ds-component Select
```

---

## Patterns & Best Practices

### DS Components

**Do:**
- ✅ Use design tokens only (`--ds-*`)
- ✅ Co-locate CSS with component
- ✅ Create SKIN map in registry
- ✅ Add Matrix story for visual regression
- ✅ Follow naming: `<Component>.tsx`, `<component>.skin.ts`

**Don't:**
- ❌ Use magic numbers
- ❌ Hardcode colors
- ❌ Skip variants in SKIN
- ❌ Import Flowbite directly

### Forms Fields

**Do:**
- ✅ Compose DS primitives (Input, Select, etc.)
- ✅ Use Field wrapper (label/hint/error)
- ✅ Register in field-types.ts
- ✅ Add config type in field-contracts.ts
- ✅ Add Matrix story

**Don't:**
- ❌ Import Flowbite directly (always use DS)
- ❌ Skip field registration
- ❌ Create custom CSS files
- ❌ Reinvent DS primitives

---

## Troubleshooting

### Generation Fails

**Error**: Component already exists
```bash
# Solution: Choose different name or delete existing
rm packages/ds/src/fb/Select.tsx
pnpm ds:new Select
```

**Error**: Invalid component name
```bash
# Must be PascalCase
pnpm ds:new select        # ❌ Wrong
pnpm ds:new Select        # ✅ Correct

# Fields must end with 'Field'
pnpm forms:new Text       # ❌ Wrong
pnpm forms:new TextField  # ✅ Correct
```

### Validation Fails

**Error**: Missing SKIN keys
```bash
# Solution: Re-run generator (it auto-generates complete SKIN)
pnpm ds:new Select
```

**Error**: TypeScript errors
```bash
# Check skin-contracts.ts was updated
# Re-run barrels
pnpm barrels
pnpm typecheck
```

**Error**: Field not registered
```bash
# Check field-types.ts has import + registerField()
# Re-run generator if missing
pnpm forms:new TextField
```

---

## Advanced Usage

### Batch Generation

```bash
# Generate multiple DS components
pnpm ds:new Select && \
pnpm ds:new Textarea && \
pnpm ds:new Checkbox

# Generate multiple fields
pnpm forms:new TextField && \
pnpm forms:new EmailField && \
pnpm forms:new SelectField
```

### Template Customization

Generators use inline templates. To customize:

1. **Edit generator**: `scripts/ds-new.mjs` or `scripts/forms-new.mjs`
2. **Update templates**: Modify `componentTemplate`, `cssTemplate`, etc.
3. **Test**: Generate new component and validate
4. **Document**: Update this guide

---

## Metrics (Kaizen)

Track generator effectiveness:

```bash
# Time to generate + validate
time (pnpm ds:new Select && pnpm doctor)

# Should be: ~10 minutes for DS, ~15 minutes for Forms
```

**Target Metrics:**
- DS component: <10 min (generation + validation)
- Forms field: <15 min (generation + validation)
- Validation pass rate: 100% (with standard patterns)
- Manual fixes needed: 0

**Continuous Improvement:**
- Review generated code quality quarterly
- Update templates based on learnings
- Add new variants/patterns as discovered
- Improve error messages based on usage

---

## Integration with Workflow

### Before PR

```bash
# 1. Generate component
pnpm ds:new Select

# 2. Full validation
pnpm doctor

# 3. Review in Storybook
pnpm sb

# 4. Commit
git add .
git commit -m "feat(ds): add Select component"
```

### In PR

CI automatically:
1. Validates generated code structure
2. TypeChecks completeness
3. Builds all packages
4. Posts comments if issues found

**Merge when**: All checks ✅ green

---

## Philosophy in Action

### Before Generators (Manual)

**Time**: 2-4 hours per component

**Steps**:
1. Create component file (30 min)
2. Create CSS file (30 min)
3. Create SKIN registry (20 min)
4. Update variants config (10 min)
5. Create stories (30 min)
6. Fix TypeScript errors (20 min)
7. Fix missing exports (15 min)
8. Debug inconsistencies (30 min)

**Issues**:
- Inconsistent patterns
- Missing steps
- Copy-paste errors
- Incomplete SKIN maps

### After Generators (Automated)

**Time**: 10-15 minutes per component

**Steps**:
1. Run generator (1 min)
2. Validate (9-14 min)

**Benefits**:
- ✅ 100% consistent
- ✅ Zero missing steps
- ✅ Complete SKIN maps
- ✅ Built-in quality
- ✅ 8-16x faster

---

## Summary

**Generators = Toyota Standard Work**

- **Jidoka**: Built-in quality (cannot generate incomplete)
- **Poka-Yoke**: Mistake-proofing (cannot deviate)
- **Standard Work**: Identical patterns (predictable timing)
- **Kaizen**: Continuous improvement (templates evolve)

**Commands:**
```bash
pnpm ds:new <Component>          # DS component
pnpm forms:new <Field>           # Forms field
pnpm validate:generated          # Validate structure
pnpm doctor                      # Full validation (includes generate check)
```

**Result**: Production-ready components in 10-15 minutes, every time.

---

**Status**: Production-ready metaprogramming system ✅
