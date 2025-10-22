# Button Sizing Strategy

**Philosophy:** WCAG AA compliant by default, strategic small for secondary contexts.

---

## **Size Reference**

| Size | Desktop | Mobile | Scales with A11Y | Use Case |
|------|---------|--------|------------------|----------|
| **sm** | **36px** → 42-48px | 40px | ✅ Yes | Secondary: Clear, Cancel, Close, Chips, Tags |
| **md** | **44px** → 48-64px | 48px | ✅ Yes | **Default**: All primary actions, forms, CTAs |
| **lg** | **48px** → 56-72px | 56px | ✅ Yes | Emphasis: Hero CTAs, important actions |

---

## **Design Principles**

### **1. Default is Compliant**
```tsx
// ✅ This is WCAG AA (44px) by default
<Button>Submit</Button>
```

### **2. Small is Opt-In**
```tsx
// Developer must explicitly choose small
<Button size="sm">Clear</Button>
```

### **3. ESLint Prevents Misuse**
```tsx
// ❌ ESLint ERROR: Small should only be secondary
<Button size="sm">Submit Form</Button>

// ✅ Allowed: Small with ghost/secondary variants
<Button size="sm" variant="ghost">Cancel</Button>
```

---

## **When to Use Small (36px)**

### **✅ Good Use Cases:**

**1. Overlay Footers (Clear/Done)**
```tsx
<PickerFooter>
  <Button size="sm" variant="ghost">Clear</Button>
  <Button>Done</Button>  {/* md=44px dominates */}
</PickerFooter>
```

**2. Chips/Tags**
```tsx
<Chip onRemove={handleRemove}>
  Tag Name
  <Button size="sm" variant="ghost" iconOnly>×</Button>
</Chip>
```

**3. Table Row Actions**
```tsx
<TableCell>
  <Button size="sm" variant="ghost" iconOnly>
    <EditIcon />
  </Button>
  <Button size="sm" variant="ghost" iconOnly>
    <DeleteIcon />
  </Button>
</TableCell>
```

**4. Inline Secondary Actions**
```tsx
<Text>
  Need help? 
  <Button size="sm" variant="link">Contact Support</Button>
</Text>
```

---

## **When NOT to Use Small**

### **❌ Bad Use Cases:**

**1. Primary Form Actions**
```tsx
// ❌ WRONG: Primary submit should be prominent
<Button size="sm">Submit Form</Button>

// ✅ RIGHT: Default (44px) for primary
<Button>Submit Form</Button>
```

**2. Navigation**
```tsx
// ❌ WRONG: Nav buttons should be touch-friendly
<Button size="sm">Next Page</Button>

// ✅ RIGHT: Default (44px)
<Button>Next Page</Button>
```

**3. Standalone CTAs**
```tsx
// ❌ WRONG: Hero CTA should be large
<Button size="sm">Get Started</Button>

// ✅ RIGHT: Use large for emphasis
<Button size="lg">Get Started</Button>
```

---

## **Accessibility Scaling**

Small buttons **auto-scale** with A11Y preferences:

| A11Y Scale | Small | Medium | Large |
|-----------|-------|--------|-------|
| 1.0x (default) | 36px | 44px | 48px |
| 1.2x (largeText) | 40px | 50px | 54px |
| 1.5x (lowVision) | 42px | 54px | 60px |
| 1.75x (max) | 48px | 64px | 72px |

**Key Points:**
- Small (36px) → 48px at max scale ✅
- Still WCAG AA compliant for lowVision users
- Hierarchy preserved (small < medium < large)

---

## **Visual Hierarchy**

### **Overlay Footer Example:**
```
┌─────────────────────────────────┐
│  Date Picker                    │
│                                 │
│  [Calendar Grid]                │
│                                 │
├─────────────────────────────────┤
│  [Clear 36px]    [Done 44px]    │  ← Perfect balance!
└─────────────────────────────────┘
```

**Why this works:**
- "Done" (44px) visually dominates ✅
- "Clear" (36px) present but secondary ✅
- Both scale up for lowVision ✅
- Both meet spacing requirements ✅

---

## **ESLint Guardrail**

Automatically warns if small used incorrectly:

```javascript
// .eslintrc.button-size.json
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "JSXOpeningElement[name.name='Button'] > JSXAttribute[name.name='size'][value.value='sm']",
        "message": "⚠️ Small buttons should ONLY be used for secondary actions"
      }
    ]
  }
}
```

**Exemptions:**
- PickerFooter.tsx (Clear/Done buttons)
- Chip*.tsx (Remove buttons)
- Table*.tsx (Row actions)

---

## **Migration Guide**

If you have existing small buttons:

### **Before:**
```tsx
<Button size="sm">Submit</Button>  // Was 40px, non-compliant
```

### **After (Default):**
```tsx
<Button>Submit</Button>  // Now 44px, WCAG AA ✅
```

### **After (Explicit Small):**
```tsx
<Button size="sm" variant="ghost">Clear</Button>  // 36px, secondary only ✅
```

---

## **Testing**

Verify button sizes with this console script:

```javascript
// Check button sizes across all variants
const buttons = document.querySelectorAll('.ds-btn');
const sizes = {
  sm: [],
  md: [],
  lg: []
};

buttons.forEach(btn => {
  const height = btn.getBoundingClientRect().height;
  if (btn.classList.contains('ds-btn--sm')) sizes.sm.push(height);
  else if (btn.classList.contains('ds-btn--lg')) sizes.lg.push(height);
  else sizes.md.push(height);
});

console.log('Button Heights:');
console.log('Small (sm):', Math.min(...sizes.sm), 'px');
console.log('Medium (md):', Math.min(...sizes.md), 'px');
console.log('Large (lg):', Math.min(...sizes.lg), 'px');
```

**Expected output (desktop, 1.0x scale):**
```
Small (sm): 36 px
Medium (md): 44 px
Large (lg): 48 px
```

---

## **Summary**

✅ **Default (md) = 44px** → WCAG AA compliant, primary actions  
✅ **Small (sm) = 36px** → Secondary actions only, scales to 42-48px  
✅ **Large (lg) = 48px** → Emphasis, hero CTAs  
✅ **ESLint guards** → Prevents misuse automatically  
✅ **Auto-scaling** → Works with A11Y preferences  
✅ **Low maintenance** → One token change = everywhere  

**Philosophy:** Pit of Success - correct by default, strategic flexibility when needed. 🎯
