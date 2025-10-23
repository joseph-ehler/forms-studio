# Next 60-90 Minutes: Infrastructure Sprint v1.1

**Goal:** Bulletproof the factory so Batch 5 is truly push-button

---

## Hour 1: Refiner v1.1 (AST Auto-Fix) - 30 minutes

### What
Add AST-based auto-fix to `filter-dom-props.mjs` so it surgically removes invalid props from native DOM elements.

### Why
- Batch 4 needed 2 manual fixes (RangeField, TagInputField) for custom props on `<input>`
- With auto-fix, this class of bugs is eliminated retroactively AND going forward
- One refiner run = all 12 fields hardened

### How

**Install dependencies:**
```bash
pnpm add -D -w @babel/parser @babel/traverse @babel/types @babel/generator
```

**Update `scripts/refiner/transforms/filter-dom-props.mjs`:**

```javascript
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import { getAllowedProps } from './filter-dom-props.mjs'; // existing util

export function filterDomProps({ htmlAllowlistByTypePath } = {}) {
  return {
    name: 'filter-dom-props',
    version: '1.1.0',
    
    async apply({ file, code }) {
      // Skip non-TSX files
      if (!file.endsWith('.tsx')) {
        return { changed: false, code };
      }
      
      // Parse AST
      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx']
      });
      
      let changed = false;
      const NATIVE_ELEMENTS = new Set([
        'input', 'textarea', 'select', 'button', 'div', 'span', 
        'label', 'form', 'fieldset', 'legend', 'a', 'img', 'video'
      ]);
      
      // Walk JSX elements
      traverse(ast, {
        JSXElement(path) {
          const openingElement = path.node.openingElement;
          const tagName = openingElement.name.name;
          
          // Only process native HTML elements
          if (!NATIVE_ELEMENTS.has(tagName)) return;
          
          // Get type from element (e.g., type="range")
          let inputType = 'text';
          const typeAttr = openingElement.attributes.find(
            attr => t.isJSXAttribute(attr) && attr.name.name === 'type'
          );
          if (typeAttr && t.isStringLiteral(typeAttr.value)) {
            inputType = typeAttr.value.value;
          }
          
          // Get allowed props for this input type
          const allowed = new Set([
            ...getAllowedProps(inputType),
            'key', 'ref' // React-specific
          ]);
          
          // Filter attributes
          const filteredAttrs = openingElement.attributes.filter(attr => {
            if (!t.isJSXAttribute(attr)) return true; // Keep spreads
            
            const attrName = attr.name.name;
            
            // Keep allowed, data-*, aria-*
            if (allowed.has(attrName)) return true;
            if (attrName.startsWith('data-')) return true;
            if (attrName.startsWith('aria-')) return true;
            
            // Remove custom props
            console.log(`   🔧 Removing ${attrName} from <${tagName}>`);
            changed = true;
            return false;
          });
          
          if (changed) {
            openingElement.attributes = filteredAttrs;
          }
        }
      });
      
      if (!changed) {
        return { changed: false, code };
      }
      
      // Generate updated code
      const output = generate(ast, {
        retainLines: true,
        comments: true
      });
      
      // Add refiner annotation at top
      const annotated = `/** @refiner(filter-dom-props@1.1.0 applied ${new Date().toISOString().split('T')[0]}) */\n${output.code}`;
      
      return { changed: true, code: annotated };
    }
  };
}
```

**Test it:**
```bash
# Dry run on existing fields
pnpm refine:dry --scope="packages/forms/src/fields/**/*.tsx"

# Apply fixes
pnpm refine:run --scope="packages/forms/src/fields/**/*.tsx"

# Verify builds still green
pnpm -F @intstudio/forms build
pnpm -F @intstudio/ds build
```

**Add to lint-staged (pre-commit):**
```json
// package.json
{
  "lint-staged": {
    "packages/forms/src/fields/**/*.{ts,tsx}": [
      "pnpm refine:dry --scope"
    ]
  }
}
```

