# God-Tier Tooling - Implementation Progress

**Date:** 2025-10-23
**Status:** 🚀 IN PROGRESS (1 of 3 complete)

## Objective

Fix tooling to prevent recurring issues:
1. Barrel generator handles hyphens incorrectly
2. Import Doctor doesn't catch internal package imports
3. No ESLint protection against self-imports

---

## ✅ Tool 1: Smart Barrel Generator (COMPLETE)

**File:** `scripts/barrelize.mjs`

**Problem:**
- Generated invalid exports like `export { a11y-validator }` (hyphens break JS)
- Guessed exports from filenames instead of parsing actual exports
- Created duplicate exports (e.g., `Body` from both Body.tsx and Text.tsx)

**Solution:**
- Parses actual exports using regex patterns
- Detects: `export const/function/class`, `export type`, `export interface`, `export { X as Y }`
- Handles aliases correctly (`export { Body as Text }` → exports `Text`, not `Body`)
- Separates types and values (`export type { ... }` vs `export { ... }`)
- Handles files with hyphens by reading their actual named exports

**Features:**
```javascript
// Detects all export patterns:
export const foo = ...              // ✅
export function bar() { }           // ✅
export class Baz { }                // ✅
export type Foo = ...               // ✅
export interface Bar { }            // ✅
export { Body as Text } from './Body'  // ✅ exports Text
export default Something            // ✅
```

**Result:**
```bash
$ pnpm barrels

✅ packages/ds/src/primitives/index.ts
   (32 exports from 22 files)
✅ packages/ds/src/a11y/index.ts
   (20 exports from 6 files)
✅ packages/ds/src/utils/index.ts
   (31 exports from 7 files)
```

**Impact:**
- ✅ No more manual barrel fixes
- ✅ Handles hyphened filenames correctly
- ✅ No duplicate exports
- ✅ Types and values properly separated

---

## 🚧 Tool 2: Enhanced Import Doctor (80% COMPLETE)

**File:** `scripts/import-doctor-enhanced.mjs`

**Problem:**
Internal files use package imports which break builds:
```typescript
// ❌ Internal file in packages/ds/src/
import { useMotion } from '@intstudio/ds/utils'

// ✅ Should be:
import { useMotion } from '../utils'
```

**Solution Created:**
- Detects when a file belongs to a package (e.g., `packages/ds/src/`)
- Checks if imports are from the same package (`@intstudio/ds/*`)
- Calculates correct relative path
- Auto-fixes with `--fix` flag

**Algorithm:**
```javascript
1. For each file in packages/*/src/**/*.ts:
   - Detect which package it belongs to (ds, forms, etc.)
   - Parse import statements
   - Check if importing from own package
   - Calculate relative path
   - Suggest or apply fix
```

**Status:**
- ✅ Detection logic complete
- ✅ Relative path calculation complete
- ✅ Auto-fix logic complete
- ⚠️ Has string escaping bug (`\\n` instead of actual newlines)
- ⏸️ Needs testing & bug fix

**Next Steps:**
1. Fix template literal newlines
2. Test detection
3. Run with --fix flag
4. Verify ~70 files get fixed
5. Test build passes

---

## ⏸️ Tool 3: ESLint Rule (NOT STARTED)

**File:** `packages/eslint-plugin-cascade/rules/no-self-package-imports.js`

**Problem:**
No IDE-time protection against self-package imports

**Solution Plan:**
Create ESLint rule that:
- Detects package context from file path
- Checks if import spec matches package name
- Suggests relative import
- Auto-fixable

**Implementation:**
```javascript
module.exports = {
  meta: {
    type: 'problem',
    fixable: 'code',
    messages: {
      selfPackageImport: 'Internal files should use relative imports, not package imports. Use "{{relative}}" instead.'
    }
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const filename = context.getFilename();
        const importSource = node.source.value;
        
        // Detect self-package import
        // Suggest relative path
        // Report with auto-fix
      }
    };
  }
};
```

