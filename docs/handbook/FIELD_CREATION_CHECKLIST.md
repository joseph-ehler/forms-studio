# Field Creation Checklist

**Use this checklist for EVERY new field component to ensure consistency and quality.**

---

## Phase 1: Planning

- [ ] **Check existing fields** - Is there a similar field you can reference?
- [ ] **Review DS primitives** - What classes/components can you reuse?
  - `.ds-input` - text inputs, selects, textareas
  - `.ds-button` - buttons
  - `.ds-checkbox` - checkboxes  
  - `.ds-toggle` - toggle switches
  - `OverlayPicker` - dropdowns, date pickers
  - `FormLabel`, `FormHelperText` - labels and helper text
- [ ] **Write PRD** - Document user stories, edge cases, accessibility requirements

---

## Phase 2: Implementation

### File Structure
- [ ] Create in `packages/forms/src/fields/[FieldName]/`
- [ ] **Do NOT create `.new` or `.old` files** - replace directly
- [ ] Create `index.ts` barrel export

### Component Code
- [ ] **Use DS primitives** - Apply `.ds-input`, `.ds-button`, etc. as className
- [ ] **NO inline styles for layout** - Only override specific behavior
  ```tsx
  // ✅ GOOD
  <input className="ds-input" style={{ padding: '12px 40px 12px 16px' }} />
  
  // ❌ BAD
  <input style={{ width: '100%', border: '1px solid...', padding: '...' }} />
  ```

- [ ] **Use inline SVG or DS icons** - No external icon libraries
  ```tsx
  // ✅ GOOD
  const ChevronDown = () => (
    <svg width={20} height={20} viewBox="0 0 24 24">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
  
  // ❌ BAD
  import { ChevronDown } from 'lucide-react';
  ```

- [ ] **React Hook Form integration** - Use `Controller` from RHF
- [ ] **Props interface** - Extend `FieldComponentProps<T>`
  ```tsx
  export interface SelectFieldProps extends FieldComponentProps {
    options: SelectOption[];
    searchable?: boolean;
    clearable?: boolean;
  }
  ```

### Accessibility
- [ ] **ARIA attributes** - role, aria-invalid, aria-describedby, aria-required
- [ ] **Keyboard navigation** - Arrow keys, Enter, Escape, Tab
- [ ] **Focus management** - returnFocus, focus trap (for overlays)
- [ ] **Screen reader** - Descriptive labels, live regions for changes

### Error Handling
- [ ] **Validation** - Show error via `FormHelperText variant="error"`
- [ ] **Error state** - Apply error styling (red border)
- [ ] **ARIA** - Set `aria-invalid="true"` when error exists

---

## Phase 3: Testing

### Storybook Stories
- [ ] **Create `[FieldName].stories.tsx`**
- [ ] Include these stories:
  1. Basic
  2. Required (with validation)
  3. Disabled
  4. With Error
  5. With Description
  6. Variants (if applicable)
  7. Interactive form example

### Manual Testing
- [ ] **Desktop** - Chrome, Firefox, Safari
- [ ] **Mobile** - iOS Safari, Android Chrome
- [ ] **Keyboard only** - Tab, Arrow keys, Enter, Escape
- [ ] **Screen reader** - VoiceOver (Mac) or NVDA (Windows)

### Automated Testing
- [ ] **Unit tests** - Vitest for logic
- [ ] **Integration tests** - Playwright for interactions
- [ ] **Visual regression** - Percy/Chromatic snapshots

---

## Phase 4: Integration

### Demo App
- [ ] **Add to FieldShowcase.tsx** - Import from source during dev:
  ```tsx
  import { FieldName } from '../../forms/src/fields/FieldName/FieldName';
  ```
- [ ] **Add to schema** - Zod validation
- [ ] **Add to form** - With realistic props/options
- [ ] **Test hot reload** - Make a change, verify instant update

### Barrel Exports
- [ ] **Update `fields/index.ts`**:
  ```tsx
  export * from './FieldName';
  ```
- [ ] **Verify export works**:
  ```tsx
  import { FieldName } from '@intstudio/forms/fields';
  ```

---

## Phase 5: Quality Gates

### Refiner
- [ ] **Run refiner dry-run**: `pnpm refine:dry`
- [ ] **Fix issues**: `pnpm refine:run`
- [ ] **Verify clean**: No violations

### Linting
- [ ] **ESLint passes**: `pnpm lint`
- [ ] **Type check passes**: `pnpm typecheck`
- [ ] **No import violations**: Import Doctor clean

### Build
- [ ] **Package builds**: `pnpm --filter @intstudio/forms build`
- [ ] **No TypeScript errors**
- [ ] **No console warnings**

---

## Phase 6: Documentation

- [ ] **Update README** - Add field to list with description
- [ ] **Write usage guide** - Basic example in field README
- [ ] **Document props** - All props with types and defaults
- [ ] **Add to PRD** - Link from docs/fields/[field-name]-prd.md

---

## Phase 7: Commit

### Commit Message Format
```
feat(fields): add [FieldName]

## Features
- Feature 1
- Feature 2

## Storybook
- Story 1
- Story 2

## Testing
- Unit tests
- Keyboard navigation
- Accessibility audit

## Related
- Closes #123
- Implements PRD: docs/fields/[field-name]-prd.md
```

### Files to Commit
- [ ] Component files
- [ ] Storybook stories
- [ ] Tests
- [ ] Barrel exports
- [ ] Demo app changes
- [ ] PRD document
- [ ] Updated README

---

## Common Pitfalls to Avoid

### ❌ DON'T
1. Create `.new`, `.old`, `.backup` files
2. Use external icon libraries
3. Duplicate DS styles with inline styles
4. Import from built package during dev
5. Skip accessibility attributes
6. Forget barrel exports
7. Hard-code colors/spacing (use tokens)

### ✅ DO
1. Replace files directly (git history is your backup)
2. Use inline SVG or DS icons
3. Apply DS classes, only override specifics
4. Import from source during dev
5. Add full ARIA attributes
6. Export through `index.ts`
7. Use design tokens (var(--ds-color-...))

---

## Quick Reference: DS Classes

| Element | Class | Usage |
|---------|-------|-------|
| Text Input | `.ds-input` | `<input className="ds-input" />` |
| Textarea | `.ds-input .ds-textarea` | `<textarea className="ds-input ds-textarea" />` |
| Button | `.ds-button` | `<button className="ds-button">` |
| Checkbox | `.ds-checkbox` | `<input type="checkbox" className="ds-checkbox" />` |
| Toggle | `.ds-toggle` | `<input type="checkbox" role="switch" className="ds-toggle" />` |
| Select (custom) | `.ds-input` | Button trigger uses `.ds-input` |

**Full list:** `packages/ds/src/styles/components/`

---

## Success Criteria

✅ **Field is complete when:**
- Renders with DS styling (no custom layout styles)
- Works on mobile + desktop
- Keyboard navigable
- Screen reader accessible
- Has 5+ Storybook stories
- Passes refiner checks
- Passes all tests
- Documented with examples

---

**Use this checklist as a template for every field. Check off items as you go. Commit when 100% complete.**
