/**
 * Generator Dispatch Snippet for ToggleRecipe
 * 
 * Add this to scripts/process/field-from-spec-v2.mjs
 * 
 * This enables the generator to route type: 'toggle' specs
 * to the ToggleRecipe template.
 * 
 * Integration Steps:
 * 1. Import ToggleRecipe at top of file
 * 2. Add toggle case to selectRecipe() helper
 * 3. Test with sample spec
 */

// ============================================
// STEP 1: Add import at top of file
// ============================================

// Add this line near the other recipe imports:
import { ToggleRecipe } from '../packages/forms/src/factory/recipes/ToggleRecipe.ts';

// ============================================
// STEP 2: Update selectRecipe() helper
// ============================================

/**
 * Select the appropriate recipe based on field type
 * 
 * This helper function routes specs to type-specific recipes.
 * Falls back to generic TextInputRecipe for unknown types.
 */
function selectRecipe(spec) {
  // Route by type
  switch (spec.type) {
    case 'checkbox':
      return CheckboxRecipe(spec);
    
    case 'toggle':
      return ToggleRecipe(spec);  // ← ADD THIS CASE
    
    case 'text':
    case 'email':
    case 'tel':
    case 'url':
    case 'number':
    default:
      return TextInputRecipe(spec);
  }
}

// ============================================
// STEP 3: Test with sample spec
// ============================================

// Run this to verify toggle routing works:
// 
// echo '{
//   "name": "notifications",
//   "type": "toggle",
//   "label": "Enable Notifications",
//   "description": "Receive email notifications for new messages",
//   "required": false,
//   "ui": {
//     "size": "md",
//     "onLabel": "On",
//     "offLabel": "Off"
//   },
//   "value": {
//     "default": false
//   }
// }' | node scripts/process/field-from-spec-v2.mjs

// Expected output:
// - Component uses <input type="checkbox" role="switch">
// - className="ds-toggle" (not .ds-input)
// - Label wraps input for ≥ 44×44px hit area
// - Boolean value/onChange
// - Shows "On"/"Off" state labels

// ============================================
// ALTERNATIVE: Inline dispatch (if no helper)
// ============================================

// If you don't have a selectRecipe() helper yet,
// you can add this inline in the main generation logic:

/*
// In the main field generation function:
async function generateField(spec) {
  let componentCode;
  
  // Type-specific recipe selection
  if (spec.type === 'checkbox') {
    const { CheckboxRecipe } = await import('../packages/forms/src/factory/recipes/CheckboxRecipe.ts');
    componentCode = CheckboxRecipe(spec);
  } else if (spec.type === 'toggle') {
    const { ToggleRecipe } = await import('../packages/forms/src/factory/recipes/ToggleRecipe.ts');
    componentCode = ToggleRecipe(spec);
  } else {
    // Fallback to generic text input recipe
    componentCode = TextInputRecipe(spec);
  }
  
  // ... rest of generation logic
  return componentCode;
}
*/

// ============================================
// VERIFICATION CHECKLIST
// ============================================

// After integration, verify:
// ✓ Import resolves correctly
// ✓ Toggle spec routes to ToggleRecipe (not TextInputRecipe)
// ✓ Generated code uses .ds-toggle class
// ✓ Generated code has role="switch"
// ✓ Generated code passes TypeScript compilation
// ✓ Generated code passes refiner dry-run

// Test command:
// pnpm refine:dry --scope='path/to/generated/toggle-field.tsx'

// ============================================
// SAMPLE SPECS FOR TESTING
// ============================================

/**
 * Basic Toggle
 */
const basicToggleSpec = {
  name: 'darkMode',
  type: 'toggle',
  label: 'Dark Mode',
  description: 'Switch to dark theme',
};

/**
 * Toggle with Size Variant
 */
const smallToggleSpec = {
  name: 'compactView',
  type: 'toggle',
  label: 'Compact View',
  ui: { size: 'sm' },
};

/**
 * Toggle with State Labels
 */
const labeledToggleSpec = {
  name: 'autoSave',
  type: 'toggle',
  label: 'Auto Save',
  description: 'Automatically save your work',
  ui: {
    size: 'md',
    onLabel: 'Enabled',
    offLabel: 'Disabled',
  },
  value: { default: true },
};

/**
 * Required Toggle
 */
const requiredToggleSpec = {
  name: 'termsAccepted',
  type: 'toggle',
  label: 'Accept Terms & Conditions',
  required: true,
  ui: { size: 'lg' },
};

// ============================================
// TROUBLESHOOTING
// ============================================

/**
 * Issue: Import path not found
 * Solution: Verify recipe file exists at exact path
 * Command: ls -la packages/forms/src/factory/recipes/ToggleRecipe.ts
 */

/**
 * Issue: Still generating with .ds-input
 * Solution: Check if toggle case is before default case in switch
 * Verify: console.log(spec.type) to confirm routing
 */

/**
 * Issue: TypeScript errors in generated code
 * Solution: Ensure ToggleRecipe imports are correct
 * Run: pnpm --filter @intstudio/forms typecheck
 */

export { selectRecipe, basicToggleSpec, smallToggleSpec, labeledToggleSpec, requiredToggleSpec };
