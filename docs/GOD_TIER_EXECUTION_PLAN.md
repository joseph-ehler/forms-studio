# 🏆 GOD TIER EXECUTION PLAN

**Status:** Foundation Solid ✅ | Ready for Polish ✨  
**Goal:** Apple/Airbnb/Google quality - systematically, not by one-offs  
**Timeline:** One focused afternoon → 27 fields transformed

---

## 🎯 NORTH STAR (What "God Tier" Means)

1. **Form Follows Function** - Each control looks like what it is (checkbox ≠ text input)
2. **Instant, Obvious Feedback** - Hover/focus/typing/valid/invalid/loading are unmistakable
3. **Delight, Not Distraction** - Micro-interactions with purpose; honor `prefers-reduced-motion`
4. **Ruthless Consistency** - Tokens → Primitives → Recipes; Generator/Overlays/Refiner enforce
5. **Accessibility by Default** - WCAG AA+, flawless keyboard/AT experience

---

## 📋 THE ONE-AFTERNOON PLAN (3 Hours)

### **Hour 1: Primitives** (Fix the Metaphor First)
**Goal:** Checkbox looks like checkbox, Toggle looks like switch, etc.

**Task:** Add field-type-specific primitives  
**Files:** `packages/ds/src/styles/components/`

```bash
# Create new primitive files
touch packages/ds/src/styles/components/ds-checkbox.css
touch packages/ds/src/styles/components/ds-toggle.css
touch packages/ds/src/styles/components/ds-textarea.css
touch packages/ds/src/styles/components/ds-select.css
```

**What to Build:**

1. **`.ds-checkbox`** (24×24px, checkmark icon, smooth transitions)
2. **`.ds-toggle`** (52×32px iOS-style switch with sliding knob)
3. **`.ds-textarea`** (min-height 120px, resize-vertical)
4. **`.ds-select`** (custom dropdown arrow, no browser default)

**Generator Mapping:**
```yaml
# packages/forms/factory/overlays/factory-overlays.yaml

primitive-mapping:
  checkbox:
    className: "ds-checkbox"
    wrapper: "ds-checkbox-wrapper"
    label: "ds-checkbox-label"
  
  toggle:
    className: "ds-toggle"
    wrapper: "ds-toggle-wrapper"
  
  textarea:
    className: "ds-textarea"
  
  select:
    className: "ds-select"
    wrapper: "ds-select-wrapper"
```

**Refiner Rule:**
```javascript
// scripts/refiner/rules/enforce-primitive-v1.0.mjs

export default {
  name: 'enforce-primitive-v1.0',
  match: (node) => node.type === 'JSXElement' && node.openingElement.name.name === 'input',
  transform: (node, context) => {
    const type = getAttributeValue(node, 'type');
    const className = getAttributeValue(node, 'className');
    
    // If checkbox using .ds-input, fix it
    if (type === 'checkbox' && className.includes('ds-input')) {
      setAttributeValue(node, 'className', 'ds-checkbox');
      return { changed: true };
    }
    
    // Similar for other types...
  }
};
```

**Deliverable:** 4 fields (Checkbox, Toggle, Textarea, Select) get correct primitives

---

### **Hour 2: States** (Make It Feel Alive)
**Goal:** Instant feedback on every interaction

**Task:** Add micro-interactions to all inputs  
**File:** `packages/ds/src/styles/components/ds-inputs.css`