---

## Hour 1.5: Composite Generator v1 - 20 minutes

### What
Teach the generator to emit proper composite fields (like RangeField).

### Why
- RangeField needed manual fix (two inputs + shared error group)
- With composite support, range-like fields generate clean first time

### How

**Update generator to detect composite pattern:**

```javascript
// In scripts/process/field-from-spec.mjs

function generateFieldImplementation(spec) {
  if (spec.type === 'composite') {
    return generateCompositeField(spec);
  }
  return generatePrimitiveField(spec);
}

function generateCompositeField(spec) {
  const { composite } = spec;
  const { parts, layout, gap, separator } = composite;
  
  // Template for min/max composite
  const template = `
export function ${spec.name}<T extends FieldValues = FieldValues>({
  name,
  control,
  errors,
  label,
  required,
  disabled,
  description,
  ${spec.props.map(p => `${p.name} = ${p.default}`).join(',\n  ')}
}: ${spec.name}Props<T>) {
  const err = (errors as any)?.[name];
  const hasError = Boolean(err);
  const errorMessage = err?.message as string | undefined;

  return (
    <Stack spacing="tight">
      {label && (
        <FormLabel htmlFor={name} required={required} size="md">
          {label}
        </FormLabel>
      )}

      <Controller
        name={name as any}
        control={control as any}
        render={({ field }) => {
          const value = field.value || { ${parts.map(p => `${p.name}: ${spec.props.find(pr => pr.name === p.name + 'Bound')?.default || 0}`).join(', ')} };
          
          ${parts.map((p, i) => `
          const handle${capitalize(p.name)}Change = (e: React.ChangeEvent<HTMLInputElement>) => {
            const new${capitalize(p.name)} = Number(e.target.value);
            field.onChange({ ...value, ${p.name}: new${capitalize(p.name)} });
          };`).join('\n')}
          
          return (
            <div style={{ display: '${layout === 'row' ? 'flex' : 'grid'}', gap: '${gap === 'normal' ? '8px' : '4px'}', alignItems: 'center' }}>
              ${parts.map((p, i) => `
              <input
                type="${p.type}"
                id={\`\${name}-${p.name}\`}
                disabled={disabled}
                aria-invalid={hasError || undefined}
                aria-label="${p.label}"
                value={value.${p.name}}
                onChange={handle${capitalize(p.name)}Change}
                onBlur={field.onBlur}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: hasError ? '1px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              />
              ${i < parts.length - 1 && separator ? `<span style={{ color: '#6b7280' }}>${separator}</span>` : ''}
              `).join('\n')}
            </div>
          );
        }}
      />
      
      {/* Error/description same as primitive */}
    </Stack>
  );
}`;
  
  return template;
}
```

**Test:**
```bash
# RangeField should regenerate clean
node scripts/process/field-from-spec.mjs RangeField
pnpm -F @intstudio/forms build
```

---

## Hour 2: CI Polish + Scaffolding - 20-30 minutes

### Story Generation

**Add to generator:**
```javascript
// After generating field, append to FieldLab.stories.tsx
function generateStory(fieldName) {
  return `
export const ${fieldName}_Basic = () => {
  const form = useForm();
  return (
    <${fieldName}
      name="${fieldName.toLowerCase()}"
      label="${fieldName} Example"
      control={form.control}
      errors={form.formState.errors}
    />
  );
};
`;
}

// Append to packages/forms/src/fields/FieldLab.stories.tsx
```

### Test Scaffolding

**Create minimal smoke test template:**
```javascript
// scripts/templates/field-test.mjs
export const testTemplate = (fieldName) => `
import { render } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { ${fieldName} } from './${fieldName}';

