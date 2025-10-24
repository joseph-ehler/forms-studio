/**
 * Refiner Transform: No Hardcoded Visuals v2.0
 * 
 * Enforces 100% token usage for ALL visual properties:
 * - Colors (hex, rgb, rgba, hsl, hsla, named)
 * - Shadows (box-shadow, text-shadow)
 * - Border radius
 * - Spacing (where applicable in inline styles)
 * 
 * Philosophy: Zero hard-coded values = perfect theming.
 * All visual constants MUST come from DS tokens.
 * 
 * Auto-fix: Replaces known values with semantic tokens
 * Error: Flags unknown values for manual review
 */

import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

/* ===== TOKEN MAPS ===== */

// Common hex colors → DS tokens
const COLOR_TO_TOKEN = {
  '#FFFFFF': '--ds-color-surface-base',
  '#FFF': '--ds-color-surface-base',
  '#000000': '--ds-color-text',
  '#000': '--ds-color-text',
  '#EF4444': '--ds-color-state-danger',
  '#DC2626': '--ds-color-state-danger',
  '#3B82F6': '--ds-color-primary-bg',
  '#2563EB': '--ds-color-primary-bg',
  '#10B981': '--ds-color-state-success',
  '#F59E0B': '--ds-color-state-warning',
  '#A3A3A3': '--ds-color-text-muted',
  '#525252': '--ds-color-text-muted',
  '#D1D5DB': '--ds-color-border-subtle',
  '#E5E7EB': '--ds-color-surface-subtle',
};

// Common shadow values → DS tokens
const SHADOW_TO_TOKEN = {
  '0 1px 2px rgba(0, 0, 0, 0.05)': '--ds-shadow-overlay-sm',
  '0 2px 8px rgba(0, 0, 0, 0.08)': '--ds-shadow-overlay-sm',
  '0 4px 12px rgba(0, 0, 0, 0.10)': '--ds-shadow-overlay-md',
  '0 4px 16px rgba(0, 0, 0, 0.12)': '--ds-shadow-overlay-md',
  '0 8px 24px rgba(0, 0, 0, 0.16)': '--ds-shadow-overlay-lg',
};

// Common border radius → DS tokens
const RADIUS_TO_TOKEN = {
  '2px': '--ds-radius-sm',
  '4px': '--ds-radius-sm',
  '0.25rem': '--ds-radius-sm',
  '8px': '--ds-radius-md',
  '0.5rem': '--ds-radius-md',
  '12px': '--ds-radius-lg',
  '0.75rem': '--ds-radius-lg',
  '16px': '--ds-radius-xl',
  '1rem': '--ds-radius-xl',
  '24px': '--ds-radius-2xl',
  '1.5rem': '--ds-radius-2xl',
  '9999px': '--ds-radius-full',
  '50%': '--ds-radius-full',
};

// Common spacing → DS tokens (for inline styles)
const SPACING_TO_TOKEN = {
  '4px': '--ds-space-1',
  '0.25rem': '--ds-space-1',
  '8px': '--ds-space-2',
  '0.5rem': '--ds-space-2',
  '12px': '--ds-space-3',
  '0.75rem': '--ds-space-3',
  '16px': '--ds-space-4',
  '1rem': '--ds-space-4',
  '24px': '--ds-space-6',
  '1.5rem': '--ds-space-6',
  '32px': '--ds-space-8',
  '2rem': '--ds-space-8',
};

/* ===== PROPERTY CATEGORIES ===== */

const COLOR_PROPERTIES = new Set([
  'color',
  'background',
  'backgroundColor',
  'borderColor',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'outlineColor',
  'fill',
  'stroke',
]);

const SHADOW_PROPERTIES = new Set([
  'boxShadow',
  'textShadow',
]);

const RADIUS_PROPERTIES = new Set([
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
]);

const SPACING_PROPERTIES = new Set([
  'padding',
  'margin',
  'gap',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
]);

// Behavioral properties (allowed to be inline)
const ALLOWED_INLINE = new Set([
  'userSelect',
  'pointerEvents',
  'cursor',
  'touchAction',
  'display',
  'position',
  'zIndex',
  'flex',
  'flexDirection',
  'alignItems',
  'justifyContent',
  'overflow',
  'overflowX',
  'overflowY',
  'transform',
  'transition',
  'animation',
  'opacity',
  'visibility',
  'width',
  'height',
  'maxWidth',
  'maxHeight',
  'minWidth',
  'minHeight',
  'top',
  'right',
  'bottom',
  'left',
  'inset',
]);

/* ===== VALIDATORS ===== */

