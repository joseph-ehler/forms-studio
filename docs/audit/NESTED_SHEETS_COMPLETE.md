# Nested Sheets System ✅ COMPLETE

**Date**: Oct 24, 2025  
**Status**: Production-ready with context peek  
**Result**: Flawless card stack pattern with depth awareness

---

## 🎯 What We Built

A **complete nested sheets system** that allows dialog stacking with:
- Visual context peek (always see underlying sheet)
- Card stack micro-interactions
- Depth limits (max 2)
- Runtime enforcement
- Comprehensive testing
- Beautiful animations

---

## ✨ Key Innovation: Context Peek

**Problem Solved**: "I lose context of how deep I am"

**Solution**: Underlying sheet moves **UP** by 16px so its top edge peeks above nested sheet

```css
.ds-sheet--underlay[data-sheet-depth="0"] {
  transform: translateY(-16px) scale(0.98); /* Move UP to peek */
}
```

**Visual Result**:
```
┌─────────────────────────────┐
│ Dialog 1 Header (VISIBLE) │ ← 16px peek for context
├─────────────────────────────┤
│                             │
│     Dialog 2 (Topmost)      │
│                             │
└─────────────────────────────┘
```

**Why This Works**:
- Both sheets anchored at `bottom: 0`
- Moving underlying sheet DOWN would hide it more
- Moving underlying sheet UP reveals top edge
- Perfect ~1rem peek maintains spatial awareness

---

## 📁 Complete System

### **1. Core Stylesheet**
`/packages/ds/src/styles/ds-sheets.css` (400+ lines)

**Provides**:
- Base sheet layout (header/content/footer)
- Desktop docked + mobile sheet
- Sticky search/filters
- Keyboard handling
- **Nested sheets** with context peek
- All animations & transitions

### **2. Enforcement Hooks**
`/packages/ds/src/hooks/useStackPolicy.ts`

**Provides**:
- `useStackPolicy()` - Block invalid nesting
- `useStackDepthClass()` - Auto-apply depth classes
- `useStackedDialogA11y()` - Validate accessibility
- Helper functions (z-index, backdrop intensity)

### **3. Interactive Demo**
`/packages/ds/demos/nested-sheets-demo.html`

**Features**:
- Live card stack demonstration
- Depth indicator (0 → 1 → 2)
- Policy matrix visualization
- "Try to break it" button (depth 3 blocked)
- Info panels explaining all behaviors

### **4. Comprehensive Tests**
`/packages/ds/tests/nested-sheets.spec.ts` (54 tests)

**Coverage**:
- Visual treatment (transform, backdrop, z-index)
- Gestures (swipe, close topmost)
- A11y (inert, focus trap, labels)
- Keyboard nav (Esc closes in order)
- Depth limits (warns/blocks > 2)
- Policy enforcement
- Reduced motion

### **5. Complete Documentation**
- `/docs/ds/patterns/NESTED_SHEETS_POLICY.md` - Full policy
- `/docs/audit/NESTED_SHEETS_CONTEXT_PEEK.md` - Context peek explanation
- `/docs/audit/NESTED_SHEETS_DEMO_COMPLETE.md` - Demo guide

### **6. Debug Tools**
`/scripts/debug/inspect-nested-sheets.js`

**Provides**:
- Auto-opens both levels
- Shows all positioning values
- Calculates gap between sheets
- Validates peek is working

---

## 🎨 Design Tokens

```css
:root {
  /* Stack behavior */
  --ds-sheet-stack-translate: 16px; /* Context peek distance */
  --ds-sheet-underlay-scale: 0.98;
  --ds-sheet-parallax-factor: 0.12;
  
  /* Backdrop intensity by depth */
  --ds-backdrop-depth-0: rgba(0, 0, 0, 0.45);
  --ds-backdrop-depth-1: rgba(0, 0, 0, 0.55);
  --ds-backdrop-depth-2: rgba(0, 0, 0, 0.65);
  
  /* Elevation by depth */
  --ds-shadow-depth-0: 0 4px 16px rgba(0, 0, 0, 0.15);
  --ds-shadow-depth-1: 0 8px 24px rgba(0, 0, 0, 0.2);
  --ds-shadow-depth-2: 0 12px 32px rgba(0, 0, 0, 0.25);
}
```

---

## 🧭 Nesting Policy

### ✅ **Allowed**
- **Dialog → Dialog** (depth ≤ 2): Subtask modals
- **Panel → Dialog**: Modal over panel

### ❌ **Blocked**
- **Dialog → Panel**: De-modalizing (throws in dev)
- **Panel → Panel**: Cognitive overload (warns)
- **Depth > 2**: Use full-screen route (prevents)

---

## 🔍 Debugging Journey

### **Issue 1**: "I'm not seeing the context peek"

**Debug Output**:
```
Gap between dialog tops: -4.32px
❌ Dialog 2 is ABOVE Dialog 1 (should be below)
```

