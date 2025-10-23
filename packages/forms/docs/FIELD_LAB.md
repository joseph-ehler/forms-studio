# Field Lab - Visual QA for Form Fields

**Location:** `packages/forms/src/fields/FieldLab.stories.tsx`

## Purpose

The Field Lab is a Storybook story that provides **instant visual QA** during batch field migrations from `@intstudio/ds` to `@intstudio/forms`.

## Features

✅ **All fields in one place** - See every migrated field at a glance  
✅ **Zod + React Hook Form** - Real validation behavior  
✅ **Visual states** - Empty, filled, error, disabled, required  
✅ **A11y testing** - Catch accessibility issues early  
✅ **Debug panel** - Inspect form state and errors  

---

## Usage During Migration

### When Migrating a New Field

**Example:** Migrating `NumberField`

1. **Migrate the field** using process scripts:
   ```bash
   pnpm process:migrate-field NumberField
   ```

2. **Add to Field Lab story:**
   ```tsx
   // In FieldLab.stories.tsx
   
   // 1. Update schema
   const fieldLabSchema = z.object({
     // ... existing fields
     age: z.number().min(18, 'Must be 18 or older'),
     quantity: z.number().positive(),
   });
   
   // 2. Add field instances
   <NumberField
     label="Age"
     {...register('age', { valueAsNumber: true })}
     error={errors.age?.message}
     required
   />
   
   <NumberField
     label="Quantity"
     {...register('quantity', { valueAsNumber: true })}
     error={errors.quantity?.message}
   />
   ```

3. **Run Storybook:**
   ```bash
   pnpm storybook
   ```

4. **Visual QA Checklist:**
   - [ ] Field renders without errors
   - [ ] Label is visible and associated
   - [ ] Error states display correctly
   - [ ] Required indicator shows
   - [ ] Helper text renders
   - [ ] Disabled state works
   - [ ] Keyboard navigation works
   - [ ] Screen reader announcements correct
   - [ ] Form submission works

---

## Field States to Test

### 1. Empty State
- Label visible
- Placeholder (if applicable)
- Helper text

### 2. Filled State
- Value displays correctly
- No error message

### 3. Error State
- Error message visible
- Error styling applied
- Aria-invalid set

### 4. Required State
- Required indicator visible
- Validation on blur/submit

### 5. Disabled State
- Field appears disabled
- Cannot be edited
- Proper aria-disabled

---

## Adding New Field Types

### Template

```tsx
// 1. Add to schema
const fieldLabSchema = z.object({
  // ... existing
  myField: z.string().min(1, 'Required'),
});

// 2. Add to form
<MyField
  label="My Field"
  {...register('myField')}
  error={errors.myField?.message}
  required
/>

// 3. Add individual stories
export const MyField_Empty: Story = {
  render: () => (
    <div style={{ padding: 24, maxWidth: 400 }}>
      <MyField label="Empty" />
    </div>
  ),
};

export const MyField_WithError: Story = {
  render: () => (
    <div style={{ padding: 24, maxWidth: 400 }}>
      <MyField label="With Error" error="This field is required" />
    </div>
  ),
};
```

---

## A11y Testing

### Automated Checks (Storybook)
- Run `pnpm storybook` with a11y addon enabled
- Check for contrast issues
- Verify ARIA attributes
- Test keyboard navigation

### Manual Checks
- Tab through all fields
- Verify focus indicators
- Test screen reader announcements
- Verify error announcements

---

## Batch Migration Workflow

When migrating **multiple fields** in one batch:

```bash
# 1. Preflight
pnpm process:preflight batch-2-fields

# 2. Baseline
pnpm process:baseline

# 3. Migrate each field
pnpm process:migrate-field NumberField
pnpm process:migrate-field CheckboxField
pnpm process:migrate-field TextareaField

# 4. Add all to Field Lab
# Edit FieldLab.stories.tsx to add new fields

# 5. Visual QA in Storybook
pnpm storybook
# → Navigate to Forms/Field Lab
# → Test all new fields

# 6. Verify
pnpm process:verify

# 7. Close
pnpm process:close
```

---

## Debug Panel

The Field Lab includes a debug panel showing:
- Current form errors
- Validation state
- Field values (in console on submit)

**Usage:**
1. Click "Debug Info" at bottom of form
2. See current error state
3. Submit form to log all values to console

---

## Benefits

### During Development
- **Instant feedback** - See field immediately after migration
- **Catch bugs early** - Visual regression obvious
- **Test validation** - Zod errors display correctly

### During Review
- **Screenshot in PR** - Visual proof field works
- **A11y audit** - Storybook a11y addon reports issues
- **Consistent QA** - Same checklist for every field

### Long-term
- **Living documentation** - All fields with examples
- **Regression testing** - Visual snapshots prevent drift
- **Onboarding** - New devs see all fields in one place

---

## Field Migration Checklist

Use this checklist when adding a field to Field Lab:

**Schema:**
- [ ] Field added to `fieldLabSchema`
- [ ] Validation rules defined
- [ ] Type inferred correctly

**Form Instance:**
- [ ] Field rendered in main form
- [ ] Registered with RHF
- [ ] Error message wired
- [ ] Required prop set (if applicable)
- [ ] Helper text added (if applicable)

**Individual Stories:**
- [ ] Empty state story
- [ ] With value story
- [ ] With error story
- [ ] Required story
- [ ] Disabled story

**QA:**
- [ ] Renders without console errors
- [ ] Validation works
- [ ] Error displays correctly
- [ ] Keyboard navigation works
- [ ] A11y addon shows no issues

---

## Tips

**Hot Reload:**
- Storybook hot-reloads on changes
- Edit field, see updates instantly

**Keyboard Testing:**
- Use Tab to navigate
- Shift+Tab to go backward
- Enter to submit
- Escape to clear (if applicable)

**Screen Reader Testing:**
- VoiceOver (Mac): Cmd+F5
- NVDA (Windows): Free download
- Check label associations
- Verify error announcements

---

## Future Enhancements

**Phase 4+:**
- [ ] Add all field types as they're migrated
- [ ] Add composite field examples
- [ ] Add form-level validation examples
- [ ] Add async validation examples
- [ ] Add multi-step form example
- [ ] Add conditional fields example
- [ ] Visual regression snapshots

**Keep this updated!** Field Lab is a living document of the Forms package.
