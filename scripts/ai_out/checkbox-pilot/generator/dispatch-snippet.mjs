/**
 * Generator Dispatch Update for CheckboxField
 * 
 * INSTRUCTIONS:
 * Manually merge this code into:
 * scripts/process/field-from-spec-v2.mjs
 * 
 * Location: Around line 273 (in generateFormsField function)
 */

// ============================================================
// STEP 1: Add import at the top of the file (after line 43)
// ============================================================

import { CheckboxRecipe } from './recipes/CheckboxRecipe.js';


// ============================================================
// STEP 2: Add type dispatch logic before line 299
// (After the composite check, before "SIMPLE FIELDS" comment)
// ============================================================

function generateFormsField(spec, allowlist) {
  const { name, type, props = [], value, aria, description } = spec;
  
  // ============================================================
  // COMPOSITE FIELDS - Use dedicated generator
  // ============================================================
  if (type === 'composite') {
    const implementation = generateCompositeField(spec, allowlist);
    // ... existing composite logic
    return;
  }
  
  // ============================================================
  // TYPE-SPECIFIC RECIPES - NEW! Route by input type
  // ============================================================
  
  // Checkbox gets special treatment
  if (type === 'checkbox' || type === 'boolean') {
    const implementation = CheckboxRecipe(spec);
    
    // Write to file
    const fieldDir = path.join(ROOT, `packages/forms/src/fields/${name}`);
    fs.mkdirSync(fieldDir, { recursive: true });
    
    const fieldPath = path.join(fieldDir, `${name}.tsx`);
    fs.writeFileSync(fieldPath, implementation);
    console.log(`   ✅ Created: ${fieldPath}`);
    
    // Create barrel export
    const barrelPath = path.join(fieldDir, 'index.ts');
    fs.writeFileSync(barrelPath, `export * from './${name}';\n`);
    
    // Update main fields index
    updateFieldsIndex(name);
    
    return; // Exit early - don't fall through to simple fields
  }
  
  // ============================================================
  // SIMPLE FIELDS - Use existing logic (unchanged)
  // ============================================================
  
  // ... rest of existing generateFormsField code
}


// ============================================================
// ALTERNATIVE: Helper function approach (more scalable)
// ============================================================

/**
 * Select recipe based on field type
 * Add this function before generateFormsField
 */
function selectRecipe(spec) {
  const type = (spec?.type || '').toLowerCase();
  
  // Type-specific recipes
  if (type === 'checkbox' || type === 'boolean') {
    return CheckboxRecipe;
  }
  
  // Future additions:
  // if (type === 'toggle') return ToggleRecipe;
  // if (type === 'rating') return RatingRecipe;
  // if (type === 'slider' || type === 'range') return SliderRecipe;
  // if (type === 'file') return FileUploadRecipe;
  // if (type === 'color') return ColorPickerRecipe;
  // if (type === 'select' && spec.ui?.multiple) return MultiSelectRecipe;
  
  // Standard text inputs use existing generator
  if (['text', 'email', 'url', 'tel', 'number', 'date', 'time', 'datetime-local'].includes(type)) {
    return null; // Use existing inline generator
  }
  
  return null; // Fallback to existing generator
}

/**
 * Then modify generateFormsField to use selectRecipe:
 */
function generateFormsField(spec, allowlist) {
  const { name, type } = spec;
  
  // Try type-specific recipe first
  const recipe = selectRecipe(spec);
  if (recipe) {
    const implementation = recipe(spec);
    
    // Write to file
    const fieldDir = path.join(ROOT, `packages/forms/src/fields/${name}`);
    fs.mkdirSync(fieldDir, { recursive: true });
    fs.writeFileSync(path.join(fieldDir, `${name}.tsx`), implementation);
    fs.writeFileSync(path.join(fieldDir, 'index.ts'), `export * from './${name}';\n`);
    updateFieldsIndex(name);
    
    console.log(`   ✅ Created (via ${recipe.name}): packages/forms/src/fields/${name}/${name}.tsx`);
    return;
  }
  
  // Fall back to existing inline generator for simple text inputs
  // ... rest of existing code unchanged
}


// ============================================================
// RECOMMENDATION
// ============================================================

/**
 * Use the "Helper function approach" above. It's cleaner and more scalable.
 * 
 * Benefits:
 * 1. Single dispatch point (selectRecipe)
 * 2. Easy to add new type-specific recipes
 * 3. Existing inline generator still works for text inputs
 * 4. Clear separation of concerns
 * 
 * Implementation steps:
 * 1. Add CheckboxRecipe import at top
 * 2. Add selectRecipe() function before generateFormsField
 * 3. Add recipe check at START of generateFormsField
 * 4. Return early if recipe found
 * 5. Existing code remains as fallback
 */
