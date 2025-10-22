# 🎯 Field JSON Compatibility Migration Guide

**Date:** Oct 21, 2025 8:15am  
**Status:** 🚧 IN PROGRESS (1/34 fields complete)  
**Goal:** Make all form fields fully JSON-compatible with systematic pattern  

---

## 🎯 THE GOAL

Make ALL form fields JSON-compatible using the same systematic pattern we used for design system components:

**Priority:** Props → JSON → Defaults → Component defaults

---

## 🛠️ THE PATTERN

### 1. Import Field JSON Utilities

```typescript
import { mergeFieldConfig, getAutoCompleteHint, getAutoCapitalize } from './utils/field-json-config'
```

### 2. Rename Props to `prop*` Format

```typescript
export const TextField: React.FC<FieldComponentProps> = ({
  name,
  label: propLabel,              // ← Rename to propLabel
  placeholder: propPlaceholder,  // ← Rename to propPlaceholder
  required: propRequired,        // ← Rename to propRequired
  disabled: propDisabled,        // ← Rename to propDisabled
  description: propDescription,  // ← Rename to propDescription
  control,
  errors,
  json,
  typographyDisplay,
  typographyVariant,
}) => {
```

### 3. Merge Props with JSON

```typescript
  // Merge props with JSON config (props take priority)
  const config = mergeFieldConfig(
    {
      label: propLabel,
      placeholder: propPlaceholder,
      required: propRequired,
      disabled: propDisabled,
      description: propDescription,
      typographyDisplay,
      typographyVariant,
    },
    json,
    {} // Defaults (optional)
  )
```

### 4. Extract Resolved Values

```typescript
  // Extract resolved values (with fallbacks)
  const label = config.label
  const placeholder = config.placeholder
  const required = config.required ?? false
  const disabled = config.disabled ?? false
  const description = config.description
  
  // Field-specific attributes from config (use 'as any' for extended props)
  const type = (config as any).inputType ?? 'text'
  const maxLength = (config as any).validation?.maxLength
  const inputMode = (config as any).inputMode ?? 'text'
  const autoComplete = (config as any).autoComplete ?? getAutoCompleteHint(name, type)
  // ... etc.
```

### 5. Remove Duplicate Helper Functions

If the field has local helper functions like `getAutoCompleteHint` or `getAutoCapitalize`, remove them (now in field-json-config.ts).

---

## 📋 FIELD JSON CONFIG INTERFACE

The `FieldConfig` interface supports these properties:

```typescript
interface FieldConfig {
  // Basic props
  label?: string
  placeholder?: string
  description?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  
  // Input attributes
  inputType?: string       // email, tel, url, etc.
  inputMode?: string       // text, numeric, decimal, tel, search, email, url
  autoComplete?: string
  autoCapitalize?: string
  autoCorrect?: string
  spellCheck?: boolean
  enterKeyHint?: string    // enter, done, go, next, previous, search, send
  
  // Validation
  validation?: {
    maxLength?: number
    minLength?: number
    max?: number
    min?: number
    pattern?: string
    custom?: (value: any) => boolean | string
  }
  
  // Field-specific options
  options?: any[]          // For select, radio, checkbox, etc.
  multiple?: boolean
  searchable?: boolean
  clearable?: boolean
  
  // Appearance
  variant?: string
  size?: string
  
  // Typography
  typographyDisplay?: any
  typographyVariant?: string
}
```

---

## ✅ COMPLETE EXAMPLE: TextField

**Before (Direct JSON Access):**

```typescript
export const TextField: React.FC<FieldComponentProps> = ({
  name,
  label,
  placeholder,
  required,
  disabled,
  // ... other props
  json,
}) => {
  // Direct JSON access (inconsistent)
  const type = json?.inputType ?? 'text'
  const maxLength = json?.validation?.maxLength
  // ...
```

**After (Systematic JSON Pattern):**

