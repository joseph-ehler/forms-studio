# Architecture Roadmap - Current State → Future Scale

**Last Updated:** 2025-10-23  
**Status:** Phase 2 Complete → Phase 3 Ready

## Executive Summary

**Where We Are:** Production-ready monorepo with god-tier hygiene enforcement  
**Where We're Going:** Multi-tenant SaaS platform with white-label capabilities  
**Gap:** Package boundaries, advanced fields, theming infrastructure

## Current Architecture (Phase 2 Complete)

### Package Structure

```
@intstudio/forms-studio/              (monorepo root)
├── @intstudio/ds                     ✅ Standalone design system
│   ├── primitives (Button, Stack, FormLabel)
│   ├── patterns (FormStack, FormGrid)
│   ├── shell (AppShell, Navigation)
│   ├── a11y (accessibility utils)
│   ├── white-label (theme/brand infrastructure)
│   └── utils (hooks, helpers)
│
├── @intstudio/forms                  ⚠️ MIXED - needs split
│   ├── field registry                (business logic - keep)
│   ├── form renderer                 (business logic - keep)
│   ├── validation pipeline           (business logic - keep)
│   └── composite fields              (⚡ should be in DS)
│
├── @intstudio/core                   ✅ Headless utilities
│   └── data structures, parsers, validators
│
└── @intstudio/demo-app               ✅ Example application
    └── Storybook, smoke tests
```

### What's Working Perfectly

**1. Design System (@intstudio/ds)**
- ✅ Standalone (no deps on forms/core)
- ✅ Public API locked (barrel exports only)
- ✅ Sub-barrels for tree-shaking
- ✅ Token codegen pipeline
- ✅ API Extractor tracking changes
- ✅ Type snapshot tests
- ✅ Bundle budgets enforced

**2. Import Hygiene**
- ✅ Deep imports impossible (8 surgical exceptions)
- ✅ Barrel exports auto-generated
- ✅ Import Doctor with auto-fix
- ✅ ESLint enforcement
- ✅ Danger PR automation

**3. Quality Infrastructure**
- ✅ Nightly sweeper (Knip, ts-prune, Madge, linkinator)
- ✅ Performance budgets (CSS 25KB, JS 50KB)
- ✅ Codemod pipeline for migrations
- ✅ Deprecation system with aliases
- ✅ CI enforcement on all PRs

### What Needs Evolution

**1. Package Boundaries** ⚠️
**Problem:** Forms package mixes business logic + UI components

**Current State:**
```
@intstudio/forms/
├── renderer/          (✅ business logic - belongs here)
├── validation/        (✅ business logic - belongs here)  
├── registry/          (✅ business logic - belongs here)
└── fields/composite/  (❌ UI components - should be in DS)
```

**Desired State:**
```
@intstudio/ds/
└── fields/            (ALL field components)
    ├── primitive/     (Text, Number, Select)
    └── composite/     (Address, Phone, Matrix, Table)

@intstudio/forms/
├── renderer/          (Form runtime)
├── validation/        (Schema validation)
└── registry/          (Field registry)
```

**Why:** UI components should live in the design system, not business logic package

**2. Compat Shims** ⚠️
**Problem:** `lib/` and `compat/` folders contain legacy re-exports

**Files to Remove:**
- `packages/ds/src/lib/*` - Old util shims
- `packages/ds/src/compat/*` - Old component aliases

**Migration Path:** Create codemods, deprecate, remove

**3. White-Label Infrastructure** 🚧
**Problem:** Multi-tenant theming exists but not wired to runtime

**Current State:**
- ✅ Token system supports theming
- ✅ Brand switching API exists (`applyBrand.ts`)
- ⚠️ Semantic tokens defined but orphaned
- ❌ No runtime brand resolver
- ❌ No tenant-to-brand mapping

**Needed:**
- Tenant provider component
- Runtime CSS variable injection
- Brand presets (Acme, TechCorp, etc.)
- Theme switcher UI

## Target Architecture (Phase 3+)

### Package Boundaries (Clean Separation)

```
┌─────────────────────────────────────────────────────────┐
│  @intstudio/ds (Design System)                         │
│  • All UI components (primitives + composites)         │
│  • Visual design tokens                                 │
│  • White-label theming                                  │
│  • Accessibility utilities                              │
│  • NO business logic                                    │
│  • NO dependencies on forms/core                        │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │ imports (visual components only)
                          │
┌─────────────────────────────────────────────────────────┐
│  @intstudio/forms (Form Runtime)                       │
│  • Form renderer (headless)                            │
│  • Field registry (map field types to components)      │
│  • Validation pipeline (Zod/JSON Schema)               │
│  • Form state management                               │
│  • Depends on: DS (for UI), Core (for utils)           │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │ imports (both)
                          │
┌─────────────────────────────────────────────────────────┐
│  @intstudio/core (Utilities)                           │
│  • Data structures                                      │
│  • Parsers, formatters                                  │
│  • Headless validators                                  │
│  • NO UI, NO React                                      │
└─────────────────────────────────────────────────────────┘
```

