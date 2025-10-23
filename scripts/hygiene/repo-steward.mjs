#!/usr/bin/env node
/**
 * Repo Steward - Enforces folder boundaries & root cleanliness
 * 
 * Rules:
 * 1. Root only hosts orchestration (package.json, turbo.json, etc) and README
 * 2. All docs go to docs/ or packages/*/docs/
 * 3. All scripts go to scripts/ or packages/*/scripts/
 * 4. No stray files at root
 */

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const config = yaml.load(fs.readFileSync(path.join(ROOT, 'repo.imports.yaml'), 'utf8'));
const staged = execSync('git diff --name-only --staged', { stdio: 'pipe' })
  .toString()
  .trim()
  .split('\n')
  .filter(Boolean);

const violations = [];

// Check root file boundaries
const rootRules = config.root || {};
const allowPatterns = (rootRules.allow || []).map(p => new RegExp(p));
const denyPatterns = (rootRules.deny || []).map(p => new RegExp(p));
const suggestions = rootRules.suggest || {};

for (const file of staged) {
  // Only check files at root (no slashes in path)
  if (file.includes('/')) continue;
  
  // Check if explicitly allowed
  const isAllowed = allowPatterns.some(re => re.test(file));
  if (isAllowed) continue;
  
  // Check if explicitly denied
  const isDenied = denyPatterns.some(re => re.test(file));
  if (isDenied) {
    // Find suggestion
    let suggestion = 'docs/handbook/ or scripts/';
    for (const [pattern, dest] of Object.entries(suggestions)) {
      if (new RegExp(pattern).test(file)) {
        suggestion = dest;
        break;
      }
    }
    
    violations.push({
      file,
      reason: 'Root file not allowed',
      suggestion: `Move to: ${suggestion}${file}`,
    });
    continue;
  }
  
  // If not explicitly allowed and looks like it should be organized
  if (/\.(md|sh|js|mjs|ts|tsx)$/.test(file) && !isAllowed) {
    violations.push({
      file,
      reason: 'Potential root sprawl',
      suggestion: 'Root should only contain orchestration files. Move to appropriate directory.',
    });
  }
}

// Check package boundaries
for (const file of staged) {
  const pkgMatch = file.match(/^packages\/([^/]+)\//);
  if (!pkgMatch) continue;
  
  const pkg = pkgMatch[1];
  const pkgRules = config.packages?.[pkg];
  if (!pkgRules) continue;
  
  // Check if file is in allowed roots
  const roots = pkgRules.roots || [];
  const inAllowedRoot = roots.some(root => file.startsWith(root));
  
  if (!inAllowedRoot && /\.(ts|tsx|js|jsx)$/.test(file)) {
    // Check if it's a valid exception (scripts/, docs/, tests/)
    const isException = /\/(scripts|docs|tests|__tests__)\//.test(file);
    if (!isException) {
      violations.push({
        file,
        reason: `Outside allowed roots for @intstudio/${pkg}`,
        suggestion: `Should be under: ${roots.join(' or ')}`,
      });
    }
  }
}

// Report
if (violations.length > 0) {
  console.error('\n🛡️  Repo Steward found boundary violations:\n');
  
  violations.forEach(v => {
    console.error(`  ⛔ ${v.file}`);
    console.error(`     ${v.reason}`);
    console.error(`     💡 ${v.suggestion}\n`);
  });
  
  console.error('💡 Quick fixes:');
  console.error('   - Use generators: pnpm new:docs:handbook <name>');
  console.error('   - Move manually and re-stage');
  console.error('   - Run: pnpm docs:autostow (auto-moves docs)\n');
  
  process.exit(1);
}

console.log('✅ Repo Steward: all staged files conform to boundaries');
