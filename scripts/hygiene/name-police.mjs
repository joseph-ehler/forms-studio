#!/usr/bin/env node
/**
 * Name Police - Enforces filename conventions across the repo
 * 
 * Rules:
 * - Components: PascalCase.tsx
 * - Hooks: useCamelCase.ts
 * - Utils: camelCase.ts
 * - CSS: kebab-case.css
 * - Docs: kebab-case.md
 * - ADRs: YYYY-MM-DD-title.md
 * - RFCs: 0001-title.md
 */

import fs from 'node:fs';
import path from 'node:path';
import { globSync } from 'glob';

const ROOT = process.cwd();

const patterns = [
  {
    glob: 'packages/!(node_modules)/**/src/**/*.tsx',
    re: /^[A-Z][A-Za-z0-9]*\.tsx$/,
    msg: 'Components must be PascalCase.tsx',
    exclude: ['.stories.tsx', '.spec.tsx', '.old.tsx', 'main.tsx', 'main-test.tsx', 'createField.tsx', 'sr-announce.tsx'],
  },
  {
    glob: 'packages/!(node_modules)/**/src/**/*.ts',
    re: /^(use)?[a-z][A-Za-z0-9.-]*\.ts$|^[A-Z][A-Za-z0-9]*\.ts$/,
    msg: 'Modules: camelCase.ts, kebab-case.ts, PascalCase.ts (facades), or useCamelCase.ts (hooks)',
    exclude: ['.spec.ts', '.test.ts', '.d.ts', '.test-d.ts', 'index.ts', 'internal.ts'],
  },
  {
    glob: 'packages/!(node_modules)/**/src/**/*.css',
    re: /^[a-z0-9-.]+\.css$/,
    msg: 'CSS files must be kebab-case.css',
  },
  {
    glob: 'docs/**/*.md',
    re: /^[a-z0-9-]+\.md$/,
    msg: 'Docs must be kebab-case.md (legacy uppercase files exempt)',
    exclude: ['README.md', 'CONTRIBUTING.md'],
    skipDirs: ['docs/archive', 'docs/adr'], // Legacy & ADR files exempt
    allowUppercase: true, // Skip for now - these should move to archive
  },
  {
    glob: 'docs/adr/*.md',
    re: /^\d{4}-\d{2}-\d{2}-[a-z0-9-]+\.md$/,
    msg: 'ADR must be YYYY-MM-DD-title.md',
    exclude: ['TEMPLATE.md', 'template.md', 'README.md', 'ADR-001-contentref-auto-wiring.md'],
  },
  {
    glob: 'docs/rfc/*.md',
    re: /^\d{4}-[a-z0-9-]+\.md$/,
    msg: 'RFC must be 0001-title.md (4 digits)',
    exclude: ['template.md'],
  },
];

console.log('👮 Running Name Police...\n');

let fails = 0;
const violations = [];

for (const p of patterns) {
  const files = globSync(p.glob, { dot: false, cwd: ROOT });
  
  for (const f of files) {
    const base = path.basename(f);
    
    // Skip node_modules everywhere
    if (f.includes('/node_modules/')) {
      continue;
    }
    
    // Skip directories that are exempt from this rule
    if (p.skipDirs && p.skipDirs.some(dir => f.startsWith(dir))) {
      continue;
    }
    
    // Skip uppercase legacy files temporarily
    if (p.allowUppercase && /^[A-Z_0-9-]+\.md$/.test(base)) {
      continue;
    }
    
    // Skip duplicate files (should be deleted)
    if (/ \d+\./.test(base)) {
      continue;
    }
    
    // Skip excluded patterns
    if (p.exclude && p.exclude.some(ex => base.endsWith(ex) || base === ex)) {
      continue;
    }
    
    if (!p.re.test(base)) {
      fails++;
      violations.push({
        file: f,
        rule: p.msg,
        current: base,
      });
    }
  }
}

if (fails > 0) {
  console.error(`⛔ Name Police found ${fails} violation(s):\n`);
  
  violations.forEach(v => {
    console.error(`  ${v.file}`);
    console.error(`    Current: ${v.current}`);
    console.error(`    Rule: ${v.rule}\n`);
  });
  
  console.error('💡 Fix naming violations or run generators:\n');
  console.error('   pnpm new:ds:primitive <Name>');
  console.error('   pnpm new:docs:adr <title>\n');
  
  process.exit(1);
}

console.log('✅ Name Police: all filenames conform to conventions\n');
