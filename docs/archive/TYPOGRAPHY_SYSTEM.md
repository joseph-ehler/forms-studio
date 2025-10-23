# Typography System - Single Source of Truth

**Enforcement Strategy**: Make drift impossible through tokens + primitives + context + guardrails.

---

## 🎯 The North Star

**Primitives own it, consumers only slot**:
- Design tokens define the **what** (sizes, weights, ramps)
- Typography primitives define the **how** (FormLabel, FormHelperText)
- Fields **never style text directly** - they slot DS primitives
- Context auto-wires defaults (brand, density, motion)

---

## 1️⃣ Centralized Architecture

### Tokens (One File)

```typescript
// tokens/typography.ts
export const TYPO_TOKENS = {
  font: { 
    body: '"Inter", system-ui, sans-serif',
    mono: '"SF Mono", "Fira Code", monospace'
  },
  weight: { 
    regular: 400, 
    medium: 500, 
    semibold: 600,
    bold: 700
  },
  size: { 
    xs: 12, 
    sm: 14, 
    md: 16, 
    lg: 18,
    xl: 20
  },
  line: { 
    tight: 1.25, 
    normal: 1.5,
    relaxed: 1.75
  },
  ramps: { 
    label: { sm: 'sm/semibold', md: 'md/semibold' },
    helper: { sm: 'sm/regular', md: 'md/regular' },
    caption: { xs: 'xs/regular' }
  }
} as const;

export type LabelSize = keyof typeof TYPO_TOKENS.size;
export type LabelWeight = keyof typeof TYPO_TOKENS.weight;

export const getTypoSize = (size: LabelSize) => TYPO_TOKENS.size[size];
export const getTypoWeight = (weight: LabelWeight) => TYPO_TOKENS.weight[weight];
```

### Context (Auto-Wire Defaults)

```typescript
// components/typography/TypographyProvider.tsx
import React from 'react';

interface TypographyContextValue {
  size: LabelSize;
  density: 'cozy' | 'compact';
}

const TypographyContext = React.createContext<TypographyContextValue>({
  size: 'md',
  density: 'cozy'
});

export const TypographyProvider: React.FC<{
  size?: LabelSize;
  density?: 'cozy' | 'compact';
  children: React.ReactNode;
}> = ({ size = 'md', density = 'cozy', children }) => (
  <TypographyContext.Provider value={{ size, density }}>
    {children}
  </TypographyContext.Provider>
);

export const useTypography = () => React.useContext(TypographyContext);
```

### Primitives (Read Tokens + Context)

```typescript
// components/FormLabel.tsx
import { useTypography } from './typography/TypographyProvider';
import { LabelSize } from '../tokens/typography';
import './ds-typography.css';

export interface FormLabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  size?: LabelSize;
}

export const FormLabel: React.FC<FormLabelProps> = ({
  children,
  htmlFor,
  required,
  optional,
  size: propSize
}) => {
  const { size: defaultSize } = useTypography();
  const size = propSize ?? defaultSize;
  
  return (
    <label 
      htmlFor={htmlFor}
      data-ds="label" 
      className={`ds-label ds-label--${size}`}
    >
      <span>{children}</span>
      {required && <span aria-hidden="true" className="ds-label__req">*</span>}
      {optional && <span className="ds-label__opt">(optional)</span>}
    </label>
  );
};
```

### Single Skin (CSS)

```css
/* components/ds-typography.css */

/* Labels */
.ds-label {
  font-family: var(--ds-font, Inter, system-ui, sans-serif);
  line-height: 1.25;
  display: block;
  margin-bottom: 0.375rem;
}

.ds-label--xs { font-size: 12px; font-weight: 600; }
.ds-label--sm { font-size: 14px; font-weight: 600; }
.ds-label--md { font-size: 16px; font-weight: 600; }
.ds-label--lg { font-size: 18px; font-weight: 600; }

.ds-label__req {
  color: rgb(220, 38, 38);
  margin-left: 2px;
}

.ds-label__opt {
  color: rgb(107, 114, 128);
  margin-left: 6px;
  font-weight: 400;
}

/* Helper Text */
.ds-helper {
  font-family: var(--ds-font, Inter, system-ui, sans-serif);
  line-height: 1.5;
  display: block;
  margin-top: 0.375rem;
}

.ds-helper--sm { font-size: 14px; }
.ds-helper--md { font-size: 16px; }

.ds-helper--error { color: rgb(220, 38, 38); }
.ds-helper--hint { color: rgb(107, 114, 128); }
```

---

## 2️⃣ Make Drift Impossible

### A. ESLint Rules