```css
/* packages/ds/src/styles/components/ds-inputs.css */

@layer atoms {

/* ===== ENHANCED STATES ===== */

/* 1. Focus - Delightful Pop */
.ds-input:focus,
.ds-checkbox:focus,
.ds-toggle:focus,
.ds-textarea:focus,
.ds-select:focus {
  outline: none;
  border-color: var(--ds-color-border-focus);
  box-shadow: var(--ds-input-shadow-focus);
  transform: scale(1.005); /* Subtle pop */
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* 2. Hover - Clear Affordance */
@media (hover: hover) {
  .ds-input:hover:not(:disabled):not(:focus),
  .ds-checkbox:hover:not(:disabled):not(:focus),
  .ds-toggle:hover:not(:disabled):not(:focus),
  .ds-textarea:hover:not(:disabled):not(:focus),
  .ds-select:hover:not(:disabled):not(:focus) {
    border-color: var(--ds-color-border-hover);
    background-color: var(--ds-color-surface-hover);
    transition: all 150ms ease-in-out;
  }
}

/* 3. Error - Attention Grabbing */
.ds-input[aria-invalid="true"],
.ds-checkbox[aria-invalid="true"],
.ds-toggle[aria-invalid="true"],
.ds-textarea[aria-invalid="true"],
.ds-select[aria-invalid="true"] {
  border-color: var(--ds-color-state-danger);
  box-shadow: var(--ds-input-shadow-error);
}

/* Shake animation (respect reduced motion) */
@media (prefers-reduced-motion: no-preference) {
  .ds-input[aria-invalid="true"],
  .ds-checkbox[aria-invalid="true"],
  .ds-toggle[aria-invalid="true"],
  .ds-textarea[aria-invalid="true"],
  .ds-select[aria-invalid="true"] {
    animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}

/* 4. Success - Positive Reinforcement */
.ds-input[data-touched="true"][aria-invalid="false"],
.ds-checkbox[data-touched="true"][aria-invalid="false"],
.ds-toggle[data-touched="true"][aria-invalid="false"],
.ds-textarea[data-touched="true"][aria-invalid="false"],
.ds-select[data-touched="true"][aria-invalid="false"] {
  border-color: var(--ds-color-state-success);
  box-shadow: var(--ds-input-shadow-success);
}

/* 5. Disabled - Clear Non-Interactivity */
.ds-input:disabled,
.ds-checkbox:disabled,
.ds-toggle:disabled,
.ds-textarea:disabled,
.ds-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--ds-color-surface-subtle);
  color: var(--ds-color-text-muted);
}

} /* End @layer atoms */
```

**Tokens to Add:**
```css
/* packages/ds/src/styles/tokens/input.vars.css */

@layer tokens {
  :root {
    /* Focus States */
    --ds-input-shadow-focus: 
      0 0 0 1px var(--ds-color-border-focus),
      0 0 0 4px var(--ds-color-primary-ring);
    
    /* Error States */
    --ds-input-shadow-error:
      0 0 0 1px var(--ds-color-state-danger),
      0 0 0 4px rgba(220, 38, 38, 0.1);
    
    /* Success States */
    --ds-input-shadow-success:
      0 0 0 1px var(--ds-color-state-success),
      0 0 0 4px rgba(22, 163, 74, 0.1);
    
    /* Hover States */
    --ds-color-border-hover: #d4d4d4;
    --ds-color-surface-hover: #fafafa;
    
    /* Motion */
    --ds-motion-fast: 150ms;
    --ds-motion-normal: 200ms;
    --ds-motion-slow: 300ms;
  }
  
  :root[data-theme="dark"] {
    --ds-color-border-hover: #404040;
    --ds-color-surface-hover: #262626;
  }
}
```

**Generator Update:**
```typescript
// Add data-touched attribute from RHF
<input
  {...field}
  data-touched={fieldState.isTouched ? 'true' : 'false'}
  aria-invalid={fieldState.invalid ? 'true' : 'false'}
/>
```

**Deliverable:** All 27 fields get enhanced states with instant feedback

---

### **Hour 3: Recipe Seed** (One "Wow" Example)
**Goal:** Show what's possible with behavior-driven recipes

**Task:** Build AsyncSearchSelect recipe  
**File:** `packages/forms/src/recipes/AsyncSearchSelect/`

