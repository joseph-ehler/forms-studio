#!/usr/bin/env node
/**
 * ADR Generator
 * 
 * Creates Architecture Decision Record with proper front-matter and naming.
 * 
 * Usage: pnpm new:docs:adr <title>
 * Example: pnpm new:docs:adr contentref-auto-wiring
 * 
 * Creates: docs/adr/YYYY-MM-DD-contentref-auto-wiring.md
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '../..');

const title = process.argv[2];

if (!title) {
  console.error('Usage: pnpm new:docs:adr <title>');
  console.error('Example: pnpm new:docs:adr contentref-auto-wiring');
  process.exit(1);
}

// Validate title (kebab-case)
if (!/^[a-z0-9-]+$/.test(title)) {
  console.error('❌ Title must be kebab-case (lowercase, hyphens only)');
  console.error('   Example: contentref-auto-wiring');
  process.exit(1);
}

// Generate filename
const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const filename = `${today}-${title}.md`;
const filepath = path.join(ROOT, 'docs/adr', filename);

// Check if already exists
if (fs.existsSync(filepath)) {
  console.error(`❌ ADR already exists: ${filename}`);
  process.exit(1);
}

// Humanize title for display
const humanTitle = title
  .split('-')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');

// Template
const template = `---
status: "proposed"
date: ${today}
deciders: []
consulted: []
informed: []
---

# ${humanTitle}

## Context and Problem Statement

<!-- What is the issue we're facing? What constraints exist? -->

## Decision Drivers

- <!-- Driver 1 -->
- <!-- Driver 2 -->

## Considered Options

### Option 1: [Name]

**Pros:**
- <!-- Pro 1 -->

**Cons:**
- <!-- Con 1 -->

### Option 2: [Name]

**Pros:**
- <!-- Pro 1 -->

**Cons:**
- <!-- Con 1 -->

## Decision Outcome

**Chosen option:** Option [N] - [Name]

**Rationale:**
<!-- Why this option? What trade-offs are we accepting? -->

**Positive Consequences:**
- <!-- Benefit 1 -->

**Negative Consequences:**
- <!-- Trade-off 1 -->

## Implementation

<!-- How will this be built? What files/patterns change? -->

## Links

- [Related ADR](./YYYY-MM-DD-title.md)
- [Related Issue](#123)
`;

// Write file
fs.writeFileSync(filepath, template);

console.log('✅ ADR created:', filename);
console.log('');
console.log('Next steps:');
console.log('1. Open the file and fill in the template');
console.log('2. Update status: proposed → accepted → deprecated → superseded');
console.log('3. Add deciders, consulted, and informed stakeholders');
console.log('');
console.log(`File: docs/adr/${filename}`);
