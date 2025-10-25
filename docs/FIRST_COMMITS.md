# First Commits - Quality Layer Foundation

**Staged commits ready to land**

---

## Pre-Commit Checklist

- [ ] `pnpm install` ran successfully
- [ ] `pnpm versions:check` passes
- [ ] `pnpm build` completes without errors
- [ ] `pnpm guard` passes
- [ ] Demo page renders without console errors

---

## Commit Sequence

### 1. Lock Dependencies
```bash
git add package.json
git add pnpm-lock.yaml

git commit -m "chore: lock dependency versions for stability

- Tailwind CSS 3.4.14 (max Flowbite compatibility)
- TypeScript 5.8.2 (peer compliance)
- flowbite-react 0.10.2
- flowbite 2.5.2

Prevents version drift, eliminates peer warnings.
See docs/handbook/version-policy.md for rationale."
```

---

### 2. Add Dev Utilities
```bash
git add packages/ds/src/utils/
git add scripts/check-versions.mjs
git add package.json  # versions:check script

git commit -m "feat(ds): add dev utilities and version check

- devAssert: consistent runtime contract errors
- isBrowser: SSR-safe browser detection
- check-versions.mjs: validates locked versions

All dev utilities strip in production builds."
```

---

### 3. Update Wrappers to Use Utilities
```bash
git add packages/ds/src/fb/Modal.tsx
git add packages/ds/src/fb/Field.tsx
git add packages/ds/src/hooks/useModal.ts

git commit -m "refactor(ds): use devAssert and isBrowser utilities

- Modal: devAssert for ariaLabel, isBrowser for listeners
- Field: devAssert for id requirement
- useModal: add 'as const' for better type inference

Debug prop now wins over window.__DS_DEBUG."
```

---

### 4. Add Naming Validation for Hooks
```bash
git add scripts/validate-naming.mjs
git add .eslintrc.elite-layer.cjs

git commit -m "chore: allow camelCase for hook filenames

Hook files (useModal.ts, useDrawer.tsx) now allowed.
All other files remain kebab-case."
```

---

### 5. Add Documentation
```bash
git add docs/handbook/quality-layer-definition.md
git add docs/handbook/version-policy.md
git add docs/TAILWIND_STORYBOOK_CONFIG.md
git add docs/REFINEMENTS_APPLIED.md
git add docs/FIRST_COMMITS.md

git commit -m "docs: add quality layer definition and policies

- quality-layer-definition: What, why, how, anti-patterns
- version-policy: Locked versions and upgrade playbook
- Storybook Tailwind config notes
- Applied refinements summary"
```

---

### 6. Ship First Wrappers
```bash
git add packages/ds/src/fb/
git add packages/ds/src/hooks/
git add packages/demo-app/src/pages/quality-layer-demo.tsx
git add NEXT_STEPS.md
git add SPIKE_VALIDATION.md

git commit -m "feat(ds): ship Modal, Field, Button + useModal hook

Quality layer wrappers add:
- Required accessibility contracts (throws in dev)
- Auto-wiring via hooks
- Diagnostic data-* attributes
- Semantic API variants

Demo page validates full flow.
See SPIKE_VALIDATION.md for testing."
```

---

## Post-Commit Validation

After landing commits:

```bash
# 1. Fresh install
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 2. Check versions
pnpm versions:check

# 3. Build everything
pnpm build

# 4. Run guard
pnpm guard

# 5. Start demo
pnpm play
# Open: http://localhost:3000/quality-layer-demo

# 6. Validate checklist in SPIKE_VALIDATION.md
```

---

## If Validation Fails

### Build errors
- Check DS package built: `packages/ds/dist/` exists
- Check imports: `pnpm fix:imports`
- Check types: `pnpm typecheck`

### Runtime errors
- Check browser console for specific error
- Enable debug: `window.__DS_DEBUG = true`
- Check Modal has ariaLabel prop

### Import errors
- Check barrels fresh: `pnpm barrels`
- Check ESLint passes: `pnpm guard`

---

## Next Steps After Landing

See NEXT_STEPS.md for:
- Week 1: Expand to 8 wrappers
- Week 2: Polish + Storybook + codemods
- Week 3-4: Migrate existing code

---

## PR Template (if using)

```markdown
## Quality Layer Foundation

### What
Establishes production-ready wrapper layer over Flowbite with:
- Required accessibility contracts
- Auto-wiring via hooks
- Diagnostic observability
- Semantic API variants

### Why
- 10x faster UI development (2-3 lines vs 10-15)
- 100% accessible by default (throws in dev if missing)
- Systematic quality (not ad-hoc)
- Maintainable (change once, updates everywhere)

### Changed
- Locked Tailwind 3.4.14, TS 5.8.2, Flowbite 0.10.2/2.5.2
- Added devAssert + isBrowser utilities
- Added Modal, Field, Button wrappers
- Added useModal hook
- Version check script
- Comprehensive documentation

### Testing
- [ ] `pnpm install` → zero peer warnings
- [ ] `pnpm versions:check` → passes
- [ ] `pnpm build` → success
- [ ] Demo page works end-to-end
- [ ] Modal throws if ariaLabel missing (dev mode)
- [ ] Field auto-wires ARIA attributes
- [ ] Focus returns after modal close

### Docs
- docs/handbook/quality-layer-definition.md
- docs/handbook/version-policy.md
- NEXT_STEPS.md
- SPIKE_VALIDATION.md

### Rollout
Phase 1 (now): Validate spike  
Week 1: Expand to 8 wrappers  
Week 2: Polish + Storybook  
Week 3-4: Migrate apps
```

---

## Success Metrics

Track after landing:

| Metric | Target | Check |
|--------|--------|-------|
| Peer warnings | 0 | `pnpm install` output |
| Version drift | 0 | `pnpm versions:check` |
| A11y compliance | 100% | Manual validation |
| Bundle size | <35KB | `pnpm size-limit` |
| Demo validation | 100% | SPIKE_VALIDATION.md |

---

**Status**: Ready to commit and validate ✅
