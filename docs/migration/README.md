# Architecture Migration - Complete Toolkit

**Everything you need to migrate to DS/Forms separation pattern**

---

## 📦 What's in This Toolkit

### **1. Architecture Audit Script** ✅

**Purpose**: Find violations of DS/Forms layer separation

**Location**: `scripts/audit/run-architecture-audit.mjs`

**Run**:
```bash
pnpm audit:architecture          # Human-readable
pnpm audit:architecture:json     # JSON for CI
```

**Checks** (8 total):
- Forms CSS Files (target: 0)
- DS Components Missing Co-located CSS
- Inline Appearance Styles (target: 0)
- Magic Numbers in DS CSS (target: 0)
- Missing ARIA on Route Components
- Hard-coded Z-Index (target: 0)
- Custom Focus Logic (target: 0)
- Illegal Component Composition

**Output**: Score 0-100%, violation count, file paths

---

### **2. Add ARIA Labels Codemod** ✅

**Purpose**: Automatically add missing `ariaLabel` to route components

**Location**: `tools/codemods/add-missing-aria-label.mjs`

**Run**:
```bash
pnpm codemod:add-aria --dry-run  # Preview
pnpm codemod:add-aria            # Apply
```

**Fixes**:
- `<FullScreenRoute>` → `<FullScreenRoute ariaLabel="...">`
- `<RoutePanel>` → `<RoutePanel ariaLabel="...">`
- `<FlowScaffold>` → `<FlowScaffold ariaLabel="...">`

**Risk**: LOW (only adds required prop)

---

### **3. ESLint Rule: no-inline-appearance** ✅

**Purpose**: Block inline appearance styles at commit time

**Location**: `tools/eslint-plugin-cascade/rules/no-inline-appearance.js`

**Blocks**:
```tsx
// ❌ Blocked
<div style={{ padding: '16px', background: '#fff' }}>
```

**Allows**:
```tsx
// ✅ Allowed
<div className="ds-input">
<div style={{ transform: `translateY(${offset}px)` }}>
```

**Enable**: Add to `.eslintrc.js` (see QUICK_START.md)

---

### **4. CI Integration** ✅

**Purpose**: Auto-run audit on every PR

**Location**: `.github/workflows/architecture-audit.yml`

**Features**:
- Runs on PR to main
- Posts score as comment
- Uploads audit.json artifact
- Fails PR if score < 100%

**Status**: Will run automatically on next PR

---

### **5. Documentation** ✅

| Document | Purpose |
|----------|---------|
| **QUICK_START.md** | Get started in 5 minutes |
| **AUDIT_AND_MIGRATION_GUIDE.md** | Complete reference |
| **DEPRECATIONS.md** | What's deprecated + migration paths |
| **MIGRATION_COMPLETE_STATUS.md** | Infrastructure status |

**Location**: `docs/migration/`

---

## 🚀 Quick Start (5 minutes)

```bash
# 1. Run audit
pnpm audit:architecture

# 2. Save baseline
pnpm audit:architecture:json > baseline.json

# 3. Quick win (add ARIA)
pnpm codemod:add-aria
```

**Full guide**: See `QUICK_START.md`

---

## 📊 Migration Phases

### **Phase 0: Setup** (Today)
- Run audit
- Save baseline
- Review violations

### **Phase 1: Quick Wins** (Week 1)
- Add missing ARIA (codemod)
- Enable ESLint rules
- Auto-fix lint errors

### **Phase 2: Migrations** (Week 2-3)
- Modals → `FullScreenRoute`
- Drawers → `RoutePanel`
- Wizards → `FlowScaffold`
- Remove Forms CSS

### **Phase 3: Polish** (Week 4)
- Tokenize magic numbers
- Final audit (100%)
- Deploy to production

**Timeline**: 4 weeks to 100% compliance

---

## 🎯 Success Metrics

**Target state**:
- ✅ Score: 100%
- ✅ All 8 checks passing
- ✅ 0 violations

**Quality gates**:
- ✅ CI blocks PRs with violations
- ✅ ESLint prevents new violations
- ✅ Runtime validation (dev mode)

---

## 🔧 Commands Reference

```bash
# Audit
pnpm audit:architecture              # Run audit
pnpm audit:architecture:json         # JSON output

# Codemods
pnpm codemod:add-aria --dry-run      # Preview ARIA fixes
pnpm codemod:add-aria                # Apply ARIA fixes

# Lint
pnpm lint                             # Check violations
pnpm lint --fix                       # Auto-fix
```

---

## 📚 Full Documentation

**Start here**: `QUICK_START.md` (5-minute setup)

**Deep dive**: `AUDIT_AND_MIGRATION_GUIDE.md` (complete reference)

**Recipes**: `../ADOPTION_GUIDE.md` (migration patterns)

**Rules**: `../../.cascade/COMPONENT_WORK_PROTOCOL.md` (architecture)

---

## ✅ What's Complete

- ✅ **Audit script** (8 checks, human + JSON output)
- ✅ **Add ARIA codemod** (safe, dry-run support)
- ✅ **ESLint rule** (blocks inline styles)
- ✅ **CI workflow** (auto-runs on PRs)
- ✅ **Documentation** (4 guides)
- ✅ **Package.json scripts** (pnpm commands)
- ✅ **Executable permissions** (scripts ready)

**Status**: Infrastructure complete, ready to use! 🚀

---

## 🆘 Need Help?

**Issue tracking**: Create issue with `migration` label

**Questions**: Check troubleshooting in `AUDIT_AND_MIGRATION_GUIDE.md`

**Slack**: #design-system or #forms-studio

---

**First command to run**:
```bash
pnpm audit:architecture
```
