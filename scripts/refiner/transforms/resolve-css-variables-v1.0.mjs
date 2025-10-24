/**
 * Refiner Transform: Resolve CSS Variables
 * Version: 1.0
 * 
 * Resolves CSS variables to actual values and checks contrast.
 * This catches issues that hardcoded-colors checker misses.
 * 
 * Example:
 * ❌ background: 'var(--ds-color-surface-subtle)' // #fafafa on white = 1.02:1
 * ✅ Would flag: Low contrast 1.02:1 (need 3:1 for UI components)
 */

import { readFile } from 'fs/promises';
import { resolve } from 'path';

export default function resolveCssVariables() {
  return {
    name: 'resolve-css-variables',
    version: '1.0',
    tokens: null,
    
    async init() {
      // Load design tokens
      const tokenPath = resolve(process.cwd(), 'packages/ds/src/styles/tokens/color.vars.css');
      try {
        const content = await readFile(tokenPath, 'utf-8');
        this.tokens = parseTokens(content);
        console.log(`✅ Loaded ${Object.keys(this.tokens).length} design tokens`);
      } catch (err) {
        console.warn('⚠️  Could not load design tokens:', err.message);
        this.tokens = {};
      }
    },
    
    JSXElement(path) {
      if (!this.tokens) return;
      
      const { node } = path;
      const styleAttr = node.openingElement.attributes.find(
        attr => attr.name && attr.name.name === 'style'
      );
      
      if (!styleAttr || !styleAttr.value?.expression) return;
      
      const props = styleAttr.value.expression.properties || [];
      
      // Check background + text color combinations
      const bgProp = props.find(p => p.key && (p.key.name === 'background' || p.key.name === 'backgroundColor'));
      const colorProp = props.find(p => p.key && p.key.name === 'color');
      
      if (bgProp && colorProp) {
        const bgValue = extractValue(bgProp.value);
        const textValue = extractValue(colorProp.value);
        
        // Resolve CSS variables
        const resolvedBg = this.resolveVariable(bgValue);
        const resolvedText = this.resolveVariable(textValue);
        
        if (resolvedBg && resolvedText) {
          const ratio = calculateContrast(resolvedBg, resolvedText);
          
          if (ratio < 4.5) {
            this.report(
              path,
              `Low text contrast: ${ratio.toFixed(2)}:1 (need 4.5:1)\n` +
              `   Background: ${bgValue} → ${resolvedBg}\n` +
              `   Text: ${textValue} → ${resolvedText}\n` +
              `   WCAG 1.4.3 - affects 4% of users (low vision, color blindness)`
            );
          }
        }
      }
      
      // Check hover state visibility (non-text contrast)
      if (bgProp) {
        const bgValue = extractValue(bgProp.value);
        
        // Check if this is a conditional hover background
        if (bgValue.includes('highlighted') || bgValue.includes('hover') || bgValue.includes('Index')) {
          const resolvedBg = this.resolveVariable(bgValue);
          if (resolvedBg) {
            // Check against white background
            const containerBg = '#ffffff';
            const affordance = calculateContrast(resolvedBg, containerBg);
            
            if (affordance < 3.0) {
              this.report(
                path,
                `Low visual affordance: ${affordance.toFixed(2)}:1 (need 3:1)\n` +
                `   Hover background: ${bgValue} → ${resolvedBg}\n` +
                `   Container: ${containerBg}\n` +
                `   WCAG 1.4.11 Non-Text Contrast - hover states must be visible`
              );
            }
          }
        }
      }
    },
    
    resolveVariable(value) {
      if (!value || typeof value !== 'string') return null;
      
      // Extract var(--name)
      const match = value.match(/var\((--[a-z-]+)\)/);
      if (!match) {
        // Direct color value
        return value;
      }
      
      const varName = match[1];
      const resolved = this.tokens[varName];
      
      if (!resolved) return null;
      
      // Recursively resolve if the token value is another variable
      if (resolved.includes('var(')) {
        return this.resolveVariable(resolved);
      }
      
      return resolved;
    }
  };
}

// Helper: Parse CSS tokens file
function parseTokens(content) {
  const tokens = {};
  
  // Parse CSS custom properties from :root
  const regex = /--(ds-[a-z-]+):\s*([^;]+);/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const [, name, value] = match;
    tokens[`--${name}`] = value.trim();
  }
  
  return tokens;
}

// Helper: Extract value from AST node
function extractValue(node) {
  if (!node) return null;
  
  if (node.type === 'StringLiteral') {
    return node.value;
  }
  
  if (node.type === 'Identifier') {
    return node.name;
  }
  
  if (node.type === 'TemplateLiteral') {
    return node.quasis[0]?.value?.raw || null;
  }
  
  if (node.type === 'ConditionalExpression') {
    // For ternaries, check consequent
    return extractValue(node.consequent);
  }
  
  return null;
}

// Helper: Calculate contrast ratio
function calculateContrast(color1, color2) {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

// Helper: Get relative luminance
function getLuminance(color) {
  const rgb = parseColor(color);
  if (!rgb) return 0;
  
  const [r, g, b] = rgb.map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Helper: Parse color to RGB
function parseColor(color) {
  if (!color) return null;
  
  // Hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      return [
        parseInt(hex[0] + hex[0], 16),
        parseInt(hex[1] + hex[1], 16),
        parseInt(hex[2] + hex[2], 16)
      ];
    }
    if (hex.length === 6) {
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16)
      ];
    }
  }
  
  // rgb() or rgba()
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  }
  
  return null;
}
