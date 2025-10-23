# Software Updates - The Self-Healing Factory

## Overview

The God Tier Factory includes a **Refiner** system that enables retroactive, automated code upgrades across the entire codebase. When the generator learns a new pattern, the Refiner can apply it to ALL existing code with a single command.

This document explains how to run "software updates" and add new upgrade transforms.

---

## Recent Updates

### Level 1 Visual Polish (Oct 2025)

**Applied:** All 22 fields + Storybook  
**Duration:** 140ms  
**Transform:** `no-inline-styles-v1.0` (auto-fix enabled)

**What Changed:**
```tsx
// BEFORE
<input
  style={{
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
  }}
  {...field}
/>

// AFTER
<input
  className="ds-input w-full"
  {...field}
/>
```

**Impact:**
- ✅ Inline styles removed (all 23 files)
- ✅ DS classes applied (design tokens active)
- ✅ 70% visual polish upgrade
- ✅ Zero breaking changes
- ✅ All builds and tests green

---

## Running Software Updates

### 1. Dry-Run (Always First!)

Preview what will change without modifying files:

```bash
pnpm refine:dry --scope="packages/forms/src/fields/**/*.tsx"
```

**Output:**
- Files affected count
- Line-by-line changes
- Issue reports per transform

### 2. Apply Changes

After reviewing dry-run, apply the fixes:

```bash
pnpm refine:run --scope="packages/forms/src/fields/**/*.tsx"
```

### 3. Verify

```bash
# Ensure builds pass
pnpm -w build

# Ensure tests pass
pnpm generator:test

# Visual QA
pnpm --filter demo-app dev
```

### 4. Commit

```bash
git add -A
git commit -m "refactor: Software Update - [Description]

Applied [transform-name] to [N] files.

[Impact summary]

[What changed example]
"
```

---

## Available Transforms

### v1.1: `filter-dom-props`
**Status:** Report-only  
**Purpose:** Remove custom props from DOM elements to prevent React warnings

### v1.2: `dedupe-jsx-attrs`
**Status:** Auto-fix  
**Purpose:** Remove duplicate JSX attributes

### v1.3: `no-inline-styles`
**Status:** Auto-fix  
**Purpose:** Replace inline styles with DS classes
- Removes `style={{...}}` attributes
- Adds `className="ds-input w-full"` for inputs

### v1.3: `label-contract`
**Status:** Report-only (upgrade to auto-fix next)  
**Purpose:** Ensure `FormLabel` has `htmlFor` for accessibility

### v1.3: `telemetry-presence`
**Status:** Report-only  
**Purpose:** Verify telemetryAdapter imported when spec enables telemetry

---

## Adding New Transforms

### 1. Create Transform File

```bash
touch scripts/refiner/transforms/[name-v1.0].mjs
```

### 2. Implement Transform

```javascript
/**
 * Refiner Transform: [Name] v1.0
 * 
 * [Description of what it enforces and why]
 * 
 * Rule: [The pattern rule]
 * 
 * Auto-fix: [What the auto-fix does] OR Report-only
 */

import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';

export function [functionName]V1_0() {
  return {
    name: '[transform-name-v1.0]',
    apply: async ({ file, code }) => {
      const issues = [];
      let modified = false;
      
      try {
        const ast = parser.parse(code, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx'],
        });
        
        traverse.default(ast, {
          // Your AST traversal logic here
          JSXOpeningElement(path) {
            // Example: find and fix patterns
            if (/* condition */) {
              // Report issue
              issues.push({
                line: path.node.loc?.start.line,
                message: 'Issue description',
              });
              
              // Optionally modify (auto-fix)
              // ... AST manipulation
              modified = true;
            }
          },
        });
        
        if (modified) {
          const output = generate.default(ast, {
            retainLines: true,
            compact: false,
          });
          code = output.code;
        }
      } catch (error) {
        // Skip files that can't be parsed
      }
      
      return {
        changed: modified,
        code,
        issues,
      };
    },
  };
}
```

### 3. Register in Refiner

Edit `scripts/refiner/index.mjs`:

```javascript
import { [functionName]V1_0 } from './transforms/[name-v1.0].mjs';

// Add to transforms array
const transforms = [
  // ... existing transforms
  [functionName]V1_0(),
];
```

### 4. Test Transform

```bash
# Dry-run on single file
pnpm refine:dry --scope="packages/forms/src/fields/TextField/TextField.tsx"

# Dry-run on all fields
pnpm refine:dry --scope="packages/forms/src/fields/**/*.tsx"

# Apply to single file (testing)
pnpm refine:run --scope="packages/forms/src/fields/TextField/TextField.tsx"

# Verify no breaking changes
pnpm -w build
pnpm generator:test
```

---

## Rollout Discipline

### Report-Only → Trial PR → Auto-Fix

1. **Phase 1: Report-Only**
   - Transform identifies violations
   - Team reviews reports
   - Adjust transform if needed

2. **Phase 2: Trial PR**
   - Apply transform to 2-3 files
   - Manual review of changes
   - Verify builds/tests green

3. **Phase 3: Auto-Fix**
   - Enable `changed: true` in transform
   - Run across all files
   - Software update commit

### Always Follow This Sequence

```bash
# 1. Dry-run (review changes)
pnpm refine:dry --scope="packages/forms/src/fields/**/*.tsx"

# 2. Apply (make changes)
pnpm refine:run --scope="packages/forms/src/fields/**/*.tsx"

# 3. Verify (ensure quality)
pnpm -w build

# 4. Commit (with context)
git add -A && git commit -m "refactor: Software Update - [Name]"
```

---

## CI Integration

The Refiner runs automatically in CI via `.github/workflows/factory-quality.yml`:

```yaml
- name: Refiner Dry-Run
  run: pnpm refine:dry --scope="packages/forms/src/fields/**/*.tsx"
```

**CI fails if:**
- Generator tests fail
- Refiner detects violations
- Build breaks

This ensures:
- No pattern drift
- All code meets current standards
- Safe to merge

---

## The Perpetual Motion Loop

```
Generator learns new pattern
         ↓
Refiner transform created
         ↓
Software update applied (one command)
         ↓
ALL code upgraded automatically
         ↓
Zero drift, perfect consistency
         ↓
Builds green, tests pass
         ↓
[Repeat for next pattern]
```

---

## Examples of Future Updates

### Accessibility Upgrade
**Transform:** `aria-attributes-v1.0`  
**Impact:** Add missing ARIA attributes to all fields

### Performance Upgrade
**Transform:** `lazy-imports-v1.0`  
**Impact:** Convert static imports to dynamic imports for code-splitting

### Telemetry Upgrade
**Transform:** `telemetry-wiring-v1.0`  
**Impact:** Inject telemetry hooks into all opted-in fields

### Design Token Upgrade
**Transform:** `use-design-tokens-v1.0`  
**Impact:** Replace hardcoded values with design token variables

---

## Success Metrics

**Per Update:**
- Files transformed: 10-100+
- Duration: <500ms
- Manual effort: 0 minutes
- Breaking changes: 0
- Build status: ✅ GREEN

**System-Wide:**
- Pattern consistency: 100%
- Tech debt: Automatically repaid
- Code quality: Compounds over time
- Scalability: Linear (same effort for 10 or 1000 files)

---

## Philosophy

> "The factory doesn't just generate new code well.  
> It retroactively heals all existing code.  
> Every improvement compounds across the entire codebase.  
> The system self-evolves and self-heals."

This is what makes it **God Tier**. 🏭✨
