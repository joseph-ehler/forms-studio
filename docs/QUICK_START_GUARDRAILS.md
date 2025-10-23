# Quick Start - Architecture Guardrails

## ✅ What's Already Working

You already have excellent infrastructure:
- ✅ Nightly Sweeper (Knip/ts-prune/Madge/linkinator)
- ✅ Token snapshot versioning with CI checks
- ✅ Design system contracts (visual/a11y/behavioral)
- ✅ Performance budgets (CSS 25KB, JS 50KB)
- ✅ Import Doctor + barrel generator
- ✅ Changesets for versioning
- ✅ Danger installed
- ✅ Comprehensive ESLint rules

## 🆕 What Was Added

### 1. API Stability System

**Purpose:** Track public API surface, prevent breaking changes without proper versioning.

**Files Added:**
- `packages/ds/api-extractor.json` - Configuration
- `packages/ds/src/type-tests/api.test-d.ts` - Type snapshot tests
- `.github/workflows/api-stability.yml` - CI workflow

**Commands:**
```bash
# Generate API report
pnpm api:extract

# Check for breaking changes
pnpm api:check

# Run type tests
pnpm type:test
```

**What It Does:**
- Generates `.reports/api/ds.api.md` - diffable API surface report
- Fails CI if API changes without `breaking-change` label
- Type tests catch signature drift at compile time
- Prevents deep imports via type-level enforcement

### 2. Token Codegen System

**Purpose:** Auto-generate CSS variables and TypeScript types from token source files.

**Files Added:**
- `scripts/tokens/codegen.mjs` - Generator script
- `scripts/tokens/deprecations.json` - Migration map

**Commands:**
```bash
# Regenerate CSS + types from tokens
pnpm tokens:codegen
```

**What It Does:**
- Reads `packages/ds/src/tokens/*.ts`
- Generates `packages/ds/src/generated/tokens.css`
- Generates `packages/ds/src/generated/tokens.types.ts`
- Creates `contracts/tokens@YYYY-MM-DD.json` snapshot
- Respects deprecation map for backward compat

**Example deprecation:**
```json
{
  "deprecations": {
    "COLOR_TOKENS.old": "COLOR_TOKENS.new"
  }
}
```
Result: `--ds-color-old: var(--ds-color-new);` auto-generated

### 3. Codemod Infrastructure

**Purpose:** Automated code transformations for breaking changes.

**Files Added:**
- `scripts/codemods/README.md` - Documentation
- `scripts/codemods/run-codemod.mjs` - Runner
- `scripts/codemods/deep-imports-to-barrels/transform.mjs` - Example

**Commands:**
```bash
# Run codemod
pnpm codemod deep-imports-to-barrels

# Dry run (preview changes)
pnpm codemod deep-imports-to-barrels --dry

# Specific paths
pnpm codemod deep-imports-to-barrels packages/demo-app/
```

**Integration with Changesets:**
When creating a breaking change:
```md
---
"@intstudio/ds": major
---

Breaking: Renamed `spacing` prop to `gap`

**Migration:** Run `pnpm codemod spacing-to-gap`
```

CI automatically posts this command in PR comments!

### 4. DangerJS Automation

**Purpose:** Inline PR feedback without manual code review toil.

**Files Added:**
- `dangerfile.mjs` - Automated PR reviewer

**What It Does:**

**Import Violations**
```
⚠️ Import hygiene violation in DateField.tsx:25
Current: '@intstudio/ds/src/hooks/useDeviceType'
Expected: '@intstudio/ds/utils'

Fix: pnpm imports:fix
```

**API Changes**
```
⚠️ API surface changed but missing `breaking-change` label

Required:
1. Add `breaking-change` label
2. Create changeset: pnpm changeset
3. Create codemod if needed
```

**Token Changes**
```
🎨 Token files changed

Required:
1. Add `tokens-change` label  
2. Run: pnpm tokens:codegen
3. Update snapshot
```

**Bundle Size**
```
📦 Bundle Sizes

| Asset | Size | Budget | Status |
|-------|------|--------|--------|
| CSS   | 22KB | 25KB   | ✅     |
| JS    | 48KB | 50KB   | ✅     |
```

**Runs automatically in CI** - no setup needed!

### 5. Enhanced ESLint Rules

**Purpose:** Prevent bad patterns at the linter level.

**Files Added:**
- `packages/eslint-plugin-cascade/src/rules/no-deep-ds-imports.js`
- `packages/eslint-plugin-cascade/src/rules/no-raw-spacing-values.js`

**Rules:**

**no-deep-ds-imports** (auto-fixable)
```ts
// ❌ Error
import { Button } from '@intstudio/ds/src/primitives/Button'

// ✅ Auto-fixed to
import { Button } from '@intstudio/ds/primitives'
```

**no-raw-spacing-values**
```tsx
// ❌ Error
<div style={{ margin: '16px' }} />
// Suggestion: Use spacing="4" prop

// ✅ Good
<Stack spacing="4" />
```

**Already in your config** via `plugin:cascade/recommended`!

## 🎯 Day-to-Day Workflows

### Making a Breaking Change

1. **Update code** as usual

