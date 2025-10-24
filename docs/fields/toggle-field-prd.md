# PRD: ToggleField Primitive Migration

**Status:** 🟡 Planning  
**Priority:** HIGH  
**Estimated Effort:** 2-3 hours  
**Dependencies:** CheckboxField pilot (✅ Complete)

---

## Executive Summary

Migrate ToggleField from using generic `.ds-input` to a dedicated `.ds-toggle` primitive, following the proven pattern from CheckboxField pilot. A toggle switch is semantically and visually distinct from a checkbox and deserves its own primitive.

**Problem**: ToggleField currently uses `.ds-input` (text input styling), causing:
- ❌ Visual confusion (looks like text field, not toggle switch)
- ❌ Missing platform affordances (no pill track + sliding thumb)
- ❌ Inconsistent semantics (checkbox styling for switch behavior)

**Solution**: Create `.ds-toggle` primitive with proper switch UI.

---

## Success Criteria

### Must Have (P0)
- [ ] **DS Primitive**: `.ds-toggle` CSS with pill track + sliding thumb
- [ ] **Visual States**: Off, On, Focus, Hover, Disabled, Invalid
- [ ] **Semantic HTML**: `<input type="checkbox" role="switch">`
- [ ] **ARIA Complete**: `aria-checked`, `aria-describedby`, `aria-invalid`
- [ ] **Touch Target**: ≥ 44×44px tappable area (via label wrap)
- [ ] **WCAG AA**: All color combinations meet 4.5:1 contrast
- [ ] **Recipe**: `ToggleRecipe.ts` generates `.ds-toggle` (not `.ds-input`)
- [ ] **Refiner**: `enforce-toggle-primitive-v1.0.mjs` auto-fixes violations
- [ ] **Generator**: Dispatch routes `type: 'toggle'` to ToggleRecipe
- [ ] **Tests**: 25+ unit tests covering primitive, ARIA, keyboard, states

### Should Have (P1)
- [ ] **Size Variants**: `sm` (32×18px), `md` (40×22px, default), `lg` (48×26px)
- [ ] **Labels**: Support `onLabel` and `offLabel` (optional)
- [ ] **Animation**: Smooth thumb slide transition (200ms ease)
- [ ] **Storybook**: 8+ stories covering all states and sizes

### Nice to Have (P2)
- [ ] **Loading State**: Spinning indicator while async operation pending
- [ ] **Icons**: Support custom icons in thumb (e.g., ✓/✗)

---

## Technical Specification

### 1. DS Primitive (`packages/ds/src/styles/components/ds-toggle.css`)

```css
/**
 * Toggle Switch Primitive
 * 
 * Semantics: <input type="checkbox" role="switch">
 * Sizing: 40×22px default (md), with sm/lg variants
 * Interaction: Click track or label, keyboard Space/Enter
 * States: off, on, focus, hover, disabled, invalid
 */

@layer components {
  /* Container (hidden input + visible track) */
  .ds-toggle {
    /* Position & Layout */
    position: relative;
    display: inline-block;
    width: var(--ds-toggle-width, 40px);
    height: var(--ds-toggle-height, 22px);
    
    /* Hide native checkbox */
    appearance: none;
    -webkit-appearance: none;
    
    /* Track (pill shape) */
    background: var(--ds-color-neutral-300);
    border-radius: var(--ds-toggle-height);
    border: 1px solid var(--ds-color-neutral-400);
    
    /* Thumb (pseudo-element) */
    cursor: pointer;
    transition: background-color 200ms ease, border-color 200ms ease;
  }
  
  /* Thumb */
  .ds-toggle::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: calc(var(--ds-toggle-height) - 6px);
    height: calc(var(--ds-toggle-height) - 6px);
    background: white;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: transform 200ms ease;
  }
  
  /* States */
  .ds-toggle:checked {
    background: var(--ds-color-primary-bg);
    border-color: var(--ds-color-primary-border);
  }
  
  .ds-toggle:checked::before {
    transform: translateX(calc(var(--ds-toggle-width) - var(--ds-toggle-height) + 2px));
  }
  
  .ds-toggle:focus-visible {
    outline: 2px solid var(--ds-color-focus-ring);
    outline-offset: 2px;
  }
  
  .ds-toggle:hover:not(:disabled) {
    border-color: var(--ds-color-neutral-500);
  }
  
  .ds-toggle:checked:hover:not(:disabled) {
    background: var(--ds-color-primary-hover);
  }
  
  .ds-toggle:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .ds-toggle[aria-invalid="true"] {
    border-color: var(--ds-color-state-danger);
  }
  
  /* Size Variants */
  .ds-toggle--sm {
    --ds-toggle-width: 32px;
    --ds-toggle-height: 18px;
  }
  
  .ds-toggle--lg {
    --ds-toggle-width: 48px;
    --ds-toggle-height: 26px;
  }
}
```

