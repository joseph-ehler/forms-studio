#!/usr/bin/env node
/**
 * Design Lint Script
 * 
 * Scans built CSS for raw colors/values and enforces token usage.
 * Runs on dist/ files to catch any violations that made it through build.
 */

import { readFileSync } from 'node:fs';
import postcss from 'postcss';

const files = [
  'packages/ds/dist/index.css',
  'packages/ds/dist/fb/index.css',
];

const bad: string[] = [];

for (const file of files) {
  try {
    const css = readFileSync(file, 'utf8');
    const root = postcss.parse(css);
    
    root.walkDecls((decl) => {
      const prop = decl.prop.toLowerCase();
      const val = decl.value;
      
      // Check appearance properties for raw values
      if (/^(color|background|border|outline|box-shadow)$/.test(prop)) {
        // Allow if using tokens
        if (/var\(--ds-/.test(val)) continue;
        
        // Flag raw hex or rgba()
        if (/#|rgba?\(/i.test(val)) {
          const location = `${file}:${decl.source?.start?.line}`;
          bad.push(`${location} → ${prop}: ${val}`);
        }
      }
    });
  } catch (err) {
    console.warn(`⚠️  Could not read ${file}:`, err);
  }
}

if (bad.length > 0) {
  console.error('\n❌ Design token violations found:\n');
  bad.forEach((violation) => console.error(`  ${violation}`));
  console.error('\nUse tokens (var(--ds-*)) instead of raw colors.\n');
  process.exit(1);
} else {
  console.log('✅ Design lint: All appearance values use tokens');
}
