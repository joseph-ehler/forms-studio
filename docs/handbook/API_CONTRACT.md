# API Contract Enforcement

**Jidoka for APIs** - Stop-the-line when public contracts change.

---

## Philosophy

**Toyota Principle**: Built-in quality (Jidoka)

Just as Toyota stops the production line when defects are detected, we halt PRs when API contracts drift without approval.

**Why this matters**:
- Accidental breaking changes caught before merge
- Consumers have stable, predictable APIs
- Semver discipline enforced automatically
- Principal-level governance

---

## Quick Start

```bash
# Before opening PR
pnpm prepr  # Runs doctor + API check

# If API changed (intentional)
pnpm api:update  # Refresh baseline
git add packages/ds/etc/ds.api.md
pnpm changeset   # Add semver bump
git commit
```

---

## How It Works

### 1. Baseline Reports

**Location**: `packages/ds/etc/ds.api.md`

This file is the **golden baseline** - it contains a snapshot of your public API surface:
- All exported types, interfaces, classes
- Function signatures
- Type parameters
- JSDoc comments

**Think of it as**: Your API's "golden source" (like `flowbite-react-blocks`)

---

### 2. API Check

**Command**: `pnpm api:check`

**What it does**:
1. Builds packages (`pnpm api:build`)
2. Runs API Extractor on `dist/index.d.ts`
3. Compares current API to baseline (`etc/ds.api.md`)
4. Fails if they don't match

**When it runs**:
- Locally via `pnpm prepr`
- In CI on every PR (`.github/workflows/api-contract.yml`)

---

### 3. CI Enforcement

**Workflow**: `api-contract.yml`

**Behavior**:
- ✅ **Passes**: API unchanged or baseline updated
- ❌ **Fails**: API drift detected, baseline not updated
- 💬 **Comments**: Explains how to fix

**This is "stop-the-line"**: PR cannot merge until resolved.

---

## Workflows

### ✅ Making Safe Changes (No API Impact)

```bash
# Edit internal implementation
vim packages/ds/src/fb/Button.tsx

# Run checks
pnpm prepr  # doctor + api:check

# All green → commit
git commit -m "refactor: improve Button performance"
```

**Result**: `pnpm api:check` passes, no baseline changes needed.

---

### ⚠️ Accidental API Change

```bash
# Made a change
vim packages/ds/src/index.ts

# Run checks
pnpm prepr

# ❌ api:check fails!
```

**Fix**:
1. Review the error (shows what changed)
2. Revert the unintended export
3. Run `pnpm api:check` again

**Result**: Green checks, no API drift.

---

### ✅ Intentional API Change (New Feature)

```bash
# Add new export
vim packages/ds/src/index.ts

# Update baseline
pnpm api:build
pnpm api:update

# Review changes
git diff packages/ds/etc/ds.api.md

# Add changeset
pnpm changeset
# Select: minor (new feature) or major (breaking)
# Describe the change

# Commit both
git add packages/ds/etc/ds.api.md .changeset/
git commit -m "feat(ds): add new Breadcrumb component"
```

**Result**: CI passes, changeset enforces semver.

---

### 🔥 Breaking Change (Deprecation)

```bash
# Remove old export
vim packages/ds/src/index.ts

# Update baseline
pnpm api:update

# Add changeset
pnpm changeset
# Select: major
# Describe: "BREAKING: removed deprecated OldComponent"

# Add migration guide
vim docs/handbook/MIGRATIONS.md

# Commit
git add packages/ds/etc/ds.api.md .changeset/ docs/
git commit -m "feat(ds)!: remove deprecated OldComponent"
```

**Result**: Major bump, migration guide provided.

---

## Commands Reference

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `pnpm api:build` | Build all packages | Before API check |
| `pnpm api:check` | Verify API unchanged | Before commit/PR |
| `pnpm api:update` | Refresh baselines | After intentional change |
| `pnpm prepr` | Run all pre-PR checks | Before opening PR |

---

## CI Behavior

### Scenario 1: No API Change ✅
```
✅ lint:prod
✅ typecheck
✅ build
✅ api:check  ← Passes
```
**Action**: PR can merge

---

### Scenario 2: API Changed, Baseline Not Updated ❌
```
✅ lint:prod
✅ typecheck
✅ build
❌ api:check  ← Fails
```
**Bot comment**:
> ⚠️ API Surface Changed  
> Run `pnpm api:update` and commit baseline

**Action**: PR blocked until fixed

---

### Scenario 3: API Changed, Baseline Updated ✅
```
✅ lint:prod
✅ typecheck
✅ build
✅ api:check  ← Passes (baseline matches)
```
**Action**: PR can merge (changeset should be present)

---

## What Gets Tracked

### ✅ Tracked (Public API)
- Exported types, interfaces, classes
- Function signatures
- Type parameters
- Enum values
- Public methods
- Re-exports from `index.ts`

### ❌ Not Tracked (Internal)
- Implementation details
- Private methods
- Internal types (not exported)
- CSS changes
- Documentation changes