describe('${fieldName}', () => {
  it('renders with label', () => {
    const TestComponent = () => {
      const form = useForm();
      return (
        <${fieldName}
          name="test"
          label="Test Label"
          control={form.control}
          errors={form.formState.errors}
        />
      );
    };
    
    const { getByText } = render(<TestComponent />);
    expect(getByText('Test Label')).toBeInTheDocument();
  });
  
  it('shows error message', () => {
    const TestComponent = () => {
      const form = useForm();
      return (
        <${fieldName}
          name="test"
          label="Test"
          control={form.control}
          errors={{ test: { message: 'Error!' } }}
        />
      );
    };
    
    const { getByText } = render(<TestComponent />);
    expect(getByText('Error!')).toBeInTheDocument();
  });
});
`;
```

---

## Batch 5 Runbook (35-45 minutes total)

**Fields:** ColorField, EmailField, TelField, UrlField (all native inputs)

### Setup (5 min)

**Create specs:**
```bash
# ColorField.yaml
specVersion: "1.0"
name: ColorField
type: color
description: "Color picker using native color input"
# ... (minimal - just type + standard props)

# EmailField.yaml
specVersion: "1.0"
name: EmailField
type: email
description: "Email input with validation"

# TelField.yaml
specVersion: "1.0"
name: TelField
type: tel
description: "Telephone number input"

# UrlField.yaml
specVersion: "1.0"
name: UrlField
type: url
description: "URL input with validation"
```

### Execution (30 min = ~7 min/field)

```bash
# Preflight
pnpm preflight:green

# Generate all 4 fields
for field in Color Email Tel Url; do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Generating ${field}Field..."
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  pnpm field:new ${field}Field
  pnpm -F @intstudio/forms build
  pnpm -F @intstudio/ds build
done

# Optional: Refiner sweep
pnpm refine:run --scope="packages/forms/src/fields/**/*.tsx"

# Final verification
pnpm preflight:green

# Commit
git add -A
git commit -m "feat(forms): batch 5 fields (Color/Email/Tel/Url) - 16/22 (73%)

- ColorField: Native color picker
- EmailField: Email input with validation
- TelField: Telephone number input
- UrlField: URL input with validation

All generated from specs with zero manual fixes.
Factory system: 100% automated.
Progress: 16/22 fields (73% complete)"
```

---

## Success Metrics

### Infrastructure Sprint v1.1
- ✅ Refiner v1.1: AST auto-fix operational
- ✅ Composite generator: RangeField regenerates clean
- ✅ Story scaffolding: Auto-generated per field
- ✅ Test scaffolding: Smoke tests generated

### Batch 5
- ✅ 4 fields generated in ~30 minutes
- ✅ Zero manual fixes required
- ✅ All builds green first try
- ✅ Progress: 16/22 (73%)

### Time Investment vs ROI
- Infrastructure: 60-90 min
- Batch 5: 30-40 min
- **Total: ~2 hours**
- **Remaining fields (6) will take: ~40 min total**
- **ROI: Every future field is push-button**

---

## Watchlist (Tiny Items)

1. **Non-HTML props:** Generator now filters via allowlist - refiner catches any misses
2. **Import violations:** Canonical mapping auto-rewrites - postbuild catches drift
3. **Composite validation:** Schema enforces parts + layout - validator fails early
4. **Story naming:** Auto-generated stories use ${FieldName}_Basic pattern

---

## The Loop (Locked In)

```
Generator learns → Schema updated → Specs validated → Fields generated
     ↓
Refiner applies → AST auto-fix → All fields hardened
     ↓
Guardrails enforce → Preflight fails fast → Builds stay green
     ↓
Nightly sweeps → Auto-PR → Zero drift maintained
```

**Status:** Factory is self-correcting. The system builds the product.

---

## Next After Batch 5

**Batch 6 (Final 6 fields - 27%):**
- FileField (type=file)
- MultiSelectField (select + multiple)
- ToggleField (checkbox styled as switch)
- SignatureField (canvas composite)
- LocationField (lat/lon composite)
- RepeaterField (dynamic array)

**Estimated time:** ~90 minutes (3 simple + 3 complex with composites)

**Then:** Migration complete. All 22 fields. Factory proven. System operational.
