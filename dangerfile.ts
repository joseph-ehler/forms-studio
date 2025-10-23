import { danger, warn, message, markdown } from 'danger';
import { execSync } from 'child_process';
import fs from 'fs';

/**
 * Danger.js - PR Automation
 * 
 * Provides inline comments on PRs for:
 * - Import violations
 * - Missing documentation
 * - Large PRs
 * - Bundle size changes
 */

// Large PR warning
const bigPRThreshold = 500;
if (danger.github.pr.additions + danger.github.pr.deletions > bigPRThreshold) {
  warn(`:exclamation: This PR is quite large (${danger.github.pr.additions + danger.github.pr.deletions} lines). Consider breaking it into smaller PRs for easier review.`);
}

// Check for package.json changes without lockfile update
const packageChanged = danger.git.modified_files.includes('package.json');
const lockfileChanged = danger.git.modified_files.includes('pnpm-lock.yaml');

if (packageChanged && !lockfileChanged) {
  warn('`package.json` was modified, but `pnpm-lock.yaml` was not updated. Run `pnpm install` to sync.');
}

// Run Import Doctor in check mode
try {
  execSync('node scripts/import-doctor.mjs', { stdio: 'pipe' });
  message('✅ Import hygiene: All imports are canonical');
} catch (e) {
  const output = e.stdout?.toString() || e.stderr?.toString() || '';
  if (output.includes('⛔')) {
    const violations = output.match(/packages\/.*?:\d+/g) || [];
    
    warn(`Import Doctor found ${violations.length} non-canonical import(s):`);
    markdown(`
### 📦 Import Violations

Run \`pnpm imports:fix\` to auto-fix these imports to use barrel exports.

<details>
<summary>Details</summary>

\`\`\`
${output.substring(0, 1000)}
\`\`\`

</details>
    `);
  }
}

// Check for documentation updates
const dsFilesChanged = danger.git.modified_files.filter(f => 
  f.startsWith('packages/ds/src/') && (f.endsWith('.tsx') || f.endsWith('.ts'))
);

const docsChanged = danger.git.modified_files.some(f => 
  f.startsWith('docs/') || f.includes('/docs/')
);

if (dsFilesChanged.length > 3 && !docsChanged) {
  message('💡 Consider updating documentation in `docs/` or `packages/ds/docs/` for these changes.');
}

// Check for test coverage on new components
const newComponents = danger.git.created_files.filter(f =>
  f.includes('/primitives/') && f.endsWith('.tsx')
);

const newTests = danger.git.created_files.filter(f =>
  f.includes('__tests__') || f.endsWith('.spec.ts') || f.endsWith('.test.ts')
);

if (newComponents.length > 0 && newTests.length === 0) {
  warn(`${newComponents.length} new component(s) added without tests. Consider adding smoke tests.`);
}

// Check for Storybook stories
const newStories = danger.git.created_files.filter(f => f.endsWith('.stories.tsx'));

if (newComponents.length > 0 && newStories.length === 0) {
  message(`💡 New components detected. Add Storybook stories for live documentation:\n\`\`\`bash\npnpm new:ds:primitive <ComponentName>\n\`\`\``);
}

// Congratulate on good practices
if (newComponents.length > 0 && newStories.length > 0) {
  message('🎉 Great job adding Storybook stories for new components!');
}

if (docsChanged) {
  message('📚 Thanks for updating documentation!');
}
