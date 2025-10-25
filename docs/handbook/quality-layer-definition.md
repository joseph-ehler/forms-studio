# Quality Layer Definition

**What it is, what it guarantees, how to use it**

---

## One-Sentence Definition

**Quality Layer = Flowbite wrapped with required contracts + auto-wiring + diagnostics, so teams build 10x faster while meeting production-grade quality by default.**

---

## Core Responsibilities

### 1. A11y Contracts (Non-Negotiable)
- Enforce required props (`ariaLabel` on dialogs) at runtime in dev
- Wire correct ARIA relationships (`aria-describedby`, `aria-invalid`)
- Provide keyboard behavior (Escape, Tab, return focus)

### 2. API Normalization
- Surface semantic variants (`primary | ghost | danger`)
- Provide consistent signatures (`open, onClose`) across overlays
- No inline theme objects - named variants only

### 3. Auto-Wiring & State Helpers
- Export hooks (`useModal`, `useDrawer`) that return `{ props }`
- Context where needed (modal content focus ref)
- 2-3 line usage at call site

### 4. Diagnostics & Observability
- Add `data-component`, `data-state` attributes
- Optional debug logs behind `debug` prop or `window.__DS_DEBUG`
- Provide `debugX()` helpers for complex primitives

### 5. Token-Driven Look
- Map Tailwind utilities to `--ds-*` CSS variables
- Named theme variants instead of inline objects
- Single source of truth for visual decisions

---

## Acceptance Checklist

Before shipping any wrapper:

**Contracts**:
- [ ] Required props validated in dev (throws if missing)
- [ ] ARIA relationships auto-wired
- [ ] Keyboard behavior complete (Escape, Tab, focus return)

**API**:
- [ ] Hook exists if component has common state pattern
- [ ] Hook returns `{ props }` for spreading
- [ ] Semantic variants (not ad-hoc classes)

**Diagnostics**:
- [ ] `data-component` attribute present
- [ ] `data-state` attribute reflects state
- [ ] `debug` prop or `window.__DS_DEBUG` enables logs

**Tokens**:
- [ ] Uses `--ds-*` tokens (no magic numbers)
- [ ] Tailwind classes map to tokens
- [ ] Named variants (not inline theme)

**Documentation**:
- [ ] JSDoc with `@example`
- [ ] Props documented with descriptions
- [ ] Storybook story exists

**Tests**:
- [ ] Unit test for complex logic
- [ ] Axe a11y test passes
- [ ] E2E smoke test if interactive

---

## Anti-Patterns (Reject These)

### ❌ Inline Theme Objects
```tsx
// BAD: Repeated everywhere
<Dropdown theme={{
  arrowIcon: "hidden",
  floating: { base: "w-40" }
}}>
```

**Fix**: Create named variant in wrapper.

### ❌ Manual State Management
```tsx
// BAD: Boilerplate everywhere
const [show, setShow] = useState(false);
<Button onClick={() => setShow(true)}>
<Modal show={show} onClose={() => setShow(false)}>
```

**Fix**: Use `useModal()` hook.

### ❌ Direct Flowbite Imports
```tsx
// BAD: Bypasses quality layer
import { Modal } from 'flowbite-react';
```

**Fix**: Import from `@intstudio/ds/fb`.

### ❌ Hardcoded Spacing/Colors
```tsx
// BAD: Magic values
<div style={{ marginTop: '16px', color: '#3B82F6' }}>
```

**Fix**: Use Tailwind classes mapped to tokens.

### ❌ Copy-Paste Dropdowns
```tsx
// BAD: Repeated 10x
<Dropdown inline label={...}>
  <Dropdown.Item>Show</Dropdown.Item>
  <Dropdown.Item>Edit</Dropdown.Item>
  <Dropdown.Item>Delete</Dropdown.Item>
</Dropdown>
```

**Fix**: Use `<TableRowActions>` composition.

