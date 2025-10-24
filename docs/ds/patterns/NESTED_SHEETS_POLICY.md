# Nested Sheets Policy & Implementation

**Status**: Production policy  
**Enforcement**: Runtime contracts + ESLint + Playwright

---

## 🧭 Policy: When to Allow Nested Sheets

### ✅ **Allowed**

**SheetDialog → SheetDialog** (modal subtasks)
- **Use case**: Field picker opens "Create new tag" sub-dialog
- **Max depth**: 2 (topmost must be SheetDialog)
- **Why**: Modal-over-modal for subtask flows

**SheetPanel → SheetDialog** (non-modal → modal)
- **Use case**: Map panel open, then user opens booking confirmation dialog
- **Why**: Modal task over contextual panel

---

### ❌ **Discouraged / Block**

**SheetDialog → SheetPanel** (modal → non-modal)
- **Reason**: Don't de-modalize; use sub-dialog instead
- **Enforcement**: Runtime throw (dev mode)

**SheetPanel → SheetPanel** (stacked panels)
- **Reason**: Cognitive overload; prefer replace or inline route
- **Alternative**: Route within single panel content

**Depth > 2 sheets**
- **Reason**: Cognitive load skyrockets
- **Alternative**: Push to full-screen route or sub-flow navigator
- **Enforcement**: Runtime warn + prevent

---

## 🎯 Default Rules (Enforced)

1. **Max stack depth**: 2 (topmost must be SheetDialog)
2. **Underlying sheets**: Remain inert + locked via ref-counting
3. **Back/Esc behavior**:
   - **SheetPanel**: collapse → close → navigate
   - **SheetDialog**: close topmost; return focus to previous

---

## ✨ UX Pattern: "Card Stack" Micro-Interactions

### **Visual Treatment (Underlying Sheet)**

When new SheetDialog opens on top:

```css
/* Underlying sheet at depth=0 */
.ds-sheet--underlay[data-sheet-depth="0"] {
  transform: translateY(-16px) scale(0.98); /* Move UP to peek above nested sheet */
  box-shadow: var(--ds-shadow-overlay-md);
  transition: transform 180ms var(--ds-motion-ease);
}

@media (prefers-reduced-motion: reduce) {
  .ds-sheet--underlay[data-sheet-depth="0"] {
    transform: translateY(-16px); /* Move UP, remove scale */
  }
}
```

**Effects**:
- **Translate up**: -16px (~1rem) (tokenized: `--ds-sheet-stack-translate`)
  - Underlying sheet moves UP so top edge peeks above nested sheet
  - Shows ~1rem of context at all times
  - Always maintain visual awareness of how deep you are
- **Scale**: 0.98 (optional; respects reduced motion)
- **Darken backdrop**: +10–15% intensity per depth
- **Elevation**: Increase shadow token per depth

**Top sheet**:
- Drag handle gains brighter emphasis
- Parallax on collapse: underlying sheet nudges 2–4px
- Peek-on-drag: Light reveal of underlying sheet (stays inert)

---

### **Gestures**

**Top Sheet (depth > 0)**:
- **Swipe down** at min-snap + velocity > threshold → close top (pop)
- **Else**: Collapse to previous snap
- **Horizontal gestures**: Disabled (prevents accidental transitions)

**Underlying Sheet**:
- **Always inert**: No scroll, no interaction
- **Parallax**: Moves at 10–15% of top-sheet motion (visual cue only)

**Edge Cases**:
- If content scrollable, only allow sheet drag when at top (gesture router handles)

---

### **A11y & ARIA**

**Dev-time validation**:
- Stacked dialogs MUST have unique titles/labels
- Runtime throw if duplicate

**Announcements**:
```tsx
// Polite live region
<div role="status" aria-live="polite">
  Subsheet opened: {title}
</div>
```

**Focus Management**:
- Focus trap ONLY on topmost
- Underlying remains `aria-hidden` + `inert` (ref-counted)

---

## 🧩 System Architecture

### **1. Depth-Aware Context**

```tsx
// OverlayManager.tsx
export interface OverlayStackContext {
  depth: number;            // 0-based
  topId: string | null;
  push: (config: OverlayConfig) => void;
  pop: (id: string) => void;
  zIndexFromDepth: (depth: number) => number;
}

export function useOverlayStack() {
  const ctx = useContext(OverlayStackCtx);
  return {
    depth: ctx.depth,
    isTopmost: ctx.topId === myId,
    levelZ: ctx.zIndexFromDepth(ctx.depth),
  };
}
```

### **2. Sheet Usage**

```tsx
// SheetDialog.tsx
const { depth, isTopmost, levelZ } = useOverlayStack();

<div
  data-sheet-depth={depth}
  style={{ zIndex: levelZ }}
  className={cn(
    'ds-sheet',
    'ds-sheet-dialog',
    depth > 0 && 'ds-sheet--underlay'
  )}
>
  {/* ... */}
</div>
```

### **3. CSS Tokens**

