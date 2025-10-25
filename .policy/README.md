# Policy Directory

> **Centralized configuration for repository hygiene and architectural constraints**

This directory contains declarative policy files that define what is allowed and forbidden in the codebase. These policies are enforced by automated tools in CI and pre-commit hooks.

## Policy Files

### `roots-allowlist.json`

Defines the permitted top-level directories in the monorepo.

**Enforced by**: `scripts/validate-roots.mjs`  
**When**: Pre-commit, CI  
**Purpose**: Prevent repository sprawl

### `module-boundaries.json`

Defines architectural boundaries between packages and layers.

**Enforced by**: `dependency-cruiser` (via `.dependency-cruiser.js`)  
**When**: CI  
**Purpose**: Maintain clean architecture, prevent circular dependencies

### Barrel & Import Policies

**Defined in**:
- `.barrelsby.json` (auto-generation rules)
- `.eslintrc.import-hygiene.cjs` (import rules)
- `package.json` exports (sealed APIs)

**Enforced by**: barrelsby, ESLint, Node.js resolver  
**When**: Pre-build, CI, runtime  
**Purpose**: Standardize imports, prevent deep imports, detect cycles

## Philosophy

### Declarative > Imperative

Policies are **declared** in JSON/config files, not **implemented** in scripts. This makes them:
- Easy to audit
- Version-controlled
- Reviewable in PRs
- Reusable across tools

### Strict by Default, Exceptions by Approval

All policies are **deny-by-default**:
- New root directory? → Must be added to allowlist
- Deep import? → Blocked by ESLint and Node resolver
- Circular dependency? → Blocked in CI

Exceptions require:
1. Explicit addition to policy file
2. PR review and approval
3. Documentation of rationale

### Fail Fast, Fix Easy

Violations are caught:
1. **Pre-commit**: Before code is committed
2. **CI**: Before code is merged
3. **Runtime**: If all else fails (sealed exports)

Fixes are automated when possible:
- `pnpm fix:barrels` - Fix import violations
- `pnpm barrels` - Regenerate barrels
- `pnpm validate:naming --fix` - Fix naming violations

## Policy Lifecycle

### Adding a New Policy

1. **Define**: Create policy file (e.g., `new-policy.json`)
2. **Enforce**: Write validator script (e.g., `scripts/validate-new-policy.mjs`)
3. **Integrate**: Add to pre-commit hook and CI workflow
4. **Document**: Add to this README and handbook
5. **Communicate**: Team training and migration guide

### Updating a Policy

1. **Propose**: Open PR with policy file change
2. **Justify**: Explain why in PR description
3. **Review**: Team approval required
4. **Migrate**: Update affected code (may need codemod)
5. **Merge**: Policy change and code changes together

### Removing a Policy

