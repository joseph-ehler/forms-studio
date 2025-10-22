# Atomic Component Recipe

**The 7-step pattern for building ANY component in Cascade OS.**

Use this for: overlays, tooltips, tables, modals, cards, toasts, dropdowns, tabs, accordions, EVERYTHING.

---

## 🎯 The 7-Step Recipe

### 1. Root Primitive (owns behavior)

**One file owns ALL cross-cutting concerns**:
- State management
- Event handling
- A11y (ARIA, roles, live regions)
- Sizing & positioning
- Focus management
- Diagnostics

**Expose slots, NOT structure**:
```tsx
// ✅ Good - Slots only
<TooltipPrimitive content={<Text />}>
  <IconButton />
</TooltipPrimitive>

// ❌ Bad - Structure exposed
<TooltipPrimitive>
  <TooltipTrigger>...</TooltipTrigger>
  <TooltipContent>...</TooltipContent>
</TooltipPrimitive>
```

---

### 2. Context Auto-Wiring (make forgetting impossible)

**Anything consumers could forget → Context auto-provides**:
- Refs (trigger, content)
- IDs (for ARIA relationships)
- Focus managers
- State (open/close)
- Registries

**Consumers NEVER pass these by hand**:

```tsx
// TooltipPrimitive.tsx
const TooltipContext = createContext<TooltipContextType | null>(null)

export const TooltipPrimitive = ({ children, content }) => {
  const triggerId = useId()
  const contentRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  
  // Auto-provide via Context
  const context = { triggerId, contentRef, isOpen, setIsOpen }
  
  return (
    <TooltipContext.Provider value={context}>
      {children}
    </TooltipContext.Provider>
  )
}

// Internal components auto-consume
const TooltipTrigger = () => {
  const { triggerId, setIsOpen } = useTooltipContext() // Auto-wired!
  return <button id={triggerId} onMouseEnter={() => setIsOpen(true)} />
}
```

**Result**: Impossible to forget `triggerId` or `contentRef` - Context provides them automatically.

---

### 3. Design Tokens (no magic numbers)

**All constants in ONE file**:

```tsx
// tokens.ts
export const TOOLTIP_TOKENS = {
  zIndex: {
    overlay: 1003,
  },
  timing: {
    showDelay: 500,    // ms
    hideDelay: 0,
  },
  maxWidth: {
    default: 320,      // px
    compact: 240,
  },
  offset: 8,           // px from trigger
}

// Type-safe accessor
export const getTooltipZIndex = () => TOOLTIP_TOKENS.zIndex.overlay
```

**Consumers call helpers, NEVER raw numbers**:

```tsx
// ✅ Good
style={{ zIndex: getTooltipZIndex() }}

// ❌ Bad
style={{ zIndex: 1003 }}
```

---

### 4. Centralized Skin (no per-component CSS)

**One CSS file using ARIA/role/data selectors**:

```css
/* ds-tooltip.css */

[role="tooltip"] {
  background: var(--gray-900);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  max-width: 320px;
}

[role="tooltip"][data-state="open"] {
  animation: fadeIn 150ms ease-out;
}

[role="tooltip"][data-placement^="top"] {
  margin-bottom: 8px;
}

[role="tooltip"][data-placement^="bottom"] {
  margin-top: 8px;
}
```

**Import ONCE in skin component**:

```tsx
// TooltipSkin.tsx
import './ds-tooltip.css'  // Only imported here!

export const TooltipSkin = ({ content, placement, state }) => (
  <div 
    role="tooltip" 
    data-state={state}
    data-placement={placement}
  >
    {content}
  </div>
)
```

**Consumers NEVER import CSS**:
```tsx
// ✅ Good - Use skin
<TooltipSkin content="Copy" />

// ❌ Bad - Import CSS
import './tooltip.css'
```

---

### 5. Diagnostics Helper (one-line truth)

**Export `debugX()` from every primitive**:

```tsx
// debug.ts
export const debugTooltip = () => {
  const trigger = document.querySelector('[aria-describedby]')
  const tooltip = document.querySelector('[role="tooltip"]')
  
  if (!tooltip) return console.warn('No tooltip visible')
  
  const cs = getComputedStyle(tooltip)
  const triggerRect = trigger?.getBoundingClientRect()
  const tooltipRect = tooltip.getBoundingClientRect()
  
  console.table({
    'zIndex': cs.zIndex,
    'position': cs.position,
    'trigger-id': trigger?.id,
    'aria-describedby': trigger?.getAttribute('aria-describedby'),
    'placement': tooltip.getAttribute('data-placement'),
    'state': tooltip.getAttribute('data-state'),
    'trigger-x': triggerRect?.x,
    'trigger-y': triggerRect?.y,
    'tooltip-x': tooltipRect?.x,
    'tooltip-y': tooltipRect?.y,
    'offset': tooltipRect && triggerRect 
      ? Math.abs(tooltipRect.y - (triggerRect.y + triggerRect.height))
      : 'N/A',
  })
}
```

**Usage**:
```javascript
// Hover over tooltip trigger, paste in console:
debugTooltip()
```

