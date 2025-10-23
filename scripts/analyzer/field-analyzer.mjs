#!/usr/bin/env node
/**
 * Field Analyzer - Pre-Spec Analysis Tool
 * 
 * Inspects existing field components and proposes specs or highlights gaps.
 * 
 * Usage:
 *   node scripts/analyzer/field-analyzer.mjs <path-to-field.tsx>
 *   
 * Example:
 *   node scripts/analyzer/field-analyzer.mjs packages/forms/src/fields/TextField/TextField.tsx
 * 
 * Output:
 *   JSON report with:
 *   - Component analysis (RHF usage, DOM elements, DS primitives, props)
 *   - ARIA compliance check
 *   - Pattern violations (inline styles, missing htmlFor)
 *   - Suggested spec (YAML-ready)
 */

import fs from 'node:fs';
import path from 'node:path';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

const filePath = process.argv[2];

if (!filePath) {
  console.error('Usage: node field-analyzer.mjs <path-to-field.tsx>');
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(`❌ File not found: ${filePath}`);
  process.exit(1);
}

const source = fs.readFileSync(filePath, 'utf8');
const fileName = path.basename(filePath, path.extname(filePath));

// Analysis state
const analysis = {
  usesController: false,
  usesRHF: false,
  domElements: new Set(),
  dsPrimitives: new Set(),
  rhfImports: new Set(),
  dsImports: new Set(),
  propNames: new Set(),
  aria: {
    hasHtmlFor: false,
    hasAriaDescribedBy: false,
    hasAriaInvalid: false,
    hasAriaRequired: false,
    hasAriaLabel: false,
  },
  patterns: {
    hasInlineStyles: false,
    usesStyleProp: false,
    hasErrorHandling: false,
    hasDescription: false,
    hasLabel: false,
    hasRequired: false,
    hasDisabled: false,
  },
  componentName: fileName,
  exports: new Set(),
};

// Parse the file
let ast;
try {
  ast = parser.parse(source, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });
} catch (error) {
  console.error('❌ Parse error:', error.message);
  process.exit(1);
}

// Traverse AST
traverse.default(ast, {
  // Check imports
  ImportDeclaration(path) {
    const source = path.node.source.value;
    
    if (source === 'react-hook-form') {
      analysis.usesRHF = true;
      path.node.specifiers.forEach(spec => {
        if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported)) {
          analysis.rhfImports.add(spec.imported.name);
          if (spec.imported.name === 'Controller') {
            analysis.usesController = true;
          }
        }
      });
    }
    
    if (source.startsWith('@intstudio/ds') || source.startsWith('../') && source.includes('ds')) {
      path.node.specifiers.forEach(spec => {
        if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported)) {
          analysis.dsPrimitives.add(spec.imported.name);
          analysis.dsImports.add(spec.imported.name);
        }
      });
    }
  },
  
  // Check JSX elements
  JSXOpeningElement(path) {
    const name = path.node.name;
    let tagName = null;
    
    if (t.isJSXIdentifier(name)) {
      tagName = name.name;
    }
    
    if (!tagName) return;
    
    // Track DOM elements
    if (tagName === tagName.toLowerCase()) {
      analysis.domElements.add(tagName);
    }
    
    // Check for inline styles
    const attrs = path.node.attributes || [];
    attrs.forEach(attr => {
      if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
        const attrName = attr.name.name;
        
        // Track common props
        if (attrName === 'style') {
          analysis.patterns.hasInlineStyles = true;
          analysis.patterns.usesStyleProp = true;
        }
        
        // ARIA attributes
        if (attrName === 'htmlFor') analysis.aria.hasHtmlFor = true;
        if (attrName === 'aria-describedby') analysis.aria.hasAriaDescribedBy = true;
        if (attrName === 'aria-invalid') analysis.aria.hasAriaInvalid = true;
        if (attrName === 'aria-required') analysis.aria.hasAriaRequired = true;
        if (attrName === 'aria-label') analysis.aria.hasAriaLabel = true;
      }
    });
  },
  
  // Check function/component props
  FunctionDeclaration(path) {
    const params = path.node.params;
    if (params.length > 0 && t.isObjectPattern(params[0])) {
      params[0].properties.forEach(prop => {
        if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
          const propName = prop.key.name;
          analysis.propNames.add(propName);
          
          // Track pattern-indicating props
          if (propName === 'label') analysis.patterns.hasLabel = true;
          if (propName === 'description') analysis.patterns.hasDescription = true;
          if (propName === 'required') analysis.patterns.hasRequired = true;
          if (propName === 'disabled') analysis.patterns.hasDisabled = true;
          if (propName === 'errors') analysis.patterns.hasErrorHandling = true;
        }
      });
    }
  },
  
  ArrowFunctionExpression(path) {
    const params = path.node.params;
    if (params.length > 0 && t.isObjectPattern(params[0])) {
      params[0].properties.forEach(prop => {
        if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
          const propName = prop.key.name;
          analysis.propNames.add(propName);
          
          // Track pattern-indicating props
          if (propName === 'label') analysis.patterns.hasLabel = true;
          if (propName === 'description') analysis.patterns.hasDescription = true;
          if (propName === 'required') analysis.patterns.hasRequired = true;
          if (propName === 'disabled') analysis.patterns.hasDisabled = true;
          if (propName === 'errors') analysis.patterns.hasErrorHandling = true;
        }
      });
    }
  },
  
  // Check exports
  ExportNamedDeclaration(path) {
    if (path.node.declaration) {
      if (t.isFunctionDeclaration(path.node.declaration) && path.node.declaration.id) {
        analysis.exports.add(path.node.declaration.id.name);
      } else if (t.isVariableDeclaration(path.node.declaration)) {
        path.node.declaration.declarations.forEach(decl => {
          if (t.isIdentifier(decl.id)) {
            analysis.exports.add(decl.id.name);
          }
        });
      }
    }
  },
  
  ExportDefaultDeclaration(path) {
    if (t.isIdentifier(path.node.declaration)) {
      analysis.exports.add(path.node.declaration.name);
    }
  },
});

