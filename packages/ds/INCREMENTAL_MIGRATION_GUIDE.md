# 🔧 INCREMENTAL DS MIGRATION GUIDE

**Safe, controlled migration - 3-5 fields per commit**

---

## ✅ PREREQUISITES

1. ✅ Infrastructure files in place:
   - `src/components/DSShims.tsx`
   - `src/fields/utils/a11y-helpers.ts`
   - `src/validation/generateZodFromJSON.ts`
   - `src/components/OverlayPicker.tsx`

2. ✅ Guardrails installed:
   - ESLint rule for layout classes
   - `scripts/check-jsx-pairs.js`

3. ✅ Build is GREEN

---

## 📋 MIGRATION WORKFLOW (Per Field)

### Step 1: Pick 3-5 Simple Fields
Start with foundation fields that have minimal nesting:
- TextField
- NumberField
- TextareaField
- ToggleField
- DateField

### Step 2: Create Feature Branch
```bash
git checkout -b feat/ds-migrate-batch-1
```

### Step 3: Migrate ONE Field

#### A. Add Imports (Top of File)
```typescript
import { Stack, Flex } from '../components/DSShims'
```

#### B. Replace Outer Wrapper Only
```typescript
// BEFORE:
export const TextField = (...) => {
  return (
    <div className="space-y-4">  // ❌
      ...
    </div>
  )
}

// AFTER:
export const TextField = (...) => {
  return (
    <Stack spacing="normal">  // ✅
      ...
    </Stack>
  )
}
```

#### C. **STOP** - Don't Touch Inner Divs Yet!
Leave inner Tailwind classes alone for now:
```typescript
// LEAVE THESE ALONE in first pass:
<div className="flex items-center gap-2">  // OK for now
<div className="relative">  // OK for now
```

### Step 4: Verify Tags Match
```bash
node scripts/check-jsx-pairs.js src/fields/TextField.tsx
```

### Step 5: Test Build
```bash
npm run build
```

### Step 6: Test Visually
```bash
npm run dev
# Check the field renders correctly in demo
```

### Step 7: Commit Immediately
```bash
git add src/fields/TextField.tsx
git commit -m "feat: migrate TextField to DS (outer wrapper only)"
```

### Step 8: Repeat for 2-4 More Fields
```bash
# Do NumberField
node scripts/check-jsx-pairs.js src/fields/NumberField.tsx
npm run build
git add src/fields/NumberField.tsx
git commit -m "feat: migrate NumberField to DS"

# Do TextareaField
# ... same process
```

### Step 9: PR with Small Batch
```bash
git push origin feat/ds-migrate-batch-1
# Create PR: "feat: DS migration batch 1 (TextField, NumberField, TextareaField)"
```

---

## 🎯 MIGRATION BATCHES (Recommended Order)

### Batch 1: Simple Foundation (3 fields)
- TextField
- NumberField  
- TextareaField

### Batch 2: Date/Time (3 fields)
- DateField
- TimeField
- DateTimeField

### Batch 3: Selection (3 fields)
- SelectField
- ToggleField
- ChipsField

### Batch 4: File/Calculated (3 fields)
- FileField
- CalculatedField
- SliderField

### Batch 5: Simple Composite (3 fields)
- EmailField
- PasswordField
- SearchField

### Batch 6: Advanced Composite (3 fields)
- PhoneField
- DateRangeField
- MatrixField

### Batch 7: Complex Fields (1-2 per batch)
- MultiSelectField
- TagInputField
- OTPField

### Batch 8: Very Complex (1 per batch)
- ColorField (full rewrite)
- RatingField
- RepeaterField

---

## ⚠️ RULES OF ENGAGEMENT

### DO:
- ✅ One field at a time
- ✅ Outer wrapper only in first pass
- ✅ Run tag checker after each
- ✅ Build after each
- ✅ Commit after each
- ✅ Small PRs (3-5 fields max)

### DON'T:
- ❌ Touch multiple fields at once
- ❌ Convert inner Tailwind in same commit
- ❌ Skip the tag checker
- ❌ Skip the build test
- ❌ Large batch commits
- ❌ Touch ColorField until last

---

## 🐛 IF SOMETHING BREAKS

### Build Fails?
```bash
# Immediately rollback the field
git checkout HEAD -- src/fields/[BrokenField].tsx

# Review what went wrong
git diff HEAD~1 src/fields/[BrokenField].tsx

# Fix and try again
```

### Tags Mismatch?
```bash
# Run checker to see exact issue
node scripts/check-jsx-pairs.js src/fields/[Field].tsx

# Common fixes:
# - </Stack> should be </div>
# - </div> should be </Stack>
# - Missing closing tag
```

### Visual Bug?
```bash
# Check spacing token
<Stack spacing="normal">  # Try: tight, normal, relaxed

# Check if Flex needed instead
<Flex gap="md" align="center">  # For horizontal layouts
```

---

## 📊 TRACKING PROGRESS

Create `DS_MIGRATION_TRACKER.md`:

```markdown
# DS Migration Progress

## ✅ Completed (12/32)
- [x] TextField - Batch 1
- [x] NumberField - Batch 1
- [x] TextareaField - Batch 1
- [x] DateField - Batch 2
- ... 

## 🔄 In Progress (3/32)
- [ ] TimeField - Batch 2 (PR #123)
- [ ] DateTimeField - Batch 2 (PR #123)
- [ ] SelectField - Batch 3 (PR #124)

## ⏳ Pending (17/32)
- [ ] ToggleField
- [ ] ChipsField
...
```

---

## 🎉 AFTER MIGRATION COMPLETE

### Phase 2: Inner Tailwind Cleanup
Now go back and replace inner layout classes:
```typescript
// BEFORE:
<div className="flex items-center gap-2">
  <span>Icon</span>
  <span>Label</span>
</div>

// AFTER:
<Flex align="center" gap="sm">
  <span>Icon</span>
  <span>Label</span>
</Flex>
```

### Phase 3: A11y Integration
```typescript
import { getAriaProps, getLabelProps } from './utils/a11y-helpers'

<FormLabel {...getLabelProps(name, config)}>{label}</FormLabel>
<input {...getAriaProps(name, config, { errors })} />
```

### Phase 4: Auto-Zod Wiring
```typescript
import { generateZodFromJSON } from '../validation/generateZodFromJSON'

const schema = generateZodFromJSON(json.fields)
const form = useForm({ resolver: zodResolver(schema) })
```

### Phase 5: OverlayPicker Integration
```typescript
import { OverlayPicker } from '../components/OverlayPicker'

// In SelectField, MultiSelectField, DateField, etc.
<OverlayPicker
  presentation="sheet"
  searchable
  title="Select Option"
>
  {/* options */}
</OverlayPicker>
```

---

## 🏁 SUCCESS CRITERIA

- [ ] All 32 fields migrated
- [ ] Build is green
- [ ] All tests pass
- [ ] Visual QA complete
- [ ] No Tailwind layout classes in fields
- [ ] A11y helpers integrated
- [ ] Auto-Zod wired up
- [ ] OverlayPicker in use
- [ ] Documentation updated
- [ ] PR approved & merged

**Estimated Time:** 2-3 hours per batch × 8 batches = 16-24 hours total

**But:** You're doing it SAFELY with no compound damage! 🎯
