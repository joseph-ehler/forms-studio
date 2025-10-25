# Button System Upgrade - Implementation Strategy

## Problem Analysis

**Current Issues:**
1. ❌ Secondary button uses Flowbite's `light` color → cyan border (not in DS)
2. ❌ Ghost button uses Flowbite's `gray` → light blue border
3. ❌ No hover state transitions (flat appearance)
4. ❌ Inconsistent with DS tokens
5. ❌ Weak visual hierarchy

**Root Cause:**
- Mapping semantic variants to Flowbite colors doesn't give us control
- Flowbite's built-in styles override our design language
- Missing state transitions (hover/active/focus)

---

## God-Tier Button System Requirements

### 1. Visual Hierarchy (Clear Emphasis)

**Primary (Highest emphasis):**
- Solid fill with brand color
- Used for primary CTAs
- Example: "Create Product", "Save", "Submit"

**Secondary (Medium emphasis):**
- Outlined with subtle fill
- Used for alternative actions
- Example: "Cancel", "Back", "Learn More"

**Ghost/Tertiary (Low emphasis):**
- Minimal styling, no border
- Used for low-priority actions
- Example: "Skip", "Maybe Later", "Dismiss"

**Danger (Destructive):**
- Red/warning color
- Used for destructive actions
- Example: "Delete", "Remove", "Cancel Subscription"

### 2. State System (Interactive Feedback)

Each variant needs **5 states:**
1. **Default** - Resting state
2. **Hover** - Slight darkening + optional shadow
3. **Active** - Pressed state (darker still)
4. **Focus** - Ring outline for keyboard nav
5. **Disabled** - Reduced opacity, no interaction

### 3. Design Tokens Mapping

```css
/* Primary */
--btn-primary-bg: var(--ds-color-primary);           /* #2F6FED */
--btn-primary-hover: var(--ds-color-primary-hover);  /* #1e5dd7 */
--btn-primary-active: #1a54c4;                       /* 10% darker */
--btn-primary-text: var(--ds-color-text-inverse);    /* white */

/* Secondary */
--btn-secondary-bg: transparent;
--btn-secondary-border: var(--ds-color-border-medium); /* #d1d5db */
--btn-secondary-hover-bg: var(--ds-color-surface-raised); /* #fafafa */
--btn-secondary-text: var(--ds-color-text);          /* #0b0b0c */

/* Ghost */
--btn-ghost-bg: transparent;
--btn-ghost-hover-bg: var(--ds-color-surface-raised); /* #fafafa */
--btn-ghost-text: var(--ds-color-text-subtle);       /* #6b7280 */

/* Danger */
--btn-danger-bg: var(--ds-color-danger);             /* #dc2626 */
--btn-danger-hover: #b91c1c;                         /* red-700 */
--btn-danger-text: var(--ds-color-text-inverse);     /* white */
```

---

## Implementation Strategy

### Option 1: Custom Button Component (RECOMMENDED)

**Pros:**
- ✅ Full control over styling
- ✅ DS tokens only, no Flowbite override battles
- ✅ Proper state transitions
- ✅ Smaller bundle (no unused Flowbite styles)

**Cons:**
- 🔧 Need to implement from scratch
- 🔧 More code to maintain

**Approach:**
1. Create `packages/ds/src/fb/Button.tsx` (replace current)
2. Create `packages/ds/src/fb/Button.css` (co-located styles)
3. Use CSS custom properties for theming
4. Add smooth transitions on hover/active
5. Use `:focus-visible` for keyboard focus rings

**Code Structure:**
```tsx
// Button.tsx
import './Button.css';

export function Button({ variant = 'primary', ... }) {
  return (
    <button
      className={`ds-button ds-button--${variant}`}
      data-component="button"
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  );
}
```

```css
/* Button.css */
.ds-button {
  /* Base styles using ONLY DS tokens */
  min-block-size: var(--ds-touch-target);
  padding-inline: var(--ds-space-4);
  border-radius: var(--ds-radius-lg);
  font-weight: 500;
  transition: all 150ms ease-out;
  
  /* Touch target enforcement */
  min-height: 44px;
}

.ds-button--primary {
  background: var(--ds-color-primary);
  color: var(--ds-color-text-inverse);
  border: none;
}

.ds-button--primary:hover:not(:disabled) {
  background: var(--ds-color-primary-hover);
  transform: translateY(-1px); /* Subtle lift */
  box-shadow: 0 2px 8px rgba(47, 111, 237, 0.25);
}

.ds-button--secondary {
  background: transparent;
  color: var(--ds-color-text);
  border: 1px solid var(--ds-color-border-medium);
}

.ds-button--secondary:hover:not(:disabled) {
  background: var(--ds-color-surface-raised);
  border-color: var(--ds-color-border-strong);
}

/* ... etc for ghost, danger */
```

