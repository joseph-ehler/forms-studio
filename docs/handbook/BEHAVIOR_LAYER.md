# Behavior Layer (Layer 4) - Who Owns What

**TL;DR:** The Behavior Layer owns "when X, do Y" rules. Shells call policies; policies manage system effects.

---

## Core Principles

1. **Stateless & Pure** - Functions take inputs, return outputs or cleanup
2. **SSR-Safe** - Check `typeof window !== 'undefined'`
3. **Cleanup Required** - All effects return cleanup functions
4. **Single Owner** - One module owns each system effect

---

## Ownership Map

### Overlay Policy (`overlay-policy.ts`)

**Owns:**
- Overlay stack (single array of active overlays)
- Scrim (only topmost **blocking** overlay gets scrim)
- Body scroll lock (refcounted)
- Underlay inert (coordinated with scrim)
- Z-index assignment (from tokens)

**Does NOT Own:**
- Portal rendering (that's primitives)
- Layout/positioning (that's primitives)
- Slots (that's shells)

**API:**
```typescript
// Register overlay in stack
pushOverlay({ 
  id: string, 
  blocking: boolean, 
  onClose?: () => void 
}): OverlayHandle

// Unregister overlay
OverlayHandle.close(): void

// Manual controls (rarely used directly)
setUnderlayInert(active: boolean): void
setBodyScrollLock(active: boolean): void
```

**Rules:**
- Only **topmost blocking** overlay gets scrim + lock + inert
- Non-blocking overlays (Popover, Tooltip) never claim these
- Stack operations are O(1) (Map by id + array for order)
- Body lock uses refcount (multiple overlays can stack)

---

### Focus Policy (`focus-policy.ts`)

**Owns:**
- Focus trap (Tab loop within container)
- Focus capture (store activeElement on open)
- Focus return (restore on close)
- ESC handling (optional)

**Does NOT Own:**
- Which element to focus first (shell decides)
- Focusable selector (uses standard, shells can override)

**API:**
```typescript
// Trap focus within root
trapFocus(
  root: HTMLElement, 
  { onEscape?: () => void }
): () => void

// Capture current focus
captureFocus(): HTMLElement | null

// Restore focus to element
restoreFocus(element: HTMLElement | null): void
```

**Rules:**
- Shells call `trapFocus()` in useEffect, store cleanup
- On unmount, cleanup is called → focus returns automatically
- Tab loops within container (wraps at edges)
- Shift+Tab reverses direction

---

### Layout Policy (`layout-policy.ts`)

**Owns:**
- Responsive layout decisions (persistent vs off-canvas)
- Push vs overlay decisions
- Visibility rules based on mode

**Does NOT Own:**
- Actual CSS (shells apply the decisions)
- Breakpoint detection (that's Environment layer)

**API:**
```typescript
// Determine if should overlay
shouldOverlay({ 
  mode: ShellMode, 
  overlayOn?: ShellMode[] 
}): boolean

// Resolve nav behavior
resolveNavBehavior(
  mode: ShellMode, 
  collapsible: boolean
): 'persistent' | 'off-canvas'

// Resolve panels behavior
resolvePanelsBehavior(
  mode: ShellMode, 
  overlayOn?: ShellMode[]
): 'inline' | 'overlay'

// Resolve layout attrs + vars
resolveLayout(
  mode: ShellMode, 
  variants: Record<string, any>
): { 
  attrs: Record<string, string>; 
  vars: Record<string, string> 
}
```

**Rules:**
- Pure functions (no side effects)
- Return data structures for shells to apply
- Shells call in useMemo/useEffect

---

### Variant Resolver (`variant-resolver.ts`)

**Owns:**
- Props → data-* attributes conversion
- Props → --shell-* CSS vars publishing
- Type-aware value handling (boolean/number/string)
- CamelCase → kebab-case conversion

**Does NOT Own:**
- Variant validation (TypeScript does that)
- CSS that reads the attrs/vars (shells do that)

**API:**
```typescript
// Apply contract to element
applyContract(
  element: HTMLElement,
  { 
    attrs: Record<string, string | boolean>,
    vars: Record<string, string | number>
  }
): void

// Batch operations (single RAF tick)
publishShellVars(
  root: HTMLElement, 
  vars: Record<string, string | number>
): void

publishShellAttrs(
  root: HTMLElement, 
  attrs: Record<string, string | boolean>
): void
```

**Rules:**
- Never sets inline styles (only data-* + CSS vars)
- Boolean attrs: `true` → `data-x="true"`, `false` → remove attr
- Number vars: auto-append `px` (e.g., `280` → `280px`)
- String vars: pass through as-is
- Batch writes in single RAF tick (avoid thrashing)

---

## System Effects Coordination

### Scrim + Lock + Inert (Single Owner Rule)

**Only ONE overlay can own these at a time:**

```typescript
// Correct: Only topmost blocking overlay
if (isTopmost && blocking) {
  setUnderlayInert(true);
  setBodyScrollLock(true);
  // Scrim rendered
}

// Wrong: Every overlay tries to own
// ❌ Multiple scrims
// ❌ Multiple locks
// ❌ Conflicting inert states
```

**Implementation:**
- Overlay policy maintains stack
- On push: check if new overlay becomes topmost
- On pop: check if next overlay should take over
- Shells just call `pushOverlay()` and cleanup

---

### Focus Trap (Topmost Only)

**Only topmost modal should trap focus:**

```typescript
// In shell useEffect
const cleanup = isTopmost && blocking 
  ? trapFocus(ref.current, { onEscape: onClose })
  : () => {};

return cleanup;
```

**Why:** Nested modals can exist (rare), but only outermost traps

---

### Z-Index (Token-Driven)

**Never hardcode z-index. Always use tokens:**

```typescript
// Tokens define strata
--z-scrim: 50
--z-shell: 51
--z-popover: 60
--z-toast: 70
--z-command: 80

// Behavior layer assigns based on type
blocking overlays → --z-shell
popovers/menus → --z-popover
toasts → --z-toast
palette → --z-command
```

---

## SSR Safety

**All behavior functions check window:**

```typescript
export function setBodyScrollLock(active: boolean): void {
  if (typeof window === 'undefined') return;
  
  // Safe to access document
  if (active) {
    document.documentElement.style.overflow = 'hidden';
  } else {
    document.documentElement.style.overflow = '';
  }
}
```

**Pattern:**
1. Guard at function entry
2. Return no-op cleanup if SSR
3. Shells don't need to know

---

## Cleanup Contracts

**All effect functions return cleanup:**

```typescript
// Pattern: Effect returns cleanup
const cleanup = trapFocus(root, { onEscape });

// In useEffect
useEffect(() => {
  const cleanup = trapFocus(modalRef.current);
  return cleanup; // React calls on unmount
}, [open]);
```

**Why:**
- Prevents memory leaks
- Ensures system effects are unwound
- Makes testing easier (explicit cleanup)

---

## Performance

### Batch Operations

**Don't thrash style on every prop change:**

```typescript
// Bad: Multiple style writes
root.style.setProperty('--shell-nav-w', '280px');
root.style.setProperty('--shell-panels-w', '360px');
root.style.setProperty('--shell-header-h', '56px');

// Good: Batch in single RAF
requestAnimationFrame(() => {
  root.style.setProperty('--shell-nav-w', '280px');
  root.style.setProperty('--shell-panels-w', '360px');
  root.style.setProperty('--shell-header-h', '56px');
});
```

### O(1) Stack Operations

**Use Map + Array for fast lookups:**

```typescript
const overlayStack = new Map<string, OverlayEntry>();
const overlayOrder: string[] = [];

// Push: O(1)
function push(id: string, entry: OverlayEntry) {
  overlayStack.set(id, entry);
  overlayOrder.push(id);
}

// Pop: O(1)
function pop(id: string) {
  overlayStack.delete(id);
  const idx = overlayOrder.indexOf(id);
  if (idx !== -1) overlayOrder.splice(idx, 1);
}

// Topmost: O(1)
function getTopmost() {
  const id = overlayOrder[overlayOrder.length - 1];
  return overlayStack.get(id);
}
```

### Refcounted Lock

**Multiple overlays can stack; lock persists until all closed:**

```typescript
let lockCount = 0;

function setBodyScrollLock(active: boolean) {
  if (active) {
    if (lockCount === 0) {
      document.documentElement.style.overflow = 'hidden';
    }
    lockCount++;
  } else {
    lockCount--;
    if (lockCount === 0) {
      document.documentElement.style.overflow = '';
    }
  }
}
```

---

## Anti-Patterns (DON'T)

❌ **Shells managing overlay stack themselves**
```typescript
// Wrong: Shell tries to coordinate
const [stackPosition, setStackPosition] = useState(0);
```

✅ **Use behavior layer:**
```typescript
const handle = pushOverlay({ id: shellId, blocking: true });
return () => handle.close();
```

---

❌ **Multiple scroll locks**
```typescript
// Wrong: Every shell locks independently
useEffect(() => {
  document.body.style.overflow = 'hidden';
  return () => { document.body.style.overflow = ''; };
}, [open]);
```

✅ **Use refcounted lock:**
```typescript
useEffect(() => {
  if (open) return setBodyScrollLock(true);
}, [open]);
```

---

❌ **Inline styles for variants**
```typescript
// Wrong: Shell sets inline styles
<div style={{ width: navWidth }} />
```

✅ **Use CSS vars:**
```typescript
publishShellVars(root, { navWidth: 280 });
// CSS: width: var(--shell-nav-w);
```

---

## Testing Behavior Layer

### Unit Tests (Vitest)

```typescript
describe('overlay-policy', () => {
  it('only topmost blocking overlay gets scrim', () => {
    const h1 = pushOverlay({ id: '1', blocking: true });
    expect(getTopmostBlockingId()).toBe('1');
    
    const h2 = pushOverlay({ id: '2', blocking: false });
    expect(getTopmostBlockingId()).toBe('1'); // Still 1
    
    const h3 = pushOverlay({ id: '3', blocking: true });
    expect(getTopmostBlockingId()).toBe('3'); // Now 3
    
    h3.close();
    expect(getTopmostBlockingId()).toBe('1'); // Back to 1
  });
});
```

### Integration Tests (Playwright)

```typescript
test('single scrim with multiple overlays', async ({ page }) => {
  await page.goto('/');
  
  // Open drawer
  await page.click('[data-test="open-drawer"]');
  await expect(page.locator('[data-shell-scrim]')).toBeVisible();
  
  // Open modal (blocks drawer)
  await page.click('[data-test="open-modal"]');
  
  // Should still be only ONE scrim
  await expect(page.locator('[data-shell-scrim]')).toHaveCount(1);
  
  // Body should be locked
  const overflow = await page.evaluate(() => 
    document.documentElement.style.overflow
  );
  expect(overflow).toBe('hidden');
});
```

---

## Documentation Cross-Reference

- **Primitives** - See `PRIMITIVES_VS_SHELLS.md`
- **Shells** - See `SHELL_SYSTEM.md`
- **Contracts** - See `CONTRACTS.md` (CSS vars + data attrs)
- **Testing** - See `TESTING.md` (setShellEnvironment)

---

## Decision Log

| Decision | Rationale |
|----------|-----------|
| Single overlay owner | Prevents double backdrops, conflicting locks |
| Refcounted lock | Allows stacking without premature unlock |
| Pure functions | Testable, predictable, no hidden state |
| Cleanup contracts | Prevents leaks, explicit lifecycle |
| Token z-index | Single source of truth, no magic numbers |

---

**The Behavior Layer is the glue. It coordinates system effects so shells don't have to.**
