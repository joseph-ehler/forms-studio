# Documentation Quick Reference

**Where do I put this document?**

## Quick Decision Tree

```
📄 Need to create a doc?
│
├─ Architecture decision?
│  └─ docs/adr/YYYY-MM-DD-title.md
│
├─ Session summary?
│  └─ docs/sessions/SESSION_YYYY-MM-DD.md
│
├─ User guide or tutorial?
│  └─ docs/guides/guide-name.md
│
├─ AI work plan or progress?
│  └─ .cascade/work-plans/plan-name.md
│  └─ .cascade/sessions/session-YYYY-MM-DD.md
│
├─ Package-specific (DS)?
│  └─ packages/ds/docs/doc-name.md
│
├─ Package-specific (Core)?
│  └─ packages/core/docs/doc-name.md
│
└─ Package-specific (UI Bridge)?
   └─ packages/ui-bridge/docs/doc-name.md
```

## Validation

Before committing:
```bash
pnpm validate:docs
```

## Full Rules

See `.cascade/DOC_PLACEMENT_RULES.md` for complete documentation placement rules.

---

**Remember: NEVER create markdown files in root directories!**