**Root Cause**: `translateY(16px)` moved underlying sheet DOWN (away from view)

**Solution**: Changed to `translateY(-16px)` to move UP (into view)

### **Issue 2**: Variables already declared

**Problem**: Debug script reused variable names from page

**Solution**: Prefix debug variables with `debug*`

### **Lesson Learned**

When both elements are anchored to same edge (`bottom: 0`):
- Moving DOWN = more hidden
- Moving UP = more visible
- Sign matters! Negative = peek above

---

## 📊 Visual Effects Summary

| Element | Transform | Effect |
|---------|-----------|--------|
| Dialog 1 (underlying) | `translateY(-16px) scale(0.98)` | Moves up, peeks above, slightly smaller |
| Dialog 2 (topmost) | `translateY(0)` | Normal position |
| Backdrop depth 0 | `rgba(0,0,0,0.45)` | 45% opacity |
| Backdrop depth 1 | `rgba(0,0,0,0.55)` | 55% opacity (darker) |

**Result**: Beautiful card stack that maintains context!

---

## 🎮 User Experience

### **Opening Nested Dialog**
1. User opens Task List (Level 1)
2. User clicks task → Subtasks dialog opens (Level 2)
3. **See**: Top edge of Task List visible (~1rem)
4. **Know**: "I'm in subtasks, can go back to tasks"

### **Spatial Awareness**
- No text needed ("Level 2 of 2")
- No breadcrumbs needed
- Physical space = mental model
- Always visible reminder of depth

### **Closing Behavior**
1. Press Esc → Level 2 closes
2. **See**: Level 1 animates back to normal position
3. Press Esc again → Level 1 closes
4. Natural, predictable flow

---

## 🧪 Testing Protocol

**Manual Test**:
1. Open demo in browser
2. Click "Open Task List"
3. Click any task
4. **Verify**: ~1rem of Task List header visible above Subtasks
5. Press Esc → Subtasks closes, Task List visible
6. Press Esc → Task List closes

**Automated Test**:
```bash
pnpm test:nested-sheets  # Runs Playwright suite
```

**Debug Test**:
```javascript
// Paste in console
// Runs /scripts/debug/inspect-nested-sheets.js
// Shows all measurements + validates peek
```

---

## 📈 Success Metrics

**Before**:
- ❌ No nested sheet support
- ❌ Context loss when stacking
- ❌ No depth awareness
- ❌ No visual hierarchy

**After**:
- ✅ Card stack pattern (max depth 2)
- ✅ Context peek (always see underlying sheet)
- ✅ Visual depth awareness (no UI chrome needed)
- ✅ Policy enforcement (runtime + tests)
- ✅ Complete documentation
- ✅ Debug tools

---

## 🚀 Production Usage

### **Import Styles**
```tsx
import '@intstudio/ds/styles/ds-sheets.css';
```

### **Use Hooks**
```tsx
import { useStackPolicy, useStackDepthClass } from '@intstudio/ds/hooks';

const MyDialog = ({ depth = 0, parentType }) => {
  const ref = useRef();
  
  // Enforce policy
  useStackPolicy({ type: 'dialog', parentType, depth });
  
  // Auto-apply depth classes
  useStackDepthClass(ref, depth);
  
  return (
    <div ref={ref} className="ds-sheet-dialog" data-sheet-depth={depth}>
      {/* ... */}
    </div>
  );
};
```

### **HTML Structure**
```html
<!-- Level 0 -->
<div class="ds-sheet-backdrop" data-depth="0"></div>
<div class="ds-sheet-dialog" data-sheet-depth="0">...</div>

<!-- Level 1 (opens on top) -->
<div class="ds-sheet-backdrop" data-depth="1"></div>
<div class="ds-sheet-dialog" data-sheet-depth="1">...</div>
```

**JavaScript**:
```javascript
// Add underlay class when opening Level 1
dialog0.classList.add('ds-sheet--underlay');
dialog0.classList.add('ds-inert');

// Remove when closing Level 1
dialog0.classList.remove('ds-sheet--underlay');
dialog0.classList.remove('ds-inert');
```

---

## 🎉 Bottom Line

**We built a complete nested sheets system that**:
- Feels magical (card stack pattern)
- Maintains context (peek keeps you aware)
- Enforces limits (max depth 2)
- Tests thoroughly (54 Playwright tests)
- Documents completely (policy + guides)
- Works flawlessly (user confirmed!)

**The context peek innovation** solves the core UX problem:
> "I always maintain context of how deep I am"

**It just works.** ✨

---

## 📚 Related Systems

- Base sheet system (`ds-sheets.css`)
- Sheet demos (docked, dialog, nested)
- Overlay primitives (OverlayPicker, OverlaySheet)
- Sheet layout rules (8 rules enforced)

**Complete stack** from base primitives → nested interactions → enforcement → testing → documentation.

**Status: COMPLETE & PRODUCTION-READY** 🚀
