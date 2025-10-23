# 🎯 DS ADOPTION SPRINT - EXECUTION PLAN

**Based on Real Audit Results**  
**Start**: Oct 22, 2025 @ 3:56am UTC-4  
**Target**: 90 minutes

---

## 📊 AUDIT SUMMARY

### Total Violations Found:
- **Raw `<label>` tags**: 9 across 6 files
- **Hardcoded styling** (rounded/shadow/min-h): 105 across 30 files  
- **Active files to fix**: ~25 (excluding `.old` and `_parked`)
- **Already fixed**: 3 (OverlaySheet, PickerSearch, PickerOption)

### Violation Breakdown by File:

**HIGH (7+ violations)**:
1. ColorField.tsx (11 matches) - SPECIAL CASE (color swatches are data)
2. MultiSelectField.tsx (8 matches)
3. TimeField.tsx (8 matches)
4. NPSField.tsx (7 matches)

**MEDIUM (3-6 violations)**:
5. AddressField.tsx (6 matches)
6. RepeaterField.tsx (5 matches)
7. ChipsField.tsx (4 matches)
8. RangeField.tsx (4 matches)
9. FileField.tsx (3 matches)
10. ToggleField.tsx (3 matches + 1 label)
11. MatrixField.tsx (3 matches + 1 label)
12. RankField.tsx (3 matches)

**LOW (1-2 violations)**:
13. SignatureField.tsx (2 matches)
14. TagInputField.tsx (2 matches)
15. DateRangeField.tsx (2 matches)
16. OTPField.tsx (2 matches)
17. RadioGroupField.tsx (2 matches + 1 label)
18. TableField.tsx (2 matches)
19. CalculatedField.tsx (1 match)
20. DateTimeField.tsx (1 match)
21. RatingField.tsx (1 match)
22. SliderField.tsx (1 match)
23. PasswordField.tsx (1 match)

