# 🚀 Batch 3 GO Packet

**Status:** ✅ GREEN - Ready for execution  
**Duration:** ~90-120 minutes (5 fields)  
**Current:** 3/22 fields (14%) → **Target:** 8/22 fields (36%)

---

## 🎯 Target Fields

| # | Field | Type | Complexity | Est. Time |
|---|-------|------|------------|-----------|
| 1 | TextField | `text` | Simple | 15-20 min |
| 2 | SelectField | `select` | Simple | 15-20 min |
| 3 | DateField | `date` | Simple | 15-20 min |
| 4 | TimeField | `time` | Simple | 15-20 min |
| 5 | RatingField | custom | Medium | 20-25 min |

---

## 📋 Per-Field Workflow (Copy-Paste Ready)

### 1. Scaffold

```bash
node scripts/process/scaffold-field.mjs TextField text
# or
node scripts/process/scaffold-field.mjs SelectField select
# or  
node scripts/process/scaffold-field.mjs DateField date
# or
node scripts/process/scaffold-field.mjs TimeField time
# or
node scripts/process/scaffold-field.mjs RatingField text  # custom impl
```

### 2. Wire Basics (Follow NumberField Pattern)

Open: `packages/forms/src/fields/<FieldName>/<FieldName>.tsx`

**Required elements:**
- ✅ RHF `Controller`
- ✅ `FieldComponentProps` (name, control, errors, label, required, disabled, description, placeholder)
- ✅ Layout via `Stack`
- ✅ Label via `FormLabel` with `htmlFor={name}` and `required` prop
- ✅ Helper via `FormHelperText` with `aria-live="polite"`
- ✅ Error handling: `const hasError = Boolean((errors as any)?.[name])`
- ✅ ARIA: `aria-invalid`, `aria-describedby`

**Reference:**
```typescript
import { Controller, type FieldValues } from 'react-hook-form';
import type { FieldComponentProps } from '../../form-core/types';
import { FormLabel, FormHelperText, Stack } from '@intstudio/ds';

export function FieldName<T extends FieldValues = FieldValues>({
  name, control, errors, label, required, disabled, description, placeholder
}: FieldComponentProps<T>) {
  const hasError = Boolean((errors as any)?.[name]);
  const errorMessage = (errors as any)?.[name]?.message;

  return (
    <Stack spacing="tight">
      {label && (
        <FormLabel htmlFor={name} required={required} size="md">
          {label}
        </FormLabel>
      )}

      <Controller
        name={name as any}
        control={control as any}
        render={({ field }) => (
          <input
            type="..."
            id={name}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={description ? `${name}-desc` : undefined}
            value={field.value ?? ''}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            style={{ /* basic styles */ }}
          />
        )}
      />

      {description && (
        <div id={`${name}-desc`}>
          <FormHelperText size="sm" aria-live="polite">
            {description}
          </FormHelperText>
        </div>
      )}
      
      {hasError && errorMessage && (
        <FormHelperText variant="error" size="sm" aria-live="polite">
          {errorMessage as string}
        </FormHelperText>
      )}
    </Stack>
  );
}
```

### 3. Build Forms

```bash
pnpm -F @intstudio/forms build
```

**Expected:** Green build, no errors

### 4. Add DS Façade

Create: `packages/ds/src/fields/<FieldName>.ts`

```typescript
/**
 * <FieldName> - Compatibility Re-export
 * 
 * @deprecated Import from @intstudio/forms instead:
 * ```ts
 * import { <FieldName> } from '@intstudio/forms/fields';
 * ```
 * 
 * This re-export will be removed in v2.0.0
 * Migration: pnpm codemod:fields
 * Removal: see docs/COMPAT_FACADES.md
 */

// Runtime re-export only (types handled separately to avoid circular dependency)
// @ts-ignore - Forms package types not available during DS build
export { <FieldName> } from '@intstudio/forms/fields';
```

### 5. Build DS & Verify

```bash
pnpm -F @intstudio/ds build
```

**Expected:** Green build with automatic canonical check

### 6. Final Check (Optional but Recommended)

```bash
node scripts/hygiene/check-import-canonical.mjs
```

**Expected:** `✅ All import canonical source checks passed`

---

## ✅ Definition of "Done" (Per Field)

- [ ] Forms package builds green
- [ ] DS package builds green (with façade)
- [ ] Canonical import check passes
- [ ] Field follows NumberField pattern (~80 lines)
- [ ] No DS-specific props (json, typographyDisplay, etc.)
- [ ] ARIA attributes present (aria-invalid, aria-describedby)
- [ ] Error handling works (hasError + errorMessage)
- [ ] (Optional) Story added to Field Lab
- [ ] (Optional) Update `docs/COMPAT_FACADES.md`

