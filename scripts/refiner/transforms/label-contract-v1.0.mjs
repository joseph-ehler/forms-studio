/**
 * Refiner Transform: Label Contract v1.0
 * 
 * Enforces accessibility contract for FormLabel components.
 * Labels must be associated with their inputs via htmlFor.
 * 
 * Rule: <FormLabel> must include htmlFor prop
 */

import * as parser from '@babel/parser';
import traverse from '@babel/traverse';

export function labelContractV1_0() {
  return {
    name: 'label-contract-v1.0',
    apply: async ({ file, code }) => {
      const issues = [];
      
      try {
        const ast = parser.parse(code, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx'],
        });
        
        traverse.default(ast, {
          JSXElement(path) {
            const name = path.node.openingElement?.name?.name;
            
            if (name !== 'FormLabel') return;
            
            const attrs = path.node.openingElement.attributes || [];
            const hasHtmlFor = attrs.some(a => a.name?.name === 'htmlFor');
            
            if (!hasHtmlFor) {
              issues.push({
                line: path.node.loc?.start.line,
                message: 'FormLabel must include htmlFor prop for accessibility.',
              });
            }
          },
        });
      } catch (error) {
        // Skip files that can't be parsed
      }
      
      return {
        changed: false, // Report-only for now
        code,
        issues,
      };
    },
  };
}
