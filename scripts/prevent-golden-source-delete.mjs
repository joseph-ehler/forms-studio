#!/usr/bin/env node
/**
 * Prevent accidental deletion of golden sources
 * 
 * Blocks commits that delete protected directories (flowbite examples, etc.)
 * Run as pre-commit or pre-push hook
 */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

// Load protected sources
const policyPath = '.policy/roots-allowlist.json';
let goldenSources = [
  'flowbite-react-blocks-1.8.0-beta/',
];

if (existsSync(policyPath)) {
  try {
    const policy = JSON.parse(readFileSync(policyPath, 'utf-8'));
    goldenSources = policy.goldenSources || goldenSources;
  } catch {
    console.warn('⚠️  Could not read policy file, using defaults');
  }
}

// Check staged changes for deletions
try {
  const diff = execSync('git diff --cached --name-status', { encoding: 'utf-8' });
  const deletions = diff
    .split('\n')
    .filter(line => line.startsWith('D\t'))
    .map(line => line.substring(2));
  
  for (const source of goldenSources) {
    const deleted = deletions.filter(file => file.startsWith(source));
    
    if (deleted.length > 0) {
      console.error('❌ BLOCKED: Attempting to delete golden source!');
      console.error(`\nProtected: ${source}`);
      console.error(`\nDeleted files (${deleted.length}):`);
      deleted.slice(0, 10).forEach(file => console.error(`  - ${file}`));
      if (deleted.length > 10) {
        console.error(`  ... and ${deleted.length - 10} more`);
      }
      console.error('\nThis directory contains reference patterns needed for DS development.');
      console.error('\nIf you really need to remove it:');
      console.error('  1. Update .policy/roots-allowlist.json');
      console.error('  2. Get approval from team');
      console.error('  3. Use: git commit --no-verify (emergency only)');
      process.exit(1);
    }
  }
  
  console.log('✅ No golden sources deleted');
} catch (error) {
  // No staged changes or git command failed
  process.exit(0);
}
