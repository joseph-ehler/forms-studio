# 🔘 Button System - Complete Variant Guide

**Created**: October 22, 2025  
**Purpose**: Systematic button variants for every use case

---

## 🎯 Button Hierarchy

### Primary → Secondary → Ghost → Link
**Visual weight decreases left to right**

**Note**: Ghost replaces Tertiary - more descriptive name for minimal buttons

---

## 📚 All Button Variants (7 Total)

### 1. Primary (Main CTA)
```tsx
<button className="ds-button">
  Submit Form
</button>
```

**When to use:**
- Main call-to-action on page
- Form submit buttons
- Primary action in modals
- **Only ONE per screen section**

**Design:**
- Solid blue background
- White text
- Medium shadow
- Prominent presence

---

### 2. Secondary (Alternative Action)
```tsx
<button className="ds-button ds-button--secondary">
  Cancel
</button>
```

**When to use:**
- Alternative to primary action
- Cancel buttons
- "Back" or "Previous" actions
- Multiple buttons of equal importance

**Design:**
- White background
- Gray text
- Gray border
- Lighter shadow

---

### 3. Ghost (Minimal)
```tsx
<button className="ds-button ds-button--ghost">
  Close
</button>
```

**When to use:**
- Ultra-minimal UI
- Close/dismiss buttons
- Icon-only buttons
- Toolbar actions

**Design:**
- Transparent background
- Gray text
- Transparent border
- Very subtle hover

---

### 5. Danger (Destructive)
```tsx
<button className="ds-button ds-button--danger">
  Delete Account
</button>
```

**When to use:**
- Destructive actions (delete, remove, cancel subscription)
- Cannot be undone
- Requires confirmation

**Design:**
- Solid red background
- White text
- Clear visual warning

---

### 5. Success (Confirmation)
```tsx
<button className="ds-button ds-button--success">
  Confirm Payment
</button>
```

**When to use:**
- Positive confirmations
- Approval actions
- "Accept" or "Approve"
- Success flows

**Design:**
- Solid green background
- White text
- Positive sentiment

---

### 6. Warning (Caution)
```tsx
<button className="ds-button ds-button--warning">
  Proceed Anyway
</button>
```

**When to use:**
- Actions requiring caution
- "Override" or "Force" actions
- Risky but not destructive

**Design:**
- Solid yellow background
- Dark text (for contrast)
- Attention-grabbing

---

### 7. Link (Text-Only)
```tsx
<button className="ds-button ds-button--link">
  Read documentation
</button>
```

**When to use:**
- Inline actions in text
- Navigation-like actions
- Very low visual weight needed

**Design:**
- Transparent background
- Blue text
- Underlined
- No padding/height constraints

---

## 🎨 Token Mapping

### Color Tokens Added

```typescript
COLOR_TOKENS.interactive = {
  // Primary
  primary: 'rgb(37, 99, 235)',
  primaryHover: 'rgb(29, 78, 216)',
  primaryActive: 'rgb(30, 64, 175)',
  
  // Secondary
  secondary: 'rgb(75, 85, 99)',
  secondaryHover: 'rgb(55, 65, 81)',
  secondaryActive: 'rgb(31, 41, 55)',
  secondaryBg: 'rgb(249, 250, 251)',
  
  // Danger
  danger: 'rgb(220, 38, 38)',
  dangerHover: 'rgb(185, 28, 28)',
  dangerActive: 'rgb(153, 27, 28)',
  dangerBg: 'rgb(254, 242, 242)',
  
  // Success
  success: 'rgb(22, 163, 74)',
  successHover: 'rgb(21, 128, 61)',
  successActive: 'rgb(22, 101, 52)',
  successBg: 'rgb(220, 252, 231)',
  
  // Warning
  warning: 'rgb(234, 179, 8)',
  warningHover: 'rgb(202, 138, 4)',
  warningActive: 'rgb(161, 98, 7)',
  warningBg: 'rgb(254, 249, 195)',
  
  // Link
  link: 'rgb(37, 99, 235)',
  linkHover: 'rgb(29, 78, 216)',
  linkActive: 'rgb(30, 64, 175)',
}
```

---

## 🔄 State System

### Every button has 5 states:

1. **Default** - Normal appearance
2. **Hover** - Mouse over
3. **Active** - Being clicked
4. **Focus** - Keyboard focus (accessibility)
5. **Disabled** - Cannot interact

