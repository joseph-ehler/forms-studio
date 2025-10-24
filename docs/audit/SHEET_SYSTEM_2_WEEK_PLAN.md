# Sheet System: 2-Week Lockdown Plan

**Goal**: Transform 75% foundation → 100% production-grade, enforced system  
**Timeline**: 2 weeks  
**Focus**: Guardrails first, polish second

---

## Week 1: Guardrails & Wiring ⚠️

**Goal**: Make misuse impossible via runtime + compile-time enforcement

### Day 1-2: Runtime Contracts (CRITICAL)

**Wire validation into components**:

```typescript
// SheetDialog.tsx
useEffect(() => {
  // A11y validation
  if (!ariaLabel && !ariaLabelledBy) {
    throw new Error(
      '[SheetDialog] Missing aria-label/aria-labelledby.\n' +
      'Modal dialogs must have accessible names.\n' +
      'Add: ariaLabel="Select color"\n' +
      'See: docs/ds/SHEET_POLICY.md#sheetdialog-contracts'
    )
  }
  
  // No drag-to-dismiss
  if (allowDragToDismiss) {
    console.warn(
      '[SheetDialog] Drag-to-dismiss disabled for modal dialogs.\n' +
      'Use explicit Done/Cancel buttons or two-snap collapse.\n' +
      'See: docs/ds/SHEET_POLICY.md#close-behavior'
    )
  }
  
  // Verify modality
  if (!trapFocus || !scrollLock) {
    console.error(
      '[SheetDialog] Modal properties are required.\n' +
      'trapFocus and scrollLock are automatically enabled.\n' +
      'Do not override these props.'
    )
  }
}, [])

// SheetPanel.tsx
useEffect(() => {
  // No modal props
  if (modal || trapFocus || backdrop) {
    throw new Error(
      '[SheetPanel] Panels are non-modal.\n' +
      'Remove: modal/trapFocus/backdrop props.\n' +
      'Use <SheetDialog> for modal tasks.\n' +
      'See: docs/ds/SHEET_POLICY.md#sheetpanel-contracts'
    )
  }
  
  // Require gestureRouter for interactive backgrounds
  if (hasInteractiveBackground && !gestureRouter) {
    console.warn(
      '[SheetPanel] Interactive background detected.\n' +
      'Consider providing gestureRouter for better UX.\n' +
      'See: docs/ds/gesture-adapters.ts for pre-built adapters'
    )
  }
}, [])
```

**Deliverable**: Components throw/warn on misuse in dev mode

---

### Day 3: ESLint Rules (CRITICAL)

**Create rules package**:

```javascript
// eslint-plugin-ds/rules/no-sheet-dialog-drag-dismiss.js
module.exports = {
  meta: {
    type: 'error',
    docs: {
      description: 'Disallow drag-to-dismiss on SheetDialog',
      category: 'Best Practices',
    },
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        if (node.name.name !== 'SheetDialog') return
        
        const dragProp = node.attributes.find(
          attr => attr.name?.name === 'allowDragDismiss'
        )
        
        if (dragProp) {
          context.report({
            node: dragProp,
            message: 'SheetDialog should not allow drag-to-dismiss. Use explicit Done/Cancel buttons.',
          })
        }
      }
    }
  }
}

// eslint-plugin-ds/rules/panel-no-modal-props.js
module.exports = {
  meta: {
    type: 'error',
    docs: {
      description: 'Disallow modal props on SheetPanel',
      category: 'Best Practices',
    },
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        if (node.name.name !== 'SheetPanel') return
        
        const modalProps = ['modal', 'trapFocus', 'backdrop', 'scrollLock']
        
        node.attributes.forEach(attr => {
          if (modalProps.includes(attr.name?.name)) {
            context.report({
              node: attr,
              message: `SheetPanel is non-modal. Remove '${attr.name.name}' prop. Use <SheetDialog> for modal tasks.`,
            })
          }
        })
      }
    }
  }
}

// eslint-plugin-ds/rules/no-manual-overlay-zindex.js
module.exports = {
  meta: {
    type: 'error',
    docs: {
      description: 'Disallow manual z-index on overlay components',
      category: 'Best Practices',
    },
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        const overlayComponents = ['SheetDialog', 'SheetPanel', 'Popover', 'Dialog']
        if (!overlayComponents.includes(node.name.name)) return
        
        const styleProp = node.attributes.find(attr => attr.name?.name === 'style')
        if (!styleProp) return
        
        // Check if style has zIndex
        const hasZIndex = styleProp.value?.expression?.properties?.some(
          prop => prop.key?.name === 'zIndex'
        )
        
        if (hasZIndex) {
          context.report({
            node: styleProp,
            message: 'Do not set z-index manually on overlays. Z-index is managed by DS lanes.',
          })
        }
      }
    }
  }
}
```

