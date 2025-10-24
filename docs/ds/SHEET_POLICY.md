# Sheet Policy - Implementation Contract

**Status**: Design System Policy  
**Version**: 1.0  
**Enforcement**: Runtime contracts + ESLint + TypeScript + Tests

---

## 🎯 Purpose

This document defines the **non-negotiable contracts** for SheetDialog (micro) and SheetPanel (macro) to prevent the "one generic sheet fits all" trap that forces UX compromises.

---

## 📜 The Split: SheetDialog vs SheetPanel

### SheetDialog (Modal, Task-Focused)

**Purpose**: Field pickers, forms, confirmations - user completes ONE focused task

#### **Contracts** (Enforced)

```typescript
interface SheetDialogContract {
  // A11y (ENFORCED)
  role: 'dialog' | 'alertdialog'  // ✅ Validated at runtime
  ariaLabel: string | ariaLabelledBy: string  // ✅ Throws if missing
  
  // Modal behavior (AUTOMATIC)
  modal: true  // Cannot be overridden
  trapFocus: true  // Focus contained
  scrollLock: true  // Body locked
  inertBackground: true  // Background non-interactive
  backdrop: true  // Dimmed overlay
  
  // Snap behavior (RECOMMENDED)
  snap: [0.7] | [0.7, 0.9]  // Large by default
  initialSnap: 0.7 | 0.9  // Open near-full
  
  // Close behavior (EXPLICIT)
  closeOnSelect?: boolean  // Default: false for multi, true for single
  allowDragDismiss: false  // Requires Done/Cancel
  onDone: () => void  // Commit changes
  onCancel: () => void  // Revert changes
  
  // Footer (REQUIRED)
  footer: ReactNode  // Done/Cancel buttons
  
  // Device (AUTO-RESOLVED)
  // Desktop → Popover instead
  // Mobile → SheetDialog
  // Tablet → Follows policy.tabletMode
}
```

#### **Runtime Validation**

```typescript
// Throws in dev if violated
if (role === 'dialog' && !ariaLabel && !ariaLabelledBy) {
  throw new Error(
    'SheetDialog requires ariaLabel or ariaLabelledBy.\n' +
    'Add: ariaLabel="Select color"'
  )
}

if (allowDragDismiss === true) {
  console.warn(
    'SheetDialog does not support drag-to-dismiss.\n' +
    'Use explicit Done/Cancel buttons instead.'
  )
}
```

#### **Telemetry Events**

```typescript
// Emitted automatically
{
  event: 'overlay_open',
  kind: 'dialog',
  mode: 'sheet',
  device: 'mobile',
  snap: 0.7,
  source: 'user' | 'program'
}

{
  event: 'overlay_close',
  kind: 'dialog',
  reason: 'done' | 'cancel' | 'esc' | 'tap_backdrop',
  durationMs: 1234,
  interactionCount: 5
}
```

---

### SheetPanel (Non-Modal, Context-Aware)

**Purpose**: App-shell UI - map+panel, canvas+tools, persistent contextual info

#### **Contracts** (Enforced)

```typescript
interface SheetPanelContract {
  // A11y (ENFORCED)
  role: 'complementary' | 'region'  // ✅ Validated at runtime
  ariaLabel: string | ariaLabelledBy: string  // ✅ Throws if missing
  
  // Non-modal behavior (AUTOMATIC)
  modal: false  // Cannot be overridden
  trapFocus: false  // Natural tab order
  scrollLock: false  // Background scrollable
  inertBackground: false  // Background interactive
  backdrop: false  // No dimming
  
  // Snap behavior (FLEXIBLE)
  snap: [0.25, 0.5, 0.9] | [0.3, 0.7]  // Multiple snaps
  initialSnap: 0.25 | 0.3  // Open small (peek)
  velocityThreshold?: number  // Default: 0.9 px/ms
  distanceThreshold?: number  // Default: 0.18 (18% viewport)
  
  // Close behavior (FLEXIBLE)
  allowDragDismiss: true  // Fast swipe at min snap
  onBackPressure?: () => 'collapse' | 'close' | 'cancel'
  collapseTarget?: 'lower' | 'min' | number
  
  // Gesture routing (REQUIRED for canvas/map)
  gestureRouter: (ctx: GestureContext) => 'sheet' | 'canvas'
  
  // URL binding (OPTIONAL)
  routeBinding?: {
    get: () => number | null
    set: (snap: number) => void  // Debounced internally
  }
  
  // Footer (OPTIONAL)
  footer?: ReactNode  // Contextual actions, not Done/Cancel
  
  // Device (AUTO-RESOLVED)
  // Desktop → DockedPanel/Sidebar
  // Mobile → SheetPanel
  // Tablet → Follows policy.tabletMode
}
```

