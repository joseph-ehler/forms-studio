# Component Work Protocol - Cascade AI Operating Instructions

**PURPOSE**: Ensure Cascade follows canonical architecture pattern for ALL DS & Forms components

---

## 🚨 MANDATORY PRE-FLIGHT CHECKLIST

**Cascade MUST run this checklist BEFORE any component work. NO EXCEPTIONS.**

### Layer Classification
```
[ ] Is this DS (primitive/route/hook) or Forms (recipe/field)?
[ ] DS = owns shape/behavior via .css + hooks
[ ] Forms = composes DS primitives, NO .css files
```

### File Structure Verification
```
DS Components:
[ ] ComponentName.tsx (UI + ARIA)
[ ] ComponentName.css (tokens only)
[ ] index.ts (barrel export)
[ ] __tests__/shape-contract.test.ts
[ ] __tests__/a11y-contract.test.ts

Forms Recipes:
[ ] RecipeName.tsx (returns { Trigger, Overlay })
[ ] index.ts (barrel export)
[ ] __tests__/recipe.spec.ts
[ ] NO .css file (uses DS classes only)
```

### CSS/Styling Rules
```
DS Layer:
[ ] ONLY --ds-* tokens (no magic numbers)
[ ] BEM-ish classes (.ds-component__part)
[ ] Lock minimums (min-block-size: var(--ds-touch-target))
[ ] Logical properties (inset-inline, padding-inline)
[ ] Reduced motion (@media (prefers-reduced-motion: reduce))

Forms Layer:
[ ] NO CSS files
[ ] ONLY DS classes (.ds-input, .ds-option-button, .ds-button)
[ ] Layout wrappers OK (grid, stack) - no appearance
```

### Behavior Rules
```
[ ] Using DS hooks (useFocusTrap, useSubFlow, useOverlayPolicy)?
[ ] NOT writing custom focus/keyboard logic
[ ] SSR-safe (typeof window !== 'undefined')
[ ] Respects prefers-reduced-motion
```

### Accessibility Rules
```
[ ] ariaLabel or ariaLabelledBy REQUIRED (runtime + ESLint)
[ ] Correct role (dialog, complementary, option, listbox)
[ ] Modal: aria-modal="true" + focus trap + scroll lock
[ ] Non-modal: no trap, natural tab order
```

### Testing Rules
```
[ ] Shape contracts: min-height, touch targets, token usage
[ ] A11y contracts: ARIA, focus trap, keyboard navigation
[ ] E2E: Focus, keyboard, reduced motion, responsive
[ ] All tests pass before merge
```

---

## 🔴 ABSOLUTE RULES (NEVER BREAK)

### DS Layer - Component Ownership

**File Co-location** (REQUIRED):
```
✅ ComponentName.tsx + ComponentName.css + index.ts
❌ Separate CSS in shared folder
❌ CSS-in-JS (styled-components, emotion)
```

**Token Usage** (REQUIRED):
```css
/* ✅ CORRECT */
.ds-component {
  padding: var(--ds-space-4);
  background: var(--ds-color-surface-base);
  min-height: var(--ds-touch-target);
}

/* ❌ WRONG - magic numbers */
.ds-component {
  padding: 16px;
  background: #ffffff;
  min-height: 44px;
}
```

**Runtime Contracts** (REQUIRED):
```tsx
// ✅ CORRECT
export function Component({ ariaLabel }: Props) {
  if (process.env.NODE_ENV !== 'production') {
    if (!ariaLabel) throw new Error('[Component] ariaLabel required');
  }
  // ...
}

// ❌ WRONG - no validation
export function Component({ ariaLabel }: Props) {
  return <div aria-label={ariaLabel}>...</div>;
}
```

### Forms Layer - Composition Only

**Recipe Structure** (REQUIRED):
```tsx
// ✅ CORRECT - uses DS primitives
import { SheetDialog, Option } from '@intstudio/ds/primitives';

export const MyRecipe: Recipe = ({ spec }) => ({
  Trigger: ({ field }) => (
    <button className="ds-input">
      {field.value ?? 'Select'}
    </button>
  ),
  Overlay: ({ open, onClose, field }) => (
    <SheetDialog ariaLabel={spec.label} open={open} onClose={onClose}>
      <Option className="ds-option-button" />
    </SheetDialog>
  ),
});

// ❌ WRONG - custom CSS, custom primitives
import './MyRecipe.css'; // ❌ NO CSS in Forms

export const MyRecipe: Recipe = ({ spec }) => ({
  Trigger: ({ field }) => (
    <div style={{ padding: '16px' }}> {/* ❌ NO inline styles */}
      {field.value}
    </div>
  ),
  Overlay: () => (
    <div className="my-custom-dialog"> {/* ❌ Use DS primitives */}
      {/* ... */}
    </div>
  ),
});
```

---

## 🛑 RED FLAGS (STOP IMMEDIATELY)

**If Cascade finds itself doing ANY of these, STOP and ask user**:

```
❌ Writing inline styles in Forms → Use DS classes
❌ Creating .css in Forms → Belongs in DS layer
❌ Adding custom focus logic → Use useFocusTrap
❌ Hardcoding sizes/colors → Use --ds-* tokens
❌ Skipping ARIA props → Required by contract
❌ Not co-locating CSS → Component.css must be next to Component.tsx
❌ Magic numbers in CSS → Only tokens allowed
❌ Skipping tests → Shape + A11y + E2E required
❌ "This is special" → Follow pattern or mark as Lane B exception
```

