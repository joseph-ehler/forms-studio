# Overlay/Sheet Audit Harness - Complete Guide

**Purpose**: Prevent overlay/sheet regressions through automated + manual validation  
**Status**: ✅ Production ready  
**Maintainer**: Design System team

---

## 🎯 Quick Start

### Run All Checks
```bash
# Full audit (recommended before PR)
pnpm audit:overlay

# Individual checks
pnpm test:overlay-acceptance    # Playwright E2E
pnpm audit:responsibility       # Boundary check
pnpm lint                       # Token enforcement (existing)
```

### Console Diagnostics (Development)
```js
// In browser DevTools while overlay is open:
// Copy/paste: scripts/debug/diagnose-overlay-sheet.js

// Expected output:
// ✅ Sheet fixed: true
// ✅ Scroll locked: true
// ✅ Search paddingLeft: 40px
// ✅ Option minHeight: 48px
// ✅ No critical bugs detected
```

---

## 📋 Acceptance Criteria (Go/No-Go)

All four criteria must pass before merging overlay/sheet changes:

### A. Sheet Fixed to Bottom (Mobile)
**Test**: Playwright `overlay-acceptance.spec.ts` → "A. Sheet positioning"

- [ ] Bottom edge stays anchored to viewport at all snap points
- [ ] Dragging adjusts height but never detaches bottom edge
- [ ] Keyboard appearance lifts content, preserves anchoring

**Implementation**:
```tsx
// OverlaySheet.tsx uses:
position: fixed;
insetInline: 0;
insetBlockEnd: 0;  // ← anchors to bottom
translate: 0 var(--sheet-offset, 0px);  // ← NOT transform
```

**Diagnostic**:
```js
const sheet = document.querySelector('[role="dialog"]')
const styles = window.getComputedStyle(sheet)
console.log({
  position: styles.position,        // 'fixed'
  insetBlockEnd: styles.insetBlockEnd,  // '0px'
  translate: styles.translate,      // '0 0px' (when not dragging)
})
```

---

### B. Scroll Lock (No Background Scroll)
**Test**: Playwright `overlay-acceptance.spec.ts` → "B. Scroll lock"

- [ ] html/body overflow=hidden when overlay open
- [ ] Only ONE system applies lock (no double-lock)
- [ ] Lock released on close

**Implementation**:
```tsx
// OverlayPickerCore.tsx owns scroll lock
useScrollLock(isOpen)  // ← single source
```

**Diagnostic**:
```js
const html = document.documentElement
console.log({
  overflow: html.style.overflow,  // 'hidden' when open
})
```

---

### C. Search Input Adornments (No Overlap)
**Test**: Playwright `overlay-acceptance.spec.ts` → "C. Search input adornments"

- [ ] Search icon never overlaps input text
- [ ] Text never touches left edge
- [ ] Works in RTL mode

**Implementation**:
```tsx
// PickerSearch.tsx uses DS pattern:
<div className="ds-input-wrap">
  <span className="ds-input-adorn-left"><SearchIcon/></span>
  <input className="ds-input ds-input--pad-left ds-input--pad-right" />
  <button className="ds-input-adorn-right ds-input-adorn-clickable">×</button>
</div>
```

**Diagnostic**:
```js
const input = document.querySelector('input[type="search"]')
const paddingLeft = window.getComputedStyle(input).paddingLeft
console.log({ paddingLeft })  // '40px' minimum
```

---

### D. List Item Touch Targets (WCAG AAA)
**Test**: Playwright `overlay-acceptance.spec.ts` → "D. List item sizing"

- [ ] Minimum item height >= 48px
- [ ] 8px list padding
- [ ] Hover scrim works in light/dark themes
- [ ] Selected + hover layering correct

**Implementation**:
```tsx
// PickerOption.tsx:
minBlockSize: '48px',  // WCAG AAA
padding: 'var(--ds-space-3) var(--ds-space-4)',  // 12px 16px

// Hover scrim for theme-safe layering:
<span className="ds-hover-scrim" style={{
  position: 'absolute',
  inset: 0,
  opacity: isHovered ? 1 : 0,
  background: selected ? 'rgba(0,0,0,0.1)' : 'var(--ds-color-primary-bg-subtle)',
}} />
```

**Diagnostic**:
```js
const options = document.querySelectorAll('[role="option"]')
options.forEach((opt, i) => {
  const height = opt.getBoundingClientRect().height
  console.log(`Option ${i}: ${height}px`)  // >= 48px
})
```

---

## 🛠️ Audit Tools

### 1. Playwright E2E Tests
**Location**: `packages/ds/tests/overlay-acceptance.spec.ts`  
**Run**: `pnpm test:overlay-acceptance`