**Token Requirements**:
- `--ds-color-neutral-300` (off bg)
- `--ds-color-neutral-400` (off border)
- `--ds-color-primary-bg` (on bg)
- `--ds-color-primary-border` (on border)
- `--ds-color-primary-hover` (on hover)
- `--ds-color-focus-ring` (focus)
- `--ds-color-state-danger` (invalid)

---

### 2. Factory Recipe (`packages/forms/src/factory/recipes/ToggleRecipe.ts`)

```typescript
/**
 * ToggleRecipe - Type-aware template for toggle switches
 * 
 * Differences from CheckboxRecipe:
 * - Uses role="switch" for semantics
 * - Emits .ds-toggle (not .ds-checkbox)
 * - Supports size variants (sm, md, lg)
 * - Optional onLabel/offLabel
 */

export interface ToggleSpec {
  name: string;
  type: 'toggle';
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  ui?: {
    size?: 'sm' | 'md' | 'lg';
    onLabel?: string;   // e.g., "Enabled"
    offLabel?: string;  // e.g., "Disabled"
  };
  value?: {
    default?: boolean;
  };
}

export function ToggleRecipe(spec: ToggleSpec): string {
  const { name, label, description, required = false, disabled = false, ui = {}, value = {} } = spec;
  const { size = 'md', onLabel, offLabel } = ui;
  const defaultValue = value.default ?? false;
  
  const sizeClass = size !== 'md' ? ` ds-toggle--${size}` : '';
  const stateLabel = onLabel && offLabel 
    ? `{field.value ? '${onLabel}' : '${offLabel}'}`
    : '';
  
  return `
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { FormLabel, FormHelperText } from '@intstudio/ds';

interface ${capitalize(name)}Props {
  name: string;
  control: Control;
  errors: FieldErrors;
  label?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
}