---

## ✅ ENFORCEMENT WORKFLOW

### Phase 1: Before Code
1. **Read user request**
2. **Classify layer**: DS or Forms?
3. **Run pre-flight checklist** (all items above)
4. **Verify existing DS primitives** - can I reuse instead of create?
5. **If uncertain** → ASK USER, don't guess

### Phase 2: During Code
1. **DS**: tokens only, co-located CSS, hooks for behavior
2. **Forms**: DS primitives only, no CSS, thin wrappers
3. **Both**: ARIA required, SSR-safe, reduced motion
4. **Self-check**: Does this pass all checklist items?

### Phase 3: Before Proposing
1. **Tests added**: Shape + A11y + E2E
2. **Lint passes**: ESLint + Stylelint clean
3. **Docs updated**: CONTRIBUTING.md + COMPLETE_SYSTEM_REFERENCE.md
4. **Pattern followed**: Matches templates exactly

---

## 📋 TEMPLATES (USE EXACTLY AS-IS)

### DS Component Template

```tsx
// ComponentName.tsx
import './ComponentName.css';
import { useFocusTrap, useTelemetry } from '../../hooks';

export type ComponentNameProps = {
  ariaLabel: string; // REQUIRED
  onClose?: () => void;
  children: React.ReactNode;
};

export function ComponentName({ 
  ariaLabel, 
  onClose, 
  children 
}: ComponentNameProps) {
  // Runtime contract
  if (process.env.NODE_ENV !== 'production') {
    if (!ariaLabel) {
      throw new Error('[ComponentName] ariaLabel is required');
    }
  }

  const ref = useFocusTrap({ active: true });
  const telemetry = useTelemetry({ component: 'ComponentName' });

  return (
    <div
      className="ds-component"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      tabIndex={-1}
      ref={ref}
    >
      {children}
    </div>
  );
}
```

```css
/* ComponentName.css */
.ds-component {
  /* Shape guarantees */
  min-block-size: var(--ds-touch-target);
  
  /* Spacing */
  padding: var(--ds-space-4);
  gap: var(--ds-space-3);
  
  /* Colors */
  background: var(--ds-color-surface-base);
  border: 1px solid var(--ds-color-border-subtle);
  
  /* Layout */
  display: grid;
  grid-template-rows: auto 1fr;
  
  /* ONLY tokens - NO magic numbers */
}

@media (prefers-reduced-motion: reduce) {
  .ds-component {
    transition: none;
  }
}
```

### Forms Recipe Template

```tsx
// RecipeName.tsx - NO .css file!
import { SheetDialog, OverlayContent, Option } from '@intstudio/ds/primitives';
import { useTelemetry } from '@intstudio/ds/hooks';

export const RecipeName: Recipe = ({ spec, control }) => {
  const telemetry = useTelemetry({ component: 'RecipeName' });

  const Trigger = ({ field, hasError }) => (
    <button
      type="button"
      className={`ds-input ${hasError ? 'ds-input--error' : ''}`}
      aria-haspopup="listbox"
      onClick={() => telemetry('open')}
    >
      {field.value ?? spec.ui?.placeholder ?? 'Select'}
    </button>
  );

  const Overlay = ({ open, onClose, field }) => (
    <SheetDialog 
      ariaLabel={spec.label} 
      open={open} 
      onClose={onClose}
    >
      <OverlayContent>
        {spec.options?.map(opt => (
          <Option
            key={opt.value}
            className="ds-option-button"
            label={opt.label}
            selected={field.value === opt.value}
            onSelect={() => {
              field.onChange(opt.value);
              onClose();
            }}
          />
        ))}
      </OverlayContent>
    </SheetDialog>
  );

  return { Trigger, Overlay };
};
```

---

## 🔒 DEVIATION PROTOCOL

**Cascade can ONLY deviate if**:

1. **User explicitly says**: "This is an exception" or "Use bespoke/Lane B"
   - Then: Mark with `// @factory:refiner-ignore <rule>` pragma
   - Document why in code comment

2. **User asks**: "Create a new pattern"
   - Then: Document in CONTRIBUTING.md
   - Add to this checklist
   - Create tests/lint rules

3. **Otherwise**: MUST follow this protocol, NO shortcuts, NO "just this once"

---

## ✅ VERIFICATION COMMANDS

**Before proposing any component work, Cascade should verify**:

```bash
# Lint
pnpm lint                # ESLint + Stylelint
pnpm typecheck           # TypeScript

# Tests
pnpm test:unit           # Shape + A11y contracts
pnpm test:e2e            # Playwright

# Build
pnpm build               # Verify no errors
pnpm analyze             # Check bundle size
```

---

## 📊 SUCCESS METRICS

**Component work is COMPLETE when**:

- [x] Pre-flight checklist: ALL items checked
- [x] File structure: Matches template exactly
- [x] CSS: Tokens only (DS) or no CSS (Forms)
- [x] ARIA: Required props enforced
- [x] Tests: Shape + A11y + E2E passing
- [x] Lint: Clean (no errors, no warnings)
- [x] Docs: Updated (CONTRIBUTING.md, API reference)
- [x] Pattern: Matches canonical architecture

---

**This protocol is Cascade's operating system for ALL component work. It is non-negotiable and verified on every task.**