**Rule**: If we can't diagnose in 1 console call, add `debugX()` before shipping.

---

### 6. Guardrails (make drift impossible)

#### ESLint Rules

```javascript
// tools/eslint-plugin-cascade/index.js
'no-fixed-tooltips': {
  // Block: <div style={{ position: 'fixed' }}>Tooltip</div>
  // Require: Use TooltipPrimitive
},

'no-magic-z-index': {
  // Block: zIndex: 1003
  // Require: getTooltipZIndex()
},

'no-css-imports-outside-skins': {
  // Block: import './tooltip.css' in components
  // Require: Import only in *Skin.tsx files
},
```

#### Playwright Smoke Tests

```typescript
// tests/tooltip.spec.ts
test('@tooltip-smoke › shows on hover, hides on leave', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 480 })
  await page.goto('/')
  
  const trigger = page.getByRole('button', { name: /copy/i })
  const tooltip = page.locator('[role="tooltip"]')
  
  // Hover → shows
  await trigger.hover()
  await expect(tooltip).toBeVisible()
  
  // Content not clipped
  const rect = await tooltip.boundingBox()
  expect(rect!.x).toBeGreaterThanOrEqual(0)
  expect(rect!.x + rect!.width).toBeLessThanOrEqual(375)
  
  // Leave → hides
  await page.mouse.move(0, 0)
  await expect(tooltip).toBeHidden({ timeout: 1000 })
})

test('@tooltip-smoke › keyboard accessible', async ({ page }) => {
  await page.goto('/')
  
  // Tab to trigger
  await page.keyboard.press('Tab')
  const tooltip = page.locator('[role="tooltip"]')
  
  // Focus → shows
  await expect(tooltip).toBeVisible()
  
  // Esc → hides
  await page.keyboard.press('Escape')
  await expect(tooltip).toBeHidden()
})
```

---

### 7. Extraction Trigger (on the 3rd time)

**The rule**:

```
1st use → Local implementation (fine)
2nd use → Mark for extraction (add comment)
3rd use → STOP! Extract to primitive
```

**Example**:

```tsx
// UserProfile.tsx (1st use)
const [showTooltip, setShowTooltip] = useState(false)
// ... manual tooltip logic

// ProductCard.tsx (2nd use)
const [showTooltip, setShowTooltip] = useState(false)
// ... same manual logic
// TODO: Extract on 3rd use

// OrderItem.tsx (3rd use)
// STOP! Extract to TooltipPrimitive FIRST
```

**After extraction**:
1. Create `TooltipPrimitive.tsx`
2. Delete local implementations in UserProfile & ProductCard
3. All use `<TooltipPrimitive>`
4. One source of truth hydrates all

---

## 📦 Concrete Examples

### Example 1: Tooltip

#### Structure

```
/components/
  /tooltip/
    TooltipPrimitive.tsx   // Root (owns behavior)
    TooltipSkin.tsx        // Skin (visual)
    ds-tooltip.css         // Centralized CSS
    tokens.ts              // Constants
    debug.ts               // debugTooltip()
    index.ts               // Exports
```

#### Implementation

**TooltipPrimitive.tsx**:
```tsx
import { createContext, useContext, useRef, useState, useId } from 'react'
import { createPortal } from 'react-dom'
import { TooltipSkin } from './TooltipSkin'
import { TOOLTIP_TOKENS } from './tokens'

const TooltipContext = createContext<TooltipContextType | null>(null)

export const TooltipPrimitive = ({ content, children, placement = 'top' }) => {
  const triggerId = useId()
  const contentRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  
  const context = { triggerId, contentRef, isOpen, setIsOpen }
  
  return (
    <TooltipContext.Provider value={context}>
      {/* Trigger */}
      <span
        id={triggerId}
        aria-describedby={isOpen ? `${triggerId}-tooltip` : undefined}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
      >
        {children}
      </span>
      
      {/* Portal'd tooltip */}
      {isOpen && createPortal(
        <TooltipSkin
          id={`${triggerId}-tooltip`}
          content={content}
          placement={placement}
          state={isOpen ? 'open' : 'closed'}
          ref={contentRef}
        />,
        document.body
      )}
    </TooltipContext.Provider>
  )
}
```

**tokens.ts**:
```tsx
export const TOOLTIP_TOKENS = {
  zIndex: { overlay: 1003 },
  timing: { showDelay: 500, hideDelay: 0 },
  maxWidth: { default: 320, compact: 240 },
  offset: 8,
}

export const getTooltipZIndex = () => TOOLTIP_TOKENS.zIndex.overlay
```

**ds-tooltip.css**:
```css
[role="tooltip"] {
  background: var(--gray-900);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  max-width: 320px;
  z-index: 1003; /* or var(--z-tooltip) */
}

[role="tooltip"][data-state="open"] {
  animation: fadeIn 150ms ease-out;
}
```