```typescript
import { mergeFieldConfig, getAutoCompleteHint, getAutoCapitalize } from './utils/field-json-config'

export const TextField: React.FC<FieldComponentProps> = ({
  name,
  label: propLabel,           // ← Renamed
  placeholder: propPlaceholder,
  required: propRequired,
  disabled: propDisabled,
  description: propDescription,
  control,
  errors,
  json,
  typographyDisplay,
  typographyVariant,
}) => {
  // Merge props with JSON (systematic)
  const config = mergeFieldConfig(
    {
      label: propLabel,
      placeholder: propPlaceholder,
      required: propRequired,
      disabled: propDisabled,
      description: propDescription,
      typographyDisplay,
      typographyVariant,
    },
    json,
    {}
  )
  
  // Extract resolved values
  const label = config.label
  const placeholder = config.placeholder
  const required = config.required ?? false
  const disabled = config.disabled ?? false
  const description = config.description
  
  // Extract typography (unchanged)
  const jsonTypography = getTypographyFromJSON(json)
  const typography = resolveTypographyDisplay(
    config.typographyDisplay || jsonTypography.display,
    config.typographyVariant || jsonTypography.variant
  )
  
  // Input attributes (from merged config)
  const type = (config as any).inputType ?? 'text'
  const maxLength = (config as any).validation?.maxLength
  const inputMode = (config as any).inputMode ?? 'text'
  const autoComplete = (config as any).autoComplete ?? getAutoCompleteHint(name, type)
  const enterKeyHint = (config as any).enterKeyHint ?? 'next'
  const autoCapitalize = (config as any).autoCapitalize ?? getAutoCapitalize(type)
  const autoCorrect = (config as any).autoCorrect ?? (type === 'text' ? 'on' : 'off')
  const spellCheck = (config as any).spellCheck ?? (type === 'text')
  
  // ... rest of component
}
```

---

## 💎 BENEFITS

### Consistency
✅ Same pattern as design system components  
✅ Predictable behavior across all fields  
✅ Easy to understand and maintain  

### Flexibility
✅ Props OR JSON OR both  
✅ Props always override JSON  
✅ Fine-grained control  

### Type Safety
✅ Full TypeScript support  
✅ Autocomplete in IDEs  
✅ Compile-time checks  

### JSON-Driven Forms
✅ Build complete forms from JSON  
✅ CMS integration  
✅ Dynamic form generation  

---

## 📊 MIGRATION PROGRESS

### ✅ Complete (1/34)
1. ✅ TextField

### 🔄 In Progress (0/34)
_(None currently)_

### ⏳ Remaining (33/34)

**Foundation Fields (11):**
- TextareaField
- NumberField
- ChipsField
- ToggleField
- SliderField
- DateField
- TimeField
- DateTimeField
- RatingField
- ColorField
- RangeField

**Composite Fields (18):**
- composite/EmailField
- composite/PasswordField
- composite/SearchField
- composite/RadioGroupField
- composite/PhoneField
- composite/AddressField
- composite/CurrencyField
- composite/NPSField
- composite/OTPField
- composite/RankField
- composite/DateRangeField
- composite/MatrixField
- composite/TableField
- composite/CheckboxGroupField
- composite/LocationField
- composite/SignatureField  
- composite/FileUploadField
- composite/MultiStepField

**Special Fields (4):**
- SelectField
- MultiSelectField
- FileField
- SignatureField
- TagInputField
- RepeaterField
- CalculatedField

---

## 🚀 MIGRATION CHECKLIST

For each field:

1. ✅ Import `mergeFieldConfig` and helper functions
2. ✅ Rename props to `prop*` format
3. ✅ Add `mergeFieldConfig()` call
4. ✅ Extract resolved values
5. ✅ Update field-specific attributes to use `(config as any).prop`
6. ✅ Remove duplicate helper functions
7. ✅ Test field works with:
   - Props only
   - JSON only
   - Props + JSON (props win)
8. ✅ Build passes
9. ✅ Update documentation

---

## 🎯 USAGE EXAMPLES

### Example 1: TextField with JSON