```javascript
// .eslintrc.typography-rules.json
{
  "rules": {
    "cascade/no-raw-labels": "error",
    "cascade/no-text-classes-in-fields": "error",
    "cascade/no-magic-typo-values": "error",
    "cascade/no-node-css-imports-in-fields": "error"
  },
  "overrides": [
    {
      "files": ["packages/**/src/fields/**/*.tsx"],
      "rules": {
        "no-restricted-syntax": [
          "error",
          {
            "selector": "JSXElement[openingElement.name.name='label']",
            "message": "Use <FormLabel> instead of raw <label> in fields"
          }
        ],
        "no-restricted-imports": [
          "error",
          {
            "patterns": [
              "react-day-picker/dist/style.css",
              "**/node_modules/**/*.css"
            ],
            "message": "Import CSS only from design system skins"
          }
        ]
      }
    }
  ]
}
```

### B. CI Checks (Static Analysis)

```bash
#!/bin/bash
# .github/scripts/check-typography.sh

# Check for raw labels in fields
if git grep -nE "<label[^>]" -- "packages/**/src/fields/**/*.tsx"; then
  echo "❌ Raw <label> usage found. Use <FormLabel>."
  exit 1
fi

# Check for typography classes in fields
if git grep -nE "className=.*\b(text-|font-|leading-)" -- "packages/**/src/fields/**/*.tsx"; then
  echo "❌ Typography classes in fields. Use DS primitives."
  exit 1
fi

# Check for magic font values
if git grep -nE "style=.*fontSize|fontWeight" -- "packages/**/src/fields/**/*.tsx"; then
  echo "❌ Inline font styles found. Use TYPO_TOKENS."
  exit 1
fi

echo "✅ Typography checks passed!"
```

### C. Contract Tests

```typescript
// tests/typography.contract.spec.ts
import { test, expect } from '@playwright/test';

const ALL_FIELDS = [
  'DateField',
  'SelectField',
  'PhoneField',
  'AddressField',
  'CurrencyField',
  'ColorField',
  // ... all fields
];

for (const fieldName of ALL_FIELDS) {
  test(`${fieldName} uses DS label primitive`, async ({ page }) => {
    await page.goto('/'); // Adjust to your demo page
    
    // Every field should have exactly one DS label
    const dsLabels = page.locator('[data-ds="label"]');
    await expect(dsLabels).toHaveCount(1);
    
    // No raw labels without data-ds
    const rawLabels = page.locator('label:not([data-ds="label"])');
    await expect(rawLabels).toHaveCount(0);
  });
  
  test(`${fieldName} has no typography classes`, async ({ page }) => {
    await page.goto('/');
    
    // No text-*, font-*, leading-* classes on labels
    const badClasses = page.locator('[data-ds="label"][class*="text-"]');
    await expect(badClasses).toHaveCount(0);
  });
}
```

---

## 3️⃣ Detect & Migrate Legacy

### Codemod (jscodeshift)

```javascript
// codemods/migrate-labels.js
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  
  // Find all raw <label> elements
  root.find(j.JSXElement, {
    openingElement: { name: { name: 'label' } }
  }).replaceWith(path => {
    const { node } = path;
    const className = node.openingElement.attributes.find(
      attr => attr.name?.name === 'className'
    );
    
    // Extract size from className
    let size = 'md';
    if (className?.value?.value?.includes('text-sm')) size = 'sm';
    if (className?.value?.value?.includes('text-lg')) size = 'lg';
    
    // Build FormLabel props
    const props = [
      ...node.openingElement.attributes.filter(
        attr => attr.name?.name !== 'className'
      ),
      j.jsxAttribute(
        j.jsxIdentifier('size'),
        j.stringLiteral(size)
      )
    ];
    
    return j.jsxElement(
      j.jsxOpeningElement(j.jsxIdentifier('FormLabel'), props),
      j.jsxClosingElement(j.jsxIdentifier('FormLabel')),
      node.children
    );
  });
  
  // Add import if not present
  const hasImport = root.find(j.ImportDeclaration, {
    source: { value: '../components' }
  }).length > 0;
  
  if (!hasImport) {
    root.get().node.program.body.unshift(
      j.importDeclaration(
        [j.importSpecifier(j.identifier('FormLabel'))],
        j.literal('../components')
      )
    );
  }
  
  return root.toSource();
}
```

**Run migration**:
```bash
pnpm jscodeshift -t codemods/migrate-labels.js packages/wizard-react/src/fields/**/*.tsx
```

---

## 4️⃣ Generator Updates

