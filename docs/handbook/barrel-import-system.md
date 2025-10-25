# Barrel & Import System

> **Zero-toil barrel management with hard technical guarantees**

## Philosophy

- **No deep imports**: Only use package entry points (`@intstudio/ds`)
- **No relative spelunking**: Use barrels (`./index`) not deep paths (`../../../foo`)
- **Auto-generated**: Barrels are generated from source, never hand-written
- **Sealed APIs**: `package.json` exports physically block deep imports
- **Cycle-free**: Circular dependencies detected and blocked in CI

## Quick Start

```bash
# Fix everything in one command
pnpm fix:barrels

# Just regenerate barrels
pnpm barrels

# Check if barrels are fresh
pnpm barrels:check

# Fix imports and sorting
pnpm fix:imports

# Check for circular dependencies
pnpm deps:cycles
```

## System Components

### 1. Auto-Generated Barrels (barrelsby)

**Config**: `.barrelsby.json`

Automatically generates `index.ts` barrel files in every folder with exports:

```typescript
// packages/ds/src/hooks/index.ts (auto-generated)
export { useFocusTrap } from './useFocusTrap';
export { useDeviceType } from './useDeviceType';
export type { DeviceType } from './useDeviceType';
```

**When it runs**:
- Before build (`prebuild` hook)
- On demand (`pnpm barrels`)
- In CI (fails if barrels out of date)

### 2. Import Hygiene (ESLint)

**Config**: `.eslintrc.import-hygiene.cjs`

Enforces barrel usage and blocks bad patterns:

```typescript
// ❌ BLOCKED: Deep imports
import { useFocusTrap } from '@intstudio/ds/src/hooks/useFocusTrap';

// ❌ BLOCKED: Deep relative paths
import { useFocusTrap } from '../../../ds/src/hooks/useFocusTrap';

// ✅ CORRECT: Package barrel
import { useFocusTrap } from '@intstudio/ds';

// ✅ CORRECT: Local barrel (within same package)
import { useFocusTrap } from './hooks';
```

**Rules enforced**:
- `import/no-internal-modules`: Block deep package imports
- `no-restricted-imports`: Block `/src/` imports and deep relative paths
- `simple-import-sort/imports`: Sort imports consistently
- `import/no-cycle`: Detect circular dependencies
- `import/no-default-export`: Prefer named exports

### 3. Sealed Public APIs (package.json exports)

**Enforcement**: Node.js module resolver

Each package's `exports` field restricts what can be imported:

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./styles": "./dist/index.css",
    "./package.json": "./package.json"
  }
}
```

**What this means**:
- ✅ `import { X } from '@intstudio/ds'` → **Works**
- ✅ `import '@intstudio/ds/styles'` → **Works**
- ❌ `import { X } from '@intstudio/ds/src/hooks'` → **Physically blocked by Node**

This is the **strongest** guarantee—even if someone bypasses ESLint, Node's resolver will reject the import.

### 4. Circular Dependency Detection (madge)

**Script**: `scripts/check-cycles.mjs`

Detects circular imports that can cause:
- Initialization order bugs
- Undefined exports
- Memory leaks
- Hard-to-debug runtime errors

```bash
# Check all packages
pnpm deps:cycles

# Check specific package
pnpm deps:cycles --package ds
```

**Output**:
```
❌ ds: Found 1 circular dependencies

   Cycle 1:
      hooks/useFocusTrap.ts →
      routes/FlowScaffold.tsx →
      hooks/useSubFlow.ts ⮎
```

## Workflows

### Daily Development

```bash
# Before committing
pnpm fix:barrels        # Auto-fix everything

# Or manually
pnpm barrels            # Regenerate barrels
pnpm fix:imports        # Fix and sort imports
pnpm deps:cycles        # Check for cycles
```

### CI Validation

Three parallel checks in `.github/workflows/barrel-hygiene.yml`:

1. **Barrel freshness**: Fails if barrels are out of date
2. **Circular dependencies**: Fails if cycles detected
3. **Import hygiene**: Fails if deep imports or bad patterns

All must pass before merge.

### Fixing Violations

**Out-of-date barrels**:
```bash
pnpm barrels
git add packages/**/index.ts
git commit -m "chore: update barrels"
```

**Deep import violations**:
```bash
# Auto-fix
pnpm fix:imports