```typescript
// packages/forms/src/recipes/AsyncSearchSelect/AsyncSearchSelect.tsx

import { useCombobox } from '@headlessui/react';
import { useDebounce } from '@intstudio/core/hooks';
import { OverlayPicker, OverlaySheet } from '@intstudio/ds/overlay';
import { usePortAdapter } from '../../ports';

export function AsyncSearchSelect<T>({ 
  name, 
  optionSource, // Port!
  telemetry,
  ui 
}: AsyncSearchSelectProps<T>) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  
  const { data, isLoading } = useQuery({
    queryKey: ['search', name, debouncedQuery],
    queryFn: () => optionSource.search(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });
  
  const combobox = useCombobox({
    items: data?.options || [],
    onSelectedItemChange: ({ selectedItem }) => {
      telemetry?.emit('field_select', { field: name, value: selectedItem });
    },
  });
  
  // Mobile: OverlaySheet with full keyboard nav
  // Desktop: OverlayPicker popover
  // DS decides based on viewport - generator stays device-agnostic!
  
  return (
    <div className="ds-combobox-wrapper">
      <input
        {...combobox.getInputProps()}
        className="ds-input"
        placeholder="Search..."
        onChange={(e) => {
          setQuery(e.target.value);
          telemetry?.emit('field_search', { field: name, query: e.target.value });
        }}
      />
      
      <OverlayPicker {...combobox.getMenuProps()}>
        {isLoading && <div className="ds-loading">Searching...</div>}
        
        {data?.options.map((option, index) => (
          <div
            key={option.id}
            {...combobox.getItemProps({ item: option, index })}
            className="ds-combobox-option"
          >
            {option.label}
          </div>
        ))}
      </OverlayPicker>
    </div>
  );
}
```

**Overlay Config:**
```yaml
# factory-overlays.yaml

behaviors:
  async-search:
    recipe: AsyncSearchSelect
    defaults:
      debounce: 300
      minQueryLength: 2
      telemetry: true
      accessibility:
        role: combobox
        ariaAutocomplete: list
```

**Deliverable:** One polished recipe that demonstrates the full stack

---

## 🎨 DETAILED PRIMITIVES (Copy-Paste Ready)

### 1. Checkbox Primitive

```css
/* packages/ds/src/styles/components/ds-checkbox.css */

@layer atoms {

.ds-checkbox-wrapper {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-space-3); /* 12px */
  min-height: 48px; /* Touch target */
  cursor: pointer;
  position: relative;
}

.ds-checkbox {
  /* Sizing */
  width: 24px;
  height: 24px;
  min-width: 24px;
  
  /* Visual */
  border: 2px solid var(--ds-color-border-subtle);
  border-radius: 4px;
  background: var(--ds-color-surface-base);
  
  /* Reset */
  appearance: none;
  cursor: pointer;
  margin: 0;
  
  /* Transition */
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Checked State */
.ds-checkbox:checked {
  background: var(--ds-color-primary-bg);
  border-color: var(--ds-color-primary-bg);
  
  /* Checkmark icon */
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 16px;
}

/* Indeterminate State */
.ds-checkbox:indeterminate {
  background: var(--ds-color-primary-bg);
  border-color: var(--ds-color-primary-bg);
  
  /* Dash icon */
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 8h8' stroke='white' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
}

/* Label */
.ds-checkbox-label {
  font-size: 16px;
  line-height: 24px;
  color: var(--ds-color-text-primary);
  cursor: pointer;
  user-select: none;
}

.ds-checkbox:disabled + .ds-checkbox-label {
  color: var(--ds-color-text-muted);
  cursor: not-allowed;
}

} /* End @layer atoms */
```

---

### 2. Toggle Primitive

```css
/* packages/ds/src/styles/components/ds-toggle.css */

@layer atoms {

.ds-toggle-wrapper {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-space-3);
  min-height: 48px; /* Touch target */
  cursor: pointer;
}

.ds-toggle {
  /* Sizing (iOS-style) */
  width: 52px;
  height: 32px;
  min-width: 52px;
  
  /* Visual - OFF state */
  background: var(--ds-color-surface-subtle);
  border: 2px solid var(--ds-color-border-subtle);
  border-radius: 16px; /* Pill shape */
  
  /* Reset */
  appearance: none;
  cursor: pointer;
  position: relative;
  margin: 0;
  
  /* Transition */
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Knob (using ::before) */
.ds-toggle::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Checked (ON) State */
.ds-toggle:checked {
  background: var(--ds-color-primary-bg);
  border-color: var(--ds-color-primary-bg);
}

.ds-toggle:checked::before {
  transform: translateX(20px); /* Slide knob right */
}

.ds-toggle-label {
  font-size: 16px;
  line-height: 24px;
  color: var(--ds-color-text-primary);
  cursor: pointer;
  user-select: none;
}

} /* End @layer atoms */
```