```javascript
// _templates/field/new/component.tsx.ejs.t
---
to: packages/wizard-react/src/fields/<%= h.changeCase.pascal(name) %>Field.tsx
---
import React from 'react';
import { Controller } from 'react-hook-form';
import { FormLabel, FormHelperText } from '../components'; // DS primitives
import type { FieldComponentProps } from './types';

export const <%= h.changeCase.pascal(name) %>Field: React.FC<FieldComponentProps> = ({
  name,
  label,
  required,
  disabled,
  description,
  control,
  errors,
}) => {
  return (
    <div>
      {/* Use DS primitive - never raw <label> */}
      {label && (
        <FormLabel 
          htmlFor={name} 
          required={required}
          data-ds="label"
        >
          {label}
        </FormLabel>
      )}
      
      {description && (
        <FormHelperText data-ds="helper">
          {description}
        </FormHelperText>
      )}
      
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            id={name}
            type="text"
            {...field}
            disabled={disabled}
          />
        )}
      />
      
      {errors?.[name]?.message && (
        <FormHelperText variant="error" data-ds="helper">
          {String(errors[name].message)}
        </FormHelperText>
      )}
    </div>
  );
};
```

---

## 5️⃣ PR Checklist Addition

```markdown
## Typography Checklist

- [ ] No raw `<label>` in fields; using `<FormLabel>`
- [ ] No `text-*`/`font-*`/`leading-*` on labels in fields
- [ ] Uses tokens for sizes/weights from `TYPO_TOKENS`
- [ ] All typography components have `data-ds` attributes
- [ ] Added/updated tests: contract + visual (if needed)
```

---

## 6️⃣ Diagnostics

```typescript
// utils/debug-typography.ts
export function debugTypography() {
  const dsLabels = document.querySelectorAll('[data-ds="label"]');
  const rawLabels = document.querySelectorAll('label:not([data-ds="label"])');
  const dsHelpers = document.querySelectorAll('[data-ds="helper"]');
  
  console.group('📝 Typography Audit');
  console.table({
    'DS Labels': dsLabels.length,
    'Raw Labels': rawLabels.length,
    'DS Helpers': dsHelpers.length,
  });
  
  if (rawLabels.length > 0) {
    console.warn('❌ Raw labels found:', rawLabels);
  }
  
  // Check for forbidden classes
  const badClasses = document.querySelectorAll('[data-ds="label"][class*="text-"]');
  if (badClasses.length > 0) {
    console.warn('❌ Typography classes on DS labels:', badClasses);
  }
  
  console.groupEnd();
}

// Expose globally in dev
if (process.env.NODE_ENV === 'development') {
  (window as any).debugTypography = debugTypography;
}
```

---

## 7️⃣ Apply to Everything

Same pattern for:

### Helper Text
```typescript
<FormHelperText 
  variant="error" | "hint"
  data-ds="helper"
>
  {message}
</FormHelperText>
```

### Buttons
```typescript
<Button 
  variant="primary" | "secondary"
  size="sm" | "md" | "lg"
  data-ds="button"
>
  {children}
</Button>
```

### Icons
```typescript
<Icon 
  name="check" | "close" | "search"
  size={16}
  data-ds="icon"
/>
```

---

## ✅ What This Gives You

### Single Source of Truth
- `TYPO_TOKENS` (constants)
- DS primitives (`FormLabel`, `FormHelperText`)
- One skin (`ds-typography.css`)

### Drift is Impossible
- ESLint blocks raw labels/typography classes
- CI greps catch violations
- Contract tests ensure DS primitives present
- Generators scaffold compliant code
- Codemod migrates legacy

### One Command Diagnosis
- `debugTypography()` in console
- CI greps show exact locations
- Contract tests prevent regressions

---

## 🚀 Implementation Order

### Phase 1 (Today)
1. Create `tokens/typography.ts`
2. Create `TypographyProvider` + `useTypography()`
3. Create `FormLabel` primitive
4. Create `ds-typography.css`

### Phase 2 (This Week)
1. Add ESLint rules (`.eslintrc.typography-rules.json`)
2. Add CI checks (`check-typography.sh`)
3. Run codemod on existing fields
4. Add contract tests

### Phase 3 (Next Week)
1. Update generators (`hygen`)
2. Add `debugTypography()` utility
3. Update PR template
4. Document in `DESIGN_SYSTEM_PATTERNS.md`

---

## 📊 Success Metrics

- ✅ Zero raw `<label>` in fields
- ✅ Zero typography classes in fields
- ✅ 100% fields use DS primitives
- ✅ Contract tests passing
- ✅ ESLint rules enforced
- ✅ CI checks green

---

**This is how we prevent drift forever.** 🎯
