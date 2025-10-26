# Sheet Backdrop Fix - Immediate Action Plan

## **Problem**: Double Backdrop on Desktop

**Current State**:
- Desktop renders Flowbite Modal (with default backdrop)
- PLUS our DSModalBackdrop component
- Result: TWO backdrops, visual inconsistency

**Impact**: Desktop and mobile look DIFFERENT (not cohesive)

---

## **Fix Option 1: Disable Flowbite's Backdrop** ⭐ **RECOMMENDED**

### **Code Change**:

```tsx
// In Sheet.tsx, desktop branch
<Modal
  show={open}
  onClose={handleDismiss}
  dismissible={false}  // ← Prevent Flowbite from rendering backdrop
  theme={{
    root: {
      base: 'fixed inset-0 z-[var(--z-sheet)] flex items-center justify-center',
      // Remove Flowbite's backdrop classes
    },
  }}
>
  <Modal.Header>{ariaLabel}</Modal.Header>
  <Modal.Body>...</Modal.Body>
  <Modal.Footer>...</Modal.Footer>
</Modal>

// Keep our DSModalBackdrop (already correct)
{backdrop !== 'none' && (
  <DSModalBackdrop
    variant={backdrop}
    onClick={...}
  />
)}
```

**Result**: Only ONE backdrop (ours), matches mobile ✅

---

## **Fix Option 2: Use Only Flowbite's Backdrop**

### **Code Change**:

```tsx
// Remove DSModalBackdrop completely

// Theme Flowbite's backdrop to match our styling
<Modal
  show={open}
  theme={{
    backdrop: {
      base: 'fixed inset-0 z-[var(--z-scrim)]',
      // Apply our opacity/blur
      on: backdrop === 'blur'
        ? 'bg-[rgba(0,0,0,0.2)] backdrop-blur-[var(--ue-blur,8px)]'
        : 'bg-[rgba(0,0,0,0.4)]',
    },
  }}
>
```

**Result**: Only Flowbite's backdrop, styled to match mobile ✅

---

## **Recommended**: **Option 1**

**Why**:
- We already have DSModalBackdrop working
- Easier to control opacity/blur
- Matches mobile Sheet exactly
- Less Flowbite dependency

---

## **Testing Checklist**:

After fix:
- [ ] Open Desktop story → Check backdrop opacity (should be 0.4 for dim)
- [ ] Open Mobile story → Check backdrop opacity (should be 0.4 for dim)
- [ ] Compare: Should look IDENTICAL
- [ ] Test blur variant: Should blur on both desktop/mobile
- [ ] Test none variant: No backdrop on either

---

## **Time Estimate**: 15 minutes

1. Update Modal props to disable Flowbite backdrop (5 min)
2. Test visual parity (5 min)
3. Update tests if needed (5 min)

---

**Status**: 🔴 **BLOCKING v1.0 SHIP**  
**Severity**: HIGH (visual inconsistency)  
**Fix Time**: 15 minutes