**Integration:**
```javascript
// packages/eslint-plugin-cascade/index.js
module.exports = {
  rules: {
    'no-self-package-imports': require('./rules/no-self-package-imports'),
    // ... other rules
  }
};
```

---

## Current Build Status

**Before God-Tier Tooling:**
- ❌ Build fails with ~70 self-package import errors
- ❌ Barrel exports broken for hyphened files
- ❌ Manual fixes required every time

**After Tool 1 (Barrel Generator):**
- ✅ Barrels generate correctly
- ✅ No more duplicate exports
- ❌ Still ~70 self-package import errors

**After Tool 2 (Import Doctor - when complete):**
- ✅ Auto-fixes all self-package imports
- ✅ Build passes
- ✅ No manual intervention

**After Tool 3 (ESLint Rule):**
- ✅ IDE catches violations before commit
- ✅ Auto-fix in IDE
- ✅ Pre-commit hook prevents violations

---

## Testing Plan

### Tool 1 (✅ DONE):
```bash
pnpm barrels
# Should generate correct barrels with no errors
```

### Tool 2 (TODO):
```bash
# Fix the template literal bug first
# Then test:
node scripts/import-doctor-enhanced.mjs
# Should find ~70 violations

node scripts/import-doctor-enhanced.mjs --fix
# Should fix all violations

pnpm -F @intstudio/ds build
# Should pass!
```

### Tool 3 (TODO):
```bash
# After implementing:
pnpm lint
# Should catch self-package imports in IDE

# Add to .eslintrc.json:
{
  "plugins": ["@intstudio/cascade"],
  "rules": {
    "@intstudio/cascade/no-self-package-imports": "error"
  }
}
```

---

## Files Created

**✅ Complete:**
- `scripts/barrelize.mjs` (enhanced)

**🚧 Needs Bug Fix:**
- `scripts/import-doctor-enhanced.mjs` (90% done)

**⏸️ Not Started:**
- `packages/eslint-plugin-cascade/rules/no-self-package-imports.js`
- Tests for all 3 tools

---

## Estimated Time Remaining

**Tool 2 (Import Doctor):**
- Fix template literal bug: 5 min
- Test & verify: 10 min
- Run --fix on codebase: 5 min
- **Total: 20 minutes**

**Tool 3 (ESLint Rule):**
- Implement rule: 30 min
- Add tests: 15 min
- Integrate into plugin: 10 min
- Update docs: 5 min
- **Total: 60 minutes**

**Total Remaining:** ~1.5 hours for complete god-tier tooling

---

## Next Actions

**Immediate (20 min):**
1. Fix `import-doctor-enhanced.mjs` newline escaping
2. Test detection
3. Run `--fix` on codebase
4. Verify build passes

**Then (1 hour):**
1. Implement ESLint rule
2. Add to eslint-plugin-cascade
3. Update .eslintrc.json
4. Test in IDE

**Final (15 min):**
1. Document all 3 tools
2. Update pre-commit hooks
3. Create ADR for god-tier tooling

---

## Success Criteria

**✅ Tool 1:**
- Barrels generate without manual intervention
- Handles all file naming patterns
- No duplicate exports

**🎯 Tool 2:**
- Detects all self-package imports
- Auto-fixes to correct relative paths
- Build passes after fix

**🎯 Tool 3:**
- IDE shows errors for self-package imports
- Auto-fix available in IDE
- Pre-commit hook prevents violations

**🎯 Overall:**
- Zero manual barrel fixes needed
- Zero self-package imports in codebase
- Build always passes
- Violations caught before commit

---

## Ready to Continue?

**Option A:** Fix Import Doctor bug + test (20 min)
- Get build passing
- Complete Tool 2

**Option B:** Skip to ESLint rule (1 hour)
- Add IDE protection
- Come back to Import Doctor

**Option C:** Document what we have and move on
- Tool 1 works perfectly
- Tools 2 & 3 documented for later

**Recommendation:** Option A - finish Tool 2, it's 90% done and will unblock the build!
