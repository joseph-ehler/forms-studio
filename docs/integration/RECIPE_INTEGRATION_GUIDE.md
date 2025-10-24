# Recipe Integration Guide - Paste-Ready Code

## Part 1: Generator Integration (field-from-spec-v2.mjs)

### Step 1: Add Import

**Location:** Line 44-45 (after existing recipe imports)

```javascript
import { CheckboxRecipe } from '../../packages/forms/src/factory/recipes/CheckboxRecipe.js';
import { ToggleRecipe } from '../../packages/forms/src/factory/recipes/ToggleRecipe.js';
// ADD THIS:
import { SimpleListRecipe } from '../../packages/forms/src/factory/recipes/SimpleListRecipe.js';
// FUTURE:
// import { MultiSelectRecipe } from '../../packages/forms/src/factory/recipes/MultiSelectRecipe.js';
// import { AsyncSearchSelectRecipe } from '../../packages/forms/src/factory/recipes/AsyncSearchSelectRecipe.js';
```

### Step 2: Update selectRecipe Function

**Location:** Line 159-174 (replace existing selectRecipe function)

```javascript
/**
 * Select recipe based on field type + ui.behavior
 * Routes specs to specialized recipes
 */
function selectRecipe(spec) {
  const type = (spec?.type || '').toLowerCase();
  const behavior = spec?.ui?.behavior;
  
  // Type-specific recipes (inline controls)
  if (type === 'checkbox' || type === 'boolean') {
    return CheckboxRecipe;
  }
  
  if (type === 'toggle' || type === 'switch') {
    return ToggleRecipe;
  }
  
  // SELECT FIELD RECIPES (overlay-based)
  if (type === 'select') {
    // Multi-select with checkboxes
    if (spec?.ui?.multiple) {
      // return MultiSelectRecipe; // TODO: Not implemented yet
      return SimpleListRecipe; // Fallback for now
    }
    
    // Async search with virtualization
    if (behavior === 'async-search') {
      // return AsyncSearchSelectRecipe; // TODO: Not implemented yet
      return SimpleListRecipe; // Fallback for now
    }
    
    // Tag selection (chips)
    if (behavior === 'tag-select') {
      // return TagSelectRecipe; // TODO: Not implemented yet
      return SimpleListRecipe; // Fallback for now
    }
    
    // Default: simple list with optional search
    return SimpleListRecipe;
  }
  
  // DATE FIELD RECIPES
  if (type === 'date') {
    // return DatePickerRecipe; // TODO: Not implemented yet
    return null; // For now, use legacy generator
  }
  
  if (type === 'dateRange') {
    // return DateRangeRecipe; // TODO: Not implemented yet
    return null; // For now, use legacy generator
  }
  
  // Future recipes:
  // if (type === 'rating') return RatingRecipe;
  // if (type === 'slider' || type === 'range') return SliderRecipe;
  // if (type === 'file') return FileUploadRecipe;
  
  // No recipe available - use legacy generator
  return null;
}
```

### Step 3: Update Recipe Invocation (No Changes Needed!)

The existing recipe invocation at line 332 already handles this correctly:

```javascript
const recipe = selectRecipe(spec);
if (recipe) {
  const implementation = recipe(spec);
  // ... writes to file ...
  return; // Exit early - recipe handled everything
}
```

---

## Part 2: Recipe Context Creation

Recipes need access to control, env, ports, etc. Add this helper:

### Add Helper Function

**Location:** After selectRecipe function (~line 200)

```javascript
/**
 * Create recipe context from spec
 */
function createRecipeContext(spec) {
  return {
    spec,
    overlays: overlays.defaults || {},
    ports: {
      // TODO: Wire actual ports
      optionSource: null,
      telemetry: null
    },
    env: {
      isMobile: false // Generator context - always desktop
    },
    // Note: control will be provided at runtime by Controller
    control: null
  };
}
```

### Update Recipe Invocation

**Location:** Replace lines 332-347

```javascript
const recipe = selectRecipe(spec);
if (recipe) {
  // Create recipe context
  const ctx = createRecipeContext(spec);
  
  // Get implementation
  const implementation = recipe(ctx);
  
  // Recipe returns { Trigger, Overlay } components
  // We need to wrap them in a field component
  const fieldComponent = generateFieldFromRecipe(spec, implementation);
  
  // Write to file
  const fieldDir = path.join(ROOT, `packages/forms/src/fields/${name}`);
  fs.mkdirSync(fieldDir, { recursive: true });
  fs.writeFileSync(path.join(fieldDir, `${name}.tsx`), fieldComponent, 'utf8');
  
  // Update main fields index
  updateFieldsIndex(name);
  
  console.log(`   ✅ Created (via ${recipe.name || 'recipe'}): packages/forms/src/fields/${name}/${name}.tsx`);
  console.log(`   ✅ Updated: packages/forms/src/fields/index.ts`);
  return; // Exit early - recipe handled everything
}
```

---

## Part 3: Field Wrapper Generator

Add this function to wrap recipe components in a proper field:

**Location:** After createRecipeContext function

