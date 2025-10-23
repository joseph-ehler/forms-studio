/**
 * Refiner Transform: ARIA Completeness v1.0
 * 
 * Ensures complete ARIA implementation for accessibility.
 * 
 * Rules:
 * - FormLabel must have htmlFor={name}
 * - Inputs should have aria-describedby linking to helper text
 * - Inputs should have aria-invalid for error states
 * - Helper text should have ID matching ${name}-desc
 * - Error text should have ID matching ${name}-err
 * 
 * Auto-fix: Adds missing ARIA attributes where possible
 */

import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';

export function ariaCompletenessV1_0() {
  return {
    name: 'aria-completeness-v1.0',
    apply: async ({ file, code }) => {
      const issues = [];
      let modified = false;
      
      try {
        const ast = parser.parse(code, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx'],
        });
        
        // First pass: Check if component has 'name' prop
        let hasNameProp = false;
        traverse.default(ast, {
          FunctionDeclaration(path) {
            const params = path.node.params;
            if (params.length > 0 && params[0].type === 'ObjectPattern') {
              const hasName = params[0].properties.some(
                prop => prop.key?.name === 'name'
              );
              if (hasName) hasNameProp = true;
            }
          },
          ArrowFunctionExpression(path) {
            const params = path.node.params;
            if (params.length > 0 && params[0].type === 'ObjectPattern') {
              const hasName = params[0].properties.some(
                prop => prop.key?.name === 'name'
              );
              if (hasName) hasNameProp = true;
            }
          },
        });
        
        if (!hasNameProp) {
          // Skip files without 'name' prop
          return { changed: false, code, issues };
        }
        
        // Second pass: Check/fix ARIA attributes on inputs
        traverse.default(ast, {
          JSXOpeningElement(path) {
            const name = path.node.name?.name;
            
            // Check <input>, <textarea>, <select>
            if (name === 'input' || name === 'textarea' || name === 'select') {
              const attrs = path.node.attributes || [];
              
              // Check for aria-describedby
              const hasDescribedBy = attrs.some(a => a.name?.name === 'aria-describedby');
              if (!hasDescribedBy) {
                issues.push({
                  line: path.node.loc?.start.line,
                  message: `${name} missing aria-describedby (should link to helper text)`,
                });
              }
              
              // Check for aria-invalid
              const hasInvalid = attrs.some(a => a.name?.name === 'aria-invalid');
              if (!hasInvalid) {
                issues.push({
                  line: path.node.loc?.start.line,
                  message: `${name} missing aria-invalid (should indicate error state)`,
                });
              }
            }
            
            // Check <FormLabel>
            if (name === 'FormLabel') {
              const attrs = path.node.attributes || [];
              const hasHtmlFor = attrs.some(a => a.name?.name === 'htmlFor');
              
              if (!hasHtmlFor) {
                issues.push({
                  line: path.node.loc?.start.line,
                  message: 'FormLabel missing htmlFor attribute',
                });
              }
            }
            
            // Check radiogroup
            if (path.node.attributes) {
              const roleAttr = path.node.attributes.find(
                a => a.name?.name === 'role' && a.value?.value === 'radiogroup'
              );
              
              if (roleAttr) {
                const attrs = path.node.attributes;
                const hasLabelledBy = attrs.some(a => a.name?.name === 'aria-labelledby');
                const hasDescribedBy = attrs.some(a => a.name?.name === 'aria-describedby');
                const hasInvalid = attrs.some(a => a.name?.name === 'aria-invalid');
                const hasErrorMessage = attrs.some(a => a.name?.name === 'aria-errormessage');
                
                if (!hasLabelledBy) {
                  issues.push({
                    line: path.node.loc?.start.line,
                    message: 'radiogroup missing aria-labelledby',
                  });
                }
                if (!hasDescribedBy) {
                  issues.push({
                    line: path.node.loc?.start.line,
                    message: 'radiogroup missing aria-describedby',
                  });
                }
                if (!hasInvalid) {
                  issues.push({
                    line: path.node.loc?.start.line,
                    message: 'radiogroup missing aria-invalid',
                  });
                }
                if (!hasErrorMessage) {
                  issues.push({
                    line: path.node.loc?.start.line,
                    message: 'radiogroup missing aria-errormessage',
                  });
                }
              }
            }
          },
        });
        
        // Report-only for now (auto-fix would be complex due to varied structures)
        // Future: Could auto-add attributes based on factory-overlays.yaml patterns
        
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
