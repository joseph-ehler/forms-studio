#!/usr/bin/env node
/**
 * Generated Code Validator - Jidoka (Built-in Quality)
 * 
 * Validates that generated components follow Toyota Standard Work:
 * - All SKIN keys present and complete
 * - All variants registered in variants.config.ts
 * - All fields registered in field-types.ts
 * - All components have stories
 * - All files follow naming conventions
 * 
 * Usage:
 *   pnpm validate:generated
 *   node scripts/validate-generated.mjs
 * 
 * Exit codes:
 *   0 - All validations passed
 *   1 - Validation failures detected
 * 
 * Principles:
 * - Jidoka: Stop the line if quality issues found
 * - Poka-Yoke: Prevent incomplete generation from landing
 * - Andon: Clear signals when something is wrong
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const ROOT = process.cwd();
const DS_PATH = join(ROOT, 'packages/ds/src');
const FORMS_PATH = join(ROOT, 'packages/forms/src');

let errors = [];
let warnings = [];
let checks = 0;

function error(msg) {
  errors.push(msg);
}

function warn(msg) {
  warnings.push(msg);
}

function check(label) {
  checks++;
  return {
    pass: () => console.log(`✅ ${label}`),
    fail: (msg) => {
      console.log(`❌ ${label}`);
      error(msg);
    },
    warn: (msg) => {
      console.log(`⚠️  ${label}`);
      warn(msg);
    },
  };
}

console.log('');
console.log('🏭 Validating Generated Code (Jidoka)');
console.log('');

// ============================================
// 1. Validate DS Components
// ============================================

console.log('📦 DS Components');
console.log('');

// Read variants config
const variantsConfigPath = join(DS_PATH, 'control/variants.config.ts');
if (!existsSync(variantsConfigPath)) {
  error('Missing variants.config.ts');
} else {
  const variantsConfig = await readFile(variantsConfigPath, 'utf-8');
  
  // Extract component names from variants config (only within `variants` object)
  const variantsObjectMatch = variantsConfig.match(/export const variants = \{([^}]+)\}/s);
  if (!variantsObjectMatch) {
    error('Could not parse variants object');
  }
  const variantsObjectContent = variantsObjectMatch ? variantsObjectMatch[1] : '';
  const componentMatches = [...variantsObjectContent.matchAll(/^\s+(\w+):\s*\[/gm)];
  const components = componentMatches.map(m => m[1]);
  
  console.log(`Found ${components.length} components in variants.config.ts`);
  console.log('');
  
  for (const component of components) {
    const componentName = component.charAt(0).toUpperCase() + component.slice(1);
    
    // Check component file exists
    const componentPath = join(DS_PATH, 'fb', `${componentName}.tsx`);
    if (!existsSync(componentPath)) {
      check(`${componentName}: Component file exists`).fail(
        `Missing: ${componentPath}`
      );
      continue;
    }
    
    // Check CSS file exists
    const cssPath = join(DS_PATH, 'fb', `${componentName}.css`);
    if (!existsSync(cssPath)) {
      check(`${componentName}: CSS file exists`).warn(
        `Missing: ${cssPath}`
      );
    } else {
      check(`${componentName}: CSS file exists`).pass();
    }
    
    // Check SKIN file exists
    const skinPath = join(DS_PATH, 'registry/skins', `${component}.skin.ts`);
    if (!existsSync(skinPath)) {
      check(`${componentName}: SKIN file exists`).fail(
        `Missing: ${skinPath}`
      );
      continue;
    } else {
      check(`${componentName}: SKIN file exists`).pass();
    }
    
    // Validate SKIN completeness
    const skinContent = await readFile(skinPath, 'utf-8');
    const variantMatches = [...variantsConfig.matchAll(
      new RegExp(`${component}:\\s*\\[([^\\]]+)\\]`, 'gs')
    )];
    
    if (variantMatches.length > 0) {
      const variantsStr = variantMatches[0][1];
      const variants = [...variantsStr.matchAll(/'([^']+)'/g)].map(m => m[1]);
      
      let allPresent = true;
      for (const variant of variants) {
        if (!skinContent.includes(`${variant}:`)) {
          check(`${componentName}: SKIN has variant '${variant}'`).fail(
            `Variant '${variant}' missing from SKIN`
          );
          allPresent = false;
        }
      }
      
      if (allPresent) {
        check(`${componentName}: All variants in SKIN`).pass();
      }
    }
    
    // Check stories exist
    const storiesPath = join(DS_PATH, 'fb', `${componentName}.stories.tsx`);
    if (!existsSync(storiesPath)) {
      check(`${componentName}: Stories exist`).warn(
        `Missing: ${storiesPath}`
      );
    } else {
      check(`${componentName}: Stories exist`).pass();
      
      // Validate stories have Matrix export
      const storiesContent = await readFile(storiesPath, 'utf-8');
      if (!storiesContent.includes('export const Matrix')) {
        check(`${componentName}: Matrix story exists`).warn(
          'Matrix story missing (recommended for visual regression)'
        );
      } else {
        check(`${componentName}: Matrix story exists`).pass();
      }
    }
    
    console.log('');
  }
}

// ============================================
// 2. Validate Forms Fields
// ============================================

console.log('📋 Forms Fields');
console.log('');

const fieldsPath = join(FORMS_PATH, 'fields');
if (existsSync(fieldsPath)) {
  const fields = await readdir(fieldsPath, { withFileTypes: true });
  const fieldDirs = fields.filter(f => f.isDirectory()).map(f => f.name);
  
  console.log(`Found ${fieldDirs.length} fields in fields/`);
  console.log('');
  
  // Read contracts
  const contractsPath = join(FORMS_PATH, 'control/field-contracts.ts');
  let contractsContent = '';
  if (existsSync(contractsPath)) {
    contractsContent = await readFile(contractsPath, 'utf-8');
  }
  
  // Read registry
  const registryPath = join(FORMS_PATH, 'registry/field-types.ts');
  let registryContent = '';
  if (existsSync(registryPath)) {
    registryContent = await readFile(registryPath, 'utf-8');
  }
  
  for (const fieldName of fieldDirs) {
    // Check field component exists
    const fieldPath = join(fieldsPath, fieldName, `${fieldName}.tsx`);
    if (!existsSync(fieldPath)) {
      check(`${fieldName}: Component file exists`).fail(
        `Missing: ${fieldPath}`
      );
      continue;
    } else {
      check(`${fieldName}: Component file exists`).pass();
    }
    
    // Check contract exists
    if (!contractsContent.includes(`${fieldName}Config`)) {
      check(`${fieldName}: Config type exists`).fail(
        `Missing ${fieldName}Config in field-contracts.ts`
      );
    } else {
      check(`${fieldName}: Config type exists`).pass();
    }
    
    // Check registry entry
    if (!registryContent.includes(`import { ${fieldName} }`)) {
      check(`${fieldName}: Registered in registry`).fail(
        `Missing import in field-types.ts`
      );
    } else if (!registryContent.includes(`registerField('`) || 
               !registryContent.includes(fieldName)) {
      check(`${fieldName}: Registered in registry`).fail(
        `Missing registerField() call in field-types.ts`
      );
    } else {
      check(`${fieldName}: Registered in registry`).pass();
    }
    
    // Check stories exist
    const storiesPath = join(fieldsPath, fieldName, `${fieldName}.stories.tsx`);
    if (!existsSync(storiesPath)) {
      check(`${fieldName}: Stories exist`).warn(
        `Missing: ${storiesPath}`
      );
    } else {
      check(`${fieldName}: Stories exist`).pass();
    }
    
    // Check composes DS primitive (no direct Flowbite)
    const fieldContent = await readFile(fieldPath, 'utf-8');
    if (fieldContent.includes("from 'flowbite-react'") ||
        fieldContent.includes('from "flowbite-react"')) {
      check(`${fieldName}: No direct Flowbite imports`).fail(
        'Field should compose DS primitives, not import Flowbite directly'
      );
    } else {
      check(`${fieldName}: No direct Flowbite imports`).pass();
    }
    
    console.log('');
  }
} else {
  warn('Forms fields directory does not exist yet');
}

// ============================================
// 3. Summary
// ============================================

console.log('');
console.log('═'.repeat(60));
console.log('');
console.log(`📊 Validation Summary`);
console.log(`   Checks run: ${checks}`);
console.log(`   Errors: ${errors.length}`);
console.log(`   Warnings: ${warnings.length}`);
console.log('');

if (errors.length > 0) {
  console.log('❌ VALIDATION FAILED (Jidoka: Stop the line)');
  console.log('');
  console.log('Errors:');
  errors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
  console.log('');
  console.log('Fix these issues before merging.');
  process.exit(1);
}

if (warnings.length > 0) {
  console.log('⚠️  VALIDATION PASSED WITH WARNINGS');
  console.log('');
  console.log('Warnings:');
  warnings.forEach((w, i) => console.log(`  ${i + 1}. ${w}`));
  console.log('');
  console.log('Consider addressing these for best practices.');
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ ALL VALIDATIONS PASSED');
  console.log('');
  console.log('🏭 Generated code meets Toyota Standard Work quality.');
}

console.log('');
