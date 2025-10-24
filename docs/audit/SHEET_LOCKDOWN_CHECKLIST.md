# Sheet System: Lockdown Checklist

**Goal**: Make misuse impossible  
**Timeline**: 2 weeks (10 days)

---

## ✅ Merge Blockers (Must Be Green)

- [ ] Runtime contracts wired (throws/warns in dev)
- [ ] ESLint rules enabled + fail CI
- [ ] DSProvider integrated (single authority)
- [ ] Playwright suite passing (mobile + desktop)
- [ ] No manual z-index (audit complete)

---

## Week 1: Enforcement

### Day 1-2: Runtime Contracts

**SheetDialog validation** (packages/ds/src/components/overlay/SheetDialog.tsx):
```typescript
if (!ariaLabel && !ariaLabelledBy) throw Error('Missing accessibility label')
if (ariaModal === false) throw Error('Cannot disable aria-modal')
if (allowDragToDismiss) console.warn('Drag-to-dismiss disabled')
if (style?.zIndex) throw Error('Do not set z-index manually')
```

**SheetPanel validation** (packages/ds/src/components/overlay/SheetPanel.tsx):
```typescript
if (modal || trapFocus || backdrop) throw Error('Panels are non-modal')
if (!ariaLabel && !ariaLabelledBy) throw Error('Missing accessibility label')
if (style?.zIndex) throw Error('Do not set z-index manually')
```

### Day 3: ESLint Rules

Create 3 rules in eslint-plugin-ds:
- [ ] `no-sheet-dialog-drag-dismiss` - Blocks allowDragDismiss
- [ ] `panel-no-modal-props` - Blocks modal/trapFocus/backdrop on SheetPanel
- [ ] `no-manual-overlay-zindex` - Blocks style={{ zIndex }} on any overlay

Enable in .eslintrc.ds.json, fail CI on violations.

### Day 4: DSProvider

- [ ] Create DSProvider (single source of truth)
- [ ] Wire resolveMode() hook
- [ ] Update ResponsiveOverlay to use resolver
- [ ] Remove duplicate viewport checks from recipes

### Day 5: Desktop Fallbacks

- [ ] Create DockedPanel component (fixed panel for desktop)
- [ ] Add `--ds-popover-max-inline: 560px` token
- [ ] Apply max-width to OverlayPicker

### Day 6: Rename & Codemod

- [ ] Rename OverlaySheet.tsx → SheetDialog.tsx
- [ ] Update imports
- [ ] Add deprecation shim
- [ ] Create codemod script
- [ ] Update Storybook

---

## Week 2: Validation

### Day 7-9: Playwright Tests

**SheetDialog (10 tests)**:
- [ ] Opens 70-90% height
- [ ] Body scroll locked
- [ ] Background inert
- [ ] Focus trapped (Tab cycles)
- [ ] Esc closes + returns focus
- [ ] Done commits changes
- [ ] Cancel reverts changes
- [ ] Throws if missing aria-label (dev mode)
- [ ] Warns if drag-to-dismiss enabled
- [ ] Virtual keyboard: header/footer sticky

**SheetPanel (10 tests)**:
- [ ] Opens 25-40% height
- [ ] Background interactive
- [ ] No scroll lock
- [ ] Gesture: vertical at low snap → sheet
- [ ] Gesture: horizontal at high snap → canvas
- [ ] Back button: collapse → close
- [ ] URL binding updates (debounced)
- [ ] Velocity threshold works
- [ ] Throws if modal props set
- [ ] Safe area padding applied

**Device Resolver (5 tests)**:
- [ ] Mobile field → sheet
- [ ] Desktop field → popover
- [ ] Desktop panel → docked-panel
- [ ] Tablet auto mode → touch detection
- [ ] User override works

### Day 10: Storybook + Debug

- [ ] Map + Panel demo with gestureRouter
- [ ] Mapbox adapter example
- [ ] Canvas adapter example
- [ ] Debug overlay (?debugOverlay=1)
- [ ] Device simulator controls

### Day 11: Telemetry

```typescript
type TelemetryEvent =
  | { event: 'overlay_open', kind, device, snap }
  | { event: 'overlay_close', reason, durationMs, interactions }
  | { event: 'sheet_snap_change', from, to, velocity }
  | { event: 'gesture_routed', owner, angle }
```

- [ ] Add onTelemetry prop
- [ ] Wire events in components
- [ ] Log to console in dev

### Day 12: Edge Cases + Docs

**Edge Cases**:
- [ ] Focus return on nested stacks (OverlayManager)
- [ ] Keyboard + safe areas (visualViewport)
- [ ] SSR/hydration (guard portal mounts)
- [ ] RTL support (logical properties)
- [ ] Reduced motion in JS (not just CSS)

**Documentation**:
- [ ] Migration guide
- [ ] Video demos
- [ ] API reference complete
- [ ] Decision tree diagram

---

## 📊 Target Metrics

- **Dialog latency**: open → commit < 1.5s
- **Panel snap dwell**: track 25% vs 50% vs 90%
- **Gesture routing**: % sheet vs canvas at different snaps
- **Desktop fallback**: popover vs docked usage
- **Back behavior**: collapse vs close ratio

---

## 🎯 Success = "Impossible to Misuse"

✅ **Runtime**: Throws on wrong patterns (dev)  
✅ **Build**: ESLint catches violations  
✅ **Design**: Resolver enforces desktop fallbacks  
✅ **Quality**: Tests prevent regressions  
✅ **Observable**: Telemetry tracks real usage  

**Result**: Composable interaction substrate that scales from field pickers to app shells.