const HEX_REGEX = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})/;
const RGB_REGEX = /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+)?\s*\)/;
const HSL_REGEX = /hsla?\(\s*\d+\s*,\s*[\d.]+%\s*,\s*[\d.]+%(?:\s*,\s*[\d.]+)?\s*\)/;
const NAMED_COLOR_REGEX = /\b(red|blue|green|yellow|orange|purple|pink|gray|black|white)\b/i;

function hasHardcodedColor(value) {
  if (!value) return false;
  return HEX_REGEX.test(value) || RGB_REGEX.test(value) || HSL_REGEX.test(value) || NAMED_COLOR_REGEX.test(value);
}

function hasHardcodedShadow(value) {
  if (!value) return false;
  // Shadow without var( is hard-coded
  return value.includes('rgba') || value.includes('rgb') || value.includes('#');
}

function hasHardcodedRadius(value) {
  if (!value) return false;
  // Allow 0, var(), inherit, etc.
  if (value === '0' || value.startsWith('var(') || value === 'inherit' || value === 'initial') return false;
  // Otherwise it's hard-coded if it has px, rem, %, etc.
  return /\d+(px|rem|em|%)/.test(value);
}

/* ===== TRANSFORM ===== */

export function noHardcodedVisualsV2_0() {
  return {
    name: 'no-hardcoded-visuals-v2.0',
    apply: async ({ file, code }) => {
      const issues = [];
      let modified = false;
      
      // Skip token definition files
      if (file.path.includes('/tokens/') || file.path.includes('.tokens.')) {
        return { changed: false, code, issues: [] };
      }
      
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
              const line = prop.loc?.start.line;
              
              // Skip behavioral properties (these are OK inline)
              if (ALLOWED_INLINE.has(key)) return;
              
              // Check color properties
              if (COLOR_PROPERTIES.has(key)) {
                if (t.isStringLiteral(value)) {
                  const colorValue = value.value;
                  
                  // Skip if already using tokens
                  if (colorValue.startsWith('var(') || colorValue === 'transparent' || colorValue === 'currentColor') return;
                  
                  if (hasHardcodedColor(colorValue)) {
                    const normalized = colorValue.toUpperCase();
                    const token = COLOR_TO_TOKEN[normalized];
                    
                    if (token) {
                      value.value = `var(${token})`;
                      modified = true;
                      issues.push({
                        line,
                        message: `✅ Replaced hardcoded color "${colorValue}" with ${token}`,
                        severity: 'info',
                      });
                    } else {
                      issues.push({
                        line,
                        message: `❌ Hard-coded color "${colorValue}" in ${key}. Use var(--ds-color-*).`,
                        severity: 'error',
                      });
                    }
                  }
                }
              }
              
              // Check shadow properties
              if (SHADOW_PROPERTIES.has(key)) {
                if (t.isStringLiteral(value)) {
                  const shadowValue = value.value;
                  
                  if (shadowValue !== 'none' && !shadowValue.startsWith('var(') && hasHardcodedShadow(shadowValue)) {
                    const token = SHADOW_TO_TOKEN[shadowValue];
                    
                    if (token) {
                      value.value = `var(${token})`;
                      modified = true;
                      issues.push({
                        line,
                        message: `✅ Replaced hardcoded shadow with ${token}`,
                        severity: 'info',
                      });
                    } else {
                      issues.push({
                        line,
                        message: `❌ Hard-coded shadow in ${key}. Use var(--ds-shadow-*).`,
                        severity: 'error',
                      });
                    }
                  }
                }
              }
              
              // Check radius properties
              if (RADIUS_PROPERTIES.has(key)) {
                if (t.isStringLiteral(value)) {
                  const radiusValue = value.value;
                  
                  if (hasHardcodedRadius(radiusValue)) {
                    const token = RADIUS_TO_TOKEN[radiusValue];
                    
                    if (token) {
                      value.value = `var(${token})`;
                      modified = true;
                      issues.push({
                        line,
                        message: `✅ Replaced hardcoded radius "${radiusValue}" with ${token}`,
                        severity: 'info',
                      });
                    } else {
                      issues.push({
                        line,
                        message: `❌ Hard-coded radius "${radiusValue}" in ${key}. Use var(--ds-radius-*).`,
                        severity: 'error',
                      });
                    }
                  }
                }
              }
              
              // Check spacing properties (warning only - inline spacing sometimes necessary)
              if (SPACING_PROPERTIES.has(key)) {
                if (t.isStringLiteral(value)) {
                  const spacingValue = value.value;
                  const token = SPACING_TO_TOKEN[spacingValue];
                  
                  if (token && !spacingValue.startsWith('var(')) {
                    issues.push({
                      line,
                      message: `⚠️ Consider using ${token} instead of "${spacingValue}" for ${key}.`,
                      severity: 'warning',
                    });
                  }
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

export default noHardcodedVisualsV2_0;
