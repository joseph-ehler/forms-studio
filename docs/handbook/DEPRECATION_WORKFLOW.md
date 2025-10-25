# Deprecation Workflow

## Philosophy

**"Iterate fast, converge safely"**

As we improve implementations (Flowbite wrapper → token-only), we need a systematic way to phase out old code without breaking consumers.

---

## The Deprecation Lifecycle

```
v0.4.0: Deprecate (announce + warn)
   ↓
v0.5.0: Still available (warnings continue)
   ↓
v0.6.0: REMOVE (deleted from codebase)
```

**Timeline:** 2 minor versions or 3 months (whichever is longer)

---

## Step-by-Step Process

### 1. Mark as Deprecated

**For components:**
```tsx
// Button.old.tsx (keep temporarily)
import { deprecated } from '../utils/deprecate';
import { Button as FlowbiteButton } from 'flowbite-react';

const ButtonOld = (props) => <FlowbiteButton {...props} />;

export const Button = deprecated(
  ButtonOld,
  'Button (Flowbite wrapper)',
  'Use the new token-only Button instead. API is identical.',
  '0.6.0',  // Remove in
  '0.4.0',  // Since
);
```

**For functions/hooks:**
```tsx
/**
 * @deprecated Since v0.4.0 - Use `useNewHook` instead
 * Will be removed in v0.6.0
 */
export function useOldHook() {
  if (process.env.NODE_ENV === 'development') {
    console.warn('[DS] useOldHook is deprecated...');
  }
  // ...existing implementation
}
```

---

### 2. Add to Deprecations Registry

**Edit:** `packages/ds/deprecations.json`

```json
{
  "deprecations": [
    {
      "component": "ComponentName",
      "path": "src/path/to/Component.old.tsx",
      "reason": "Why it's being replaced",
      "since": "0.4.0",
      "removeIn": "0.6.0",
      "migration": {
        "from": "Old usage pattern",
        "to": "New usage pattern",
        "breaking": false,
        "notes": ["Key changes", "Migration tips"]
      }
    }
  ]
}
```

---

### 3. Update Exports (Compatibility Layer)

**Keep old path working during transition:**

```tsx
// src/fb/index.ts (barrel)
export { Button } from './Button';           // New implementation
export { Button as ButtonOld } from './Button.old';  // Deprecated (explicit import)

// Consumers can:
import { Button } from '@intstudio/ds/fb';      // Gets new automatically ✅
import { ButtonOld } from '@intstudio/ds/fb';   // Explicit old (with warning) ⚠️
```

---

### 4. Announce in Changelog

**In `CHANGELOG.md`:**

```markdown
## [0.4.0] - 2025-10-24

### Deprecated ⚠️

- **Button (Flowbite wrapper)**: Replaced with token-only implementation
  - Migration: No code changes needed! API is identical.
  - Visual improvements: Smoother transitions, token-based styling
  - Old implementation will be removed in v0.6.0 (3 months)
  - See: docs/migrations/button-v0.4.0.md

### Added ✨

- **Button (token-only)**: Production-grade implementation
  - RGB triplets for alpha channels
  - State tokens (hover/active/focus)
  - Reduced motion support
  - High contrast mode ready
```

---

### 5. Create Migration Guide (if needed)

**For breaking changes only:**

`docs/migrations/component-name-v0.4.0.md`

```markdown
# Button Migration (v0.4.0)

## Summary
Flowbite Button wrapper replaced with token-only implementation.

## Breaking Changes
None! API is identical.

## Visual Changes
- Smoother transitions (150ms cubic-bezier)
- Focus rings use primary color (not cyan)
- Hover states more polished

## Action Required
**None.** Rebuild and you're done.

## Before/After
\`\`\`tsx
// No code changes!
<Button variant="primary">Save</Button>
\`\`\`

## Rollback (if issues)
\`\`\`tsx
// Explicitly use old (temporary)
import { ButtonOld as Button } from '@intstudio/ds/fb';
\`\`\`
```

---

### 6. Add ESLint Rule (Optional)

**For high-risk deprecations:**

