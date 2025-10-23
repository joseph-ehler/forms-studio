# Field PRD: [FieldType]

**Type:** `[type]` (text, email, select, signature, time, etc.)  
**Recipe:** `[RecipeName]` or `custom`  
**Behavior:** `[ui.behavior]` (default, async-search, wheel, canvas, composite, etc.)  
**Version:** 1.0  
**Status:** Draft | Review | Approved | Implemented  
**Author:** [Name]  
**Date:** YYYY-MM-DD

---

## 1. Purpose

### What problem does this field solve?
[Describe the user need this field addresses]

### When should it be used?
[Primary use cases]

### When should it NOT be used?
[Anti-patterns, alternative solutions]

---

## 2. User Experience & Flows

### Primary Flow (Happy Path)
1. [User action 1]
2. [System response 1]
3. [User action 2]
4. [System response 2]
5. [Success state]

### Error/Recovery Flow
1. [User makes error]
2. [Validation triggers]
3. [Error message displays]
4. [User corrects]
5. [Success confirmation]

### Mobile Nuances
- **Touch targets:** [Size requirements, spacing]
- **Virtual keyboard:** [Input type, return key label]
- **Overlay vs Sheet:** [When to use each]
- **Gestures:** [Swipe, pinch, long-press behaviors]

### Desktop Nuances
- **Keyboard shortcuts:** [Key combinations]
- **Hover states:** [Visual feedback]
- **Popover vs Modal:** [When to use each]

---

## 3. States Matrix

| State | Visual | Behavior | Accessibility |
|-------|--------|----------|---------------|
| **Default** | [Describe appearance] | [Describe behavior] | [ARIA states] |
| **Hover** | [Border/bg changes] | [Cursor, preview] | [No ARIA change] |
| **Focus** | [Focus ring, highlight] | [Keyboard active] | [aria-activedescendant if needed] |
| **Filled** | [Satisfied appearance] | [Value present] | [aria-invalid="false"] |
| **Disabled** | [Muted colors, opacity] | [No interaction] | [disabled, aria-disabled="true"] |
| **Readonly** | [Subtle visual difference] | [No edit, can copy] | [readonly, aria-readonly="true"] |
| **Error** | [Red border, icon] | [Show error message] | [aria-invalid="true", aria-errormessage] |
| **Success** | [Green border, checkmark] | [Positive feedback] | [aria-invalid="false", success announcement] |
| **Loading** | [Spinner, skeleton] | [Interaction blocked] | [aria-busy="true", aria-live="polite"] |
| **Async Validating** | [Subtle spinner] | [Debounced check] | [aria-busy="true"] |

---

## 4. Accessibility (a11y)

### Semantic HTML & ARIA
- **Element:** `<input>` | `<select>` | `<textarea>` | `<canvas>` | custom
- **Role:** `[role]` (textbox, combobox, spinbutton, img, etc.)
- **Label Association:** `<label htmlFor>` or `aria-labelledby`
- **Description:** `aria-describedby` for helper text
- **Error Handling:** `aria-errormessage` points to error element
- **Required:** `aria-required="true"` + visual indicator
- **Live Regions:** `aria-live="polite"` for async feedback

### Keyboard Interactions

| Key | Action |
|-----|--------|
| **Tab** | Move focus to field |
| **Shift+Tab** | Move focus away |
| **Enter** | [Submit, select, open picker, etc.] |
| **Escape** | [Cancel, close picker, clear, etc.] |
| **Arrow Keys** | [Navigate options, increment/decrement] |
| **Space** | [Select, toggle, activate] |
| **Home/End** | [Jump to start/end] |
| **PageUp/PageDown** | [Large increments if applicable] |