#### **Runtime Validation**

```typescript
// Throws in dev if violated
if (role === 'dialog' || modal === true) {
  throw new Error(
    'SheetPanel is non-modal. Use SheetDialog for modal interactions.\n' +
    'Change: role="complementary" or use <SheetDialog> instead'
  )
}

if (!gestureRouter && hasInteractiveBackground) {
  console.warn(
    'SheetPanel with interactive background should provide gestureRouter.\n' +
    'See: docs/ds/SHEET_POLICY.md#gesture-routing'
  )
}
```

#### **Telemetry Events**

```typescript
// Emitted automatically
{
  event: 'sheet_panel_open',
  initialSnap: 0.25,
  device: 'mobile',
  routeBound: true
}

{
  event: 'sheet_snap_change',
  from: 0.25,
  to: 0.5,
  velocity: 0.45,
  trigger: 'gesture' | 'button' | 'route'
}

{
  event: 'gesture_routed',
  owner: 'sheet' | 'canvas',
  snap: 0.5,
  angle: 15,
  velocity: 0.8
}
```

---

## 🖥️ Device-Aware Resolution

### Policy Configuration

```typescript
interface DevicePolicy {
  // Breakpoints
  mobileBreakpoint: number  // Default: 768px
  tabletBreakpoint: number  // Default: 1024px
  
  // Tablet behavior
  tabletMode: 'desktop' | 'mobile' | 'auto'
  // - 'desktop': Use popovers/dialogs
  // - 'mobile': Use sheets
  // - 'auto': Touch device → mobile, else → desktop
  
  // Field picker overrides
  preferDialogOnTablet: boolean  // Default: false
  forceMobileDialogOnTablet: boolean  // Default: false
  
  // Panel behavior
  panelOnDesktop: 'docked' | 'floating' | 'none'
  // - 'docked': Sidebar/DockedPanel
  // - 'floating': Keep SheetPanel (rare)
  // - 'none': Hide panel on desktop
}
```

### Resolution Algorithm

```typescript
type OverlayKind = 'field' | 'dialog' | 'panel'
type ResolvedMode = 'popover' | 'sheet' | 'dialog' | 'docked-panel'

function resolveOverlayMode({
  kind,
  userMode,  // 'auto' | 'popover' | 'sheet' | 'dialog'
  viewport,  // { width, height, isTouch }
  policy,
}: ResolveInput): ResolvedMode {
  // User override takes precedence
  if (userMode && userMode !== 'auto') {
    return userMode
  }
  
  // Detect device category
  const isMobile = viewport.width <= policy.mobileBreakpoint || viewport.isTouch
  const isTablet = !isMobile && viewport.width <= policy.tabletBreakpoint
  
  // Resolve by kind
  if (kind === 'dialog') {
    if (isMobile) return 'sheet'
    if (isTablet && policy.forceMobileDialogOnTablet) return 'sheet'
    return 'dialog'
  }
  
  if (kind === 'field') {
    if (isMobile) return 'sheet'
    if (isTablet) {
      return policy.tabletMode === 'mobile' ? 'sheet' : 'popover'
    }
    return 'popover'
  }
  
  if (kind === 'panel') {
    if (isMobile) return 'sheet'
    return policy.panelOnDesktop === 'docked' ? 'docked-panel' : 'sheet'
  }
  
  // Fallback
  return isMobile ? 'sheet' : 'popover'
}
```

### Usage

```typescript
// In DS provider
<DSProvider devicePolicy={{
  mobileBreakpoint: 768,
  tabletMode: 'auto',
  panelOnDesktop: 'docked'
}}>
  <App />
</DSProvider>

// Automatic resolution
<ResponsiveOverlay kind="field" mode="auto">
  {/* Desktop → Popover, Mobile → Sheet */}
</ResponsiveOverlay>
```

