#!/usr/bin/env node
/**
 * Recipe Validator - Prevents bad templates from propagating violations
 * 
 * Validates recipe templates BEFORE they generate fields.
 * Runs all refiner transforms on synthetic output to catch violations.
 * 
 * Usage:
 *   pnpm validate:recipe CheckboxRecipe
 *   pnpm validate:recipes  # All recipes
 * 
 * Philosophy:
 * "Trust but verify" - Even templates need validation.
 * Catch violations at the source, not in generated code.
 */

import path from 'node:path';
import fs from 'node:fs/promises';
import { glob } from 'glob';
import { noHardcodedColorsV1_0 } from '../refiner/transforms/no-hardcoded-colors-v1.0.mjs';
import { enforceWCAGContrastV1_0 } from '../refiner/transforms/enforce-wcag-contrast.mjs';
import { labelContractV1_0 } from '../refiner/transforms/label-contract-v1.0.mjs';

// Transforms to run on recipe templates
const RECIPE_VALIDATORS = [
  noHardcodedColorsV1_0(),
  enforceWCAGContrastV1_0(),
  labelContractV1_0(),
];

/**
 * Generate synthetic output from recipe to validate
 */
async function generateSyntheticOutput(recipePath) {
  const recipeCode = await fs.readFile(recipePath, 'utf8');
  
  // Extract template strings from recipe
  // Look for return statements with template literals
  const templateRegex = /return\s+`([\s\S]*?)`/g;
  const matches = [...recipeCode.matchAll(templateRegex)];
  
  if (matches.length === 0) {
    return null; // Recipe doesn't use templates
  }
  
  // Get the template content
  const template = matches[0][1];
  
  // Replace template variables with sample values for validation
  const synthetic = template
    .replace(/\$\{name\}/g, 'sampleField')
    .replace(/\$\{label\}/g, 'Sample Label')
    .replace(/\$\{description\}/g, 'Sample description')
    .replace(/\$\{required\}/g, 'true')
    .replace(/\$\{disabled\}/g, 'false')
    .replace(/\$\{.*?\}/g, ''); // Remove other variables
  
  return synthetic;
}

/**
 * Validate a single recipe
 */
async function validateRecipe(recipePath) {
  const recipeName = path.basename(recipePath, '.ts');
  console.log(`\n📋 Validating ${recipeName}...`);
  
  try {
    // Generate synthetic output
    const syntheticOutput = await generateSyntheticOutput(recipePath);
    
    if (!syntheticOutput) {
      console.log(`  ⚠️  No template found (might use AST generation)`);
      return { recipe: recipeName, status: 'skipped' };
    }
    
    // Run validators on synthetic output
    const violations = [];
    
    for (const validator of RECIPE_VALIDATORS) {
      const result = await validator.apply({
        file: recipePath,
        code: syntheticOutput,
      });
      
      if (result.issues && result.issues.length > 0) {
        violations.push({
          validator: validator.name,
          issues: result.issues,
        });
      }
    }
    
    if (violations.length === 0) {
      console.log(`  ✅ Clean - no violations`);
      return { recipe: recipeName, status: 'clean' };
    }
    
    // Report violations
    console.log(`  ❌ Found ${violations.length} validator(s) with issues:`);
    violations.forEach(({ validator, issues }) => {
      console.log(`\n  ${validator}:`);
      issues.forEach(issue => {
        console.log(`    - ${issue.message || issue.type}`);
      });
    });
    
    return {
      recipe: recipeName,
      status: 'violations',
      violations,
    };
    
  } catch (error) {
    console.log(`  ❌ Validation error: ${error.message}`);
    return {
      recipe: recipeName,
      status: 'error',
      error: error.message,
    };
  }
}

/**
 * Validate all recipes
 */
async function validateAllRecipes() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 RECIPE VALIDATOR - Transcendent God Tier');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const recipeFiles = await glob('packages/forms/src/factory/recipes/**/*.ts', {
    ignore: ['**/*.test.*', '**/*.spec.*'],
  });
  
  console.log(`\nFound ${recipeFiles.length} recipe(s)\n`);
  
  const results = [];
  
  for (const recipePath of recipeFiles) {
    const result = await validateRecipe(recipePath);
    results.push(result);
  }
  
  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const clean = results.filter(r => r.status === 'clean').length;
  const violations = results.filter(r => r.status === 'violations').length;
  const errors = results.filter(r => r.status === 'error').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  
  console.log(`✅ Clean:      ${clean}`);
  console.log(`❌ Violations: ${violations}`);
  console.log(`⚠️  Errors:     ${errors}`);
  console.log(`⏭️  Skipped:    ${skipped}`);
  console.log(`\n📋 Total:      ${results.length}`);
  
  if (violations > 0 || errors > 0) {
    console.log('\n❌ Recipe validation failed!');
    console.log('Fix violations in recipe templates before they generate bad code.\n');
    process.exit(1);
  }
  
  console.log('\n✅ All recipes validated successfully!\n');
}

// Run
validateAllRecipes().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
