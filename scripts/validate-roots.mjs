#!/usr/bin/env node
/**
 * Root Directory Validator
 * 
 * Enforces allowlist of top-level directories.
 * Prevents repo sprawl by blocking unauthorized root folders.
 * 
 * Usage:
 *   node scripts/validate-roots.mjs
 */

import { readdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

async function validateRoots() {
  console.log('🔍 Validating top-level directory structure...\n');
  
  // Load allowlist from policy
  const policyPath = join(ROOT, '.policy', 'roots-allowlist.json');
  let allowedRoots;
  
  try {
    const policyData = await readFile(policyPath, 'utf8');
    const policy = JSON.parse(policyData);
    allowedRoots = new Set(policy.allowedRoots);
  } catch (err) {
    console.error('❌ Failed to load roots allowlist:', err.message);
    process.exit(1);
  }
  
  // Get all top-level directories
  const entries = await readdir(ROOT, { withFileTypes: true });
  const actualRoots = entries
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .filter(name => !name.startsWith('.')); // Include dot dirs from allowlist
  
  // Check for violations
  const violations = [];
  
  for (const root of actualRoots) {
    if (!allowedRoots.has(root)) {
      violations.push(root);
    }
  }
  
  // Also check dot directories
  const dotDirs = entries
    .filter(e => e.isDirectory() && e.name.startsWith('.'))
    .map(e => e.name);
  
  for (const dotDir of dotDirs) {
    if (!allowedRoots.has(dotDir)) {
      // Some dot dirs are OK (.git, node_modules, etc.)
      if (!['.git', 'node_modules', '.turbo', '.next', '.cache'].includes(dotDir)) {
        violations.push(dotDir);
      }
    }
  }
  
  // Report results
  if (violations.length === 0) {
    console.log('✅ All top-level directories are approved!\n');
    console.log(`Approved roots (${allowedRoots.size}):`);
    Array.from(allowedRoots).sort().forEach(root => {
      console.log(`  ✅ ${root}`);
    });
    console.log('');
    return true;
  }
  
  console.error('❌ Unauthorized top-level directories found:\n');
  violations.forEach(root => {
    console.error(`  ❌ /${root}`);
  });
  
  console.error('\n📋 Approved roots:');
  Array.from(allowedRoots).sort().forEach(root => {
    console.error(`  ✅ ${root}`);
  });
  
  console.error('\n💡 To add a new root:');
  console.error('  1. Edit .policy/roots-allowlist.json');
  console.error('  2. Get approval in PR');
  console.error('  3. Document reasoning in PR description');
  
  console.error('\n❌ Commit blocked: Unauthorized top-level directories');
  console.error('');
  
  return false;
}

// Run validation
validateRoots().then(isValid => {
  process.exit(isValid ? 0 : 1);
});