**What it validates**:
- Sheet positioning under viewport resize
- Scroll lock apply/release
- Input adornment spacing
- Touch target sizing
- Keyboard flow (Tab loop, Esc, focus return)
- Gesture handling (swipe to close)

**Example**:
```ts
test('sheet bottom edge stays anchored', async ({ page }) => {
  await page.goto('/demo/select-field')
  await page.click('[data-testid="select-trigger"]')
  
  const sheet = page.locator('[role="dialog"]')
  const box = await sheet.boundingClientRect()
  
  expect(box.bottom).toBe(page.viewportSize()!.height)
})
```

---

### 2. Responsibility Boundary Check
**Location**: `scripts/audit/responsibility-check.sh`  
**Run**: `pnpm audit:responsibility`

**What it enforces**:
| Concern | DS Owns | Forms Own |
|---------|---------|-----------|
| Positioning (fixed/absolute/z-index) | ✅ | ❌ |
| Portals (createPortal) | ✅ | ❌ |
| Gestures (swipe, snap) | ✅ | ❌ |
| Scroll lock | ✅ | ❌ |
| Focus trap | ✅ | ❌ |
| Search/filter logic | ❌ | ✅ |
| Data plumbing | ❌ | ✅ |
| Telemetry | ❌ | ✅ |

**Violations detected**:
```bash
❌ Found forbidden pattern in Forms: position: fixed
packages/core/src/fields/SelectField.tsx:42
  style={{ position: 'fixed', ... }}

Rule: Forms should use DS primitives (OverlaySheet/OverlayPicker)
```

---

### 3. Recipe Contract Validation
**Location**: `packages/ds/tests/utils/recipe-contracts.ts`  
**Usage**: Import into Jest tests

**Example**:
```ts
import { assertRecipeContract, assertTouchTargets } from './utils/recipe-contracts'

test('SelectField meets overlay contract', () => {
  const { container } = render(<SelectField {...props} />)
  fireEvent.click(screen.getByRole('button'))  // Open overlay
  
  // Validate ARIA structure
  assertRecipeContract(container, {
    type: 'select',
    searchEnabled: true,
    expectedOptions: 5,
  })
  
  // Validate touch targets
  assertTouchTargets(container, 48)  // WCAG AAA
})
```

**What it validates**:
- Required ARIA roles (dialog/listbox, option)
- Accessible names (aria-label/labelledby)
- Multiselect attributes (aria-multiselectable)
- No DS responsibility leakage (inline positioning)
- Touch target compliance (min 48px)

---

### 4. Console Diagnostics
**Location**: `scripts/debug/diagnose-overlay-sheet.js`  
**Usage**: Copy/paste into browser DevTools while overlay open

**Output Example**:
```
🔍 OVERLAY/SHEET COMPREHENSIVE DIAGNOSTIC

✅ Sheet found
📍 SHEET POSITIONING:
  position: fixed
  insetBlockEnd: 0px
  translate: 0 0px
  
🔒 SCROLL LOCK STATE:
  html.overflow: hidden
  
🔍 SEARCH INPUT ANALYSIS:
  paddingLeft: 40px ✅
  
📋 LIST ITEMS:
  Found 12 items
  Min height: 48px ✅
  
⚠️ POTENTIAL BUGS: None detected ✅
```

---

## 🔄 CI/CD Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/overlay-audit.yml
name: Overlay Audit

