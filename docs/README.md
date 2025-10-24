# Documentation Structure

**CRITICAL RULE:** Never create files in repository root or package roots!

## Where to Write Docs

### `/docs/` (Monorepo-Level Documentation)

```
docs/
├── adr/                    # Architecture Decision Records
│   └── YYYY-MM-DD-title.md
├── guides/                 # User guides & tutorials
│   └── guide-name.md
├── sessions/               # Session summaries
│   └── SESSION_YYYY-MM-DD.md
└── architecture/           # Architecture documentation
    └── system-name.md
```

### `/.cascade/` (AI/Windsurf Working Files)

```
.cascade/
├── sessions/               # AI session notes
│   └── session-YYYY-MM-DD.md
├── work-plans/             # Current work plans
│   └── plan-name.md
└── progress/               # Progress tracking
    └── feature-name.md
```

### Package-Level Docs

```
packages/ds/docs/           # DS-specific documentation
packages/core/docs/         # Core-specific documentation
packages/ui-bridge/docs/    # UI bridge-specific documentation
```

## ❌ NEVER Write Here

- ❌ Repository root (`/`)
- ❌ Package roots (`packages/*/`)
- ❌ Any `*.md` in root directories

## ✅ Always Write Here

- ✅ `docs/` subdirectories
- ✅ `.cascade/` subdirectories
- ✅ `packages/*/docs/` subdirectories

---

**Enforcement:** Run `pnpm validate:docs` before committing.
