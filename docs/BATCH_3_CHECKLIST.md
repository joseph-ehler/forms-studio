# ✅ Batch 3 Execution Checklist

**Status:** 🟢 GO  
**Target:** 5 fields (~90-120 min)  
**Order:** Easy → Harder (maintain momentum)

---

## 📋 Per-Field Checklist (Copy-Paste)

```
Field: _______________

[ ] 1. Scaffold
    node scripts/process/scaffold-field.mjs <Name> <type>

[ ] 2. Wire (follow NumberField)
    - FieldComponentProps<T>
    - Stack + FormLabel + FormHelperText
    - const hasError = Boolean((errors as any)?.[name])
    - Controller with proper coercion
    - aria-live="polite" on helper/error

[ ] 3. Build Forms
    pnpm -F @intstudio/forms build
    ✅ GREEN

[ ] 4. Add DS Façade
    // packages/ds/src/fields/<Name>.ts
    /** @deprecated ... */
    // @ts-ignore
    export { <Name> } from '@intstudio/forms/fields';

[ ] 5. Build DS
    pnpm -F @intstudio/ds build
    ✅ GREEN (canonical check auto-runs)

[ ] 6. Guard
    pnpm guard
    ✅ PASSES

[ ] 7. (Optional) Story
    Add to FieldLab.stories.tsx

[ ] 8. Update Compat
    Add entry to docs/COMPAT_FACADES.md

Time: _____ min
```

---

## 🎯 Batch 3 Order (Suggested)

### 1. TextField ⚡ (Easiest - 15 min)
- **Type:** `text`
- **Scaffold:** `node scripts/process/scaffold-field.mjs TextField text`
- **Notes:** Simplest - just like NumberField but `type="text"`

### 2. RatingField ⭐ (Simple Custom - 20 min)
- **Type:** `text` (customize to radio/buttons)
- **Scaffold:** `node scripts/process/scaffold-field.mjs RatingField text`
- **Notes:** Radio buttons or simple star buttons
- **Props:** Add `max?: number` (default 5)

### 3. SelectField 📝 (Basic - 20 min)
- **Type:** `select`
- **Scaffold:** `node scripts/process/scaffold-field.mjs SelectField select`
- **Notes:** Native `<select>`, defer async/multi
- **Props:** Add `options: Array<{ value: string; label: string }>`

### 4. DateField 📅 (Native - 15 min)
- **Type:** `date`
- **Scaffold:** `node scripts/process/scaffold-field.mjs DateField date`
- **Notes:** Use `<input type="date">` - browser native
- **Value:** ISO string (YYYY-MM-DD)

### 5. TimeField ⏰ (Native - 15 min)
- **Type:** `time`
- **Scaffold:** `node scripts/process/scaffold-field.mjs TimeField time`
- **Notes:** Use `<input type="time">` - browser native
- **Value:** ISO time (HH:MM)

---

## 🔧 Common Pitfalls & Fixes

| Problem | Fix |
|---------|-----|
| `Could not resolve "./<Name>"` | Create `packages/forms/src/fields/<Name>/index.ts` |
| Forms can't find DS imports | Use `import { ... } from '@intstudio/ds'` |
| useMotion warning returns | Run `pnpm -F @intstudio/ds build` (postbuild checks) |
| Guard noise from vendor | Already silenced; add to `shouldCheck()` if new patterns |

---

## 📦 Field Template Reference

```typescript
import React from 'react';
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
            style={{ /* minimal styles */ }}
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

---

## 🎯 Acceptance Criteria (Per Field)

- ✅ Forms build green
- ✅ DS build green (façade added)
- ✅ Canonical check passes (auto in postbuild)
- ✅ No DS internals leak into Forms
- ✅ ~80-120 LOC, matches pattern
- ✅ Guard passes

---

## 📝 Commit Message Template

```
feat(forms): migrate <FieldName> (+DS façade)

- Simplified field following NumberField pattern
- Added DS compat façade with deprecation notice
- Tracked removal in docs/COMPAT_FACADES.md

Refs: #<issue>
```

---

## 📊 Progress Tracking

```
Before: ███░░░░░░░░░░░░░░░░░░  3/22 (14%)
After:  ████████░░░░░░░░░░░░░  8/22 (36%)
```

| Field | Status | Time | Notes |
|-------|--------|------|-------|
| TextField | ⏳ | ___ min | |
| RatingField | ⏳ | ___ min | |
| SelectField | ⏳ | ___ min | |
| DateField | ⏳ | ___ min | |
| TimeField | ⏳ | ___ min | |

**Total:** ___ min (Target: 90-120 min)

---

## 🚀 Quick Start Commands

```bash
# TextField
node scripts/process/scaffold-field.mjs TextField text
# ... customize ...
pnpm -F @intstudio/forms build
# ... add façade ...
pnpm -F @intstudio/ds build

# RatingField
node scripts/process/scaffold-field.mjs RatingField text
# ... customize (radio/stars) ...
pnpm -F @intstudio/forms build
# ... add façade ...
pnpm -F @intstudio/ds build

# SelectField
node scripts/process/scaffold-field.mjs SelectField select
# ... add options prop ...
pnpm -F @intstudio/forms build
# ... add façade ...
pnpm -F @intstudio/ds build

# DateField
node scripts/process/scaffold-field.mjs DateField date
# ... customize ...
pnpm -F @intstudio/forms build
# ... add façade ...
pnpm -F @intstudio/ds build

# TimeField
node scripts/process/scaffold-field.mjs TimeField time
# ... customize ...
pnpm -F @intstudio/forms build
# ... add façade ...
pnpm -F @intstudio/ds build
```

---

## 🏁 Batch Complete When...

- ✅ All 5 fields scaffolded + built
- ✅ All 5 DS façades created
- ✅ Forms exports 8 fields total (3 + 5)
- ✅ All builds green
- ✅ Guard passes
- ✅ docs/COMPAT_FACADES.md updated
- ✅ 8/22 = 36% complete

**Ready to execute!** 🚀