on: [pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      # 1. Responsibility check
      - name: Check DS vs Forms boundaries
        run: pnpm audit:responsibility
      
      # 2. Token enforcement
      - name: Lint (token usage)
        run: pnpm lint
      
      # 3. E2E acceptance tests
      - name: Playwright overlay tests
        run: pnpm test:overlay-acceptance
      
      # 4. Recipe contract tests
      - name: Unit tests with contracts
        run: pnpm test --grep="contract"
      
      # 5. Axe a11y
      - name: Accessibility tests
        run: pnpm test:a11y
```

---

## 📊 Responsibility Matrix (Reference)

### DS Owns (Design System)
✅ Surface primitives (OverlaySheet, OverlayPicker)  
✅ Portal rendering to document.body  
✅ Z-index + backdrop management  
✅ Gestures (snap points, velocity, swipe-to-close)  
✅ Collision detection (flip/shift/resize)  
✅ Scroll lock (useScrollLock)  
✅ Focus trap (useFocusTrap)  
✅ Design tokens (radius, shadow, spacing)  
✅ Input primitives (.ds-input, adornments)  
✅ ARIA defaults (role, aria-modal)

### Forms Own (Recipes)
✅ Search/filter logic  
✅ Keyboard navigation (arrow keys, type-ahead)  
✅ Data plumbing (OptionSource, Controller)  
✅ Telemetry/analytics  
✅ Selection state management  
✅ Recipe-specific ARIA (multiselectable, etc.)

### Shared (With Clear Separation)
➖ **SearchInput wrapper**: DS provides primitive, Forms use it  
➖ **Keyboard hooks**: DS may offer generic, Forms implement specifics  
➖ **ARIA roles**: DS provides defaults, Forms ensure correctness

---

## 🔧 Common Violations & Fixes

### ❌ Violation: Inline positioning in Forms
```tsx
// BAD: Forms handling positioning directly
<div style={{ position: 'fixed', bottom: 0, zIndex: 9999 }}>
  {content}
</div>
```

```tsx
// GOOD: Use DS primitives
<OverlaySheet open={open} onClose={onClose}>
  {content}
</OverlaySheet>
```

---

### ❌ Violation: Duplicate scroll lock
```tsx
// BAD: Both OverlaySheet and OverlayPickerCore locking
useEffect(() => {
  document.body.style.overflow = 'hidden'  // ← duplicate!
}, [open])
```

```tsx
// GOOD: Single source in OverlayPickerCore
// OverlaySheet does NOT lock, only prevents touchmove
```

---

### ❌ Violation: Inline adornment styles
```tsx
// BAD: Manual icon positioning
<input style={{ paddingLeft: '40px' }} />
<div style={{ position: 'absolute', left: '12px' }}>
  <SearchIcon />
</div>
```

```tsx
// GOOD: DS adornment pattern
<div className="ds-input-wrap">
  <span className="ds-input-adorn-left"><SearchIcon /></span>
  <input className="ds-input ds-input--pad-left" />
</div>
```

---

### ❌ Violation: Small touch targets
```tsx
// BAD: Below WCAG minimum
<button style={{ minHeight: '40px', padding: '8px' }}>
  Option
</button>
```

```tsx
// GOOD: WCAG AAA compliant
<div
  role="option"
  style={{
    minBlockSize: '48px',
    padding: 'var(--ds-space-3) var(--ds-space-4)',
  }}
>
  Option
</div>
```

---

## 🧪 Testing Strategy

### 3-Pass Audit Process

**Pass 1: Static Scan** (pre-commit)
```bash
# Token enforcement
pnpm lint

# Boundary check
pnpm audit:responsibility
```

**Pass 2: Runtime Inspection** (development)
```bash
# 1. Start dev server
pnpm dev

# 2. Open SelectField/DateField/etc.
# 3. Paste diagnostic script in console
# 4. Verify all ✅ checks pass
```

**Pass 3: E2E Flows** (CI)
```bash
# Playwright full suite
pnpm test:overlay-acceptance

# Recipe contracts
pnpm test --grep="contract"

# Axe a11y
pnpm test:a11y
```

---

## 📈 Success Metrics

### Before Audit Harness
- ❌ 14 bugs identified in initial audit
- ❌ 4 critical (blocking UX)
- ❌ No automated detection
- ❌ Manual QA required for every change

### After Audit Harness
- ✅ 0 critical bugs (all fixed)
- ✅ Automated detection in CI
- ✅ <5 min to run full audit
- ✅ Prevents regressions automatically

### Quality Bar
- **Sheet positioning**: 100% reliable (insetBlockEnd + translate)
- **Scroll lock**: Single source, no conflicts
- **Touch targets**: 100% WCAG AAA (48px minimum)
- **Adornments**: 0 overlap issues (DS pattern)

---

## 🚀 Next Steps

### Phase 2 Enhancements (Medium Priority)
- [ ] Virtualization for lists > 100 items
- [ ] Loading states for async search
- [ ] Live region announcements ("37 results")
- [ ] Max-width constraint for ultra-wide popovers
- [ ] Enhanced keyboard navigation (arrow keys)

### Phase 3 Systematization
- [ ] Extract shared hooks (useOverlayKeys, useVirtualization)
- [ ] Create PICKER_TOKENS (spacing, sizing, timing)
- [ ] Auto-generate recipe scaffolds from specs
- [ ] Performance budgets (FCP, LCP for overlay open)

---

## 📚 Related Documentation

- **Bug Audit**: `/docs/debug/OVERLAY_SHEET_BUG_AUDIT.md`
- **Fix Log**: `/docs/debug/OVERLAY_SHEET_FIXES_2025-10-24.md`
- **Recipe System**: `/docs/ds/OVERLAY_RECIPE_SYSTEM.md`
- **Integration Guide**: `/docs/integration/OVERLAY_QUALITY_HOOKS.md`

---

## 💡 Pro Tips

1. **Run diagnostics first**: Observe before fixing
2. **One source of truth**: Centralize positioning/scroll/focus
3. **Use tokens**: No magic numbers
4. **Test in CI**: Catch regressions early
5. **Document violations**: Help future maintainers

---

**Questions?** See `/docs/debug/OVERLAY_SHEET_BUG_AUDIT.md` or ask in #design-system
