# Design System Workflow - Cascade OS

**This is how we build everything now.**

---

## 🧠 The Mental Model

Every feature, every component, every change follows this pattern:

```
Build locally → See pattern → 3rd use → Extract → One source of truth
```

**Not** "plan the abstraction upfront."  
**Not** "extract on first use."  
**Yes** "let patterns emerge, then extract systematically."

---

## 🎯 The 4 Questions (Before ANY Code)

### 1. Can a consumer forget this?

```
YES → Context auto-wire
NO → Explicit prop is fine
```

**Example**:
- `contentRef` for outside-click? → YES → Context auto-wires it ✅
- `value` for the field? → NO → Explicit prop OK ✅

### 2. Do they need to know flex/overflow/focus/positioning?

```
YES → Primitive must own it
NO → Consumer only passes slots
```

**Example**:
- Overlay scroll behavior? → YES → OverlayPicker owns it ✅
- Calendar selection logic? → NO → Consumer handles it ✅

### 3. Will changing this touch 3+ files?

```
YES → Extract tokens/primitive/skin
NO → Local is fine
```

**Example**:
- Z-index used in 5 overlays? → YES → `OVERLAY_TOKENS.zIndex` ✅
- Custom validation for one field? → NO → Keep local ✅

### 4. Can I diagnose in one console call?

```
NO → Add debugX() helper
YES → Ship it
```

**Example**:
- Overlay constraints complex? → NO → `debugOverlay()` added ✅
- Simple state toggle? → YES → Ship it ✅

---

## 📋 The Atomic Pattern (Copy This Everywhere)

### Consumers (Fields) = Slots Only

```tsx
<OverlayPicker
  open={open}
  anchor={triggerRef.current}
  onOpenChange={setOpen}
  
  // ONLY SLOTS - no layout, no events, no positioning
  header={<PickerSearch value={q} onChange={setQ} />}
  content={<CalendarSkin mode="single" selected={value} onSelect={setValue} />}
  footer={<PickerFooter onClear={() => setValue(null)} onDone={() => setOpen(false)} />}
/>
```

**What fields DON'T do**:
- ❌ Manual `position: fixed`
- ❌ Manual scroll containers (`flex-1 min-h-0 overflow-auto`)
- ❌ Outside-click handlers
- ❌ Focus management
- ❌ Z-index calculations
- ❌ Import CSS from `node_modules`

### Root Primitives = Own Behavior

```tsx
// OverlayPicker.tsx (example)
export const OverlayPicker = ({ content, header, footer, ...props }) => {
  // OWNS:
  // - Portal rendering
  // - Outside-click detection
  // - Focus trap + return focus
  // - Max-height constraints
  // - Scroll behavior
  // - A11y attributes
  // - Diagnostics
  
  return (
    <FloatingPortal>
      <div role="dialog" aria-modal="true" ref={contentRef}>
        {header && <div data-role="header">{header}</div>}
        <div data-role="content">{content}</div>
        {footer && <div data-role="footer">{footer}</div>}
      </div>
    </FloatingPortal>
  )
}
```

### Tokens = Constants

```tsx
// tokens.ts
export const OVERLAY_TOKENS = {
  zIndex: {
    backdrop: 1000,
    overlay: 1001,
    modal: 1002,
  },
  maxHeight: {
    default: 560,
    compact: 480,
    mobile: 720,
  },
  timing: {
    enter: 150,
    exit: 100,
  },
}

// Type-safe accessors
export const getZIndex = (layer: keyof typeof OVERLAY_TOKENS.zIndex) => 
  OVERLAY_TOKENS.zIndex[layer]
```

### Skins = CSS in One File

```tsx
// CalendarSkin.tsx
import './ds-calendar.css' // ONE IMPORT, centralized

export const CalendarSkin = (props) => (
  <div className="ds-calendar" data-months={props.months}>
    <DayPicker {...props} />
  </div>
)
```

```css
/* ds-calendar.css - ARIA/role selectors, not classes */
.ds-calendar [role="gridcell"][aria-selected="true"] > * {
  background: var(--blue-600);
  color: white;
}
```

---

## 🔄 Daily Loop (Step-by-Step)

### Day 1: Build Locally

```tsx
// DateField.tsx - First implementation
const [open, setOpen] = useState(false)
const handleOutsideClick = (e) => { /* custom logic */ }

// Local implementation is FINE for first use
```

### Day 5: See Pattern (2nd Use)

```tsx
// SelectField.tsx - Same pattern appears
const [open, setOpen] = useState(false)
const handleOutsideClick = (e) => { /* same logic */ }

// Mark for extraction (2nd occurrence)
// Add comment: // TODO: Extract on 3rd use
```

### Day 10: 3rd Use → EXTRACT

```tsx
// TimeField.tsx would be 3rd use

// STOP - Extract to primitive FIRST
// Create OverlayPickerCore.tsx
export const OverlayPickerCore = ({ children }) => {
  const [open, setOpen] = useState(false)
  const contentRef = useRef()
  
  // All shared logic here
  useOutsideClick(contentRef, () => setOpen(false))
  
  return (
    <OverlayContext.Provider value={{ open, setOpen, contentRef }}>
      {children}
    </OverlayContext.Provider>
  )
}

// NOW all fields use:
<OverlayPickerCore>
  {({ open, setOpen }) => (
    <OverlayPicker open={open} ... />
  )}
</OverlayPickerCore>
```

### After Extraction: Delete Local Copies