---

## 🧭 Gesture Routing

### Default Router (Angle-Aware)

```typescript
const defaultGestureRouter: GestureRouter = (ctx) => {
  // Calculate drag angle
  const angle = Math.abs(Math.atan2(ctx.dragDeltaY, ctx.dragDeltaX)) * (180 / Math.PI)
  
  // Low snap: sheet always owns
  if (ctx.currentSnap < 0.5) return 'sheet'
  
  // High snap: if content scrolled, sheet owns
  if (!ctx.isAtTop) return 'sheet'
  
  // Near-horizontal drag (< 30°): canvas owns
  if (angle < 30) return 'canvas'
  
  // Vertical drag at top: sheet owns
  return 'sheet'
}
```

### Map Adapter Helper

```typescript
// For Mapbox, Leaflet, Google Maps
function createMapGestureAdapter(map: MapboxMap): GestureRouter {
  return (ctx) => {
    // Handoff conditions
    const shouldHandoffToMap = 
      ctx.currentSnap >= 0.5 &&  // High snap
      ctx.isAtTop &&              // Content at top
      Math.abs(ctx.dragDeltaY) < 12  // Small vertical movement
    
    if (shouldHandoffToMap) {
      // Enable map panning
      map.dragPan.enable()
      return 'canvas'
    } else {
      // Disable map panning
      map.dragPan.disable()
      return 'sheet'
    }
  }
}

// Usage
const mapGestureRouter = createMapGestureAdapter(mapRef.current)

<SheetPanel gestureRouter={mapGestureRouter}>
  <RideOptions />
</SheetPanel>
```

### Canvas Adapter Helper

```typescript
function createCanvasGestureAdapter(
  isDrawing: boolean,
  canvas: HTMLCanvasElement
): GestureRouter {
  return (ctx) => {
    // Drawing mode: canvas owns everything
    if (isDrawing) {
      canvas.style.pointerEvents = 'auto'
      return 'canvas'
    }
    
    // Not drawing: use default routing
    canvas.style.pointerEvents = 'none'
    return defaultGestureRouter(ctx)
  }
}
```

---

## 🔗 URL Binding & Back Semantics

### Debounced Route Updates

```typescript
const ROUTE_UPDATE_DEBOUNCE = 150  // ms

function useRouteBinding(binding: SheetPanelRouteBinding) {
  const updateRoute = useMemo(
    () => debounce((snap: number) => {
      binding.set(snap)
    }, ROUTE_UPDATE_DEBOUNCE),
    [binding]
  )
  
  return {
    readSnap: binding.get,
    writeSnap: updateRoute,
  }
}
```

### Back Pressure Handling

```typescript
function useSheetBackHandler(options: BackHandlerOptions) {
  useEffect(() => {
    const handler = (e: KeyboardEvent | PopStateEvent) => {
      if (e instanceof KeyboardEvent && e.key !== 'Escape') return
      
      // Ask consumer what to do
      const action = options.onBackPressure?.() ?? 'collapse'
      
      if (action === 'cancel') {
        // User prevented close (e.g., unsaved changes)
        e.preventDefault()
        return
      }
      
      if (action === 'collapse') {
        // If not at minimum, collapse
        if (options.currentSnap > options.snaps[0]) {
          options.setSnap(/* next lower snap */)
          return
        }
        
        // Already at minimum → close
        options.onClose()
        return
      }
      
      if (action === 'close') {
        // Close immediately
        options.onClose()
        return
      }
    }
    
    window.addEventListener('popstate', handler as any)
    window.addEventListener('keydown', handler as any)
    
    return () => {
      window.removeEventListener('popstate', handler as any)
      window.removeEventListener('keydown', handler as any)
    }
  }, [options])
}
```

---

## 🎚️ Z-Index Lanes

### Token Definition

```typescript
export const Z_INDEX_LANES = {
  panel: 700,   // Non-modal panels
  modal: 900,   // Modal dialogs
  toast: 1100,  // Toasts, notifications
} as const

export type ZIndexLane = keyof typeof Z_INDEX_LANES
```

### Usage in Components

```typescript
// SheetPanel
style={{
  zIndex: Z_INDEX_LANES.panel
}}

// SheetDialog
style={{
  zIndex: Z_INDEX_LANES.modal
}}
```

