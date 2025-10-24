/**
 * Refiner Transform: Enforce Toggle Primitive v1.0
 * 
 * Detects: <input type="checkbox" role="switch"> with wrong classes
 * Fixes: .ds-input → .ds-toggle, removes w-full
 * 
 * This transform ensures toggle switches use the correct primitive.
 * Toggle switches are semantically and visually distinct from checkboxes
 * and text inputs, requiring their own dedicated CSS class.
 * 
 * Pattern Detection:
 * - type="checkbox" AND role="switch" → must use .ds-toggle
 * - NOT allowed: .ds-input, .ds-checkbox, w-full
 * 
 * Auto-Fix:
 * - Replace .ds-input with .ds-toggle
 * - Replace .ds-checkbox with .ds-toggle
 * - Remove w-full (toggles are inline, not full-width)
 * 
 * @version 1.0
 * @since 2025-10-23
 */

import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

export function enforceTogglePrimitiveV1_0() {
  return {
    name: 'enforce-toggle-primitive-v1.0',
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
            // Only process <input> elements
            if (path.node.name.name !== 'input') return;
            
            const attributes = path.node.attributes;
            
            // Check if it's a toggle: type="checkbox" + role="switch"
            const typeAttr = attributes.find(
              attr => attr.type === 'JSXAttribute' && 
                      attr.name?.name === 'type' &&
                      attr.value?.value === 'checkbox'
            );
            
            const roleAttr = attributes.find(
              attr => attr.type === 'JSXAttribute' && 
                      attr.name?.name === 'role' &&
                      attr.value?.value === 'switch'
            );
            
            // If not a toggle, skip
            if (!typeAttr || !roleAttr) return;
            
            // Now check className attribute
            const classNameAttr = attributes.find(
              attr => attr.type === 'JSXAttribute' && 
                      attr.name?.name === 'className'
            );
            
            if (!classNameAttr) return;
            
            let classValue = '';
            let needsUpdate = false;
            
            // Handle different className value types
            if (t.isStringLiteral(classNameAttr.value)) {
              // className="ds-input"
              classValue = classNameAttr.value.value;
              
              // Check for wrong classes
              if (classValue.includes('ds-input') || 
                  classValue.includes('ds-checkbox') || 
                  classValue.includes('w-full')) {
                needsUpdate = true;
                
                // Replace wrong classes
                classValue = classValue
                  .replace(/\bds-input\b/g, 'ds-toggle')
                  .replace(/\bds-checkbox\b/g, 'ds-toggle')
                  .replace(/\bw-full\b/g, '')
                  .replace(/\s+/g, ' ')  // Normalize whitespace
                  .trim();
                
                // Update the value
                classNameAttr.value.value = classValue;
                modified = true;
                
                issues.push({
                  line: path.node.loc?.start.line,
                  message: `Fixed toggle switch: replaced wrong class with .ds-toggle`,
                });
              }
            } else if (t.isJSXExpressionContainer(classNameAttr.value)) {
              // className={`ds-input ${size}`} or className={classNames(...)}
              const expr = classNameAttr.value.expression;
              
              if (t.isTemplateLiteral(expr)) {
                // Template literal: className={`ds-input ${size}`}
                let changed = false;
                
                expr.quasis.forEach(quasi => {
                  const original = quasi.value.raw;
                  if (original.includes('ds-input') || 
                      original.includes('ds-checkbox') || 
                      original.includes('w-full')) {
                    
                    const updated = original
                      .replace(/\bds-input\b/g, 'ds-toggle')
                      .replace(/\bds-checkbox\b/g, 'ds-toggle')
                      .replace(/\bw-full\b/g, '')
                      .replace(/\s+/g, ' ')
                      .trim();
                    
                    quasi.value.raw = updated;
                    quasi.value.cooked = updated;
                    changed = true;
                  }
                });
                
                if (changed) {
                  modified = true;
                  needsUpdate = true;
                  
                  issues.push({
                    line: path.node.loc?.start.line,
                    message: `Fixed toggle switch: replaced wrong class in template literal`,
                  });
                }
              } else if (t.isStringLiteral(expr)) {
                // className={'ds-input'}
                const original = expr.value;
                if (original.includes('ds-input') || 
                    original.includes('ds-checkbox') || 
                    original.includes('w-full')) {
                  
                  expr.value = original
                    .replace(/\bds-input\b/g, 'ds-toggle')
                    .replace(/\bds-checkbox\b/g, 'ds-toggle')
                    .replace(/\bw-full\b/g, '')
                    .replace(/\s+/g, ' ')
                    .trim();
                  
                  modified = true;
                  needsUpdate = true;
                  
                  issues.push({
                    line: path.node.loc?.start.line,
                    message: `Fixed toggle switch: replaced wrong class in expression`,
                  });
                }
              }
            }
            
            // Report if toggle is using correct class
            if (!needsUpdate && classValue.includes('ds-toggle')) {
              // Already correct, no issue
            } else if (!needsUpdate) {
              // Toggle but no recognized class at all - report as warning
              issues.push({
                line: path.node.loc?.start.line,
                message: `Toggle switch has unrecognized className pattern (manual review needed)`,
                severity: 'warning',
              });
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
        issues.push({
          message: `Parse error: ${error.message}`,
          severity: 'error',
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