```js
// tools/eslint-plugin-cascade/rules/no-deprecated-button.js
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Warn about deprecated Button usage',
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const specifier = node.specifiers.find(
          s => s.imported?.name === 'ButtonOld'
        );
        
        if (specifier) {
          context.report({
            node: specifier,
            message: 'ButtonOld is deprecated and will be removed in v0.6.0. Use Button instead.',
          });
        }
      },
    };
  },
};
```

**Enable in `.eslintrc.js`:**
```js
rules: {
  'cascade/no-deprecated-button': 'warn',
}
```

---

### 7. Monitor Usage

**Track in analytics (if available):**

```tsx
export const Button = deprecated(
  ButtonOld,
  'Button',
  '...',
  '0.6.0',
  '0.4.0',
);

// In deprecation utility, optionally log telemetry:
if (typeof window !== 'undefined' && window.analytics) {
  window.analytics.track('deprecation_warning', {
    component: 'Button',
    version: '0.4.0',
  });
}
```

---

### 8. Remove After Timeline

**In v0.6.0 (or after 3 months):**

1. **Delete old files:**
   ```bash
   rm packages/ds/src/fb/Button.old.tsx
   rm packages/ds/src/fb/Button.stories.old.tsx
   ```

2. **Update barrel exports:**
   ```tsx
   // Remove old export
   // export { Button as ButtonOld } from './Button.old';  ❌
   ```

3. **Remove from deprecations.json:**
   ```json
   {
     "removed": [
       {
         "component": "Button (Flowbite wrapper)",
         "removedIn": "0.6.0",
         "replacement": "Button (token-only)"
       }
     ]
   }
   ```

4. **Update CHANGELOG:**
   ```markdown
   ## [0.6.0] - 2025-01-24

   ### Removed 🗑️
   - **ButtonOld**: Removed as planned. Use Button instead.
   ```

---

## Quick Reference

### Deprecation Timeline

| Version | Action | Old Code | New Code |
|---------|--------|----------|----------|
| v0.4.0 | **Deprecate** | Available (warns) | Available (preferred) |
| v0.5.0 | **Maintain** | Available (warns) | Stable |
| v0.6.0 | **Remove** | Deleted ❌ | Only option ✅ |

### When to Deprecate

**Always deprecate for:**
- ✅ Major API changes
- ✅ Better implementation (like Flowbite → token-only)
- ✅ Security fixes that change API
- ✅ Performance improvements requiring breaking changes

**Skip deprecation for:**
- ❌ Internal refactors (no API change)
- ❌ Bug fixes (no API change)
- ❌ New features (additive only)

---

## Checklist Template

Copy this for each deprecation:

```markdown
## Deprecation: [Component Name] (v[X.Y.Z])

- [ ] Mark component with `deprecated()` wrapper
- [ ] Add entry to `deprecations.json`
- [ ] Update CHANGELOG.md
- [ ] Create migration guide (if breaking)
- [ ] Add ESLint rule (if high-risk)
- [ ] Announce in team chat/docs
- [ ] Set calendar reminder for removal date
- [ ] Monitor usage (analytics/logs)

**Remove in:** v[X.Y+2.Z] or [date + 3 months]
```

---

## Success Metrics

**Good deprecation:**
- ✅ Zero surprise removals
- ✅ Clear migration path
- ✅ 90%+ adoption before removal
- ✅ No rollbacks needed

**Failure signals:**
- ❌ Consumers caught off-guard
- ❌ Unclear migration steps
- ❌ Rushed removal (< 2 versions)
- ❌ Breakage in production

---

## Examples in the Wild

### 1. Button (Flowbite → Token-only)

**Status:** Deprecated in v0.4.0, remove in v0.6.0  
**Impact:** Low (API identical)  
**Migration:** Zero code changes, just rebuild  

### 2. Future: Input (Flowbite → Token-only)

**Will follow same pattern:**
- Keep API identical
- Visual improvements only
- 2-version deprecation window

---

## Questions?

See:
- `packages/ds/deprecations.json` - Current deprecations
- `packages/ds/src/utils/deprecate.ts` - Deprecation utility
- `CHANGELOG.md` - Historical deprecations