---

## Troubleshooting

### "Cannot find module dist/index.d.ts"

**Cause**: Package not built

**Fix**:
```bash
pnpm api:build  # Builds all packages
pnpm api:check  # Try again
```

---

### "Baseline does not exist"

**Cause**: First time running API Extractor

**Fix**:
```bash
pnpm api:build
pnpm api:update  # Creates baseline
git add packages/ds/etc/ds.api.md
git commit -m "chore: add initial API baseline"
```

---

### "Many warnings about TSDoc"

**Cause**: JSDoc comments have formatting issues

**Impact**: Warnings only, doesn't block

**Fix** (optional):
```tsx
// Before (warning)
/** Returns the config for {variant} */

// After (clean)
/** Returns the config for variant */
```

---

### "API changed but I didn't touch exports"

**Possible causes**:
1. Type inferred from implementation changed
2. Re-export added indirectly
3. Dependency updated (changed types)

**Debug**:
```bash
# See what changed
pnpm api:update
git diff packages/ds/etc/ds.api.md
```

---

## Integration with Changesets

**Recommended workflow**:

```bash
# 1. Make API change
vim packages/ds/src/index.ts

# 2. Update baseline
pnpm api:update

# 3. Add changeset
pnpm changeset

# 4. Commit together
git add packages/ds/etc/ds.api.md .changeset/
git commit -m "feat(ds): add new component"
```

**Why together?**:
- API change + semver bump + changelog
- Clear history of intentional changes
- Release notes auto-generated

---

## Principal-Level Impact

### **Staff Level** (Before)
- TypeScript catches type errors
- Manual code review for API changes
- Breaking changes slip through

### **Principal Level** (After)
- **Jidoka**: Stop-the-line on API drift
- **Automatic enforcement**: CI blocks bad PRs
- **Stable contracts**: Consumers trust semver
- **Clear history**: Baselines show evolution

---

## TPS Mapping

| TPS Principle | Implementation |
|---------------|----------------|
| **Jidoka** | CI fails on API drift |
| **Andon Cord** | Any dev can see baseline changes |
| **Standard Work** | `pnpm prepr` before PR |
| **Visual Control** | Baseline diff shows changes |
| **Poka-Yoke** | Can't merge without approval |

---

## Metrics

**Track these** (via metrics dashboard):
- API changes per week
- Breaking vs non-breaking ratio
- Time to detect accidental breaks (should be <5 min)
- % of PRs blocked by API check

**Success looks like**:
- Zero accidental breaking changes reach main
- API changes always have changesets
- Consumers experience predictable upgrades

---

## Examples

### Adding a Component

```typescript
// packages/ds/src/fb/Breadcrumb.tsx
export function Breadcrumb(props: BreadcrumbProps) { ... }

// packages/ds/src/fb/index.ts
export { Breadcrumb, type BreadcrumbProps } from './Breadcrumb';

// packages/ds/src/index.ts
export { Breadcrumb, type BreadcrumbProps } from './fb';
```

**Steps**:
```bash
pnpm api:build
pnpm api:update  # Adds Breadcrumb to baseline
pnpm changeset   # minor bump
git commit
```

---

### Deprecating a Component

```typescript
// packages/ds/src/index.ts
/**
 * @deprecated Use NewComponent instead
 * @see {@link NewComponent}
 */
export { OldComponent } from './fb';
```

**Steps**:
```bash
pnpm api:update  # Marks as deprecated
pnpm changeset   # minor bump (deprecation notice)
# Don't remove yet! Wait 2 versions
git commit
```

**Removal** (2 versions later):
```bash
# Remove export
pnpm api:update
pnpm changeset  # major bump
vim docs/handbook/MIGRATIONS.md  # Add migration guide
git commit
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `packages/ds/api-extractor.json` | API Extractor config |
| `packages/ds/etc/ds.api.md` | Golden baseline (commit this!) |
| `packages/ds/dist/index.api.d.ts` | Rolled-up types (gitignored) |
| `.github/workflows/api-contract.yml` | CI enforcement |

---

## Next: Changesets (Week 2)

After API Extractor is stable, we'll add:
- `pnpm release:canary|minor|patch`
- Auto-generated changelogs
- Weekly release train

**See**: [Factory Operating Manual](./FACTORY_OPERATING_MANUAL.md)

---

## Philosophy

**"Make mistakes impossible"**

- Accidental API changes: Impossible (CI blocks)
- Forgetting changeset: Visible (PR checklist)
- Breaking consumers: Prevented (baseline enforces)

**This is Toyota-grade software engineering**: Built-in quality, visual control, mistake-proofing.

---

## Quick Reference

```bash
# Daily workflow
pnpm prepr  # Before opening PR

# Intentional API change
pnpm api:update && pnpm changeset

# Check what changed
git diff packages/ds/etc/ds.api.md
```

**Remember**: Baseline is your "stop-the-line" signal. Respect it. 🏭
