# Batch Analysis & Style Propagation Workflow

## Philosophy

**Don't copy diffs. Codify patterns.**

When you manually improve one component, the factory way is:
1. **Observe** - Use batch analysis to see the pattern across all components
2. **Understand** - Identify what makes this improvement valuable
3. **Pattern?** - Is this a one-off or something reusable?
4. **Systematize** - Codify into DS + Schema + Generator + Refiner
5. **Document** - Update factory-overlays.yaml and this guide

---

## 1️⃣ Batch Analysis - Discover Before You Decide

### When to Use

- **Before writing new specs** - See what patterns actually exist
- **Before creating Refiner rules** - Understand what needs fixing
- **After major changes** - Verify everything is consistent
- **Planning migrations** - Identify outliers and archetypes

### Commands

```bash
# Analyze all fields
pnpm analyze:batch "packages/forms/src/fields/**/*.tsx"

# Analyze specific type
pnpm analyze:batch "packages/forms/src/fields/*Field/*.tsx"

# Save to file for review
pnpm analyze:batch "packages/forms/src/fields/**/*.tsx" > tmp/batch-report.json

# Pretty print specific sections
pnpm analyze:batch "packages/forms/src/fields/**/*.tsx" | jq '.aggregate.outliers'
```

### What You Get

#### **Aggregate Statistics**
```json
{
  "totals": {
    "filesAnalyzed": 22,
    "usesController": 22,
    "hasDSPrimitives": 22,
    "hasInlineStyles": 0,
    "hasErrorHandling": 22
  },
  "compliance": {
    "fullCompliance": 22,
    "rhfIntegration": 22,
    "dsComponents": 22,
    "ariaLabels": 22,
    "noInlineStyles": 22
  }
}
```

#### **Pattern Frequency**
```json
{
  "patterns": {
    "domElements": [
      { "key": "input", "count": 18, "percentage": "81.8%" },
      { "key": "select", "count": 2, "percentage": "9.1%" },
      { "key": "textarea", "count": 2, "percentage": "9.1%" }
    ],
    "dsPrimitives": [
      { "key": "FormLabel", "count": 22, "percentage": "100%" },
      { "key": "Stack", "count": 22, "percentage": "100%" },
      { "key": "FormHelperText", "count": 22, "percentage": "100%" }
    ]
  }
}
```

#### **Outlier Detection**
```json
{
  "outliers": {
    "noController": [],
    "inlineStyles": [],
    "missingHtmlFor": [],
    "missingErrorHandling": []
  }
}
```

#### **Archetype Clustering**
```json
{
  "archetypes": {
    "simpleText": { 
      "count": 15,
      "examples": ["TextField", "EmailField", "UrlField"]
    },
    "select": {
      "count": 2,
      "examples": ["SelectField", "MultiSelectField"]
    },
    "composite": {
      "count": 1,
      "examples": ["RangeCompositeField"]
    }
  }
}
```

---

## 2️⃣ Style Propagation - The Factory Way

### ❌ DON'T: Copy Manual Edits

```bash
# ❌ This is NOT the factory way
cp packages/forms/src/fields/TextField/TextField.tsx packages/forms/src/fields/EmailField/EmailField.tsx
# Breaks the system, creates drift
```

### ✅ DO: Codify the Pattern

#### **Step 1: Observe (Manual Discovery)**

You manually style `TextField.tsx` and love the result:

```tsx
// You added this manually
<input 
  className="ds-input ds-input--quiet w-full"
  placeholder="Enter text..."
  {...field}
/>
```

The `ds-input--quiet` variant looks beautiful!

#### **Step 2: Understand (Why is this better?)**

- Less visual noise (borderless until focus)
- Better for inline editing use cases
- Reduces form clutter
- Still accessible and functional

**Decision:** This should be available to ALL fields as an opt-in variant.

#### **Step 3: Pattern? (Is this reusable?)**

Yes! This is a **UI variant** that many fields could benefit from.

#### **Step 4: Systematize (Make it official)**

##### **4a. Add to Design System**

```css
/* packages/ds/src/styles/components/ds-inputs.css */

.ds-input--quiet {
  border-color: transparent;
  background-color: transparent;
  transition: border-color 150ms ease, background-color 150ms ease;
}

.ds-input--quiet:hover {
  background-color: var(--ds-color-surface-subtle);
}

.ds-input--quiet:focus {
  border-color: var(--ds-color-border-focus);
  background-color: var(--ds-color-surface-base);
}
```

##### **4b. Update Schema**

