# Git Hooks Automation

**Automated documentation validation - Set it and forget it!**

---

## 🎯 **What It Does**

Automatically validates documentation placement **before every commit**, preventing root-level clutter.

### **Features**

✅ **Automatic** - Runs on every `git commit`  
✅ **Fast** - Completes in < 1 second  
✅ **Clear** - Shows exactly what's wrong and how to fix it  
✅ **Bypassable** - Emergency override available  
✅ **Self-installing** - Sets up on `pnpm install`  

---

## 🚀 **Setup**

### **Automatic (Recommended)**

Hooks install automatically when you run:
```bash
pnpm install
```

### **Manual**

If hooks aren't working:
```bash
pnpm setup:hooks
```

---

## 💡 **How It Works**

### **On Every Commit:**

1. Hook runs `validate:docs` script
2. Checks for `.md` files in forbidden locations
3. **Blocks commit** if violations found
4. Shows quick-fix commands

### **Example (Blocked Commit):**

```bash
$ git commit -m "add documentation"

🔍 Validating documentation placement...

❌ Documentation placement violations found:

  ❌ /MY_DOC.md
     Location: /
     → Move to: docs/

💡 Quick fixes:
  mv ./MY_DOC.md docs/MY_DOC.md

❌ Commit blocked: Documentation placement violations found
```

### **Example (Success):**

```bash
$ git commit -m "add documentation"

🔍 Validating documentation placement...
✅ Documentation validation passed

[main abc123] add documentation
 1 file changed, 10 insertions(+)
```

---

## 🛠️ **Commands**

### **Validate Manually**

```bash
pnpm validate:docs
```

### **Setup/Reinstall Hooks**

```bash
pnpm setup:hooks
```

### **Bypass Hook (Emergency Only)**

```bash
git commit --no-verify -m "emergency commit"
```

⚠️ **Warning:** Only use `--no-verify` in emergencies. Fix violations properly!

---

## 📁 **Approved Locations**

Documents must be in:

✅ `docs/adr/` - Architecture decisions  
✅ `docs/guides/` - User guides  
✅ `docs/sessions/` - Session summaries  
✅ `.cascade/sessions/` - AI session notes  
✅ `.cascade/work-plans/` - Work plans  
✅ `packages/*/docs/` - Package-specific docs  

---

## ❌ **Forbidden Locations**

Never commit `.md` files to:

❌ `/` (repository root)  
❌ `packages/ds/` (package root)  
❌ `packages/core/` (package root)  
❌ `packages/ui-bridge/` (package root)  

---

## 🔧 **Troubleshooting**

### **Hook Not Running**

```bash
# Check hooks path
git config core.hooksPath

# If it shows anything other than blank, reset it:
git config --unset core.hooksPath

# Reinstall hooks
pnpm setup:hooks
```

### **Hook Fails with Error**

```bash
# Make sure validation script exists
ls scripts/validate-docs.mjs

# Test manually
node scripts/validate-docs.mjs
```

### **Need to Disable Temporarily**

```bash
# Option 1: Use --no-verify
git commit --no-verify -m "message"

# Option 2: Remove hook (not recommended)
rm .git/hooks/pre-commit
```

---

## 📊 **What Gets Checked**

The hook validates:

✅ Root directory (`/`)  
✅ Package roots (`packages/*/`)  
✅ Only `.md` files (skips config files)  
✅ Allows `README.md`, `CHANGELOG.md`, `LICENSE.md`  

---

## 🎯 **Benefits**

### **For You:**
- Clean repository
- No manual checking
- Instant feedback
- Clear fix suggestions

### **For Team:**
- Consistent structure
- No root clutter
- Easy onboarding
- Self-documenting

### **For AI (Windsurf/Cascade):**
- Clear placement rules
- Automatic enforcement
- Impossible to violate
- No confusion

---

## 🔄 **How It Self-Installs**

1. **On `pnpm install`:**
   - Runs `postinstall` script
   - Executes `scripts/setup-hooks.sh`
   - Creates `.git/hooks/pre-commit`
   - Makes it executable

2. **On Every Clone:**
   - New team members run `pnpm install`
   - Hook automatically installs
   - Zero manual setup

3. **On Hook Updates:**
   - Run `pnpm setup:hooks`
   - Hook updates to latest version

---

## 📖 **Related Documentation**

- `.cascade/DOC_PLACEMENT_RULES.md` - Complete rules
- `docs/DOCS_QUICK_REFERENCE.md` - Quick decision tree
- `docs/README.md` - Documentation structure

---

## ✅ **Status**

**Current State:** ✅ Fully Automated

- Hook: ✅ Installed
- Validation: ✅ Working
- Auto-install: ✅ Enabled
- Bypass: ✅ Available

---

**Set it and forget it. Your repo stays clean automatically.** 🎉
