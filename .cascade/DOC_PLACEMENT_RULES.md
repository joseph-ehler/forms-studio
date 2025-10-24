# Documentation Placement Rules

**STATUS:** ✅ **MANDATORY - STRICTLY ENFORCED**

---

## 🚨 **CRITICAL RULE**

**NEVER create documentation files in root directories!**

### ❌ Forbidden Locations

```
❌ / (repository root)
❌ packages/ds/ (package root)
❌ packages/core/ (package root)
❌ packages/ui-bridge/ (package root)
❌ Any package root directory
```

**Why:** Root clutter makes repos unmaintainable. We had 200+ files in root before cleanup.

---

## ✅ **ALWAYS Write Docs Here**

### 1. **Monorepo-Level Documentation**

```
docs/
├── adr/                    # Architecture Decision Records
│   └── YYYY-MM-DD-title.md
├── guides/                 # User guides
│   └── guide-name.md
├── sessions/               # Session summaries
│   └── SESSION_YYYY-MM-DD.md
└── architecture/           # System architecture
    └── system-name.md
```

**Use for:**
- Architecture decisions
- System-wide guides
- Session summaries
- Cross-package documentation

### 2. **AI Working Directory**

```
.cascade/
├── sessions/               # AI session notes
│   └── session-YYYY-MM-DD.md
├── work-plans/             # Current work plans
│   └── plan-name.md
└── progress/               # Progress tracking
    └── feature-name.md
```

**Use for:**
- Session notes
- Work-in-progress plans
- Progress tracking
- Temporary AI context

### 3. **Package-Specific Documentation**

```
packages/ds/docs/           # DS-specific docs
packages/core/docs/         # Core-specific docs
packages/ui-bridge/docs/    # UI bridge-specific docs
```

**Use for:**
- Package API documentation
- Package-specific guides
- Component patterns (for that package only)

---

## 📝 **File Naming Conventions**

### ADRs (Architecture Decision Records)
```
docs/adr/YYYY-MM-DD-descriptive-title.md
Example: docs/adr/2025-10-24-pivot-to-flowbite.md
```

### Session Summaries
```
docs/sessions/SESSION_YYYY-MM-DD.md
Example: docs/sessions/SESSION_2025-10-24.md
```

### Guides
```
docs/guides/descriptive-name.md
Example: docs/guides/getting-started.md
```

### AI Work Plans
```
.cascade/work-plans/feature-name.md
Example: .cascade/work-plans/auth-system.md
```

---

## 🤖 **Windsurf/Cascade Instructions**

### Before Creating ANY Documentation File:

1. **Check location:**
   - Am I in a root directory? → ❌ STOP
   - Am I in an allowed subdirectory? → ✅ OK

2. **Choose correct location:**
   - Architecture decision? → `docs/adr/`
   - Session summary? → `docs/sessions/` or `.cascade/sessions/`
   - User guide? → `docs/guides/`
   - Work plan? → `.cascade/work-plans/`
   - Package-specific? → `packages/*/docs/`

3. **Use correct naming:**
   - ADR: `YYYY-MM-DD-title.md`
   - Session: `SESSION_YYYY-MM-DD.md`
   - Guide: `descriptive-name.md`

### If User Asks for a Document:

```
✅ CORRECT:
"I'll create this in docs/guides/auth-setup.md"

❌ INCORRECT:
"I'll create AUTH_SETUP.md in the root"
```

### If You're Unsure:

**Ask the user:**
> "Should I create this in `docs/guides/` or `.cascade/work-plans/`?"

**Never assume root is OK!**

---

## 🛡️ **Enforcement**

### Validation Script

Run before committing:
```bash
pnpm validate:docs
```

This checks:
- ✅ No `*.md` files in roots
- ✅ All docs in approved subdirectories
- ✅ Correct naming conventions

### Git Hooks (Optional)

Pre-commit hook blocks root docs:
```bash
# In .husky/pre-commit (if enabled)
pnpm validate:docs || exit 1
```

---

## 📊 **Examples**

### ✅ Good Placement

```
✅ docs/adr/2025-10-24-use-flowbite.md
✅ docs/guides/quick-start.md
✅ docs/sessions/SESSION_2025-10-24.md
✅ .cascade/work-plans/auth-feature.md
✅ packages/ds/docs/routes-guide.md
```

### ❌ Bad Placement

```
❌ /ARCHITECTURE.md                    → Use docs/architecture/
❌ /SESSION_SUMMARY.md                 → Use docs/sessions/
❌ packages/ds/OVERLAY_GUIDE.md        → Use packages/ds/docs/
❌ /WORK_PLAN.md                       → Use .cascade/work-plans/
❌ packages/ui-bridge/FORMS.md         → Use packages/ui-bridge/docs/
```

---

## 🎯 **Quick Decision Tree**

```
Need to create a doc?
│
├─ Is it an architecture decision?
│  └─ YES → docs/adr/YYYY-MM-DD-title.md
│
├─ Is it a session summary?
│  └─ YES → docs/sessions/SESSION_YYYY-MM-DD.md
│
├─ Is it a work-in-progress plan?
│  └─ YES → .cascade/work-plans/feature-name.md
│
├─ Is it a user guide?
│  └─ YES → docs/guides/guide-name.md
│
└─ Is it package-specific?
   └─ YES → packages/PACKAGE/docs/doc-name.md
```

---

## 💡 **Remember**

- **Root directories are sacred**
- **Package roots are sacred**
- **Always use subdirectories**
- **When in doubt, ask the user**
- **Never assume root is OK**

---

**This rule prevents the 200+ file chaos we just cleaned up. Follow it strictly.**
