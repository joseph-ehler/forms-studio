# Design System Extraction Plan

**Status:** NOT READY (Stabilization Phase)  
**Target:** 2-4 weeks from now  
**Risk Level:** HIGH if done prematurely  

---

## Phase 1: Stabilize & Audit (Week 1-2)

### 1.1 Bug Fixes Complete ✅ (TODAY)
- [x] Primary color token
- [x] Button sizing scale (sm/md/lg/xl)
- [x] Icon size constraints
- [x] MediaContainer collapse (4 root causes)
- [x] Grid overflow
- [ ] Any remaining visual bugs

### 1.2 Add Test Coverage
```bash
# Playwright smoke tests for each primitive
pnpm add -D @playwright/test

# Tests to write:
- Button: all sizes render correctly
- Stack: spacing matches tokens
- Grid: responsive columns work
- MediaContainer: aspect ratios correct
- Section: backgrounds + borders work
- FormLayout: widths constrain properly
```

**Goal:** Catch regressions during extraction

### 1.3 Freeze API Surface
Document every exported symbol:
```typescript
// Generate export manifest
import * as DS from './src/index'
console.log(Object.keys(DS)) // All exports

// Check for accidental exports
// Ensure only public API is exported
```

**Goal:** Know exactly what Form Studio can import

### 1.4 Audit Form Studio Usage
```bash
# Find all imports
grep -r "from '@joseph-ehler/wizard-react'" packages/ apps/ \
  --include="*.tsx" --include="*.ts" > imports.txt

# Analyze:
# - Most used components
# - Deep imports (e.g., './lib/utils')
# - Circular dependencies
# - Private API usage
```

**Goal:** Understand breaking radius

### 1.5 Visual Regression Baseline
```bash
# Capture screenshots of all components
pnpm playwright test --update-snapshots

# Store in git:
# - Button variants
# - Layout patterns
# - Shell presets
# - MediaContainer galleries
```

**Goal:** Detect visual breakage after extraction

---

## Phase 2: Prepare Extraction (Week 3)

### 2.1 Create Compatibility Layer
```typescript
// packages/wizard-react/src/compat.ts
/**
 * Compatibility re-exports for Form Studio
 * Remove in v1.0.0
 */
export {
  Stack,
  Grid,
  Button,
  // ... all current exports
} from '@intstudio/ds'

// Add deprecation warnings (once per session)
if (typeof window !== 'undefined' && !window.__dsCompatWarned) {
  console.warn(
    'Importing from @joseph-ehler/wizard-react is deprecated. ' +
    'Use @intstudio/ds instead. See: [migration guide]'
  )
  window.__dsCompatWarned = true
}
```

**Goal:** Form Studio keeps working during migration

### 2.2 Set Up Storybook
```bash
cd packages/wizard-react
pnpm add -D @storybook/react-vite @storybook/addon-a11y

# Stories for:
# - All primitives (Stack, Grid, Button...)
# - All patterns (PageStack, SplitLayout...)
# - Shell presets (5 configurations)
# - Token showcases (colors, spacing, widths)
```

**Goal:** Self-documenting design system

### 2.3 Create Import Codemods
```javascript
// scripts/migrate-imports.js
/**
 * Automatically update imports:
 * FROM: @joseph-ehler/wizard-react
 * TO:   @intstudio/ds
 */

import { transformSync } from '@babel/core'
import glob from 'glob'
import fs from 'fs'

const files = glob.sync('packages/**/*.{ts,tsx}')

files.forEach(file => {
  const code = fs.readFileSync(file, 'utf8')
  
  const result = transformSync(code, {
    plugins: [
      // Replace import source
      ['babel-plugin-transform-imports', {
        '@joseph-ehler/wizard-react': {
          transform: () => '@intstudio/ds',
          preventFullImport: false
        }
      }]
    ]
  })
  
  if (result?.code) {
    fs.writeFileSync(file, result.code)
  }
})
```

**Goal:** Automated migration, zero manual edits

### 2.4 Bundle Size Budgets
```json
// packages/ds-studio/package.json
{
  "size-limit": [
    {
      "path": "dist/index.js",
      "limit": "50 KB"
    },
    {
      "path": "dist/index.css",
      "limit": "25 KB"
    }
  ]
}
```

**Goal:** Prevent bloat

---

## Phase 3: Extract (Week 4)

