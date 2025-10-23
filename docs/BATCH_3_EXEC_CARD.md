# ⚡ Batch 3 - Ultra-Concise Execution Card

**Target:** 5 fields, 90-120 min, 3/22 → 8/22 (36%)

---

## 🚀 One-Liner Scaffold (Optional)

```bash
bash scripts/process/batch-3-scaffold-all.sh
```

OR scaffold individually:

```bash
node scripts/process/scaffold-field.mjs TextField text
node scripts/process/scaffold-field.mjs RatingField text
node scripts/process/scaffold-field.mjs SelectField select
node scripts/process/scaffold-field.mjs DateField date
node scripts/process/scaffold-field.mjs TimeField time
```

---

## 🔄 Per-Field Loop (~17 min each)

### 1. Customize (10 min)
Open: `packages/forms/src/fields/<Name>/<Name>.tsx`

**Must-haves:**
- `import { FormLabel, FormHelperText, Stack } from '@intstudio/ds'`
- `const hasError = Boolean((errors as any)?.[name])`
- `FormLabel htmlFor={name} required={required}`
- `FormHelperText aria-live="polite"`
- `aria-invalid={hasError || undefined}`

### 2. Build Forms (1 min)
```bash
pnpm -F @intstudio/forms build
```

### 3. Add DS Façade (2 min)
Create: `packages/ds/src/fields/<Name>.ts`

```typescript
/**
 * <Name> - Compatibility Re-export
 * @deprecated Import from @intstudio/forms/fields
 * Removal: v2.0.0 (see docs/COMPAT_FACADES.md)
 */
// @ts-ignore
export { <Name> } from '@intstudio/forms/fields';
```

### 4. Build DS (1 min)
```bash
pnpm -F @intstudio/ds build  # Auto-runs canonical check
```

### 5. Guard (Optional, 1 min)
```bash
pnpm guard
```

---

## 📝 Field-Specific Notes

| Field | Type | Special Props | Notes |
|-------|------|---------------|-------|
| TextField | `text` | - | Like NumberField, `type="text"` |
| RatingField | custom | `max?: number` | Radio/buttons, default max=5 |
| SelectField | `select` | `options: {value,label}[]` | Native `<select>` |
| DateField | `date` | - | `<input type="date">`, ISO string |
| TimeField | `time` | - | `<input type="time">`, HH:MM |

---

## 🛠️ Quick Fixes

| Problem | Fix |
|---------|-----|
| `Could not resolve` | Add `packages/forms/src/fields/<Name>/index.ts` |
| Can't find DS | Use `@intstudio/ds`, not internals |
| Canonical check fails | Run `node scripts/hygiene/check-import-canonical.mjs` |
| Guard noise | Already filtered (vendor/tests/demo) |

---

## ✅ Definition of Done (Per Field)

- [ ] Forms build green
- [ ] DS build green (with façade)
- [ ] Canonical check passes (auto)
- [ ] ~80-120 LOC
- [ ] No DS internals imported

---

## 📊 Track Progress

| Field | Time | Status |
|-------|------|--------|
| TextField | ___ | ⏳ |
| RatingField | ___ | ⏳ |
| SelectField | ___ | ⏳ |
| DateField | ___ | ⏳ |
| TimeField | ___ | ⏳ |

---

## 💾 Commit Template

```bash
git commit -m "feat(forms): migrate TextField, RatingField

- Simplified fields (RHF + a11y)
- DS façades with deprecations
- Builds + canonical checks green
- Refs: docs/COMPAT_FACADES.md"
```

---

## 🎯 Order (Momentum)

1. TextField ⚡ (easiest)
2. RatingField ⭐ (simple custom)
3. SelectField 📝 (native select)
4. DateField 📅 (native)
5. TimeField ⏰ (native)

---

**🟢 READY - GO!**
