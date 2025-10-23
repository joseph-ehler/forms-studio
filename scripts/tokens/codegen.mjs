#!/usr/bin/env node
/**
 * Token Codegen
 * 
 * Generates CSS variables and TypeScript types from token source files.
 * Respects deprecation map to maintain backward compatibility.
 * 
 * Usage: node scripts/tokens/codegen.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '../..');

// Load deprecation map
const deprecationsPath = path.join(ROOT, 'scripts/tokens/deprecations.json');
let deprecations = {};
if (fs.existsSync(deprecationsPath)) {
  deprecations = JSON.parse(fs.readFileSync(deprecationsPath, 'utf8'));
}

/**
 * Extract tokens from TS source
 */
function extractTokens(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Simple regex extraction (could use ts-morph for robustness)
  const exportRegex = /export const (\w+) = ({[\s\S]*?}) as const;/g;
  const tokens = {};
  
  let match;
  while ((match = exportRegex.exec(content)) !== null) {
    const [, name, value] = match;
    try {
      // Eval is safe here as we control the source
      tokens[name] = eval(`(${value})`);
    } catch (e) {
      console.warn(`⚠️  Could not parse ${name}:`, e.message);
    }
  }
  
  return tokens;
}

/**
 * Flatten nested token object to dot notation
 */
function flattenTokens(obj, prefix = '') {
  const flattened = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(flattened, flattenTokens(value, newKey));
    } else {
      flattened[newKey] = value;
    }
  }
  
  return flattened;
}

/**
 * Convert token path to CSS variable name
 */
function toCSSVar(tokenPath) {
  return `--ds-${String(tokenPath).replace(/\./g, '-').toLowerCase()}`;
}

/**
 * Generate CSS variables
 */
function generateCSS(tokens) {
  const flat = flattenTokens(tokens);
  const lines = [
    '/**',
    ' * Design System Tokens - CSS Variables',
    ' * AUTO-GENERATED - DO NOT EDIT',
    ' * Run: pnpm tokens:codegen',
    ' */',
    '',
    ':root {',
  ];
  
  // Add active tokens
  for (const [tokenPath, value] of Object.entries(flat)) {
    // Skip non-primitive values
    if (typeof value === 'object' || typeof value === 'function') continue;
    
    const cssVar = toCSSVar(tokenPath);
    lines.push(`  ${cssVar}: ${value};`);
  }
  
  // Add deprecated aliases
  if (Object.keys(deprecations).length > 0) {
    lines.push('', '  /* Deprecated (aliases to new tokens) */');
    for (const [oldPath, newPath] of Object.entries(deprecations)) {
      const oldVar = toCSSVar(oldPath);
      const newVar = toCSSVar(newPath);
      lines.push(`  ${oldVar}: var(${newVar}); /* deprecated: use ${newVar} */`);
    }
  }
  
  lines.push('}', '');
  
  return lines.join('\n');
}

/**
 * Generate TypeScript types
 */
function generateTypes(tokens) {
  const lines = [
    '/**',
    ' * Design System Tokens - TypeScript Types',
    ' * AUTO-GENERATED - DO NOT EDIT',
    ' * Run: pnpm tokens:codegen',
    ' */',
    '',
  ];
  
  function buildTypeTree(obj, indent = 0) {
    const spaces = '  '.repeat(indent);
    const result = [];
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result.push(`${spaces}${key}: {`);
        result.push(...buildTypeTree(value, indent + 1));
        result.push(`${spaces}};`);
      } else {
        result.push(`${spaces}${key}: '${value}';`);
      }
    }
    
    return result;
  }
  
  for (const [name, tokenObj] of Object.entries(tokens)) {
    lines.push(`export interface ${name}Type {`);
    lines.push(...buildTypeTree(tokenObj, 1));
    lines.push('}', '');
  }
  
  return lines.join('\n');
}

/**
 * Main
 */
async function main() {
  console.log('🎨 Token Codegen\n');
  
  const tokensDir = path.join(ROOT, 'packages/ds/src/tokens');
  const outputDir = path.join(ROOT, 'packages/ds/src/generated');
  
  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });
  
  // Collect all token files
  const tokenFiles = [
    'colors.ts',
    'spacing.ts',
    'typography.ts',
    'radius.ts',
    'shadows.ts',
    'transitions.ts',
  ];
  
  const allTokens = {};
  
  for (const file of tokenFiles) {
    const filePath = path.join(tokensDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`📦 Extracting ${file}...`);
      Object.assign(allTokens, extractTokens(filePath));
    }
  }
  
  // Generate CSS
  console.log('🎨 Generating CSS variables...');
  const css = generateCSS(allTokens);
  fs.writeFileSync(path.join(outputDir, 'tokens.css'), css);
  
  // Generate Types
  console.log('📝 Generating TypeScript types...');
  const types = generateTypes(allTokens);
  fs.writeFileSync(path.join(outputDir, 'tokens.types.ts'), types);
  
  // Generate snapshot
  console.log('📸 Generating snapshot...');
  const snapshot = {
    version: new Date().toISOString().split('T')[0],
    generator: '@intstudio/token-codegen',
    metadata: {
      totalTokens: Object.keys(flattenTokens(allTokens)).length,
      deprecatedTokens: Object.keys(deprecations).length,
    },
    tokens: allTokens,
    deprecations,
  };
  
  const snapshotPath = path.join(ROOT, `contracts/tokens@${snapshot.version}.json`);
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));
  
  console.log('\n✅ Token codegen complete!');
  console.log(`   CSS: packages/ds/src/generated/tokens.css`);
  console.log(`   Types: packages/ds/src/generated/tokens.types.ts`);
  console.log(`   Snapshot: contracts/tokens@${snapshot.version}.json`);
}

main().catch(console.error);