**SKIP** (old/parked):
- MultiSelectField.old.tsx
- SelectField.old.tsx
- _parked/* files

---

## 🚀 EXECUTION STRATEGY

### Approach: **Bottom-Up** (Low violations → High)
**Why**: Build momentum, get quick wins, save complex for when we're warmed up

### Time Allocation:
- **Quick wins** (1-2 violations): 1 min/file × 11 files = **11 min**
- **Medium** (3-6 violations): 2 min/file × 8 files = **16 min**
- **High** (7+ violations): 4 min/file × 4 files = **16 min**
- **Form components** (create missing primitives): **20 min**
- **Verification**: **10 min**
- **Commit**: **2 min**
- **Buffer**: **15 min**

**Total**: ~90 minutes ✅

---

## 📋 EXECUTION ORDER

### WAVE 1: QUICK WINS (11 files, ~11 min)

#### Simple Fields (1 violation each):
1. [ ] CalculatedField.tsx
2. [ ] DateTimeField.tsx  
3. [ ] RatingField.tsx
4. [ ] SliderField.tsx
5. [ ] PasswordField.tsx

#### Composite Fields (2 violations each):
6. [ ] SignatureField.tsx
7. [ ] TagInputField.tsx
8. [ ] DateRangeField.tsx
9. [ ] OTPField.tsx
10. [ ] RadioGroupField.tsx (+ 1 label)
11. [ ] TableField.tsx

**Target**: ✅ 11 files in 11 minutes

---

### WAVE 2: MEDIUM COMPLEXITY (8 files, ~16 min)

1. [ ] FileField.tsx (3 matches)
2. [ ] ToggleField.tsx (3 matches + 1 label)
3. [ ] MatrixField.tsx (3 matches + 1 label)
4. [ ] RankField.tsx (3 matches)
5. [ ] ChipsField.tsx (4 matches)
6. [ ] RangeField.tsx (4 matches)
7. [ ] RepeaterField.tsx (5 matches)
8. [ ] AddressField.tsx (6 matches)

**Target**: ✅ 8 files in 16 minutes

---

### WAVE 3: HIGH COMPLEXITY (4 files, ~16 min)

1. [ ] NPSField.tsx (7 matches)
2. [ ] TimeField.tsx (8 matches)
3. [ ] MultiSelectField.tsx (8 matches)
4. [ ] ColorField.tsx (11 matches - SPECIAL CASE)

**Target**: ✅ 4 files in 16 minutes

---

### WAVE 4: FORM COMPONENTS (~20 min)

**Need to create/verify these exist**:

1. [ ] FormLabel component (for replacing raw `<label>`)
2. [ ] FormHelperText component (for helpers/hints)
3. [ ] Verify `.ds-input` class exists and is complete
4. [ ] Verify `.ds-textarea` class exists
5. [ ] Verify `.ds-button` + variants exist
6. [ ] Verify `.ds-stack` / `.ds-field` classes exist

**Then apply to**:
- [ ] FormMessage.tsx
- [ ] FormText.tsx
- [ ] FormProgress.tsx
- [ ] FormTooltip.tsx
- [ ] FormBadge.tsx
- [ ] FormHeading.tsx
- [ ] FormActions.tsx
- [ ] FormDivider.tsx
- [ ] FormAccordion.tsx
- [ ] FormSection.tsx
- [ ] FormEmpty.tsx
- [ ] FormSkeleton.tsx

**Target**: ✅ Form components standardized in 20 minutes

---

## 🛠️ PATTERN LIBRARY

### Pattern 1: Replace Input Styling
```tsx
// ❌ BEFORE
<input
  className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-gray-300 shadow-sm"
  style={{ borderRadius: '8px' }}
/>

// ✅ AFTER
<input className="ds-input w-full" />
```

### Pattern 2: Replace Button Styling
```tsx
// ❌ BEFORE
<button className="px-4 py-2 rounded-md shadow-sm bg-blue-600 text-white">
  Submit
</button>

// ✅ AFTER
<button className="ds-button">Submit</button>
<button className="ds-button ds-button--secondary">Cancel</button>
```

### Pattern 3: Replace Label
```tsx
// ❌ BEFORE
<label htmlFor={id} className="block text-sm font-medium text-gray-700">
  Email
</label>

// ✅ AFTER
<FormLabel htmlFor={id}>Email</FormLabel>
```

### Pattern 4: Replace Helper Text
```tsx
// ❌ BEFORE
<p className="mt-1 text-xs text-gray-500">
  We'll never share your email
</p>

// ✅ AFTER
<FormHelperText>We'll never share your email</FormHelperText>
```

### Pattern 5: Strip Hardcoded Tokens
```tsx
// ❌ BEFORE
className="rounded-lg shadow-md min-h-[48px]"
style={{ borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}

// ✅ AFTER
className="ds-input"  // DS class owns radius/shadow/height
style={{}}  // remove
```

---

## ✅ VERIFICATION CHECKLIST

### After Each Wave:
- [ ] Build succeeds: `pnpm -w build`
- [ ] No TypeScript errors
- [ ] Visual check in demo

### Final Verification:
```bash
# Should return 0 matches:
git grep -n "<label" packages/wizard-react/src/fields

git grep -nE "rounded-|border-radius|min-h-\[|shadow-|box-shadow" packages/wizard-react/src/fields

# Boot demo:
pnpm --filter @joseph.ehler/wizard-react dev

# Test matrix:
- [ ] Default brand + light theme
- [ ] Default brand + dark theme
- [ ] ACME brand + light theme
- [ ] ACME brand + dark theme
- [ ] All inputs render correctly
- [ ] All buttons render correctly
- [ ] No console errors
```

---

## 🎯 SUCCESS METRICS

**Sprint Complete When**:
- ✅ 0 raw `<label>` tags in `/fields`
- ✅ 0 hardcoded `rounded-*` in `/fields`
- ✅ 0 hardcoded `shadow-*` in `/fields`
- ✅ 0 hardcoded `min-h-[*]` in `/fields`
- ✅ 0 hardcoded `borderRadius` / `boxShadow` in `/fields`
- ✅ All inputs use `.ds-input`
- ✅ All buttons use `.ds-button`
- ✅ All labels use `<FormLabel>`
- ✅ All helpers use `<FormHelperText>`
- ✅ Demo boots and works across all brands/themes

---

## 📊 LIVE PROGRESS

### Wave 1 (Quick Wins): 0/11 ⏳
### Wave 2 (Medium): 0/8 ⏳
### Wave 3 (High): 0/4 ⏳
### Wave 4 (Form Components): 0/13 ⏳

**Total**: 0/36 files (0%)  
**Estimated Time Remaining**: 63 minutes  
**Current Pace**: TBD  

---

## 🚨 BLOCKERS / NOTES

### Potential Issues:
1. **FormLabel component**: May not exist yet → need to create
2. **FormHelperText component**: May not exist yet → need to create
3. **ColorField.tsx**: Color swatches are user data, not UI tokens (special handling)
4. **`.ds-*` classes**: Need to verify they exist and are complete

### Solutions:
- If primitives missing: Create minimal versions first
- If complex: Flag and skip, come back with extra time
- If blocked: Move to next file, batch similar issues

---

**Ready to execute! Starting Wave 1 in 3... 2... 1... 🚀**
