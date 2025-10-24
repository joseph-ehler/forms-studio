/**
 * Refiner Transform: enforce-input-trigger-primitive-v1.0
 * 
 * Prevents misuse of .ds-input and .ds-select-trigger primitives:
 * - Flags <button> elements using .ds-input
 * - Flags <input> elements using .ds-select-trigger
 * - Ensures triggers have type="button" and aria-haspopup
 * 
 * Usage:
 *   pnpm refine --dry-run  (report only)
 *   pnpm refine --fix       (auto-fix simple issues)
 */

import traverse from '@babel/traverse';
import * as t from '@babel/types';

export default function enforceInputTriggerPrimitiveV1(ast, filePath, { applyFix = false } = {}) {
  const issues = [];
  let changed = false;

  traverse.default(ast, {
    JSXElement(path) {
      const el = path.node.openingElement;
      const name = el.name && el.name.name;
      if (!name) return;

      // Read className - handle string literals and JSX expressions
      const clsAttr = el.attributes.find(a => a.name?.name === 'className');
      let cls = null;
      
      if (clsAttr?.value?.type === 'StringLiteral') {
        cls = clsAttr.value.value;
      } else if (clsAttr?.value?.type === 'JSXExpressionContainer') {
        // For JSX expressions like className={cn('ds-input')} we need AST analysis
        // For now, skip - focus on string literals
        return;
      }

      if (!cls) return;

      // Rule 1: <button> must not use .ds-input
      if (name === 'button' && cls.includes('ds-input') && !cls.includes('ds-select-trigger')) {
        issues.push({
          type: 'error',
          rule: 'input-on-button',
          msg: '<button> uses .ds-input class; should use .ds-select-trigger instead',
          loc: el.loc,
          file: filePath
        });

        if (applyFix && clsAttr.value.type === 'StringLiteral') {
          clsAttr.value.value = cls.replace(/\bds-input\b/g, 'ds-select-trigger');
          changed = true;
        }
      }

      // Rule 2: <input> must not use .ds-select-trigger
      if (name === 'input' && cls.includes('ds-select-trigger')) {
        issues.push({
          type: 'error',
          rule: 'trigger-on-input',
          msg: '<input> uses .ds-select-trigger class; should use .ds-input instead',
          loc: el.loc,
          file: filePath
        });

        if (applyFix && clsAttr.value.type === 'StringLiteral') {
          clsAttr.value.value = cls.replace(/\bds-select-trigger\b/g, 'ds-input');
          changed = true;
        }
      }

      // Rule 3: .ds-select-trigger must have type="button"
      if (name === 'button' && cls.includes('ds-select-trigger')) {
        const hasType = el.attributes.find(a => a.name?.name === 'type');
        const typeValue = hasType?.value?.value;

        if (!hasType || typeValue !== 'button') {
          issues.push({
            type: 'warn',
            rule: 'missing-button-type',
            msg: '.ds-select-trigger missing type="button" attribute',
            loc: el.loc,
            file: filePath
          });

          if (applyFix) {
            if (hasType) {
              // Update existing type
              hasType.value = t.stringLiteral('button');
            } else {
              // Add type="button"
              el.attributes.push(
                t.jsxAttribute(t.jsxIdentifier('type'), t.stringLiteral('button'))
              );
            }
            changed = true;
          }
        }

        // Rule 4: .ds-select-trigger should have aria-haspopup
        const hasPopup = el.attributes.find(a => a.name?.name === 'aria-haspopup');
        
        if (!hasPopup) {
          issues.push({
            type: 'warn',
            rule: 'missing-aria-haspopup',
            msg: '.ds-select-trigger missing aria-haspopup attribute (recommended: "listbox")',
            loc: el.loc,
            file: filePath
          });

          if (applyFix) {
            el.attributes.push(
              t.jsxAttribute(t.jsxIdentifier('aria-haspopup'), t.stringLiteral('listbox'))
            );
            changed = true;
          }
        }
      }
    }
  });

  return {
    changed: applyFix && changed,
    issues
  };
}
