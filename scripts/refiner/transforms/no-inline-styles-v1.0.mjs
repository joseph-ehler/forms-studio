/**
 * Refiner Transform: No Inline Styles v1.0
 * 
 * Enforces DS class usage over inline styles.
 * Inline styles bypass design tokens and create maintenance burden.
 * 
 * Rule: Use DS classes (ds-input, w-full, etc.) instead of style={{...}}
 */

import * as parser from '@babel/parser';
import traverse from '@babel/traverse';

export function noInlineStylesV1_0() {
  return {
    name: 'no-inline-styles-v1.0',
    apply: async ({ file, code }) => {
      const issues = [];
      
      try {
        const ast = parser.parse(code, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx'],
        });
        
        traverse.default(ast, {
          JSXAttribute(path) {
            if (path.node.name?.name === 'style') {
              issues.push({
                line: path.node.loc?.start.line,
                message: 'Inline styles forbidden. Use DS classes (e.g., ds-input, w-full).',
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
