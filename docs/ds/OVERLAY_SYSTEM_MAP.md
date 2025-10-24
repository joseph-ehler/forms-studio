# Overlay/Sheet System Map — Canonical Specification

**Version**: 1.0  
**Status**: ✅ Production ready  
**Purpose**: Source of truth for overlay/sheet internals, contracts, and responsibilities

---

## 🧩 Top-Level Architecture

```
Recipe (Forms)
 ├─ Trigger (ds-select-trigger / chips / etc.)
 └─ Overlay (platform-agnostic)
     └─ <ResponsiveOverlay>
         ├─ (Popover mode)   usePopoverPosition → flip/shift/resize
         ├─ (Sheet mode)     useSheetGestures → snap/drag/keyboard-avoid
         ├─ Focus trap       useFocusTrap → tab loop, ESC close, focus return
         ├─ Scroll lock      useScrollLock → html/body overflow:hidden
         └─ Children (DS layout atoms)
             ├─ <OverlayHeader>  (sticky)
             ├─ <OverlayContent> (scrollable)
             └─ <OverlayFooter>  (sticky)
                 └─ Inside content use:
                     ├─ <OverlayList>  + <Option> / <OptionGroup>
                     └─ <OverlayGrid>  (color/emoji/template grids)
```

---

## 1️⃣ Coordinator: ResponsiveOverlay (DS)

### Purpose
One component that auto-selects popover vs sheet, manages portal, focus trap, scroll lock, ARIA, and tokens. **Recipes don't think about platform.**

### TypeScript Contract

```typescript
type OverlayMode = 'auto' | 'popover' | 'sheet';

type CollisionStrategy = 'flip' | 'shift' | 'resize' | 'flip-shift-resize';

export interface ResponsiveOverlayProps {
  open: boolean;
  onClose: () => void;

  // Trigger/focus
  triggerRef?: React.RefObject<HTMLElement>;
  returnFocus?: boolean;              // default: true
  trapFocus?: boolean;                // default: true

  // Mode selection
  mode?: OverlayMode;                 // default: 'auto'
  breakpoint?: number;                // px (auto popover->sheet)
  fitTrigger?: boolean;               // popover width matches trigger

  // Popover positioning
  placement?: 'bottom' | 'top' | 'right' | 'left' | 'auto';
  collision?: CollisionStrategy;      // default: 'flip-shift-resize'
  anchorPadding?: number;             // default: 8 (tokenized internally)
  minPopoverHeight?: number;          // fallback to sheet if insufficient

  // Sheet gestures
  snap?: number[];                    // e.g., [0.4, 0.7, 1.0]
  initialSnap?: number;               // default: largest <= 0.7
  dragHandle?: boolean;               // default: true
  allowContentScroll?: boolean;       // default: true
  keyboardAvoidance?: boolean;        // default: true

  // ARIA & roles
  role?: 'listbox' | 'dialog';
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;

  // Telemetry hooks (optional)
  onOpenStart?: () => void;
  onOpenEnd?: () => void;
  onCloseStart?: () => void;
  onCloseEnd?: () => void;
  onSnapChange?: (progress: number) => void; // 0..1

  // Style/class hooks (className, data-*)
  className?: string;
  backdropClassName?: string;

  // Children should be DS layout atoms (Header/Content/Footer)
  children: React.ReactNode;
}
```

### Responsibilities (DS Owns)

✅ Portals overlay + backdrop (SSR-safe check)  
✅ Scroll lock: `html` overflow hidden while open  
✅ Focus: trap + return focus to trigger on close  
✅ Tokens only (no hard-coded values): radius/shadow/backdrop  
✅ Auto mode: popover vs sheet by viewport/collision  
✅ Safe-area padding for mobile (`env(safe-area-inset-bottom)`)

---

## 2️⃣ Popover & Sheet Hooks (DS Internals)

### usePopoverPosition

