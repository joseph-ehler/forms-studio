# GitHub Branch Protection Setup

**Status:** Required for Unbreakable System  
**Time:** 5 minutes

---

## 🎯 Purpose

Branch protection ensures:
- No violations can be merged (server-side)
- All checks pass before merge
- No direct pushes to main
- Code review required

---

## 🔧 Setup Steps

### 1. Navigate to Settings

1. Go to GitHub repository
2. Click **Settings**
3. Click **Branches** (sidebar)
4. Click **Add branch protection rule**

### 2. Branch Pattern

```
Branch name pattern: main
```

### 3. Required Status Checks

✅ Require status checks to pass before merging

**Select these checks:**
- Docs Placement
- Docs Quality (lint + links)
- Naming Conventions  
- Reviewdog (docs + naming)
- Build (if applicable)
- Tests (if applicable)

✅ Require branches to be up to date

### 4. Require Pull Requests

✅ Require a pull request before merging
- Required approvals: 1+
- ✅ Dismiss stale approvals
- ✅ Require Code Owner review

### 5. Block Direct Pushes

✅ Do not allow bypassing
✅ Restrict pushes (only via PR)

---

## 📋 Complete Checklist

```
Branch: main

✅ Require status checks
✅ Require PR reviews (1+ approval)
✅ Required checks:
   - Docs Placement
   - Docs Quality  
   - Naming Conventions
   - Reviewdog
✅ No bypass allowed
✅ Restrict direct pushes
```

---

## 🎯 What This Prevents

**Before:**
```bash
git push origin main  # ✅ Works (bad!)
```

**After:**
```bash
git push origin main  
# ❌ REJECTED: Protected branch
```

---

## 🔄 Workflow

```bash
# 1. Create branch
git checkout -b feat/my-feature

# 2. Make changes & commit
git commit -m "feat: add feature"

# 3. Push
git push origin feat/my-feature

# 4. Open PR
# CI runs:
#   - Docs validation
#   - Naming check
#   - Lint
#   - Reviewdog comments

# 5. Fix issues (if any)
# 6. Get approval
# 7. Merge (if checks pass)
```

---

## 📊 Verification

Test it works:

```bash
# Try direct push
git push origin main
# Expected: ❌ Protected branch error

# Try PR
git checkout -b test/protection
git push origin test/protection
# Open PR on GitHub
# Expected: ✅ CI runs, merge blocked until pass
```

---

## ✅ Success Criteria

1. ✅ Direct pushes rejected
2. ✅ PRs need approval
3. ✅ PRs need passing checks
4. ✅ Reviewdog posts comments
5. ✅ No bypass possible

---

## 🔗 Related

- PR Template: `.github/PULL_REQUEST_TEMPLATE.md`
- CI: `.github/workflows/`
- Validators: `scripts/validate-*.mjs`
