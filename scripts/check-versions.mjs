#!/usr/bin/env node
/**
 * Version Check - Ensures locked dependency versions match
 * 
 * Validates that pnpm.overrides are correctly applied.
 * Run in CI to catch version drift.
 * 
 * Usage: pnpm versions:check
 */

import { execSync } from 'child_process';

const REQUIRED_VERSIONS = {
  tailwindcss: '3.4.14',
  typescript: '5.8.2',
  'flowbite-react': '0.10.2',
  flowbite: '2.5.2',
};

console.log('🔍 Checking locked dependency versions...\n');

let allMatch = true;

for (const [pkg, expectedVersion] of Object.entries(REQUIRED_VERSIONS)) {
  try {
    // Check across all workspace packages with -r flag
    const output = execSync(`pnpm list ${pkg} -r --depth=0 --json`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'], // Suppress stderr
    });
    
    if (!output || output.trim() === '') {
      console.log(`❌ ${pkg.padEnd(20)} NOT FOUND  (expected ${expectedVersion})`);
      allMatch = false;
      continue;
    }
    
    const packages = JSON.parse(output);
    
    // Find first package that has this dependency
    let actualVersion = 'NOT FOUND';
    for (const pkgData of packages) {
      if (pkgData.dependencies?.[pkg]) {
        actualVersion = pkgData.dependencies[pkg].version;
        break;
      }
      if (pkgData.devDependencies?.[pkg]) {
        actualVersion = pkgData.devDependencies[pkg].version;
        break;
      }
    }
    
    // If not found as direct dependency, check if it exists in node_modules (peer dependency)
    if (actualVersion === 'NOT FOUND') {
      try {
        const peerCheck = execSync(`ls node_modules/.pnpm | grep "^${pkg}@"`, {
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'ignore'],
        });
        const match = peerCheck.match(new RegExp(`${pkg}@([\\d\\.]+)`));
        if (match) {
          actualVersion = match[1] + ' (peer)';
        }
      } catch {
        // Still not found
      }
    }

    const match = actualVersion.replace(' (peer)', '') === expectedVersion;
    const icon = match ? '✅' : '❌';
    
    console.log(
      `${icon} ${pkg.padEnd(20)} ${actualVersion.padEnd(10)} ${
        match ? '' : `(expected ${expectedVersion})`
      }`
    );
    
    if (!match) allMatch = false;
  } catch (err) {
    console.log(`❌ ${pkg.padEnd(20)} ERROR: ${err.message}`);
    allMatch = false;
  }
}

console.log('');

if (!allMatch) {
  console.error('❌ Version mismatch detected!\n');
  console.error('Fix: rm -rf node_modules pnpm-lock.yaml && pnpm install\n');
  process.exit(1);
}

console.log('✅ All dependency versions match overrides!\n');
process.exit(0);
