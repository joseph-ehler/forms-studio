# Capabilities System - Native-Feel Layer

**Status**: 🟢 **OPERATIONAL**  
**Date**: 2025-01-25

---

## **What This Is**

The Capabilities Layer enables your DS primitives to adapt behavior by context—**one codebase, three feels**:

- **Desktop**: Modals, precise hover, keyboard navigation
- **Mobile Web**: Bottom sheets, drag gestures, touch-optimized
- **Capacitor**: Bottom sheets + haptics + keyboard-aware resizing

All while maintaining 100% brand consistency via SKIN tokens.

---

## **Architecture**

```
Capabilities Layer (platform detection)
  ↓
DS Primitives (Sheet, Popover, etc.)
  ↓ choose engine
Battle-Tested Libs (react-spring-bottom-sheet, Floating UI)
  ↓ render with
SKIN Tokens (--ds-role-*, --ds-space-*, etc.)
```

**Pattern**: DS primitives query capabilities → route to appropriate engine → apply SKIN tokens

---

## **Files Created**

### **Capabilities**
- `packages/ds/src/capabilities/platform.ts` - Device detection
- `packages/ds/src/capabilities/useKeyboardInsets.ts` - Keyboard awareness
- `packages/ds/src/capabilities/index.ts` - Barrel export

### **Primitives**
- `packages/ds/src/primitives/Sheet/Sheet.tsx` - Modal ↔ Bottom sheet
- `packages/ds/src/primitives/Sheet/Sheet.css` - SKIN-driven styling
- `packages/ds/src/primitives/Sheet/Sheet.stories.tsx` - Matrix stories
- `packages/ds/src/primitives/Popover/Popover.tsx` - Floating UI wrapper
- `packages/ds/src/primitives/Popover/Popover.css` - SKIN-driven styling
- `packages/ds/src/primitives/Popover/Popover.stories.tsx` - Placement demos
- `packages/ds/src/primitives/index.ts` - Barrel export

### **Guardrails**
- `.eslintrc.import-hygiene.cjs` - Blocks direct imports of behavior engines

---

## **Usage**

### **Capabilities Detection**

```typescript
import { isCapacitor, pointer, isSmallViewport, haptic } from '@intstudio/ds/capabilities';

// Check context
if (pointer === 'coarse') {
  // Touch-optimized behavior
}

if (isCapacitor) {
  // Native container features
}

// Haptics (safe no-op on web)
haptic('light'); // On tap
haptic('medium'); // On confirm
haptic('heavy'); // On error
```

### **Sheet Component**

```typescript
import { Sheet } from '@intstudio/ds/primitives';

function MyFeature() {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        ariaLabel="Settings"
        initialSnap={0.6} // Mobile: snap to 60% viewport height
      >
        <h2>Settings</h2>
        <p>Your content here...</p>
      </Sheet>
    </>
  );
}
```

**What happens:**
- **Desktop**: Renders Flowbite `<Modal>` with keyboard nav
- **Mobile/Touch**: Renders bottom sheet with drag-to-dismiss
- **Capacitor**: Bottom sheet + haptic feedback on dismiss

### **Popover Component**

```typescript
import { Popover } from '@intstudio/ds/primitives';

function MyMenu() {
  return (
    <Popover
      trigger={<button>Options</button>}
      content={
        <div>
          <button>Edit</button>
          <button>Delete</button>
        </div>
      }
      placement="bottom-end"
    />
  );
}
```

**What happens:**
- Floating UI handles positioning (flip, shift, collision)
- SKIN tokens provide visuals (--ds-role-surface, --ds-role-border)
- Auto-updates position on scroll/resize

---

## **Guardrails**

### **ESLint Enforcement**

Direct imports of behavior engines are **blocked** outside DS:

```typescript
// ❌ Forms/app code CANNOT do this:
import { BottomSheet } from 'react-spring-bottom-sheet';
import { useFloating } from '@floating-ui/react';
import { Haptics } from '@capacitor/haptics';

// ✅ Instead, use DS wrappers:
import { Sheet, Popover, haptic } from '@intstudio/ds';
```

**Why**: Centralized maintenance, consistent behavior, bundle safety

### **Bundle Safety**

Heavy engines are **lazy-loaded**:

