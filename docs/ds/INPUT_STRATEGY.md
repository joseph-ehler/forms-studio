# Input Strategy & Implementation

**Philosophy:** Inputs are the primary interface for data collection. They must be consistent, accessible, beautiful, and impossible to use incorrectly.

---

## Core Strategy

### 1. Single Source of Truth
**All input styling lives in ONE file:** `packages/ds/src/styles/components/ds-inputs.css`

```
✅ DS package imports ds-inputs.css ONCE
✅ Fields use .ds-input class
❌ Fields NEVER import CSS
❌ Fields NEVER define inline styles (except for icon positioning)
```

**Result:** Change once, update everywhere.

---

## The Three Input Primitives

### A. `.ds-input` - Actual Input Elements
**Purpose:** Style real HTML `<input>`, `<textarea>`, `<select>` elements

**Usage:**
```tsx
<input 
  type="text"
  className="ds-input"
  placeholder="Enter text..."
/>
```

**Characteristics:**
- **Semantic HTML:** Real form control
- **Native behavior:** Type ahead, autocomplete, validation
- **Editable:** User can type
- **Submittable:** Part of form data

**Use Cases:**
- TextField (text, email, tel, url)
- TextareaField
- NumberField
- DateField (native date input)
- SearchInput (in overlays)

---

### B. `.ds-select-trigger` - Button Styled as Input (The "Input Button")
**Purpose:** A `<button>` that LOOKS like an input but ACTS like a button

**Usage:**
```tsx
<button
  type="button"
  className="ds-select-trigger"
  onClick={openOverlay}
  aria-haspopup="listbox"
  aria-expanded={isOpen}
  data-placeholder={!value}
>
  {value?.label || "Select an option..."}
  <ChevronIcon />
</button>
```

**Characteristics:**
- **Visual consistency:** Looks identical to .ds-input
- **Button semantics:** `type="button"`, `onClick`, `cursor: pointer`
- **Not editable:** No typing, clicking opens overlay
- **Flexbox layout:** `display: flex` for label + icon
- **Pointer cursor:** Indicates clickability

**Key Differences from .ds-input:**
```css
.ds-select-trigger {
  /* SAME as .ds-input */
  width: 100%;
  min-height: 48px;
  padding: 12px 16px;
  border: 1px solid var(--ds-color-border-subtle);
  border-radius: 6px;
  background: var(--ds-color-surface-base);
  
  /* DIFFERENT - Button-specific */
  cursor: pointer;                    /* ← Clickable indicator */
  display: flex;                      /* ← Layout for content + icon */
  align-items: center;                /* ← Vertical centering */
  justify-content: space-between;     /* ← Push icon to right */
  gap: var(--ds-space-2);            /* ← Space between text and icon */
}
```

**Use Cases:**
- SelectField (single select with overlay)
- MultiSelectField (multi-select with overlay)
- DateRangeField (triggers calendar overlay)
- ComboBoxField (triggers searchable list)
- Any field where clicking opens an overlay

**Why Not Just Use `.ds-input`?**
1. **Semantics:** Buttons trigger actions, inputs accept text
2. **A11y:** Screen readers announce "button" vs "textbox"
3. **Behavior:** Buttons don't show keyboard, don't have caret
4. **Styling needs:** Need flexbox for icon positioning

---

### C. `.ds-option-button` - List Items in Overlays
**Purpose:** Buttons inside dropdowns/overlays that represent choices

**Usage:**
```tsx
<button
  type="button"
  role="option"
  aria-selected={isSelected}
  className="ds-option-button"
>
  {option.label}
</button>
```

**Characteristics:**
- **Different appearance:** Not styled like input
- **6px border radius:** Rounded corners (pill-like)
- **No border by default:** Clean list appearance
- **Hover scrim:** Overlay effect on hover
- **Selected state:** Primary blue background

**Use Cases:**
- Options in SelectField overlay
- Options in MultiSelectField overlay
- Choices in any picker overlay

---

## Design Principles

