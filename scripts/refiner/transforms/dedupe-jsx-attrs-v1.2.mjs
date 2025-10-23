#!/usr/bin/env node
/**
 * Refiner v1.2 - Deduplicate JSX Attributes
 * 
 * Detects and removes duplicate JSX attributes on the same element.
 * Keeps the FIRST occurrence, removes subsequent duplicates.
 * 
 * Example:
 *   <input disabled={disabled} placeholder="..." disabled={disabled} />
 *   → <input disabled={disabled} placeholder="..." />
 * 
 * Why this matters:
 * - React throws errors on duplicate attributes
 * - Generator templates can accidentally emit duplicates
 * - Provides safety net for any code generation bugs
 * 
 * Usage:
 *   Runs automatically as part of `pnpm refine:run`
 */

import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import fs from 'node:fs';

/**
 * Factory function - returns transform object for refiner
 */
export function dedupeJSXAttributesV1_2() {
  return {
    name: 'dedupe-jsx-attrs-v1.2',
    apply: async ({ file, code }) => {
      let modified = false;
      const duplicates = [];

      try {
        const ast = parser.parse(code, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx'],
        });

        traverse.default(ast, {
          JSXOpeningElement(path) {
            const { node } = path;
            const seen = new Map(); // attributeName -> first occurrence index
            const toRemove = [];

            node.attributes.forEach((attr, index) => {
              // Only check JSXAttribute (not JSXSpreadAttribute)
              if (attr.type !== 'JSXAttribute') return;

              const attrName = attr.name.name;

              if (seen.has(attrName)) {
                // Duplicate found!
                toRemove.push(index);
                duplicates.push({
                  attribute: attrName,
                  element: node.name.name,
                  line: attr.loc?.start.line,
                });
                modified = true;
              } else {
                seen.set(attrName, index);
              }
            });

            // Remove duplicates (iterate backwards to preserve indices)
            toRemove.reverse().forEach(index => {
              node.attributes.splice(index, 1);
            });
          },
        });

        if (!modified) {
          return { changed: false, code, issues: [] };
        }

        // Generate cleaned code
        const output = generate.default(ast, {
          retainLines: true,
          retainFunctionParens: true,
          comments: true,
        }, code);

        // Add refiner annotation
        const today = new Date().toISOString().split('T')[0];
        const annotation = `/** @refiner(dedupe-jsx-attrs@1.2.0 applied ${today}) */\n`;
        const newCode = annotation + output.code;

        // Report fixes
        console.log(`   🔧 ${file}: Removed ${duplicates.length} duplicate JSX attribute(s)`);
        duplicates.forEach(dup => {
          console.log(`      <${dup.element}> line ${dup.line}: removed duplicate '${dup.attribute}'`);
        });

        return {
          changed: true,
          code: newCode,
          issues: duplicates,
        };
      } catch (error) {
        console.error(`   ⚠️  Parse error in ${file}: ${error.message}`);
        return { changed: false, code, issues: [], error: error.message };
      }
    },
  };
}

export default dedupeJSXAttributesV1_2;