```typescript
export interface PopoverPositionOptions {
  triggerRef: React.RefObject<HTMLElement>;
  fitTrigger?: boolean;
  placement?: 'bottom' | 'top' | 'right' | 'left' | 'auto';
  collision?: CollisionStrategy;
  anchorPadding?: number; // tokenized internally
  minHeight?: number;
}

export interface PopoverPosition {
  style: React.CSSProperties; // inline style for surface
  placementFinal: 'bottom'|'top'|'right'|'left';
}

export function usePopoverPosition(
  open: boolean,
  opts: PopoverPositionOptions
): PopoverPosition;
```

**Behavior**:
- Measures trigger + viewport
- Tries `placement` with flip/shift/resize
- Resizes/clamps via `minHeight` if needed
- Auto-updates on scroll/resize

---

### useSheetGestures

```typescript
export interface SheetGestureOptions {
  snap: number[];               // 0..1 (height fraction)
  initialSnap?: number;
  allowContentScroll?: boolean;
  keyboardAvoidance?: boolean;
}

export interface SheetGestures {
  containerProps: {
    ref: React.RefCallback<HTMLElement>;
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    style: React.CSSProperties; // uses CSS 'translate' not transform
  };
  progress: number;             // 0..1 (current snap height)
}

export function useSheetGestures(
  open: boolean,
  opts: SheetGestureOptions,
  onClose: () => void
): SheetGestures;
```

**Behavior**:
- Velocity-based snap (flick up/down)
- Drag handle or surface drag
- Content scroll handoff: sheet moves only when content is at top/bottom
- Keyboard avoidance lifts sheet when keyboard shown

---

### useFocusTrap, useScrollLock (DS)

```typescript
useFocusTrap(open, rootRef, { returnTo: triggerRef })
useScrollLock(open)
```

---

## 3️⃣ DS Layout Atoms & Options

### OverlayHeader

```typescript
export interface OverlayHeaderProps {
  sticky?: boolean;          // default: true
  className?: string;
  children: React.ReactNode;
}

export const OverlayHeader: React.FC<OverlayHeaderProps>;
```

---

### OverlayContent

```typescript
export interface OverlayContentProps {
  className?: string;        // scroll container
  children: React.ReactNode;
}

export const OverlayContent: React.FC<OverlayContentProps>;
```

---

### OverlayFooter

```typescript
export interface OverlayFooterProps {
  sticky?: boolean;          // default: true
  className?: string;
  children: React.ReactNode;
}

export const OverlayFooter: React.FC<OverlayFooterProps>;
```

---

### OverlayList

```typescript
export interface OverlayListProps {
  role?: 'listbox';          // defaults to listbox
  'aria-multiselectable'?: boolean;
  className?: string;        // tokens style .ds-option-list
  children: React.ReactNode;
}

export const OverlayList: React.FC<OverlayListProps>;
```

---

### OverlayGrid

```typescript
export interface OverlayGridProps {
  columns?: number;          // default via CSS grid template columns
  role?: 'grid';
  className?: string;
  children: React.ReactNode;
}

export const OverlayGrid: React.FC<OverlayGridProps>;
```

---

### Option / OptionGroup

```typescript
export interface OptionProps {
  value: string;
  label?: string;
  icon?: React.ReactNode;
  description?: string;
  selected?: boolean;
  disabled?: boolean;
  highlighted?: boolean;     // for keyboard/hover
  onSelect?: (value: string) => void;
  onMouseEnter?: () => void; // to sync highlight
  className?: string;
}

export const Option: React.FC<OptionProps>; // <button role="option" aria-selected ...>

export interface OptionGroupProps {
  label: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export const OptionGroup: React.FC<OptionGroupProps>;
```

**Styles**: `.ds-option-list`, `.ds-option-button`, `.ds-hover-scrim`  
**Tokens only**: spacing, radius, shadow, colors

---

## 4️⃣ Recipe Hooks (Forms)

### useOverlayKeys

