/**
 * Refiner Transform: No Inline Styles v1.0
 * 
 * Enforces DS class usage over inline styles.
 * Inline styles bypass design tokens and create maintenance burden.
 * 
 * Rule: Use DS classes (ds-input, w-full, etc.) instead of style={{...}}
 * 
 * Auto-fix: Removes inline style attributes and adds className="ds-input w-full"
 */

import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';

export function noInlineStylesV1_0() {
  return {
    name: 'no-inline-styles-v1.0',
    apply: async ({ file, code }) => {
      const issues = [];
      let modified = false;
      
      try {
        const ast = parser.parse(code, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx'],
        });
        
        traverse.default(ast, {
          JSXOpeningElement(path) {
            const attributes = path.node.attributes;
            
            // Find style attribute
            const styleAttrIndex = attributes.findIndex(
              attr => attr.type === 'JSXAttribute' && attr.name?.name === 'style'
            );
            
            if (styleAttrIndex !== -1) {
              // Remove style attribute
              attributes.splice(styleAttrIndex, 1);
              modified = true;
              
              issues.push({
                line: path.node.loc?.start.line,
                message: 'Removed inline styles, replaced with DS classes.',
              });
              
              // Check if className already exists
              const classNameAttr = attributes.find(
                attr => attr.type === 'JSXAttribute' && attr.name?.name === 'className'
              );
              
              if (!classNameAttr && path.node.name?.name === 'input') {
                // Add className="ds-input w-full" for inputs
                attributes.push({
                  type: 'JSXAttribute',
                  name: { type: 'JSXIdentifier', name: 'className' },
                  value: {
                    type: 'StringLiteral',
                    value: 'ds-input w-full',
                  },
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
