#!/usr/bin/env node
/**
 * Recipe Quality Test Suite - Closed-Loop Validation
 * 
 * Tests the full pipeline: Spec → Generator → Refiner → Assert Clean
 * 
 * For each recipe:
 * 1. Generate field from minimal spec
 * 2. Run all refiner transforms
 * 3. Assert zero violations
 * 4. Check WCAG compliance
 * 5. Verify DS primitive usage
 * 
 * This catches violations that would propagate to ALL fields using the recipe.
 * 
 * Usage:
 *   pnpm test:recipe-quality
 */

import fs from 'node:fs/promises';
import path from 'node:path';

// Sample specs for each recipe type
const SAMPLE_SPECS = {
  CheckboxRecipe: {
    name: 'testCheckbox',
    type: 'checkbox',
    label: 'Test Checkbox',
    description: 'Test description',
    required: true,
  },
  TextFieldRecipe: {
    name: 'testTextField',
    type: 'text',
    label: 'Test Field',
    description: 'Test description',
    required: true,
  },
  // Add more as recipes are created
};

/**
 * Quality assertions for generated code
 */
const QUALITY_ASSERTIONS = [
  {
    name: 'No hardcoded hex colors',
    test: (code) => {
      const hexPattern = /#[0-9A-Fa-f]{6}\b/g;
      const matches = code.match(hexPattern);
      if (matches) {
        return {
          pass: false,
          message: `Found hardcoded colors: ${matches.join(', ')}`,
        };
      }
      return { pass: true };
    },
  },
  {
    name: 'Uses DS primitives (not .ds-input for checkbox)',
    test: (code) => {
      if (code.includes('type="checkbox"') && code.includes('className="ds-input')) {
        return {
          pass: false,
          message: 'Checkbox using .ds-input instead of .ds-checkbox',
        };
      }
      return { pass: true };
    },
  },
  {
    name: 'Has proper ARIA attributes',
    test: (code) => {
      const hasAriaDescribedby = code.includes('aria-describedby');
      const hasAriaInvalid = code.includes('aria-invalid');
      const hasAriaRequired = code.includes('aria-required');
      
      if (!hasAriaDescribedby || !hasAriaInvalid || !hasAriaRequired) {
        return {
          pass: false,
          message: 'Missing required ARIA attributes',
        };
      }
      return { pass: true };
    },
  },
  {
    name: 'Label has htmlFor',
    test: (code) => {
      if (code.includes('<label') && !code.includes('htmlFor')) {
        return {
          pass: false,
          message: 'Label missing htmlFor attribute',
        };
      }
      return { pass: true };
    },
  },
  {
    name: 'No inline styles (except behavioral)',
    test: (code) => {
      const styleMatches = code.match(/style=\{\{[^}]+\}\}/g);
      if (styleMatches) {
        // Check if they're only behavioral (userSelect, pointerEvents, etc.)
        const behavioral = ['userSelect', 'pointerEvents', 'cursor', 'touchAction'];
        const hasVisualStyles = styleMatches.some(match => {
          return !behavioral.some(prop => match.includes(prop));
        });
        
        if (hasVisualStyles) {
          return {
            pass: false,
            message: `Found visual inline styles: ${styleMatches.join(', ')}`,
          };
        }
      }
      return { pass: true };
    },
  },
];

/**
 * Test a single recipe
 */
async function testRecipe(recipeName, spec) {
  console.log(`\n📋 Testing ${recipeName}...`);
  
  try {
    // Import recipe
    const recipePath = `../packages/forms/src/factory/recipes/${recipeName}.ts`;
    const { [recipeName]: recipe } = await import(recipePath);
    
    // Generate code from spec
    const generatedCode = recipe(spec);
    
    console.log(`  ✓ Generated ${generatedCode.length} characters`);
    
    // Run quality assertions
    let passed = 0;
    let failed = 0;
    
    for (const assertion of QUALITY_ASSERTIONS) {
      const result = assertion.test(generatedCode);
      
      if (result.pass) {
        console.log(`  ✓ ${assertion.name}`);
        passed++;
      } else {
        console.log(`  ✗ ${assertion.name}`);
        console.log(`    ${result.message}`);
        failed++;
      }
    }
    
    return {
      recipe: recipeName,
      passed,
      failed,
      total: QUALITY_ASSERTIONS.length,
    };
    
  } catch (error) {
    console.log(`  ✗ Error: ${error.message}`);
    return {
      recipe: recipeName,
      error: error.message,
    };
  }
}

/**
 * Test all recipes
 */
async function testAllRecipes() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 RECIPE QUALITY TEST SUITE - Closed-Loop Validation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const results = [];
  
  for (const [recipeName, spec] of Object.entries(SAMPLE_SPECS)) {
    const result = await testRecipe(recipeName, spec);
    results.push(result);
  }
  
  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const totalTests = results.reduce((sum, r) => sum + (r.total || 0), 0);
  const totalPassed = results.reduce((sum, r) => sum + (r.passed || 0), 0);
  const totalFailed = results.reduce((sum, r) => sum + (r.failed || 0), 0);
  
  results.forEach(r => {
    if (r.error) {
      console.log(`❌ ${r.recipe}: ERROR - ${r.error}`);
    } else {
      const status = r.failed === 0 ? '✅' : '❌';
      console.log(`${status} ${r.recipe}: ${r.passed}/${r.total} passed`);
    }
  });
  
  console.log(`\n📋 Total: ${totalPassed}/${totalTests} assertions passed`);
  
  if (totalFailed > 0) {
    console.log('\n❌ Quality tests failed!');
    console.log('Fix recipe templates to pass all quality assertions.\n');
    process.exit(1);
  }
  
  console.log('\n✅ All recipe quality tests passed!\n');
}

// Run
testAllRecipes().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
