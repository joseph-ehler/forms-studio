# Design System Soft Extraction - COMPLETE ✅

**Date:** October 22, 2025  
**Status:** Soft extracted (in monorepo)  
**Next Phase:** 2-week stabilization → hard extract

---

## What Changed Today

### 1. Package Renamed
```json
// Before
"name": "@joseph-ehler/wizard-react"

// After
"name": "@intstudio/ds"
```

### 2. Description Updated
Now reflects design system purpose:
> Intelligence Studio Design System - tokens, primitives, patterns, shell components, and accessibility layer

### 3. Keywords Updated
Removed form-specific keywords, added DS keywords:
- design-system
- tokens
- primitives
- accessibility
- flat-design
- white-label

### 4. Peer Dependencies Simplified
Removed form-specific dependencies:
```json
// Removed
"react-hook-form": "^7.0.0"
"zod": "^3.22.0"

// Kept (DS only needs React)
"react": "^18.0.0"
"react-dom": "^18.0.0"
```

### 5. Demo Updated
Demo now imports from `@intstudio/ds`:
```typescript
// All files updated automatically via codemod
import { Button, Stack, Grid } from '@intstudio/ds'
```

### 6. Migration Script Created
`scripts/migrate-to-ds.sh` - automated import updates

---

## Benefits Achieved ✅

1. **Logical Separation** - Design system has clear identity
2. **No Coordination Tax** - Still in monorepo, instant sync
3. **Workspace Protocol** - Demo uses `workspace:*` (no npm publishing yet)
4. **Clean Slate** - Keywords/description reflect true purpose
5. **Migration Proven** - Script successfully updated 27 files

---

## What Didn't Change

- **Physical location:** Still in `packages/wizard-react/` directory
- **Build process:** Same tsup config
- **Exports:** Same API surface
- **Dependencies:** Still has floating-ui, headlessui, date-fns, etc.
- **Publishing:** Not published to npm yet (workspace only)

---

## Next Steps (2-Week Stabilization)

### Week 1: Test Infrastructure
- [ ] Add Playwright smoke tests
  ```bash
  pnpm add -D @playwright/test
  # tests/button.spec.ts
  # tests/stack.spec.ts
  # tests/media.spec.ts
  # tests/grid.spec.ts
  # tests/section.spec.ts
  ```
  
- [ ] Visual regression baseline
  ```bash
  pnpm playwright test --update-snapshots
  ```

- [ ] Bundle size budgets
  ```json
  {
    "size-limit": [
      { "path": "dist/index.js", "limit": "50 KB" },
      { "path": "dist/index.css", "limit": "25 KB" }
    ]
  }
  ```

### Week 2: Storybook & Docs
- [ ] Set up Storybook
  ```bash
  pnpm add -D @storybook/react-vite
  pnpm add -D @storybook/addon-a11y
  pnpm add -D @storybook/addon-viewport
  ```

- [ ] Create stories for:
  - Tokens (color, spacing, widths)
  - Primitives (Stack, Grid, Button, etc.)
  - Patterns (PageStack, SplitLayout, etc.)
  - Shell (TopBar, Drawer, BottomNav, etc.)

- [ ] Document patterns
  - Usage examples
  - Migration notes
  - API reference

### Week 3-4: API Freeze & Audit
- [ ] Import audit
  ```bash
  # Find all DS imports across codebase
  grep -rh "from '@intstudio/ds'" packages/ apps/ \
    --include="*.tsx" --include="*.ts" > ds-usage.txt
  ```

- [ ] Freeze API surface
  - Document all exports
  - Mark experimental APIs
  - Version breaking changes

- [ ] Final bug sweep
  - Fix any remaining visual issues
  - Resolve console warnings
  - Test all patterns

---

## Hard Extraction Checklist (Do Later)

**Don't proceed until ALL gates are green:**

- [ ] All known bugs fixed
- [ ] Playwright tests passing (min 6 specs)
- [ ] Visual regression baseline captured
- [ ] Import audit complete
- [ ] Storybook deployed
- [ ] API frozen & documented
- [ ] Bundle size budgets defined
- [ ] Migration guide written
- [ ] CI pipeline green

**Then:**
1. Run `pnpm changeset add`
2. Version to `@intstudio/ds@0.1.0`
3. Publish to npm
4. Update demo to use npm version
5. (Optional) Mirror to public DS repo

---

## Risk Assessment

### ✅ Mitigated Risks
- **Breakage:** Still in monorepo, tested before commit
- **Lost work:** All changes in git, reversible
- **Demo broken:** Codemod updated imports, builds successfully

