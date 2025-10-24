/**
 * Refiner Transform: No Hardcoded Colors v1.0
 * 
 * Replaces hardcoded hex colors with DS tokens.
 * Hardcoded colors bypass theme system and fail WCAG.
 * 
 * Rule: Use DS tokens (--ds-color-*) instead of hex (#EF4444)
 * 
 * Auto-fix: Replaces known hex codes with semantic tokens
 * 
 * Allowed: Behavioral styles (userSelect, pointerEvents, cursor)
 * Forbidden: Visual styles with hardcoded colors
 */

import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

// Map of hardcoded colors to DS tokens
const COLOR_TO_TOKEN = {
  '#EF4444': '--ds-color-state-danger',
  '#DC2626': '--ds-color-state-danger',
  '#3B82F6': '--ds-color-primary-bg',
  '#2563EB': '--ds-color-primary-bg',
  '#10B981': '--ds-color-state-success',
  '#F59E0B': '--ds-color-state-warning',
  '#A3A3A3': '--ds-color-text-muted',
  '#525252': '--ds-color-text-muted',
};

// CSS properties that should use tokens (not hardcoded values)
const VISUAL_PROPERTIES = new Set([
  'color',
  'background',
  'backgroundColor',
  'borderColor',
  'fill',
  'stroke',
]);

// CSS properties that are behavioral (allowed to be inline)
const BEHAVIORAL_PROPERTIES = new Set([
  'userSelect',
  'pointerEvents',
  'cursor',
  'touchAction',
]);

export function noHardcodedColorsV1_0() {
  return {
    name: 'no-hardcoded-colors-v1.0',
    apply: async ({ file, code }) => {
      const issues = [];
      let modified = false;
      
      try {
        const ast = parser.parse(code, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx'],
        });
        
        traverse.default(ast, {
          JSXAttribute(path) {
            if (path.node.name.name !== 'style') return;
            if (!t.isJSXExpressionContainer(path.node.value)) return;
            
            const expr = path.node.value.expression;
            if (!t.isObjectExpression(expr)) return;
            
            // Check each property in the style object
            expr.properties.forEach((prop) => {
              if (!t.isObjectProperty(prop)) return;
              
              const key = prop.key.name || prop.key.value;
              const value = prop.value;
              
              // Skip behavioral properties
              if (BEHAVIORAL_PROPERTIES.has(key)) return;
              
              // Check if it's a visual property with hardcoded color
              if (VISUAL_PROPERTIES.has(key)) {
                // Check for hardcoded hex in string
                if (t.isStringLiteral(value)) {
                  const hexMatch = value.value.match(/#[0-9A-Fa-f]{6}/);
                  if (hexMatch) {
                    const hex = hexMatch[0].toUpperCase();
                    const token = COLOR_TO_TOKEN[hex];
                    
                    if (token) {
                      // Replace with var(token)
                      value.value = value.value.replace(hex, `var(${token})`);
                      modified = true;
                      issues.push({
                        line: path.node.loc?.start.line,
                        message: `Replaced hardcoded ${hex} with ${token}`,
                      });
                    } else {
                      issues.push({
                        line: path.node.loc?.start.line,
                        message: `Found hardcoded ${hex} with no known token replacement`,
                        severity: 'warning',
                      });
                    }
                  }
                }
                
                // Check for hardcoded hex in template literal var(--color-error, #EF4444)
                if (t.isTemplateLiteral(value)) {
                  value.quasis.forEach((quasi) => {
                    const hexMatch = quasi.value.raw.match(/#[0-9A-Fa-f]{6}/);
                    if (hexMatch) {
                      const hex = hexMatch[0].toUpperCase();
                      const token = COLOR_TO_TOKEN[hex];
                      
                      if (token) {
                        quasi.value.raw = quasi.value.raw.replace(hex, token);
                        quasi.value.cooked = quasi.value.cooked.replace(hex, token);
                        modified = true;
                        issues.push({
                          line: path.node.loc?.start.line,
                          message: `Replaced hardcoded ${hex} fallback with ${token}`,
                        });
                      }
                    }
                  });
                }
              }
            });
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