### Runtime Enforcement

```typescript
// Validate no manual z-index
if (style?.zIndex) {
  throw new Error(
    'Do not set z-index manually.\n' +
    'Z-index is managed by the DS via lanes.\n' +
    'Remove: style={{ zIndex: ... }}'
  )
}
```

---

## 🧪 Test Matrix

### SheetDialog Tests

```typescript
describe('SheetDialog', () => {
  test('opens at 70-90% by default', () => {
    render(<SheetDialog open snap={[0.7]} />)
    expect(sheet).toHaveStyle({ height: '70%' })
  })
  
  test('focus trapped within dialog', () => {
    render(<SheetDialog open />)
    const firstInput = screen.getByRole('textbox')
    const lastButton = screen.getByRole('button', { name: 'Done' })
    
    firstInput.focus()
    userEvent.tab({ shift: true })
    expect(lastButton).toHaveFocus()
  })
  
  test('body scroll locked when open', () => {
    render(<SheetDialog open />)
    expect(document.body).toHaveStyle({ overflow: 'hidden' })
  })
  
  test('background is inert', () => {
    render(<SheetDialog open />)
    const appRoot = document.querySelector('#app')
    expect(appRoot).toHaveAttribute('inert')
  })
  
  test('throws if missing aria-label', () => {
    expect(() => {
      render(<SheetDialog open role="dialog" />)
    }).toThrow('requires ariaLabel or ariaLabelledBy')
  })
  
  test('emits telemetry on close', () => {
    const onTelemetry = jest.fn()
    render(<SheetDialog open onClose={close} onTelemetry={onTelemetry} />)
    
    userEvent.click(screen.getByRole('button', { name: 'Done' }))
    
    expect(onTelemetry).toHaveBeenCalledWith({
      event: 'overlay_close',
      reason: 'done',
      durationMs: expect.any(Number)
    })
  })
})
```

### SheetPanel Tests

```typescript
describe('SheetPanel', () => {
  test('opens at 25-40% by default', () => {
    render(<SheetPanel open snap={[0.25, 0.5, 0.9]} />)
    expect(sheet).toHaveStyle({ height: '25%' })
  })
  
  test('background remains interactive', () => {
    render(<SheetPanel open />)
    expect(document.body).not.toHaveStyle({ overflow: 'hidden' })
    expect(document.querySelector('#app')).not.toHaveAttribute('inert')
  })
  
  test('gesture routing: vertical at low snap → sheet', () => {
    const router = jest.fn(() => 'sheet')
    render(<SheetPanel open gestureRouter={router} />)
    
    fireEvent.pointerDown(sheet, { clientY: 100 })
    fireEvent.pointerMove(sheet, { clientY: 150 })
    
    expect(router).toHaveBeenCalledWith(
      expect.objectContaining({
        currentSnap: 0.25,
        dragDeltaY: 50
      })
    )
  })
  
  test('URL binding updates on snap change', async () => {
    const set = jest.fn()
    render(<SheetPanel open routeBinding={{ get: () => 0.5, set }} />)
    
    // Change snap
    userEvent.click(screen.getByRole('button', { name: '90%' }))
    
    // Wait for debounce
    await waitFor(() => {
      expect(set).toHaveBeenCalledWith(0.9)
    }, { timeout: 200 })
  })
  
  test('back button collapses then closes', () => {
    const onClose = jest.fn()
    render(<SheetPanel open snap={[0.25, 0.5]} onClose={onClose} />)
    
    // At 50%, back → collapse to 25%
    fireEvent(window, new PopStateEvent('popstate'))
    expect(sheet).toHaveStyle({ height: '25%' })
    
    // At 25%, back → close
    fireEvent(window, new PopStateEvent('popstate'))
    expect(onClose).toHaveBeenCalled()
  })
  
  test('velocity threshold: fast swipe closes', () => {
    const onClose = jest.fn()
    render(<SheetPanel open snap={[0.25]} velocityThreshold={0.9} onClose={onClose} />)
    
    // Fast swipe down
    fireEvent.pointerDown(sheet, { clientY: 100 })
    fireEvent.pointerMove(sheet, { clientY: 300 })  // 200px
    fireEvent.pointerUp(sheet, { timeStamp: 150 })  // 150ms = 1.33 px/ms
    
    expect(onClose).toHaveBeenCalled()
  })
})
```

