#!/usr/bin/env node
/**
 * Compat Ticket Generator
 * 
 * Creates a GitHub issue for removing compat façade.
 * Ensures compat shims don't linger past 1-2 releases.
 * 
 * Usage: pnpm process:compat-ticket <FieldName>
 * 
 * Example:
 *   pnpm process:compat-ticket TextField
 * 
 * Requires: gh CLI installed and authenticated
 */

import { execSync } from 'node:child_process';

const field = process.argv[2];

if (!field) {
  console.error('❌ Usage: pnpm process:compat-ticket <FieldName>');
  console.error('');
  console.error('Example:');
  console.error('  pnpm process:compat-ticket TextField');
  console.error('');
  console.error('This creates a GitHub issue to track compat façade removal.');
  process.exit(1);
}

// Check if gh CLI is available
try {
  execSync('gh --version', { stdio: 'pipe' });
} catch {
  console.error('❌ GitHub CLI (gh) not found.');
  console.error('');
  console.error('Install it:');
  console.error('  brew install gh');
  console.error('  gh auth login');
  console.error('');
  console.error('Or create issue manually:');
  console.error(`  Title: Remove DS façade for ${field}`);
  console.error(`  Label: deprecation, technical-debt`);
  process.exit(1);
}

const title = `Remove DS façade for ${field}`;

// Calculate removal date (2 releases ~2 months)
const now = new Date();
const removalDate = new Date(now.setMonth(now.getMonth() + 2));
const removalStr = removalDate.toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'short' 
});

const body = `## Context

Compat re-export added for **${field}** during migration from \`@intstudio/ds/fields\` to \`@intstudio/forms/fields\`.

This façade exists at:
\`\`\`
packages/ds/src/fields/${field}/index.ts
\`\`\`

## Removal Window

**Target:** Within 2 releases (~${removalStr})

Per Migration Playbook: Compat shims DIE after 1-2 releases max.

## Checklist

- [ ] Verify codemod shipped in same release
- [ ] Monitor usage in apps (grep/telemetry)
- [ ] After 1-2 releases: Delete façade file
- [ ] Confirm ESLint rule forbids old path
- [ ] Update changelog with removal note
- [ ] Add migration note to docs

## Migration Command

For any remaining consumers:

\`\`\`bash
pnpm codemod:fields --field ${field}
\`\`\`

## ESLint Protection

Already configured in:
- \`.eslintrc.js\` (repo root): blocks \`@intstudio/ds/fields\`
- \`packages/forms/.eslintrc.js\`: blocks \`@intstudio/ds/fields\`
- \`packages/ds/.eslintrc.js\`: blocks in DS (except compat)

## Related

- **ADR:** See \`docs/adr/\` for batch migration decision
- **Playbook:** \`docs/handbook/OPERATING_PRINCIPLES.md\`
- **Rules:** \`docs/handbook/ESLINT_RULES.md\`
`;

console.log('🎫 Creating compat removal ticket...');
console.log('');

try {
  execSync(
    `gh issue create --title "${title}" --body "${body}" --label "deprecation,technical-debt"`,
    { stdio: 'inherit' }
  );
  
  console.log('');
  console.log('✅ Ticket created!');
  console.log('');
  console.log(`📋 Next steps:`);
  console.log(`   1. Add removal date to DS façade JSDoc`);
  console.log(`   2. Monitor this issue for removal timeline`);
  console.log(`   3. After 1-2 releases: close issue and delete façade`);
  console.log('');
} catch (error) {
  console.error('');
  console.error('❌ Failed to create issue.');
  console.error('');
  console.error('Manual steps:');
  console.error('  1. Go to: https://github.com/<owner>/<repo>/issues/new');
  console.error(`  2. Title: ${title}`);
  console.error(`  3. Labels: deprecation, technical-debt`);
  console.error('  4. Copy body from above');
  console.error('');
  process.exit(1);
}