```typescript
export interface OverlayKeysOptions {
  count: number;                       // options count
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  onSelect: (i: number) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function useOverlayKeys(opts: OverlayKeysOptions): (e: React.KeyboardEvent) => void;
```

**Handles**: ArrowUp/Down, Home/End, Enter, Escape  
**Use on**: Trigger, Search input, and Content

---

### useFocusReturn

```typescript
export function useFocusReturn(
  triggerRef: React.RefObject<HTMLElement>,
  open: boolean
): void;
```

Remembers previous focus and returns to it after close.

---

### useScrollActiveIntoView

```typescript
export function useScrollActiveIntoView(
  listRef: React.RefObject<HTMLElement>,
  activeIndex: number
): void;
```

Keeps highlighted item visible.

---

## 5️⃣ Integration from Spec (Forms → Recipes → DS)

### Spec Knobs (Subset)

```yaml
ui:
  overlay:
    mode: auto              # auto | popover | sheet
    breakpoint: 768

    # Popover
    fitTrigger: true
    collision: flip-shift-resize
    anchorPadding: 8
    minPopoverHeight: 280

    # Sheet
    snap: [0.4, 0.7, 1.0]
    initialSnap: 0.7
    dragHandle: true
    allowContentScroll: true
    keyboardAvoidance: true
```

### Generator (Scaffolder) Pattern

```typescript
const recipe = selectRecipe(spec);
const { Trigger, Overlay } = recipe(ctx);

return (
  <>
    <Trigger field={field} disabled={disabled} hasError={hasError} />
    <Overlay open={isOpen} onClose={() => setIsOpen(false)}>
      {/* All overlay content must be DS atoms */}
    </Overlay>
  </>
);
```

Recipes render the overlay via `ResponsiveOverlay` and pass `spec.ui.overlay` through.

---

## 6️⃣ Roles & ARIA (Baseline)

### Trigger (button)
```typescript
type="button"
aria-haspopup="listbox"
aria-expanded={open}
aria-controls={id}
```

### Overlay container
```typescript
role="listbox"  // for lists
role="dialog"   // for complex sheets (e.g., date range)
```

### List
```typescript
role="listbox"
aria-multiselectable="true"  // multi-select only
```

### Option
```typescript
<button role="option" aria-selected={selected} tabIndex={-1}>
```

**Refiner rules** (report-only) verify presence  
**ESLint/Stylelint** block unsafe patterns

---

## 7️⃣ Tokens (No Hard-Coded Values)

Used by overlay:

| Token Category | Examples |
|----------------|----------|
| **Radius** | `--ds-radius-sm`, `--ds-radius-md`, `--ds-radius-xl` |
| **Shadows** | `--ds-shadow-overlay-md`, `--ds-shadow-overlay-lg` (using `rgba(var(--ds-shadow-rgb), alpha)`) |
| **Backdrop** | `--ds-color-backdrop` (light/dark differ) |
| **Spacing** | `--ds-space-1/2/3/4…` |
| **Colors** | surface/primary/text tokens (never hex) |

---

## 8️⃣ State Machine (High Level)

```
Closed
  └─ Trigger click → Opening

Opening
  ├─ onOpenStart → animate in
  └─ after mount, focus trap engages → Open

Open
  ├─ Popover: collision recalcs on scroll/resize
  ├─ Sheet: drag gestures (snap(n)), keyboard avoidance
  ├─ ESC → Closing
  └─ Backdrop click → Closing

Closing
  ├─ onCloseStart → animate out
  └─ returnFocus(trigger), onCloseEnd → Closed
```

---

## 9️⃣ Minimal Usage Examples

### A. Simple Select