export function ${capitalize(name)}({
  name,
  control,
  errors,
  label = '${label || ''}',
  description = '${description || ''}',
  disabled = ${disabled},
  required = ${required},
}: ${capitalize(name)}Props) {
  const error = errors[name];
  const hasError = !!error;
  
  return (
    <div>
      <Controller
        name={name}
        control={control}
        defaultValue={${defaultValue}}
        rules={{ required: required ? 'This field is required' : undefined }}
        render={({ field }) => (
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', minHeight: '44px', cursor: disabled ? 'not-allowed' : 'pointer' }}>
            <input
              {...field}
              type="checkbox"
              role="switch"
              className="ds-toggle${sizeClass}"
              id={name}
              aria-invalid={hasError || undefined}
              aria-describedby={description ? \`\${name}-desc\` : undefined}
              aria-required={required || undefined}
              checked={field.value ?? ${defaultValue}}
              onChange={(e) => field.onChange(e.target.checked)}
              onBlur={field.onBlur}
              disabled={disabled}
            />
            {label && (
              <span style={{ userSelect: 'none', opacity: disabled ? 0.5 : 1 }}>
                {label}
                {required && <span style={{ color: 'var(--ds-color-state-danger)', marginLeft: '0.25rem' }}>*</span>}
                ${stateLabel ? `<span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: 'var(--ds-color-text-muted)' }}>{${stateLabel}}</span>` : ''}
              </span>
            )}
          </label>
        )}
      />
      
      {description && (
        <div id={\`\${name}-desc\`}>
          <FormHelperText size="sm" aria-live="polite">
            {description}
          </FormHelperText>
        </div>
      )}
      
      {hasError && (
        <div>
          <FormHelperText size="sm" variant="error" aria-live="assertive">
            {error?.message as string}
          </FormHelperText>
        </div>
      )}
    </div>
  );
}
`;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
```

---

### 3. Generator Dispatch

Update `scripts/process/field-from-spec-v2.mjs`:

```javascript
// Add to selectRecipe()
if (spec.type === 'toggle') {
  const { ToggleRecipe } = await import('../packages/forms/src/factory/recipes/ToggleRecipe.ts');
  return ToggleRecipe(spec);
}
```

---

### 4. Refiner Guard (`scripts/refiner/transforms/enforce-toggle-primitive-v1.0.mjs`)

```javascript
/**
 * Refiner Transform: Enforce Toggle Primitive v1.0
 * 
 * Detects: <input type="checkbox" role="switch"> with wrong classes
 * Fixes: .ds-input → .ds-toggle, removes w-full
 */

export function enforceTogglePrimitiveV1_0() {
  return {
    name: 'enforce-toggle-primitive-v1.0',
    apply: async ({ file, code }) => {
      const issues = [];
      let modified = false;
      
      // AST parsing logic similar to enforce-checkbox-primitive
      // Look for: type="checkbox" + role="switch" + className contains .ds-input
      // Replace: .ds-input → .ds-toggle, remove w-full
      
      // ... (implementation)
      
      return { changed: modified, code, issues };
    },
  };
}
```

---

## Acceptance Criteria

### Visual Design
- [ ] Toggle looks like a pill switch (not a checkbox)
- [ ] Thumb slides smoothly (200ms transition)
- [ ] Off state: gray track, left-aligned thumb
- [ ] On state: primary color track, right-aligned thumb
- [ ] Focus ring visible and meets WCAG (2px, high contrast)
- [ ] All states visually distinct

### Semantics & A11y
- [ ] Uses `<input type="checkbox" role="switch">`
- [ ] Screen reader announces "switch" (not "checkbox")
- [ ] `aria-checked="true"` / `"false"` reflects state
- [ ] `aria-describedby` connects to description
- [ ] `aria-invalid="true"` on error
- [ ] Label wraps input (≥ 44×44px hit area)

### Keyboard Interaction
- [ ] Tab to focus toggle
- [ ] Space or Enter toggles state
- [ ] Focus ring visible during keyboard nav
- [ ] Disabled state prevents interaction

### Factory Integration
- [ ] `type: 'toggle'` routes to ToggleRecipe
- [ ] Generated code passes refiner (zero violations)
- [ ] Recipe respects `ui.size` variant
- [ ] Recipe handles `onLabel`/`offLabel` if provided

### Tests
- [ ] 25+ unit tests pass
- [ ] Primitive class check (`.ds-toggle` not `.ds-input`)
- [ ] RHF integration (boolean value)
- [ ] ARIA attributes present
- [ ] Keyboard navigation works
- [ ] Size variants apply correctly
- [ ] Disabled/error states render

### Storybook
- [ ] 8 stories: Basic, On, Disabled, WithError, Sizes (sm/md/lg), WithLabels, Required
- [ ] Visual regression screenshots
- [ ] Accessibility panel green (zero violations)

---

## Migration Checklist

### Pre-Work
- [ ] Review CheckboxField pilot artifacts
- [ ] Confirm design tokens exist (primary colors, focus ring)
- [ ] Check if ToggleField component exists (if not, generate new)

### DS Package
- [ ] Create `packages/ds/src/styles/components/ds-toggle.css`
- [ ] Import in `packages/ds/src/styles/components/ds-inputs.css`
- [ ] Build DS: `pnpm --filter @intstudio/ds build`
- [ ] Verify CSS in dist/index.css

### Factory
- [ ] Create `packages/forms/src/factory/recipes/ToggleRecipe.ts`
- [ ] Update `scripts/process/field-from-spec-v2.mjs` (add toggle dispatch)
- [ ] Test generator: `echo '{"name":"testToggle","type":"toggle"}' | node scripts/process/field-from-spec-v2.mjs`

### Refiner
- [ ] Create `scripts/refiner/transforms/enforce-toggle-primitive-v1.0.mjs`
- [ ] Register in `scripts/refiner/index.mjs`
- [ ] Test: `pnpm refine:dry --scope='packages/forms/src/fields/ToggleField/**'`

### Component
- [ ] Generate or update `packages/forms/src/fields/ToggleField/ToggleField.tsx`
- [ ] Verify uses `.ds-toggle` (not `.ds-input`)
- [ ] Build Forms: `pnpm --filter @intstudio/forms build`

### Stories & Tests
- [ ] Create `ToggleField.stories.tsx` (8 stories)
- [ ] Create `ToggleField.test.tsx` (25+ tests)
- [ ] Run tests: `pnpm test`
- [ ] Visual check in Storybook

### Validation
- [ ] Run refiner: `pnpm refine:dry` (should pass)
- [ ] Run analyzer: `node scripts/analyzer/analyze-batch.mjs --quiet "packages/forms/src/fields/**/*.tsx"`
- [ ] Check ToggleField compliance: should show `.ds-toggle` usage
- [ ] Manual QA: Tab, Space, click label, error state, disabled

### Commit
- [ ] Stage files
- [ ] Run pre-commit hooks (name-police, import-doctor)
- [ ] Commit with structured message (see CheckboxField example)

---

## Rollback Plan

If issues discovered post-merge:

1. **Revert commit**: `git revert <commit-hash>`
2. **Disable refiner transform**: Comment out in `scripts/refiner/index.mjs`
3. **Document issue**: Add to `docs/postmortems/`
4. **Fix in isolation**: Use `packages/labs/` for experimentation
5. **Re-pilot**: Repeat migration with fixes

---

## Dependencies

### Blocked By
- ✅ CheckboxField pilot (complete)

### Blocks
- RatingField (can start after toggle proven)
- SliderField (can start after toggle proven)

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Toggle CSS conflicts with checkbox | Low | Medium | Use distinct class (`.ds-toggle` vs `.ds-checkbox`) |
| Touch target too small | Medium | High | Label wraps input (≥ 44px), test manually |
| Animation janky | Low | Low | Use GPU-accelerated transform, test on mobile |
| Existing fields break | Low | High | Refiner only targets `role="switch"`, not all checkboxes |

---

## Success Metrics

**Before**:
- ToggleField uses `.ds-input` ❌
- Contrast ratio: Unknown
- ARIA complete: ?

**After**:
- ToggleField uses `.ds-toggle` ✅
- Contrast ratio: ≥ 4.5:1 (WCAG AA) ✅
- ARIA complete: 100% ✅
- Touch target: ≥ 44×44px ✅
- Refiner catches violations: ✅

---

## Next Steps (After Completion)

1. Update `docs/fields/FIELD_PRIMITIVES_MAP.md`
2. Run global refiner: `pnpm refine:run` (fix any lingering violations)
3. Update compliance dashboard
4. Start next field: RatingField

---

## References

- CheckboxField pilot: `scripts/ai_out/checkbox-pilot/`
- WCAG 2.1 AA: https://www.w3.org/WAI/WCAG21/quickref/
- Switch pattern: https://www.w3.org/WAI/ARIA/apg/patterns/switch/
- Touch targets: https://www.w3.org/WAI/WCAG21/Understanding/target-size.html

---

**Approved By**: _____________  
**Date**: _____________  
**Estimated Start**: _____________  
**Target Completion**: _____________
