# Design System Patterns

## Philosophy: Make Mistakes Impossible

When you see manual wiring, boilerplate, or "don't forget to..." patterns → **make it a design system primitive**.

---

## Pattern 1: Auto-Wiring via Context

**Problem**: Primitives need data that every consumer must manually pass.

**Bad (error-prone)**:
```tsx
// Every field must remember to pass contentRef
<OverlaySheet contentRef={contentRef} />
<OverlayPicker contentRef={contentRef} />
```

**Good (foolproof)**:
```tsx
// OverlayPickerCore provides via Context
<OverlayContext.Provider value={{ contentRef }}>
  {children}
</OverlayContext.Provider>

// Primitives auto-consume
const overlayContext = useOverlayContext()
const effectiveRef = contentRef || overlayContext?.contentRef || defaultRef
```

**Result**: Fields can't forget - it's automatic!

---

## Pattern 2: Single Source of Truth

**Problem**: Configuration duplicated across components.

**Bad**:
```tsx
// Magic numbers everywhere
<div style={{ zIndex: 1000 }} />
<div style={{ zIndex: 1001 }} />
```

**Good**:
```tsx
// Central token system
export const OVERLAY_TOKENS = {
  zIndex: {
    backdrop: 1000,
    sheet: 1001,
    overlay: 1002,
  }
}

// Type-safe accessor
export const getZIndex = (layer: 'backdrop' | 'sheet' | 'overlay') => 
  OVERLAY_TOKENS.zIndex[layer]
```

---

## Pattern 3: Fallback Chains

**Problem**: Need to support explicit control + automatic defaults.

**Solution**: Explicit prop > Context > Sensible default

```tsx
const effectiveValue = explicitProp || context?.value || defaultValue
```

**Benefits**:
- Backwards compatible (explicit props still work)
- Automatic for new code (Context provides)
- Always has a default (never undefined)

---

## Pattern 4: "Pit of Success" APIs

**Problem**: Easy to use the API wrong.

**Bad**:
```tsx
// Can forget onClose, silent failure
<Dialog open={true} />
```

**Good**:
```tsx
// TypeScript enforces correctness
interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void  // Required!
}
```

---

## When to Apply These Patterns

**Signals you need a pattern**:
- ❌ Copy-paste boilerplate across files
- ❌ Documentation says "Don't forget to..."
- ❌ Same bug appears in multiple places
- ❌ Code reviews with "Did you remember to...?"
- ❌ Onboarding docs have "Common Gotchas"

**Action**: Extract into design system primitive!

---

## Real Example: contentRef Auto-Wiring

**Before** (manual):
- Every field passes `contentRef` to OverlaySheet/OverlayPicker
- Easy to forget → outside-click detection breaks
- Same fix applied N times

**After** (automatic):
- OverlayPickerCore provides `contentRef` via Context
- OverlaySheet/OverlayPicker auto-consume
- New fields work correctly by default
- Impossible to forget

**Impact**:
- ✅ Zero boilerplate (36 fewer chars per field)
- ✅ Self-healing (all fields auto-fixed)
- ✅ Future-proof (new fields can't break)

---

## Motto

> **"Work smarter, not harder. Make the design system foolproof."**

When you see a pattern that requires discipline → make discipline unnecessary.