```json
// specs/_schema.json
{
  "ui": {
    "properties": {
      "variant": {
        "type": "string",
        "enum": ["default", "quiet", "danger", "success"],
        "default": "default",
        "description": "Visual variant of the input"
      }
    }
  }
}
```

##### **4c. Update Factory Overlays**

```yaml
# factory-overlays.yaml
variants:
  quiet:
    description: "Minimal styling, borderless until focus"
    classes: "ds-input ds-input--quiet w-full"
```

##### **4d. Update Generator Template**

```javascript
// scripts/process/field-from-spec-v2.mjs

const getInputClasses = (spec) => {
  const variant = spec.ui?.variant || 'default';
  const baseClasses = 'ds-input w-full';
  
  if (variant === 'quiet') {
    return 'ds-input ds-input--quiet w-full';
  }
  
  return baseClasses;
};

// In template
const inputClasses = getInputClasses(spec);
// ...
<input className="${inputClasses}" ... />
```

##### **4e. Create Refiner Transform**

```javascript
// scripts/refiner/transforms/apply-variant-v1.0.mjs

/**
 * Refiner Transform: Apply Variant v1.0
 * 
 * Reads ui.variant from field spec and ensures correct className.
 * Enables retroactive application of new variants.
 */

import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import fs from 'node:fs';
import yaml from 'yaml';

export function applyVariantV1_0() {
  return {
    name: 'apply-variant-v1.0',
    apply: async ({ file, code }) => {
      const issues = [];
      let modified = false;
      
      // Read spec for this field
      const specPath = file.replace('/src/fields/', '/specs/fields/')
        .replace('.tsx', '.yaml')
        .replace('.ts', '.yaml');
      
      let spec;
      try {
        const specYaml = fs.readFileSync(specPath, 'utf8');
        spec = yaml.parse(specYaml);
      } catch {
        // No spec found, skip
        return { changed: false, code, issues };
      }
      
      const variant = spec.ui?.variant;
      if (!variant || variant === 'default') {
        return { changed: false, code, issues };
      }
      
      // Expected className for this variant
      const expectedClass = variant === 'quiet' 
        ? 'ds-input ds-input--quiet w-full'
        : 'ds-input w-full';
      
      try {
        const ast = parser.parse(code, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx'],
        });
        
        traverse.default(ast, {
          JSXOpeningElement(path) {
            const name = path.node.name?.name;
            
            if (name !== 'input') return;
            
            const attrs = path.node.attributes || [];
            const classNameAttr = attrs.find(a => a.name?.name === 'className');
            
            if (!classNameAttr) return;
            
            const currentValue = classNameAttr.value?.value || '';
            
            if (currentValue !== expectedClass) {
              // Update className
              classNameAttr.value = {
                type: 'StringLiteral',
                value: expectedClass,
              };
              
              modified = true;
              issues.push({
                line: path.node.loc?.start.line,
                message: `Applied variant "${variant}" - className updated to: ${expectedClass}`,
              });
            }
          },
        });
        
        if (modified) {
          const output = generate.default(ast, {
            retainLines: true,
            compact: false,
          });
          code = output.code;
        }
      } catch (error) {
        issues.push({
          message: `Parse error: ${error.message}`,
        });
      }
      
      return {
        changed: modified,
        code,
        issues,
      };
    },
  };
}
```

##### **4f. Register Transform in Refiner**

```javascript
// scripts/refiner/index.mjs
import { applyVariantV1_0 } from './transforms/apply-variant-v1.0.mjs';

const transforms = [
  filterDomPropsV1_1(),
  dedupeJSXAttrsV1_2(),
  noInlineStylesV1_0(),
  labelContractV1_0(),
  telemetryPresenceV1_0(),
  applyVariantV1_0(), // ✨ NEW
];
```

#### **Step 5: Apply (Software Update)**

```bash
# 1. Update specs to use the new variant
# specs/fields/TextField.yaml
ui:
  variant: quiet

# specs/fields/EmailField.yaml
ui:
  variant: quiet

# 2. Run refiner to apply everywhere
pnpm refine:run --scope="packages/forms/src/fields/**/*.tsx"

# 3. Verify
pnpm -w build
pnpm generator:test
```

---

## 3️⃣ The Complete Loop