```javascript
/**
 * Generate field component from recipe
 */
function generateFieldFromRecipe(spec, recipeComponents) {
  const { name, label, description, required, disabled } = spec;
  
  return `/**
 * ${name} - Generated from spec with ${spec.type} recipe
 * 
 * This field uses the recipe system for overlay behavior.
 * DO NOT edit directly - regenerate from spec!
 */

import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import { SimpleListRecipe } from '../../factory/recipes/SimpleListRecipe';
import { FormLabel } from '../../components/FormLabel/FormLabel';

export interface ${name}Props {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  control?: Control;
  defaultValue?: string;
}

export const ${name}: React.FC<${name}Props> = ({
  name,
  label = ${JSON.stringify(label)},
  description = ${JSON.stringify(description)},
  required = ${required || false},
  disabled = ${disabled || false},
  control: externalControl,
  defaultValue
}) => {
  const formContext = useFormContext();
  const control = externalControl || formContext?.control;
  
  if (!control) {
    throw new Error('${name} must be used within a form context or receive control prop');
  }
  
  const [isOpen, setIsOpen] = useState(false);
  
  // Create recipe context
  const recipeCtx = {
    spec: ${JSON.stringify(spec, null, 2)},
    overlays: {},
    ports: {},
    env: { isMobile: false },
    control
  };
  
  // Get recipe components
  const { Trigger, Overlay } = SimpleListRecipe(recipeCtx);
  
  return (
    <div className="field-wrapper">
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        rules={{ required: required ? 'This field is required' : undefined }}
        render={({ field, fieldState }) => {
          const hasError = !!fieldState.error;
          
          return (
            <>
              {label && (
                <FormLabel htmlFor={name} required={required} size="md">
                  {label}
                </FormLabel>
              )}
              
              <Trigger 
                field={field}
                hasError={hasError}
                disabled={disabled}
              />
              
              <Overlay
                open={isOpen}
                onClose={() => setIsOpen(false)}
                field={field}
              />
              
              {description && (
                <p 
                  id={\`\${name}-desc\`}
                  style={{
                    marginTop: '4px',
                    fontSize: '13px',
                    color: 'var(--ds-color-text-muted)'
                  }}
                >
                  {description}
                </p>
              )}
              
              {hasError && (
                <p
                  role="alert"
                  aria-live="polite"
                  style={{
                    marginTop: '4px',
                    fontSize: '13px',
                    color: 'var(--ds-color-state-danger)'
                  }}
                >
                  {fieldState.error?.message}
                </p>
              )}
            </>
          );
        }}
      />
    </div>
  );
};
`;
}
```

---

## Testing the Integration

### 1. Create a Test Spec

**File:** `specs/fields/TestSelectField.yaml`

```yaml
name: TestSelectField
type: select
label: Test Select
placeholder: Choose an option
required: false
disabled: false

options:
  - value: "opt1"
    label: "Option 1"
  - value: "opt2"
    label: "Option 2"
  - value: "opt3"
    label: "Option 3"

ui:
  searchable: true
  focusSearchOnOpen: true
  inlineThreshold: 4

validation:
  required: false

telemetry:
  enabled: false
```

### 2. Generate the Field

```bash
node scripts/process/field-from-spec-v2.mjs TestSelectField
```

### 3. Expected Output

```
✅ Spec valid: specs/fields/TestSelectField.yaml
✅ Created (via SimpleListRecipe): packages/forms/src/fields/TestSelectField/TestSelectField.tsx
✅ Updated: packages/forms/src/fields/index.ts
```

### 4. Verify the Generated Code

Check `packages/forms/src/fields/TestSelectField/TestSelectField.tsx`:
- Should import SimpleListRecipe
- Should call recipe with context
- Should render Trigger + Overlay
- Should handle form state

---

## Troubleshooting

### Issue: "Cannot find module SimpleListRecipe"

**Fix:** Ensure the recipe is exported from the barrel:

```typescript
// packages/forms/src/factory/recipes/index.ts
export { SimpleListRecipe } from './SimpleListRecipe';
```

### Issue: "Recipe is not a function"

**Fix:** Check the recipe signature:

```typescript
export const SimpleListRecipe: Recipe = (ctx: RecipeContext) => {
  // ... recipe logic ...
  return { Trigger, Overlay };
};
```

### Issue: "control is undefined"

**Fix:** Ensure field is used within `<FormProvider>`:

```tsx
<FormProvider {...methods}>
  <TestSelectField name="test" />
</FormProvider>
```

---

## Next Steps

Once SimpleListRecipe integration works:

1. **Migrate SelectField** - Update existing to use recipe
2. **Build MultiSelectRecipe** - Add checkboxes + footer
3. **Add AsyncSearchSelectRecipe** - Debounce + virtualization
4. **Create DatePickerRecipe** - Calendar UI
5. **Add Refiner Rules** - Enforce overlay patterns

---

## Summary

**What Changed:**
- ✅ Added SimpleListRecipe import
- ✅ Updated selectRecipe() dispatch logic
- ✅ Added createRecipeContext() helper
- ✅ Added generateFieldFromRecipe() wrapper
- ✅ Recipe invocation stays the same

**Result:**
- Select fields now use composable recipe system
- Easy to add new recipes (MultiSelect, AsyncSearch, etc.)
- Generated fields are thin wrappers around recipes
- All overlay logic centralized in DS + recipes