### 3.1 Create DS Package
```bash
# Create new package
mkdir -p packages/ds-studio

# Copy design system code
cp -r packages/wizard-react/src packages/ds-studio/
cp packages/wizard-react/tsconfig.json packages/ds-studio/
cp packages/wizard-react/package.json packages/ds-studio/

# Update package.json
{
  "name": "@intstudio/ds",
  "version": "0.1.0",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./styles": "./dist/index.css"
  }
}
```

### 3.2 Migrate Form Studio
```bash
# Step 1: Add DS as dependency
cd packages/form-studio
pnpm add @intstudio/ds@workspace:*

# Step 2: Run codemod
node ../../scripts/migrate-imports.js

# Step 3: Test everything
pnpm test
pnpm build
pnpm playwright test

# Step 4: Visual regression check
pnpm playwright test --update-snapshots=missing
# Review diffs carefully!
```

### 3.3 Publish DS
```bash
# From packages/ds-studio
pnpm changeset add  # Document changes
pnpm changeset version
pnpm build
pnpm publish --access public
```

### 3.4 Update Form Studio to Published Version
```bash
cd packages/form-studio
pnpm remove @intstudio/ds
pnpm add @intstudio/ds@^0.1.0
pnpm test  # Verify nothing broke
```

---

## Phase 4: Deprecate Compatibility (2 minor versions later)

### Remove Re-Exports
```bash
# In wizard-react v0.3.0 (2 releases after extraction)
# Remove compat.ts
# Update all internal imports
# Document breaking change in CHANGELOG
```

---

## Gating Criteria (Must Pass Before Extraction)

- [ ] All known bugs fixed
- [ ] Playwright tests passing (smoke tests minimum)
- [ ] Visual regression baseline captured
- [ ] Import audit complete (know what Form Studio uses)
- [ ] Storybook deployed (canonical docs)
- [ ] Codemods tested on sample files
- [ ] Bundle size budgets defined
- [ ] Migration guide written
- [ ] Compatibility layer tested
- [ ] CI pipeline green for DS package

---

## Risk Mitigation

**Risk:** Form Studio breaks during migration  
**Mitigation:** Compatibility layer + codemods + visual regression

**Risk:** Design system keeps changing  
**Mitigation:** Freeze API during extraction window

**Risk:** Circular dependencies  
**Mitigation:** Import audit finds them first

**Risk:** Bundle size bloats  
**Mitigation:** Size budgets + tree-shaking tests

**Risk:** Missing tests don't catch regressions  
**Mitigation:** Playwright + visual regression BEFORE extraction

---

## Why Not Extract Today?

### Recent Changes (Last 24 Hours):
- Button sizing scale added (API change)
- Icon size constraints (new CSS file)
- MediaContainer width fix (breaking CSS change)
- Wave dividers removed (pattern change)

**Each would require:**
1. Bump DS version
2. Update Form Studio dependency
3. Rebuild + test Form Studio
4. Deploy both packages

**In monorepo:** One commit, instant sync ✅

### Missing Infrastructure:
- No Playwright tests
- No visual regression
- No import audit
- No codemods
- No Storybook
- No bundle size tracking

**Extracting blind = breakage guaranteed** 🚨

---

## Timeline

| Week | Phase | Outcome |
|------|-------|---------|
| 1-2 | Stabilize | Bug-free, tested, frozen API |
| 3 | Prepare | Storybook, codemods, compat layer |
| 4 | Extract | DS published, Form Studio migrated |
| 5+ | Maintain | Version, document, support |

**Earliest safe extraction:** 2-4 weeks from now

---

## My Recommendation

**Don't extract yet.** The design system is:
- Still evolving (9 bugs fixed today)
- Undertested (no Playwright, no visual regression)
- Unaudited (don't know Form Studio's usage)

**Instead:**
1. Spend 2 weeks stabilizing + testing
2. Freeze the API surface
3. THEN extract with confidence

**Result:** Clean extraction, zero breakage, happy developers

---

## Alternative: Soft Launch

If you MUST extract now:

1. Create `@intstudio/ds` package
2. Keep it private (not published)
3. Form Studio imports via workspace protocol
4. Gives you repo separation without publishing risk

```json
// packages/form-studio/package.json
{
  "dependencies": {
    "@intstudio/ds": "workspace:*"  // Still in monorepo
  }
}
```

**Benefit:** Test extraction mechanics without commitment  
**Downside:** Not truly independent yet

---

## Questions Before We Proceed

1. **How stable is the DS?** (Answer: Not very - 9 bugs today)
2. **What's the Form Studio usage?** (Need audit)
3. **Can we afford breakage?** (Need tests first)
4. **Is there a deadline?** (Affects risk tolerance)

**My vote:** Stabilize 2 weeks, then extract safely.