### Dependency Rules (Enforced)

```
✅ ALLOWED:
Forms → DS (for UI components)
Forms → Core (for utilities)
DS → Core (for utilities)
Demo → DS + Forms + Core

❌ FORBIDDEN:
DS → Forms (keeps DS standalone)
DS → Demo (no circular deps)
Core → DS (keeps Core headless)
Core → Forms (keeps Core headless)
```

### Multi-Tenant Theming Architecture

**Layer 1: Design Tokens (Base)**
```typescript
// Token sources (single source of truth)
packages/ds/src/tokens/
├── colors.ts              (primitive palette)
├── color.semantic.ts      (semantic roles)
├── spacing.ts
├── typography.ts
└── brand-presets.ts       (tenant overrides)

// Codegen output
packages/ds/src/generated/
├── tokens.css             (CSS variables)
└── tokens.types.ts        (TypeScript types)
```

**Layer 2: Runtime Brand Resolver**
```typescript
// Tenant-to-brand mapping
<TenantProvider tenantId="acme">
  <ThemeProvider brand="acme" mode="light">
    <App />
  </ThemeProvider>
</TenantProvider>

// Auto-applies:
// <html data-brand="acme" data-theme="light">
```

**Layer 3: CSS Variable Cascade**
```css
/* Base tokens */
:root {
  --ds-color-primary: rgb(59, 130, 246);
}

/* Brand overrides */
[data-brand="acme"] {
  --ds-color-primary: rgb(220, 38, 38); /* Acme red */
}

/* Theme variants */
[data-theme="dark"] {
  --ds-color-bg: rgb(17, 24, 39);
}
```

### Advanced Field Types (Phase 3)

**Current Fields (22 types):**
- ✅ Primitive: Text, Number, Email, Select, Radio, Checkbox
- ✅ Date/Time: Date, Time, DateTime, DateRange
- ✅ Composite: Address, Phone, Currency
- ⚠️ Parked: Matrix, Table, Rank, NPS

**New Advanced Fields:**
```
packages/ds/src/fields/
├── primitive/          (existing - simple inputs)
│   └── TextField, NumberField, etc.
│
├── composite/          (existing - structured data)
│   └── AddressField, PhoneField, etc.
│
└── advanced/           (NEW - complex interactions)
    ├── MatrixField     (grid of radio/checkbox)
    ├── TableField      (dynamic rows + columns)
    ├── RankField       (drag-drop ordering)
    ├── NPSField        (0-10 scale + comment)
    ├── SignatureField  (canvas capture)
    └── FileUploadField (multi-file with preview)
```

### Data Flow Architecture

```
User Input
    ↓
Field Component (DS)
    ↓ onChange
Form Renderer (Forms)
    ↓ validate
Validation Pipeline (Forms)
    ↓ schema check
Field Registry (Forms)
    ↓ serialize
Data Submission
```

## Migration Path (Phase 2 → Phase 3)

### Step 1: Move Composite Fields to DS ⚡ HIGH PRIORITY

**Why First:** Establishes clean package boundary

**Migration:**
```bash
# 1. Move files
mv packages/forms/src/fields/composite/* \
   packages/ds/src/fields/composite/

# 2. Update imports (codemod)
pnpm codemod fields-to-ds

# 3. Update barrel exports
pnpm barrels

# 4. Verify
pnpm guard
pnpm -w build
```

**Impact:**
- DS becomes complete UI package
- Forms becomes pure business logic
- Cleaner mental model

### Step 2: Remove Compat Shims

**Files to Delete:**
- `packages/ds/src/lib/*`
- `packages/ds/src/compat/*`

**Migration:**
```bash
# 1. Add temp redirects in repo.imports.yaml
map:
  "^../lib/(.*)": "@intstudio/ds/utils"

# 2. Run auto-fix
pnpm imports:fix

# 3. Remove redirects + shim folders
# 4. Create changeset (breaking change)
```

**Impact:**
- -500 lines of legacy code
- Cleaner package structure
- One canonical path for every export

### Step 3: Wire Multi-Tenant Theming

**Components to Build:**
1. `<TenantProvider>` - Maps tenant ID to brand
2. `<ThemeProvider>` - Applies brand + mode
3. Brand presets - Acme, TechCorp, Sunset
4. Theme switcher UI component

**Migration:**
```typescript
// Before
<App />

// After
<TenantProvider tenantId={session.tenantId}>
  <ThemeProvider mode={userPreference}>
    <App />
  </ThemeProvider>
</TenantProvider>
```