**debug.ts**:
```tsx
export const debugTooltip = () => {
  const tooltip = document.querySelector('[role="tooltip"]')
  if (!tooltip) return console.warn('No tooltip visible')
  
  const cs = getComputedStyle(tooltip)
  console.table({
    zIndex: cs.zIndex,
    position: cs.position,
    placement: tooltip.getAttribute('data-placement'),
    state: tooltip.getAttribute('data-state'),
  })
}
```

#### Usage

```tsx
// Consumers provide content only
<TooltipPrimitive content="Copy to clipboard">
  <IconButton aria-label="Copy" />
</TooltipPrimitive>

// NO manual:
// ❌ positioning
// ❌ z-index
// ❌ show/hide logic
// ❌ ARIA relationships
// ❌ focus management
```

---

### Example 2: Table

#### Structure

```
/components/
  /table/
    TablePrimitive.tsx     // Root (owns behavior)
    TableSkin.tsx          // Visual skin
    ds-table.css           // Centralized CSS
    tokens.ts              // Constants
    hooks.ts               // usePagination, useSelection
    debug.ts               // debugTable()
    index.ts               // Exports
```

#### Implementation

**TablePrimitive.tsx**:
```tsx
const TableContext = createContext<TableContextType | null>(null)

export const TablePrimitive = ({ 
  header, 
  rows, 
  footer,
  sort,
  pagination 
}) => {
  const [selection, setSelection] = useState<Set<string>>(new Set())
  
  const context = {
    selection,
    setSelection,
    sort,
    pagination,
  }
  
  return (
    <TableContext.Provider value={context}>
      <div role="table">
        {header}
        <div role="rowgroup">{rows}</div>
        {footer}
      </div>
    </TableContext.Provider>
  )
}
```

**hooks.ts**:
```tsx
export const usePagination = (total: number, pageSize = 10) => {
  const [page, setPage] = useState(1)
  return {
    page,
    setPage,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    offset: (page - 1) * pageSize,
  }
}

export const useTableSelection = () => {
  const context = useContext(TableContext)
  return context.selection
}
```

**ds-table.css**:
```css
[role="table"] {
  width: 100%;
  border-collapse: collapse;
}

[role="columnheader"] {
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

[role="row"][aria-selected="true"] {
  background: var(--blue-50);
}

[role="columnheader"][aria-sort="ascending"]::after {
  content: " ↑";
}

[role="columnheader"][aria-sort="descending"]::after {
  content: " ↓";
}
```

**debug.ts**:
```tsx
export const debugTable = () => {
  const table = document.querySelector('[role="table"]')
  const headers = table?.querySelectorAll('[role="columnheader"]')
  const rows = table?.querySelectorAll('[role="row"]')
  
  console.table({
    'total rows': rows?.length,
    'headers': headers?.length,
    'sticky header': headers?.[0] 
      ? getComputedStyle(headers[0]).position 
      : 'N/A',
    'selected rows': document.querySelectorAll('[role="row"][aria-selected="true"]').length,
  })
}
```

#### Usage

```tsx
const pagination = usePagination(users.length)

<TablePrimitive
  header={<UserTableHeader />}
  rows={<UserTableRows data={users.slice(pagination.offset, pagination.offset + pagination.pageSize)} />}
  footer={<TablePagination {...pagination} />}
  sort={{ key: 'email', direction: 'asc' }}
/>

// NO manual:
// ❌ selection state
// ❌ sticky header CSS
// ❌ pagination logic
// ❌ keyboard navigation
```

---

## 🛡️ What Keeps This Standardized

### Cascade OS Rails (Already in Place)

1. **PR Checklist** - Forces the 5-step loop
2. **ESLint Rules** - Blocks drift (fixed positions, raw z-index, CSS imports)
3. **Playwright Smoke** - Small viewport behavior verified
4. **Generators** - `pnpm gen:primitive` scaffolds with Context/tokens/skins
5. **debugX() Helpers** - One-line diagnosis requirement
6. **Extract on 3rd** - Policy enforced in code reviews

---

## 📝 TL;DR (How It Works for ANY Component)

| Layer | Responsibility | What It Does |
|-------|---------------|--------------|
| **Consumers** | Provide slots only | `content`, `header`, `footer`, `actions` |
| **Primitives** | Own all behavior | Events, focus, sizing, a11y, diagnostics |
| **Context** | Auto-wire cross-cutting | Refs, state (no foot-guns) |
| **Tokens** | Centralize constants | No magic values |
| **Skins** | Centralize CSS | ARIA/role/data selectors |
| **Guardrails** | Ensure consistency | ESLint + tests prevent drift |

---

## 🎯 The Pattern is Universal

**Works for**:
- ✅ Overlays (you have this)
- ✅ Tooltips
- ✅ Tables
- ✅ Modals
- ✅ Cards
- ✅ Toasts
- ✅ Dropdowns
- ✅ Tabs
- ✅ Accordions
- ✅ Forms
- ✅ **EVERYTHING**

**The process**:
1. Ask the 4 Questions
2. Extract on 3rd use
3. Follow the 7-step recipe
4. Guardrails enforce it
5. One source of truth

---

**This is the standard. This is how we build.** 🚀