```
┌─────────────────────────────────────────────┐
│ 1. OBSERVE                                  │
│    Manual edit discovers better pattern     │
│    (e.g., ds-input--quiet looks great!)    │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│ 2. BATCH ANALYZE                            │
│    pnpm analyze:batch                       │
│    → See current state across all fields    │
│    → Identify how many need this            │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│ 3. UNDERSTAND                               │
│    Why is this better?                      │
│    → Less visual noise                      │
│    → Better UX for inline editing           │
│    Is this a pattern?                       │
│    → YES: UI variant                        │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│ 4. SYSTEMATIZE                              │
│    a) Add .ds-input--quiet to DS CSS        │
│    b) Add ui.variant to schema              │
│    c) Update factory-overlays.yaml          │
│    d) Update generator template             │
│    e) Create apply-variant refiner          │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│ 5. APPLY                                    │
│    a) Update field specs (ui.variant)       │
│    b) Run refiner: pnpm refine:run          │
│    c) Verify: pnpm build + test             │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│ 6. DOCUMENT                                 │
│    a) Add variant to DS docs                │
│    b) Update factory-overlays.yaml          │
│    c) Add example to PATTERNS.md            │
└─────────────────────────────────────────────┘
```

---

## 4️⃣ Real-World Examples

### Example 1: Add "Compact" Density

**Discovery:**
```tsx
// You manually made TextField more compact
<input className="ds-input w-full h-9 px-3 text-sm" />
```

**Systematize:**
1. Add `.ds-input--compact` to DS CSS
2. Add `ui.density: 'compact'` to schema
3. Update `factory-overlays.yaml`:
   ```yaml
   density:
     compact:
       minHeight: 36px
       padding: "8px 12px"
       fontSize: 14px
   ```
4. Update generator to apply density classes
5. Create refiner transform
6. Run software update

**Result:** All fields can now opt into compact density via spec.

### Example 2: Add Icon Support

**Discovery:**
```tsx
// You manually added an icon to EmailField
<div className="relative">
  <MailIcon className="absolute left-3 top-3" />
  <input className="ds-input w-full pl-10" />
</div>
```

**Systematize:**
1. Add icon rendering logic to generator
2. Add `ui.iconLeft` and `ui.iconRight` to schema
3. Update factory-overlays.yaml with icon defaults
4. No refiner needed (this is additive)
5. Update specs that want icons

**Result:** Any field can now have icons via spec.

### Example 3: Enforce Consistent Error Styling

**Discovery:**
```tsx
// Some fields have inconsistent error styling
<input className={hasError ? "ds-input ds-input--error" : "ds-input"} />
```

**Systematize:**
1. Standardize `.ds-input--error` in DS CSS
2. Create refiner transform to enforce consistent error classes
3. Run across all fields

**Result:** Error styling is now perfectly consistent.

---

## 5️⃣ Batch Configuration (factory-overlays.yaml)

### Purpose

**Single source of truth** for default settings across field types.

### Structure

```yaml
defaults:
  text: { ... }    # All text-like inputs
  email: { ... }   # Email-specific defaults
  select: { ... }  # Select/dropdown defaults

variants:
  default: { ... }
  quiet: { ... }
  danger: { ... }

archetypes:
  realtime: { ... }     # Frequent updates (search, tags)
  connected: { ... }    # Async validation, API calls
  sensitive: { ... }    # Privacy-critical (password, SSN)
```

### How Generator Uses It

```javascript
// Merge spec with factory overlays
const fieldType = spec.type || 'text';
const defaults = factoryOverlays.defaults[fieldType] || {};
const mergedSpec = merge(defaults, spec); // spec wins
```

### How Refiner Uses It

```javascript
// Optionally enforce defaults
if (enforcement.enforceVariants) {
  const expectedVariant = overlays.defaults[type].ui.variant;
  // Apply if missing
}
```

---

## 6️⃣ Success Metrics

### Before (Manual Style Propagation)
- ❌ Copy-paste changes across 22 files
- ❌ Inconsistencies creep in
- ❌ Hard to revert
- ❌ No systematic record
- ❌ Breaks on new fields

### After (Factory Way)
- ✅ Pattern codified once
- ✅ Perfect consistency
- ✅ Easy to revert (change spec/DS/refiner)
- ✅ Documented in factory-overlays.yaml
- ✅ Automatically applies to new fields

---

## 7️⃣ CLI Quick Reference

```bash
# Discover patterns
pnpm analyze:batch "packages/forms/src/fields/**/*.tsx"

# Save report
pnpm analyze:batch "..." > tmp/batch-report.json

# View outliers
pnpm analyze:batch "..." | jq '.aggregate.outliers'

# Apply style updates
pnpm refine:run --scope="packages/forms/src/fields/**/*.tsx"

# Verify
pnpm -w build && pnpm generator:test
```

---

## Philosophy

> "Don't copy diffs. Codify patterns.  
> The factory way is systematic, not manual.  
> Every improvement should scale automatically."

**This is what makes it God Tier.** 🏭✨