---

## 📊 Telemetry Schema

### Event Types

```typescript
type OverlayTelemetryEvent =
  | { event: 'overlay_open_start', kind: OverlayKind, mode: ResolvedMode, device: string }
  | { event: 'overlay_open_end', kind: OverlayKind, durationMs: number }
  | { event: 'overlay_close', reason: CloseReason, durationMs: number, interactionCount: number }
  | { event: 'sheet_snap_change', from: number, to: number, velocity: number, trigger: string }
  | { event: 'gesture_routed', owner: 'sheet' | 'canvas', angle: number, snap: number }
  | { event: 'route_binding', type: 'get' | 'set', deltaMs: number }

type CloseReason = 
  | 'done'
  | 'cancel'
  | 'esc'
  | 'tap_backdrop'
  | 'gesture'
  | 'back_button'
  | 'programmatic'
```

### Usage

```typescript
// In component
function SheetDialog(props: SheetDialogProps) {
  const startTime = useRef(Date.now())
  const interactions = useRef(0)
  
  const handleClose = (reason: CloseReason) => {
    const durationMs = Date.now() - startTime.current
    
    props.onTelemetry?.({
      event: 'overlay_close',
      reason,
      durationMs,
      interactionCount: interactions.current
    })
    
    props.onClose()
  }
  
  return (/* ... */)
}
```

---

## ✅ Enforcement Checklist

### Compile Time (TypeScript)
- [ ] Required props enforced (ariaLabel, role)
- [ ] Type-safe gesture router signature
- [ ] Snap arrays validated (at least 1 snap)

### Dev Time (Runtime Contracts)
- [ ] Missing a11y → throws
- [ ] Manual z-index → throws
- [ ] Wrong role for sheet type → throws
- [ ] Missing gestureRouter with interactive bg → warns

### Build Time (ESLint)
- [ ] No `position: fixed` in recipes
- [ ] No `z-index` in recipes
- [ ] No `overscroll-behavior` in recipes
- [ ] No `touch-action` in recipes

### CI Time (Tests)
- [ ] Snap behavior tested
- [ ] Gesture routing tested
- [ ] URL binding tested
- [ ] Back button semantics tested
- [ ] A11y validation tested
- [ ] Telemetry events tested

---

## 🚀 Implementation Roadmap

### Sprint 1 (2 days)
- [ ] Create SheetDialog and SheetPanel exports
- [ ] Implement device resolver
- [ ] Add runtime contracts (throws/warns)
- [ ] Wire z-index lanes
- [ ] Update barrel exports

### Sprint 2 (3 days)
- [ ] Implement gesture routing with angle detection
- [ ] Create map/canvas adapter helpers
- [ ] Add URL binding with debounce
- [ ] Implement useSheetBackHandler hook
- [ ] Add telemetry hooks

### Sprint 3 (2 days)
- [ ] Write comprehensive test suite
- [ ] Add Playwright E2E tests
- [ ] Create Storybook demos for both types
- [ ] Document in SHEET_INTERACTION_PATTERNS.md

### Sprint 4 (2 days)
- [ ] Add reduced motion support
- [ ] Implement keyboard hints
- [ ] Add dev mode overlay debugger
- [ ] Performance profiling

---

## 📚 Related Documentation

- **Interaction Patterns**: `/docs/ds/SHEET_INTERACTION_PATTERNS.md`
- **Best Practices**: `/docs/ds/when-to-use-sheet-dialog-vs-panel.md`
- **API Reference**: `/docs/ds/OVERLAY_SYSTEM_MAP.md`
- **Testing Guide**: `/packages/ds/tests/README.md`

---

## 🎯 Success Criteria

**The system is complete when**:
- ✅ Teams cannot ship modal panels (runtime throws)
- ✅ Teams cannot ship non-modal dialogs (runtime throws)
- ✅ Desktop automatically uses popovers for fields
- ✅ Mobile automatically uses sheets for everything
- ✅ Gesture routing prevents accidental closes
- ✅ URL binding works with browser back button
- ✅ All interactions are instrumented
- ✅ Tests prevent regressions
- ✅ Docs explain when to use which type

**Bottom line**: The DS enforces the right behavior by default. Teams get the correct UX without thinking about it.
