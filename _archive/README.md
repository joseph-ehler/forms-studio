# Archived Components

**Date:** 2025-10-24  
**Reason:** Pivoted to Flowbite for velocity (see ADR: `docs/adr/2025-10-24-pivot-to-flowbite.md`)

---

## 📦 **What's Archived**

### `/factory` (from `scripts/factory/`)
**Field generator system:**
- Spec → component pipeline
- Generator modules (InputGenerator, SelectGenerator, etc.)
- Template system
- Not deleted, just archived for reference

### `/refiner` (from `scripts/refiner/`)
**AST-based field refinement:**
- Quality automation
- Enforce DS primitives
- ARIA validation
- Token enforcement
- Replaced by simpler ESLint rules

### `/forms-factory` (from `packages/forms/src/factory/`)
**Factory infrastructure:**
- `/recipes/` - Field recipes (TextField, SelectField, CheckboxField, etc.)
- `/overlays/` - Default overlay configurations
- `/generator/` - Code generation logic
- Recipe system for systematic field generation
- Replaced by Flowbite components + UI bridge

---

## 🔄 **Rollback Instructions**

If you need to restore the factory:

### **Step 1: Restore Files**

```bash
# Restore factory directories
mv _archive/factory scripts/
mv _archive/refiner scripts/
mv _archive/forms-factory packages/forms/src/factory

# Or use git to go back to baseline
git checkout pivot-baseline-2025-10-24
```

### **Step 2: Uninstall Flowbite**

```bash
pnpm remove flowbite flowbite-react tailwindcss postcss autoprefixer
rm tailwind.config.js postcss.config.js
rm -rf packages/ui-bridge
```

### **Step 3: Rebuild**

```bash
pnpm install
pnpm build
```

### **Step 4: Restore Pre-commit Hooks**

Re-enable strict hooks if they were disabled for the pivot.

---

## 💡 **Why Archived (Not Deleted)**

**Reasons to keep:**
1. **Reference** - Patterns and learnings are valuable
2. **Rollback** - Safety net if Flowbite doesn't work out
3. **Learning** - Understanding the factory approach
4. **Extraction** - May extract useful utilities later
5. **Documentation** - Shows evolution of thinking

---

## 📊 **What Was Lost vs. Gained**

### **Lost (Factory Benefits)**
- ❌ Systematic field refinement (batch improvements)
- ❌ Spec → component pipeline (deterministic generation)
- ❌ Recipe system (shared patterns)
- ❌ Automated quality enforcement (refiner)

### **Gained (Flowbite Benefits)**
- ✅ 10x faster iteration (build forms in minutes)
- ✅ Battle-tested components (accessibility built-in)
- ✅ Flexibility (bespoke when needed, no fighting)
- ✅ 90% less maintenance (10 files vs. hundreds)
- ✅ AI-friendly (AI generates Flowbite instantly)

---

## 🎯 **Decision Rationale**

**Problem:** Building a forms factory before building the platform  
**Reality:** Need to build platforms quickly (platform for platforms)  
**Solution:** Use Flowbite for speed, keep high-value parts (route shells, tokens, hooks)

**Trade-off:** Speed > perfection for this use case

See full context in:
- **ADR:** `docs/adr/2025-10-24-pivot-to-flowbite.md`
- **Migration Plan:** `docs/FLOWBITE_MIGRATION.md`

---

## 🔍 **Archive Contents Summary**

```
_archive/
├── factory/                    # Field generator (scripts/factory/)
│   ├── InputGenerator.ts
│   ├── SelectGenerator.ts
│   └── ...
├── refiner/                    # AST refinement (scripts/refiner/)
│   ├── enforce-primitives.ts
│   ├── ensure-aria.ts
│   └── ...
└── forms-factory/              # Forms infrastructure (packages/forms/src/factory/)
    ├── recipes/
    │   ├── TextField/
    │   ├── SelectField/
    │   └── ...
    ├── overlays/
    └── generator/
```

---

## 📚 **Learning Resources**

**If you want to study the factory approach:**
- Review code in `_archive/factory/` and `_archive/forms-factory/`
- See `docs/adr/` for historical architecture decisions
- Check git history: `git log --all --oneline --grep="factory"`

**If you want to understand the pivot:**
- Read `docs/adr/2025-10-24-pivot-to-flowbite.md`
- Read `docs/FLOWBITE_MIGRATION.md`
- Compare: git diff pivot-baseline-2025-10-24 HEAD

---

**Status:** ✅ Archived safely - can rollback anytime via git tag `pivot-baseline-2025-10-24`
