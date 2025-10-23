# 🔄 DS Migration Checklist - Remove Shims & Compat

**Phase 3 Goal:** Remove all temporary compatibility layers and complete the migration to the new structure.

---

## 📋 Step 1: Migrate Field Imports

**Goal:** Replace all `../components` imports with `../primitives` in field files.

### Files to Update:
- [ ] `src/fields/TextField.tsx`
- [ ] `src/fields/TextareaField.tsx`
- [ ] `src/fields/NumberField.tsx`
- [ ] `src/fields/SelectField.tsx`
- [ ] `src/fields/MultiSelectField.tsx`
- [ ] `src/fields/TagInputField.tsx`
- [ ] `src/fields/ChipsField.tsx`
- [ ] `src/fields/ToggleField.tsx`
- [ ] `src/fields/DateField.tsx`
- [ ] `src/fields/TimeField.tsx`
- [ ] `src/fields/DateTimeField.tsx`
- [ ] `src/fields/FileField.tsx`
- [ ] `src/fields/SliderField.tsx`
- [ ] `src/fields/ColorField.tsx`
- [ ] `src/fields/RangeField.tsx`
- [ ] `src/fields/RatingField.tsx`
- [ ] `src/fields/RepeaterField.tsx`
- [ ] `src/fields/SignatureField.tsx`
- [ ] `src/fields/composite/*Field.tsx`

### Search & Replace:

```bash
# Replace Flex with Stack direction="row"
find src/fields -name "*.tsx" -exec sed -i '' 's/<Flex/<Stack direction="row"/g' {} \;

# Replace FormStack with Stack
find src/fields -name "*.tsx" -exec sed -i '' 's/FormStack/Stack/g' {} \;

# Replace FormGrid with Grid
find src/fields -name "*.tsx" -exec sed -i '' 's/FormGrid/Grid/g' {} \;

# Update imports
find src/fields -name "*.tsx" -exec sed -i '' "s|from '../components'|from '../primitives'|g" {} \;
```

### Manual Checks:
- [ ] Verify `gap` props map to `spacing` (sm→tight, md→normal, lg→relaxed)
- [ ] Verify `justify` props use `style={{ justifyContent }}`
- [ ] Test all fields render correctly
- [ ] Run smoke tests

---

## 📋 Step 2: Remove Compat Layer

**Goal:** Delete temporary compatibility components once all fields migrate.

### Files to Delete:
- [ ] `src/compat/Flex.tsx`
- [ ] `src/compat/FormStack.tsx`
- [ ] `src/compat/FormGrid.tsx`
- [ ] `src/compat/index.ts`
- [ ] Delete `src/compat/` folder

### Update Barrel:
- [ ] Remove `export { Flex, FormStack, FormGrid } from '../compat'` from `src/components/index.ts`

### Verification:
```bash
# Search for any remaining usage
grep -r "Flex\|FormStack\|FormGrid" src/fields/
# Should return zero results
```

---

## 📋 Step 3: Replace Lib Shims with Real Paths

**Goal:** Update all `../lib/*` imports to use real module locations.

### Files to Update:

**Replace `../lib/layoutConfig`:**
```bash
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '../lib/layoutConfig'|from '../utils/layoutConfig'|g"
```

**Replace `../lib/toneResolver`:**
```bash
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '../lib/toneResolver'|from '../white-label/toneResolver'|g"
```

**Replace `../lib/semanticSizing`:**
```bash
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '../lib/semanticSizing'|from '../utils/semanticSizing'|g"
```

**Replace `../lib/useContrastGuard`:**
```bash
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '../lib/useContrastGuard'|from '../white-label/useContrastGuard'|g"
```

### Files to Delete:
- [ ] `src/lib/layoutConfig.ts`
- [ ] `src/lib/toneResolver.ts`
- [ ] `src/lib/semanticSizing.ts`
- [ ] `src/lib/useContrastGuard.ts`
- [ ] Delete `src/lib/` folder

### Verification:
```bash
# No remaining lib imports
grep -r "from '../lib/" src/
# Should return zero results
```

---

