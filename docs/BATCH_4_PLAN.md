# Batch 4 - Migration Plan

**Target:** 4-5 fields  
**Estimated Time:** 1.5-2 hours  
**Current Progress:** 8/22 (36%)  
**Target Progress:** 12-13/22 (55-59%)

---

## 🎯 Target Fields (Prioritized)

### 1. SliderField (Simple) - ~20 min
- **Base:** `<input type="range">`
- **Props:** `min`, `max`, `step` (optional)
- **Value:** Number
- **Pattern:** Like NumberField but with range input
- **Notes:** Native slider, no custom UI needed

### 2. RangeField (Pair) - ~25 min
- **Base:** Two number inputs (min/max)
- **Props:** `minBound`, `maxBound`, `step` (optional)
- **Value:** `{ min: number; max: number }`
- **Pattern:** Composite of two NumberField-like inputs
- **Notes:** Validate min ≤ max

### 3. DateTimeField (Native) - ~15 min
- **Base:** `<input type="datetime-local">`
- **Props:** Standard FieldComponentProps
- **Value:** ISO datetime string
- **Pattern:** Like DateField/TimeField
- **Notes:** Simplest - native browser picker

### 4. TagInputField (Simple) - ~25 min
- **Base:** Text input + Enter/comma separation
- **Props:** `separator?: string` (default: ',')
- **Value:** `string[]`
- **Pattern:** Text input with onChange parsing
- **Notes:** Defer fancy UI (chips, autocomplete)

### 5. (Optional) ColorField - ~20 min
- **Base:** `<input type="color">`
- **Props:** Standard FieldComponentProps
- **Value:** Hex string
- **Pattern:** Like DateField (native)
- **Notes:** Quick win if time permits

---

## 📋 Per-Field Workflow (Proven)

```bash
# 1. Scaffold (~2 min)
node scripts/process/scaffold-field.mjs <Name> <type>

# 2. Customize (~10-15 min)
# - Follow NumberField pattern
# - Add field-specific props if needed
# - Wire RHF Controller
# - Add ARIA attributes

# 3. Build Forms (~1 min)
pnpm -F @intstudio/forms build

# 4. Add DS Façade (~2 min)
# Create packages/ds/src/fields/<Name>.ts
# Copy template with @deprecated + @ts-ignore

# 5. Build DS (~1 min)
pnpm -F @intstudio/ds build  # Auto-runs canonical check

# 6. Verify (optional, ~1 min)
node scripts/hygiene/check-import-canonical.mjs
```

**Average:** ~17-20 min/field

---

## 🎨 Field-Specific Implementation Notes

### SliderField

```typescript
export interface SliderFieldProps<T extends FieldValues = FieldValues>
  extends Omit<FieldComponentProps<T>, 'placeholder'> {
  min?: number;     // default 0
  max?: number;     // default 100
  step?: number;    // default 1
}

// Render:
<input
  type="range"
  min={min}
  max={max}
  step={step}
  value={field.value ?? min}
  onChange={(e) => field.onChange(Number(e.target.value))}
/>
// Optional: Show current value as helper text
```

### RangeField

```typescript
export interface RangeFieldProps<T extends FieldValues = FieldValues>
  extends Omit<FieldComponentProps<T>, 'placeholder'> {
  minBound?: number;  // default 0
  maxBound?: number;  // default 100
  step?: number;      // default 1
}

// Value: { min: number; max: number }
// Render: Two number inputs side by side
// Validation: min ≤ max (enforce in onChange)
```

### DateTimeField

```typescript
// Simplest - just like DateField/TimeField
<input
  type="datetime-local"
  value={field.value ?? ''}
  onChange={(e) => field.onChange(e.target.value)}
/>
// Value: ISO datetime string (YYYY-MM-DDTHH:MM)
```

### TagInputField

```typescript
export interface TagInputFieldProps<T extends FieldValues = FieldValues>
  extends FieldComponentProps<T> {
  separator?: string;  // default ','
}

// Value: string[]
// Parse on change:
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const tags = e.target.value.split(separator).map(t => t.trim()).filter(Boolean);
  field.onChange(tags);
};
// Display: Join array for input value
// Optional: Show tags as comma-separated below input
```

---

## ✅ Success Criteria (Per Field)

- [ ] Scaffolded successfully
- [ ] Implementation follows NumberField pattern
- [ ] Forms build green
- [ ] DS façade created with deprecation
- [ ] DS build green (canonical check passes)
- [ ] ~80-120 lines of code
- [ ] ARIA attributes present
- [ ] No DS internals imported
- [ ] Added to `docs/COMPAT_FACADES.md`

---

## 🎯 Batch 4 Goals

### Primary
- Migrate 4-5 more fields
- Maintain <20 min/field average
- 100% build success rate
- 100% pattern compliance

### Stretch
- Add Field Lab stories for visual QA
- Run axe accessibility scan
- Create progress badge for README
- Draft Batch 5 plan

---

## 📊 Projected Progress

```
Current:   ████████░░░░░░░░░░░░░  8/22  (36%)
Batch 4:   ████████████░░░░░░░░░  12/22 (55%)  [4 fields]
Batch 4+:  █████████████░░░░░░░░  13/22 (59%)  [5 fields]
```

**Next milestone:** 50% (11 fields)  
**Path to 50%:** Complete Batch 4 + 3 more fields in Batch 5

---

## 🚀 Quick Start (When Ready)

```bash
# Option A: Scaffold all at once
node scripts/process/scaffold-field.mjs SliderField text
node scripts/process/scaffold-field.mjs RangeField text
node scripts/process/scaffold-field.mjs DateTimeField text
node scripts/process/scaffold-field.mjs TagInputField text

# Option B: One at a time (recommended)
# Start with DateTimeField (easiest - native input)
node scripts/process/scaffold-field.mjs DateTimeField text
# ... customize, build, façade, done
```

---

## 🛡️ Guardrails (Already Active)

- ✅ Canonical check (postbuild)
- ✅ Import Doctor (vendor/tests filtered)
- ✅ Build order enforced
- ✅ Compat tracking
- ✅ Pattern templates

---

## 📝 Commit Template

```
feat(forms): migrate Batch 4 fields (<List>)

- Migrated 4-5 fields from DS to Forms
- <Field1>: <description> (<LOC> lines)
- <Field2>: <description> (<LOC> lines)
- <Field3>: <description> (<LOC> lines)
- <Field4>: <description> (<LOC> lines)
- Added DS compatibility façades with deprecations
- All fields follow simplified FieldComponentProps pattern
- Progress: 12-13/22 fields (55-59%)
- Both packages building green
- Tracked in docs/COMPAT_FACADES.md

Refs: Batch 4 execution
```

---

## 🎓 Lessons from Batch 3

**Apply:**
- Native inputs are fastest (prioritize DateTimeField)
- Scaffold all fields upfront (reduces context switching)
- Build after each field (catch issues early)
- Simple custom logic is manageable (RatingField pattern)

**Watch:**
- Complex validation (keep simple for Batch 4)
- Custom UI (defer to later batches)
- Multi-value fields (RangeField, TagInputField need careful typing)

---

**Ready when you are!** 🚀
