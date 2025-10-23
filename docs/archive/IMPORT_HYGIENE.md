# Import Hygiene - Enforced Standards

**Status:** ✅ Enforced via ESLint + CI  
**Last Updated:** October 22, 2025  

---

## The Rule: Scoped Imports Only

All cross-package imports **MUST** use the `@intstudio/*` scope. This prevents:
- Broken imports after refactoring
- Circular dependencies
- Deep coupling
- Import resolution ambiguity

---

## ✅ **Allowed Imports**

### **1. Within a Package (Relative OK)**

```typescript
// packages/ds/src/components/Button.tsx
import { tokens } from '../tokens'              // ✅ Relative within package
import { Stack } from './Stack'                 // ✅ Sibling import
import { getZIndex } from '../lib/zIndex'       // ✅ Within same package
```

### **2. Cross-Package (Scoped Only)**

```typescript
// packages/ds/src/fields/SelectField.tsx
import { evaluateExpression } from '@intstudio/core'        // ✅ Scoped import
import { Stack, Button } from '@intstudio/ds'              // ✅ Scoped import
```

### **3. Consumer Apps (Scoped Only)**

```typescript
// packages/demo-app/src/App.tsx
import { Button, Stack, Section } from '@intstudio/ds'     // ✅ Scoped import
import { createRuntime } from '@intstudio/core'            // ✅ Scoped import
```

---

## ❌ **Forbidden Imports**

### **1. Deep Imports**

```typescript
// ❌ FORBIDDEN
import { Button } from '@intstudio/ds/src/components/Button'
import { Stack } from '@intstudio/ds/dist/index'
```

**Why Forbidden:**
- Breaks when internal structure changes
- Bypasses public API
- No tree-shaking guarantees

**Fix:**
```typescript
// ✅ CORRECT
import { Button, Stack } from '@intstudio/ds'
```

---

### **2. Legacy Package Names**

```typescript
// ❌ FORBIDDEN
import { evaluateExpression } from '@joseph-ehler/wizard-core'
import { Button } from '@joseph.ehler/wizard-react'
```

**Why Forbidden:**
- Old package names from before reorganization
- Will break when packages are published

**Fix:**
```typescript
// ✅ CORRECT
import { evaluateExpression } from '@intstudio/core'
import { Button } from '@intstudio/ds'
```

---

### **3. Cross-Package Relative Imports (Consumer Apps)**

```typescript
// packages/demo-app/src/App.tsx

// ❌ FORBIDDEN
import { Button } from '../ds/src/components/Button'
import { Stack } from '../../wizard-react/src/components/Stack'
```

**Why Forbidden:**
- Breaks when directory structure changes
- Bypasses package boundaries
- Prevents proper versioning

**Fix:**
```typescript
// ✅ CORRECT
import { Button, Stack } from '@intstudio/ds'
```

---

## Enforcement

### **1. ESLint Rules**

```json
// .eslintrc.import-hygiene.json
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          "@intstudio/*/src/*",      // No deep imports
          "@intstudio/*/dist/*",     // No dist imports
          "@joseph*"                 // No legacy names
        ]
      }
    ]
  }
}
```

**Enabled for:**
- All packages
- All consumer apps
- All demos

**Exceptions:**
- Within-package imports (relative OK)
- Test files
- Config files

---

### **2. Automated Auditing**

```bash
# Check for violations
pnpm run imports:audit

# Output shows:
# ✅ Deep imports
# ✅ Legacy package names  
# ✅ Node modules CSS imports
# ❌ Violations (if any)
```

---

### **3. CI Enforcement**

```bash
# Runs on every commit
pnpm run guard

# Guard includes:
# 1. dependency-cruiser (package boundaries)
# 2. imports:audit (import hygiene)
# 3. lint (ESLint)
# 4. typecheck (TypeScript)
```

**CI will FAIL if:**
- Deep imports detected
- Legacy package names used
- Cross-package relative imports in consumer apps

---

## Migration Guide

### **If You Have Legacy Imports**

**Step 1: Find them**
```bash
pnpm run imports:audit
```

**Step 2: Fix deep imports**
```bash
# Find
import { Button } from '@intstudio/ds/src/components/Button'

# Replace with
import { Button } from '@intstudio/ds'
```

**Step 3: Fix legacy names**
```bash
# Find
import { evaluateExpression } from '@joseph-ehler/wizard-core'

# Replace with
import { evaluateExpression } from '@intstudio/core'
```

**Step 4: Fix cross-package relative imports**
```bash
# Find (in demo-app)
import { Button } from '../ds/src/components/Button'

# Replace with
import { Button } from '@intstudio/ds'
```

**Step 5: Verify**
```bash
pnpm run imports:audit
# Should show: ✅ All imports are clean!
```

---

## Package Export Patterns

### **DS Package (@intstudio/ds)**

```typescript
// packages/ds/src/index.ts
export { Button } from './components/Button'
export { Stack } from './components/Stack'
export { Section } from './components/Section'
// ... all public API

// package.json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  }
}
```

**Consumers import from:**
```typescript
import { Button, Stack, Section } from '@intstudio/ds'
```

---

### **Core Package (@intstudio/core)**

```typescript
// packages/core/src/index.ts
export { evaluateExpression } from './expression-engine'
export { createRuntime } from './runtime'
// ... all public API

// package.json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  }
}
```

