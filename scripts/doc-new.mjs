#!/usr/bin/env node
/**
 * Documentation Scaffolder
 * Creates docs in correct locations with proper front-matter
 * 
 * Usage:
 *   pnpm doc:new guide "Authentication Setup"
 *   pnpm doc:new adr "Adopt Flowbite"  
 *   pnpm doc:new session "2025-10-24 Migration"
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { parseArgs } from 'util';

const { positionals } = parseArgs({ allowPositionals: true });
const [type, title] = positionals;

if (!type || !title) {
  console.error('Usage: pnpm doc:new <type> "<title>"');
  console.error('');
  console.error('Types:');
  console.error('  guide        - User guide or tutorial');
  console.error('  adr          - Architecture Decision Record');
  console.error('  session      - Session summary');
  console.error('  architecture - System architecture doc');
  console.error('');
  console.error('Examples:');
  console.error('  pnpm doc:new guide "Getting Started"');
  console.error('  pnpm doc:new adr "Use Flowbite for UI"');
  console.error('  pnpm doc:new session "2025-10-24 Cleanup"');
  process.exit(1);
}

const date = new Date().toISOString().split('T')[0];
const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const templates = {
  guide: {
    dir: 'docs/guides',
    filename: `${slug}.md`,
    content: `# ${title}

**Created:** ${date}  
**Status:** Draft

---

## Overview

Brief description of what this guide covers.

## Prerequisites

- Requirement 1
- Requirement 2

## Steps

### 1. First Step

Description and code examples.

### 2. Second Step

Description and code examples.

## Troubleshooting

Common issues and solutions.

## Next Steps

- Related guide 1
- Related guide 2
`,
  },
  
  adr: {
    dir: 'docs/adr',
    filename: `${date}-${slug}.md`,
    content: `# ADR: ${title}

**Date:** ${date}  
**Status:** Proposed  
**Decision Makers:** [Team/Individual]

---

## Context

What is the issue that motivates this decision?

## Decision

What change are we proposing?

## Consequences

### Positive
- Benefit 1
- Benefit 2

### Negative (Accepted Trade-offs)
- Trade-off 1
- Trade-off 2

## Alternatives Considered

### Option A: [Name]
- **Pros:**
- **Cons:**
- **Why Rejected:**

## Implementation Plan

1. Step 1
2. Step 2
3. Step 3

## Success Metrics

- Metric 1
- Metric 2

## Rollback Plan

If this doesn't work:
1. Rollback step 1
2. Rollback step 2
`,
  },
  
  session: {
    dir: 'docs/sessions',
    filename: `SESSION_${date.replace(/-/g, '-')}-${slug}.md`,
    content: `# Session Summary: ${title}

**Date:** ${date}  
**Focus:** [Main topic]

---

## 🎯 **What Was Accomplished**

### **1. Feature/Fix Name**

**Files Changed:**
- \`file1.ts\`
- \`file2.ts\`

**Key Changes:**
- Change 1
- Change 2

---

## 📋 **Decisions Made**

1. **Decision:** [What was decided]
   - **Rationale:** [Why]
   - **Impact:** [Effect on codebase]

---

## 🔧 **Technical Details**

### **Implementation Notes**

Key technical points.

### **Patterns Used**

- Pattern 1
- Pattern 2

---

## 🚀 **Next Steps**

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

---

## 📊 **Metrics**

- Files changed: X
- Tests added: X
- Documentation updated: Yes/No
- Time spent: X hours
`,
  },
  
  architecture: {
    dir: 'docs/architecture',
    filename: `${slug}.md`,
    content: `# Architecture: ${title}

**Created:** ${date}  
**Status:** Draft

---

## Overview

High-level description of this architectural component.

## Components

### Component 1

**Responsibilities:**
- Responsibility 1
- Responsibility 2

**Dependencies:**
- Dependency 1
- Dependency 2

### Component 2

**Responsibilities:**
- Responsibility 1

## Data Flow

\`\`\`
User → Component A → Component B → Database
\`\`\`

## Key Decisions

1. **Decision:** [What]
   - **Rationale:** [Why]

## Constraints

- Constraint 1
- Constraint 2

## Future Considerations

- Consideration 1
- Consideration 2
`,
  },
};

const template = templates[type];
if (!template) {
  console.error(`❌ Unknown type: ${type}`);
  console.error('');
  console.error('Valid types: guide, adr, session, architecture');
  process.exit(1);
}

const dir = join(process.cwd(), template.dir);
const filePath = join(dir, template.filename);

try {
  await mkdir(dir, { recursive: true });
  await writeFile(filePath, template.content);
  
  console.log('');
  console.log(`✅ Created: ${template.dir}/${template.filename}`);
  console.log(`📝 Edit: ${filePath}`);
  console.log('');
} catch (err) {
  console.error(`❌ Error creating file: ${err.message}`);
  process.exit(1);
}