---

## 🔍 Field-Specific Notes

### TextField
- **Type:** `text`
- **Props:** Standard FieldComponentProps
- **Special:** None - simplest field
- **Example:** See NumberField but with `type="text"`

### SelectField
- **Type:** `select`
- **Props:** Add `options: Array<{ value: string; label: string }>`
- **Special:** Render `<select>` with `<option>` children
- **Defer:** Multi-select, async search, custom dropdown UI

```typescript
export interface SelectFieldProps<T extends FieldValues = FieldValues> 
  extends FieldComponentProps<T> {
  options: Array<{ value: string; label: string }>;
}
```

### DateField
- **Type:** `date`
- **Props:** Standard FieldComponentProps
- **Special:** Use `<input type="date">` - native browser picker
- **Value:** ISO string (YYYY-MM-DD)

### TimeField
- **Type:** `time`
- **Props:** Standard FieldComponentProps  
- **Special:** Use `<input type="time">` - native browser picker
- **Value:** ISO time string (HH:MM)

### RatingField
- **Type:** custom
- **Props:** Add `max?: number` (default 5)
- **Special:** Simple approach - radio buttons or star buttons
- **Defer:** Half-stars, hover effects, custom icons

```typescript
export interface RatingFieldProps<T extends FieldValues = FieldValues>
  extends Omit<FieldComponentProps<T>, 'placeholder'> {
  max?: number;
}
```

---

## 🛡️ Guardrails Active

- ✅ **Import Doctor** - Filters vendored packages, tests, demo files
- ✅ **Canonical Check** - Runs automatically in DS postbuild
- ✅ **Build Order** - Forms → DS (enforced by dependency)
- ✅ **Import Boundary** - Forms can only import from `@intstudio/ds` (no internals)
- ✅ **Compat Tracking** - Documented in `COMPAT_FACADES.md`

---

## 📈 Progress Tracker

### Current State
- **Fields Complete:** 3/22 (14%)
  - NumberField ✅
  - TextareaField ✅
  - CheckboxField ✅

### After Batch 3
- **Fields Complete:** 8/22 (36%)
  - TextField ⏳
  - SelectField ⏳
  - DateField ⏳
  - TimeField ⏳
  - RatingField ⏳

### Next Batches
- **Batch 4:** SliderField, RangeField, TagInputField, DateTimeField (4 fields)
- **Batch 5:** ColorField, FileField, SignatureField, MultiSelectField, RepeaterField, ChipsField (6 complex)
- **Batch 6:** Remaining composite fields (9 fields)

---

## 🎓 Lessons from Batches 1-2

### What Worked
- ✅ Scaffold helper saves time
- ✅ Following NumberField pattern is fast
- ✅ Simplified props (no DS complexity) = easier to maintain
- ✅ Auto-barrel creation prevents missing exports
- ✅ DS façade with @ts-ignore handles circular deps cleanly

### What to Watch
- ⚠️ Remember to add local barrel (`index.ts`) - now automated
- ⚠️ Keep fields <100 lines - complexity belongs elsewhere
- ⚠️ Don't import DS internals - use `@intstudio/ds` barrel
- ⚠️ Test error handling manually before moving on

---

## 🚀 Quick Start Commands

```bash
# 1. Scaffold all 5 fields (optional - do one at a time if preferred)
node scripts/process/scaffold-field.mjs TextField text
node scripts/process/scaffold-field.mjs SelectField select
node scripts/process/scaffold-field.mjs DateField date
node scripts/process/scaffold-field.mjs TimeField time
node scripts/process/scaffold-field.mjs RatingField text

# 2. For each field:
#    - Customize implementation
#    - Build Forms: pnpm -F @intstudio/forms build
#    - Add DS façade
#    - Build DS: pnpm -F @intstudio/ds build

# 3. Final verification
pnpm -F @intstudio/forms build
pnpm -F @intstudio/ds build
node scripts/hygiene/check-import-canonical.mjs
```

---

## 🎯 Success Criteria

**Batch 3 is complete when:**
- ✅ All 5 fields scaffold + build green
- ✅ All 5 DS façades created + documented
- ✅ Forms package exports all 8 fields (3 existing + 5 new)
- ✅ Canonical import check passes
- ✅ No import drift (DS internals stay relative)
- ✅ 8/22 fields migrated = 36% complete

**Time estimate:** 90-120 minutes  
**Quality bar:** Same as Batches 1-2 (proven pattern)  
**Blocker risk:** None - infrastructure complete

---

## 🏁 You're Ready!

The conveyor belt is on. The guardrails are up. The documentation is complete.

**Next session = pure execution.** 🚀