### Screen Reader Announcements
- **On Focus:** [What's announced]
- **On Change:** [What's announced]
- **On Error:** [Error message + guidance]
- **On Success:** [Success confirmation]
- **On Loading:** [Progress indication]

### Touch Targets
- **Minimum:** 44px × 44px (WCAG Level AA)
- **Optimal:** 48px × 48px (mobile-first)
- **Spacing:** 8px minimum between interactive elements

---

## 5. Content & Microcopy

### Label Patterns
```
✅ GOOD: "Email address" (clear, specific)
❌ BAD: "Email" (ambiguous)

✅ GOOD: "Password (at least 8 characters)"
❌ BAD: "Pw" (unclear abbreviation)
```

### Placeholders
```
✅ GOOD: "you@example.com" (helpful example)
❌ BAD: "Enter email" (redundant with label)

⚠️ CAUTION: Never use placeholder as only label (a11y issue)
```

### Helper Text
```
✅ GOOD: "We'll never share your email with anyone"
✅ GOOD: "Use uppercase, lowercase, numbers, and symbols"
❌ BAD: "Enter a valid value" (too vague)
```

### Error Messages (Empathetic Tone)
```
✅ GOOD: "Please enter a valid email address (e.g., you@example.com)"
❌ BAD: "Invalid email" (accusatory, unhelpful)

✅ GOOD: "Password must be at least 8 characters. You entered [X]."
❌ BAD: "Password too short" (missing guidance)

✅ GOOD: "We couldn't verify that email address. Please check for typos."
❌ BAD: "Email verification failed" (technical, scary)
```

### Success Messages
```
✅ GOOD: "Great! Your email looks good."
✅ GOOD: "Password is strong. ✓"
❌ BAD: "Valid" (too terse)
```

### i18n Considerations
- All strings use i18n keys (not hardcoded)
- Error messages avoid concatenation (use ICU MessageFormat)
- Date/time/number formatting respects locale
- RTL layout support if needed

---

## 6. Validation

### Sync Validation Rules
- **Required:** [true/false, when]
- **Min/Max Length:** [characters]
- **Pattern/Regex:** [if applicable]
- **Custom Rules:** [describe logic]

### Async Validation Rules
- **API Endpoint:** [URL or service name]
- **Debounce:** [ms, typically 300-500ms]
- **Retry Strategy:** [exponential backoff, max attempts]
- **Error Mapping:** [API error codes → user messages]
- **Offline Handling:** [skip, show warning, cache]

### When to Validate
- ❌ **On Keystroke:** Too aggressive, annoying
- ✅ **On Blur (first time):** After user leaves field
- ✅ **On Change (after first error):** Immediate feedback after initial error
- ✅ **On Submit:** Always validate before submit
- ⚠️ **Async (debounced):** For expensive checks (username availability)

---

## 7. Performance Budgets

### Render Budget
- **Initial Render:** ≤ 50ms (First Contentful Paint)
- **Interaction Response:** ≤ 100ms (feels instant)
- **Animation Frame Rate:** 60fps (16.67ms per frame)

### Debounce Thresholds
- **Telemetry Logging:** 50ms (batch events)
- **Async Validation:** 300-500ms (balance UX vs API calls)
- **Search/Filter:** 200-300ms (feels responsive)

### Virtualization Thresholds
- **List Items:** Virtualize at 100+ items
- **Grid Cells:** Virtualize at 500+ cells
- **Scroll Performance:** Maintain 60fps scrolling

### Skeleton/Loading Policy
- **Show Skeleton:** If load time > 200ms
- **Minimum Display:** 300ms (avoid flash)
- **Timeout:** 30s (show error after)

---

## 8. Telemetry

### Events to Track

| Event | Trigger | Payload Shape | PII Handling |
|-------|---------|---------------|--------------|
| `field_focus` | Field receives focus | `{fieldName, timestamp}` | None |
| `field_blur` | Field loses focus | `{fieldName, duration, hasValue}` | Hash value |
| `field_change` | Value changes | `{fieldName, valueLength}` | Hash value |
| `field_validate` | Validation runs | `{fieldName, isValid, errorType}` | None |
| `field_submit` | Form submits | `{fieldName, timeToValid}` | Hash value |
| `field_error` | Error occurs | `{fieldName, errorCode, errorMessage}` | Redact PII |
| `field_async_start` | Async validation starts | `{fieldName, timestamp}` | None |
| `field_async_complete` | Async validation completes | `{fieldName, duration, result}` | None |
| **[Custom Event]** | [Describe trigger] | [Describe payload] | [Hash/redact] |

### Success/Error Metrics
- **Time to Valid:** Median time from focus to first valid value
- **Error Rate:** % of submissions with validation errors
- **Retry Rate:** % of users who fix errors and retry
- **Abandon Rate:** % of users who leave field with error

### Privacy & PII
- **Never log:** Passwords, SSNs, credit card numbers, full names in plain text
- **Always hash:** Email addresses, usernames, user-entered values
- **Redact in errors:** Strip sensitive data from error logs
- **Compliance:** GDPR, CCPA, HIPAA as applicable

---

## 9. Security & Privacy

### Input Sanitization
- **Allowlist:** [Allowed characters/patterns]
- **Blocklist:** [Dangerous characters: `<>`, SQL, XSS]
- **Encoding:** [HTML encode, URL encode, etc.]

### Masking Strategy
- **Password:** `••••••••` (always masked)
- **Credit Card:** `•••• •••• •••• 1234` (last 4 visible)
- **SSN:** `•••-••-1234` (last 4 visible)
- **Phone:** `(•••) •••-1234` (last 4 visible)

### Clipboard Behavior
- **Copy:** [Allow/block, what's copied]
- **Paste:** [Allow/block, sanitize pasted content]
- **Autocomplete:** [on/off, autocomplete attribute]

### Paste Rules
- **Strip Formatting:** Remove rich text formatting
- **Trim Whitespace:** Remove leading/trailing spaces
- **Validate on Paste:** Immediate validation feedback

---

## 10. Design Tokens & Primitives

### DS Tokens Used
```css
/* Spacing */
--ds-space-2: 8px
--ds-space-3: 12px
--ds-space-4: 16px

/* Colors */
--ds-color-border-subtle
--ds-color-border-focus
--ds-color-state-danger
--ds-color-state-success

/* Typography */
--ds-font-body
--ds-font-size-base: 16px
--ds-line-height-base: 1.5

/* Effects */
--ds-shadow-focus
--ds-radius-base: 6px
```

### DS Primitives
- **Base Class:** `.ds-input` | `.ds-select` | `.ds-textarea` | `.ds-checkbox` | `.ds-toggle` | `.ds-signature-canvas` | custom
- **Variants:** `.ds-input--error` | `.ds-input--success` | `.ds-input--disabled`
- **Layout:** `<Stack>`, `<FieldWrapper>`, `<FormGroup>`

### Recipe/Behavior Flags
```yaml
ui:
  behavior: default | async-search | wheel | canvas | composite
  density: compact | comfortable | spacious
  variant: default | inline | floating
```

---

## 11. Acceptance Criteria

### Functional
- [ ] Field renders correctly in all states
- [ ] Validation rules work as specified
- [ ] Error messages display correctly
- [ ] Success feedback provides positive reinforcement
- [ ] Loading states appear for async operations
- [ ] Form submission works end-to-end

### Accessibility
- [ ] Lighthouse score: ≥ 90
- [ ] axe DevTools: 0 violations
- [ ] Keyboard navigation: all interactions possible
- [ ] Tab order: logical and complete
- [ ] Screen reader: announces label, value, errors
- [ ] Touch targets: ≥ 44px (AA) or ≥ 48px (optimal)
- [ ] Focus indicators: highly visible (contrast ≥ 3:1)

### Visual/Interaction
- [ ] Animations smooth (60fps, no jank)
- [ ] Hover states provide clear feedback
- [ ] Focus ring appears immediately
- [ ] Disabled state is visually distinct
- [ ] Error shake animation (if applicable)
- [ ] Success checkmark/fade (if applicable)

### Performance
- [ ] Render time ≤ 50ms
- [ ] Input lag ≤ 100ms
- [ ] Debounce working correctly
- [ ] No memory leaks (unmount clean)

### Mobile
- [ ] iOS Safari: no 16px zoom issue
- [ ] Android Chrome: input types respected
- [ ] Virtual keyboard: correct type & return key
- [ ] Touch gestures work smoothly
- [ ] Landscape mode: no clipping

### Content
- [ ] Label clear & concise
- [ ] Placeholder helpful (if used)
- [ ] Helper text adds value
- [ ] Error messages empathetic & actionable
- [ ] i18n keys present (no hardcoded strings)

### Telemetry
- [ ] All specified events fire correctly
- [ ] Payload shape matches spec
- [ ] PII is hashed/redacted
- [ ] No telemetry errors in console

### Security
- [ ] Input sanitization working
- [ ] XSS protection in place
- [ ] Sensitive values masked
- [ ] Paste rules enforced

---

## 12. Open Questions / Risks

### Design Decisions Pending
- [ ] [Question about interaction pattern]
- [ ] [Question about visual treatment]

### Technical Unknowns
- [ ] [Performance concern to investigate]
- [ ] [Browser compatibility to verify]

### Dependencies
- [ ] [Waiting on DS primitive update]
- [ ] [Waiting on API endpoint]

### Risks
- [ ] [Potential UX issue to monitor]
- [ ] [Performance bottleneck to test]

---

## Appendix

### Related PRDs
- [Link to similar field types]
- [Link to pattern library]

### Design Mocks
- [Figma/Sketch links]
- [Screenshot references]

### API Contracts
- [OpenAPI/GraphQL schema]
- [Error code documentation]

### User Research
- [Usability test findings]
- [A/B test results]

---

**Approval Sign-off:**
- [ ] Product: [Name, Date]
- [ ] Design: [Name, Date]
- [ ] Engineering: [Name, Date]
- [ ] Accessibility: [Name, Date]

**Implementation Tracking:**
- **Spec Created:** [Date]
- **Recipe Scaffolded:** [Date]
- **Component Implemented:** [Date]
- **Tests Written:** [Date]
- **Docs Updated:** [Date]
- **Shipped:** [Date, Version]