### All states use tokens:
- **Hover**: `*Hover` token
- **Active**: `*Active` token
- **Focus**: `focus` + `focusRing` tokens
- **Disabled**: `bgDisabled` + `textDisabled` tokens

---

## 📋 Usage Examples

### Form Actions
```tsx
<div style={{ display: 'flex', gap: '12px' }}>
  <button type="submit" className="ds-button">
    Save Changes
  </button>
  <button type="button" className="ds-button ds-button--secondary">
    Cancel
  </button>
</div>
```

### Destructive Confirmation
```tsx
<div style={{ display: 'flex', gap: '12px' }}>
  <button className="ds-button ds-button--danger">
    Yes, Delete
  </button>
  <button className="ds-button ds-button--secondary">
    No, Keep It
  </button>
</div>
```

### Multiple Options
```tsx
<div style={{ display: 'flex', gap: '8px' }}>
  <button className="ds-button">Accept</button>
  <button className="ds-button ds-button--danger">Reject</button>
  <button className="ds-button ds-button--tertiary">Skip</button>
</div>
```

### Toolbar Actions
```tsx
<div style={{ display: 'flex', gap: '4px' }}>
  <button className="ds-button ds-button--ghost">Edit</button>
  <button className="ds-button ds-button--ghost">Share</button>
  <button className="ds-button ds-button--ghost">Delete</button>
</div>
```

---

## ⚠️ Common Mistakes

### ❌ Multiple Primaries
```tsx
// WRONG - Too many primary buttons
<button className="ds-button">Save</button>
<button className="ds-button">Submit</button>
<button className="ds-button">Send</button>
```

### ✅ One Primary, Rest Secondary/Tertiary
```tsx
// CORRECT - Clear hierarchy
<button className="ds-button">Submit</button>
<button className="ds-button ds-button--secondary">Save Draft</button>
<button className="ds-button ds-button--tertiary">Preview</button>
```

### ❌ Wrong Variant for Action
```tsx
// WRONG - Destructive action not using danger
<button className="ds-button">Delete Account</button>
```

### ✅ Semantic Variants
```tsx
// CORRECT - Danger for destructive
<button className="ds-button ds-button--danger">Delete Account</button>
```

---

## 🎯 Decision Tree

**Is this the main action?**
→ Use **Primary**

**Is this destructive?**
→ Use **Danger**

**Is this a positive confirmation?**
→ Use **Success**

**Is this a secondary option?**
→ Use **Secondary**

**Is this minimal/supplementary?**
→ Use **Ghost**

**Is this inline with text?**
→ Use **Link**

**Is this cautionary?**
→ Use **Warning**

---

## 📊 Visual Hierarchy

```
Primary     ████████████ (Highest visual weight)
Danger      ████████████
Success     ████████████
Warning     ████████████
Secondary   ████████░░░░
Ghost       ██░░░░░░░░░░
Link        █░░░░░░░░░░░ (Lowest visual weight)
```

---

## 🎨 Customization via Playground

All button variants respond to:
- **Primary Hue** slider (changes primary/link colors)
- **Shadow Intensity** slider
- **Transition Speed** slider

**Try it:**
1. Open playground (bottom-right)
2. Adjust Primary Hue to change all primary/link buttons
3. Adjust Shadow Intensity to make buttons flatter/more dimensional
4. Adjust Transition Speed to control hover animations

---

## 📝 Type Definitions

```typescript
type ButtonVariant = 
  | 'primary'     // Default, no modifier needed
  | 'secondary'   // ds-button--secondary
  | 'ghost'       // ds-button--ghost
  | 'danger'      // ds-button--danger
  | 'success'     // ds-button--success
  | 'warning'     // ds-button--warning
  | 'link'        // ds-button--link

// Usage:
<button className={`ds-button${variant !== 'primary' ? ` ds-button--${variant}` : ''}`}>
  {children}
</button>
```

---

## ✅ Accessibility

All button variants include:
- ✅ Minimum 44×44px touch target (mobile)
- ✅ Minimum 40×40px touch target (desktop)
- ✅ Focus-visible ring (keyboard navigation)
- ✅ Disabled state cursor
- ✅ WCAG AA color contrast
- ✅ Smooth transitions (reduce motion respected)

---

## 🎉 Result

**7 button variants** covering every use case:
- Semantic (danger, success, warning)
- Hierarchical (primary, secondary)
- Visual weight (ghost, link)
- All using design tokens
- All playground-controllable
- All accessible

**One system. Infinite applications.** 🎯
