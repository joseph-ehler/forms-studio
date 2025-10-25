# ADR: Barrel & Import Standardization System

**Date**: 2025-01-24  
**Status**: Accepted  
**Context**: Repository hygiene and scalability initiative

## Context

As the monorepo grows, we face several import-related issues:

1. **Import Inconsistency**: Mix of deep imports (`@intstudio/ds/src/hooks/useFocusTrap`) and barrel imports (`@intstudio/ds`)
2. **Manual Barrel Maintenance**: Hand-editing `index.ts` files is error-prone and tedious
3. **Circular Dependencies**: No systematic detection, leading to runtime errors
4. **API Surface Leakage**: Internal implementation details accidentally exposed
5. **Review Friction**: PRs spend time debating import styles

These issues compound as the codebase scales, making refactoring harder and onboarding slower.

## Decision

Implement a comprehensive barrel & import standardization system with:

### 1. Auto-Generated Barrels (barrelsby)

- Config: `.barrelsby.json`
- Generates `index.ts` in every source folder
- Runs before build and in CI
- Fails build if barrels are stale

### 2. Import Hygiene Rules (ESLint)

- Config: `.eslintrc.import-hygiene.cjs`
- Blocks deep imports across packages
- Blocks relative path spelunking
- Enforces sorted imports
- Detects circular dependencies

### 3. Sealed Public APIs (package.json exports)

- Node's resolver physically blocks deep imports
- Only barrel entry points are accessible
- Strongest enforcement layer (not just lint)

### 4. Cycle Detection (madge)

- Script: `scripts/check-cycles.mjs`
- Runs in CI
- Reports circular dependencies with full paths
- Blocks merges if cycles detected

### 5. Unified Tooling

- `pnpm fix:barrels` - One command to fix everything
- `pnpm barrels:check` - Verify freshness
- `pnpm deps:cycles` - Check for cycles
- CI workflow validates all rules

## Consequences

### Positive

✅ **Zero Manual Toil**: Barrels auto-generate, no hand-editing  
✅ **Hard Guarantees**: Physical enforcement via Node resolver, not just conventions  
✅ **Early Detection**: Cycles and violations caught in CI before merge  
✅ **Consistent Style**: All imports follow same pattern, no debate  
✅ **Refactor Safety**: Moving files doesn't break imports (barrels auto-update)  
✅ **Cleaner API Surface**: Only intentional exports are public  
✅ **Faster Reviews**: No time spent on import style debates

### Negative

⚠️ **Initial Setup**: Requires adding deps and running initial fix  
⚠️ **Learning Curve**: Team needs to understand barrel system  
⚠️ **Build Dependency**: Must run `barrelsby` before build  
⚠️ **Debugging**: Stack traces show barrel paths, not direct files (mitigated by source maps)

### Neutral

🔄 **Migration Required**: Existing deep imports need fixing (one-time cost)  
🔄 **CI Time**: Adds ~30s to CI for barrel/cycle checks  
🔄 **Tooling Dependency**: Relies on `barrelsby`, `madge`, ESLint plugins

## Alternatives Considered

### 1. Manual Barrels + Conventions

**Pros**: No tooling, simple  
**Cons**: Error-prone, not enforced, doesn't scale  
**Verdict**: ❌ Rejected—lacks guarantees

### 2. TypeScript Project References Only

**Pros**: Native TS feature  
**Cons**: Doesn't block deep imports, no cycle detection  
**Verdict**: ❌ Insufficient—solves build, not imports

### 3. Lerna/Nx Import Boundaries

**Pros**: Integrated with monorepo tool  
**Cons**: Heavyweight, doesn't auto-generate barrels  
**Verdict**: ⚠️ Overkill—we don't need full Nx/Lerna

### 4. Custom Codemod

**Pros**: Tailored to our needs  
**Cons**: Maintenance burden, reinventing wheels  
**Verdict**: ❌ Not worth it—existing tools work

## Implementation Plan

### Phase 1: Setup (30 min)

- [x] Create `.barrelsby.json`
- [x] Create `.eslintrc.import-hygiene.cjs`
- [x] Add deps to `package.json`
- [x] Create helper scripts (`fix-barrels.mjs`, `check-cycles.mjs`)
- [x] Update package exports to seal APIs

### Phase 2: CI Integration (15 min)

- [x] Create `.github/workflows/barrel-hygiene.yml`
- [x] Add `prebuild` hook for barrel check
- [x] Document in handbook

### Phase 3: Migration (1-2 hours)

- [ ] Run `pnpm barrels` to generate initial barrels
- [ ] Run `pnpm fix:imports` to fix existing violations
- [ ] Review and test changes
- [ ] Commit and push

### Phase 4: Adoption (Ongoing)

- [ ] Team training on new workflow
- [ ] Update contribution guide
- [ ] Monitor CI failures and refine rules

## Success Metrics

**Quantitative**:
- Deep imports: 0 (measured by ESLint violations)
- Circular dependencies: 0 (measured by madge)
- Barrel staleness: 0 (CI fails if out of date)
- Manual barrel edits: 0 (tracked by git blame on index.ts)

**Qualitative**:
- Faster PR reviews (less time on import debates)
- Easier refactoring (barrels auto-update)
- Clearer API boundaries (sealed exports)
- Better onboarding (consistent patterns)

## Monitoring

**CI Dashboard**:
- Barrel hygiene workflow pass rate
- Average cycle detection time
- Number of violations caught

**Code Quality**:
```bash
# Track violations over time
grep -r "@intstudio/.*/src/" packages/ | wc -l

# Track cycles
pnpm deps:cycles 2>&1 | grep "Found" | awk '{sum += $3} END {print sum}'
```

## Rollback Plan

If the system proves too restrictive:

1. **Selective Loosening**: Add exceptions to ESLint rules
2. **Sub-Entry Points**: Expose specific sub-paths in `package.json` exports
3. **Disable Enforcement**: Remove CI checks (keep tooling for opt-in use)
4. **Full Rollback**: Remove configs, restore manual barrels

However, rollback is unlikely—the system is designed to be **strict but flexible**.

## Related

- **Documentation**: `docs/handbook/barrel-import-system.md` (full guide)
- **Config**: `.barrelsby.json`, `.eslintrc.import-hygiene.cjs`
- **Scripts**: `scripts/fix-barrels.mjs`, `scripts/check-cycles.mjs`
- **CI**: `.github/workflows/barrel-hygiene.yml`
- **ADRs**: Related to repo hygiene initiative

## References

- [barrelsby Documentation](https://github.com/bencoveney/barrelsby)
- [ESLint import plugin](https://github.com/import-js/eslint-plugin-import)
- [madge Documentation](https://github.com/pahen/madge)
- [Node.js Package Exports](https://nodejs.org/api/packages.html#exports)

## Notes

This ADR is part of the broader **Repository Hygiene & Scalability** initiative. See related ADRs:
- Top-level directory enforcement
- Module boundary validation
- Deprecation protocol
- Size budgets

---

**Approved by**: Engineering Team  
**Implemented**: 2025-01-24  
**Review Date**: 2025-04-24 (3 months)
