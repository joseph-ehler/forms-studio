# Phase 3: Architectural Evolution - Kickoff

**Start Date:** 2025-10-23  
**Status:** 🚀 IN PROGRESS

## Overview

Phase 3 focuses on architectural cleanup and feature enhancement to prepare for multi-tenant SaaS scale.

## Goals

1. ✅ **Clean Package Boundaries** - Move composite fields to DS
2. ✅ **Remove Legacy Code** - Delete compat shims
3. ✅ **Multi-Tenant Theming** - Wire runtime brand switching
4. ✅ **Advanced Fields** - Build Matrix, Table, Rank, NPS

---

## Phase 3 Roadmap

### Step 1: Package Boundary Cleanup (Week 1)

**Current Problem:**
```
@intstudio/forms/
├── renderer/          ✅ Business logic (correct)
├── validation/        ✅ Business logic (correct)
├── registry/          ✅ Business logic (correct)
└── fields/composite/  ❌ UI components (WRONG PACKAGE!)
```

**Target State:**
```
@intstudio/ds/
└── fields/            ✅ ALL field components
    ├── primitive/     (Text, Number, Select)
    └── composite/     (Address, Phone, Currency)

@intstudio/forms/
├── renderer/          ✅ Form runtime
├── validation/        ✅ Schema validation
└── registry/          ✅ Field registry
```

**Tasks:**
- [x] Audit current field locations
- [ ] Create migration codemod
- [ ] Move composite fields to DS
- [ ] Update imports across codebase
- [ ] Update field registry
- [ ] Verify all forms still work

---

### Step 2: Remove Compat Shims (Week 1)

**Files to Remove:**
```
packages/ds/src/lib/*        (old util shims)
packages/ds/src/compat/*     (old component aliases)
```

**Migration Path:**
1. Create codemod for each shim
2. Add deprecation warnings
3. Run codemod across codebase
4. Delete shim files
5. Create changeset

**Impact:** -500 lines of legacy code

---

### Step 3: Multi-Tenant Theming (Week 2)

**Current State:**
- ✅ Token system supports theming
- ✅ Brand switching API exists (`applyBrand.ts`)
- ⚠️ Semantic tokens defined but orphaned
- ❌ No runtime brand resolver
- ❌ No tenant-to-brand mapping

**Components to Build:**
1. `<TenantProvider>` - Maps tenant ID to brand
2. `<ThemeProvider>` - Applies brand + mode
3. Brand presets - Acme, TechCorp, Sunset
4. Theme switcher UI component

**Usage:**
```tsx
<TenantProvider tenantId={session.tenantId}>
  <ThemeProvider mode={userPreference}>
    <App />
  </ThemeProvider>
</TenantProvider>
```

**Result:** SaaS-ready white labeling

---

### Step 4: Advanced Field Types (Week 3-4)

**New Fields to Build:**

#### 1. MatrixField
- Grid of radio/checkbox inputs
- Row/column labels
- Single/multiple selection
- Common in surveys

#### 2. TableField
- Dynamic rows + columns
- Add/remove rows
- Cell-level validation
- Spreadsheet-like UX

#### 3. RankField
- Drag-drop ordering
- Visual feedback
- Touch-friendly
- Accessibility (keyboard ordering)

#### 4. NPSField
- 0-10 scale
- Optional comment
- Visual styling
- Analytics-friendly

**Each Field Gets:**
- ✅ Primitive component (DS)
- ✅ Validation schema (Forms)
- ✅ Registry entry (Forms)
- ✅ Storybook story (Demo)
- ✅ Smoke test (Playwright)

---

## Success Metrics

### Package Boundaries
- **Before:** Mixed UI/logic in forms package
- **After:** Clean separation (DS = UI, Forms = logic)
- **Metric:** 0 UI components in forms package

### Legacy Code
- **Before:** 500+ lines of compat shims
- **After:** 0 lines of shims
- **Metric:** -500 LOC

