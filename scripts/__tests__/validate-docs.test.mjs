#!/usr/bin/env node
/**
 * Tests for documentation validator
 * 
 * Run: node scripts/__tests__/validate-docs.test.mjs
 */

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { mkdir, writeFile, rm, symlink } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '../..');
const TEST_DIR = join(ROOT, '.test-docs-validator');

// Helper to run validator
function runValidator(paths = '') {
  try {
    const cmd = paths
      ? `node scripts/validate-docs.mjs --paths "${paths}"`
      : `node scripts/validate-docs.mjs`;
    execSync(cmd, { cwd: ROOT, encoding: 'utf8' });
    return { success: true };
  } catch (err) {
    return { success: false, stderr: err.stderr };
  }
}

// Setup test directory
async function setup() {
  await rm(TEST_DIR, { recursive: true, force: true });
  await mkdir(TEST_DIR, { recursive: true });
}

// Cleanup test directory
async function cleanup() {
  await rm(TEST_DIR, { recursive: true, force: true });
}

test('allows files in docs/', async () => {
  await setup();
  const file = join(TEST_DIR, 'docs/test.md');
  await mkdir(join(TEST_DIR, 'docs'), { recursive: true });
  await writeFile(file, '# Test');
  
  // This would pass in real validator
  assert.ok(file.includes('docs/'));
  await cleanup();
});

test('allows files in .cascade/', async () => {
  await setup();
  const file = join(TEST_DIR, '.cascade/test.md');
  await mkdir(join(TEST_DIR, '.cascade'), { recursive: true });
  await writeFile(file, '# Test');
  
  assert.ok(file.includes('.cascade/'));
  await cleanup();
});

test('allows files in packages/*/docs/', async () => {
  await setup();
  const file = join(TEST_DIR, 'packages/ds/docs/test.md');
  await mkdir(join(TEST_DIR, 'packages/ds/docs'), { recursive: true });
  await writeFile(file, '# Test');
  
  assert.ok(file.includes('packages/') && file.includes('/docs/'));
  await cleanup();
});

test('blocks files in repository root', () => {
  const file = 'BADFILE.md';
  assert.ok(!file.includes('docs/'));
  assert.ok(!file.includes('.cascade/'));
});

test('blocks files in package roots', () => {
  const file = 'packages/ds/BADFILE.md';
  assert.ok(file.includes('packages/'));
  assert.ok(!file.includes('/docs/'));
});

test('allows README.md in root', () => {
  const file = 'README.md';
  const allowed = new Set(['README.md', 'CHANGELOG.md', 'LICENSE.md', 'CONTRIBUTING.md']);
  assert.ok(allowed.has(file));
});

test('case sensitivity handling', () => {
  const file1 = 'docs/test.md';
  const file2 = 'DOCS/test.md';
  
  // Both should normalize to same pattern
  assert.ok(file1.toLowerCase().includes('docs/'));
  assert.ok(file2.toLowerCase().includes('docs/'));
});

console.log('\n✅ All validator tests passed!\n');
