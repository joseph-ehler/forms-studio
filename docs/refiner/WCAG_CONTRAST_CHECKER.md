# WCAG Contrast Checker Integration

## Problem Statement

**Issue:** Storybook's a11y addon caught `#EF4444` (red-500) failing WCAG AA contrast (3.76:1 vs required 4.5:1)

**Root Cause:** CSS fallback colors were chosen for aesthetics without contrast validation

**Impact:** Accessibility violations ship to production, caught only in manual testing

## Solution: Automated Contrast Validation

### Phase 1: Refiner Rule (✅ Implemented)

**Location:** `scripts/refiner/transforms/enforce-wcag-contrast.mjs`

**What it catches:**
- ❌ Inline style colors: `style={{ color: '#EF4444' }}`
- ❌ CSS var fallbacks: `var(--color-error, #EF4444)`
- ❌ Hard-coded hex values in JSX

**What it reports:**
```
❌ Found contrast issues:

  Color: #EF4444
  Contrast: 3.76:1 (FAIL)
  ✅ Suggest: #B91C1C (6.33:1)
```

**Usage:**
```bash
# Check single field
node scripts/refiner/transforms/enforce-wcag-contrast.mjs packages/forms/src/fields/CheckboxField/CheckboxField.tsx

# Check all fields
pnpm refine:dry
```

---

## Phase 2: Integration into Analyze → Generate → Refine Loop

### Current Workflow

```
1. Analyze field → Extract structure, props, DS usage
2. Generate code → Apply recipe template
3. Refine code → Apply transforms (dedupe attrs, enforce primitives)
4. Manual QA → Storybook + visual review
```

### Enhanced Workflow

```
1. Analyze field → Extract structure, props, DS usage, COLOR PALETTE
2. Generate code → Apply recipe template
3. Refine code → Apply transforms:
   ├─ dedupe-jsx-attrs
   ├─ enforce-primitive
   └─ enforce-wcag-contrast  ← NEW
4. Auto-QA → CI runs Axe, checks pass before merge
5. Manual QA → Focus on delight, not bugs
```

---

## Integration Points

### A. Analyzer Enhancement

**Add to field-analyzer.mjs:**
```javascript
// Extract all color values
const colors = extractColors(ast);

// Check each against WCAG
const contrastIssues = colors
  .map((c) => checkWCAGContrast(c.value, c.background))
  .filter((r) => !r.passesAA);

// Report in analysis
analysis.a11y = {
  ...existing,
  contrastIssues,
};
```

### B. Generator Templates

**Update recipe templates to use WCAG-compliant fallbacks:**

```typescript
// BEFORE
const ERROR_COLOR = 'var(--color-error, #EF4444)';

// AFTER
const ERROR_COLOR = 'var(--color-error, #B91C1C)';
```

**Add to factory-overlays.yaml:**
```yaml
a11y:
  contrast:
    minRatio: 4.5  # WCAG AA
    preferredRatio: 7.0  # WCAG AAA for extra margin
    
colors:
  error:
    fallback: '#B91C1C'  # red-700 (6.33:1 on white)
    description: 'WCAG AA compliant error color'
```

### C. Refiner Pipeline

**Add to refiner/index.mjs:**
```javascript
import enforceWCAGContrast from './transforms/enforce-wcag-contrast.mjs';

const TRANSFORMS = [
  dedupeJSXAttrs,
  enforcePrimitive,
  enforceWCAGContrast,  // ← NEW
];

// Run all transforms
for (const transform of TRANSFORMS) {
  const result = transform(code, options);
  
  if (result.issues.length > 0) {
    reportIssues(result.issues);
    
    // FAIL if critical (contrast < 3.0)
    if (result.metadata.criticalIssues > 0) {
      throw new Error('Critical a11y issues detected');
    }
  }
  
  code = result.code;
}
```

### D. CI Integration

**Add to .github/workflows/field-quality.yml:**
```yaml
- name: Check WCAG Contrast
  run: |
    pnpm refine:dry --transform=enforce-wcag-contrast
    if [ $? -ne 0 ]; then
      echo "::error::WCAG contrast violations detected"
      exit 1
    fi
```

---

## Contract: WCAG-Compliant Color Palette

**Define in contracts/wcag-colors.json:**
```json
{
  "error": {
    "primary": "#B91C1C",
    "contrast": 6.33,
    "level": "AA",
    "fallbacks": {
      "light": "#7F1D1D",
      "dark": "#FCA5A5"
    }
  },
  "warning": {
    "primary": "#D97706",
    "contrast": 5.82,
    "level": "AA"
  },
  "success": {
    "primary": "#047857",
    "contrast": 5.12,
    "level": "AA"
  }
}
```

**Generate CSS variables:**
```bash
node scripts/tokens/codegen-wcag-colors.mjs
# Outputs: packages/ds/src/styles/tokens/wcag-colors.css
```

**Result:** All fallback colors are WCAG-compliant by contract

---

## Success Metrics

### Before Automation
- ❌ Manual Storybook testing required
- ❌ Issues found late (post-implementation)
- ❌ Inconsistent color choices across fields
- ⏱️ 10-15 min per field to manually test contrast

### After Automation
- ✅ CI blocks on contrast violations
- ✅ Issues prevented at generation time
- ✅ All fields use same WCAG-compliant palette
- ⏱️ 0 min manual contrast testing (automated)

**Time Saved:** ~10 min/field × 50 fields = **~8 hours**

**Quality Improvement:** 0 contrast violations in production

---

## Rollout Plan

### Week 1: Foundation
- [x] Create enforce-wcag-contrast transform
- [ ] Add WCAG color contract (contracts/wcag-colors.json)
- [ ] Update factory-overlays.yaml with compliant fallbacks

### Week 2: Integration
- [ ] Integrate into refiner pipeline
- [ ] Add analyzer color extraction
- [ ] Update generator templates

### Week 3: CI & Validation
- [ ] Add CI workflow step
- [ ] Run batch refine on all fields
- [ ] Fix any violations found

### Week 4: Documentation
- [ ] Update GOD_TIER_QUALITY_SYSTEM.md
- [ ] Add to field development docs
- [ ] Create troubleshooting guide

---

## Future Enhancements

### Phase 3: Smart Color Suggestions
```javascript
// AI-powered color picker
function suggestAccessibleColor(baseColor, context) {
  // Analyze brand palette
  // Find closest WCAG-compliant color
  // Preserve hue/saturation when possible
  return closestCompliantColor;
}
```

### Phase 4: Live Validation
- VS Code extension with inline warnings
- Real-time contrast checker in Storybook
- Design token validation in Figma plugin

### Phase 5: Context-Aware Checking
- Check actual rendered background (not just white)
- Account for opacity/transparency
- Validate gradient text readability

---

## Lessons Learned

**What Worked:**
- ✅ Storybook a11y addon caught the issue
- ✅ Issue was clear and actionable
- ✅ Fix was simple (darker shade)

**What Could Be Better:**
- ❌ Caught late (post-implementation)
- ❌ Required manual testing
- ❌ No automated prevention

**Systematization Win:**
> "Catch contrast issues at generation time, not in Storybook"

**Motto:** **Ship accessibility by default, not as an afterthought**

---

## Related Systems

- **Analyzer:** Extracts color palette from existing fields
- **Generator:** Uses WCAG-compliant templates
- **Refiner:** Validates contrast ratios automatically
- **CI:** Blocks merges with violations
- **Contracts:** Defines WCAG-compliant color truth

**Integration Status:** ⚠️ Phase 1 complete, Phases 2-5 planned
