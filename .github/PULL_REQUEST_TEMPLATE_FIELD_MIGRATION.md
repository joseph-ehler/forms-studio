# Field Migration - Batch [N]

## 📊 Summary

**Fields Migrated:** [X] fields  
**Time:** [X] minutes  
**Progress:** [Before]% → [After]%  
**Status:** ✅ All builds green

---

## 🎯 Fields

| Field | Type | LOC | Status |
|-------|------|-----|--------|
| [FieldName] | [type/custom] | [~XX] | ✅ |
| [FieldName] | [type/custom] | [~XX] | ✅ |
| [FieldName] | [type/custom] | [~XX] | ✅ |

---

## ✅ Quality Gates

- [ ] Forms build: GREEN
- [ ] DS build: GREEN
- [ ] Canonical checks: PASSING
- [ ] Import boundaries: Clean (no DS internals)
- [ ] Pattern compliance: 100%
- [ ] ARIA attributes: Present
- [ ] Façades tracked in `docs/COMPAT_FACADES.md`
- [ ] All fields: ~80-120 lines

---

## 📦 Changes

### Forms Package
- Added [X] new field components
- All follow simplified `FieldComponentProps` pattern
- Build size: [XX]KB (was [XX]KB)

### DS Package
- Added [X] compatibility façades
- All with `@deprecated` warnings
- Removal planned: v2.0.0
- Build size: [XX]KB (was [XX]KB)

### Documentation
- Updated `docs/COMPAT_FACADES.md`
- [Optional] Added Field Lab stories
- [Optional] Created Batch [N] completion doc

---

## 🔍 API Surface Changes

Run API extract to verify:

```bash
pnpm -F @intstudio/forms api:extract
pnpm -F @intstudio/ds api:extract
```

**Forms API changes:** [Review dist/api-report.md]  
**DS API changes:** [Review dist/api-report.md]

---

## 🎨 Visual QA (Optional)

**Field Lab stories:** [Yes/No]  
**Axe accessibility scan:** [Pass/Pending]  
**Screenshots:** [Attach if helpful]

---

## 📝 Deprecation Plan

All façades tracked in [`docs/COMPAT_FACADES.md`](../docs/COMPAT_FACADES.md).

**Removal date:** v2.0.0  
**Codemod:** `pnpm codemod:fields` (to be created)  
**ESLint rule:** Enforce after removal (planned)

---

## 🚀 Next Steps

- [ ] Merge this PR
- [ ] Tag release: `forms-migration-batch-[N]`
- [ ] [Optional] Create changeset for release notes
- [ ] [Optional] Update README progress badge
- [ ] Plan Batch [N+1]

---

## 📊 Overall Progress

```
Total Fields: 22
Migrated: [X]/22 ([X]%)
Remaining: [X]/22 ([X]%)

Progress: [Progress bar visualization]
```

---

## 🎓 Notes

[Any learnings, gotchas, or improvements discovered during this batch]

---

**Review checklist:**
- [ ] Code follows NumberField pattern
- [ ] Builds pass locally
- [ ] CI passes (when pushed)
- [ ] Deprecation warnings present
- [ ] Removal tracking updated
