# 🎛️ Typography JSON Control System

**Date:** Oct 20, 2025  
**Status:** ✅ Fully Configurable & Foolproof

---

## THE SOLUTION

A JSON-configurable typography system that gives you complete control over labels, descriptions, errors, and indicators - while remaining foolproof.

**Key Principles:**
1. ✅ **Everything visible by default** (safe)
2. ✅ **JSON-configurable per field** (flexible)
3. ✅ **Variant presets for common patterns** (easy)
4. ✅ **No double labels possible** (foolproof)
5. ✅ **Single source of truth** (maintainable)

---

## QUICK START

### Default Behavior (Show Everything)

```tsx
<TextField
  name="email"
  label="Email Address"
  description="We'll never share your email"
  required
  control={control}
  errors={errors}
  json={{}}
/>
```

**Result:**
```
Email Address *
We'll never share your email
[input]
Error message if invalid
```

---

### Hide Description

```tsx
<TextField
  name="email"
  label="Email Address"
  description="We'll never share your email"
  required
  control={control}
  errors={errors}
  json={{
    typographyDisplay: {
      showDescription: false
    }
  }}
/>
```

**Result:**
```
Email Address *
[input]
Error message if invalid
```

---

### Use Preset Variant

```tsx
<TextField
  name="email"
  label="Email Address"
  description="We'll never share your email"
  required
  control={control}
  errors={errors}
  json={{
    typographyVariant: 'minimal'
  }}
/>
```

**Result:**
```
Email Address
[input]
Error message if invalid
```

---

## TYPOGRAPHY VARIANTS

Pre-configured patterns for common use cases.

### `default` - Show Everything (Default)
- ✅ Label
- ✅ Description
- ✅ Error
- ✅ Required indicator (*)
- ❌ Optional indicator

**Use When:** Standard forms where users need full context

```json
{
  "typographyVariant": "default"
}
```

---

### `minimal` - Label + Errors Only
- ✅ Label
- ❌ Description
- ✅ Error
- ❌ Required indicator
- ❌ Optional indicator

**Use When:** Clean, focused forms where space is tight

```json
{
  "typographyVariant": "minimal"
}
```

---

### `compact` - Label Only
- ✅ Label
- ❌ Description
- ❌ Error
- ❌ Required indicator
- ❌ Optional indicator

**Use When:** Inline editing, data tables, compact UIs

```json
{
  "typographyVariant": "compact"
}
```

---

### `hidden` - Input Only
- ❌ Label
- ❌ Description
- ❌ Error
- ❌ Required indicator
- ❌ Optional indicator

**Use When:** Search bars, filters, decorative inputs with placeholder-only

```json
{
  "typographyVariant": "hidden"
}
```

---

### `error-only` - Errors Only
- ❌ Label
- ❌ Description
- ✅ Error
- ❌ Required indicator
- ❌ Optional indicator

**Use When:** Multi-step wizards where label is in a heading

```json
{
  "typographyVariant": "error-only"
}
```

---

## FINE-GRAINED CONTROL

Override individual elements:

```json
{
  "typographyDisplay": {
    "showLabel": true,
    "showDescription": false,
    "showError": true,
    "showRequired": true,
    "showOptional": false
  }
}
```

---

## PRIORITY SYSTEM

Settings are resolved in this order (highest to lowest):

1. **Props** - Component props (typographyDisplay, typographyVariant)
2. **JSON** - Field JSON (json.typographyDisplay, json.typographyVariant)
3. **Defaults** - Everything visible

**Example:**

```tsx
<TextField
  typographyVariant="minimal"  // Priority 1: Props
  json={{
    typographyVariant: "hidden"  // Priority 2: JSON
  }}
  // Defaults: "default" variant  // Priority 3: Defaults
/>
```

**Result:** Uses `minimal` (props win)

---

## REAL-WORLD EXAMPLES

### Example 1: Login Form (Minimal)

```json
{
  "fields": [
    {
      "type": "email",
      "name": "email",
      "label": "Email",
      "required": true,
      "typographyVariant": "minimal"
    },
    {
      "type": "password",
      "name": "password",
      "label": "Password",
      "required": true,
      "typographyVariant": "minimal"
    }
  ]
}
```

**Result:**
```
Email
[input]

Password
[input]

[Login Button]
```

---

### Example 2: Registration Form (Default)

```json
{
  "fields": [
    {
      "type": "text",
      "name": "firstName",
      "label": "First Name",
      "description": "As it appears on your ID",
      "required": true
    },
    {
      "type": "email",
      "name": "email",
      "label": "Email Address",
      "description": "We'll send a confirmation email",
      "required": true
    }
  ]
}
```

