# Architecture Audit & Migration Guide

**Complete toolkit for DS/Forms layer separation**

---

## 🚀 Quick Start

### **1. Run Initial Audit**

```bash
# Make script executable (first time only)
chmod +x scripts/audit/run-architecture-audit.mjs

# Run audit
node scripts/audit/run-architecture-audit.mjs

# Get JSON report
node scripts/audit/run-architecture-audit.mjs --json > audit.json
```

### **2. Review Results**

The audit checks 8 architecture contracts:

1. ✅ **Forms CSS Files** → Target: 0
2. ✅ **DS Components Missing CSS** → Target: 0
3. ✅ **Inline Appearance Styles** → Target: 0
4. ✅ **Magic Numbers in DS CSS** → Target: 0
5. ✅ **Missing ARIA on Routes** → Target: 0
6. ✅ **Hard-coded Z-Index** → Target: 0
7. ✅ **Custom Focus Logic** → Target: 0
8. ✅ **Illegal Composition** → Target: 0

**Score**: Passing checks / Total checks × 100%

---

## 🔧 Available Tools

### **Architecture Audit Script**

**Location**: `scripts/audit/run-architecture-audit.mjs`

**Usage**:
```bash
# Human-readable output
node scripts/audit/run-architecture-audit.mjs

# JSON output (for CI/dashboards)
node scripts/audit/run-architecture-audit.mjs --json

# Exit codes:
#   0 = 100% passing (green)
#   1 = violations found (red)
```

**Output**:
```
🔍 Architecture Audit

✓ PASS Forms CSS Files: 0/0
✗ FAIL Inline Appearance Styles: 12/0
  Found 12 violations:
    - packages/forms/src/fields/CustomField.tsx:45
    - packages/forms/src/recipes/MyRecipe.tsx:23
    ... and 10 more

📊 Summary:
  Passing: 7/8 checks
  Violations: 12
  Score: 87%

⚠️  Architecture needs cleanup
```

---

### **Codemod: Add Missing ARIA Labels**

**Location**: `tools/codemods/add-missing-aria-label.mjs`

**Usage**:
```bash
# Make executable
chmod +x tools/codemods/add-missing-aria-label.mjs

# Dry run (preview changes)
node tools/codemods/add-missing-aria-label.mjs --dry-run

# Apply changes
node tools/codemods/add-missing-aria-label.mjs
```

**What it does**:
- Finds `FullScreenRoute`, `RoutePanel`, `FlowScaffold` without `ariaLabel`
- Adds `ariaLabel="Component Name"` automatically
- Shows diff before applying

**Example**:
```tsx
// Before
<FullScreenRoute>
  <Checkout />
</FullScreenRoute>

// After
<FullScreenRoute ariaLabel="Full Screen Route">
  <Checkout />
</FullScreenRoute>
```

**Risk**: LOW (only adds required prop)

---

### **ESLint Rule: no-inline-appearance**

**Location**: `tools/eslint-plugin-cascade/rules/no-inline-appearance.js`

**Status**: ✅ Created, needs registration in `.eslintrc`

**What it blocks**:
```tsx
// ❌ Blocked by ESLint
<div style={{ padding: '16px', background: '#fff' }}>

// ✅ Allowed - DS classes
<div className="ds-input">

// ✅ Allowed - runtime positioning
<div style={{ transform: `translateY(${offset}px)` }}>
```

**To enable**:

Add to `.eslintrc.js`:
```js
{
  "plugins": ["@yourorg/cascade"],
  "rules": {
    "@yourorg/cascade/no-inline-appearance": "error"
  }
}
```

---

### **CI Integration**

**Location**: `.github/workflows/architecture-audit.yml`

**Features**:
- Runs on every PR touching `packages/`
- Posts audit score as PR comment
- Uploads `audit.json` artifact
- Fails PR if score < 100%

**Manual trigger**:
```bash
# Via GitHub Actions UI
# Workflow: "Architecture Audit"
# Click "Run workflow"
```

---

## 📋 Migration Workflow

### **Phase 0: Baseline (Day 1)**

```bash
# 1. Tag current state
git tag migration-baseline-$(date +%Y-%m-%d)

# 2. Run initial audit
node scripts/audit/run-architecture-audit.mjs --json > baseline-audit.json

# 3. Commit baseline
git add baseline-audit.json
git commit -m "chore: architecture audit baseline"

# 4. Create tracking issue
# Title: "Architecture Migration to DS/Forms Pattern"
# Body: Paste baseline-audit.json summary
```

### **Phase 1: Low-Hanging Fruit (Week 1)**

**Priority 1: Add Missing ARIA**
```bash
# Run codemod
node tools/codemods/add-missing-aria-label.mjs --dry-run
# Review output
node tools/codemods/add-missing-aria-label.mjs

# Commit
git add .
git commit -m "chore: add missing ariaLabel to route components"
```

**Priority 2: Enable ESLint Rule**
```bash
# Add to .eslintrc.js (see above)
# Run lint
pnpm lint

# Fix auto-fixable issues
pnpm lint --fix

# Manual fixes for remaining
```

