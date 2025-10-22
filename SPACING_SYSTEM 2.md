# 📏 Spacing System - Consistent Gaps

**Created**: October 22, 2025  
**Purpose**: Eliminate spacing inconsistencies with design tokens

---

## 🎯 Problem

Looking at the form demo, spacing was inconsistent:
- Section headings had random gaps
- Field-to-field spacing varied
- Label-to-input gaps differed
- Empty states had different spacing

---

## ✅ Solution: Design Tokens + CSS Classes

### 1. Spacing Tokens (`tokens/spacing.ts`)

```typescript
SPACING_TOKENS = {
  form: {
    labelGap: '6px',      // Label → Input (tight)
    helperGap: '6px',     // Input → Helper (tight)
    fieldGap: '20px',     // Field → Field (clear)
    sectionGap: '16px',   // Section → Content
    sectionBreak: '32px', // Major sections
    groupGap: '24px',     // Field groups
  }
}
```

### 2. CSS Classes (`ds-spacing.css`)

```css
.ds-field {
  margin-bottom: 20px; /* Consistent field spacing */
}

.ds-section-heading {
  margin-top: 32px;    /* Section break */
  margin-bottom: 16px; /* Section gap */
}

.ds-field-group {
  margin-bottom: 24px; /* Group separation */
}
```

### 3. Typography Updates

Labels and helpers now use token-based spacing:
- `margin-bottom: 6px` on labels (tight to input)
- `margin-top: 6px` on helpers (tight to input)

---

## 📐 Spacing Scale

```
┌─────────────────────────────────┐
│ Section Heading                 │
│ 32px gap (sectionBreak)         │
├─────────────────────────────────┤
│                                 │
│ 16px gap (sectionGap)           │
├─────────────────────────────────┤
│ Field Label                     │
│ 6px gap (labelGap)              │
├─────────────────────────────────┤
│ [input field]                   │
├─────────────────────────────────┤
│ 6px gap (helperGap)             │
│ Helper text                     │
├─────────────────────────────────┤
│                                 │
│ 20px gap (fieldGap)             │
├─────────────────────────────────┤
│ Next Field Label                │
│ 6px gap                         │
├─────────────────────────────────┤
│ [input field]                   │
└─────────────────────────────────┘
```

---

## 🎨 Usage Examples

### Standard Field
```tsx
<div className="ds-field">
  <FormLabel htmlFor="email">Email</FormLabel>
  <input id="email" />
  <FormHelperText>We'll never share</FormHelperText>
</div>
```
**Result**: Label (6px) → Input (6px) → Helper (20px) → Next field

### Section Heading
```tsx
<h2 className="ds-section-heading">
  Personal Information
</h2>
<p className="ds-section-helper">
  This info is private
</p>
```
**Result**: 32px before section, 16px after heading, tight helper

### Field Group
```tsx
<div className="ds-field-group">
  <FormLabel>Address</FormLabel>
  {/* Multiple related inputs */}
</div>
```
**Result**: 24px spacing for the whole group

---

## 🔧 Implementation

### Files Created
1. `src/tokens/spacing.ts` - Spacing constants
2. `src/components/ds-spacing.css` - Spacing classes

### Files Modified
1. `ds-typography.css` - Updated label/helper margins
2. `tokens/index.ts` - Export spacing tokens
3. `demo/src/main.tsx` - Import spacing CSS

---

## 📊 Before vs After

### Before (Inconsistent)
```
Section           ← random gap
  Field 1         ← 12px
  Field 2         ← 18px
  Field 3         ← 16px
Next Section      ← 24px
```

### After (Consistent)
```
Section           ← 32px (sectionBreak)
  Field 1         ← 20px (fieldGap)
  Field 2         ← 20px (fieldGap)
  Field 3         ← 20px (fieldGap)
Next Section      ← 32px (sectionBreak)
```

---

## ✅ Benefits

### Single Source of Truth
- One token → all spacing consistent
- Change once → updates everywhere

### Semantic Naming
- `labelGap` (not "6px") → intention clear
- `sectionBreak` (not "32px") → purpose obvious

### Auto-Applied
- DS primitives use tokens automatically
- Fields don't need to think about spacing
- CSS classes handle layout

---

## 🚀 Next Steps (Optional)

### Now Available
- ✅ Spacing tokens defined
- ✅ CSS classes ready
- ✅ Typography using tokens

### Future Enhancements
1. Add more spacing classes as needed
2. Create spacing utilities (CSS variables)
3. Add responsive spacing (mobile vs desktop)
4. Extract to design system package

---

**Spacing is now systematic and consistent!** 📏