**Result:**
```
First Name *
As it appears on your ID
[input]

Email Address *
We'll send a confirmation email
[input]
```

---

### Example 3: Search Bar (Hidden)

```json
{
  "type": "search",
  "name": "query",
  "placeholder": "Search...",
  "typographyVariant": "hidden"
}
```

**Result:**
```
[input with placeholder "Search..."]
```

---

### Example 4: Multi-Step Wizard (Error-Only)

```tsx
// Step heading shows label
<h2>What's your email address?</h2>
<p>We'll use this to send you updates</p>

<TextField
  name="email"
  label="Email Address"  // Won't show (heading has it)
  description="..."      // Won't show (paragraph has it)
  json={{
    typographyVariant: 'error-only'
  }}
/>
```

**Result:**
```
What's your email address?
We'll use this to send you updates

[input]
Error message if invalid
```

---

### Example 5: Data Table Inline Edit (Compact)

```json
{
  "type": "text",
  "name": "quantity",
  "label": "Qty",
  "typographyDisplay": {
    "showLabel": true,
    "showDescription": false,
    "showError": false,
    "showRequired": false
  }
}
```

**Result (in table cell):**
```
Qty
[input]
```

---

## MIXING VARIANTS AND OVERRIDES

Start with a variant, override specific elements:

```json
{
  "typographyVariant": "minimal",
  "typographyDisplay": {
    "showRequired": true  // Add required indicator to minimal
  }
}
```

**Result:**
```
Email Address *
[input]
Error message if invalid
```

---

## TYPESCRIPT TYPES

```typescript
type TypographyDisplay = {
  showLabel?: boolean
  showDescription?: boolean
  showError?: boolean
  showRequired?: boolean
  showOptional?: boolean
}

type TypographyVariant = 
  | 'default'
  | 'minimal'
  | 'compact'
  | 'hidden'
  | 'error-only'

// In field JSON:
{
  typographyDisplay?: TypographyDisplay
  typographyVariant?: TypographyVariant
}
```

---

## WHY THIS IS FOOLPROOF

### 1. Safe Defaults
Everything visible by default means:
- ✅ Users always see labels (accessible)
- ✅ Errors always shown (usable)
- ✅ Required indicators visible (clear)
- ✅ No surprises

### 2. Explicit Overrides
To hide something, you must explicitly say so:
```json
{"showLabel": false}  // Intentional
```

### 3. Single Source of Truth
Typography components handle visibility internally:
- ❌ Can't have double labels
- ❌ Can't have inconsistent styling
- ✅ Change once, applies everywhere

### 4. Type Safety
TypeScript ensures valid configs:
- ✅ Only valid keys accepted
- ✅ Only valid variants accepted
- ✅ Autocomplete in IDE

### 5. No Breaking Changes
Existing fields without config continue working:
- ✅ Default to showing everything
- ✅ Backward compatible
- ✅ Progressive enhancement

---

## MIGRATION PATH

### Phase 1: Foundation (Done)
- ✅ Typography components created
- ✅ Display configuration types
- ✅ Resolution utility functions
- ✅ TextField template updated

### Phase 2: Field Migration (In Progress)
Update remaining 33 fields to use:
1. Import typography utilities
2. Resolve display settings
3. Conditional rendering

### Phase 3: Documentation
- ✅ This document
- [ ] JSON schema examples
- [ ] Storybook demos

---

## JSON SCHEMA

For JSON form builders:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Field",
  "type": "object",
  "properties": {
    "typographyVariant": {
      "type": "string",
      "enum": ["default", "minimal", "compact", "hidden", "error-only"],
      "default": "default",
      "description": "Pre-configured typography pattern"
    },
    "typographyDisplay": {
      "type": "object",
      "properties": {
        "showLabel": {"type": "boolean", "default": true},
        "showDescription": {"type": "boolean", "default": true},
        "showError": {"type": "boolean", "default": true},
        "showRequired": {"type": "boolean", "default": true},
        "showOptional": {"type": "boolean", "default": false}
      },
      "description": "Fine-grained typography visibility control"
    }
  }
}
```

---

## SUMMARY

✅ **5 preset variants** for common patterns  
✅ **Fine-grained control** for custom needs  
✅ **Safe defaults** (everything visible)  
✅ **JSON-configurable** per field  
✅ **TypeScript-safe** with full types  
✅ **Foolproof** - no double labels possible  
✅ **Single source of truth** for all fields  
✅ **Backward compatible** with existing code  

**Result:** Complete control over typography without sacrificing safety! 🎯