---

### 3. Textarea Primitive

```css
/* packages/ds/src/styles/components/ds-textarea.css */

@layer atoms {

.ds-textarea {
  /* Sizing */
  width: 100%;
  min-height: 120px; /* ~5 rows */
  padding: var(--ds-space-3) var(--ds-space-4); /* 12px 16px */
  
  /* Typography */
  font-family: var(--ds-font-body);
  font-size: 16px; /* Prevents iOS zoom */
  line-height: 1.5;
  
  /* Visual */
  border: 1px solid var(--ds-color-border-subtle);
  border-radius: 6px;
  background: var(--ds-color-surface-base);
  color: var(--ds-color-text-primary);
  
  /* Behavior */
  resize: vertical; /* Allow vertical resize only */
  
  /* Reset */
  appearance: none;
  
  /* Transition */
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.ds-textarea::placeholder {
  color: var(--ds-color-text-muted);
}

} /* End @layer atoms */
```

---

### 4. Select Primitive

```css
/* packages/ds/src/styles/components/ds-select.css */

@layer atoms {

.ds-select {
  /* Sizing */
  width: 100%;
  min-height: 48px;
  padding: var(--ds-space-3) var(--ds-space-4);
  padding-right: var(--ds-space-10); /* Space for dropdown arrow */
  
  /* Typography */
  font-family: var(--ds-font-body);
  font-size: 16px;
  line-height: 1.5;
  
  /* Visual */
  border: 1px solid var(--ds-color-border-subtle);
  border-radius: 6px;
  background: var(--ds-color-surface-base);
  color: var(--ds-color-text-primary);
  
  /* Custom dropdown arrow */
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' fill='%23737373' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4.427 5.927l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25 0 0011.396 5.5H4.604a.25.25 0 00-.177.427z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  
  /* Reset */
  appearance: none;
  cursor: pointer;
  
  /* Transition */
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Rotate arrow on focus (optional) */
@media (prefers-reduced-motion: no-preference) {
  .ds-select:focus {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' fill='%23737373' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11.573 10.073l-3.396-3.396a.25.25 0 00-.354 0l-3.396 3.396a.25.25 0 00.177.427h6.792a.25.25 0 00.177-.427z'/%3E%3C/svg%3E");
  }
}

} /* End @layer atoms */
```

---

## 🔧 IMPLEMENTATION CHECKLIST

### Hour 1: Primitives ✅
- [ ] Create `ds-checkbox.css` with proper styling
- [ ] Create `ds-toggle.css` with iOS-style switch
- [ ] Create `ds-textarea.css` with resize-vertical
- [ ] Create `ds-select.css` with custom arrow
- [ ] Import new primitives in `styles.css`
- [ ] Update `factory-overlays.yaml` with primitive mapping
- [ ] Create `enforce-primitive-v1.0.mjs` refiner rule
- [ ] Run `pnpm refine:dry-run` to see changes
- [ ] Test in browser: CheckboxField, ToggleField, TextareaField, SelectField

### Hour 2: States ✅
- [ ] Add tokens to `input.vars.css` (shadows, hover colors, motion)
- [ ] Update `ds-inputs.css` with enhanced states (focus/hover/error/success)
- [ ] Add `@keyframes shake` animation
- [ ] Test `@media (prefers-reduced-motion)`
- [ ] Update generator to add `data-touched` attribute
- [ ] Create `state-attrs-v1.0.mjs` refiner rule
- [ ] Test all states: focus, hover, error (shake), success, disabled
- [ ] Verify smooth transitions (150-200ms)

### Hour 3: Recipe Seed ✅
- [ ] Create `AsyncSearchSelect` recipe folder
- [ ] Install `@headlessui/react` for combobox
- [ ] Implement debounced search
- [ ] Wire up `OptionSourcePort`
- [ ] Add telemetry (`field_search`, `field_select`)
- [ ] Style dropdown with `OverlayPicker`/`OverlaySheet`
- [ ] Test keyboard navigation (arrow keys, enter, escape)
- [ ] Update `factory-overlays.yaml` with behavior config
- [ ] Document in Storybook

