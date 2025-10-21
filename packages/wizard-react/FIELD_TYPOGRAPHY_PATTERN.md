# 🎯 MANDATORY Field Typography Pattern

**Date:** Oct 20, 2025  
**Status:** ✅ ENFORCED - All fields MUST follow this pattern

---

## THE RULE

**ALL form field components MUST use typography components internally.**

This prevents:
- ❌ Double labels
- ❌ Inconsistent styling
- ❌ Duplication
- ❌ Maintenance nightmares

---

## MANDATORY IMPORTS

Every field component MUST import:

```tsx
import { FormLabel, FormHelperText } from '../components'
```

---

## MANDATORY PATTERN

### ✅ CORRECT (Use Typography Components)

```tsx
import React from 'react'
import { Controller } from 'react-hook-form'
import type { FieldComponentProps } from './types'
import { FormLabel, FormHelperText } from '../components'

export const MyField: React.FC<FieldComponentProps> = ({
  name,
  label,
  required,
  description,
  control,
  errors,
}) => {
  return (
    <div className="space-y-1">
      {/* ✅ USE FormLabel */}
      {label && (
        <FormLabel htmlFor={name} required={required}>
          {label}
        </FormLabel>
      )}
      
      {/* ✅ USE FormHelperText for description */}
      {description && (
        <FormHelperText>{description}</FormHelperText>
      )}
      
      {/* Your input here */}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input {...field} />
        )}
      />
      
      {/* ✅ USE FormHelperText with error variant */}
      {errors?.[name]?.message && (
        <FormHelperText variant="error">
          {String(errors[name].message)}
        </FormHelperText>
      )}
    </div>
  )
}
```

---

### ❌ WRONG (Raw HTML)

```tsx
// ❌ DO NOT DO THIS!
return (
  <div className="space-y-1">
    {/* ❌ RAW HTML LABEL */}
    {label && (
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    
    {/* ❌ RAW HTML P TAG */}
    {description && (
      <p className="text-sm text-gray-500">{description}</p>
    )}
    
    <input {...field} />
    
    {/* ❌ RAW HTML ERROR */}
    {errors?.[name]?.message && (
      <p className="text-sm text-red-600">{String(errors[name].message)}</p>
    )}
  </div>
)
```

---

## WHY THIS MATTERS

### Single Source of Truth
- Typography styles defined once in components
- Update one place → all fields update
- No style drift

### Prevents Double Labels
- Users can't accidentally add both
- Field handles it internally
- Foolproof API

### Consistent Experience
- All fields look the same
- Required indicator standardized
- Error styling unified

### Easy Maintenance
- Change `FormLabel` → all fields update
- Add tooltip support → available everywhere
- No hunting through 35 files

---

## BENEFITS OF PATTERN

### For Developers
✅ Import components → use them  
✅ Can't mess up styling  
✅ Consistent across all fields  
✅ Easy to understand  

### For Users
✅ Never see double labels  
✅ Consistent experience  
✅ Professional appearance  
✅ Clear error messages  

### For Maintainers
✅ Update once, apply everywhere  
✅ No style drift  
✅ Easy to enhance  
✅ Less code to maintain  

---

## FIELD CHECKLIST

Before committing a field component, verify:

- [ ] Imports `FormLabel` and `FormHelperText`
- [ ] Uses `<FormLabel>` for label
- [ ] Uses `<FormHelperText>` for description
- [ ] Uses `<FormHelperText variant="error">` for errors
- [ ] NO raw `<label>` tags
- [ ] NO raw `<p>` tags for descriptions/errors
- [ ] NO manual required asterisk (let FormLabel handle it)

---

## ENHANCED PATTERNS

### With Tooltip
```tsx
<FormLabel 
  htmlFor={name} 
  required={required}
  tooltip={<FormTooltip content="Help text here" />}
>
  {label}
</FormLabel>
```

### With Optional Badge
```tsx
<FormLabel htmlFor={name} optional>
  {label}
</FormLabel>
```

### Success Message
```tsx
<FormHelperText variant="success">
  Perfect! That looks good.
</FormHelperText>
```

### Warning Message
```tsx
<FormHelperText variant="warning">
  This field is almost full.
</FormHelperText>
```

---

## MIGRATION PLAN

**Status:** TextField ✅ Updated (Template)

**Remaining Fields to Update (34):**

### Foundation Fields (16)
- [ ] TextareaField
- [ ] NumberField
- [ ] SelectField (already uses Combobox, needs label/error update)
- [ ] MultiSelectField
- [ ] TagInputField
- [ ] ChipsField
- [ ] ToggleField
- [ ] DateField
- [ ] TimeField
- [ ] DateTimeField
- [ ] SliderField
- [ ] RatingField
- [ ] SignatureField
- [ ] FileField
- [ ] ColorField
- [ ] RangeField

### Composite Fields (16)
- [ ] EmailField
- [ ] PasswordField
- [ ] PhoneField
- [ ] SearchField
- [ ] RadioGroupField
- [ ] AddressField
- [ ] DateRangeField
- [ ] CurrencyField
- [ ] NPSField
- [ ] MatrixField
- [ ] OTPField
- [ ] RankField
- [ ] TableField
- [ ] CalculatedField
- [ ] RepeaterField

### Special (2)
- [ ] Wizard renderer (if applicable)
- [ ] Form screen templates

---

## ENFORCEMENT

### Code Review Checklist
1. All fields use typography components?
2. No raw HTML labels/errors?
3. Imports correct?
4. Required/optional handled by component?

### Automated Checks (Future)
- Lint rule: No `<label>` in field files
- Lint rule: No `className="text-red-600"` in field files
- Pre-commit hook validation

---

## EXAMPLE: Before/After

### BEFORE (TextField - Old Pattern)
```tsx
{label && (
  <label htmlFor={name} className="block text-sm font-medium text-gray-700">
    {label}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
)}
{description && (
  <p className="text-sm text-gray-500">{description}</p>
)}
// ... input ...
{errors?.[name]?.message && (
  <p className="text-sm text-red-600">
    {String(errors[name].message)}
  </p>
)}
```

### AFTER (TextField - New Pattern)
```tsx
{label && (
  <FormLabel htmlFor={name} required={required}>
    {label}
  </FormLabel>
)}
{description && (
  <FormHelperText>{description}</FormHelperText>
)}
// ... input ...
{errors?.[name]?.message && (
  <FormHelperText variant="error">
    {String(errors[name].message)}
  </FormHelperText>
)}
```

**Result:**
- 5 lines shorter
- Single source of truth
- Consistent styling
- Easy to enhance

---

## QUICK MIGRATION SCRIPT

For each field:

1. Add imports:
```tsx
import { FormLabel, FormHelperText } from '../components'
```

2. Replace label:
```tsx
// OLD
<label htmlFor={name} className="...">
  {label}
  {required && <span className="...">*</span>}
</label>

// NEW
<FormLabel htmlFor={name} required={required}>
  {label}
</FormLabel>
```

3. Replace description:
```tsx
// OLD
<p className="text-sm text-gray-500">{description}</p>

// NEW
<FormHelperText>{description}</FormHelperText>
```

4. Replace error:
```tsx
// OLD
<p className="text-sm text-red-600">
  {String(errors[name].message)}
</p>

// NEW
<FormHelperText variant="error">
  {String(errors[name].message)}
</FormHelperText>
```

---

## SUMMARY

✅ **TextField** updated as template  
✅ **Pattern** documented  
✅ **Benefits** clear  
✅ **Enforcement** ready  

**Next:** Migrate remaining 34 fields to this pattern

**This is MANDATORY going forward - no exceptions!** 🎯
