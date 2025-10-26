# Sheet Component: Production Hardening Complete

## ✅ Applied Fixes (Phase 2.5)

### 1. SSR Safety ✅
- **Fixed**: Module-scope `matchMedia` and `window` access
- **Solution**: Wrapped in SSR-safe functions (`isCoarsePointer()`, `isSmallViewport()`)
- **Result**: Safe for Next.js/Remix SSR builds

### 2. `dismissible` Prop ✅
- **Added**: Separate `dismissible` prop (default: true for modal, false for modeless)
- **Why**: Decouples modality from dismissibility
- **Use Case**: Modal checkout that can't be dismissed, or modeless panel that can be

### 3. Controlled Snap ✅
- **Added**: `snap` prop for external control
- **Why**: Allows programmatic snap control (e.g., buttons in Storybook)
- **Result**: Buttons can now control sheet position

---

## 🚧 Remaining Hardening (Next 30 min)

### 4. Scroll Lock Ref-Counting
**Problem**: Opening two sheets causes first to unlock body when second closes
**Solution**: Add `LOCK_COUNT` refcounting
```typescript
let LOCK_COUNT = 0;
if (modality === 'modal' && LOCK_COUNT++ === 0) {
  document.body.style.overflow = 'hidden';
}
// cleanup
if (modality === 'modal' && --LOCK_COUNT === 0) {
  document.body.style.overflow = '';
}
```

### 5. Viewport Height Tracking
**Problem**: `reservedPx` doesn't update on device rotation
**Solution**: Track `vh` with resize listener
```typescript
const [vh, setVh] = useState(() => typeof window !== 'undefined' ? window.innerHeight : 0);
useEffect(() => {
  const onResize = () => setVh(window.innerHeight);
  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('resize', onResize);
}, []);
```

### 6. Haptic Debouncing
**Problem**: Fires on every `activeSnap` change (during drag)
**Solution**: Fire only on semantic bucket change
```typescript
const [lastBucket, setLastBucket] = useState<'peek'|'work'|'owned'|null>(null);
useEffect(() => {
  const bucket = isOwned ? 'owned' : isWork ? 'work' : 'peek';
  if (bucket !== lastBucket && haptics?.onSnap) {
    setLastBucket(bucket);
    hapticFeedback(bucket === 'owned' ? 'medium' : 'light');
  }
}, [isPeek, isWork, isOwned]);
```

### 7. `inert` Fallback
**Problem**: `inert` not supported in older browsers
**Solution**: Add `aria-hidden` fallback
```typescript
const supportsInert = 'inert' in HTMLElement.prototype;
if (shouldInertUnderlay) {
  underlay?.setAttribute('inert', '');
  if (!supportsInert) underlay?.setAttribute('aria-hidden', 'true');
}
```

### 8. Slot Markers
**Problem**: `child.type === Sheet.Header` breaks with HMR
**Solution**: Use static `$$slot` marker
```typescript
(Sheet.Header as any).$$slot = 'sheet-header';
if (isValidElement(child) && (child.type as any)?.$$ slot === 'sheet-header') {
  header = child;
}
```

### 9. Keyboard Threshold
**Add**: Optional `keyboardThresholdPx` prop (default 150)
```typescript
export function useKeyboardOpen(enabled = true, threshold = 150) {
  setIsOpen(dy > threshold);
}
```

### 10. Elevation Shadow ✨
**Add**: Box-shadow based on semantic state
```css
.ds-sheet-content {
  box-shadow: var(--ds-elevation-sheet);
}

/* CSS variable mapping */
--ds-elevation-sheet-peek: 0 2px 8px rgba(0,0,0,0.08);
--ds-elevation-sheet-work: 0 8px 24px rgba(0,0,0,0.12);
--ds-elevation-sheet-owned: 0 16px 48px rgba(0,0,0,0.16);
```

---

## 🎯 Priority Order

1. ✅ **SSR Safety** (DONE)
2. ✅ **dismissible Prop** (DONE)
3. ✅ **Controlled Snap** (DONE)
4. 🔥 **Scroll Lock Refcounting** (CRITICAL for stacking)
5. 🔥 **Viewport Height Tracking** (CRITICAL for rotation)
6. ⚡ **Elevation Shadow** (HIGH UX value)
7. ⚡ **Haptic Debouncing** (MEDIUM - battery/UX)
8. 📋 **inert Fallback** (LOW - older browsers)
9. 📋 **Slot Markers** (LOW - edge case)
10. 📋 **Keyboard Threshold** (LOW - rare edge case)

---

## 🚀 Next Actions

1. Apply scroll lock refcounting (5 min)
2. Add viewport height tracking (5 min)
3. Add elevation shadows to CSS (5 min)
4. Update `useKeyboardOpen` with threshold (5 min)
5. Add haptic debouncing (5 min)
6. Build + test (5 min)

**Total**: ~30 minutes to production-hardened state

---

**Status**: 3/10 fixes applied, 7 remaining
**ETA**: 30 minutes to bulletproof
