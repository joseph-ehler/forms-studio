# Field Analyzer - Pre-Spec Analysis Tool

## Overview

The Field Analyzer inspects existing React components (specifically field components) and generates a comprehensive analysis report. This helps you:

1. **Understand existing components** before writing specs
2. **Identify compliance gaps** (RHF integration, ARIA, DS usage)
3. **Generate spec suggestions** automatically
4. **Plan migrations** with confidence

---

## Usage

### 1. Analyze a Field Component

```bash
pnpm analyze:field packages/forms/src/fields/TextField/TextField.tsx
```

**Output:** JSON report with:
- Component structure analysis
- RHF integration check
- DS primitives usage
- ARIA compliance
- Pattern violations
- Suggested spec

### 2. Save Analysis to File

```bash
pnpm analyze:field packages/forms/src/fields/TextField/TextField.tsx > tmp/TextField-analysis.json
```

### 3. Convert Analysis to Spec

```bash
pnpm spec:from-analysis tmp/TextField-analysis.json > specs/fields/TextField.yaml
```

### 4. Full Workflow

```bash
# 1) Analyze existing component
pnpm analyze:field packages/forms/src/fields/LegacyField/LegacyField.tsx > tmp/legacy.json

# 2) Generate spec from analysis
pnpm spec:from-analysis tmp/legacy.json > specs/fields/LegacyField.yaml

# 3) Edit spec (add validation, telemetry, etc.)
vim specs/fields/LegacyField.yaml

# 4) Generate new field from spec
pnpm field:new LegacyField

# 5) Run refiner to fix any violations
pnpm refine:run --scope="packages/forms/src/fields/LegacyField/**"

# 6) Verify
pnpm -w build
pnpm generator:test
```

---

## Analysis Report Structure

### Example Output

```json
{
  "file": "packages/forms/src/fields/TextField/TextField.tsx",
  "component": "TextField",
  "analysis": {
    "rhf": {
      "usesController": true,
      "imports": ["Controller", "FieldValues"]
    },
    "ui": {
      "domElements": ["input"],
      "dsPrimitives": ["FormLabel", "Stack", "FormHelperText"],
      "guessedType": "text"
    },
    "props": ["name", "control", "errors", "label", "required", "description", "placeholder", "disabled"],
    "aria": {
      "hasHtmlFor": true,
      "hasAriaDescribedBy": true,
      "hasAriaInvalid": true,
      "hasAriaRequired": false,
      "hasAriaLabel": false
    },
    "patterns": {
      "hasInlineStyles": false,
      "usesStyleProp": false,
      "hasErrorHandling": true,
      "hasDescription": true,
      "hasLabel": true,
      "hasRequired": true,
      "hasDisabled": true
    },
    "exports": ["TextField"]
  },
  "compliance": {
    "rhfIntegration": "✅",
    "dsComponents": "✅",
    "ariaLabels": "✅",
    "ariaDescriptions": "✅",
    "ariaInvalid": "✅",
    "errorHandling": "✅",
    "noInlineStyles": "✅"
  },
  "issues": [],
  "recommendations": [],
  "suggestedSpec": {
    "name": "TextField",
    "specVersion": "1.2",
    "ui": {
      "behavior": "text",
      "inputType": "text"
    },
    "validation": {
      "required": true,
      "rules": {}
    },
    "telemetry": {
      "enabled": false,
      "events": ["focus", "blur", "validate"],
      "pii": "hash"
    }
  }
}
```

---

## Compliance Checks

The analyzer checks for:

### ✅ RHF Integration
- **Pass:** Component uses `<Controller>` from react-hook-form
- **Fail:** Manual state management detected

### ✅ DS Components
- **Pass:** Uses DS primitives (FormLabel, Input, FormHelperText, Stack)
- **Warn:** Uses raw HTML elements
- **Fail:** No DS usage detected

### ✅ ARIA Labels
- **Pass:** FormLabel has `htmlFor` attribute
- **Fail:** Missing `htmlFor` (accessibility violation)

### ✅ ARIA Descriptions
- **Pass:** Input has `aria-describedby` linking to helper text
- **Warn:** Missing (should link to description/error)