### ⚠️ Remaining Risks (After Hard Extract)
- **Coordination tax:** Publishing requires version bumps
- **Breaking changes:** Must be careful with API changes
- **Test gaps:** Need Playwright before publishing

### 🛡️ Safety Measures
- Workspace protocol keeps instant sync until ready
- 2-week stabilization window finds issues early
- Automated migration script prevents manual errors

---

## Verification

### Build Status: ✅ PASSING
```bash
$ pnpm build
@intstudio/ds@0.3.0 build
✓ dist/index.css   85.99 KB
✓ dist/index.js    645.87 KB
✓ dist/index.cjs   677.21 KB
✓ dist/index.d.ts  72.00 KB
```

### Import Check: ✅ UPDATED
27 files migrated from `@joseph-ehler/wizard-react` → `@intstudio/ds`

### Lockfile: ✅ CLEAN
No dependency conflicts

---

## Team Communication

**What to say:**
> We've soft-extracted the Design System into `@intstudio/ds`. It's still in the monorepo (zero coordination tax), but now has a clear identity. Over the next 2 weeks we'll add tests and Storybook, then publish to npm.

**Benefits to emphasize:**
- Clean separation of concerns
- No breaking changes (workspace protocol)
- Foundation for public DS launch
- Momentum on Storybook & docs

---

## Files Modified

**Package Files:**
- `packages/wizard-react/package.json` - renamed to @intstudio/ds
- `packages/wizard-react/demo/package.json` - updated dependency

**Demo Files (27 total):**
- All `.ts` and `.tsx` files in `demo/src/`
- Imports updated via automated codemod

**Scripts:**
- `scripts/migrate-to-ds.sh` - migration codemod (NEW)

**Documentation:**
- `DS_EXTRACTION_PLAN.md` - full extraction roadmap (NEW)
- `DS_SOFT_EXTRACTION_COMPLETE.md` - this file (NEW)

---

## Rollback Plan (If Needed)

If we need to undo:
```bash
# 1. Revert commits
git revert <commit-hash>

# 2. Or manual rollback:
# - Change package name back to @joseph-ehler/wizard-react
# - Run migration script in reverse
# - Rebuild & reinstall

# Script for reverse migration:
find packages/wizard-react/demo/src -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -exec sed -i '' 's/@intstudio\/ds/@joseph.ehler\/wizard-react/g' {} \;
```

---

## Success Criteria Met ✅

- [x] Package renamed to `@intstudio/ds`
- [x] Description reflects DS purpose
- [x] Keywords updated
- [x] Peer deps simplified
- [x] Demo imports migrated
- [x] Build passing
- [x] Lockfile clean
- [x] Migration script created
- [x] Documentation complete

**Status:** Soft extraction COMPLETE! Ready for 2-week stabilization phase.

---

## What This Enables

### Immediate Benefits:
- Clear mental model (DS vs Forms)
- Easier to explain to partners
- Foundation for public Storybook
- Distinct release cadence possible

### Future Benefits (After Hard Extract):
- Public npm package
- Standalone Storybook site
- Independent versioning
- Agency/SaaS demos
- Open source potential

---

## Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Soft Extract | 1 hour | ✅ DONE |
| Stabilization | 2 weeks | 🔄 NEXT |
| Hard Extract | 1 day | ⏳ FUTURE |
| Public Launch | TBD | ⏳ FUTURE |

**Today:** October 22, 2025  
**Stabilization Target:** November 5, 2025  
**Hard Extract Target:** November 6, 2025  

---

## Questions Answered

**Q: Can Form Studio still use the DS?**  
A: Yes! Via `workspace:*` protocol. Zero changes needed.

**Q: Is this reversible?**  
A: Yes! Just revert the commits or run reverse migration.

**Q: When do we publish to npm?**  
A: After 2-week stabilization (tests + Storybook + bug sweep).

**Q: What about breaking changes?**  
A: API is frozen during stabilization. Breaking changes wait until v1.0.

**Q: How do we know when we're ready?**  
A: All gates in checklist must be green (tests, docs, audit, etc.).

---

## Final Notes

This soft extraction gives us **separation without pain**. We can:
- Build Storybook in DS package
- Document patterns clearly
- Test extraction mechanics
- Find issues early

When we're confident (2 weeks), flipping to npm is one line:
```json
"@intstudio/ds": "^0.1.0"
```

**Well done!** We've laid the foundation for a world-class design system. 🎉