---

### Option 2: Flowbite Theme Override (FASTER, LESS CONTROL)

**Pros:**
- ✅ Faster to implement
- ✅ Keep Flowbite infrastructure

**Cons:**
- ❌ Still fighting Flowbite's defaults
- ❌ Less control over states
- ❌ Larger bundle

**Approach:**
1. Extend Tailwind config with custom Flowbite theme
2. Override button colors in `tailwind.config.js`
3. Add custom CSS for hover states

**Code:**
```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      // Override Flowbite button theme
      colors: {
        // Make 'light' map to our secondary style
        light: {
          DEFAULT: '#ffffff',
          hover: '#fafafa',
        },
        // Make 'gray' map to our ghost style
        gray: {
          50: 'transparent',
          100: '#fafafa',
          // ...
        },
      },
    },
  },
};
```

---

## Recommended Implementation Plan

### Phase 1: Custom Button (Week 1)

**Day 1-2: Build Core Button**
1. Create `Button.tsx` and `Button.css`
2. Implement 4 variants with DS tokens
3. Add 5 states per variant
4. Add loading state
5. Add size variants (sm, md, lg)

**Day 3: Stories & Tests**
1. Create `Button.stories.tsx` with all variants
2. Add visual regression tests
3. Add accessibility tests (axe)
4. Add keyboard navigation tests

**Day 4: Integration**
1. Update Golden Demo to use new button
2. Add to barrel exports
3. Update documentation

**Day 5: Polish**
1. Fine-tune transitions
2. Test on mobile (touch targets)
3. Test keyboard navigation
4. Get design review

### Phase 2: Migration (Week 2)

**Automated:**
1. Create codemod: `flowbite-button-to-ds`
2. Transform: `<FlowbiteButton color="blue">` → `<Button variant="primary">`
3. Run across codebase

**Manual:**
1. Spot-check migrated components
2. Update any custom button usage
3. Remove Flowbite Button imports

---

## Visual Spec (Exact Values)

### Primary Button
```
Default:
- bg: #2F6FED
- text: #ffffff
- border: none
- shadow: none

Hover:
- bg: #1e5dd7
- shadow: 0 2px 8px rgba(47, 111, 237, 0.25)
- transform: translateY(-1px)

Active:
- bg: #1a54c4
- transform: translateY(0)

Focus:
- outline: 2px solid #2F6FED
- outline-offset: 2px

Disabled:
- opacity: 0.5
- cursor: not-allowed
```

### Secondary Button
```
Default:
- bg: transparent
- text: #0b0b0c
- border: 1px solid #d1d5db
- shadow: none

Hover:
- bg: #fafafa
- border: 1px solid #9ca3af

Active:
- bg: #f5f5f5

Focus:
- outline: 2px solid #2F6FED
- outline-offset: 2px

Disabled:
- opacity: 0.5
- cursor: not-allowed
```

### Ghost Button
```
Default:
- bg: transparent
- text: #6b7280
- border: none
- shadow: none

Hover:
- bg: #fafafa
- text: #0b0b0c

Active:
- bg: #f5f5f5

Focus:
- outline: 2px solid #2F6FED
- outline-offset: 2px

Disabled:
- opacity: 0.5
- cursor: not-allowed
```

### Danger Button
```
Default:
- bg: #dc2626
- text: #ffffff
- border: none
- shadow: none

Hover:
- bg: #b91c1c
- shadow: 0 2px 8px rgba(220, 38, 38, 0.25)
- transform: translateY(-1px)

Active:
- bg: #991b1b
- transform: translateY(0)

Focus:
- outline: 2px solid #dc2626
- outline-offset: 2px

Disabled:
- opacity: 0.5
- cursor: not-allowed
```

---

## Success Metrics

**Visual:**
- ✅ Clear hierarchy (can tell primary from secondary at a glance)
- ✅ Smooth transitions (no jarring color jumps)
- ✅ Accessible contrast (WCAG AA minimum)

**Functional:**
- ✅ Touch targets ≥ 44px
- ✅ Keyboard navigable
- ✅ Screen reader friendly
- ✅ Loading states

**Technical:**
- ✅ Uses DS tokens only
- ✅ No magic numbers
- ✅ Co-located CSS
- ✅ Type-safe variants

---

## Next Steps

**Immediate (Tonight):**
1. Review this strategy
2. Choose Option 1 (custom) or Option 2 (override)
3. Approve visual spec

**Tomorrow:**
1. Implement Button.tsx + Button.css
2. Add to Storybook
3. Test in Golden Demo

**This Week:**
1. Polish & iterate
2. Get design approval
3. Migrate codebase

---

**Recommendation:** Go with **Option 1 (Custom Button)** for god-tier quality. We'll have full control, cleaner code, and it sets the pattern for future wrappers.
