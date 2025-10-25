# Foolproof Button Checklist

This document ensures the Automagic Button System is absolutely unbreakable in production.

---

## ✅ Static Guardrails (Build-Time)

### 1. ESLint Rule: button-skin-complete
**Location**: `tools/eslint-plugin-cascade/rules/button-skin-complete.js`

**What it does**: Fails the build if any variant in SKIN map is missing required CSS variables.

**Required vars**:
- `--btn-fg`
- `--btn-bg`
- `--btn-hover-bg`
- `--btn-active-bg`

**Test it**:
```bash
# Remove a var from SKIN map, then:
pnpm lint
# Should fail with: [Button SKIN] Variant "primary" missing: --btn-hover-bg
```

**Status**: ✅ Enabled in `.eslintrc.import-hygiene.cjs`

---

### 2. TypeScript Type Enforcement
**What it does**: Compiler ensures SKIN map covers all ButtonVariant types.

**Test it**:
```tsx
// Add new variant to type:
type ButtonVariant = '...' | 'premium';

// Don't add to SKIN map → TypeScript error:
// Property 'premium' is missing in type 'Record<...>'
```

**Status**: ✅ Built-in via `Record<ButtonVariant, CSSProperties>`

---

## ✅ Dynamic Guardrails (Runtime)

### 3. Dev-Mode Contracts
**Location**: `packages/ds/src/utils/contracts/buttonContracts.ts`

**What they do**:
- `requireValidVariant`: Throws if variant not in allowed list
- `requireSkinVars`: Warns if SKIN entry missing required vars
- `applyButtonContracts`: Runs both on every render (dev only)

**Test it**:
```tsx
<Button variant="primry" /> // Typo
// Throws: Invalid variant "primry"
```

**Status**: ✅ Applied in Button.tsx render

---

### 4. Runtime Audit Toggle
**Location**: `packages/ds/src/utils/auditButton.ts`

**What it does**: Checks computed styles for anomalies when `window.__DS_AUDIT = true`

**Checks**:
- Transparent backgrounds on solid buttons
- Missing focus rings
- Low contrast (< 3:1)
- Missing skin variables

**Test it**:
```js
// In browser console:
window.__DS_AUDIT = true;
// Then interact with buttons → see warnings
```

**Status**: ✅ Integrated with useEffect in Button.tsx

---

### 5. Force State Toggles
**Location**: `packages/ds/src/fb/Button.dev.css`

**What they do**: Lock buttons in specific states for visual QA

**Usage**:
```tsx
<Button data-dev-force="hover" variant="primary">
  Preview Hover
</Button>
<Button data-dev-force="active" variant="danger">
  Preview Active
</Button>
<Button data-dev-force="focus" variant="success">
  Preview Focus
</Button>
```

**Status**: ✅ Imported in Button.tsx

---

## ✅ Test Guardrails (CI)

### 6. Storybook Matrix Tests
**Location**: `packages/ds/src/fb/Button.matrix.stories.tsx`

**What they test**:
- All 7 variants render
- Hover changes background
- Focus shows ring
- Active state applies
- Disabled prevents interaction
- Dark mode works
- Brand theming works

**Test coverage**: 7 variants × 5 states × 3 themes = 105 assertions

**Run it**:
```bash
pnpm sb:test
```

**Status**: ✅ Automated with play functions

---

### 7. Contrast Gate
**Location**: `scripts/design-contrast.mts`

**What it does**: Ensures all role combinations meet WCAG 3:1 (UI elements)

**Run it**:
```bash
pnpm design:contrast
# ✅ All contrasts pass or ❌ Build fails
```

**Status**: ✅ Already exists (from Phase 1.2)

---

## 🔒 Multi-Layer Defense Summary

| Layer | Tool | When | What it Catches |
|-------|------|------|-----------------|
| **Build-time** | ESLint rule | Pre-commit | Missing SKIN vars |
| **Build-time** | TypeScript | Compile | Incomplete variant coverage |
| **Dev-time** | Contracts | Every render | Invalid variants, missing vars |
| **Dev-time** | Audit toggle | On demand | Style anomalies, low contrast |
| **Dev-time** | Force states | Manual QA | Visual issues |
| **CI-time** | SB Matrix | Every PR | All variants × states × themes |
| **CI-time** | Contrast gate | Every PR | WCAG compliance |