```tsx
<ResponsiveOverlay 
  open={open} 
  onClose={close} 
  triggerRef={triggerRef} 
  role="listbox" 
  {...spec.ui?.overlay}
>
  <OverlayHeader>
    <div className="ds-input-wrap">
      <span className="ds-input-adorn-left"><SearchIcon/></span>
      <input 
        className="ds-input ds-input--sm ds-input--pad-left" 
        placeholder="Search…" 
        onKeyDown={handleKeys}
      />
    </div>
  </OverlayHeader>

  <OverlayContent>
    <OverlayList>
      {options.map((o, i) => (
        <Option 
          key={o.value} 
          value={o.value} 
          selected={i===active} 
          onSelect={select(o.value)} 
        />
      ))}
    </OverlayList>
  </OverlayContent>
</ResponsiveOverlay>
```

---

### B. Multi-Select with Footer

```tsx
<ResponsiveOverlay 
  open={open} 
  onClose={close} 
  triggerRef={triggerRef} 
  role="listbox" 
  {...spec.ui?.overlay}
>
  <OverlayHeader>{/* search */}</OverlayHeader>
  
  <OverlayContent>
    <OverlayList aria-multiselectable>
      {options.map(o => (
        <Option 
          key={o.value} 
          selected={sel.has(o.value)} 
          onSelect={toggle(o.value)} 
        />
      ))}
    </OverlayList>
  </OverlayContent>
  
  <OverlayFooter>
    <span>{sel.size} selected</span>
    <div style={{flex:1}} />
    <button className="ds-button" onClick={clearAll}>Clear</button>
    <button className="ds-button ds-button--primary" onClick={apply}>Apply</button>
  </OverlayFooter>
</ResponsiveOverlay>
```

---

## 🔟 Audit Checklist (Quick Reference)

### Positioning & Gestures
- [ ] Sheet bottom anchored at all snap points
- [ ] Keyboard avoidance works
- [ ] Popover collision flip/shift/resize works

### Scroll & Focus
- [ ] Only DS controls scroll lock (no duplicates)
- [ ] Focus trap engages on open
- [ ] Focus returns to trigger on close

### Input & List
- [ ] Search input uses adornment utilities; no overlap
- [ ] List items ≥ 48px
- [ ] 8px list padding
- [ ] 2px inter-item gaps
- [ ] Hover over selected darkens (scrim pattern)

### Tokens & Styling
- [ ] Tokens only (no hex/rgb/radii in code)
- [ ] Uses CSS classes, not inline styles (except dynamic positioning)

### ARIA & Accessibility
- [ ] Trigger: `aria-haspopup`, `aria-expanded`, `type="button"`
- [ ] Overlay: appropriate `role`
- [ ] Overlay: `aria-multiselectable` when multi
- [ ] Option: `role="option"`, `aria-selected`, `tabIndex=-1`

### Keyboard
- [ ] ArrowUp/Down works
- [ ] Home/End works
- [ ] Enter selects
- [ ] Esc closes

---

## 📚 Related Documentation

- **Acceptance Criteria**: `/docs/audit/ACCEPTANCE_CRITERIA_COMPLETE.md`
- **Audit Harness**: `/docs/audit/OVERLAY_AUDIT_HARNESS.md`
- **Bug Audit**: `/docs/debug/OVERLAY_SHEET_BUG_AUDIT.md`
- **Fix Log**: `/docs/debug/OVERLAY_SHEET_FIXES_2025-10-24.md`
- **Recipe System**: `/docs/ds/OVERLAY_RECIPE_SYSTEM.md`

---

## 🔒 Contract Enforcement

### Automated Validation
1. **Playwright E2E** (`tests/overlay-acceptance.spec.ts`)
2. **Recipe Contracts** (`tests/utils/recipe-contracts.ts`)
3. **Boundary Check** (`scripts/audit/responsibility-check.sh`)
4. **Console Diagnostics** (`scripts/debug/diagnose-overlay-sheet.js`)

### Manual Validation
1. Visual inspection with diagnostic script
2. Cross-browser testing (Safari, Chrome, Firefox)
3. Mobile device testing (iOS keyboard avoidance)
4. Screen reader testing (VoiceOver, NVDA)

---

**This document is the canonical source of truth for overlay/sheet implementation.**  
All implementations, audits, and changes must conform to these contracts.