Rare, but if needed:
1. Document why policy no longer needed
2. Remove from CI and pre-commit
3. Archive policy file (don't delete—history)
4. Update documentation

## Current Policies Summary

| Policy | File | Enforcer | Stage |
|--------|------|----------|-------|
| Top-level directories | `roots-allowlist.json` | `validate-roots.mjs` | Pre-commit, CI |
| Module boundaries | `module-boundaries.json` | `dependency-cruiser` | CI |
| Barrel imports | `.barrelsby.json` | `barrelsby` | Pre-build, CI |
| Import hygiene | `.eslintrc.import-hygiene.cjs` | ESLint | Pre-commit, CI |
| Sealed APIs | `package.json` exports | Node resolver | Runtime |
| File naming | `.naming-exceptions.json` | `validate-naming.mjs` | Pre-commit, CI |
| Doc placement | (in validator) | `validate-docs.mjs` | Pre-commit, CI |

## Enforcement Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Developer                         │
└─────────────────┬───────────────────────────────────┘
                  │ git commit
                  ▼
         ┌────────────────────┐
         │   Pre-commit Hook  │
         │  (validate-*.mjs)  │
         └────────┬───────────┘
                  │ ✅ Pass
                  ▼
         ┌────────────────────┐
         │    CI Workflow     │
         │ (barrel-hygiene,   │
         │  naming, roots)    │
         └────────┬───────────┘
                  │ ✅ Pass
                  ▼
         ┌────────────────────┐
         │  Runtime (Node)    │
         │ (sealed exports)   │
         └────────────────────┘
```

**Defense in depth**: Multiple enforcement layers ensure violations are caught early.

## Tools & Commands

### Validation Commands

```bash
# Check all policies
pnpm validate:all

# Individual validators
pnpm validate:docs          # Documentation placement
pnpm validate:naming        # File/folder naming
node scripts/validate-roots.mjs  # Top-level directories
pnpm barrels:check          # Barrel freshness
pnpm deps:cycles            # Circular dependencies
```

### Fix Commands

```bash
# Auto-fix everything
pnpm fix:barrels            # Barrels + imports + cycles

# Individual fixes
pnpm barrels                # Regenerate barrels
pnpm fix:imports            # Fix import paths and sorting
pnpm validate:naming --fix  # Fix naming violations
```

### CI Workflows

```bash
# Located in .github/workflows/
barrel-hygiene.yml          # Barrel & import checks
repo-hygiene.yml            # Roots, naming, docs
```

## Exception Handling

### Naming Exceptions

**File**: `scripts/validators/.naming-exceptions.json`

```json
{
  "files": ["README.md", "LICENSE.md"],
  "dirs": [".github", "__tests__"],
  "patterns": ["SESSION_", "ADR_"]
}
```

### Import Allow List

**File**: `.eslintrc.import-hygiene.cjs`

```javascript
{
  allow: [
    '**/*.css',              // Always allow CSS
    '@intstudio/ds/hooks',   // Specific sub-entry
  ]
}
```

### Module Boundary Exceptions

**File**: `.dependency-cruiser.js` (or `module-boundaries.json`)

Use sparingly—architectural violations should be fixed, not excepted.

## Best Practices

### 1. Policy Changes Are Code Changes

Treat policy updates with same rigor as code:
- PR required
- Tests updated
- Migration plan
- Team review

### 2. Document Exceptions

Every exception needs:
```json
{
  "exception": "@intstudio/ds/hooks",
  "reason": "Performance-critical, needs direct access",
  "addedBy": "jane-doe",
  "addedDate": "2025-01-24",
  "reviewDate": "2025-04-24"
}
```

### 3. Time-Bound Exceptions

Exceptions should expire:
```json
{
  "exception": "legacy-package",
  "reason": "Migration in progress",
  "expiresDate": "2025-03-01",
  "removalPlan": "See MIGRATION_PLAN.md"
}
```

### 4. Automate Enforcement

If a policy can't be automated, it will be violated. Every policy must have:
- Automated check
- Clear error message
- Auto-fix (if possible)

### 5. Make Violations Loud

Bad violations should be impossible to ignore:
- ❌ Block commit (pre-commit)
- ❌ Block merge (CI)
- ❌ Block import (sealed exports)

## Migration Strategy

When introducing a new policy:

### Phase 1: Audit (Baseline)

```bash
# Run validator in report-only mode
node scripts/validate-new-policy.mjs --report

# Document current violations
echo "Found: X violations in Y files" > violations-baseline.txt
```

### Phase 2: Fix (Migration)

```bash
# Auto-fix if possible
pnpm fix:new-policy

# Or manual fixes with codemod
node scripts/codemods/migrate-to-new-policy.mjs

# Verify
node scripts/validate-new-policy.mjs
```

### Phase 3: Enforce (Lock)

```bash
# Add to pre-commit hook
# Add to CI workflow
# Update documentation
# Communicate to team
```

### Phase 4: Monitor (Maintain)

```bash
# Track violations over time
# Refine rules based on feedback
# Update exceptions as needed
```

## Rationale

### Why Centralize Policies?

**Before**: Rules scattered in scripts, docs, tribal knowledge  
**After**: Single source of truth, version-controlled, auditable

### Why Strict Enforcement?

**Prevents**: Tech debt accumulation, inconsistency, regressions  
**Enables**: Safe refactoring, clear boundaries, faster reviews

### Why Declarative?

**Benefits**:
- Tools can consume policies
- Easy to diff in PRs
- Machine and human readable
- Can generate docs from policies

## Related Documentation

- **Handbook**: `docs/handbook/barrel-import-system.md`
- **Handbook**: `docs/handbook/barrel-quick-reference.md`
- **ADR**: `docs/adr/2025-01-24-barrel-import-standardization.md`
- **Scripts**: `scripts/validate-*.mjs`, `scripts/fix-*.mjs`

## Questions?

1. **"Is this too strict?"** → Start strict, loosen selectively. Opposite is much harder.
2. **"What if I need an exception?"** → Add to allowlist with justification and review date.
3. **"How do I know what's enforced?"** → Check this README and run `pnpm validate:all`.
4. **"Can I disable a check locally?"** → Yes (`--no-verify`), but don't push violations.

## Roadmap

Future policies under consideration:

- [ ] **Bundle size budgets**: `size-budgets.json`
- [ ] **Experimental TTLs**: `experimental-code.json`
- [ ] **Deprecation tracking**: `deprecations.json`
- [ ] **API surface contracts**: `public-api.json`
- [ ] **Performance budgets**: `performance.json`

---

**This directory is the source of truth for what's allowed in this codebase.**

If in doubt, check here first.