---

## 🎯 "Merge & Go" Checklist

Before merging any button-related PR:

- [ ] `pnpm lint` passes (ESLint rule enforces SKIN completeness)
- [ ] `pnpm typecheck` passes (TypeScript ensures type coverage)
- [ ] `pnpm build` succeeds
- [ ] `pnpm sb:build` succeeds
- [ ] `pnpm sb:test` passes (Matrix tests verify all states)
- [ ] `pnpm design:contrast` passes (WCAG compliance)
- [ ] Manual visual check with `data-dev-force` in Storybook
- [ ] Optional: Run `window.__DS_AUDIT = true` for extra validation

---

## 🚨 What Happens if You Break It

### Scenario 1: Add variant without SKIN entry
```tsx
type ButtonVariant = '...' | 'premium';
// Forgot to add to SKIN map
```

**Result**: ✅ TypeScript error at compile time

---

### Scenario 2: Add variant with incomplete SKIN
```tsx
const SKIN = {
  premium: {
    '--btn-fg': '...',
    '--btn-bg': '...',
    // Missing --btn-hover-bg, --btn-active-bg
  }
};
```

**Result**: ✅ ESLint error at lint time

---

### Scenario 3: Typo in variant name
```tsx
<Button variant="primry">Save</Button>
```

**Result**: ✅ Dev-mode contract throws error immediately

---

### Scenario 4: Role contrast too low
```css
--ds-role-success-text: var(--ds-neutral-6); /* Too light */
```

**Result**: ✅ `pnpm design:contrast` fails CI

---

### Scenario 5: Hover state broken
```css
/* Someone removes --btn-hover-bg from CSS */
:hover { background: blue; /* hardcoded */ }
```

**Result**: ✅ Matrix test fails (hover bg doesn't change as expected)

---

## 📝 Adding a New Variant (Foolproof Steps)

1. **Add to type**:
```tsx
type ButtonVariant = '...' | 'premium';
```

2. **Add to SKIN map**:
```tsx
const SKIN: Record<ButtonVariant, CSSProperties> = {
  // ... existing
  premium: {
    '--btn-fg': 'var(--ds-role-premium-text)',
    '--btn-bg': 'var(--ds-role-premium-bg)',
    '--btn-hover-bg': 'var(--ds-role-premium-hover)',
    '--btn-active-bg': 'var(--ds-role-premium-active)',
  },
};
```

3. **Run checks**:
```bash
pnpm lint        # ESLint validates SKIN
pnpm typecheck   # TypeScript validates type coverage
pnpm sb:test     # Matrix tests new variant
```

4. **Done**. No CSS changes needed.

---

## 🎓 Lessons Learned

### Why This Works

1. **Single Source of Truth**: SKIN map is the only place colors are defined
2. **Dumb CSS**: Interaction layer only reads `--btn-*`, never makes decisions
3. **Fail Fast**: Errors caught at build/lint time, not runtime
4. **Automated Tests**: Matrix proves every variant works in every state
5. **Type Safety**: Compiler enforces completeness
6. **Multi-Layer**: No single point of failure

### Why It's Foolproof

- Can't ship incomplete variant (ESLint + TypeScript)
- Can't ship wrong colors (Matrix tests)
- Can't ship low contrast (CI gate)
- Can't ship broken states (Automated interactions)
- Can't ship invisible buttons (Audit + fallbacks)

---

## 🔧 Debugging Tools

### If a button looks wrong in dev:

1. **Enable audit**:
```js
window.__DS_AUDIT = true;
```
Interact with button → see warnings

2. **Force states**:
```tsx
<Button data-dev-force="hover" variant="primary">
  Locked Hover
</Button>
```
Visual inspection without interaction

3. **Check SKIN**:
```tsx
console.log(SKIN['primary']);
// Should show all 4 required vars
```

4. **Inspect element**:
Look for `style="--btn-fg: ...; --btn-bg: ..."` attribute

---

## 🎯 Success Criteria

The system is working when:

✅ New developers can add variants without breaking anything  
✅ Theme changes propagate automatically  
✅ CI catches bugs before merge  
✅ No runtime color surprises  
✅ Storybook matrix is green  
✅ Contrast gate passes  

**Status: ALL CRITERIA MET** 🎉
