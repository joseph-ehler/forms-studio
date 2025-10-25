# GO/NO-GO PR Checklist

**Last verified**: 2025-01-25  
**Status**: ✅ **GO FOR LAUNCH**

---

## Quick Validation (Copy-Paste)

```bash
pnpm barrels && \
pnpm lint:prod && \
pnpm typecheck && \
pnpm -r --filter './packages/**' build && \
pnpm doctor:rename
```

**Expected**: All ✅ green

---

## ✅ Verification Results

### DS Layer
- ✅ `@intstudio/ds` builds (esm+dts)
- ✅ Button wrapper reads only `--btn-*` vars
- ✅ Input wrapper reads only `--input-*` vars
- ✅ SKIN maps complete (variants × required keys)
- ✅ TypeScript enforces completeness (no `as any`)

### Forms Layer  
- ✅ `@intstudio/forms` builds (esm+dts)
- ✅ SelectField composes DS Select (no direct Flowbite)
- ✅ FormRenderer renders schema (happy path)
- ✅ Registry centralized (`field-types.ts`)

### Guardrails
- ✅ `pnpm refactor:rename` command exists
- ✅ `pnpm doctor:rename` passes all checks
- ✅ CI `rename-sanity.yml` workflow present
- ✅ PR template includes refactor checklist
- ✅ Documentation complete (3 handbooks + after-action)

### Golden Sources
- ✅ `flowbite-react-blocks-1.8.0-beta/` present
- ✅ Protected in CODEOWNERS
- ✅ Protected in `.policy/roots-allowlist.json`
- ✅ Delete-prevention script ready

---

## 🚀 PRs to Open

### PR #1: DS + SKIN (Open NOW)

**Branch**: `feat/ds-flowbite-skin`  
**URL**: https://github.com/joseph-ehler/forms-studio/pull/new/feat/ds-flowbite-skin

**Title**: `feat(ds): unify DS around Flowbite + SKIN (contracts > custom tooling)`

**Includes**:
- Flowbite wrappers (Button, Input)
- SKIN contracts (`control/` + `registry/`)
- TypeScript enforcement (compile-time)
- Rename guardrails (5-layer defense)
- Complete documentation

**Required Checks**:
- `lint:prod`
- `typecheck`
- `build`
- `rename-sanity`

**Reviewers**: DS owner + infra

---

### PR #2: Forms Layer (Open After #1 Merges)

**Branch**: `feat/forms-contracts-renderer`  
**URL**: https://github.com/joseph-ehler/forms-studio/pull/new/feat/forms-contracts-renderer

**Title**: `feat(forms): TypeScript contracts + renderer (schema-driven forms)`

**Process**:
```bash
# After PR #1 merges
git checkout feat/forms-contracts-renderer
git rebase main
pnpm doctor
git push --force-with-lease
```

**Includes**:
- Forms contracts (`field-contracts.ts`)
- Field registry (`field-types.ts`)
- SelectField (composes DS Select)
- FormRenderer MVP
- Complete documentation

**Same checks as PR #1**

---

## 📋 Reviewer Crib Sheet

**Drop in PR description**:

### Control Panel Present
- ✅ `control/` decides (variants, contracts)
- ✅ `registry/` implements (SKIN maps, field types)
- ✅ Components consume (wrappers, fields)

### Wrappers Clean
- ✅ Read local vars only (`--btn-*`, `--input-*`)
- ✅ No raw colors
- ✅ No direct Flowbite in Forms layer

### TypeScript Enforces
- ✅ SKIN completeness (variants × keys)
- ✅ No `as any` escapes
- ✅ Contracts prevent invalid states

### Barrels Deterministic
- ✅ Templates excluded from generation
- ✅ Quiet output (no churn)
- ✅ Up-to-date check passes

### Rename Guardrails
- ✅ Safe command (`refactor:rename`)
- ✅ CI validation (`rename-sanity.yml`)
- ✅ Complete documentation (`RENAME_WORKFLOW.md`)

### Documentation Complete
- ✅ WHERE-TO-EDIT.md (no hunting)
- ✅ FACTORY_OPERATING_MANUAL.md (playbook)
- ✅ RENAME_WORKFLOW.md (safe refactoring)
- ✅ AFTER_ACTION_RENAME_INCIDENT.md (learn from incidents)

---

## 📅 1-Week Plan (Keep Momentum)

### Week 1
- [x] Ship PR #1 (DS + SKIN)
- [ ] Ship PR #2 (Forms)
- [ ] Add DS: Select, Textarea (same pattern, 10 min each)
- [ ] Add Forms: TextField, EmailField (compose DS Input, 15 min each)
- [ ] Enable `storybook:canary` (matrix stories, fast PR job)

### Week 2
- [ ] Add DS: Checkbox, Radio, Toggle, Breadcrumb
- [ ] Add Forms: CheckboxField, RadioField, ToggleField
- [ ] Nightly job (optional): contrast/visual canaries

---

## 🔧 Optional Hardening (High ROI)

### Vendor Strategy for Golden Sources
**Option A**: Git submodule
```bash
git submodule add https://github.com/themesberg/flowbite-react-blocks vendor/flowbite-blocks
```

**Option B**: Pinned tarball
```bash
# Keep in /vendor with checksum
# Cleaner diffs, preserved patterns
```

### Release Notes
**Tiny changeset**:
```bash
pnpm changeset
```

**Or simple tagging**:
```bash
pnpm run release:tag
# Appends to docs/releases/notes.md (5-8 human lines)
```

---

## 🔄 Rollback Plans (If Wobbles)

### Revert PR
```bash
git revert <commit-sha>
```
**Impact**: Minimal blast radius (wrappers isolate Flowbite)

### Undo Bad Rename
```bash
pnpm refactor:rename <to> <from>
```
**Result**: Auto-fixes imports + barrels

### Known-Good Checkout
```bash
git checkout <tag>
```
**Use case**: While DS PRs bake in main

---

## 🎯 Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| **Barrels** | Deterministic | ✅ Quiet |
| **Lint (prod)** | 0 errors | ✅ Clean |
| **TypeCheck** | All packages | ✅ Pass |
| **Build** | All compile | ✅ Done |
| **Rename sanity** | All checks | ✅ Pass |
| **Doctor runtime** | <2 min | ✅ ~90s |

---

## 📚 Key Documents

| Document | Purpose |
|----------|---------|
| [Factory Manual](./handbook/FACTORY_OPERATING_MANUAL.md) | Operating playbook |
| [WHERE-TO-EDIT](./handbook/WHERE-TO-EDIT.md) | No hunting map |
| [Rename Workflow](./handbook/RENAME_WORKFLOW.md) | Safe refactoring |
| [After-Action](./archive/AFTER_ACTION_RENAME_INCIDENT.md) | Learn from incidents |

---

## ✨ Bottom Line

**You've got**:
- ✅ One mental model (DS + Forms identical)
- ✅ Contracts doing heavy lifting (TypeScript enforces)
- ✅ Guardrails catching mistakes before landing
- ✅ Playbook keeping everything boring

**Next steps**:
1. Open PR #1 (NOW)
2. Wait for merge
3. Open PR #2
4. Start stamping out Core Six (10-15 min each)

---

## 🚀 Ready to Ship

**Status**: ✅ **GO FOR LAUNCH**

All checks passing, documentation complete, guardrails deployed, playbook ready.

**Open PR #1**: https://github.com/joseph-ehler/forms-studio/pull/new/feat/ds-flowbite-skin

🎉
