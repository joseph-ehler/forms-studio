# ESLint Rules - Anti-Pattern Prevention

**Plugin:** `eslint-plugin-cascade`  
**Status:** ✅ Enforced in DS + Forms packages

---

## Purpose

ESLint rules make it **impossible** to ship anti-patterns. They catch regressions at author-time before they reach CI.

---

## Migration Guardrail Rules

### 1. `no-self-package-imports`

**Prevents:** Packages importing from their own published name

**Example violation:**
```tsx
// ❌ In packages/forms/src/fields/TextField.tsx
import { SomeUtil } from '@intstudio/forms/utils'; // WRONG

// ✅ Correct
import { SomeUtil } from '../utils'; // Use relative imports
```

**Why it matters:**
- Self-imports break during development (package not published yet)
- Causes circular dependency issues
- Makes refactoring harder

**Auto-fix:** None (manual fix required)

---

### 2. `stack-prop-guard`

**Prevents:** Forbidden props on `Stack` component

**Example violation:**
```tsx
// ❌ Using layout props on Stack
<Stack gap="4" justify="center" align="center">
  <Card>Item</Card>
</Stack>

// ✅ Correct - Use Stack's spacing prop
<Stack spacing="normal">
  <Card>Item</Card>
</Stack>
```

**Forbidden props:**
- `gap` - Use `spacing` instead
- `justify` - Stack handles layout
- `align` - Stack handles layout
- `flexDirection` - Use `direction` prop
- `flexWrap` - Use `wrap` boolean prop

**Why it matters:**
- Prevents bypassing design tokens
- Ensures consistent spacing system
- Makes refactoring Stack internals safe

**Auto-fix:** None (manual fix required)

---

### 3. `no-compat`

**Prevents:** Importing deprecated/removed compat shims

**Example violation:**
```tsx
// ❌ Importing from removed compat modules
import { DSShims } from '@intstudio/ds/compat';
import { TextField } from '@intstudio/ds/fields'; // After migration

// ✅ Correct
import { TextField } from '@intstudio/forms/fields';
```

**Banned patterns (configurable):**
- `DSShims` - Removed in v2.0
- `compat` - Temporary migration shims
- `lib/focus` - Legacy focus utilities
- `@intstudio/ds/fields` - Migrated to Forms package

**Why it matters:**
- Prevents compat shims from creeping back
- Forces use of new APIs after migration
- Makes deprecation/removal dates enforceable

**Auto-fix:** Partial (can suggest replacement)

---

## Design System Rules

These enforce token usage and prevent drift:

### Token Enforcement

- `no-hardcoded-colors` - Use `COLOR_TOKENS.*`
- `no-hardcoded-radius` - Use `RADIUS_TOKENS.*`
- `no-hardcoded-spacing` - Use `SPACING_TOKENS.*`
- `no-hardcoded-shadows` - Use `SHADOW_TOKENS.*`
- `no-hardcoded-transitions` - Use `TRANSITION_TOKENS.*`

### API Enforcement

- `use-ds-classes` - Require `ds-input`/`ds-button` classes
- `no-inline-styles` - Discourage inline styles (warning)

### A11y Enforcement

- `touch-target-size` - Minimum 44px touch targets
- `require-labels` - All inputs must have labels

---

## Configuration

### DS Package (`.eslintrc.js`)

```javascript
module.exports = {
  root: true,
  extends: ['plugin:cascade/recommended'],
  plugins: ['cascade'],
  rules: {
    'cascade/no-self-package-imports': 'error',
    'cascade/stack-prop-guard': 'error',
    'cascade/no-compat': ['error', {
      banned: ['DSShims', 'compat', 'lib/focus']
    }],
  },
  overrides: [
    {
      // Allow in tests
      files: ['**/*.test-d.ts', '**/__tests__/**'],
      rules: {
        'cascade/no-self-package-imports': 'off',
      },
    },
  ],
};
```

### Forms Package (`.eslintrc.js`)

```javascript
module.exports = {
  root: true,
  extends: ['plugin:cascade/recommended'],
  plugins: ['cascade'],
  rules: {
    'cascade/no-self-package-imports': 'error',
    'cascade/stack-prop-guard': 'error',
    'cascade/no-compat': ['error', {
      banned: ['DSShims', 'compat', 'lib/focus', '@intstudio/ds/fields']
    }],
    
    // Less strict on inline styles (Storybook)
    'cascade/no-inline-styles': 'off',
  },
  overrides: [
    {
      files: ['**/*.test-d.ts', '**/__tests__/**'],
      rules: {
        'cascade/no-self-package-imports': 'off',
      },
    },
    {
      files: ['**/*.stories.tsx'],
      rules: {
        'cascade/no-inline-styles': 'off',
      },
    },
  ],
};
```

---

## Running ESLint

### Manual

```bash
# Lint DS package
pnpm -F @intstudio/ds lint

# Lint Forms package
pnpm -F @intstudio/forms lint

# Lint all packages
pnpm lint
```

