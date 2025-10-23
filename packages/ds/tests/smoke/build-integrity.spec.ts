import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('All build artifacts exist', () => {
  const distPath = path.join(process.cwd(), 'dist');
  
  // ESM
  expect(fs.existsSync(path.join(distPath, 'index.js'))).toBe(true);
  expect(fs.existsSync(path.join(distPath, 'index.css'))).toBe(true);
  expect(fs.existsSync(path.join(distPath, 'index.d.ts'))).toBe(true);
  
  // CJS
  expect(fs.existsSync(path.join(distPath, 'index.cjs'))).toBe(true);
  expect(fs.existsSync(path.join(distPath, 'index.d.cts'))).toBe(true);
});

test('Build artifacts are within size budgets', () => {
  const jsPath = path.join(process.cwd(), 'dist', 'index.js');
  const cssPath = path.join(process.cwd(), 'dist', 'index.css');
  
  const jsSize = fs.statSync(jsPath).size;
  const cssSize = fs.statSync(cssPath).size;
  
  // Budgets
  const JS_MAX = 750 * 1024;   // 750 KB
  const CSS_MAX = 120 * 1024;  // 120 KB
  
  expect(jsSize).toBeLessThan(JS_MAX);
  expect(cssSize).toBeLessThan(CSS_MAX);
  
  console.log(`✅ JS: ${(jsSize / 1024).toFixed(2)} KB / ${JS_MAX / 1024} KB`);
  console.log(`✅ CSS: ${(cssSize / 1024).toFixed(2)} KB / ${CSS_MAX / 1024} KB`);
});

test('TypeScript declarations are valid', () => {
  const dtsPath = path.join(process.cwd(), 'dist', 'index.d.ts');
  const content = fs.readFileSync(dtsPath, 'utf-8');
  
  // Should export key primitives
  expect(content).toContain('Stack');
  expect(content).toContain('Grid');
  expect(content).toContain('Button');
  expect(content).toContain('Section');
});