### ✅ ARIA Invalid
- **Pass:** Input has `aria-invalid` for error state
- **Warn:** Missing (screen readers won't announce errors)

### ✅ Error Handling
- **Pass:** Component accepts `errors` prop and renders error messages
- **Fail:** No error handling detected

### ✅ No Inline Styles
- **Pass:** No `style={{...}}` attributes
- **Fail:** Inline styles detected (run Refiner to fix)

---

## Issues & Recommendations

### Issue Severity Levels

- **error:** Must be fixed (blocks compliance)
- **warning:** Should be fixed (best practice)
- **info:** Nice to have (enhancement)

### Common Issues

```json
{
  "severity": "error",
  "message": "Not using RHF Controller - manual form state management detected",
  "fix": "Wrap input with <Controller name={name} control={control} render={...} />"
}
```

```json
{
  "severity": "warning",
  "message": "Inline styles detected",
  "fix": "Run Refiner: pnpm refine:run --scope=\"path/to/file.tsx\""
}
```

```json
{
  "severity": "error",
  "message": "FormLabel missing htmlFor attribute",
  "fix": "Add htmlFor={name} to <FormLabel>"
}
```

---

## Use Cases

### 1. **Auditing Existing Fields**

Run analyzer on all fields to get a compliance report:

```bash
for file in packages/forms/src/fields/*/*.tsx; do
  echo "Analyzing $file..."
  pnpm analyze:field "$file" > "tmp/$(basename $file .tsx)-analysis.json"
done
```

### 2. **Planning Migrations**

Before migrating a legacy field to the factory system:

1. Analyze current implementation
2. Review compliance issues
3. Generate suggested spec
4. Plan fixes/improvements
5. Regenerate with factory

### 3. **Documentation**

Generate component inventory with compliance scores:

```bash
pnpm analyze:field TextField.tsx | jq '.compliance'
```

### 4. **Pre-commit Checks**

Add analyzer to CI to enforce standards:

```yaml
- name: Analyze Field Components
  run: |
    for file in packages/forms/src/fields/**/*.tsx; do
      pnpm analyze:field "$file" | jq -e '.compliance | all(. == "✅")'
    done
```

---

## Integration with Factory Workflow

```
┌─────────────────────────────────────────────┐
│ 1. Existing Component                       │
│    packages/forms/src/fields/Old/Old.tsx   │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│ 2. Analyzer                                 │
│    pnpm analyze:field Old.tsx > analysis    │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│ 3. Review Analysis                          │
│    - Compliance: 4/7 ✅                     │
│    - Issues: 3 found                        │
│    - Recommendations: 2                     │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│ 4. Generate Spec                            │
│    pnpm spec:from-analysis > Old.yaml       │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│ 5. Edit Spec (add validation, telemetry)   │
│    vim specs/fields/Old.yaml                │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│ 6. Generate with Factory                    │
│    pnpm field:new Old                       │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│ 7. Refiner Auto-Fix                         │
│    pnpm refine:run --scope="**/Old/**"      │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│ 8. Verify                                   │
│    pnpm -w build && pnpm generator:test     │
└─────────────────────────────────────────────┘
```

---

## Tips

1. **Always save analysis to file** - You'll want to reference it during spec writing
2. **Review suggestions carefully** - The analyzer makes educated guesses but may need manual adjustment
3. **Fix compliance issues first** - Start with errors, then warnings
4. **Use with Refiner** - Analyzer identifies issues, Refiner fixes them automatically
5. **Iterate** - Analyze → Fix → Analyze again to verify improvements

---

## Future Enhancements

- [ ] Batch analysis mode (analyze entire directory)
- [ ] HTML report output (visual compliance dashboard)
- [ ] Comparison mode (diff two analyses)
- [ ] Auto-fix mode (apply suggested fixes directly)
- [ ] Integration with Refiner (auto-create transforms from issues)
- [ ] Performance analysis (bundle size, render count)
- [ ] Test coverage analysis

---

## Philosophy

> "Observe before acting. Understand before changing.  
> The Analyzer makes migrations deliberate and systematic."

This tool embodies the **systematic thinking** principle:
1. **Observe** actual code structure
2. **Understand** patterns and violations
3. **Plan** improvements with data
4. **Execute** with factory + refiner
5. **Verify** compliance automatically

No guessing. No breaking changes. Pure confidence. 🎯