# Or manually change
- import { X } from '@intstudio/ds/src/hooks/useX';
+ import { X } from '@intstudio/ds';
```

**Circular dependencies**:
1. Review the cycle output
2. Extract shared code to common module
3. Use dependency injection
4. Consider architectural refactor

## Architecture Patterns

### Package Structure

```
packages/
  ds/
    src/
      hooks/
        index.ts          # Barrel (auto-generated)
        useFocusTrap.ts
        useDeviceType.ts
      routes/
        index.ts          # Barrel (auto-generated)
        FlowScaffold/
          index.ts        # Barrel (auto-generated)
          FlowScaffold.tsx
      index.ts            # Package barrel
    dist/                 # Build output
    package.json          # Sealed exports
```

### Import Hierarchy

**External → Internal → Same-folder**:

```typescript
// 1. External packages (React, third-party)
import { useState } from 'react';
import { z } from 'zod';

// 2. Internal packages (via barrel)
import { useFocusTrap } from '@intstudio/ds';
import { FormSpec } from '@intstudio/core';

// 3. Same-folder relative (via local barrel)
import { SubComponent } from './SubComponent';
import type { Props } from './types';

// 4. Styles last
import './Component.css';
```

Auto-sorted by `simple-import-sort/imports`.

### Breaking Cycles

**Problem**: Components import each other

```typescript
// ComponentA.tsx
import { ComponentB } from './ComponentB';

// ComponentB.tsx
import { ComponentA } from './ComponentA';  // ❌ Cycle!
```

**Solutions**:

1. **Extract shared code**:
```typescript
// shared.ts
export const sharedLogic = () => { /* ... */ };

// ComponentA.tsx
import { sharedLogic } from './shared';

// ComponentB.tsx
import { sharedLogic } from './shared';
```

2. **Dependency injection**:
```typescript
// ComponentA.tsx
export function ComponentA({ renderB }: { renderB: () => JSX.Element }) {
  return <div>{renderB()}</div>;
}

// Parent.tsx
<ComponentA renderB={() => <ComponentB />} />
```

3. **Use types only**:
```typescript
// ComponentB.tsx
import type { ComponentAProps } from './ComponentA';  // ✅ Type-only, no cycle
```

## Configuration Reference

### `.barrelsby.json`

```json
{
  "directory": ["packages/ds/src", "packages/core/src"],
  "delete": true,                    // Remove stale barrels
  "exclude": [                       // Skip these files
    "**/*.stories.tsx",
    "**/__tests__/**",
    "**/*.test.*"
  ],
  "exportDefault": false,            // Only named exports
  "location": "top",                 // Export statements at top
  "structure": "flat",               // Flat export structure
  "singleQuotes": true,              // Use single quotes
  "local": true                      // Generate in each subfolder
}
```

### `.eslintrc.import-hygiene.cjs`

Key rules:

```javascript
{
  'import/no-internal-modules': ['error', {
    forbid: ['@intstudio/ds/**', '@intstudio/core/**'],
    allow: ['**/*.css']
  }],
  'no-restricted-imports': ['error', {
    patterns: [
      '@intstudio/*/src/*',  // Block /src imports
      '../**/*'              // Block deep relative paths
    ]
  }],
  'simple-import-sort/imports': 'error',
  'import/no-cycle': ['error', { maxDepth: 10 }]
}
```

### `package.json` exports

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./styles": "./dist/index.css",
    "./package.json": "./package.json"
  }
}
```

**Only these paths are importable**. Everything else is physically blocked.

## FAQ

### Do I need to manually update barrels?

**No.** Run `pnpm barrels` (or `pnpm fix:barrels`) and they're regenerated from source.

### What if I need a specific sub-entry?