```tsx
// Props only
<TextField
  name="email"
  label="Email Address"
  placeholder="you@example.com"
  required
/>

// JSON only
<TextField
  name="email"
  control={control}
  errors={errors}
  json={{
    label: "Email Address",
    placeholder: "you@example.com",
    required: true,
    inputType: "email",
    inputMode: "email",
    autoComplete: "email"
  }}
/>

// Props override JSON
<TextField
  name="email"
  label="Work Email"  // ← Takes priority
  json={{
    label: "Email Address",
    inputType: "email",
    autoComplete: "email"
  }}
/>
```

### Example 2: SelectField with Options

```tsx
<SelectField
  name="country"
  json={{
    label: "Country",
    required: true,
    searchable: true,
    options: [
      { label: "United States", value: "us" },
      { label: "Canada", value: "ca" },
      { label: "Mexico", value: "mx" }
    ]
  }}
/>
```

### Example 3: Complete Form from JSON

```json
{
  "fields": [
    {
      "type": "text",
      "name": "firstName",
      "label": "First Name",
      "required": true,
      "autoComplete": "given-name",
      "autoCapitalize": "words"
    },
    {
      "type": "text",
      "name": "lastName",
      "label": "Last Name",
      "required": true,
      "autoComplete": "family-name"
    },
    {
      "type": "text",
      "name": "email",
      "label": "Email",
      "required": true,
      "inputType": "email",
      "inputMode": "email",
      "autoComplete": "email",
      "validation": {
        "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
      }
    },
    {
      "type": "select",
      "name": "country",
      "label": "Country",
      "required": true,
      "searchable": true,
      "options": [...]
    }
  ]
}
```

---

## 🛠️ HELPER FUNCTIONS

### getAutoCompleteHint(name, type)

Intelligently determines autocomplete attribute based on field name and type:

```typescript
getAutoCompleteHint('email', 'email')      // → 'email'
getAutoCompleteHint('firstName', 'text')   // → 'given-name'
getAutoCompleteHint('phone', 'tel')        // → 'tel'
getAutoCompleteHint('zipCode', 'text')     // → 'postal-code'
```

### getAutoCapitalize(type)

Sets appropriate auto-capitalize based on input type:

```typescript
getAutoCapitalize('email')  // → 'off'
getAutoCapitalize('url')    // → 'off'
getAutoCapitalize('text')   // → 'sentences'
```

---

## 📈 NEXT STEPS

1. **Continue Migration** - Migrate remaining 33 fields using the pattern
2. **Batch Testing** - Test groups of fields together
3. **Documentation** - Update main docs with JSON examples
4. **Demo Update** - Show JSON-driven forms in demo app

---

## 💡 TIPS & BEST PRACTICES

### Use Type Casting for Extended Props

Since TypeScript doesn't know about JSON-specific props, use `as any`:

```typescript
const type = (config as any).inputType ?? 'text'
const options = (config as any).options ?? []
```

### Provide Sensible Defaults

Always provide fallbacks for critical properties:

```typescript
const required = config.required ?? false
const disabled = config.disabled ?? false
const multiple = (config as any).multiple ?? false
```

### Preserve Typography Integration

Keep the existing typography system intact:

```typescript
const jsonTypography = getTypographyFromJSON(json)
const typography = resolveTypographyDisplay(
  config.typographyDisplay || jsonTypography.display,
  config.typographyVariant || jsonTypography.variant
)
```

### Test Priority System

Always verify that props override JSON:

```tsx
// Props should win
<TextField
  label="Override"  // ← Should be displayed
  json={{ label: "JSON Label" }}
/>
```

---

## 🎉 SUCCESS CRITERIA

Migration is complete when:

✅ All 34 fields use `mergeFieldConfig()`  
✅ Props → JSON → Defaults priority works  
✅ Build passes with no errors  
✅ All fields tested with props, JSON, and mixed  
✅ Documentation updated  
✅ Demo shows JSON-driven examples  

---

**Status:** 🚧 1/34 Fields Complete (3%)  
**Next:** Continue with TextareaField, NumberField, etc.