### ❌ Manual ARIA Wiring
```tsx
// BAD: Easy to forget
<label htmlFor="name">Name</label>
<input
  id="name"
  aria-invalid={!!error}
  aria-describedby={error ? 'name-error' : undefined}
/>
{error && <span id="name-error">{error}</span>}
```

**Fix**: Use `<Field>` wrapper.

---

## Quality Bar

### What "Quality Layer" Guarantees

**100% A11y**: All wrappers enforce required ARIA & keyboard behavior.

**DX**: Usage typically ≤ 3 lines for common patterns (thanks to hooks).

**Consistency**: Variants & sizes are semantic, not class soup.

**Observability**: All wrappers expose `data-*` state; debug helpers exist.

**Tokens**: Visuals come from `--ds-*` tokens; style changes propagate.

**Testability**: Components are easy to test (stable selectors, minimal state).

---

## Success Metrics

Track these over time:

| Metric | Target | Measurement |
|--------|--------|-------------|
| Boilerplate reduction | 60-90% | Lines of code comparison |
| A11y pass rate | 100% | Axe scans in CI |
| Import hygiene | 0 violations | ESLint errors |
| Debuggability | 100% | All wrappers have data-* |
| Bundle sanity | Under budget | size-limit checks |

---

## Examples

### Modal

**Before**:
```tsx
const [showModal, setShowModal] = useState(false);

<button onClick={() => setShowModal(true)}>Create</button>
<Modal show={showModal} onClose={() => setShowModal(false)}>
  <Modal.Body>Content</Modal.Body>
</Modal>
```

**After**:
```tsx
const modal = useModal();

<Button onClick={modal.onOpen}>Create</Button>
<Modal ariaLabel="Create" {...modal.props}>
  <Modal.Body>Content</Modal.Body>
</Modal>
```

### Field

**Before**:
```tsx
<label htmlFor="name">Name *</label>
<input
  id="name"
  aria-invalid={!!errors.name}
  aria-describedby={errors.name ? 'name-error' : 'name-hint'}
/>
<span id="name-hint">Enter your full name</span>
{errors.name && <span id="name-error" role="alert">{errors.name}</span>}
```

**After**:
```tsx
<Field
  label="Name"
  id="name"
  required
  hint="Enter your full name"
  error={errors.name}
>
  <Input id="name" />
</Field>
```

### Button

**Before**:
```tsx
<Button
  color="blue"
  theme={{ /* 20 lines */ }}
  disabled={loading}
>
  {loading ? <Spinner /> : 'Save'}
</Button>
```

**After**:
```tsx
<Button variant="primary" loading loadingText="Saving...">
  Save
</Button>
```

---

## Where It Lives

```
packages/ds/src/
  fb/              # Flowbite wrappers
    Modal.tsx
    Field.tsx
    Button.tsx
    Drawer.tsx
    Input.tsx
    ...
  hooks/           # State helpers
    useModal.ts
    useDrawer.ts
    usePagination.ts
    ...
  routes/          # Bespoke (keep as-is)
    FullScreenRoute.tsx
    FlowScaffold.tsx
    RoutePanel.tsx
```

**Public API** (sealed):
```json
{
  "exports": {
    "./fb": "./dist/fb/index.js",
    "./hooks": "./dist/hooks/index.js",
    "./routes": "./dist/routes/index.js"
  }
}
```

---

## When to Use vs. Keep Bespoke

### Use Quality Layer When:
- ✅ Standard UI component (button, input, modal, table)
- ✅ Flowbite handles 80% of behavior
- ✅ Speed matters more than pixel-perfect control
- ✅ Want active maintenance

### Keep Bespoke When:
- ✅ Unique to your domain (FlowScaffold, RoutePanel)
- ✅ Core differentiator (overlay policy, sub-flows)
- ✅ Flowbite can't do it (complex state machines)
- ✅ Already production-ready

---

## Motto

**"Flowbite for breadth, your layer for contracts."**

Quality is baked in, not branded. The namespace signals it.