### Automatic

**Pre-commit:** Runs on staged files (via husky)  
**CI:** Runs on all files in PR  
**IDE:** Real-time linting in VS Code/Windsurf

---

## Adding New Rules

### 1. Create Rule File

```javascript
// packages/eslint-plugin-cascade/src/rules/my-rule.js
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent something bad',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      myRule: '❌ Do not do X.\nWHY: Explanation.\nFIX: Use Y instead',
    },
    fixable: 'code', // Optional: if auto-fixable
  },
  create(context) {
    return {
      // AST node visitors
      ImportDeclaration(node) {
        // Check imports
        if (/* condition */) {
          context.report({
            node,
            messageId: 'myRule',
            fix(fixer) {
              // Optional: auto-fix
              return fixer.replaceText(node, 'fixed code');
            },
          });
        }
      },
    };
  },
};
```

### 2. Export in Plugin

```javascript
// packages/eslint-plugin-cascade/src/index.ts
const myRule = require('./rules/my-rule');

const plugin = {
  rules: {
    'my-rule': myRule,
  },
  configs: {
    recommended: {
      rules: {
        'cascade/my-rule': 'error',
      },
    },
  },
};
```

### 3. Build Plugin

```bash
pnpm -F eslint-plugin-cascade build
```

### 4. Enable in Packages

Add to `.eslintrc.js` in DS/Forms packages.

---

## Testing Rules

### Manual Testing

1. Create violating code
2. Run `pnpm lint`
3. Verify error shows
4. Fix code
5. Verify error gone

### Automated Testing

```typescript
// packages/eslint-plugin-cascade/src/rules/__tests__/my-rule.test.ts
import { RuleTester } from 'eslint';
import myRule from '../my-rule';

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
});

ruleTester.run('my-rule', myRule, {
  valid: [
    { code: 'const x = 1;' },
  ],
  invalid: [
    {
      code: 'const x = BAD;',
      errors: [{ messageId: 'myRule' }],
    },
  ],
});
```

---

## Rule Severity Levels

- **error** - Blocks commit/CI, must fix
- **warn** - Shows warning, doesn't block
- **off** - Disabled

**Guidelines:**
- Migration guardrails: `error` (critical)
- Token enforcement: `error` (prevents drift)
- Style preferences: `warn` (nice-to-have)

---

## Overrides

Use `overrides` for special cases:

```javascript
overrides: [
  {
    // Tests can self-import
    files: ['**/__tests__/**'],
    rules: {
      'cascade/no-self-package-imports': 'off',
    },
  },
  {
    // Storybook can use inline styles
    files: ['**/*.stories.tsx'],
    rules: {
      'cascade/no-inline-styles': 'off',
    },
  },
],
```

---

## Benefits

### Author-Time
- ✅ IDE shows errors immediately
- ✅ Fix before commit
- ✅ Learn correct patterns

### Pre-Commit
- ✅ Blocks bad code from entering repo
- ✅ Consistent enforcement

### CI
- ✅ Catches any missed issues
- ✅ Blocks PRs with violations

### Long-term
- ✅ Prevents regressions
- ✅ Enforces migration completion
- ✅ Makes deprecation dates real

---

## Troubleshooting

### "Rule not found"

**Cause:** ESLint plugin not installed  
**Fix:** `pnpm install` in package

### "Rule disabled in this file"

**Cause:** Overrides section matches file  
**Fix:** Check `.eslintrc.js` overrides

### "False positive"

**Cause:** Rule too strict  
**Fix:** Add exception or adjust rule config

### "Can't auto-fix"

**Cause:** Rule doesn't support auto-fix  
**Fix:** Manual fix required

---

## Maintenance

### When Migrating Fields

Add to `no-compat` banned list:

```javascript
'cascade/no-compat': ['error', {
  banned: [
    'DSShims',
    'compat',
    'lib/focus',
    '@intstudio/ds/fields', // ← Add migrated path
  ]
}],
```

### When Deprecating APIs

Add to `no-compat` banned list with comment:

```javascript
'cascade/no-compat': ['error', {
  banned: [
    'old-api', // Deprecated in v2.0, remove in v3.0
  ]
}],
```

### When Removing Compat

After 1-2 releases, remove from codebase:

```bash
# Remove compat code
rm packages/ds/src/compat

# Keep ESLint rule to prevent resurrection
# (rule stays in eslintrc forever)
```

---

## Philosophy

> **"Make the wrong thing impossible."**

ESLint rules are **guardrails**, not suggestions. They enforce decisions already made, preventing drift and regressions.

**Guidelines:**
- Add rule when same issue appears 2x
- Make rule an `error` (not `warn`)
- Include clear "WHY" and "FIX" in message
- Test rule on real violations
- Document in this file

**The goal:** Ship perfect code by default, not by discipline.

---

**Last Updated:** Oct 23, 2025  
**Status:** ✅ 3 migration guardrails active  
**Next:** Add rules as patterns emerge
