#!/usr/bin/env node
/**
 * DOM Prop Filter Transform v1.1 - AST Auto-Fix
 * 
 * Removes custom (non-HTML) props from native DOM elements using AST manipulation.
 * Only props in the html-allowlist.json should touch the DOM.
 * 
 * Example:
 *   Before: <input type="range" separator={separator} maxTags={maxTags} {...field} />
 *   After:  <input type="range" {...field} />
 * 
 * Leaves component elements untouched (e.g., <Stack separator={...}> is fine)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ALLOWLIST_PATH = path.join(__dirname, '../maps/html-allowlist.json');

let allowlistCache = null;

// Native HTML elements (lowercase)
const NATIVE_ELEMENTS = new Set([
  'input', 'textarea', 'select', 'button', 
  'div', 'span', 'label', 'form', 'fieldset', 
  'legend', 'a', 'img', 'video', 'audio'
]);

/**
 * Load HTML attribute allowlist
 */
function loadAllowlist() {
  if (!allowlistCache) {
    allowlistCache = JSON.parse(fs.readFileSync(ALLOWLIST_PATH, 'utf8'));
  }
  return allowlistCache;
}

/**
 * Get allowed props for a given input type
 */
export function getAllowedProps(inputType = 'text') {
  const allowlist = loadAllowlist();
  const typeSpecific = allowlist.byType[inputType] || [];
  return new Set([...allowlist.common, ...typeSpecific]);
}

/**
 * Extract input type from JSX element attributes
 */
function getInputType(openingElement, tagName) {
  // For textarea and select, return the tag name itself
  if (tagName === 'textarea' || tagName === 'select') {
    return tagName;
  }
  
  const typeAttr = openingElement.attributes.find(
    attr => t.isJSXAttribute(attr) && 
            t.isJSXIdentifier(attr.name) && 
            attr.name.name === 'type'
  );
  
  if (typeAttr && t.isStringLiteral(typeAttr.value)) {
    return typeAttr.value.value;
  }
  
  return 'text'; // default for inputs
}

/**
 * Check if prop name is allowed (HTML attribute, data-*, aria-*, or React-specific)
 */
function isAllowedProp(propName, allowedSet) {
  // Always allow: data-*, aria-*, key, ref
  if (propName.startsWith('data-') || 
      propName.startsWith('aria-') || 
      propName === 'key' || 
      propName === 'ref') {
    return true;
  }
  
  // Check against allowlist
  return allowedSet.has(propName);
}

/**
 * Refiner transform v1.1: AST-based auto-fix
 */
export function filterDomPropsV1_1() {
  return {
    name: 'filter-dom-props',
    version: '1.1.0',
    
    async apply({ file, code }) {
      // Skip non-TSX files
      if (!file.endsWith('.tsx')) {
        return { changed: false, code };
      }
      
      // Parse AST
      let ast;
      try {
        ast = parser.parse(code, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx']
        });
      } catch (error) {
        console.error(`   ❌ Failed to parse ${file}: ${error.message}`);
        return { changed: false, code };
      }
      
      let changed = false;
      const fixes = [];
      
      // Walk JSX elements
      traverse.default(ast, {
        JSXElement(path) {
          const openingElement = path.node.openingElement;
          const tagName = t.isJSXIdentifier(openingElement.name) 
            ? openingElement.name.name 
            : null;
          
          // Only process native HTML elements (lowercase)
          if (!tagName || !NATIVE_ELEMENTS.has(tagName.toLowerCase())) {
            return;
          }
          
          // Get allowed props for this element type
          const inputType = getInputType(openingElement, tagName.toLowerCase());
          const allowedProps = getAllowedProps(inputType);
          
          // Filter attributes
          const originalCount = openingElement.attributes.length;
          openingElement.attributes = openingElement.attributes.filter(attr => {
            // Keep spread attributes
            if (t.isJSXSpreadAttribute(attr)) {
              return true;
            }
            
            // Only process JSXAttribute
            if (!t.isJSXAttribute(attr) || !t.isJSXIdentifier(attr.name)) {
              return true;
            }
            
            const attrName = attr.name.name;
            
            // Check if allowed
            if (isAllowedProp(attrName, allowedProps)) {
              return true; // Keep
            }
            
            // Remove custom prop
            fixes.push({
              tag: tagName,
              type: inputType,
              prop: attrName
            });
            
            changed = true;
            return false; // Remove
          });
        }
      });
      
      if (!changed) {
        return { changed: false, code };
      }
      
      // Generate updated code
      const output = generate.default(ast, {
        retainLines: true,
        compact: false,
        comments: true,
        retainFunctionParens: true
      }, code);
      
      // Add refiner annotation at top
      const today = new Date().toISOString().split('T')[0];
      const annotation = `/** @refiner(filter-dom-props@1.1.0 applied ${today}) */\n`;
      const newCode = annotation + output.code;
      
      // Report fixes
      console.log(`   🔧 ${file}: Removed ${fixes.length} custom prop(s) from DOM elements`);
      const propsByTag = {};
      fixes.forEach(fix => {
        const key = `<${fix.tag} type="${fix.type}">`;
        if (!propsByTag[key]) propsByTag[key] = [];
        propsByTag[key].push(fix.prop);
      });
      Object.entries(propsByTag).forEach(([tag, props]) => {
        console.log(`      ${tag}: ${props.join(', ')}`);
      });
      
      return { changed: true, code: newCode, fixes };
    }
  };
}

export default filterDomPropsV1_1;