```tsx
// DateField.tsx - AFTER
<OverlayPickerCore>  // ✅ Primitive owns state
  {({ open, setOpen }) => (
    <OverlayPicker ... />  // ✅ Primitive owns behavior
  )}
</OverlayPickerCore>

// Deleted:
// ❌ const [open, setOpen] = useState(false)
// ❌ const handleOutsideClick = ...
// ❌ useEffect for outside click
```

**Result**: One source of truth, hydrates all consumers!

---

## 🛡️ Guardrails (Automatic Enforcement)

### ESLint Blocks (Pre-Commit)

```bash
git commit
# → Runs: pnpm -w lint-staged
# → Auto-fixes ESLint errors
# → Blocks:
#   - position: fixed in fields
#   - CSS imports from node_modules
#   - Manual scroll containers
#   - Direct DayPicker imports
```

### Smoke Tests (Pre-Push)

```bash
git push
# → Runs: pnpm -w build
# → Runs: npx playwright test tests/overlay.spec.ts
# → Verifies:
#   - Footer visible @375×480
#   - Content scrollable
#   - Overlay within viewport
#   - Clear/Done work correctly
```

### CI Workflow (On PR)

```yaml
# .github/workflows/cascade-os.yml
- ESLint overlay rules
- Playwright smoke tests
- Design tokens check (no magic numbers)
```

---

## 🔍 Console Sanity Checks

### Overlay Layout Check

**When to run**: Any overlay open, suspect layout issue

```javascript
(() => {
  const el = document.querySelector('[data-overlay="picker"]');
  if (!el) return console.warn('No overlay');
  const cs = getComputedStyle(el);
  const content = el.querySelector('[data-role="content"]');
  const ccs = content ? getComputedStyle(content) : null;

  console.table({
    'maxHeight(style)': el.style.maxHeight || '(none)',
    'maxHeight(computed)': cs.maxHeight,
    '--overlay-max-h': cs.getPropertyValue('--overlay-max-h') || '(none)',
    'content scrollHeight': content?.scrollHeight,
    'content clientHeight': content?.clientHeight,
    'content overflowY': ccs?.overflowY
  });

  const bottom = el.getBoundingClientRect().bottom;
  const vh = window.innerHeight;
  console.log(bottom <= vh ? '✅ Within viewport' : `❌ OVERFLOW by ${bottom - vh}px`);
})();
```

**Expected**:
- ✅ maxHeight set (px value)
- ✅ CSS var `--overlay-max-h` present
- ✅ Content scrolls if needed
- ✅ Bottom within viewport

### Calendar Fill Consistency

**When to run**: Calendar visual inconsistency

```javascript
[...document.querySelectorAll('.ds-calendar [role="gridcell"] > *')]
  .filter(n => n.matches('[aria-selected="true"], [aria-pressed="true"]'))
  .slice(0,4)
  .forEach(n => console.log(
    n.innerText, 
    getComputedStyle(n).backgroundColor, 
    getComputedStyle(n).color
  ));
```

**Expected**: Same bg/color for all selected states

---

## 📝 PR Discipline

### Every PR Includes

```markdown
## 🔁 Cascade OS Checklist

1) Evidence (logs/console/recording): …

2) Root cause (what/when/where/why): …

3) Pattern? (where else?): …

4) Systematize:
- [ ] Primitive/Hook extracted
- [ ] Context auto-wire
- [ ] Tokens used
- [ ] debugX() helper
- [ ] ESLint/Smoke test

5) Docs: ENGINEERING_PRINCIPLES / DESIGN_SYSTEM_PATTERNS / DEBUGGING_PLAYBOOK
```

**Reviewer checklist**:
- [ ] Evidence (not assumptions)
- [ ] Root cause clear
- [ ] Pattern extracted if 3rd occurrence
- [ ] Tests prove it works
- [ ] Docs updated

---

## 🚀 What This Gives You

### One Source of Truth

```
Change ONE file → System-wide update

Examples:
- Footer design → Edit PickerFooter.tsx → ALL footers update
- Z-index → Edit tokens.ts → ALL overlays update
- Calendar styles → Edit ds-calendar.css → ALL calendars update
```

### Impossible to Drift

```
ESLint → Blocks manual wiring
Playwright → Verifies primitives work
CI → Catches regressions
PR template → Forces documentation
```

### Self-Documenting

```
ADRs → Why we made decisions
Playbook → How to debug
Patterns → When to extract
Operating System → How we think
```

### Confident Shipping

```
Tests pass → Primitives work
Console scripts → Verify runtime
Diagnostics → Inspect state
Guardrails → Prevent mistakes
```

---

## 🎯 Next Steps (In Order)

1. **Merge PR template**
   - Copy Cascade OS Checklist into `.github/pull_request_template.md`

2. **Run first smoke test**
   ```bash
   pnpm -w build
   npx playwright test tests/overlay.spec.ts --reporter=line
   ```

3. **Build something new using only slots**
   - If you add layout/handlers → STOP → That belongs in primitive

4. **Spot a pattern on 3rd use**
   - Extract to primitive/hook/token
   - Delete local copies
   - One source of truth remains

5. **Make first PR with checklist**
   - Fill out 5 steps
   - Evidence-based
   - Pattern extracted if needed

---

## 💡 Remember

**"Can a consumer forget this?"** → Auto-wire it  
**"Do they need to know layout?"** → Primitive owns it  
**"Will this touch 3+ files?"** → Token/primitive it  
**"Can I diagnose it easily?"** → Add debugX()  

**Extract on 3rd use. Not before. Not after.**

**One source of truth. Hydrates everything.**

---

**This is how we build now.** 🚀

Cascade OS is operational.  
The rails are down.  
The system enforces itself.