**Impact:**
- SaaS-ready white labeling
- Per-tenant branding
- Instant theme switching

### Step 4: Advanced Field Types

**Priority Order:**
1. MatrixField (common in surveys)
2. TableField (dynamic data entry)
3. RankField (ordering tasks)
4. NPSField (feedback scores)

**Each Field Gets:**
- Primitive component (DS)
- Validation schema (Forms)
- Registry entry (Forms)
- Storybook stories (Demo)
- Smoke tests (Playwright)

## Scaling Targets

### Performance

**Current:**
- CSS: <25KB (enforced)
- JS: <50KB (enforced)
- No chunking strategy

**Phase 3:**
- Per-route code splitting
- Field types lazy-loaded
- CSS critical path optimization
- Target: <10KB initial load

### Multi-Tenancy

**Current:**
- Token system supports theming
- No runtime resolver
- No tenant isolation

**Phase 3:**
- Tenant provider with context
- Per-tenant brand overrides
- Tenant-scoped data (future)
- A/B testing per tenant (future)

### Developer Experience

**Current:**
- Generators for ADRs, primitives
- Codemods for breaking changes
- Auto-fix for imports

**Phase 3:**
- Field generator (all boilerplate)
- Visual field editor (Storybook addon)
- Live theme previewer
- Migration dashboard

## Success Metrics

### Architecture Quality

**Current (Phase 2):**
- ✅ Package boundaries: 90% clean (compat shims remain)
- ✅ Import hygiene: 100% enforced
- ✅ Circular dependencies: 0
- ✅ API stability: Tracked + enforced

**Phase 3 Targets:**
- ✅ Package boundaries: 100% clean (no shims)
- ✅ Field types: 30+ (from current 22)
- ✅ Multi-tenant ready: Yes
- ✅ White-label capable: Yes

### Performance

**Current:**
- Bundle size: Within budget
- No lazy loading
- No route splitting

**Phase 3 Targets:**
- Initial load: <10KB
- Field lazy load: <5KB per type
- Route chunking: Yes
- Tree-shaking: 100%

### Developer Velocity

**Current:**
- New field: ~4 hours (manual)
- Breaking change migration: <5 min (codemod)
- API change detection: Automated

**Phase 3 Targets:**
- New field: <30 min (generator)
- Theme creation: <10 min (preset template)
- Zero-effort migrations (auto-apply)

## Risk Assessment

### High Risk (Address First)

**1. Composite Fields Migration**
- **Risk:** Breaking existing forms
- **Mitigation:** Comprehensive codemods + deprecation period
- **Timeline:** 1-2 weeks

**2. Compat Shim Removal**
- **Risk:** Undiscovered usage
- **Mitigation:** Grep for all usage, create redirects first
- **Timeline:** 1 week

### Medium Risk

**3. Multi-Tenant Theming**
- **Risk:** Performance impact from CSS variable cascade
- **Mitigation:** Measure with Lighthouse, limit override scope
- **Timeline:** 2-3 weeks

### Low Risk

**4. Advanced Field Types**
- **Risk:** Low (additive, not breaking)
- **Mitigation:** Feature flags, progressive rollout
- **Timeline:** Ongoing

## Decision Points

### Before Starting Phase 3

**✅ Confirmed:**
- Package structure (DS = UI, Forms = logic)
- Import hygiene (barrels only)
- Quality gates (CI enforcement)

**❓ To Decide:**
1. **Composite fields migration:** Big bang or gradual?
2. **Theme switching:** Client-side or server-side first render?
3. **Field lazy loading:** Route-based or on-demand?
4. **Compat deprecation:** 1 month or 3 months notice?

### Recommended Decisions

**1. Composite Fields:** Gradual (one codemod, but keep redirects for 1 release)  
**2. Theme Switching:** Server-side first (avoid FOUC), hydrate client  
**3. Field Lazy Loading:** On-demand (registry can async import)  
**4. Compat Deprecation:** 1 month (internal project, can move fast)

## Next Actions (Phase 3 Kickoff)

1. **Tag stable baseline** - Current commit as v2.0.0
2. **Create migration changeset** - Composite fields to DS
3. **Build field generator** - Scaffold new fields in <30 min
4. **Wire tenant provider** - Multi-tenant infrastructure
5. **Revive parked fields** - Matrix, Table, Rank, NPS

---

**TL;DR:**

**Current:** Production-ready monorepo, god-tier hygiene, clean DS  
**Gap:** Mixed package boundaries, unused compat shims, unwired theming  
**Target:** Pure package separation, multi-tenant SaaS, 30+ field types  
**Path:** Codemods for migration, generators for velocity, infrastructure for scale
