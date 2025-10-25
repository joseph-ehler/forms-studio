# Barrel & Import Quick Reference

> **TL;DR**: Use `pnpm fix:barrels` before committing. Import from barrels, not deep paths.

## Commands

```bash
# Fix everything (one command)
pnpm fix:barrels

# Individual operations
pnpm barrels              # Regenerate barrel files
pnpm barrels:check        # Verify barrels are fresh
pnpm fix:imports          # Fix and sort imports
pnpm deps:cycles          # Check for circular dependencies
```

## Import Rules

### ✅ DO

```typescript
// Use package barrels
import { useFocusTrap, FlowScaffold } from '@intstudio/ds';
import { FormSpec } from '@intstudio/core';

// Use local barrels (within same package)
import { SubComponent } from './components';
import { useCustomHook } from './hooks';

// Styles are always okay
import '@intstudio/ds/styles';
import './Component.css';
```

### ❌ DON'T

```typescript
// Deep imports across packages
import { useFocusTrap } from '@intstudio/ds/src/hooks/useFocusTrap';

// Importing from /src internals
import { X } from '@intstudio/core/src/schema/types';

// Deep relative paths
import { X } from '../../../ds/src/hooks/useX';

// Bypassing local barrels
import { SubComponent } from './components/SubComponent/SubComponent';
```

## Fix Common Errors

### "Module not found: @intstudio/ds/src/..."

**Problem**: Deep import blocked by sealed exports

**Fix**:
```typescript
- import { X } from '@intstudio/ds/src/hooks/useX';
+ import { X } from '@intstudio/ds';
```

Or run: `pnpm fix:imports`

### "Barrels are out of date"

**Problem**: `index.ts` files don't match source files

**Fix**:
```bash
pnpm barrels
git add packages/**/index.ts
git commit -m "chore: update barrels"
```

### "Circular dependency detected"

**Problem**: Files import each other in a loop

**Fix**:
1. Run `pnpm deps:cycles` to see the cycle
2. Extract shared code to a separate file
3. Use dependency injection
4. Or use type-only imports: `import type { X } from './Y';`

### "Import path violates boundaries"

**Problem**: Bypassing barrels with relative paths

**Fix**:
```typescript
- import { X } from '../../hooks/useX';
+ import { X } from './hooks';  // Use local barrel
```

Or run: `pnpm fix:imports`

## Import Order

Auto-sorted by `simple-import-sort`:

```typescript
// 1. Side effects (CSS)
import './global.css';

// 2. React
import { useState } from 'react';

// 3. External packages
import { z } from 'zod';

// 4. Internal packages (@intstudio)
import { useFocusTrap } from '@intstudio/ds';
import { FormSpec } from '@intstudio/core';

// 5. Relative imports
import { SubComponent } from './SubComponent';
import type { Props } from './types';

// 6. Styles last
import './Component.css';
```

## Pre-Commit Checklist

```bash
# 1. Fix everything
pnpm fix:barrels

# 2. Verify
pnpm barrels:check
pnpm deps:cycles

# 3. Commit
git add -u
git commit -m "your message"
```

Or just run `pnpm fix:barrels` and it handles steps 1-2.

## CI Checks

Three checks run on every PR:

1. **Barrel freshness**: Barrels must be up to date
2. **Circular dependencies**: No cycles allowed
3. **Import hygiene**: No deep imports or bad patterns

All must pass to merge.

## When to Update Barrels

**Automatically** (you don't need to think about it):
- Before build (`prebuild` hook)
- When you run `pnpm fix:barrels`

**Manually** (rare):
- After adding new files
- After renaming files
- After moving files

Just run: `pnpm barrels`

## Exceptions

**Need a specific sub-entry?**

1. Add to `package.json`:
```json
{
  "exports": {
    "./hooks": "./dist/hooks/index.js"
  }
}
```

2. Update ESLint allow list in `.eslintrc.import-hygiene.cjs`:
```javascript
{
  allow: ['@intstudio/ds/hooks']
}
```

**Need default exports?**

They're allowed in:
- Config files (`*.config.*`)
- Story files (`*.stories.*`)
- Pages/routes

Everywhere else: use named exports.

## Help

**Full documentation**: `docs/handbook/barrel-import-system.md`  
**ADR**: `docs/adr/2025-01-24-barrel-import-standardization.md`  
**Issues?**: Run `pnpm fix:barrels` first, then ask for help if still stuck

## Summary

| Problem | Solution |
|---------|----------|
| Out of date barrels | `pnpm barrels` |
| Deep import errors | `pnpm fix:imports` |
| Circular dependencies | `pnpm deps:cycles` then refactor |
| Any import issues | `pnpm fix:barrels` |
| CI failure | `pnpm fix:barrels` then commit |

**One command to rule them all**: `pnpm fix:barrels`
