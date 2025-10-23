# Batch 3 Migration Plan

## Objective
Migrate 4-5 simple fields following the proven NumberField pattern.

## Target Fields (Simple First)

### High Priority (Simple Input Fields)
1. **TextField** - Basic text input (already in DS, simplify)
2. **SelectField** - Basic select (defer multi/async for later)
3. **DateField** - Date input with native picker
4. **TimeField** - Time input with native picker
5. **RatingField** - Star rating (can use simple radio/button group)

### Medium Priority (Slightly Complex)
- **SliderField** - Range slider (HTML5 `<input type="range">`)
- **RangeField** - Dual-handle range (may need custom logic)
- **TagInputField** - Simple tag input (defer chips UI for later)
- **DateTimeField** - Combined date + time

### Deferred (Complex/Composite)
- **ColorField** - Requires color picker UI
- **FileField** - Requires upload logic + preview
- **SignatureField** - Requires canvas
- **MultiSelectField** - Requires dropdown + chips
- **RepeaterField** - Requires nested form logic
- **ChipsField** - Requires complex chip UI

## Migration Pattern (Per Field)

### 1. Scaffold (5 min)
```bash
# Create field structure
mkdir -p packages/forms/src/fields/<FieldName>
```

### 2. Implement Simplified Field (10 min)
Follow **NumberField** pattern:
- Import: `Controller, FieldValues` from react-hook-form
- Import: `FieldComponentProps` from `../../form-core/types`
- Import: `FormLabel, FormHelperText, Stack` from `@intstudio/ds`
- Props: Only the minimal contract (name, control, errors, label, required, disabled, description, placeholder)
- Remove: All DS-specific props (json, typographyDisplay, typographyVariant, showError)
- ARIA: Proper `htmlFor`, `aria-invalid`, `aria-describedby`
- Error handling: Simple `errors[name]` check

### 3. Wire Barrels (2 min)
```typescript
// packages/forms/src/fields/<FieldName>/index.ts
export * from './<FieldName>';

// Add to packages/forms/src/fields/index.ts
export * from './<FieldName>';
```

### 4. Build & Verify (3 min)
```bash
pnpm -F @intstudio/forms build
```

### 5. Create DS Façade (2 min)
```bash
# Script creates automatically now!
# packages/ds/src/fields/<FieldName>.ts with @ts-ignore
```

### 6. Final Build & Guard (3 min)
```bash
pnpm -F @intstudio/ds build
pnpm imports:fix
pnpm guard
```

**Total per field: ~25 min** (with manual simplification)  
**Total for 5 fields: ~2 hours**

## Field-Specific Notes

### TextField
- Most straightforward - like NumberField but `type="text"`
- Support `maxLength` prop

### SelectField
- Use native `<select>` element
- Props: `options: Array<{ value: string; label: string }>`
- Defer: Multi-select, async search, custom dropdown UI

### DateField / TimeField
- Use native `<input type="date">` and `<input type="time">`
- Browser-native pickers
- ISO string values

### RatingField
- Simple approach: Radio buttons styled as stars
- Or: Use buttons with onClick
- Defer: Half-stars, hover effects

### SliderField
- Use `<input type="range">`
- Props: `min`, `max`, `step`
- Display current value

## Success Criteria

- [ ] All 5 fields build green in Forms
- [ ] All 5 DS façades build green
- [ ] Guard passes (or only non-blocking warnings)
- [ ] Each field <100 lines
- [ ] Zero DS internals imported
- [ ] COMPAT_FACADES.md updated
- [ ] (Optional) Field Lab stories added
- [ ] (Optional) API snapshots taken

## Next Session Commands

```bash
# Option 1: One by one (recommended for first time)
# Scaffold manually, then verify
pnpm -F @intstudio/forms build
pnpm -F @intstudio/ds build
pnpm guard

# Option 2: Use script (after testing first field manually)
node scripts/process/migrate-field.mjs TextField
node scripts/process/migrate-field.mjs SelectField
node scripts/process/migrate-field.mjs DateField
node scripts/process/migrate-field.mjs TimeField
node scripts/process/migrate-field.mjs RatingField
```

## Post-Batch 3

Once 5 more fields are migrated:
1. Add all 8 fields to Field Lab stories
2. Run accessibility audit with axe
3. Document any patterns/gotchas
4. Update migration metrics
5. Plan Batch 4 (next 5-7 simple fields)

## Migration Progress Tracker

| Batch | Fields | Status | Date |
|-------|--------|--------|------|
| 1 | NumberField | ✅ Complete | 2025-10-23 |
| 2 | TextareaField, CheckboxField | ✅ Complete | 2025-10-23 |
| 3 | TextField, SelectField, DateField, TimeField, RatingField | 🔄 Planned | TBD |
| 4 | SliderField, RangeField, TagInputField, DateTimeField | 📋 Backlog | TBD |
| 5 | Complex fields (Color, File, Signature, Multi, Repeater, Chips) | 📋 Backlog | TBD |

**Total: 3/22 fields migrated (14%)**
