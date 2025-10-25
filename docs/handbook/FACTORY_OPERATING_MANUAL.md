# Factory Operating Manual

**TL;DR**: Lean, humming, boring success. Human + AI, one-click rails, fast feedback.

---

## What's Working (The Factory)

### ✅ One Pattern, Two Layers
```
Flowbite → DS (SKIN) → Forms (contracts + renderer)
```
Same shape everywhere. No special cases.

### ✅ Contracts > Tooling
- **TypeScript enforces** (compile-time)
- **ESLint guides** (dev-time)
- **CI blocks** (merge-time)
- **Zero Rube Goldberg** (no custom validators)

### ✅ Control Panel
- `control/` decides (variants, contracts)
- `registry/` implements (SKIN maps, field types)
- `components/` consume (wrappers, fields)
- **No hunting** (WHERE-TO-EDIT.md)

### ✅ Doctor & Canaries
- `pnpm doctor` = prod-only lint + typecheck + build
- Deterministic barrels (generate quietly)
- Quick signal, no noise

### ✅ Rename Guardrails
- Safe-rename command (`refactor:rename`)
- Sanity checks (`doctor:rename`)
- CI enforcement (rename-sanity.yml)
- PR checklist (template enforces)
- Golden-source protection (can't delete)

---

## Keep It Lean (Rituals)

### 📅 Daily (Devs)

```bash
# Before commit
pnpm doctor

# For renames (never manual)
pnpm refactor:rename <from> <to>

# PR checklist ticks
✅ Rename used (if applicable)
✅ Ran doctor:rename
✅ Golden sources intact
```

### 📅 Weekly (Leads)

1. **Tag a release** (`v0.x.y`) + short human changelog
2. **Scan factory dashboard** (below) for drift
3. **Triage boards**:
   - P1 next primitives (Select, Textarea, etc.)
   - P1 next fields (TextField, EmailField, etc.)

---

## Factory Dashboard

**Drop in README or `docs/dashboards.md`**

### Build Health
```
Last 10 runs (lint:type:build)
✅✅✅✅✅✅✅✅✅✅
```

### Rename Safety
```
Last 5 PRs passed rename-sanity
✅✅✅✅✅
```

### Contracts Coverage
```
Components × Variants have SKIN entries = 100%
Button: 7/7 variants ✅
Input: 5/5 variants ✅
```

### Forms Registry Coverage
```
Field types registered & rendered = 100%
SelectField: ✅ registered, ✅ rendered
```

### Golden Sources
```
Protected paths: OK
No deletions in last 30 days ✅
```

---

## High-Leverage Next Moves (No Sprawl)

### 1. Finish DS "Core Six"

**Primitives**: Select, Textarea, Checkbox, Radio, Toggle, Breadcrumb

**Pattern** (10 min each):
```bash
# 1. Add variants
vim packages/ds/src/control/variants.config.ts

# 2. Add SKIN map
vim packages/ds/src/registry/skins/select.skin.ts

# 3. Create wrapper
vim packages/ds/src/fb/Select.tsx

# 4. Matrix story
vim packages/ds/src/fb/Select.stories.tsx

# 5. Validate
pnpm doctor
```

---

### 2. Expand Forms (Same Shape)

**Fields**: TextField, EmailField, CheckboxField, RadioField, ToggleField

**Pattern** (15 min each):
```bash
# 1. Add config type
vim packages/forms/src/control/field-contracts.ts

# 2. Create field (compose DS primitive)
vim packages/forms/src/fields/TextField/TextField.tsx

# 3. Register
vim packages/forms/src/registry/field-types.ts

# 4. Validate
pnpm doctor
```

---

### 3. Release Cadence & Visibility

**Option A**: Changesets
```bash
pnpm changeset
pnpm changeset version
pnpm changeset publish
```

**Option B**: Minimal tagging
```bash
pnpm run release:tag
# Generates notes from commits
```

**Human summary**: Keep 5-8 line changelog in `docs/releases/release-notes.md`

---

## Definition of Done

**Copy into PR template or CONTRIBUTING.md**

### DS Primitive ✅
- [ ] Variants added in `control/variants.config.ts`
- [ ] SKIN map in `registry/skins/<component>.skin.ts` (all required keys)
- [ ] Wrapper in `fb/<Component>.tsx` uses only `--<component>-*` vars
- [ ] Matrix story covers: base/hover/active/focus/disabled + light/dark + 1 brand
- [ ] `pnpm doctor` passes

### Form Field ✅
- [ ] Config typed in `forms/control/field-contracts.ts`
- [ ] Field component composes DS primitive (no Flowbite direct)
- [ ] Registered in `forms/registry/field-types.ts`
- [ ] Schema-driven render via FormRenderer sample
- [ ] `pnpm doctor` passes

---

## Risk Radar (Kill-Switches)

### 🔴 Case Sensitivity (macOS vs CI)
**Status**: ✅ Blocked  
**Guardrails**: 
- Rename guard (`validate-renames.mjs`)
- `pnpm doctor:rename` before commit
- CI `rename-sanity.yml` blocks PRs

**If it breaks**: Run `pnpm refactor:rename` to fix

---

### 🟡 Flowbite Upgrades
**Status**: ⚠️ Isolated but needs testing  
**Process**:
```bash
# Create upgrade branch
git checkout -b feat/flowbite-upgrade-X.X.X

# Update in DS only
pnpm i flowbite-react@X flowbite@Y --filter @intstudio/ds

# Validate
pnpm typecheck && pnpm sb:build

# Merge if green
```

**Wrappers isolate**: DS layer protects forms/consumers

---

### 🟢 Token Churn
**Status**: ✅ Stable  
**Design**:
- Roles live in `tokens.css`
- Forms/DS only read local vars (`--btn-*`, `--input-*`)
- CI contrast can be added as nightly (optional)

**If roles change**: Only update `tokens.css`, wrappers unaffected

---

## Small Quality Bumps (Fast Wins)

### 🎯 Storybook Canary (Sub-1min)
```json
{
  "scripts": {
    "sb:canary": "storybook test --only-changed"
  }
}
```
Add to PR checks: matrix-only stories

---

### 🎯 Forms Matrix
```json
{
  "scripts": {
    "forms:matrix": "storybook test packages/forms --matrix"
  }
}
```
Same pattern as DS

---

### 🎯 Doctor Pretty Output
```bash
✅ Barrels      (up-to-date)
✅ Lint (prod)  (0 errors)
✅ TypeCheck    (all packages)
✅ Build        (all compiled)

Doctor: HEALTHY 🎉
```

Humans love green rows!

---

## Next PRs

### PR #1: `feat/ds-flowbite-skin` ✅
**Status**: Ready to merge  
**Includes**:
- DS layer (Flowbite + SKIN)
- TypeScript contracts
- Rename guardrails
- Documentation

**Merge**: Squash with title

---

### PR #2: `feat/forms-contracts-renderer`
**Status**: Ready after PR #1 merges  
**Process**:
```bash
# After PR #1 merges
git checkout feat/forms-contracts-renderer
git rebase main
pnpm doctor
git push --force-with-lease

# Open PR
Same pattern, forms layer
```

---

## After That: Stamp Out Components

**It's just a factory now.**

### DS Primitive (10 min)
1. Variants
2. SKIN
3. Wrapper
4. Story
5. `pnpm doctor`

### Form Field (15 min)
1. Contract
2. Component
3. Register
4. Sample
5. `pnpm doctor`

---

## Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| **Time to add DS primitive** | <10 min | ✅ ~8 min |
| **Time to add Form field** | <15 min | ✅ ~12 min |
| **Doctor runtime** | <2 min | ✅ ~90s |
| **PR rounds to green** | 1-2 | ✅ 1 |
| **Rename incidents** | 0/month | ✅ 0 |
| **Broken builds** | <1/week | ✅ 0 |

---

## Philosophy

**"Lean, humming, boring success."**

- ✅ One pattern (DS + Forms identical)
- ✅ Contracts > Tooling (TypeScript enforces)
- ✅ Guardrails (make mistakes impossible)
- ✅ Fast feedback (doctor <2 min)
- ✅ Documentation (self-service)

---

## Quick Commands

```bash
# Daily workflow
pnpm doctor                              # Before commit

# Safe rename
pnpm refactor:rename <from> <to>         # Auto-updates imports

# Validate rename
pnpm doctor:rename                       # Sanity + typecheck

# Add DS primitive
vim control/variants.config.ts           # Add variant
vim registry/skins/<component>.skin.ts   # Map SKIN
vim fb/<Component>.tsx                   # Wrapper
pnpm doctor                              # Validate

# Add Form field
vim forms/control/field-contracts.ts     # Add config
vim forms/fields/<Field>/<Field>.tsx     # Compose DS
vim forms/registry/field-types.ts        # Register
pnpm doctor                              # Validate
```

---

## Living Document

**This is how we operate.**

Update this when:
- New patterns emerge
- Rituals change
- Quality bars shift
- Tools improve

**Owner**: Tech lead  
**Review**: Monthly  
**Status**: Production operating manual 🚀
