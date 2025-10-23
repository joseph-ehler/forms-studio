# Canonical Import Policy

**Single source of truth for import rules across the monorepo.**

---

## **The Rules (TL;DR)**

### **DS Package Internals**
✅ **MUST** use relative imports  
❌ **NEVER** use package barrels (`@intstudio/ds/...`)

```typescript
// ✅ CORRECT (DS internal file)
import { Stack } from '../../primitives/Stack';
import { FormLabel } from '../Label';

// ❌ WRONG (DS internal file)
import { Stack } from '@intstudio/ds/primitives';
import { FormLabel } from '@intstudio/ds';
```

### **External Consumers (Forms, Apps, Examples)**
✅ **MUST** use package barrels (`@intstudio/ds/...`)  
❌ **NEVER** use deep imports or relative paths

```typescript
// ✅ CORRECT (Forms package, external consumer)
import { Stack, FormLabel } from '@intstudio/ds';
import { useMotion } from '@intstudio/ds/utils';

// ❌ WRONG (Forms package, external consumer)
import { Stack } from '@intstudio/ds/src/primitives/Stack';
import { useMotion } from '@intstudio/ds/utils/motion/useMotion';
```

---

## **Why This Policy Exists**

### **Problem: Import Chaos**
Before this policy:
- DS internals imported from barrels → circular dependencies
- External consumers used deep imports → broke tree-shaking
- No clear boundary between internal/external
- Import doctor couldn't distinguish intent

### **Solution: Clear Boundaries**
```
┌──────────────────────────────────────────┐
│  DS Package (Internal)                   │
│  - Relative imports ONLY                 │
│  - Full access to implementation         │
│  - Fast, no barrel overhead              │
└──────────────────────────────────────────┘
                  ↓
        (Public Barrels)
                  ↓
┌──────────────────────────────────────────┐
│  External Consumers                      │
│  - Package barrels ONLY                  │
│  - Public API surface                    │
│  - Tree-shakeable                        │
└──────────────────────────────────────────┘
```

---

## **Enforcement**

### **Import Doctor**
Automatically flags violations:

```bash
pnpm imports:check
```

**Output:**
```
❌ packages/ds/src/primitives/Stack.tsx
   Line 5: import { FormLabel } from '@intstudio/ds'
   → DS internals must use relative imports
   Suggested: import { FormLabel } from '../typography/FormLabel'

❌ packages/forms/src/fields/TextField.tsx
   Line 8: import { Stack } from '@intstudio/ds/src/primitives/Stack'
   → External consumers must use package barrels
   Suggested: import { Stack } from '@intstudio/ds'
```

### **CI Enforcement**
Pull requests fail if violations detected:

```yaml
- name: Check imports
  run: pnpm imports:check
```

---

## **Migration Guide**

### **Fixing DS Internal Violations**

**Before:**
```typescript
// packages/ds/src/primitives/Stack.tsx
import { FormLabel } from '@intstudio/ds';
```

**After:**
```typescript
// packages/ds/src/primitives/Stack.tsx
import { FormLabel } from '../typography/FormLabel';
```

### **Fixing External Consumer Violations**

**Before:**
```typescript
// packages/forms/src/fields/TextField.tsx
import { Stack } from '@intstudio/ds/src/primitives/Stack';
```

**After:**
```typescript
// packages/forms/src/fields/TextField.tsx
import { Stack } from '@intstudio/ds';
```

---

## **Exemptions**

### **Legacy Code (Intentionally Not Updated)**
Import doctor skips these paths:
- `packages/ds/src/fields/` (pre-migration facades)
- `packages/ds/src/components/` (legacy components)
- `packages/ds/src/compat/` (backward compat layer)
- See `factory.config.json` for full list

### **Build Scripts**
Scripts can import however needed (pragmatic exception).

---

## **FAQs**

### **Q: Why can't DS use its own barrels?**
**A:** Circular dependencies. Barrels aggregate exports; if internals import from barrels, you create import cycles that break builds.

### **Q: Why force external consumers to use barrels?**
**A:** 
1. **Tree-shaking** - Bundlers can eliminate unused code
2. **Public API** - Only exported items are accessible
3. **Versioning** - Internal paths can change without breaking consumers

### **Q: What about performance?**
**A:** 
- DS internals: Relative imports are faster (no barrel resolution)
- External consumers: Barrel overhead is negligible (<1ms) and worth it for tree-shaking

### **Q: Can I import from a sub-barrel?**
**A:** Yes! Sub-barrels are fine:
```typescript
import { useMotion } from '@intstudio/ds/utils';      // ✅ OK
import { Stack } from '@intstudio/ds';                // ✅ OK
import { Stack } from '@intstudio/ds/primitives';     // ✅ OK (if exported)
```

### **Q: What if import doctor is wrong?**
**A:** File an issue. The tool can make mistakes, but the policy is correct. We'll fix the detection logic.

---

## **Quick Reference**

| Scenario | Rule | Example |
|----------|------|---------|
| DS internal file imports another DS file | Relative | `import { X } from '../Y'` |
| Forms imports from DS | Barrel | `import { X } from '@intstudio/ds'` |
| App imports from DS | Barrel | `import { X } from '@intstudio/ds'` |
| Example imports from DS | Barrel | `import { X } from '@intstudio/ds'` |
| Script imports anything | Pragmatic | Whatever works |

---

## **Tools**

- **Check:** `pnpm imports:check`
- **Auto-fix:** `pnpm imports:fix` (when safe)
- **Config:** `factory.config.json` → `policies.dsInternalImports`

---

## **History**

- **2025-01-15:** Policy established after DS circular dependency issues
- **2025-01-20:** Import doctor enforces automatically
- **2025-10-23:** Documented in handbook (God Tier Sprint)

---

**Status:** ENFORCED  
**Contact:** See import-doctor.mjs for implementation  
**Related:** repo.imports.yaml, factory.config.json