**Deliverable**: 3 new ESLint rules prevent misuse at build time

---

### Day 4-5: Device Resolver Integration

**Create DSProvider**:

```typescript
// DSProvider.tsx
import React, { createContext, useContext, useMemo } from 'react'
import { resolveOverlayMode, getViewportInfo, DEFAULT_DEVICE_POLICY } from './device-resolver'
import type { DevicePolicy, OverlayKind, UserMode, ResolvedMode } from './device-resolver'

interface DSContextValue {
  resolveMode: (kind: OverlayKind, userMode?: UserMode) => ResolvedMode
  devicePolicy: DevicePolicy
  viewport: ViewportInfo
}

const DSContext = createContext<DSContextValue | null>(null)

export function useDS(): DSContextValue {
  const ctx = useContext(DSContext)
  if (!ctx) {
    throw new Error('useDS must be used within DSProvider')
  }
  return ctx
}

export const DSProvider: React.FC<{
  devicePolicy?: Partial<DevicePolicy>
  children: React.ReactNode
}> = ({ devicePolicy: userPolicy, children }) => {
  const [viewport, setViewport] = React.useState(getViewportInfo)
  
  // Merge with defaults
  const policy = useMemo(
    () => ({ ...DEFAULT_DEVICE_POLICY, ...userPolicy }),
    [userPolicy]
  )
  
  // Update viewport on resize
  React.useEffect(() => {
    const handleResize = () => setViewport(getViewportInfo())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  // Resolver function
  const resolveMode = React.useCallback(
    (kind: OverlayKind, userMode: UserMode = 'auto') => {
      return resolveOverlayMode({ kind, userMode, viewport, policy })
    },
    [viewport, policy]
  )
  
  const value = useMemo(
    () => ({ resolveMode, devicePolicy: policy, viewport }),
    [resolveMode, policy, viewport]
  )
  
  return <DSContext.Provider value={value}>{children}</DSContext.Provider>
}
```

**Wire into ResponsiveOverlay**:

```typescript
// ResponsiveOverlay.tsx
export const ResponsiveOverlay: React.FC<Props> = ({
  kind,
  mode: userMode = 'auto',
  ...props
}) => {
  const { resolveMode } = useDS()
  const resolvedMode = resolveMode(kind, userMode)
  
  // Render appropriate component
  switch (resolvedMode) {
    case 'popover':
      return <OverlayPicker {...props} />
    
    case 'sheet':
      return kind === 'panel' 
        ? <SheetPanel {...props} />
        : <SheetDialog {...props} />
    
    case 'dialog':
      return <Dialog {...props} />
    
    case 'docked-panel':
      return <DockedPanel {...props} />
    
    default:
      return null
  }
}
```

**Deliverable**: Automatic device-aware resolution, configurable via DSProvider

---

### Day 6: Rename & Codemod

**Rename OverlaySheet → SheetDialog**:

```bash
# 1. Rename file
mv packages/ds/src/components/overlay/OverlaySheet.tsx \
   packages/ds/src/components/overlay/SheetDialog.tsx

# 2. Update internal imports
# 3. Add deprecation warning to old export
```

**Create codemod**:

```javascript
// scripts/codemods/overlay-sheet-to-dialog.mjs
export default function transformer(file, api) {
  const j = api.jscodeshift
  const root = j(file.source)
  
  // Replace import
  root.find(j.ImportDeclaration).forEach(path => {
    if (path.value.source.value.includes('/overlay')) {
      path.value.specifiers.forEach(spec => {
        if (spec.imported.name === 'OverlaySheet') {
          spec.imported.name = 'SheetDialog'
          spec.local.name = 'SheetDialog'
        }
      })
    }
  })
  
  // Replace JSX
  root.find(j.JSXIdentifier, { name: 'OverlaySheet' })
    .forEach(path => {
      path.value.name = 'SheetDialog'
    })
  
  return root.toSource()
}
```

**Deliverable**: Clear API naming, migration path for existing code

---

## Week 2: Tests & Demos 🧪

**Goal**: Prevent regressions, showcase real patterns

### Day 7-9: Playwright Test Suite

**SheetDialog tests**:

```typescript
// tests/sheet-dialog.spec.ts
test('SheetDialog: opens at 70-90%, modal behavior', async ({ page }) => {
  await page.goto('/demo/select-field')
  
  const trigger = page.locator('[data-testid="color-trigger"]')
  const dialog = page.locator('[role="dialog"]')
  
  // Open dialog
  await trigger.click()
  await expect(dialog).toBeVisible()
  
  // Verify height (70-90%)
  const height = await dialog.evaluate(el => {
    const vh = window.innerHeight
    const elHeight = el.getBoundingClientRect().height
    return elHeight / vh
  })
  expect(height).toBeGreaterThanOrEqual(0.7)
  expect(height).toBeLessThanOrEqual(0.9)
  
  // Verify focus trapped
  await page.keyboard.press('Tab')
  const focused = await page.evaluate(() => document.activeElement?.getAttribute('role'))
  expect(focused).toMatch(/button|option|textbox/)
  
  // Verify body locked
  const bodyOverflow = await page.evaluate(() => 
    window.getComputedStyle(document.body).overflow
  )
  expect(bodyOverflow).toBe('hidden')
  
  // Verify background inert
  const appInert = await page.evaluate(() => 
    document.querySelector('#app')?.hasAttribute('inert')
  )
  expect(appInert).toBe(true)
  
  // Close with Done
  await page.click('[data-testid="done-button"]')
  await expect(dialog).toBeHidden()
  
  // Verify focus returned
  await expect(trigger).toBeFocused()
})

test('SheetDialog: Esc key closes and reverts', async ({ page }) => {
  await page.goto('/demo/multi-select')
  
  await page.click('[data-testid="trigger"]')
  
  // Select items
  await page.click('[data-value="item1"]')
  await page.click('[data-value="item2"]')
  
  // Press Esc (should revert)
  await page.keyboard.press('Escape')
  
  // Verify closed
  const dialog = page.locator('[role="dialog"]')
  await expect(dialog).toBeHidden()
  
  // Verify values not committed
  const selectedCount = await page.locator('[data-testid="selected-count"]').textContent()
  expect(selectedCount).toBe('0')
})
```

**SheetPanel tests**:

```typescript
// tests/sheet-panel.spec.ts
test('SheetPanel: opens at 25-40%, non-modal', async ({ page }) => {
  await page.goto('/demo/map-panel')
  
  const panel = page.locator('[data-testid="sheet-panel"]')
  
  // Verify initial height
  const height = await panel.evaluate(el => {
    const vh = window.innerHeight
    return el.getBoundingClientRect().height / vh
  })
  expect(height).toBeGreaterThanOrEqual(0.25)
  expect(height).toBeLessThanOrEqual(0.4)
  
  // Verify not modal
  const bodyOverflow = await page.evaluate(() => 
    window.getComputedStyle(document.body).overflow
  )
  expect(bodyOverflow).not.toBe('hidden')
  
  // Verify background interactive
  const map = page.locator('[data-testid="map"]')
  await map.click()  // Should work
  
  // Verify no backdrop
  const backdrop = page.locator('[data-backdrop]')
  await expect(backdrop).not.toBeVisible()
})

test('SheetPanel: gesture routing works', async ({ page, isMobile }) => {
  if (!isMobile) test.skip()
  
  await page.goto('/demo/map-panel')
  
  const panel = page.locator('[data-testid="sheet-panel"]')
  const map = page.locator('[data-testid="map"]')
  
  // At low snap: vertical drag → sheet moves
  await panel.hover()
  await page.mouse.down()
  await page.mouse.move(0, 100)  // Vertical
  await page.mouse.up()
  
  // Verify sheet moved
  const newSnap = await panel.getAttribute('data-snap')
  expect(parseFloat(newSnap)).not.toBe(0.25)
  
  // At high snap + horizontal drag → map pans
  // (Expand first)
  await panel.click('[data-testid="expand"]')
  
  await map.hover()
  await page.mouse.down()
  await page.mouse.move(100, 10)  // Horizontal
  await page.mouse.up()
  
  // Verify map panned
  const mapPanned = await map.getAttribute('data-panned')
  expect(mapPanned).toBe('true')
})

test('SheetPanel: back button collapses then closes', async ({ page }) => {
  await page.goto('/demo/map-panel?snap=0.5')
  
  const panel = page.locator('[data-testid="sheet-panel"]')
  
  // First back: collapse
  await page.goBack()
  await expect(panel).toHaveAttribute('data-snap', /0\.25/)
  
  // Second back: close
  await page.goBack()
  await expect(panel).toBeHidden()
})
```

**Deliverable**: Comprehensive E2E test coverage

---

### Day 10-11: Storybook Demos & DockedPanel

**Map + Panel demo**:

```typescript
// Map with Gesture Router + Adapter
export const MapWithRideOptions: Story = {
  render: () => {
    const mapRef = useRef<mapboxgl.Map>()
    const gestureRouter = createMapboxGestureAdapter(() => mapRef.current)
    
    return (
      <DSProvider devicePolicy={{ panelOnDesktop: 'docked' }}>
        <MapContainer ref={mapRef} />
        
        <SheetPanel
          snap={[0.25, 0.5, 0.9]}
          gestureRouter={gestureRouter}
          routeBinding={urlBinding}
          ariaLabel="Ride options"
        >
          <RideOptionsList />
        </SheetPanel>
      </DSProvider>
    )
  }
}
```

