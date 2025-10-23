#!/usr/bin/env node
/**
 * Codemod Runner
 * 
 * Runs jscodeshift transforms for breaking changes.
 * Integrates with changesets for versioning.
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '../..');

const args = process.argv.slice(2);
const codemodId = args[0];
const isDryRun = args.includes('--dry');
const targetPaths = args.filter(a => !a.startsWith('--') && a !== codemodId);

if (!codemodId) {
  console.error('Usage: pnpm codemod <changeset-id> [paths...] [--dry]');
  console.error('\nAvailable codemods:');
  
  const codemodsDir = path.join(__dirname, 'codemods');
  if (fs.existsSync(codemodsDir)) {
    const codemods = fs.readdirSync(codemodsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
    
    for (const id of codemods) {
      console.error(`  - ${id}`);
    }
  }
  
  process.exit(1);
}

const codemodDir = path.join(__dirname, codemodId);

if (!fs.existsSync(codemodDir)) {
  console.error(`❌ Codemod not found: ${codemodId}`);
  console.error(`   Expected: scripts/codemods/${codemodId}/`);
  process.exit(1);
}

const transformPath = path.join(codemodDir, 'transform.mjs');

if (!fs.existsSync(transformPath)) {
  console.error(`❌ Transform file not found: ${transformPath}`);
  process.exit(1);
}

// Default to all packages if no paths specified
const paths = targetPaths.length > 0 
  ? targetPaths 
  : ['packages/*/src'];

console.log(`🔧 Running codemod: ${codemodId}`);
console.log(`   Transform: ${transformPath}`);
console.log(`   Paths: ${paths.join(', ')}`);
console.log(`   Mode: ${isDryRun ? 'DRY RUN' : 'APPLY'}\n`);

// Run jscodeshift
const jscodeshiftCmd = [
  'npx',
  'jscodeshift',
  '--parser=tsx',
  '--extensions=ts,tsx,js,jsx',
  isDryRun ? '--dry' : '',
  '--print',
  '--verbose=2',
  `-t ${transformPath}`,
  ...paths,
].filter(Boolean).join(' ');

try {
  execSync(jscodeshiftCmd, {
    cwd: ROOT,
    stdio: 'inherit',
  });
  
  if (isDryRun) {
    console.log('\n✅ Dry run complete. Run without --dry to apply changes.');
  } else {
    console.log('\n✅ Codemod complete!');
    console.log('   Review changes and run tests before committing.');
  }
} catch (error) {
  console.error('\n❌ Codemod failed');
  process.exit(1);
}