**Consumers import from:**
```typescript
import { evaluateExpression, createRuntime } from '@intstudio/core'
```

---

## Benefits

### **1. Refactoring Safety**

```typescript
// You can move Button.tsx anywhere in packages/ds/src/
// Consumers don't break because they import from:
import { Button } from '@intstudio/ds'

// Not from:
import { Button } from '@intstudio/ds/src/components/Button' // ❌
```

---

### **2. Clear Package Boundaries**

```
@intstudio/ds        → Design System (UI primitives)
@intstudio/core      → Business logic (headless)
@intstudio/datasources → Data layer
@intstudio/forms     → Form components (future)
```

**Dependency-cruiser enforces:**
- DS cannot import from core/forms
- Core cannot import from DS
- No circular dependencies

**Import hygiene enforces:**
- All cross-package imports are scoped
- No deep imports bypass the boundary

---

### **3. Version Management**

```json
// When published to npm
{
  "dependencies": {
    "@intstudio/ds": "^0.1.0",
    "@intstudio/core": "^0.1.0"
  }
}
```

**Scoped imports work seamlessly:**
```typescript
// Same import, different sources
// Development: workspace:* (local packages)
// Production: ^0.1.0 (npm packages)
import { Button } from '@intstudio/ds'
```

---

### **4. Tree-Shaking**

**Only works with barrel exports:**

```typescript
// ✅ Tree-shakeable
import { Button } from '@intstudio/ds'
// Bundler only includes Button code

// ❌ Not guaranteed
import { Button } from '@intstudio/ds/src/components/Button'
// May pull in unexpected dependencies
```

---

## Troubleshooting

### **"Import not found" Error**

**Problem:**
```typescript
import { SomeComponent } from '@intstudio/ds'
// Error: Module '"@intstudio/ds"' has no exported member 'SomeComponent'
```

**Solution 1:** Check if exported from barrel
```typescript
// packages/ds/src/index.ts
export { SomeComponent } from './components/SomeComponent' // Must exist
```

**Solution 2:** Check TypeScript paths (dev only)
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@intstudio/ds": ["./packages/ds/src/index.ts"]
    }
  }
}
```

---

### **"Circular Dependency" Warning**

**Problem:**
```
WARNING: Circular dependency detected
@intstudio/ds -> @intstudio/core -> @intstudio/ds
```

**Solution:** Check dependency-cruiser rules
```bash
pnpm run depgraph:check
# Will show exact violation
```

**Fix:** Remove the circular import (DS should not import from core)

---

### **"Deep Import" Lint Error**

**Problem:**
```typescript
import { Button } from '@intstudio/ds/src/components/Button'
// ESLint: ❌ Deep imports forbidden
```

**Solution:**
```typescript
import { Button } from '@intstudio/ds'
```

---

## Scripts Reference

```bash
# Audit all imports
pnpm run imports:audit

# Clean up repo (duplicates, empty dirs)
pnpm run repo:cleanup

# Check dependency graph
pnpm run depgraph:check

# Run all guards (CI check)
pnpm run guard

# Build all packages
pnpm run build

# Run dev servers
pnpm run dev
```

---

## Files

**ESLint Config:**
- `.eslintrc.import-hygiene.json` - Import rules
- `packages/ds/.eslintrc.guardrails.json` - Includes import rules

**Scripts:**
- `scripts/audit-imports.sh` - Find violations
- `scripts/cleanup-repo.sh` - Clean duplicates

**Documentation:**
- `IMPORT_HYGIENE.md` - This file
- `REORGANIZATION_COMPLETE.md` - Platform structure
- `.dependency-cruiser.js` - Boundary rules

---

## Success Criteria

✅ **Import Hygiene is Complete When:**

- [ ] `pnpm run imports:audit` shows zero violations
- [ ] ESLint passes with import rules enabled
- [ ] CI guard includes import audit
- [ ] All packages use scoped imports only
- [ ] No deep imports (@intstudio/*/src/*)
- [ ] No legacy package names (@joseph*)
- [ ] Consumer apps have zero relative imports

---

## Future: Publish to npm

**Current:** `workspace:*` (local packages)
```json
{
  "dependencies": {
    "@intstudio/ds": "workspace:*"
  }
}
```

**After publish:** npm versions
```json
{
  "dependencies": {
    "@intstudio/ds": "^0.1.0"
  }
}
```

**Same imports work in both:**
```typescript
import { Button } from '@intstudio/ds'
```

This is why import hygiene matters - it makes publishing seamless!

---

## Maintenance

### **When Adding a New Package**

1. Add to `packages/`
2. Scope as `@intstudio/*`
3. Create barrel export in `src/index.ts`
4. Update `pnpm-workspace.yaml` (if needed)
5. Add to dependency-cruiser rules
6. Test import from consumer app

### **When Adding a New Export**

```typescript
// packages/ds/src/components/NewComponent.tsx
export function NewComponent() { ... }

// packages/ds/src/index.ts
export { NewComponent } from './components/NewComponent'

// Now consumers can:
import { NewComponent } from '@intstudio/ds'
```

### **When Refactoring**

Scoped imports = safe refactoring:
- Move files freely within `packages/ds/src/`
- Rename directories
- Reorganize structure

**Only update:** `packages/ds/src/index.ts` (barrel exports)

**Consumers don't break:** They import from `@intstudio/ds`

---

**Import hygiene enforced. Refactoring safe. Publishing ready.** 🎯
