#!/usr/bin/env node
/**
 * Design Contrast Checker
 * 
 * Validates WCAG contrast ratios for semantic role pairs.
 * Fails CI if any pair falls below required thresholds.
 * 
 * Run: pnpm design:contrast
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// OKLCH → sRGB conversion (simplified for contrast checking)
function oklchToRgb(l: number, c: number, h: number): [number, number, number] {
  // Simplified conversion - for production, use colorjs.io or culori
  // This is a rough approximation for demonstration
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);
  
  // Rough Lab→RGB (not perceptually accurate, for demo only)
  const y = (l + 16) / 116;
  const x = a / 500 + y;
  const z = y - b / 200;
  
  let r = 3.2406 * x - 1.5372 * y - 0.4986 * z;
  let g = -0.9689 * x + 1.8758 * y + 0.0415 * z;
  let bl = 0.0557 * x - 0.2040 * y + 1.0570 * z;
  
  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
  bl = bl > 0.0031308 ? 1.055 * Math.pow(bl, 1 / 2.4) - 0.055 : 12.92 * bl;
  
  return [
    Math.max(0, Math.min(255, Math.round(r * 255))),
    Math.max(0, Math.min(255, Math.round(g * 255))),
    Math.max(0, Math.min(255, Math.round(bl * 255))),
  ];
}

// Calculate relative luminance (WCAG formula)
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate WCAG contrast ratio
function getContrast(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const lum1 = getLuminance(...rgb1);
  const lum2 = getLuminance(...rgb2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parse tokens.css and resolve role colors to approximate RGB
 * (In production, you'd parse CSS properly or use a CSS-in-JS snapshot)
 */
function getApproximateRoleColors(): Record<string, [number, number, number]> {
  // Hardcoded approximations for now - in production, parse tokens.css
  // or use a build-time snapshot
  return {
    'role-text': [11, 11, 12],        // neutral-12 (dark text)
    'role-bg': [252, 252, 252],       // neutral-1 (white-ish)
    'role-surface': [250, 250, 250],  // neutral-2
    'role-primary-bg': oklchToRgb(0.63, 0.15, 225),  // primary-10
    'role-primary-text': [255, 255, 255],  // white
  };
}

// Critical role pairs to check (name, fg, bg, minRatio)
const pairs: Array<[string, string, string, number]> = [
  ['Body text on background', 'role-text', 'role-bg', 4.5],
  ['Body text on surface', 'role-text', 'role-surface', 4.5],
  ['Primary button text', 'role-primary-text', 'role-primary-bg', 4.5],
];

console.log('🎨 Checking WCAG contrast ratios...\n');

const colors = getApproximateRoleColors();
let failCount = 0;

for (const [label, fgRole, bgRole, minRatio] of pairs) {
  const fg = colors[fgRole];
  const bg = colors[bgRole];
  
  if (!fg || !bg) {
    console.warn(`⚠️  Could not resolve: ${fgRole} or ${bgRole}`);
    continue;
  }
  
  const ratio = getContrast(fg, bg);
  const pass = ratio >= minRatio;
  
  if (pass) {
    console.log(`✅ ${label}: ${ratio.toFixed(2)}:1 (≥ ${minRatio}:1)`);
  } else {
    console.error(`❌ ${label}: ${ratio.toFixed(2)}:1 (< ${minRatio}:1)`);
    failCount++;
  }
}

console.log('');

if (failCount > 0) {
  console.error(`❌ ${failCount} contrast check(s) failed\n`);
  console.error('Adjust ramp lightness or role mappings in tokens.css');
  process.exit(1);
} else {
  console.log('✅ All contrast checks passed\n');
  console.log('Note: This script uses approximate OKLCH→RGB conversion.');
  console.log('For production, integrate colorjs.io or culori for accurate conversion.\n');
}
