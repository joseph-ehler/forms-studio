# Nested Sheets: Context Peek Enhancement

**Date**: Oct 24, 2025  
**Enhancement**: Show ~1rem of underlying sheet for depth awareness  
**Token Updated**: `--ds-sheet-stack-translate: 16px` (was 6px)

---

## 🎯 Problem

**Original behavior** (6px translate):
- Underlying sheet barely visible when nested sheet opens
- Hard to maintain context of stack depth
- User might forget they're in a nested dialog

**UX Issue**: "I lose context of how deep I am"

---

## ✅ Solution: Context Peek

**New behavior** (16px translate):
- Underlying sheet's top edge (~1rem) remains visible
- Clear visual indicator of stack depth
- Always know you're in a nested context
- Maintains spatial awareness

---

## 🎨 Visual Change

### **Before** (6px)
```css
--ds-sheet-stack-translate: 6px;
/* Barely visible peek */
```

**Result**: Underlying sheet mostly hidden

### **After** (16px)
```css
--ds-sheet-stack-translate: 16px; /* ~1rem context peek */
/* Meaningful peek maintains context */
```

**Result**: Clear edge of underlying sheet visible

---

## 💡 Why This Matters

### **Spatial Awareness**
- User always sees: "I'm in a nested dialog"
- Top edge acts as breadcrumb
- Reinforces "I can go back"

### **Depth Indicator**
- Visual cue without UI chrome
- No need for "Level 2 of 2" text
- Intuitive stack visualization

### **Reduced Cognitive Load**
- Don't need to remember depth
- Can see it at all times
- Natural "card stack" metaphor

---

## 📊 Token Change

```css
:root {
  /* OLD: Too subtle */
  --ds-sheet-stack-translate: 6px;
  
  /* NEW: Context peek */
  --ds-sheet-stack-translate: 16px; /* ~1rem for depth awareness */
}
```

---

## 🎮 Visual Effect

**When Level 2 opens over Level 1**:

```
┌─────────────────────────────┐
│ ← Level 1 Header (visible) │ ← 16px peek
├─────────────────────────────┤
│                             │
│     Level 2 Dialog          │
│     (Topmost, Interactive)  │
│                             │
│                             │
└─────────────────────────────┘
```

**User sees**:
- Top edge of Level 1 (context)
- Full Level 2 (current task)
- Darkened backdrop between them

---

## 🧪 Testing

**Open nested-sheets-demo.html**:

1. Click "Open Task List" (Level 1)
2. Click any task (Level 2 opens)
3. **Observe**: ~1rem of Level 1 header visible at top
4. **Result**: Clear indication you're nested

**Compare**:
- **6px**: "Where am I?"
- **16px**: "I'm in a subtask, can see parent"

---

## ♿ Accessibility

**Visual indicator** complements:
- ARIA breadcrumbs
- Screen reader announcements
- Focus trap on topmost

**Benefits**:
- Low-vision users see clear depth
- No reliance on color alone
- Physical space = mental model

---

## 🎯 Design Principle

**"Show, Don't Tell"**

Instead of:
- ❌ Text: "You are viewing: Task > Subtask"
- ❌ Breadcrumb: "Task / Subtask"
- ❌ Counter: "Level 2 of 2"

Use:
- ✅ **Visual peek**: See underlying sheet edge
- ✅ **Spatial**: Physical stacking metaphor
- ✅ **Intuitive**: Card deck pattern

---

## 📈 Impact

### **Before**
- Context loss common
- "Where am I?" questions
- Need explicit depth indicators

### **After**
- Always maintain context
- Spatial awareness automatic
- No UI chrome needed

---

## 🔧 Files Updated

**CSS Token**:
- `/packages/ds/src/styles/ds-sheets.css`
  - `--ds-sheet-stack-translate: 16px`

**Demo**:
- `/packages/ds/demos/nested-sheets-demo.html`
  - Transform updated to 16px
  - Info box explains context peek

**Documentation**:
- `/docs/ds/patterns/NESTED_SHEETS_POLICY.md`
  - Visual effects section updated
  - Token value updated
  - UX tells section enhanced

---

## 💬 User Feedback

> "I perhaps should still be able to see the sheet below - 1 rem spacing or such. So that I always maintain context of how deep I am. Just enough for context please?"

**Result**: Exactly 1rem (16px) peek implemented! ✨

---

## 🎉 Outcome

**Context peek** makes nested sheets feel:
- **Intentional** (not accidental)
- **Navigable** (can see where to go back)
- **Understandable** (depth is visible)
- **Delightful** (beautiful card stack)

**Maintains UX principle**: Always show users where they are in the system.

---

## 📚 Related

- Card stack patterns in iOS/macOS
- Material Design elevation
- Windows snap assist
- Safari tab groups

All use **spatial positioning** to communicate hierarchy without text.
