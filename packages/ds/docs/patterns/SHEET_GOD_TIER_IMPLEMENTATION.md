# Sheet God-Tier Implementation Plan

## ✅ **PHASE 1 COMPLETE: Foundation**

### What We Just Added:
1. ✅ **Semantic State Machine Types** (`SheetScrimStrategy`, `FooterMode`)
2. ✅ **Scrim Resolution Logic** (`resolveScrim` function)
3. ✅ **Extended Props** (all new semantic props documented)

### Core Thresholds (Semantic States):
```typescript
const PEEK_MAX = 0.35;    // Lightweight glance
const WORK_MIN = 0.5;     // Focused work state
const OWNED_MIN = 0.9;    // Owns the screen
```

---

## 🚧 **PHASE 2: Integration (Next 30 min)**

### 2.1: Add Keyboard Detection Hook
**File**: `packages/ds/src/hooks/useKeyboardOpen.ts`

```typescript
export function useKeyboardOpen(enabled: boolean = true): boolean {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleResize = () => {
      if (window.visualViewport) {
        const dy = window.innerHeight - window.visualViewport.height;
        setIsOpen(dy > 150); // keyboard likely open if >150px diff
      }
    };

    handleResize();
    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, [enabled]);

  return isOpen;
}
```

### 2.2: Integrate Into Sheet Component
**Changes to `Sheet.tsx`**:

1. **Destructure new props**:
```typescript
export function Sheet({
  // ... existing props
  scrimStrategy = 'auto',
  scrimAlphaRange = [0.08, 0.48],
  scrimWorkMin = 0.5,
  scrimOwnedMin = 0.9,
  scrimClickDismiss = true,
  headerDensity = 'auto',
  footerMode = 'auto',
  footerSafeArea = true,
  footerRevealAt,
  keyboardAware = true,
  keyboardInsets = 'auto',
  inertUnderlay,
  haptics,
}: SheetProps) {
```

2. **Compute semantic state**:
```typescript
const keyboardOpen = useKeyboardOpen(keyboardAware);
const [alphaMin, alphaMax] = scrimAlphaRange;
const WORK_MIN = scrimWorkMin;
const OWNED_MIN = scrimOwnedMin;

const isPeek = (activeSnap ?? 1) < WORK_MIN;
const isWork = (activeSnap ?? 1) >= WORK_MIN && (activeSnap ?? 1) < OWNED_MIN;
const isOwned = (activeSnap ?? 1) >= OWNED_MIN;

const scrim = resolveScrim({
  strategy: scrimStrategy,
  snap: activeSnap ?? 1,
  modality,
  keyboardOpen,
  WORK_MIN,
  OWNED_MIN,
  alphaMin,
  alphaMax,
});

const footerShouldShow =
  footerMode === 'always' ? true :
  footerMode === 'never' ? false :
  keyboardOpen || (activeSnap ?? 1) >= (footerRevealAt ?? WORK_MIN);

const shouldInertUnderlay =
  typeof inertUnderlay === 'boolean' ? inertUnderlay :
  (modality !== 'modeless') && (isWork || isOwned || keyboardOpen);
```

3. **Apply scrim alpha to overlay**:
```typescript
<Drawer.Overlay 
  className={`ds-sheet-overlay ds-sheet-overlay--${backdrop}`}
  style={{
    opacity: scrim.visible ? scrim.alpha : 0,
    pointerEvents: scrim.visible && scrimClickDismiss && modality === 'modal' ? 'auto' : 'none',
  }}
  onClick={() => {
    if (scrim.visible && scrimClickDismiss && modality === 'modal') {
      handleDismiss();
    }
  }}
/>
```

4. **Conditional footer rendering**:
```typescript
{footerShouldShow && footer}
```

---

## 🎯 **PHASE 3: Stories (Next 30 min)**

### 3.1: Add God-Tier Stories
**File**: `Sheet.stories.tsx`