// Determine field type from DOM elements
function guessFieldType() {
  if (analysis.domElements.has('textarea')) return 'textarea';
  if (analysis.domElements.has('select')) return 'select';
  if (analysis.domElements.has('input')) {
    // Could be text, number, email, etc.
    // Default to 'text' unless we can infer from name
    const nameLower = fileName.toLowerCase();
    if (nameLower.includes('email')) return 'email';
    if (nameLower.includes('number')) return 'number';
    if (nameLower.includes('tel') || nameLower.includes('phone')) return 'tel';
    if (nameLower.includes('url')) return 'url';
    if (nameLower.includes('date')) return 'date';
    if (nameLower.includes('time')) return 'time';
    if (nameLower.includes('color')) return 'color';
    return 'text';
  }
  if (analysis.domElements.has('button')) return 'button';
  return 'custom';
}

// Generate suggested spec
const fieldType = guessFieldType();
const suggestedSpec = {
  name: fileName,
  specVersion: '1.2',
  ui: {
    behavior: fieldType === 'select' ? 'select' : fieldType === 'textarea' ? 'textarea' : 'text',
    inputType: fieldType,
  },
  validation: {
    required: analysis.patterns.hasRequired,
    rules: {},
  },
  telemetry: {
    enabled: false,
    events: ['focus', 'blur', 'validate'],
    pii: 'hash',
  },
  accessibility: {
    label: analysis.patterns.hasLabel,
    description: analysis.patterns.hasDescription,
  },
};

// Compliance checks
const compliance = {
  rhfIntegration: analysis.usesController ? '✅' : '❌',
  dsComponents: analysis.dsPrimitives.size > 0 ? '✅' : '⚠️',
  ariaLabels: analysis.aria.hasHtmlFor ? '✅' : '❌',
  ariaDescriptions: analysis.aria.hasAriaDescribedBy ? '✅' : '⚠️',
  ariaInvalid: analysis.aria.hasAriaInvalid ? '✅' : '⚠️',
  errorHandling: analysis.patterns.hasErrorHandling ? '✅' : '❌',
  noInlineStyles: !analysis.patterns.hasInlineStyles ? '✅' : '❌',
};

// Issues found
const issues = [];
if (!analysis.usesController) {
  issues.push({
    severity: 'error',
    message: 'Not using RHF Controller - manual form state management detected',
    fix: 'Wrap input with <Controller name={name} control={control} render={...} />',
  });
}
if (analysis.patterns.hasInlineStyles) {
  issues.push({
    severity: 'warning',
    message: 'Inline styles detected',
    fix: 'Run Refiner: pnpm refine:run --scope="' + filePath + '"',
  });
}
if (!analysis.aria.hasHtmlFor && analysis.patterns.hasLabel) {
  issues.push({
    severity: 'error',
    message: 'FormLabel missing htmlFor attribute',
    fix: 'Add htmlFor={name} to <FormLabel>',
  });
}
if (!analysis.patterns.hasErrorHandling) {
  issues.push({
    severity: 'warning',
    message: 'No error handling detected',
    fix: 'Add errors prop and render error messages',
  });
}

// Recommendations
const recommendations = [];
if (analysis.dsPrimitives.size === 0) {
  recommendations.push('Consider using DS primitives (FormLabel, Input, FormHelperText) instead of raw HTML');
}
if (!analysis.aria.hasAriaInvalid) {
  recommendations.push('Add aria-invalid={hasError} to input for better screen reader support');
}
if (!analysis.aria.hasAriaDescribedBy && analysis.patterns.hasDescription) {
  recommendations.push('Add aria-describedby to link input with description/error text');
}

// Output report
const report = {
  file: filePath,
  component: fileName,
  analysis: {
    rhf: {
      usesController: analysis.usesController,
      imports: Array.from(analysis.rhfImports),
    },
    ui: {
      domElements: Array.from(analysis.domElements),
      dsPrimitives: Array.from(analysis.dsPrimitives),
      guessedType: fieldType,
    },
    props: Array.from(analysis.propNames),
    aria: analysis.aria,
    patterns: analysis.patterns,
    exports: Array.from(analysis.exports),
  },
  compliance,
  issues,
  recommendations,
  suggestedSpec,
};

console.log(JSON.stringify(report, null, 2));
