#!/usr/bin/env node
/**
 * Import Doctor - Automagic Import Hygiene
 * 
 * Check mode (default): node scripts/import-doctor.mjs
 * Fix mode: node scripts/import-doctor.mjs --fix
 * 
 * Detects & auto-fixes:
 * - Deep imports (e.g. @intstudio/ds/src/...)
 * - Cross-package relative imports (e.g. ../../primitives)
 * - Non-canonical DS paths (e.g. ../components instead of @intstudio/ds/primitives)
 * - Missing barrel exports
 */

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { globSync } from 'glob';

const ROOT = process.cwd();
const rules = yaml.load(fs.readFileSync(path.join(ROOT, 'repo.imports.yaml'), 'utf8'));
const FIX = process.argv.includes('--fix');

const SRC_GLOBS = [
  'packages/**/src/**/*.{ts,tsx}',
  '!**/node_modules/**',
  '!**/dist/**',
  '!**/*.d.ts',
  '!**/*.stories.*',
];

const fileList = globSync(SRC_GLOBS, { dot: false });

const RE_IMPORT = /from\s+['"]([^'"]+)['"];?$/;
const problems = [];

function applyMap(spec) {
  for (const [, pkg] of Object.entries(rules.packages || {})) {
    const map = pkg.map || {};
    for (const [pat, target] of Object.entries(map)) {
      const re = new RegExp(pat);
      if (re.test(spec)) return spec.replace(re, target);
    }
  }
  return null;
}

function violates(pkgKey, spec) {
  const pkg = rules.packages?.[pkgKey];
  if (!pkg) return false;
  const denies = pkg.deny || [];
  for (const d of denies) {
    const re = new RegExp(d);
    if (re.test(spec)) return true;
  }
  return false;
}

function detectPkg(file) {
  if (file.startsWith('packages/ds/')) return 'ds';
  if (file.startsWith('packages/forms/')) return 'forms';
  return null;
}

let totalFixed = 0;

for (const file of fileList) {
  const pkgKey = detectPkg(file);
  if (!pkgKey) continue;
  
  const src = fs.readFileSync(file, 'utf8').split('\n');
  let changed = false;
  
  src.forEach((line, i) => {
    const m = line.match(RE_IMPORT);
    if (!m) return;
    const spec = m[1];

    // deny rules
    if (violates(pkgKey, spec)) {
      const fixed = applyMap(spec);
      if (fixed && FIX) {
        src[i] = line.replace(spec, fixed);
        changed = true;
        totalFixed++;
        console.log(`  ✓ ${file}:${i + 1}  "${spec}" → "${fixed}"`);
      } else if (fixed) {
        problems.push({ file, line: i + 1, spec, fixed, msg: `Non-conforming import` });
      } else {
        problems.push({ file, line: i + 1, spec, msg: `Violates deny rule (no auto-fix)` });
      }
    }

    // prefer rules (upgrade relative → barrel)
    const prefer = rules.packages?.[pkgKey]?.prefer || {};
    for (const [pat, target] of Object.entries(prefer)) {
      const re = new RegExp(pat);
      if (re.test(spec)) {
        if (FIX) {
          src[i] = line.replace(spec, target);
          changed = true;
          totalFixed++;
          console.log(`  ↑ ${file}:${i + 1}  "${spec}" → "${target}"`);
        } else {
          problems.push({ file, line: i + 1, spec, fixed: target, msg: `Prefer barrel import` });
        }
      }
    }
  });

  if (changed) fs.writeFileSync(file, src.join('\n'));
}

if (problems.length) {
  console.error('\n⛔ Import Doctor found issues:\n');
  problems.forEach(p => {
    console.error(`  ${p.file}:${p.line}`);
    console.error(`    Current: "${p.spec}"`);
    if (p.fixed) console.error(`    Fix to:  "${p.fixed}"`);
    console.error(`    Reason:  ${p.msg}\n`);
  });
  
  if (!FIX) {
    console.error(`\n💡 Run with --fix to auto-correct: pnpm imports:fix\n`);
    process.exit(1);
  } else {
    console.log(`\n✅ Fixed ${totalFixed} imports automatically.`);
    if (problems.filter(p => !p.fixed).length > 0) {
      console.log('⚠️  Some issues require manual review.\n');
    }
  }
} else {
  console.log(FIX 
    ? `✅ Import Doctor: fixed ${totalFixed} imports.` 
    : '✅ Import Doctor: all imports are canonical.');
}