#### A. Modal Peek → Work → Owned
```typescript
export const ModalSemanticStates: S = {
  render: () => {
    const [open, setOpen] = useState(true);
    const [snap, setSnap] = useState<number | null>(0.25);
    return (
      <Sheet
        open={open}
        onOpenChange={setOpen}
        ariaLabel="Modal States Demo"
        forceMode="sheet"
        modality="modal"
        snapPoints={[0.25, 0.5, 0.9]}
        defaultSnap={0.25}
        scrimStrategy="auto"
        footerMode="auto"
        onSnapChange={setSnap}
      >
        <Sheet.Header>
          <h3>State: {snap! < 0.5 ? 'PEEK' : snap! < 0.9 ? 'WORK' : 'OWNED'}</h3>
        </Sheet.Header>
        <Sheet.Content>
          <p>Current snap: {snap?.toFixed(2)}</p>
          <p>Scrim should: {snap! < 0.5 ? 'be OFF' : snap! < 0.9 ? 'ramp 0.08→0.48' : 'peak at 0.48'}</p>
        </Sheet.Content>
        <Sheet.Footer>
          <button onClick={() => setOpen(false)}>Close</button>
        </Sheet.Footer>
      </Sheet>
    );
  },
};
```

#### B. Modeless Inspector
```typescript
export const ModelessInspector: S = {
  render: () => (
    <Sheet
      modality="modeless"
      snapPoints={[0.25, 0.5, 0.9]}
      defaultSnap={0.25}
      scrimStrategy="auto"
      footerMode="never"
      inertUnderlay={false}
    >
      {/* Underlay remains interactive */}
    </Sheet>
  ),
};
```

#### C. Custom Scrim Function (Media Player)
```typescript
export const MediaPlayer: S = {
  render: () => (
    <Sheet
      modality="modeless"
      snapPoints={[0.2, 0.55, 0.95]}
      defaultSnap={0.2}
      scrimStrategy={({ snap }) => ({
        visible: snap >= 0.55,
        alpha: 0.36,
      })}
      footerMode="always"
    >
      {/* Now Playing */}
    </Sheet>
  ),
};
```

---

## 📊 **Test Matrix**

| Case | Modality | Snap | Expected Behavior |
|------|----------|------|-------------------|
| A1 | modal | 0.25 | Scrim: OFF, Underlay: interactive, Footer: hidden |
| A2 | modal | 0.5 | Scrim: visible α≈0.08, Underlay: inert, Footer: visible |
| A3 | modal | 0.9 | Scrim: α≈0.48, Underlay: inert, Footer: visible |
| B1 | modeless | 0.25 | Scrim: OFF, Underlay: interactive, Footer: hidden |
| B2 | modeless | 0.6 | Scrim: subtle, Underlay: interactive, Footer: visible |
| C1 | modal+kbd | 0.25 | Scrim: ON (contrast), Footer: visible, Insets applied |

---

## 🚀 **Success Metrics**

### Technical:
- ✅ Scrim alpha ramps smoothly with snap
- ✅ Footer appears/disappears at thresholds
- ✅ Underlay inert only when semantic state requires
- ✅ Keyboard detection adjusts layout

### UX:
- ✅ Peek state feels lightweight (no scrim)
- ✅ Work state feels focused (subtle scrim)
- ✅ Owned state feels committed (strong scrim)

### DX:
- ✅ Zero config for common patterns (`scrimStrategy="auto"`)
- ✅ Escape hatches for custom behavior (function strategy)
- ✅ TypeScript enforces valid states

---

## 🎉 **Vision Mapping**

| Experience | Implementation |
|------------|----------------|
| **Apple Maps Inspector** | `interaction="resize"` + `snapPoints={[0.25, 0.5]}` |
| **Spotify Now Playing** | `interaction="push"` + `defaultSnap={0.15}` |
| **Slack Quick Switcher** | `keyboardAware` + `footerMode="auto"` |
| **Apple Wallet Modal** | `backdrop="blur"` + `UnderlayEffects` |
| **Nested Workflows** | `SheetStackProvider` (Phase 4) |

---

## ⏭️ **Next Phases**

### Week 2-3: Advanced Interactions
- UnderlayEffects component (blur/scale)
- Keyboard insets (iOS safe area)
- Inline mode (desktop panels)

### Week 4-5: Stacking & Polish
- SheetStackProvider (z-index management)
- Haptic refinements
- Recipe stories (Filters, Compose, Media)

---

**Status**: Phase 1 Complete ✅  
**Next**: Integrate scrim logic (30 min) → Stories (30 min) → Ship Phase 2 🚀