## 📋 Step 4: Tighten Barrel Exports

**Goal:** Remove temporary export aliases once migration complete.

### `src/a11y/index.ts`:
- [ ] Keep only canonical exports (remove aliases like `srAnnounce as getInputModality`)
- [ ] Document which name is canonical

### `src/utils/index.ts`:
- [ ] Audit all exports are intentional
- [ ] Remove any re-export artifacts

### `src/white-label/index.ts`:
- [ ] Clean up temporary type exports
- [ ] Ensure only public API exported

---

## 📋 Step 5: Extract Fields to @intstudio/forms

**Goal:** Move field system out of DS package (future work).

### Create New Package:
```bash
mkdir -p packages/forms
pnpm init
# Set name: @intstudio/forms
# Add peer dep: @intstudio/ds@^0.3.0
```

### Move Files:
- [ ] `src/fields/` → `packages/forms/src/fields/`
- [ ] `src/renderer/` → `packages/forms/src/renderer/`
- [ ] Field-related types → `packages/forms/src/types/`

### Update DS Package:
- [ ] Remove field exports from `src/index.ts`
- [ ] Update README (DS is primitives only)
- [ ] Reduce bundle size significantly

---

## 📋 Step 6: Size Budget Tightening

**Goal:** Lower budgets after fields extracted.

### Expected Savings:
- JS: ~400KB (fields are heavy)
- New target: **300KB max** for primitives-only DS

### Update `scripts/check-size.mjs`:
```javascript
const JS_MAX = 300 * 1024;   // 300 KB (down from 750 KB)
const CSS_MAX = 100 * 1024;  // 100 KB (down from 120 KB)
```

---

## 📋 Step 7: Final Verification

### Build Tests:
- [ ] `pnpm build` succeeds
- [ ] Size budgets pass
- [ ] TypeScript checks pass
- [ ] Smoke tests pass
- [ ] Storybook builds

### Import Tests:
```bash
# No compat imports
grep -r "from '../compat" src/
# Should be empty

# No lib shim imports
grep -r "from '../lib" src/
# Should be empty

# All primitives use canonical paths
grep -r "from '\.\./primitives" src/ | wc -l
# Should be high

# No deprecated aliases in use
grep -r "FormStack\|FormGrid\|Flex" src/fields/
# Should be empty after migration
```

### Documentation:
- [ ] Update README with new import paths
- [ ] Update PHASE_2_SUMMARY.md (mark compat/lib as removed)
- [ ] Create PHASE_3_SUMMARY.md when complete

---

## 🎯 Success Criteria

**Phase 3 Complete When:**
- ✅ No compat layer files exist
- ✅ No lib shim files exist
- ✅ All imports use canonical paths
- ✅ Fields extracted to `@intstudio/forms` (or removed from DS)
- ✅ Bundle size < 300KB
- ✅ All tests pass
- ✅ Storybook works perfectly
- ✅ CI green

---

## 📅 Estimated Timeline

- **Step 1-2:** 1-2 hours (field imports + compat removal)
- **Step 3:** 30 minutes (lib shim replacement)
- **Step 4:** 30 minutes (barrel cleanup)
- **Step 5:** 2-3 hours (field extraction - separate package)
- **Step 6-7:** 1 hour (verification + docs)

**Total:** ~5-7 hours for complete migration

---

## 🚨 Rollback Plan

If migration breaks something:

1. **Revert to last working commit:**
   ```bash
   git revert HEAD
   ```

2. **Re-enable compat layer temporarily:**
   - Restore `src/compat/` folder
   - Re-add exports to `src/components/index.ts`

3. **Fix issues incrementally:**
   - Migrate one field at a time
   - Test after each change
   - Commit frequently

---

## 📝 Notes

- Keep `src/components/index-old.ts` around until Phase 3 complete (safety net)
- Keep `src/index-old.ts` around until Phase 3 complete (safety net)
- Document any unexpected breaking changes
- Update CHANGELOG.md with migration guide for external consumers

---

**Last Updated:** Phase 2 completion (Oct 22, 2025)  
**Next Update:** Phase 3 start
