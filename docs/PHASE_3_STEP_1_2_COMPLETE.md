# Phase 3: Steps 1 & 2 Complete - Compat/Lib Cleanup

**Date:** 2025-10-23  
**Status:** ✅ MOSTLY COMPLETE (build issues to resolve)

## What Was Accomplished

### ✅ Step 1: Remove Compat Shims

**Cleaned Up:**
- ✅ Deleted `packages/ds/src/compat/` directory (4 files)
  - Flex.tsx → Use `Stack` directly from primitives
  - FormStack.tsx → Use `Stack` directly from primitives  
  - FormGrid.tsx → Use `Grid` directly from primitives
  - index.ts → Removed re-exports

**Codemod Applied:**
- ✅ 26 files updated
- ✅ 40 replacements made
- ✅ All FormStack → Stack
- ✅ All FormGrid → Grid
- ✅ All Flex → Stack (with direction="row")

**Removals:**
- ✅ Removed compat export from `packages/ds/src/index.ts`
- ✅ Deleted compat directory

---

### ✅ Step 2: Cleanup Lib Shims

**Re-export Shims Removed:**
- ✅ `lib/layoutConfig.ts` → Was re-exporting from utils
- ✅ `lib/semanticSizing.ts` → Was re-exporting from utils
- ✅ `lib/toneResolver.ts` → Was re-exporting from white-label
- ✅ `lib/useContrastGuard.ts` → Was re-exporting from white-label

**Real Utilities Moved:**
- ✅ `lib/focus/` → `a11y/focus/` (6 files)
  - FocusTrap.tsx
  - FocusScope.tsx
  - RovingFocus.tsx
  - focusUtils.ts
  - debug.ts
  - index.ts

**Import Updates:**
- ✅ Updated `OverlayPickerCore.tsx` to import from `a11y/focus`

**Deletions:**
- ✅ Deleted all re-export shim files
- ✅ Deleted empty `lib/` directory

---

## Build Issues Discovered

### ⚠️ Barrel Export Problems

**Issue:** Files with hyphens in names break barrel generation

**Affected Files:**
```
a11y/a11y-validator.ts     → exports: a11yValidator
a11y/input-modality.ts     → exports: inputModality, useInputModality
a11y/sr-announce.tsx       → exports: SrAnnounce, announce, useSrAnnounce
utils/debug-typography.ts  → exports: TypographyAuditResult, debugTypography
```

**Fix Applied:**
- ✅ Manually fixed `a11y/index.ts` with explicit named exports
- ✅ Manually fixed `utils/index.ts` with explicit named exports
- ✅ Added `export * from './focus'` to a11y barrel

---

### ⚠️ Deep Import Issues (Still Present)

**Problem:** Fields are using deep imports like:
```typescript
import { ... } from '@intstudio/ds/primitives/overlay'
import { ... } from '@intstudio/ds/primitives/picker'
import { ... } from '@intstudio/ds/utils'
```

These fail during build because the package exports reference paths that don't exist yet (`./dist/utils/index.js`).

**Root Cause:**
Internal source files should use **relative imports**, not package imports. Package imports should only be used by external consumers.

**Examples:**
```typescript
// ❌ Internal file using package import
import { ... } from '@intstudio/ds/utils'

// ✅ Should use relative import
import { ... } from '../utils'
```

**Files Affected:**
- Most field components
- Some primitive components
- Context files

---

## Current State

### ✅ What Works
- Guard passes (0 errors, 1 benign warning)
- Compat directory removed
- Lib directory removed  
- Focus utilities in correct location (a11y/focus)
- Barrel exports manually fixed

### ⚠️ What Doesn't Work
- Build fails due to deep import resolution
- ~70 files using package imports internally

---

## Next Steps

### Option 1: Fix Deep Imports (Recommended)

**Approach:** Convert internal package imports to relative imports

**Implementation:**
```bash
# Create codemod to convert:
@intstudio/ds/primitives → ../primitives or ../../primitives
@intstudio/ds/utils → ../utils or ../../utils
@intstudio/ds/a11y → ../a11y
```

**Pros:**
- Proper architecture (internal = relative, external = package)
- Build works correctly
- Faster builds (no package resolution)

**Cons:**
- Need to write codemod
- Touch ~70 files

---

### Option 2: Adjust Build Config

**Approach:** Configure tsup/esbuild to handle package imports during build

**Pros:**
- No code changes needed
- Quick fix

**Cons:**
- Wrong pattern (internal shouldn't use package imports)
- Slower builds
- More complex build config

---

### Option 3: Skip For Now

**Approach:** Move to multi-tenant theming, come back to this

**Pros:**
- Move forward on features
- Build might work after other changes

**Cons:**
- Technical debt remains
- Build still broken

---

## Recommendation

**Fix the deep imports properly (Option 1)**

This is the right long-term architecture. Internal files should use relative imports. Package imports are for external consumers only.

**Estimated Time:** 1-2 hours
- Write codemod: 30 min
- Run codemod: 5 min
- Test build: 10 min
- Fix any edge cases: 30 min

---

## Files Changed Summary

**Deleted:**
- `packages/ds/src/compat/` (4 files)
- `packages/ds/src/lib/*.ts` (4 files)
- `packages/ds/src/lib/` (empty directory)

**Moved:**
- `packages/ds/src/lib/focus/` → `packages/ds/src/a11y/focus/`

**Modified:**
- `packages/ds/src/index.ts` (removed compat exports)
- `packages/ds/src/a11y/index.ts` (manual barrel fixes)
- `packages/ds/src/utils/index.ts` (manual barrel fixes)
- `packages/ds/src/components/overlay/OverlayPickerCore.tsx` (import path)
- 26 field/component files (compat codemod)

**Created:**
- `scripts/codemods/remove-compat-shims.mjs`

---

## Statistics

**Code Removed:**
- 8 files deleted
- ~2KB of re-export shims removed
- Compat layer eliminated

**Code Moved:**
- 6 focus utility files → proper location

**Replacements:**
- 40 compat usage replacements
- 26 files updated by codemod

**Current Issues:**
- ~70 files with deep import violations
- Build broken (need deep import fix)

---

## What to Do Next?

**Immediate:**
1. Fix deep imports (Option 1) - OR -
2. Move to multi-tenant theming (Option 3)

**User Decision Needed:**
Which approach should we take?
- Fix build now (1-2 hours)?
- Move to theming (3 days, come back to build)?

---

**Current Progress:** Step 1 & 2 done, Step 3 (fix build) or move to Step 4 (theming)?