```css
:root {
  --ds-sheet-stack-translate: 6px;
  --ds-sheet-underlay-scale: 0.98;
  --ds-backdrop-level-1: rgba(0, 0, 0, 0.45);
  --ds-backdrop-level-2: rgba(0, 0, 0, 0.55);
  --ds-shadow-overlay-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
  --ds-shadow-overlay-md: 0 4px 16px rgba(0, 0, 0, 0.15);
  --ds-shadow-overlay-lg: 0 8px 24px rgba(0, 0, 0, 0.2);
}
```

### **4. Backdrop Intensity**

```css
.ds-backdrop[data-depth="0"] { 
  background: rgba(0, 0, 0, 0.45); 
}

.ds-backdrop[data-depth="1"] { 
  background: rgba(0, 0, 0, 0.55); 
}

.ds-backdrop[data-depth="2"] { 
  background: rgba(0, 0, 0, 0.65); 
}
```

---

## 🛡️ Policy Matrix

| Parent | Child | Allowed | Why / Alternate |
|--------|-------|---------|-----------------|
| SheetDialog | SheetDialog | ✅ (depth ≤ 2) | Subtask modal on task modal |
| SheetPanel | SheetDialog | ✅ | Modal task over contextual panel |
| SheetDialog | SheetPanel | ❌ | Don't de-modalize; use sub-dialog |
| SheetPanel | SheetPanel | ⚠️ Avoid | Prefer replace or inline routes |
| Any | Any (depth > 2) | ❌ | Route to full-screen instead |

---

## 🔌 Implementation Hooks

### **useStackDepthClass()**

Adds depth-based classes automatically:

```tsx
export function useStackDepthClass(ref: React.RefObject<HTMLElement>) {
  const { depth } = useOverlayStack();
  
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    el.dataset.sheetDepth = String(depth);
    el.classList.toggle('ds-sheet--underlay', depth > 0);
    
    return () => {
      delete el.dataset.sheetDepth;
      el.classList.remove('ds-sheet--underlay');
    };
  }, [depth]);
}
```

### **useStackedDialogA11y()**

Dev-time enforcement:

```tsx
export function useStackedDialogA11y({
  role,
  ariaLabel,
  ariaLabelledBy,
}: {
  role: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
}) {
  const { depth } = useOverlayStack();
  
  if (process.env.NODE_ENV !== 'production') {
    if (role !== 'dialog') {
      throw new Error('[SheetDialog] must render role="dialog"');
    }
    
    if (!ariaLabel && !ariaLabelledBy) {
      throw new Error(
        '[SheetDialog] requires ariaLabel or ariaLabelledBy for accessibility'
      );
    }
    
    if (depth > 1) {
      console.warn(
        '[SheetDialog] depth > 2 discouraged. Consider a full-screen route.'
      );
    }
  }
}
```

### **useStackPolicy()**

Enforce nesting rules:

```tsx
export function useStackPolicy({
  type,
  parentType,
}: {
  type: 'dialog' | 'panel';
  parentType?: 'dialog' | 'panel';
}) {
  const { depth } = useOverlayStack();
  
  if (process.env.NODE_ENV !== 'production') {
    // Block SheetDialog → SheetPanel
    if (parentType === 'dialog' && type === 'panel') {
      throw new Error(
        '[SheetPolicy] Cannot open SheetPanel on top of SheetDialog. ' +
        'Use another SheetDialog instead.'
      );
    }
    
    // Warn on SheetPanel → SheetPanel
    if (parentType === 'panel' && type === 'panel') {
      console.warn(
        '[SheetPolicy] SheetPanel → SheetPanel is discouraged. ' +
        'Prefer route replacement or inline navigation.'
      );
    }
    
    // Block depth > 2
    if (depth >= 2) {
      console.error(
        '[SheetPolicy] Maximum stack depth (2) exceeded. ' +
        'Use full-screen route for deeper flows.'
      );
      return false; // Prevent opening
    }
  }
  
  return true; // Allow
}
```

---

## 🧪 Testing Checklist

### **Playwright Tests**