2. **Create changeset:**
   ```bash
   pnpm changeset
   # Select "major"
   ```

3. **Create codemod** (if complex migration):
   ```bash
   mkdir scripts/codemods/my-breaking-change
   # Add transform.mjs
   ```

4. **Link in changeset:**
   ```md
   Breaking: Changed behavior
   
   **Migration:** Run `pnpm codemod my-breaking-change`
   ```

5. **Push PR**
   - CI detects API change
   - Requires `breaking-change` label
   - Posts migration command automatically

### Deprecating a Token

1. **Add to deprecations map:**
   ```bash
   # Edit scripts/tokens/deprecations.json
   {
     "old.token": "new.token"
   }
   ```

2. **Regenerate:**
   ```bash
   pnpm tokens:codegen
   ```

3. **Result:**
   - CSS alias created
   - Old code works
   - Codemods can migrate later

### Reviewing a PR

**Before (Manual):**
- Check imports manually
- Review API changes manually
- Check bundle size manually
- Ensure tests exist manually

**After (Automated):**
- Danger comments inline on violations
- API Extractor reports diffs
- Bundle size in PR comment
- Test reminder if missing

**You just review the logic!**

## 📊 Metrics Dashboard

### API Stability Score

Posted on every PR:
```
📊 API Stability: 96/100 (Stable)

| Check | Status |
|-------|--------|
| API Surface | ✅ pass |
| Type Tests | ✅ pass |
| Bundle Size | ✅ pass |
| Import Hygiene | ✅ pass |
```

### Nightly Reports

Automated sweeper PR with:
- Dead code (Knip)
- Unused exports (ts-prune)
- Circular deps (Madge)
- Broken links (linkinator)

## 🚨 What Gets Blocked

### At Build Time

❌ Deep imports to `@intstudio/ds/src/**`
- ESLint error
- Import Doctor fails
- Package exports refuse module resolution

❌ Raw spacing values
- ESLint error with token suggestion

❌ Type signature changes
- tsd tests fail
- Compilation error

### At CI Time

❌ API changes without label
- Danger fails PR
- Requires `breaking-change` label

❌ Token changes without regeneration
- Snapshot out of sync
- CI fails

❌ Bundle over budget
- CSS >25KB or JS >50KB
- Danger reports size

❌ Missing changeset
- For package changes
- Skipped only with `skip-changeset` label

## 🎓 Examples

### Example 1: Fix Import Violation

**Danger comment:**
```
⚠️ Import violation in MyComponent.tsx:12

Current: '@intstudio/ds/src/primitives/Button'
Expected: '@intstudio/ds/primitives'
```

**Fix automatically:**
```bash
pnpm imports:fix
```

Or run ESLint auto-fix:
```bash
pnpm eslint --fix src/
```

### Example 2: Add New Token

**Edit token source:**
```ts
// packages/ds/src/tokens/colors.ts
export const COLOR_TOKENS = {
  brand: {
    newColor: 'rgb(100, 200, 300)',
  }
}
```

**Regenerate:**
```bash
pnpm tokens:codegen
```

**Result:**
- `--ds-brand-new-color` CSS variable created
- Type `COLOR_TOKENS.brand.newColor` available
- Snapshot updated in `contracts/`

### Example 3: Run Codemod

**Scenario:** Renamed prop from `spacing` to `gap`

**Before:**
```tsx
<Stack spacing="normal">
```

**Run codemod:**
```bash
pnpm codemod spacing-to-gap
```

**After:**
```tsx
<Stack gap="normal">
```

## 🔧 Troubleshooting

### "API Extractor failed"

**Cause:** TypeScript compilation error or missing types

**Fix:**
```bash
cd packages/ds
pnpm build
pnpm api:extract
```

### "Type tests failed"

**Cause:** Public API signature changed

**Options:**
1. Fix the regression
2. Update test if change is intentional
3. Add `@ts-expect-error` with comment

### "Danger not posting comments"

**Cause:** Missing GitHub token or permissions

**Fix:**
- Ensure `GITHUB_TOKEN` in workflow
- Check Danger has write access

### "Codemod not working"

**Cause:** Transform doesn't handle edge case

**Debug:**
```bash
# Dry run to see what would change
pnpm codemod <id> --dry

# Add console.log to transform.mjs
# Check jscodeshift docs
```

## 📚 Learning Resources

**API Extractor:**
- Docs: https://api-extractor.com/
- Your config: `packages/ds/api-extractor.json`

**tsd (Type Tests):**
- Docs: https://github.com/SamVerschueren/tsd
- Your tests: `packages/ds/src/type-tests/`

**jscodeshift (Codemods):**
- Docs: https://github.com/facebook/jscodeshift
- Examples: `scripts/codemods/*/transform.mjs`

**Danger:**
- Docs: https://danger.systems/js/
- Your rules: `dangerfile.mjs`

## 🎯 Next Steps

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Generate initial reports:**
   ```bash
   pnpm tokens:codegen
   pnpm api:extract
   ```

3. **Make a test PR** to see automation in action

4. **Customize** Danger rules in `dangerfile.mjs` for your needs

---

Everything runs automatically in CI. Just push and the guardrails enforce architectural boundaries!
