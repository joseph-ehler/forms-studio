#!/usr/bin/env node
/**
 * Field Spec Validator
 * 
 * Validates YAML field specs against the JSON Schema.
 * Used by the generator to fail fast with helpful error messages.
 * 
 * Usage:
 *   node scripts/process/validate-spec.mjs specs/fields/SliderField.yaml
 */

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ROOT = process.cwd();
const SCHEMA_PATH = path.join(ROOT, 'specs/_schema.json');

/**
 * Validate a field spec
 * @param {string} specPath - Path to YAML spec file
 * @returns {{ valid: boolean, errors: any[] }}
 */
export function validateSpec(specPath) {
  try {
    // Load schema
    const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
    
    // Load spec
    const spec = yaml.load(fs.readFileSync(specPath, 'utf8'));
    
    // Create validator
    const ajv = new Ajv({ allErrors: true, verbose: true });
    addFormats(ajv);
    const validate = ajv.compile(schema);
    
    // Validate
    const valid = validate(spec);
    
    if (!valid) {
      return {
        valid: false,
        errors: validate.errors.map(err => ({
          path: err.instancePath || err.dataPath,
          message: err.message,
          keyword: err.keyword,
          params: err.params,
          data: err.data
        }))
      };
    }
    
    // Additional validations
    const customErrors = [];
    
    // Check: name ends with "Field"
    if (!spec.name.endsWith('Field')) {
      customErrors.push({
        path: '/name',
        message: 'must end with "Field"',
        keyword: 'pattern'
      });
    }
    
    // Check: composite type requires composite config
    if (spec.type === 'composite' && !spec.composite) {
      customErrors.push({
        path: '/composite',
        message: 'required when type is "composite"',
        keyword: 'required'
      });
    }
    
    // Check: composite parts must have unique names
    if (spec.composite?.parts) {
      const names = spec.composite.parts.map(p => p.name);
      const duplicates = names.filter((name, i) => names.indexOf(name) !== i);
      if (duplicates.length > 0) {
        customErrors.push({
          path: '/composite/parts',
          message: `duplicate part names: ${duplicates.join(', ')}`,
          keyword: 'uniqueItems'
        });
      }
    }
    
    if (customErrors.length > 0) {
      return { valid: false, errors: customErrors };
    }
    
    return { valid: true, errors: [] };
    
  } catch (error) {
    return {
      valid: false,
      errors: [{
        path: '/',
        message: error.message,
        keyword: 'parse'
      }]
    };
  }
}

/**
 * Format validation errors for display
 */
function formatErrors(errors, specPath) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('❌ SPEC VALIDATION FAILED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log(`File: ${specPath}`);
  console.log('');
  console.log('Errors:');
  errors.forEach((err, i) => {
    console.log(`  ${i + 1}. ${err.path || '/'}: ${err.message}`);
    if (err.params) {
      console.log(`     Details: ${JSON.stringify(err.params)}`);
    }
  });
  console.log('');
  console.log('Fix the spec and try again.');
  console.log('Schema: specs/_schema.json');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const specPath = process.argv[2];
  
  if (!specPath) {
    console.error('Usage: node validate-spec.mjs <spec-path>');
    process.exit(1);
  }
  
  const result = validateSpec(specPath);
  
  if (!result.valid) {
    formatErrors(result.errors, specPath);
    process.exit(1);
  }
  
  console.log('✅ Spec is valid');
}

export default validateSpec;