```typescript
test('Nested sheets: visual treatment', async ({ page }) => {
  await page.goto('/demo/nested-sheets');
  
  // Open first dialog
  await page.click('[data-testid="open-dialog"]');
  const dialog1 = page.locator('[data-sheet-depth="0"]');
  await expect(dialog1).toBeVisible();
  
  // Open second dialog on top
  await page.click('[data-testid="open-sub-dialog"]');
  const dialog2 = page.locator('[data-sheet-depth="1"]');
  await expect(dialog2).toBeVisible();
  
  // First dialog should have underlay class
  await expect(dialog1).toHaveClass(/ds-sheet--underlay/);
  
  // Check transform applied
  const transform = await dialog1.evaluate(el =>
    window.getComputedStyle(el).transform
  );
  expect(transform).not.toBe('none');
});

test('Nested sheets: gestures', async ({ page }) => {
  // Open stacked dialogs
  await page.click('[data-testid="open-dialog"]');
  await page.click('[data-testid="open-sub-dialog"]');
  
  const topDialog = page.locator('[data-sheet-depth="1"]');
  
  // Swipe down on top dialog
  await topDialog.dragTo(topDialog, {
    sourcePosition: { x: 100, y: 50 },
    targetPosition: { x: 100, y: 300 },
  });
  
  // Top dialog should close
  await expect(topDialog).not.toBeVisible();
  
  // First dialog should still be visible
  await expect(page.locator('[data-sheet-depth="0"]')).toBeVisible();
});

test('Nested sheets: A11y', async ({ page }) => {
  await page.click('[data-testid="open-dialog"]');
  await page.click('[data-testid="open-sub-dialog"]');
  
  const underDialog = page.locator('[data-sheet-depth="0"]');
  const topDialog = page.locator('[data-sheet-depth="1"]');
  
  // Underlying dialog should be inert
  await expect(underDialog).toHaveAttribute('aria-hidden', 'true');
  await expect(underDialog).toHaveAttribute('inert');
  
  // Top dialog should be interactive
  await expect(topDialog).not.toHaveAttribute('aria-hidden');
  await expect(topDialog).not.toHaveAttribute('inert');
});

test('Nested sheets: Esc key closes topmost', async ({ page }) => {
  await page.click('[data-testid="open-dialog"]');
  await page.click('[data-testid="open-sub-dialog"]');
  
  // First Esc closes top dialog
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-sheet-depth="1"]')).not.toBeVisible();
  await expect(page.locator('[data-sheet-depth="0"]')).toBeVisible();
  
  // Second Esc closes first dialog
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-sheet-depth="0"]')).not.toBeVisible();
});

test('Nested sheets: depth limit enforced', async ({ page }) => {
  // Attempt to open depth 3
  await page.click('[data-testid="open-dialog"]');
  await page.click('[data-testid="open-sub-dialog"]');
  await page.click('[data-testid="open-third-dialog"]');
  
  // Should warn and refuse
  const consoleWarn = await page.waitForEvent('console', 
    msg => msg.type() === 'error' && msg.text().includes('Maximum stack depth')
  );
  expect(consoleWarn).toBeTruthy();
  
  // Third dialog should not open
  await expect(page.locator('[data-sheet-depth="2"]')).not.toBeVisible();
});
```

---

## 🧠 UX "Tells" That Make Stacks Obvious

### **Visual**
- Under-sheet nudges down and darkens
- **Context peek**: Top edge (~1rem) of underlying sheet remains visible
- Always see how deep you are in the stack
- Intuitively reads as "something is on top"

### **Kinetic**
- Dragging top sheet reveals more of under-sheet
- Parallax movement reinforces layering

### **Auditory** (optional)
- Haptic tap on stack push/pop (mobile)
- Subtle sound cue

### **Semantic**
- Titles clearly differentiate:
  - "Select tags" → "Create new tag"
  - "Edit profile" → "Choose avatar"

---

## ✅ Summary

### **Allow**
- SheetDialog-over-SheetDialog (depth ≤ 2) for subtasks
- SheetPanel-under-SheetDialog

### **Block**
- SheetDialog → SheetPanel (de-modalizing)
- SheetPanel → SheetPanel (cognitive overload)
- Depth > 2 (use route navigation)

### **Enforce Via**
- OverlayManager depth context (z-lane + inert/lock refcount)
- Runtime contracts (dev-only throws/warns)
- ESLint rules (no panel-on-dialog, no deep stacks)

### **Test**
- Back/Esc behavior
- Gesture routing
- A11y (inert, focus trap, labels)
- Depth limits

---

## 🎨 Visual Tokens

```css
/* Stack depth tokens */
--ds-sheet-stack-translate: 16px; /* ~1rem peek for depth context */
--ds-sheet-underlay-scale: 0.98;
--ds-sheet-parallax-factor: 0.12;

/* Backdrop intensity by depth */
--ds-backdrop-depth-0: rgba(0, 0, 0, 0.45);
--ds-backdrop-depth-1: rgba(0, 0, 0, 0.55);
--ds-backdrop-depth-2: rgba(0, 0, 0, 0.65);

/* Elevation by depth */
--ds-shadow-depth-0: 0 4px 16px rgba(0, 0, 0, 0.15);
--ds-shadow-depth-1: 0 8px 24px rgba(0, 0, 0, 0.2);
--ds-shadow-depth-2: 0 12px 32px rgba(0, 0, 0, 0.25);
```

---

## 📚 Related Documents

- `/docs/ds/patterns/SHEET_LAYOUT_RULES.md` - Base sheet patterns
- `/docs/ds/SHEET_POLICY.md` - Modal vs non-modal contracts
- `/packages/ds/src/overlay/OverlayManager.tsx` - Stack management
- `/packages/ds/tests/nested-sheets.spec.ts` - Enforcement tests

---

**With these rules + visuals + enforcement, stacked sheets feel intentional, understandable, and pleasant—never chaotic.** 🎉
