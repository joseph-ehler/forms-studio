#!/usr/bin/env node
/**
 * Bundle Analyzer - Per-module size tracking
 * 
 * Analyzes bundle to find largest modules and prevent bloat
 */

import fs from 'node:fs';
import path from 'node:path';

const DIST = path.join(process.cwd(), 'dist');
const metafile = path.join(DIST, 'metafile.json');

// Module size budget (prevent accidental blob imports)
const MAX_MODULE_SIZE = 120 * 1024; // 120 KB

if (!fs.existsSync(metafile)) {
  console.log('⚠️  No metafile found. Run build with --metafile flag');
  process.exit(0);
}

const meta = JSON.parse(fs.readFileSync(metafile, 'utf8'));
const modules = Object.entries(meta.outputs || {})
  .filter(([path]) => path.endsWith('.js'))
  .map(([path, info]) => ({
    path,
    size: info.bytes,
    imports: info.imports?.length || 0,
  }))
  .sort((a, b) => b.size - a.size);

console.log('📦 Bundle Analysis\n');
console.log('Top 10 largest modules:\n');

modules.slice(0, 10).forEach((mod, i) => {
  const sizeMB = (mod.size / 1024).toFixed(2);
  const bar = '█'.repeat(Math.floor(mod.size / 10000));
  console.log(`${i + 1}. ${mod.path}`);
  console.log(`   ${sizeMB} KB ${bar}`);
});

// Check for violations
const violations = modules.filter(m => m.size > MAX_MODULE_SIZE);

if (violations.length > 0) {
  console.log(`\n❌ ${violations.length} module(s) exceed ${MAX_MODULE_SIZE / 1024}KB limit:\n`);
  violations.forEach(v => {
    console.log(`  ${v.path}: ${(v.size / 1024).toFixed(2)} KB`);
  });
  console.log('\n💡 Consider code-splitting or lazy loading these modules\n');
  process.exit(1);
}

console.log(`\n✅ All modules under ${MAX_MODULE_SIZE / 1024}KB budget\n`);