---

## 🎯 QUALITY GATES

### Visual Quality
- [ ] Each field type has correct primitive (no `.ds-input` on checkboxes!)
- [ ] All transitions are 150-200ms smooth
- [ ] Focus states are highly visible (ring + subtle scale)
- [ ] Hover provides clear affordance
- [ ] Error shake is attention-grabbing but not jarring
- [ ] Success states provide positive reinforcement
- [ ] Disabled states are clearly non-interactive

### Accessibility
- [ ] All touch targets ≥ 48px
- [ ] Focus indicators meet WCAG 2.1 contrast ratios
- [ ] Keyboard navigation flawless (Tab, Shift+Tab, Enter, Escape)
- [ ] Screen reader announcements correct (test with VoiceOver/NVDA)
- [ ] `aria-invalid` and `data-touched` attributes present
- [ ] `prefers-reduced-motion` respected

### Consistency
- [ ] All primitives use tokens (no hardcoded values)
- [ ] Generator applies correct class based on `spec.type`
- [ ] Overlays codify defaults per field type
- [ ] Refiner enforces standards retroactively

### Performance
- [ ] Transitions don't cause jank (<16ms frames)
- [ ] Debounced search doesn't block typing
- [ ] No layout shifts on state changes

---

## 📊 BEFORE/AFTER METRICS

| Metric | Before | After Goal |
|--------|--------|------------|
| **Primitives Used Correctly** | 15/27 (56%) | 27/27 (100%) |
| **Fields with Enhanced States** | 0/27 (0%) | 27/27 (100%) |
| **Recipes Available** | 0 | 1 (AsyncSearchSelect) |
| **Visual Quality** | Functional | God Tier ✨ |
| **User Delight Score** | 6/10 | 10/10 🏆 |
| **Implementation Time** | N/A | 3 hours |

---

## 🚀 AFTER THE AFTERNOON: WHAT'S NEXT?

### Week 1: More Recipes
- DatePicker (presets, keyboard shortcuts)
- DragDropUpload (paste + drag + thumbnails)
- CurrencyInput (locale format, mask)

### Week 2: Advanced States
- Loading states (spinners, skeleton loaders)
- Progressive validation (live for simple, on-blur for complex)
- Async validation with `AbortController`

### Week 3: Polish & Measurement
- Color contrast audit (all states, both themes)
- Screen reader testing session
- Telemetry dashboard (field error rates, completion times)
- Visual regression testing (Percy/Chromatic)

---

## 💡 SYSTEMATIC ADVANTAGES

**The Factory Way:**

1. **Define Once, Apply Everywhere**
   - Add primitive CSS → All fields using that type get it
   - Update overlay → All generated fields inherit change
   - Create refiner rule → All existing code updated automatically

2. **No Manual Labor**
   - Generator picks correct primitive based on `spec.type`
   - Refiner enforces standards retroactively
   - Overlays codify best practices

3. **Quality by Default**
   - Can't forget to add `data-touched` (generator adds it)
   - Can't use wrong primitive (refiner fixes it)
   - Can't skip accessibility (overlays include it)

4. **Measurable Progress**
   - Batch analyzer shows compliance %
   - Telemetry tracks actual usage patterns
   - Visual inspector verifies touch targets

---

## 🎨 INSPIRATION REFERENCES

**Apple:** Restraint, immaculate spacing, motion aids comprehension  
**Airbnb:** Friendly clarity, warm micro-interactions, thoughtful error copy  
**Google (Material):** Strong affordances, predictable motion, robust a11y  
**WeWork:** Bold typography, decisive states, modern confidence  

**Our Approach:** Combine the best of all - flat (Apple), friendly (Airbnb), accessible (Google), confident (WeWork) - enforced systematically by the factory.

---

**Ready to Execute?** Start with Hour 1 - create the checkbox primitive and see it transform 1 field instantly. Then the system propagates that quality to all 27 fields automatically. 🚀✨