**DockedPanel component**:

```typescript
// DockedPanel.tsx (desktop fallback)
export const DockedPanel: React.FC<Props> = ({
  open,
  onClose,
  ariaLabel,
  children,
  width = 420,
}) => {
  if (!open) return null
  
  return createPortal(
    <aside
      role="complementary"
      aria-label={ariaLabel}
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        height: '100vh',
        width: `${width}px`,
        backgroundColor: 'var(--ds-color-surface-base)',
        boxShadow: 'var(--ds-shadow-overlay-lg)',
        zIndex: Z_INDEX_LANES.panel,
        overflowY: 'auto',
      }}
    >
      {children}
    </aside>,
    document.body
  )
}
```

**Deliverable**: Working demos + desktop fallback

---

### Day 12: Telemetry & Debug Overlay

**Add telemetry hooks**:

```typescript
// SheetDialog.tsx
const startTime = useRef(Date.now())
const interactions = useRef(0)

const emitTelemetry = (event: TelemetryEvent) => {
  onTelemetry?.({
    ...event,
    kind: 'dialog',
    mode: 'sheet',
    device: viewport.width <= 768 ? 'mobile' : 'desktop',
  })
}

const handleClose = (reason: CloseReason) => {
  emitTelemetry({
    event: 'overlay_close',
    reason,
    durationMs: Date.now() - startTime.current,
    interactionCount: interactions.current,
  })
  onClose()
}
```

**Debug overlay** (`?debugOverlay=1`):

```typescript
// DebugOverlay.tsx
export const DebugOverlay: React.FC<{
  snap: number
  velocity: number
  gestureOwner: 'sheet' | 'canvas'
  isAtTop: boolean
}> = ({ snap, velocity, gestureOwner, isAtTop }) => {
  if (!new URLSearchParams(location.search).has('debugOverlay')) {
    return null
  }
  
  return (
    <div style={{
      position: 'fixed',
      top: 16,
      right: 16,
      padding: 12,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      borderRadius: 8,
      fontSize: 12,
      fontFamily: 'monospace',
      zIndex: 9999,
    }}>
      <div>Snap: {snap.toFixed(2)}</div>
      <div>Velocity: {velocity.toFixed(2)} px/ms</div>
      <div>Owner: {gestureOwner}</div>
      <div>At Top: {isAtTop ? 'Yes' : 'No'}</div>
    </div>
  )
}
```

**Deliverable**: Observable behavior, debuggable in dev

---

## 📊 Success Criteria

### Week 1 Complete When:
- [ ] Runtime contracts throw on misuse
- [ ] ESLint rules prevent compile-time errors
- [ ] DSProvider wired and working
- [ ] Device resolution automatic
- [ ] SheetDialog name finalized
- [ ] Codemod available

### Week 2 Complete When:
- [ ] 20+ Playwright tests passing
- [ ] Storybook demos showcase patterns
- [ ] DockedPanel works on desktop
- [ ] Telemetry events firing
- [ ] Debug overlay functional

### System Complete When:
- [ ] Teams cannot ship modal panels (throws)
- [ ] Teams cannot ship non-modal dialogs (throws)
- [ ] Desktop automatically uses correct modes
- [ ] All interactions tested
- [ ] Metrics observable
- [ ] Documentation complete

---

## 🎯 Key Metrics to Track

### During Implementation
- Runtime contract violations (should be 0 after week 1)
- ESLint errors caught (track before/after)
- Test coverage (target: >90% for core paths)

### Post-Launch
- SheetDialog open → commit latency (target: <1.5s)
- SheetPanel snap distribution (where users spend time)
- Gesture routing: sheet vs canvas (% split)
- Desktop mode resolution accuracy
- Back button behavior (collapse vs close ratio)

---

## 💡 Priority Order

**P0 (Must Have)**:
1. Runtime contracts (Day 1-2)
2. ESLint rules (Day 3)
3. Core tests (Day 7-9)

**P1 (Should Have)**:
4. Device resolver (Day 4-5)
5. Rename + codemod (Day 6)
6. Demos (Day 10-11)

**P2 (Nice to Have)**:
7. Telemetry (Day 12)
8. Debug overlay (Day 12)
9. DockedPanel (Day 10)

---

## 🚀 Bottom Line

**End of Week 1**: System is **enforced** (can't be misused)  
**End of Week 2**: System is **proven** (tested, demo'd, observable)

**The Result**: Not just components, but a **composable interaction substrate** that scales from simple field pickers to complex app-shell UIs—with guardrails that make the right patterns automatic and the wrong patterns impossible.

**Timeline**: 10 working days = **Production-grade sheet system** 🎯
