# 🚀 Phase 3: Forms Extraction - STARTED!

**Date:** Oct 23, 2025  
**Status:** 🟢 Scaffold Complete - Ready for Migration  
**Next Session:** Field migration + tooling integration

---

## ✅ What We Just Built (30 Minutes)

### 1. Package Scaffold Created

**Location:** `packages/forms/`

**Structure:**
```
packages/forms/
├── package.json          ✅ CREATED
├── tsconfig.json         ✅ CREATED
├── README.md             ✅ CREATED
└── src/
    ├── form-core/        ✅ Types defined
    │   ├── index.ts
    │   └── types.ts
    ├── fields/           ✅ Ready for migration
    │   └── index.ts
    ├── composites/       ✅ Ready for migration
    │   └── index.ts
    ├── renderer/         ✅ Placeholder
    │   └── index.ts
    ├── adapters/         ✅ Placeholder
    │   └── index.ts
    └── index.ts          ✅ Main barrel
```

---

### 2. Package Configuration

**`package.json`** highlights:
- ✅ Name: `@intstudio/forms`
- ✅ Dependencies: `@intstudio/ds`, `@intstudio/core`, `react-hook-form`, `zod`
- ✅ Exports: Main + subpath exports (fields, composites, form-core, renderer)
- ✅ Scripts: build, dev, typecheck, test
- ✅ Registered in workspace (`pnpm install` completed)

---

### 3. Type Foundation

**`src/form-core/types.ts`** defines:
- ✅ `FieldConfig` - Base field configuration
- ✅ `FormSchema` - Zod schema wrapper
- ✅ `FormInstance` - react-hook-form integration
- ✅ `FieldProps` - Standard field component props

---

## 🎯 Phase 3 Roadmap

### Sprint 1: Foundation (Days 1-2) - IN PROGRESS

**Completed:**
- [x] Create package scaffold
- [x] Define core types
- [x] Set up build configuration
- [x] Register in workspace

**Next:**
- [ ] Implement `createForm()` function
- [ ] Migrate `TextField` as first example
- [ ] Add tests for TextField
- [ ] Verify build passes

---

### Sprint 2: Batch Migration (Days 3-5)

**Simple Fields (Priority 1):**
- [ ] TextField
- [ ] NumberField
- [ ] CheckboxField
- [ ] TextareaField
- [ ] SwitchField

**Date/Time Fields (Priority 2):**
- [ ] DateField
- [ ] TimeField
- [ ] DateRangeField

**Selection Fields (Priority 3):**
- [ ] SelectField
- [ ] MultiSelectField
- [ ] RadioGroupField

---

### Sprint 3: Composites (Days 6-8)

- [ ] AddressField
- [ ] PhoneField
- [ ] EmailField
- [ ] PasswordField
- [ ] CurrencyField
- [ ] FileUploadField
- [ ] SignatureField

---

### Sprint 4: Advanced (Days 9-12)

- [ ] MatrixField
- [ ] TableField
- [ ] RankField
- [ ] NPSField
- [ ] CalculatedField
- [ ] RepeaterField

---

### Sprint 5: Renderer & Cleanup (Days 13-15)

- [ ] Implement JSON → JSX renderer
- [ ] Create compat shims in DS
- [ ] Migration codemod
- [ ] Remove fields from DS
- [ ] Update documentation

---

## 🛡️ Guardrails to Add

### 1. Dependency Boundaries

**Update `.dependency-cruiser.js`:**
```javascript
{
  name: 'no-ds-to-forms',
  from: { path: '^packages/ds' },
  to: { path: '^packages/forms' },
  comment: 'DS must not depend on Forms'
}
```

---

### 2. Name Police

**Forbid new `ds/src/fields/**`:**
```yaml
# repo.rules.yaml
- name: no-new-ds-fields
  pattern: packages/ds/src/fields/**
  action: deny
  message: "Fields belong in @intstudio/forms now"
```

---

### 3. Extend Tooling

**Watchers:**
```javascript
// Add to barrel-watcher.mjs
'packages/forms/src/**/*.tsx',
```

**Pre-commit:**
```bash
# Run on forms package too
pnpm -F @intstudio/forms build
```

**CI Pipeline:**
```yaml
# Add forms to build matrix
- packages/forms
```

---

## 📋 Next Session Checklist

### Immediate (Next 1-2 Hours)

1. **Implement form-core**
   ```typescript
   // src/form-core/create-form.ts
   export function createForm<T extends z.ZodType>(config: FormSchema<T>) {
     return useForm({
       resolver: zodResolver(config.schema),
       defaultValues: config.defaultValues,
     });
   }
   ```

2. **Migrate TextField**
   - Copy from `packages/ds/src/fields/TextField/`
   - Update imports to use `@intstudio/ds` primitives
   - Add to `packages/forms/src/fields/TextField/`
   - Export from `fields/index.ts`

3. **Add Tests**
   ```typescript
   // src/fields/TextField/TextField.test.tsx
   import { render } from '@testing-library/react';
   import { TextField } from './TextField';
   
   test('renders with label', () => {
     // ...
   });
   ```

4. **Verify Build**
   ```bash
   pnpm -F @intstudio/forms build
   # Should produce: dist/index.js, dist/fields/index.js, etc.
   ```

---

### Short-Term (Next Week)

5. **Add Dependency Guards**
   - Update dep-cruiser
   - Add ESLint boundaries
   - Update repo.rules.yaml

6. **Create Migration Codemod**
   ```javascript
   // scripts/codemods/migrate-fields-to-forms.mjs
   // Rewrites: @intstudio/ds/fields → @intstudio/forms/fields
   ```

7. **Extend Tooling**
   - Add forms to watchers
   - Update pre-commit hooks
   - Add to CI pipeline
   - Add to nightly auto-fix

8. **Migrate Batch 1 (5 simple fields)**
   - TextField ✓
   - NumberField
   - CheckboxField
   - TextareaField
   - SwitchField

---

## 🎯 Success Criteria

**Sprint 1 Complete When:**
- ✅ `@intstudio/forms` builds successfully
- ✅ TextField migrated and working
- ✅ Tests pass
- ✅ Can import: `import { TextField } from '@intstudio/forms/fields'`

**Phase 3 Complete When:**
- ✅ All 22 fields migrated
- ✅ All composites migrated
- ✅ Renderer implemented
- ✅ DS has no `src/fields/**` (only compat shims)
- ✅ Dep-cruiser enforces `ds ✗→ forms`
- ✅ All tooling extended to forms
- ✅ Documentation updated

---

## 📊 Progress Tracker

### Package Setup
- [x] Scaffold created
- [x] Dependencies installed
- [x] Types defined
- [ ] Build passing
- [ ] Tests passing

### Fields Migration (0/22)
**Simple:** 0/5  
**Date/Time:** 0/3  
**Selection:** 0/3  
**Other:** 0/11  

### Composites (0/10)

### Infrastructure
- [ ] Dep-cruiser rules
- [ ] ESLint boundaries
- [ ] Migration codemod
- [ ] Watchers extended
- [ ] CI extended
- [ ] Compat shims

---

## 🚀 Ready to Continue!

**Current State:**
- ✅ Package scaffold complete
- ✅ Structure defined
- ✅ Dependencies installed
- ✅ Workspace registered

**Next Step:**
```bash
# Implement createForm() and migrate TextField
# Estimated: 1-2 hours
```

**The foundation is solid. Let's extract those fields!** 🎉

---

**Session End:** Oct 23, 2025 12:55am  
**Next Session:** Implement form-core + migrate TextField  
**Est. Completion:** Phase 3 in 2-3 weeks (incremental batches)
