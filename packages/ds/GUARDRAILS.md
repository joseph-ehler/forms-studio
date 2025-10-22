# 🛡️ Design System Guardrails

**Automated enforcement** of design system patterns to prevent mistakes.

---

## **📋 Quick Reference**

| Guardrail | Type | What it Prevents |
|-----------|------|------------------|
| Focus Rules | ESLint | Manual focus management, missing focus trap |
| Semantic Sizing | ESLint | Hardcoded sizes instead of importance |
| Density Rules | ESLint | Hardcoded spacing instead of tokens |
| Token Enforcement | Stylelint | Magic numbers, inline styles |
| Focus Tests | Playwright | Tab trap broken, focus escape |
| A11Y Tests | Playwright | Touch targets too small, contrast issues |

---

## **🔒 ESLint Rules**

### **Focus Management (.eslintrc.focus-rules.json)**

**Blocks:**
- ❌ `document.querySelectorAll('button')` → Use `getFocusableElements()`
- ❌ Manual `element.focus()` → Use `focusElement()` helper
- ⚠️  `document.activeElement` → Consider `debugFocus()` helper

**Why:** Prevents reimplementing focus management. Use primitives!

**Example:**
```typescript
// ❌ DON'T
const focusable = container.querySelectorAll('button, input')
focusable[0].focus()

// ✅ DO
const focusable = getFocusableElements(container)
focusElement(focusable[0])
```

---

### **Semantic Sizing (.eslintrc.semantic-sizing.json)**

**Blocks:**
- ⚠️  `size="md"` → Use `importance="primary"` for A11Y scaling
- ❌ `getSemanticSize(variableSize)` → Pass string literal only

**Why:** Hardcoded sizes don't scale with accessibility settings.

**Example:**
```tsx
// ❌ DON'T
<Heading size="xl">Title</Heading>

// ✅ DO
<Heading importance="critical">Title</Heading>
```

---

### **Density/Spacing (.eslintrc.density-rules.json)**

**Blocks:**
- ❌ `"24px"` → Use `--ds-space-*` token
- ❌ `style={{ gap: '1rem' }}` → Use `<Stack spacing="normal">`
- ❌ `style={{ padding: '16px' }}` → Use `<Box p="4">`
- ⚠️  `minHeight: '44px'` → Use `--ds-touch-target` token

**Why:** Spacing must adapt to density/A11Y scale.

**Example:**
```tsx
// ❌ DON'T
<div style={{ gap: '24px', padding: '16px' }}>

// ✅ DO
<Stack spacing="normal">
  <Box p="4">
```

---

## **🎨 Stylelint Rules**

### **Token Enforcement (.stylelintrc.token-enforcement.json)**

**Blocks:**
- ❌ `gap: 24px` → Use `gap: var(--ds-space-md)`
- ❌ `padding: 16px` → Use `padding: var(--ds-padding-4)`
- ❌ `#3b82f6` → Use `var(--ds-color-primary)`
- ❌ `border-radius: 8px` → Use `var(--ds-radius-md)`
- ❌ `z-index: 100` → Use `var(--ds-z-overlay)`
- ❌ `margin-left: 1rem` → Use `margin-inline-start` (logical property)

**Why:** Tokens enable theming, A11Y scaling, and consistency.

**Example:**
```css
/* ❌ DON'T */
.card {
  padding: 24px;
  border-radius: 12px;
  background: #ffffff;
  z-index: 10;
}

/* ✅ DO */
.card {
  padding: var(--ds-padding-6);
  border-radius: var(--ds-radius-lg);
  background: var(--ds-color-surface-base);
  z-index: var(--ds-z-dropdown);
}
```

---

## **🧪 Playwright Tests**

### **Focus Primitives (tests/focus-primitives.spec.ts)**

**Tests:**
- ✅ Tab cycles forward through elements
- ✅ Shift+Tab cycles backward
- ✅ Escape closes and returns focus
- ✅ Focus cannot escape trap
- ✅ All interactive elements keyboard accessible
- ✅ Focus visible on keyboard nav
- ✅ Debug helpers available

**Run:** `pnpm test:focus`

---

### **A11Y Compliance (tests/a11y-compliance.spec.ts)**

**Tests:**
- ✅ Importance scales with A11Y font scale
- ✅ Density multiplier scales spacing
- ✅ Touch targets meet WCAG AAA (48px+)
- ✅ Section auto-applies safe text color
- ✅ lowVision preset applies 1.5x scale
- ✅ Presets persist across reloads

**Run:** `pnpm test:a11y`

---

## **🚀 Usage**

### **In CI/CD:**
```bash
# Lint
pnpm lint                  # Run all ESLint rules
pnpm lint:css              # Run Stylelint

# Test
pnpm test:focus            # Focus management tests
pnpm test:a11y             # A11Y compliance tests
```

### **In Pre-commit Hook:**
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "pnpm lint && pnpm lint:css && pnpm test"
    }
  }
}
```

---

## **🔧 Overriding Rules**

**When allowed:**
- Primitive implementations (focus utils, density adapter, etc.)
- Tests (need to test edge cases)
- Token definition files (defining the tokens themselves)

**How to override:**
```typescript
// eslint-disable-next-line no-restricted-syntax
const elements = document.querySelectorAll('button')

// Explain WHY you're overriding
/* 
 * This is acceptable here because we're implementing
 * the focus utility itself, not consuming it.
 */
```

---

## **📊 Success Metrics**

**Goals:**
- 0 ESLint errors in production code
- 90%+ touch targets meet WCAG AAA
- 100% focus traps pass smoke tests
- 0 hardcoded spacing values in components

**Track with:**
```bash
# Count violations
pnpm lint --format json | jq '.[] | .errorCount'

# Touch target compliance
pnpm test:a11y --reporter=json | jq '.suites[1].tests[1].status'
```

---

## **❓ FAQ**

**Q: Why can't I use `size="md"`?**  
A: It doesn't scale with accessibility settings. Use `importance="primary"` instead.

**Q: When can I use hardcoded spacing?**  
A: Never in components. Only in token definition files.

**Q: My lint is failing on test files.**  
A: Tests are exempt from most rules. Make sure file ends with `.spec.ts` or `.test.ts`.

**Q: Can I disable a rule project-wide?**  
A: No. Rules exist to prevent systemic issues. Fix the root cause instead.

---

## **🎯 Philosophy**

**Guardrails > Documentation**

- Docs get outdated
- Humans make mistakes  
- Guardrails enforce automatically
- Fix once, prevent forever

**Pit of Success**

- Correct path is easiest
- Wrong path blocked by linter
- Impossible to misuse

**Zero Tolerance**

- No "ignore all" overrides
- Every exception justified
- Violations tracked as tech debt