### **Phase 2: High-Impact Migrations (Week 2-3)**

**Migrate Modals → FullScreenRoute**

See `docs/ADOPTION_GUIDE.md`:
- Pattern: Ad-hoc Modal → FullScreenRoute
- Benefits: Focus trap, unsaved changes guard, deep-linkable
- Codemod: TBD (create if >10 files)

**Migrate Drawers → RoutePanel**

See `docs/ADOPTION_GUIDE.md`:
- Pattern: Ad-hoc Drawer → RoutePanel
- Benefits: URL-bound, mobile-responsive, RTL support
- Codemod: TBD (create if >10 files)

**Migrate Wizards → FlowScaffold**

See `docs/ADOPTION_GUIDE.md`:
- Pattern: Custom Stepper → FlowScaffold + useSubFlow
- Benefits: URL-bound steps, browser back/forward
- Hook: Already available (`useSubFlow`)

### **Phase 3: CSS Cleanup (Week 4)**

**Remove Forms CSS**
```bash
# Find all Forms CSS
fd -e css packages/forms

# For each file:
# 1. Move to DS if reusable primitive
# 2. Delete if using DS classes only

# Verify
node scripts/audit/run-architecture-audit.mjs
```

**Tokenize Magic Numbers**
```bash
# Find magic numbers
rg --glob 'packages/ds/**.css' ':\s*(\d+px|#[0-9a-fA-F]{3,6})'

# Replace with tokens (manual or codemod)
# Example:
#   padding: 16px → padding: var(--ds-space-4)
#   background: #fff → background: var(--ds-color-surface-base)

# Verify with Stylelint
pnpm stylelint
```

### **Phase 4: Verification (Week 5)**

```bash
# Run full audit
node scripts/audit/run-architecture-audit.mjs

# Should see:
# Score: 100%
# Passing: 8/8 checks
# Violations: 0
```

---

## 📊 Tracking Progress

### **Daily Check**

```bash
# Quick audit
node scripts/audit/run-architecture-audit.mjs

# Track score over time
echo "$(date +%Y-%m-%d),$(node scripts/audit/run-architecture-audit.mjs --json | jq -r '.score')" >> progress.csv
```

### **Weekly Report**

```bash
# Generate full report
node scripts/audit/run-architecture-audit.mjs --json > weekly-$(date +%Y-%m-%d).json

# Compare to baseline
diff baseline-audit.json weekly-*.json
```

### **Dashboard (Optional)**

Create `README.md` badge:

```markdown
![Architecture Score](https://img.shields.io/badge/dynamic/json?url=https://raw.githubusercontent.com/org/repo/main/audit.json&label=Architecture&query=$.score&suffix=%25&color=blue)
```

---

## 🎯 Success Metrics

### **Target State**

- **Score**: 100%
- **Forms CSS Files**: 0
- **Inline Styles**: 0
- **Magic Numbers**: 0
- **Missing ARIA**: 0
- **Custom Focus Logic**: 0

### **Migration KPIs**

| Metric | Baseline | Target | Current |
|--------|----------|--------|---------|
| Architecture Score | ___ % | 100% | ___ % |
| Forms CSS Files | ___ | 0 | ___ |
| Inline Appearance | ___ | 0 | ___ |
| Magic Numbers | ___ | 0 | ___ |
| Missing ARIA | ___ | 0 | ___ |

---

## 🆘 Troubleshooting

### **Audit Script Fails**

```bash
# Check dependencies
which rg  # ripgrep
which fd  # fd-find

# Install if missing
brew install ripgrep fd  # macOS
sudo apt install ripgrep fd-find  # Ubuntu
```

### **Codemod Doesn't Find Files**

```bash
# Check tsconfig.json path
ls tsconfig.json

# Run from repo root
pwd  # Should be repo root
```

### **ESLint Rule Not Working**

```bash
# Check plugin is registered
grep "cascade" .eslintrc.js

# Check rule is enabled
grep "no-inline-appearance" .eslintrc.js

# Test on specific file
pnpm eslint --rule '@yourorg/cascade/no-inline-appearance: error' path/to/file.tsx
```

---

## 📚 Reference

- **Architecture Pattern**: `.cascade/COMPONENT_WORK_PROTOCOL.md`
- **Migration Recipes**: `docs/ADOPTION_GUIDE.md`
- **Deprecations**: `DEPRECATIONS.md`
- **API Reference**: `docs/COMPLETE_SYSTEM_REFERENCE.md`

---

## ✅ Checklist Per Migration

- [ ] Run audit (baseline score)
- [ ] Run codemod (if available)
- [ ] Manual fixes (edge cases)
- [ ] Update tests
- [ ] Run lint + build
- [ ] Run audit (verify improvement)
- [ ] Deploy to staging
- [ ] Monitor metrics
- [ ] Deploy to production
- [ ] Update tracking issue

---

**Last updated**: Oct 24, 2025  
**Next review**: After Phase 4 completion