### 1. Flat by Default (No Shadows)
```css
.ds-input {
  box-shadow: none; /* FLAT surface */
}

.ds-input:focus {
  box-shadow: 0 0 0 2px var(--ds-color-primary-bg); /* Ring on focus only */
}
```

**Why:** User preference - clean, modern, less visual noise

### 2. Blue Ring Reserved for Focus
```css
/* Hover: Subtle background change */
.ds-input:hover:not(:focus) {
  background-color: var(--ds-color-surface-subtle);
  border-color: var(--ds-color-border-strong);
}

/* Focus: 2px blue ring */
.ds-input:focus {
  box-shadow: 0 0 0 2px var(--ds-color-primary-bg);
  border-color: var(--ds-color-primary-bg);
}
```

**Why:** Blue is attention-grabbing - reserve for actual keyboard focus

### 3. Validation States Don't Override Focus
```css
.ds-input[aria-invalid="true"]:focus {
  border-color: var(--ds-color-state-danger); /* Error border */
  box-shadow: 0 0 0 2px var(--ds-color-primary-bg); /* But focus ring stays blue */
}
```

**Why:** Focus indication is more important than validation state

### 4. 16px Font Size (Prevents iOS Zoom)
```css
.ds-input {
  font-size: 16px; /* iOS won't zoom if >= 16px */
}
```

**Why:** Prevents jarring zoom on iOS when focusing inputs

### 5. 48px Min Height (Touch Targets)
```css
.ds-input {
  min-height: 48px; /* WCAG AA: 44px minimum, we use 48px */
}
```

**Why:** Thumb-friendly on mobile, accessible

### 6. Design Tokens for Everything
```css
.ds-input {
  padding: var(--ds-space-3) var(--ds-space-4); /* Not 12px 16px */
  border-radius: 6px; /* From RADIUS_TOKENS */
  transition: background-color 150ms ease; /* From TRANSITION_TOKENS */
}
```

**Why:** Single source of truth, themeable, consistent

---

## State Machine

### Input States (Priority Order)
```
1. Disabled       (highest priority - overrides everything)
2. Read-only      (not editable, but visible)
3. Loading        (async validation in progress)
4. Error          (validation failed)
5. Warning        (soft validation issue)
6. Success        (validated successfully)
7. Focus          (keyboard focus)
8. Hover          (mouse over)
9. Default        (resting state)
```

### Visual Hierarchy
```css
/* Default */
border: 1px solid var(--ds-color-border-subtle);
background: var(--ds-color-surface-base);

/* Hover */
background: var(--ds-color-surface-subtle); /* Slightly darker */
border: 1px solid var(--ds-color-border-strong); /* Darker border */

/* Focus */
border: 1px solid var(--ds-color-primary-bg); /* Blue border */
box-shadow: 0 0 0 2px var(--ds-color-primary-bg); /* Blue ring */

/* Error */
border: 1px solid var(--ds-color-state-danger); /* Red border */
background: rgba(239, 68, 68, 0.05); /* Light red tint */

/* Disabled */
background: var(--ds-color-surface-subtle);
opacity: 0.6;
border-style: dashed;
cursor: not-allowed;
```

---

## Implementation Examples

### TextField (Standard Input)
```tsx
<input
  type="text"
  className="ds-input"
  placeholder="Enter your name"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  aria-invalid={hasError || undefined}
/>
```

**Result:** Standard text input with all DS styling

---

### SelectField (Input Button + Overlay)
```tsx
{/* Trigger - Looks like input, acts like button */}
<button
  type="button"
  className="ds-select-trigger"
  onClick={() => setIsOpen(true)}
  aria-haspopup="listbox"
  aria-expanded={isOpen}
  aria-invalid={hasError || undefined}
  data-placeholder={!value || undefined}
  style={{
    paddingRight: '40px', // Space for chevron
  }}
>
  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
    {value?.label || "Select country..."}
  </span>
  <ChevronIcon />
</button>

{/* Overlay */}
{isOpen && (
  <Overlay>
    <SearchInput className="ds-input ds-input--sm" />
    <OptionList className="ds-option-list">
      {options.map(option => (
        <button
          type="button"
          role="option"
          aria-selected={value === option.value}
          className="ds-option-button"
          style={{ padding: '10px 16px' }} // Inline until CSS builds
        >
          {option.label}
        </button>
      ))}
    </OptionList>
  </Overlay>
)}
```