```typescript
// Sheet only loads bottom sheet engine on mobile/touch
useEffect(() => {
  if (useBottomSheet) {
    import('react-spring-bottom-sheet').then(mod => {
      setSheetImpl(() => mod.BottomSheet);
    });
  }
}, [useBottomSheet]);
```

**Result**: Desktop bundles stay light; mobile pays only for what it uses

---

## **What This Affords**

### **For Your Company**

| Benefit | Impact |
|---------|--------|
| **One Codebase** | Desktop, mobile web, Capacitor—zero forks |
| **Centralized Upgrades** | Fix bugs once in DS; 100 teams unaffected |
| **Lower Cognitive Load** | Teams learn `<Sheet>`, not 5 libraries |
| **API Stability** | API Extractor freezes surface; refactor internals safely |

### **For Your Users**

| Context | Experience |
|---------|------------|
| **Desktop** | Precise modal, ESC to close, Tab cycles |
| **Mobile Web** | Native-feeling sheet, drag-to-dismiss, snap points |
| **Capacitor** | Sheet + haptics + keyboard-aware resizing |

### **For Your Design System**

- ✅ DS provides **behavior** (not just visuals)
- ✅ Unified API (`<Sheet>`) hides implementation
- ✅ SKIN tokens ensure brand consistency everywhere
- ✅ Generators can now create capability-aware components

---

## **Dependencies Installed**

```json
{
  "@use-gesture/react": "^10.3.1",
  "react-spring": "^10.0.3",
  "@floating-ui/react": "^0.27.16",
  "react-virtuoso": "^4.14.1",
  "react-spring-bottom-sheet": "^3.4.1",
  "@capacitor/haptics": "^7.0.2",
  "@capacitor/keyboard": "^7.0.3"
}
```

**All lazy-loaded** where appropriate to keep desktop bundles lean.

---

## **Matrix Stories**

### **Sheet**
- `Desktop` story: Renders modal, keyboard nav
- `Mobile` story: Renders bottom sheet, drag handle

### **Popover**
- `Basic` story: Simple trigger + content
- `Placements` story: All 12 placement options

**Run**: `pnpm sb` → Navigate to "DS/Primitives"

---

## **Next Steps**

### **Immediate (This Week)**

1. ✅ Capabilities layer scaffolded
2. ✅ Sheet + Popover wrappers built
3. ✅ ESLint guardrails active
4. ✅ Matrix stories created
5. ⏳ **Generate Core Six DS primitives** (Select, Textarea, Checkbox, Radio, Toggle, Badge)

### **Short-Term (Next 2 Weeks)**

1. Add `<VirtList>` wrapper (react-virtuoso)
2. Add `<Carousel>` wrapper (keen-slider or swiper)
3. Update generators to create capability-aware wrappers
4. Add keyboard canary tests (Tab, Enter, ESC)

### **Long-Term (Next Month)**

1. Add metrics tracking (sheet vs modal renders)
2. Add Playwright tests for touch gestures
3. Document recipes (AsyncSearchSelect, DatePicker)
4. Extract patterns for bespoke fields (Lane B)

---

## **Validation**

```bash
# All gates pass
✅ pnpm build         # All packages compile
✅ pnpm typecheck     # No type errors
✅ pnpm lint:prod     # ESLint clean
✅ pnpm sb            # Stories render

# Verify ESLint blocks direct imports
pnpm lint:prod
# Should error if code tries to import react-spring-bottom-sheet directly
```

---

## **Bottom Line**

**Before**: Each component manually handles device differences  
**After**: DS primitives adapt automatically via capabilities

**Result**:
- 🚀 **One API** (`<Sheet>`, `<Popover>`)
- 🎨 **Consistent visuals** (SKIN tokens)
- 📱 **Native-feeling interactions** (context-aware)
- 🔒 **Centralized control** (ESLint enforced)
- ⚡ **Bundle-safe** (lazy-loaded engines)

**This is the mature, scalable way to handle multi-platform feel.** Your factory now has the intelligence to route behavior by context—safely, repeatably, and with Toyota-grade guardrails.

---

**Status**: 🎉 **CAPABILITIES SYSTEM OPERATIONAL** 🎉

Ready to generate Core Six primitives with native-feel built-in!
