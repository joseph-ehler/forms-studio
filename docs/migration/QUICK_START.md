# Quick Start - Architecture Migration

**Get from baseline → 100% score in 4 weeks**

---

## 📍 You Are Here

✅ **Migration infrastructure complete**
- Audit script (8 checks)
- Add ARIA codemod
- ESLint rule (inline styles)
- CI integration
- Complete documentation

**Next**: Run first audit and start migration

---

## 🚀 Getting Started (5 minutes)

### **1. Run First Audit**

```bash
# From repo root
pnpm audit:architecture
```

**Expected output**:
```
🔍 Architecture Audit

✓ PASS Forms CSS Files: 0/0
✗ FAIL Inline Appearance Styles: 12/0
✗ FAIL Magic Numbers in DS CSS: 8/0
✗ FAIL Missing ARIA on Routes: 5/0
...

📊 Summary:
  Passing: 5/8 checks
  Violations: 25
  Score: 62%

⚠️  Architecture needs cleanup
```

### **2. Save Baseline**

```bash
# Save for tracking progress
pnpm audit:architecture:json > baseline-audit.json

# Commit
git add baseline-audit.json
git commit -m "chore: architecture audit baseline"
```

### **3. Quick Win (< 5 min)**

**Add missing ARIA labels**:

```bash
# Preview changes
pnpm codemod:add-aria --dry-run

# Review output, then apply
pnpm codemod:add-aria

# Commit
git add .
git commit -m "chore: add missing ariaLabel to route components"

# Check improvement
pnpm audit:architecture
```

**Expected**: "Missing ARIA" violations → 0 ✅

---

## 📅 Week-by-Week Plan

### **Week 1: Low-Hanging Fruit**

**Day 1** (30 min):
```bash
# Run baseline audit
pnpm audit:architecture:json > baseline.json

# Add missing ARIA
pnpm codemod:add-aria
```

**Day 2** (1 hour):
```bash
# Enable ESLint rule (see below)
# Run lint
pnpm lint --fix
```

**Day 3-5** (2 hours total):
- Manual fixes for remaining lint errors
- Review and merge

**Target**: 2-3 checks passing → 5-6 checks

---

### **Week 2: High-Impact Migrations**

**Pick ONE pattern per day**:

**Monday**: Migrate 1 modal → `FullScreenRoute`
```tsx
// See docs/ADOPTION_GUIDE.md "Pattern 2"
```

**Tuesday**: Migrate 1 drawer → `RoutePanel`
```tsx
// See docs/ADOPTION_GUIDE.md "Pattern 1"
```

**Wednesday**: Migrate 1 wizard → `FlowScaffold`
```tsx
// See docs/ADOPTION_GUIDE.md "Pattern 3"
```

**Thursday**: Test + review

**Friday**: Deploy to staging

**Target**: Score 70-80%

---

### **Week 3: CSS Cleanup**

**Find Forms CSS**:
```bash
fd -e css packages/forms
```

**For each file**:
1. Move to DS if reusable primitive
2. Delete if using DS classes only
3. Verify: `pnpm audit:architecture`

**Target**: Score 85-95%

---

### **Week 4: Final Push**

**Tokenize magic numbers**:
```bash
# Find violations
rg --glob 'packages/ds/**.css' ':\s*(\d+px|#[0-9a-fA-F]{3,6})'

# Replace with tokens
# padding: 16px → padding: var(--ds-space-4)
# background: #fff → background: var(--ds-color-surface-base)
```

**Final audit**:
```bash
pnpm audit:architecture
# Target: Score 100%, 8/8 passing
```

---

## 🔧 Enable ESLint Rule

**Add to `.eslintrc.js`**:

```js
module.exports = {
  // ... existing config
  plugins: [
    // ... existing plugins
    '@yourorg/cascade',  // or whatever your org name is
  ],
  rules: {
    // ... existing rules
    '@yourorg/cascade/no-inline-appearance': 'error',
    '@yourorg/cascade/sheet-no-panel-on-dialog': 'error',
    '@yourorg/cascade/routes-require-aria-label': 'error',
  },
};
```

**Test it**:
```bash
pnpm lint
```

---

## 📊 Track Progress

**Daily**:
```bash
# Quick check
pnpm audit:architecture | grep "Score:"
```

**Weekly**:
```bash
# Full report
pnpm audit:architecture:json > week-$(date +%Y-%m-%d).json

# Compare
diff baseline.json week-*.json
```

**Dashboard** (optional):

Create CSV for charting:
```bash
echo "date,score" > progress.csv
echo "$(date +%Y-%m-%d),$(pnpm audit:architecture:json | jq -r '.score')" >> progress.csv
```

---

## 🆘 Common Issues

### **Audit script fails**

```bash
# Check dependencies
which rg  # ripgrep
which fd  # fd-find

# Install if missing (macOS)
brew install ripgrep fd

# Install if missing (Ubuntu)
sudo apt install ripgrep fd-find
```

### **Codemod doesn't find files**

```bash
# Must run from repo root
pwd  # Should be /path/to/intelligence-studio-forms

# Check tsconfig exists
ls tsconfig.json
```

### **ESLint rule not working**

```bash
# Check plugin is installed
ls tools/eslint-plugin-cascade

# Check .eslintrc has it
grep "cascade" .eslintrc.js
```

---

## ✅ Success Checklist

**Phase 0: Setup** (Today)
- [ ] Run `pnpm audit:architecture`
- [ ] Save baseline: `baseline-audit.json`
- [ ] Review violations

**Phase 1: Quick Wins** (Week 1)
- [ ] Run `pnpm codemod:add-aria`
- [ ] Enable ESLint rules
- [ ] Run `pnpm lint --fix`
- [ ] Score improves by 20-30%

**Phase 2: Migrations** (Week 2-3)
- [ ] Migrate 3+ modals → `FullScreenRoute`
- [ ] Migrate 3+ drawers → `RoutePanel`
- [ ] Migrate 2+ wizards → `FlowScaffold`
- [ ] Remove Forms CSS files
- [ ] Score > 80%

**Phase 3: Polish** (Week 4)
- [ ] Tokenize magic numbers
- [ ] Final audit: 100%
- [ ] Deploy to production
- [ ] 🎉 **DONE!**

---

## 📚 Reference Docs

| Topic | Document |
|-------|----------|
| **Complete guide** | `docs/migration/AUDIT_AND_MIGRATION_GUIDE.md` |
| **Migration recipes** | `docs/ADOPTION_GUIDE.md` |
| **Deprecated patterns** | `DEPRECATIONS.md` |
| **Architecture rules** | `.cascade/COMPONENT_WORK_PROTOCOL.md` |
| **API reference** | `docs/COMPLETE_SYSTEM_REFERENCE.md` |

---

## 🎯 First 3 Commands

```bash
# 1. See where you stand
pnpm audit:architecture

# 2. Save baseline
pnpm audit:architecture:json > baseline.json

# 3. Quick win
pnpm codemod:add-aria --dry-run
```

**Time to first improvement**: < 10 minutes 🚀

---

**Questions?** Check `docs/migration/AUDIT_AND_MIGRATION_GUIDE.md` for detailed troubleshooting.
