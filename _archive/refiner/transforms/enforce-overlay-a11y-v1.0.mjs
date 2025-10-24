/**
 * Refiner Transform: enforce-overlay-a11y-v1.0
 * 
 * Enforces accessibility requirements for overlay components:
 * 
 * TRIGGER Requirements:
 * - Must have type="button" (if <button>)
 * - Must have aria-haspopup="listbox" or aria-haspopup="dialog"
 * - Must have aria-expanded attribute (toggled true/false)
 * - Should have aria-controls pointing to overlay ID
 * 
 * OVERLAY Requirements:
 * - Must have role="listbox" or role="dialog"
 * - Must have aria-label or aria-labelledby
 * - If multiselectable, must have aria-multiselectable="true"
 * 
 * OPTION Requirements (in lists):
 * - Must have role="option"
 * - Must have aria-selected attribute
 * - Must not be focusable (parent list manages focus)
 * 
 * Usage:
 *   pnpm refine --dry-run          # Report only
 *   pnpm refine --fix               # Auto-fix simple issues
 */

import traverse from '@babel/traverse';
import * as t from '@babel/types';

export default function enforceOverlayA11yV1(ast, filePath, { applyFix = false } = {}) {
  const issues = [];
  let changed = false;

  traverse.default(ast, {
    JSXElement(path) {
      const el = path.node.openingElement;
      const name = el.name && el.name.name;
      if (!name) return;

      // Get className to detect if this is a trigger/overlay
      const clsAttr = el.attributes.find(a => a.name?.name === 'className');
      let cls = null;
      
      if (clsAttr?.value?.type === 'StringLiteral') {
        cls = clsAttr.value.value;
      }

      // ===== TRIGGER CHECKS =====
      
      if (name === 'button' && cls?.includes('ds-select-trigger')) {
        // Check 1: type="button"
        const typeAttr = el.attributes.find(a => a.name?.name === 'type');
        if (!typeAttr || typeAttr.value?.value !== 'button') {
          issues.push({
            type: 'warn',
            rule: 'trigger-missing-type',
            msg: 'Trigger button missing type="button"',
            loc: el.loc,
            file: filePath
          });
          
          if (applyFix) {
            if (typeAttr) {
              typeAttr.value = t.stringLiteral('button');
            } else {
              el.attributes.push(
                t.jsxAttribute(t.jsxIdentifier('type'), t.stringLiteral('button'))
              );
            }
            changed = true;
          }
        }
        
        // Check 2: aria-haspopup
        const hasPopup = el.attributes.find(a => a.name?.name === 'aria-haspopup');
        if (!hasPopup) {
          issues.push({
            type: 'warn',
            rule: 'trigger-missing-haspopup',
            msg: 'Trigger missing aria-haspopup attribute',
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
        
        // Check 3: aria-expanded
        const hasExpanded = el.attributes.find(a => a.name?.name === 'aria-expanded');
        if (!hasExpanded) {
          issues.push({
            type: 'warn',
            rule: 'trigger-missing-expanded',
            msg: 'Trigger missing aria-expanded attribute (should toggle true/false)',
            loc: el.loc,
            file: filePath
          });
          
          // Don't auto-fix this - needs state binding
        }
      }

      // ===== OVERLAY CHECKS =====
      
      // Check for role="listbox" or role="dialog"
      const roleAttr = el.attributes.find(a => a.name?.name === 'role');
      const roleValue = roleAttr?.value?.value;
      
      if (roleValue === 'listbox' || roleValue === 'dialog') {
        // Check 1: aria-label or aria-labelledby
        const hasLabel = el.attributes.find(a => 
          a.name?.name === 'aria-label' || a.name?.name === 'aria-labelledby'
        );
        
        if (!hasLabel) {
          issues.push({
            type: 'warn',
            rule: 'overlay-missing-label',
            msg: `Overlay with role="${roleValue}" missing aria-label or aria-labelledby`,
            loc: el.loc,
            file: filePath
          });
          
          // Don't auto-fix - needs contextual label
        }
        
        // Check 2: multiselectable (for listbox only)
        if (roleValue === 'listbox') {
          const hasMulti = el.attributes.find(a => a.name?.name === 'aria-multiselectable');
          
          // Look for "multiple" prop or checkbox inputs to detect multi-select
          const hasCheckboxes = path.toString().includes('checkbox');
          const hasMultipleProp = el.attributes.find(a => a.name?.name === 'multiple');
          
          if ((hasCheckboxes || hasMultipleProp) && !hasMulti) {
            issues.push({
              type: 'warn',
              rule: 'listbox-missing-multiselectable',
              msg: 'Multi-select listbox missing aria-multiselectable="true"',
              loc: el.loc,
              file: filePath
            });
            
            if (applyFix) {
              el.attributes.push(
                t.jsxAttribute(
                  t.jsxIdentifier('aria-multiselectable'),
                  t.stringLiteral('true')
                )
              );
              changed = true;
            }
          }
        }
      }

      // ===== OPTION CHECKS =====
      
      if (roleValue === 'option') {
        // Check 1: aria-selected
        const hasSelected = el.attributes.find(a => a.name?.name === 'aria-selected');
        if (!hasSelected) {
          issues.push({
            type: 'warn',
            rule: 'option-missing-selected',
            msg: 'Option missing aria-selected attribute',
            loc: el.loc,
            file: filePath
          });
          
          // Don't auto-fix - needs state binding
        }
        
        // Check 2: tabindex (should be -1 or absent, not 0)
        const tabindexAttr = el.attributes.find(a => a.name?.name === 'tabIndex');
        const tabindexValue = tabindexAttr?.value?.value;
        
        if (tabindexValue === '0' || tabindexValue === 0) {
          issues.push({
            type: 'warn',
            rule: 'option-should-not-be-focusable',
            msg: 'Options should not be individually focusable (parent list manages focus)',
            loc: el.loc,
            file: filePath
          });
          
          if (applyFix) {
            tabindexAttr.value = t.stringLiteral('-1');
            changed = true;
          }
        }
      }

      // ===== LIVE REGION CHECKS =====
      
      // Check for live regions in search/filter contexts
      if (cls?.includes('overlay') && path.toString().includes('search')) {
        const parentScope = path.scope;
        const hasLiveRegion = parentScope.path.toString().includes('aria-live');
        
        if (!hasLiveRegion) {
          issues.push({
            type: 'info',
            rule: 'missing-live-region',
            msg: 'Consider adding aria-live region to announce filtered results count',
            loc: el.loc,
            file: filePath
          });
        }
      }
    }
  });

  return {
    changed: applyFix && changed,
    issues
  };
}
