# Nested Sheets Demo ✅ COMPLETE

**Date**: Oct 24, 2025  
**Demo**: `/packages/ds/demos/nested-sheets-demo.html`  
**Status**: Interactive demo ready

---

## 🎯 What Was Built

A **fully interactive demo** showcasing the nested sheets policy with:
- Card stack visual effects
- Depth limit enforcement (max 2)
- Real-time depth indicator
- Policy matrix visualization
- Complete interaction testing

---

## 🎮 Demo Features

### **Interactive Scenarios**

**Level 1 (Allowed)**:
- Click "Open Task List" → First dialog opens
- Main content becomes inert + darkened
- Backdrop at 45% opacity

**Level 2 (Allowed - Nested)**:
- Click any task in Level 1 → Subtask dialog opens
- Level 1 dialog:
  - Translates down 6px
  - Scales to 0.98
  - Becomes inert
- Backdrop darkens to 55% opacity
- Shadow elevation increases

**Level 3 (Blocked)**:
- Click "Try Level 3" → Console error
- Alert explains depth limit
- Dialog doesn't open

### **Card Stack Effects** (Visible)

When Level 2 opens over Level 1:
```css
/* Level 1 dialog gets "underlay" treatment */
transform: translateY(6px) scale(0.98);
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);

/* Backdrop darkens */
background: rgba(0, 0, 0, 0.55); /* was 0.45 */

/* Level 2 has higher z-index */
z-index: 20; /* Level 1 is 10 */
```

**Visual Result**: Beautiful "solitaire stack" effect

---

## 📊 UI Components

### **Phone Mockup**
- 400x720 screen with notch
- Gradient background
- Two dialogs stack inside

### **Controls Panel**

**Depth Indicator**:
- Large number showing current depth (0, 1, or 2)
- Max depth reminder

**Policy Matrix** (4 cards):
- ✅ Dialog → Dialog (allowed)
- ✅ Panel → Dialog (allowed)
- ❌ Dialog → Panel (blocked)
- ❌ Depth > 2 (blocked)

**Info Boxes**:
- Card stack effects explained
- Interaction guide
- A11y features
- Testing checklist

---

## 🧪 What You Can Test

### **Visual Treatment**
1. Open Level 1 → Backdrop appears, content darkens
2. Open Level 2 → Level 1 shifts down & scales, backdrop darkens more
3. Close Level 2 → Level 1 animates back to normal
4. Observe smooth 180ms transitions

### **Gestures**
1. Click X on Level 2 → Closes, Level 1 remains
2. Click X on Level 1 → Closes, main content interactive again
3. Press Esc twice → Closes both in order

### **Policy Enforcement**
1. Try Level 3 button → Console error + alert
2. Depth stays at 2, doesn't increment
3. Error message explains alternative (full-screen route)

### **A11y**
1. Tab key → Cycles only in topmost dialog
2. Esc key → Closes topmost, focus returns
3. Underlying dialog has `aria-hidden` + `inert` classes

---

## 📐 Layout Structure

```
Phone Screen (relative container)
├── Main Content
├── Backdrop Level 0 (z-index: 9)
├── Dialog Level 0 (z-index: 10)
│   └── Task List
├── Backdrop Level 1 (z-index: 19)
└── Dialog Level 1 (z-index: 20)
    └── Subtasks
```

---

## 🎨 Visual Tokens Used

```css
/* Stack transform */
--ds-sheet-stack-translate: 6px;
--ds-sheet-underlay-scale: 0.98;

/* Backdrop by depth */
--ds-backdrop-depth-0: rgba(0, 0, 0, 0.45);
--ds-backdrop-depth-1: rgba(0, 0, 0, 0.55);

/* Shadow by depth */
--ds-shadow-depth-0: 0 4px 16px rgba(0, 0, 0, 0.15);
--ds-shadow-depth-1: 0 8px 24px rgba(0, 0, 0, 0.2);

/* Z-index by depth */
Level 0: dialog=10, backdrop=9
Level 1: dialog=20, backdrop=19
```

---

## 💡 Key Interactions

### **Opening Nested Dialog**
```javascript
// Apply underlay to Level 1
dialog1.classList.add('ds-sheet--underlay');
dialog1.classList.add('ds-inert');

// Open Level 2
dialog2.classList.add('ds-visible');
backdrop2.classList.add('ds-visible');

depth = 2;
```

### **Closing Nested Dialog**
```javascript
// Close Level 2
dialog2.classList.remove('ds-visible');
backdrop2.classList.remove('ds-visible');

// Remove underlay from Level 1 (after transition)
setTimeout(() => {
  dialog1.classList.remove('ds-sheet--underlay');
  dialog1.classList.remove('ds-inert');
}, 180);

depth = 1;
```

### **Blocking Depth 3**
```javascript
if (depth >= 2) {
  console.error('[SheetPolicy] Maximum stack depth (2) exceeded.');
  alert('❌ Cannot open Level 3\n\nUse a full-screen route for deeper flows.');
  return; // Prevent opening
}
```

---

## 🧭 Policy Demonstrated

### **✅ Allowed Patterns**

**Dialog → Dialog** (Depth 1 → 2):
- Task list → Subtasks
- Modal over modal
- Card stack effect
- Topmost is interactive

### **❌ Blocked Patterns**

**Depth > 2**:
- Attempting Level 3 shows error
- Console logs policy violation
- Alert explains alternative
- Depth counter stops at 2

---

## 📚 Learning Outcomes

**Users can see**:
1. How card stack feels (not chaotic)
2. Visual hierarchy through transform + shadow
3. Backdrop darkening reinforces depth
4. Esc key natural flow (close topmost first)
5. Policy enforcement in action

**Developers can learn**:
1. CSS classes for nested sheets
2. Z-index management by depth
3. Transform + scale for underlay effect
4. Inert state on underlying dialogs
5. Console error patterns for policy

---

## 🎯 Success Metrics

**Demo Quality**:
- ✅ Interactive (not just screenshots)
- ✅ Policy matrix visual
- ✅ Real-time depth indicator
- ✅ Error handling demonstrated
- ✅ All effects visible

**Educational Value**:
- ✅ Clear "what works / what doesn't"
- ✅ Shows card stack effect
- ✅ Explains depth limits
- ✅ Guides through testing
- ✅ Links to policy docs

---

## 📁 Related Files

- `/packages/ds/demos/nested-sheets-demo.html` - This demo
- `/docs/ds/patterns/NESTED_SHEETS_POLICY.md` - Complete policy
- `/packages/ds/src/styles/ds-sheets.css` - Nested styles
- `/packages/ds/src/hooks/useStackPolicy.ts` - Enforcement hooks
- `/packages/ds/tests/nested-sheets.spec.ts` - Playwright tests

---

## 🚀 Next Steps

**To use in production**:
1. Import `ds-sheets.css`
2. Use `useStackPolicy()` hook
3. Apply `data-sheet-depth` attributes
4. Follow policy matrix
5. Test with Playwright suite

**To extend demo**:
1. Add Panel → Dialog scenario
2. Show parallax on drag (advanced)
3. Add reduced motion toggle
4. Show focus trap behavior
5. Add gesture simulation

---

**Demo is complete and ready to showcase nested sheet patterns!** 🎉
