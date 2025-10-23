#!/usr/bin/env node
/**
 * Step 1: Preflight - Create ADR and migration plan
 * 
 * Usage: pnpm process:preflight <migration-name>
 * 
 * Creates:
 * - ADR stub in docs/adr/YYYY-MM-DD-<name>.md
 * - Prints next steps
 */

import fs from 'node:fs';
import path from 'node:path';

const today = new Date().toISOString().slice(0, 10);
const adrDir = 'docs/adr';
const slug = process.argv[2] || 'unnamed-migration';

// Create ADR directory if needed
fs.mkdirSync(adrDir, { recursive: true });

const file = path.join(adrDir, `${today}-${slug}.md`);

if (fs.existsSync(file)) {
  console.log(`⚠️  ADR already exists: ${file}`);
  console.log(`📝 Edit it and continue with: pnpm process:baseline`);
  process.exit(0);
}

const adrTemplate = `# Migration: ${slug}

**Date:** ${today}  
**Status:** Planning

---

## Goal

[What we're changing and why]

## Approach

**Codemods needed:**
- [ ] \`scripts/codemods/[name].mjs\`

**Sequence:**
1. Imports first (normalize paths)
2. Props/patterns second
3. Barrels third
4. Build fourth
5. Guard last

**Risk level:** [low|medium|high]

---

## Success Criteria

- [ ] Build passes
- [ ] Guard passes
- [ ] API report clean
- [ ] 0 manual fixes needed
- [ ] Time: <90 min

---

## Rollback Strategy

\`\`\`bash
git revert <commit-range>
# OR
git checkout migration-baseline-${today}
\`\`\`

---

## Checklist

- [ ] Baseline created
- [ ] Codemod tested (--dry-run)
- [ ] Applied in sequence
- [ ] Verification passed
- [ ] Documentation updated
- [ ] Changeset created
- [ ] Compat façade removal scheduled (if applicable)
`;

fs.writeFileSync(file, adrTemplate);

console.log(`✅ ADR created: ${file}`);
console.log(``);
console.log(`📋 Next steps:`);
console.log(`   1. Edit ADR: ${file}`);
console.log(`   2. pnpm process:baseline`);
console.log(`   3. Write codemod if needed: node scripts/codemods/template.mjs --help`);
console.log(``);