**Result:** 
- Trigger looks identical to text input
- Click opens overlay (doesn't try to type)
- Options styled for list context

---

### DateRangeField (Input Button + Calendar)
```tsx
<button
  type="button"
  className="ds-select-trigger"
  onClick={() => setIsOpen(true)}
  data-placeholder={!startDate && !endDate}
>
  <CalendarIcon />
  <span>
    {startDate ? format(startDate, 'MMM d') : 'Start date'} 
    {' - '}
    {endDate ? format(endDate, 'MMM d, yyyy') : 'End date'}
  </span>
</button>
```

**Result:** Button styled as input that triggers calendar overlay

---

## Variants

### Size Variants
```tsx
<input className="ds-input ds-input--sm" /> // 36px min-height
<input className="ds-input" />              // 48px min-height (default)
<input className="ds-input ds-input--lg" /> // 52px min-height
```

### Type Variants
```tsx
<input type="text" className="ds-input" />
<input type="email" className="ds-input" />
<input type="tel" className="ds-input" />
<input type="url" className="ds-input" />
<input type="number" className="ds-input" />
<input type="search" className="ds-input" /> // Adds search icon space
<input type="date" className="ds-input" />
<input type="time" className="ds-input" />
<input type="password" className="ds-input" />
<textarea className="ds-input ds-textarea" />
```

### State Variants
```tsx
<input className="ds-input ds-input--error" />
<input className="ds-input ds-input--success" />
<input className="ds-input ds-input--warning" />
<input className="ds-input ds-input--loading" />
```

---

## Accessibility Features

### 1. ARIA Attributes
```tsx
<input
  className="ds-input"
  aria-invalid={hasError || undefined}
  aria-describedby={description ? `${id}-desc` : undefined}
  aria-required={required || undefined}
/>
```

### 2. Label Association
```tsx
<label htmlFor="email">Email</label>
<input id="email" className="ds-input" />
```

### 3. Error Announcements
```tsx
{hasError && (
  <div 
    id={`${id}-error`}
    role="alert"
    aria-live="polite"
  >
    {errorMessage}
  </div>
)}
```

### 4. Focus Management
- `:focus` styles clear and distinct
- Focus trap in overlays
- Return focus to trigger on close
- Tab order logical

### 5. Touch Targets
- 48px minimum height (exceeds WCAG 44px)
- Adequate padding (12px 16px)
- Hover states for mouse users
- No reliance on hover for mobile

---

## Browser Overrides

### Autofill (Disable Yellow)
```css
.ds-input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 1000px var(--ds-color-surface-base) inset;
  -webkit-text-fill-color: var(--ds-color-text-primary);
}
```

### Search Cancel Button (Hide)
```css
.ds-input[type="search"]::-webkit-search-cancel-button {
  appearance: none;
}
```

### File Upload Button
```css
.ds-input[type="file"]::file-selector-button {
  background: var(--ds-color-secondary-bg);
  border: 1px solid var(--ds-color-border-subtle);
  padding: 8px 16px;
  border-radius: 4px;
}
```

---

## Common Patterns

### 1. Input with Icon
```tsx
<div style={{ position: 'relative' }}>
  <SearchIcon 
    style={{
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none'
    }}
  />
  <input
    className="ds-input"
    style={{ paddingLeft: '40px' }}
  />
</div>
```

### 2. Input with Action Button
```tsx
<div style={{ position: 'relative' }}>
  <input className="ds-input" style={{ paddingRight: '40px' }} />
  <button
    style={{
      position: 'absolute',
      right: '8px',
      top: '50%',
      transform: 'translateY(-50%)'
    }}
  >
    <ClearIcon />
  </button>
</div>
```

### 3. Select Trigger with Chevron
```tsx
<button className="ds-select-trigger" style={{ paddingRight: '40px' }}>
  <span style={{ flex: 1 }}>{label}</span>
  <ChevronIcon />
</button>
```

---

## Performance Considerations

### 1. CSS Imports
**DO:**
```tsx
// DS package imports once
import '@intstudio/ds/styles';
```

**DON'T:**
```tsx
// Fields should NOT import
import './input.css'; // ❌
```

### 2. Inline Styles
**Minimal inline styles:**
```tsx
// Only for positioning
<input 
  className="ds-input"
  style={{ paddingLeft: '40px' }} // ✅ Icon positioning only
/>
```

**Not for appearance:**
```tsx
// NO
<input 
  style={{
    border: '1px solid #ccc', // ❌
    borderRadius: '6px',       // ❌
    padding: '12px'            // ❌
  }}
/>
```

### 3. Class Composition
```tsx
// Combine variants
<input className="ds-input ds-input--sm ds-input--error" />

// Conditional classes
<input className={cn(
  'ds-input',
  size === 'small' && 'ds-input--sm',
  hasError && 'ds-input--error'
)} />
```

---

## Migration from Old Pattern

### Before (Anti-pattern)
```tsx
<input
  style={{
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '16px'
  }}
/>
```

### After (DS Pattern)
```tsx
<input className="ds-input" />
```

**Result:** 50+ lines of inline styles → 1 class

---

## Testing Strategy

### 1. Visual Testing
- Storybook stories for all states
- Chromatic visual regression
- Dark mode snapshots

### 2. Interaction Testing
```ts
await expect(input).toHaveAttribute('aria-invalid', 'true');
await input.focus();
await expect(input).toHaveFocus();
```

### 3. Accessibility Testing
- Axe automated scans
- Manual screen reader testing
- Keyboard navigation testing

---

## FAQ

### Q: When do I use `.ds-input` vs `.ds-select-trigger`?
**A:** 
- Use `.ds-input` when user can TYPE (TextField, TextareaField)
- Use `.ds-select-trigger` when clicking OPENS something (SelectField, DateRangePicker)

### Q: Can I add custom styles to `.ds-input`?
**A:** 
- **Positioning:** Yes (paddingLeft for icons)
- **Appearance:** No (use DS classes)
- **Layout:** Depends (flex parent OK, not on input itself)

### Q: Why does SelectField use a button instead of select?
**A:**
- Native `<select>` can't be styled consistently
- Native `<select>` can't have search
- Native `<select>` can't have icons, descriptions, etc.
- Button + overlay gives full control

### Q: How do I add validation styling?
**A:**
```tsx
<input
  className={cn(
    'ds-input',
    hasError && 'ds-input--error'
  )}
  aria-invalid={hasError || undefined}
/>
```

### Q: Can I use `.ds-select-trigger` for other overlays?
**A:** Yes! Any button that should look like an input:
- ComboBox triggers
- Date pickers
- Time pickers
- Color pickers
- File browsers
- Command palette triggers

---

## Summary

### The Three Primitives
1. **`.ds-input`** - Actual input elements (type, edit)
2. **`.ds-select-trigger`** - Buttons styled as inputs (click, open)
3. **`.ds-option-button`** - List items in overlays (select)

### Core Principles
- Single source of truth (ds-inputs.css)
- Flat design (no shadows except focus)
- Blue ring reserved for focus
- 48px touch targets
- 16px prevents iOS zoom
- Design tokens everywhere
- Semantic HTML
- Accessible by default

### When to Use Each
- **TextField?** → `.ds-input`
- **SelectField?** → `.ds-select-trigger` (trigger) + `.ds-option-button` (options)
- **DateRangePicker?** → `.ds-select-trigger` (trigger) + calendar UI
- **SearchInput (in overlay)?** → `.ds-input` (usually `ds-input--sm`)

**Result:** Consistent, beautiful, accessible inputs across the entire system! 🎯
