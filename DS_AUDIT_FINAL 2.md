# 🔍 COMPREHENSIVE DS AUDIT - ALL VIOLATIONS

**Date**: Oct 22, 2025  
**Total Violations Found**: 100

---

## 🚨 **CRITICAL ISSUES** (Must fix immediately)

### **1. Calendar Dark Mode - HARDCODED** ❌
**File**: `ds-calendar.css`  
**Lines**: 251-260  

**Problem**:
```css
@media (prefers-color-scheme: dark) {
  .ds-calendar {
    --cal-border: #374151;        /* ❌ Hardcoded */
    --cal-text: #f9fafb;          /* ❌ Hardcoded */
    --cal-bg-selected: #3b82f6;   /* ❌ Hardcoded blue */
  }
}
```

**Should be**:
```css
/* DELETE the @media query - tokens handle dark mode automatically! */
```

**Impact**: Calendar breaks in dark mode, doesn't use semantic tokens.

---

### **2. Button State Colors - WRONG APPROACH** ❌
**File**: `ds-inputs.css`  
**Lines**: 214-245  

**Problem**:
```css
.ds-button--danger:hover {
  filter: brightness(0.9);  /* ❌ Will lighten primary color, not danger! */
}

.ds-button--success:hover {
  filter: brightness(0.9);  /* ❌ Same issue */
}

.ds-button--warning:hover {
  filter: brightness(0.9);  /* ❌ Same issue */
}
```

**Should be**:
```css
.ds-button--danger:hover {
  background-color: var(--ds-color-state-danger-hover);
}

.ds-button--success:hover {
  background-color: var(--ds-color-state-success-hover);
}
```

**Impact**: Hover states inherit primary color instead of state-specific colors.

---

### **3. PasswordField - COMPLETELY BROKEN** ❌
**File**: `PasswordField.tsx`  
**Violations**: 4

**Problems**:
```tsx
// Line 104
className="border border-gray-300 disabled:bg-gray-50 disabled:text-gray-500"

// Lines 120, 134
className="h-5 w-5 text-gray-400"

// Line 170
: 'bg-gray-200'  // Strength indicator empty state
```

**Impact**: Password field not dark mode compatible.

---

## ⚠️ **HIGH PRIORITY** (Fix soon)

### **4. TimeField** - 21 violations
- AM/PM toggle buttons: hardcoded `bg-blue-600`, `bg-white`, `text-gray-700`
- Time format toggle: `bg-gray-100`, `hover:bg-gray-200`
- Icon colors: `text-gray-400`

### **5. MultiSelectField** - 16 violations
- Chip backgrounds: `bg-blue-100`, `text-blue-800`
- Selected count: `text-gray-600`
- Placeholder: `text-gray-400`

### **6. TableField** - 15 violations
- Table headers: `bg-gray-50`
- Empty state: `text-gray-500`
- Hover rows: `hover:bg-gray-50`
- Footer: `bg-gray-50`, `text-gray-700`

### **7. MatrixField** - 12 violations
- Headers: `bg-gray-50`
- Text colors: `text-gray-500`, `text-gray-700`

### **8. ColorField** - 14 violations
- Tab states: `bg-white text-blue-600`, `text-gray-600`
- Label colors: `text-gray-700`

---

## 📊 **VIOLATION BREAKDOWN**

### **By File** (Top 10):
1. TimeField.tsx - 21 violations
2. MultiSelectField.tsx - 16 violations
3. TableField.tsx - 15 violations
4. ColorField.tsx - 14 violations
5. MatrixField.tsx - 12 violations
6. PasswordField.tsx - 4 violations
7. TagInputField.tsx - 3 violations
8. RankField.tsx - 3 violations
9. SliderField.tsx - 2 violations
10. RatingField.tsx - 2 violations

### **By Color Type**:
- `text-gray-*`: 42 violations
- `bg-gray-*`: 31 violations
- `border-gray-*`: 12 violations
- `text-blue-*`: 8 violations
- `bg-blue-*`: 4 violations
- `bg-white`: 3 violations

---

## 🔧 **FIX STRATEGY**

### **Phase 1: Critical (Now)**
1. ✅ Remove calendar dark mode @media query
2. ✅ Fix button state hover colors
3. ✅ Fix PasswordField completely
4. ✅ Fix TimeField AM/PM toggles

### **Phase 2: High Priority (Next)**
5. Fix MultiSelectField chips
6. Fix TableField headers
7. Fix MatrixField headers
8. Fix ColorField tabs

### **Phase 3: Cleanup (Final)**
9. Fix remaining field icons
10. Fix empty states
11. Verify all components in dark mode

---

## 📝 **MISSING TOKENS**

Need to add these tokens:

```css
/* State hover variants */
--ds-color-state-danger-hover: [value];
--ds-color-state-success-hover: [value];
--ds-color-state-warning-hover: [value];

/* State active variants */
--ds-color-state-danger-active: [value];
--ds-color-state-success-active: [value];
--ds-color-state-warning-active: [value];
```

---

## ✅ **ALREADY FIXED**
- ✅ Typography system (Heading, Text, Label, HelperText)
- ✅ Calendar base tokens (light mode)
- ✅ Overlay surfaces (OverlayPicker, PickerFooter)
- ✅ Form labels
- ✅ Most simple fields (TextField, NumberField, etc.)

---

## 🎯 **TARGET**

**Current**: 100 violations  
**Goal**: 0 violations  
**Status**: 🔴 NOT READY

Once fixed:
- ✅ 100% light/dark compatible
- ✅ Zero hardcoded colors
- ✅ All state colors use semantic tokens
- ✅ Calendar works in any theme
- ✅ Buttons use proper state hover colors

---

**Ready to fix all 100 violations?** Let's go! 🚀
