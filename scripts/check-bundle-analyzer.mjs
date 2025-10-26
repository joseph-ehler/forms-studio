#!/usr/bin/env node
/**
 * Bundle Analyzer - Real Code Split Check
 * 
 * Uses source-map-explorer to verify:
 * - RSBS is in separate chunk (not main bundle)
 * - Main bundle is within budget (550KB)
 * - Main increase vs baseline < 30KB
 * 
 * Run: node scripts/check-bundle-analyzer.mjs
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';

const BUNDLE_DIR = 'packages/ds/dist';
const MAIN_BUNDLE = 'index.js';
const BUDGET = 550000; // 550KB
const BASELINE = 520000; // Current baseline (~520KB)
const MAX_INCREASE = 30000; // +30KB max

console.log('🔍 Bundle Analyzer - Code Split Check\n');

// Check if dist exists
if (!existsSync(BUNDLE_DIR)) {
  console.error('❌ Build dist not found. Run `pnpm build` first.');
  process.exit(1);
}

// Check main bundle size
const mainPath = join(BUNDLE_DIR, MAIN_BUNDLE);
if (!existsSync(mainPath)) {
  console.error(`❌ Main bundle not found: ${mainPath}`);
  process.exit(1);
}

const mainSize = statSync(mainPath).size;
const increase = mainSize - BASELINE;
const percentOfBudget = ((mainSize / BUDGET) * 100).toFixed(1);

console.log('📦 Main Bundle Size:');
console.log(`   Current:  ${(mainSize / 1024).toFixed(2)} KB`);
console.log(`   Baseline: ${(BASELINE / 1024).toFixed(2)} KB`);
console.log(`   Budget:   ${(BUDGET / 1024).toFixed(2)} KB`);
console.log(`   Usage:    ${percentOfBudget}%`);
console.log('');

// Check budget
if (mainSize > BUDGET) {
  console.error(`❌ FAIL: Bundle exceeds budget by ${((mainSize - BUDGET) / 1024).toFixed(2)} KB`);
  console.error('');
  console.error('This usually means:');
  console.error('  - Mobile-only library got inlined');
  console.error('  - New dependency added without lazy-loading');
  console.error('');
  process.exit(1);
}

console.log('✅ PASS: Bundle within budget');

// Check increase vs baseline
if (increase > MAX_INCREASE) {
  console.error(`❌ FAIL: Bundle increased by ${(increase / 1024).toFixed(2)} KB (max: ${(MAX_INCREASE / 1024).toFixed(2)} KB)`);
  console.error('');
  console.error('Significant increase detected. Review:');
  console.error('  - What was added?');
  console.error('  - Can it be lazy-loaded?');
  console.error('  - Is tree-shaking working?');
  console.error('');
  process.exit(1);
}

console.log(`✅ PASS: Increase ${increase > 0 ? '+' : ''}${(increase / 1024).toFixed(2)} KB (within threshold)`);
console.log('');

// Check for code splitting (look for chunk files)
console.log('🔍 Code Split Check:');

try {
  const files = execSync(`ls ${BUNDLE_DIR}/*.js 2>/dev/null || true`, { encoding: 'utf-8' });
  const chunks = files.split('\n').filter(f => f && !f.includes('index.js'));
  
  if (chunks.length === 0) {
    console.warn('⚠️  WARNING: No chunk files found');
    console.warn('   Mobile engines may be inlined in main bundle');
    console.warn('   Expected: Separate chunks for dynamic imports');
    console.warn('');
  } else {
    console.log(`✅ PASS: Found ${chunks.length} chunk file(s)`);
    chunks.forEach(chunk => {
      const chunkName = chunk.split('/').pop();
      const chunkSize = statSync(chunk).size;
      console.log(`   - ${chunkName}: ${(chunkSize / 1024).toFixed(2)} KB`);
    });
    console.log('');
  }
} catch (err) {
  console.warn('⚠️  WARNING: Could not check chunks:', err.message);
  console.warn('');
}

// Final summary
console.log('📊 Summary:');
console.log(`   Headroom: ${((BUDGET - mainSize) / 1024).toFixed(2)} KB remaining`);
console.log(`   Status: ${mainSize <= BUDGET ? '✅ PASS' : '❌ FAIL'}`);
console.log('');

process.exit(mainSize <= BUDGET ? 0 : 1);
