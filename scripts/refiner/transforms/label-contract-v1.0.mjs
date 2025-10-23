/**
 * Refiner Transform: Label Contract v1.0
 * 
 * Enforces accessibility contract for FormLabel components.
 * Labels must be associated with their inputs via htmlFor.
 * 
 * Rule: <FormLabel> must include htmlFor prop
 * 
 * Auto-fix: Adds htmlFor={name} to FormLabel when missing
 */

import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';

export function labelContractV1_0() {
  return {
    name: 'label-contract-v1.0',
    apply: async ({ file, code }) => {
      const issues = [];
      let modified = false;
      
      try {
        const ast = parser.parse(code, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx'],
        });
        
        // First pass: Find if component has 'name' prop
        let hasNameProp = false;
        traverse.default(ast, {
          // Check function params for 'name' destructuring
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
        
        // Second pass: Fix FormLabel elements
        traverse.default(ast, {
          JSXOpeningElement(path) {
            const name = path.node.name?.name;
            
            if (name !== 'FormLabel') return;
            
            const attrs = path.node.attributes || [];
            const hasHtmlFor = attrs.some(a => a.name?.name === 'htmlFor');
            
            if (!hasHtmlFor) {
              if (hasNameProp) {
                // Add htmlFor={name}
                attrs.push({
                  type: 'JSXAttribute',
                  name: {
                    type: 'JSXIdentifier',
                    name: 'htmlFor',
                  },
                  value: {
                    type: 'JSXExpressionContainer',
                    expression: {
                      type: 'Identifier',
                      name: 'name',
                    },
                  },
                });
                
                modified = true;
                issues.push({
                  line: path.node.loc?.start.line,
                  message: 'Added htmlFor={name} to FormLabel for accessibility.',
                });
              } else {
                // Report-only if we can't determine the name
                issues.push({
                  line: path.node.loc?.start.line,
                  message: 'FormLabel missing htmlFor prop. Component has no "name" prop to auto-fix.',
                });
              }
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
        // Skip files that can't be parsed
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