### Multi-Tenant
- **Before:** No runtime brand switching
- **After:** Per-tenant branding working
- **Metric:** Theme switcher component functional

### Field Types
- **Before:** 22 field types
- **After:** 26+ field types
- **Metric:** 4+ new advanced fields

---

## Risk Mitigation

### Breaking Changes
- ✅ Codemods for all migrations
- ✅ Deprecation warnings first
- ✅ Changeset with migration guide
- ✅ API Extractor tracks changes

### Testing
- ✅ Playwright smoke tests
- ✅ Visual regression tests
- ✅ Field registry validation
- ✅ Manual QA of all forms

### Rollback Plan
- ✅ Git tags before each step
- ✅ Compat shims stay 1 release
- ✅ Feature flags for new fields
- ✅ Can revert individual changes

---

## Timeline

**Week 1 (Days 1-7):**
- Day 1-2: Audit + plan composite field migration
- Day 3-4: Create codemod + migrate fields
- Day 5-6: Remove compat shims
- Day 7: Verify + test

**Week 2 (Days 8-14):**
- Day 8-9: Build TenantProvider + ThemeProvider
- Day 10-11: Create brand presets
- Day 12-13: Build theme switcher UI
- Day 14: Integration testing

**Week 3-4 (Days 15-28):**
- Day 15-18: MatrixField + TableField
- Day 19-22: RankField + NPSField
- Day 23-25: Storybook stories + tests
- Day 26-28: Documentation + polish

---

## Decision Points

### Before Starting

**1. Composite Fields Migration:**
- ❓ Big bang or gradual?
- **Recommendation:** One codemod, but keep redirects for 1 release

**2. Theme Switching:**
- ❓ Client-side or server-side first render?
- **Recommendation:** Server-side first (avoid FOUC), hydrate client

**3. Field Lazy Loading:**
- ❓ Route-based or on-demand?
- **Recommendation:** On-demand (registry can async import)

**4. Compat Deprecation:**
- ❓ 1 month or 3 months notice?
- **Recommendation:** 1 month (internal project, can move fast)

---

## Next Actions

### Immediate (Today)
1. Audit composite field locations
2. Create field migration codemod skeleton
3. Tag stable baseline (v2.0.0)

### This Week
1. Move composite fields to DS
2. Update all imports
3. Remove compat shims
4. Create changesets

### Next Week
1. Build tenant/theme providers
2. Create brand presets
3. Wire theming infrastructure

---

## Files to Create

**Week 1:**
- `scripts/codemods/composite-fields-to-ds.mjs`
- `scripts/codemods/remove-compat-shims.mjs`
- `.changeset/composite-fields-migration.md`
- `.changeset/remove-compat-shims.md`

**Week 2:**
- `packages/ds/src/white-label/TenantProvider.tsx`
- `packages/ds/src/white-label/ThemeProvider.tsx`
- `packages/ds/src/white-label/brand-presets.ts`
- `packages/ds/src/white-label/ThemeSwitcher.tsx`

**Week 3-4:**
- `packages/ds/src/fields/advanced/MatrixField.tsx`
- `packages/ds/src/fields/advanced/TableField.tsx`
- `packages/ds/src/fields/advanced/RankField.tsx`
- `packages/ds/src/fields/advanced/NPSField.tsx`

---

## Ready to Start?

**Phase 2 Achievements:**
- ✅ 100% autonomous housekeeping
- ✅ God-tier repo hygiene (0 errors, 0 warnings)
- ✅ 300+ files organized
- ✅ Pristine root directories
- ✅ Strict enforcement in place

**Phase 3 Starting Point:**
- ✅ Clean baseline
- ✅ All tools green
- ✅ Documentation complete
- ✅ Ready for architectural evolution

**Let's build the future! 🚀**

---

## Current Status

**What to tackle first?**

1. **Composite Fields Migration** (architectural cleanup)
2. **Multi-Tenant Theming** (new capability)
3. **Advanced Fields** (feature expansion)
4. **All in sequence** (recommended)

**Your choice - where should we start?**
