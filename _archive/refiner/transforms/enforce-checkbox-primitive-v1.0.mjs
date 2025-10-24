/**
 * Refiner Transform: Enforce Checkbox Primitive v1.0
 * 
 * Ensures checkbox inputs use .ds-checkbox not .ds-input
 * 
 * Rule: <input type="checkbox"> must use className="ds-checkbox"
 * Auto-fix: Replaces .ds-input with .ds-checkbox and removes w-full
 * 
 * Part of Phase 1 beautification - prevents primitive misuse
 * 
 * @since 2025-10-23
 */

import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';

export function enforceCheckboxPrimitiveV1_0() {
  return {
    name: 'enforce-checkbox-primitive-v1.0',
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
            // Only target <input> elements
            if (path.node.name?.name !== 'input') return;
            
            const attributes = path.node.attributes;
            
            // Find type attribute
            const typeAttr = attributes.find(
              attr => attr.type === 'JSXAttribute' && 
                     attr.name?.name === 'type' &&
                     attr.value?.value === 'checkbox'
            );
            
            // Not a checkbox? Skip.
            if (!typeAttr) return;
            
            // Find className attribute
            const classNameAttr = attributes.find(
              attr => attr.type === 'JSXAttribute' && attr.name?.name === 'className'
            );
            
            if (!classNameAttr) {
              // No className at all - add .ds-checkbox
              attributes.push({
                type: 'JSXAttribute',
                name: { type: 'JSXIdentifier', name: 'className' },
                value: {
                  type: 'StringLiteral',
                  value: 'ds-checkbox',
                },
              });
              modified = true;
              issues.push({
                line: path.node.loc?.start.line,
                message: 'Added .ds-checkbox class to checkbox input',
              });
              return;
            }
            
            // Check className value
            let className = '';
            
            if (classNameAttr.value?.type === 'StringLiteral') {
              // Simple string: className="ds-input w-full"
              className = classNameAttr.value.value;
            } else if (classNameAttr.value?.type === 'JSXExpressionContainer') {
              // Template string or expression: className={`ds-input ${foo}`}
              // For now, we only handle simple string literals
              // Complex expressions require manual review
              issues.push({
                line: path.node.loc?.start.line,
                message: 'Checkbox has dynamic className - manual review needed',
              });
              return;
            }
            
            // Check if .ds-input is used (wrong!)
            if (className.includes('ds-input')) {
              // Replace .ds-input with .ds-checkbox
              let newClassName = className
                .replace(/\bds-input\b/g, 'ds-checkbox')
                .replace(/\bw-full\b/g, '') // Remove w-full (checkboxes aren't full-width)
                .replace(/\s+/g, ' ')        // Normalize whitespace
                .trim();
              
              classNameAttr.value.value = newClassName;
              modified = true;
              
              issues.push({
                line: path.node.loc?.start.line,
                message: `Fixed checkbox primitive: "${className}" → "${newClassName}"`,
              });
              return;
            }
            
            // Check if .ds-checkbox is missing (but doesn't have .ds-input)
            if (!className.includes('ds-checkbox')) {
              // Add .ds-checkbox
              const newClassName = `ds-checkbox ${className}`.trim();
              classNameAttr.value.value = newClassName;
              modified = true;
              
              issues.push({
                line: path.node.loc?.start.line,
                message: `Added .ds-checkbox to checkbox: "${className}" → "${newClassName}"`,
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

/**
 * USAGE:
 * 
 * Register this transform in scripts/refiner/refiner.mjs:
 * 
 * ```javascript
 * import { enforceCheckboxPrimitiveV1_0 } from './transforms/enforce-checkbox-primitive-v1.0.mjs';
 * 
 * const ALL_TRANSFORMS = [
 *   // ... existing transforms
 *   enforceCheckboxPrimitiveV1_0,
 * ];
 * ```
 * 
 * Then run:
 * ```bash
 * # Dry run (preview changes)
 * node scripts/refiner/refine.mjs --dry packages/forms/src/fields/CheckboxField/CheckboxField.tsx
 * 
 * # Apply changes
 * node scripts/refiner/refine.mjs packages/forms/src/fields/CheckboxField/CheckboxField.tsx
 * ```
 */