Add it to `package.json` exports:

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./hooks": "./dist/hooks/index.js",  // Allow @intstudio/ds/hooks
    "./routes": "./dist/routes/index.js"
  }
}
```

Then update ESLint allow list:

```javascript
{
  'import/no-internal-modules': ['error', {
    allow: ['@intstudio/ds/hooks', '@intstudio/ds/routes']
  }]
}
```

### What about CSS imports?

Already allowed:

```typescript
import '@intstudio/ds/styles';  // ✅ Allowed in exports
import './Component.css';        // ✅ Always allowed
```

### Can I use default exports?

**Discouraged.** ESLint warns on default exports (except config files and stories).

Named exports are:
- Easier to refactor
- Better for tree-shaking
- More explicit
- IDE-friendly

### How do I fix "Module not found" errors after sealing?

You're likely using a deep import that's now blocked:

```typescript
// ❌ This no longer works
import { X } from '@intstudio/ds/src/hooks';

// ✅ Use the barrel
import { X } from '@intstudio/ds';
```

Run `pnpm fix:imports` to auto-fix.

### What if barrels create a cycle?

1. Run `pnpm deps:cycles` to see the cycle
2. Refactor using patterns from "Breaking Cycles" section
3. Consider if the architecture needs adjustment

**Cycles are code smells**—they indicate unclear module boundaries.

## Integration Points

### Pre-commit Hook

Add to `.git/hooks/pre-commit`:

```bash
pnpm barrels:check || exit 1
```

### Pre-build Hook

Already configured in `package.json`:

```json
{
  "scripts": {
    "prebuild": "pnpm barrels:check"
  }
}
```

Build fails if barrels are stale.

### CI/CD

GitHub Actions workflow runs three checks:
- Barrel freshness
- Circular dependencies
- Import hygiene

See `.github/workflows/barrel-hygiene.yml`.

## Migration Guide

### From Manual Barrels

1. **Backup current barrels** (optional):
   ```bash
   find packages -name "index.ts" -exec cp {} {}.bak \;
   ```

2. **Generate new barrels**:
   ```bash
   pnpm barrels
   ```

3. **Review changes**:
   ```bash
   git diff packages/**/index.ts
   ```

4. **Test**:
   ```bash
   pnpm build
   pnpm typecheck
   ```

5. **Commit**:
   ```bash
   git add packages/**/index.ts
   git commit -m "chore: migrate to auto-generated barrels"
   ```

### From Deep Imports

1. **Audit current imports**:
   ```bash
   # Find deep imports
   grep -r "@intstudio/ds/src" packages/
   grep -r "../../../" packages/
   ```

2. **Auto-fix**:
   ```bash
   pnpm fix:barrels
   ```

3. **Manual review**:
   Check for any remaining violations:
   ```bash
   eslint --config .eslintrc.import-hygiene.cjs "packages/**"
   ```

4. **Test & commit**:
   ```bash
   pnpm build
   pnpm typecheck
   git add -u
   git commit -m "refactor: migrate to barrel imports"
   ```

## Maintenance

### Nightly Jobs (Optional)

Add a scheduled workflow to auto-fix and PR:

```yaml
name: Nightly Barrel Maintenance
on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM daily

jobs:
  auto-fix:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm fix:barrels
      - uses: peter-evans/create-pull-request@v5
        with:
          commit-message: "chore: auto-update barrels"
          title: "🤖 Auto-fix: Barrel & import hygiene"
```

### Monitoring

Track violations over time:

```bash
# Count deep imports
grep -r "@intstudio/.*/src/" packages/ | wc -l

# Count cycles
pnpm deps:cycles 2>&1 | grep "Found" | awk '{sum += $3} END {print sum}'
```

Add to dashboard or metrics.

## Summary

**What we built**:
- ✅ Auto-generated barrels (zero toil)
- ✅ ESLint rules (prevent bad patterns)
- ✅ Sealed exports (physical enforcement)
- ✅ Cycle detection (catch architectural issues)
- ✅ CI validation (block regressions)
- ✅ One-command fix (`pnpm fix:barrels`)

**What you get**:
- Clean, consistent import paths
- No manual barrel maintenance
- Hard guarantees (not just conventions)
- Early detection of architectural issues
- Faster reviews (no import bikeshedding)

**Next steps**:
1. Install dependencies: `pnpm install`
2. Generate barrels: `pnpm barrels`
3. Fix imports: `pnpm fix:imports`
4. Commit and push
5. Watch CI validate everything

---

**Questions?** See the [FAQ](#faq) or check `.barrelsby.json` and `.eslintrc.import-hygiene.cjs` for details.
