# Danger Integration - Inline Code Review

**Status:** Ready for implementation  
**Location:** `dangerfile.mjs`

---

## Purpose

Danger surfaces **ESLint violations** and **Import Doctor findings** as inline PR comments with **GitHub suggestions** for one-click fixes.

---

## Current State

Danger is already running in CI (`.github/workflows/api-stability.yml`), but currently only posts summary comments.

---

## Enhancement: Inline Violations

### Goal

Make violations **actionable** with:
- 📍 Inline comments at exact line numbers
- 🔧 GitHub suggestions for auto-fixes
- 📊 Summary table in PR comment

---

## Implementation

### 1. Run ESLint with JSON Output

```javascript
// dangerfile.mjs

import { danger, warn, fail, markdown } from 'danger';
import { execSync } from 'child_process';
import fs from 'fs';

// Run ESLint with JSON reporter
function runESLint(package) {
  try {
    execSync(
      `pnpm -F ${package} lint --format json --output-file .reports/${package}-eslint.json`,
      { stdio: 'pipe' }
    );
    return [];
  } catch {
    // ESLint returns exit code 1 when violations found
    const results = JSON.parse(fs.readFileSync(`.reports/${package}-eslint.json`, 'utf8'));
    return results;
  }
}

// Run Import Doctor with JSON output
function runImportDoctor() {
  try {
    execSync('node scripts/import-doctor.mjs --json > .reports/import-doctor.json', {
      stdio: 'pipe'
    });
    return [];
  } catch {
    return JSON.parse(fs.readFileSync('.reports/import-doctor.json', 'utf8'));
  }
}

// Main Danger checks
async function main() {
  const dsLint = runESLint('@intstudio/ds');
  const formsLint = runESLint('@intstudio/forms');
  const importIssues = runImportDoctor();
  
  // Post inline comments
  postESLintComments(dsLint);
  postESLintComments(formsLint);
  postImportDoctorComments(importIssues);
  
  // Post summary
  postSummary({ dsLint, formsLint, importIssues });
}

main();
```

### 2. Post Inline Comments with Suggestions

```javascript
function postESLintComments(results) {
  for (const file of results) {
    for (const message of file.messages) {
      const suggestion = generateSuggestion(message, file.filePath);
      
      if (suggestion) {
        // GitHub suggestion format
        danger.git.createInlineComment({
          path: file.filePath,
          line: message.line,
          message: `**${message.ruleId}**: ${message.message}\n\n` +
                   '```suggestion\n' +
                   suggestion +
                   '\n```'
        });
      } else {
        // Plain comment (no auto-fix)
        warn(`**${message.ruleId}** in ${file.filePath}:${message.line}\n${message.message}`);
      }
    }
  }
}

function generateSuggestion(message, filePath) {
  // If ESLint provides a fix
  if (message.fix) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n');
    const line = lines[message.line - 1];
    
    // Apply fix
    const fixed = line.substring(0, message.fix.range[0]) +
                  message.fix.text +
                  line.substring(message.fix.range[1]);
    
    return fixed;
  }
  
  // Manual suggestions for common patterns
  if (message.ruleId === 'cascade/no-self-package-imports') {
    // Suggest relative import
    return line.replace(/@intstudio\/(ds|forms)\/(.+)/, '../$2');
  }
  
  if (message.ruleId === 'no-restricted-imports') {
    // Suggest new import path
    return line.replace('@intstudio/ds/fields', '@intstudio/forms/fields');
  }
  
  return null;
}
```

### 3. Post Import Doctor Comments

```javascript
function postImportDoctorComments(issues) {
  for (const issue of issues) {
    if (issue.fixed) {
      // Auto-fixable
      danger.git.createInlineComment({
        path: issue.file,
        line: issue.line,
        message: `**Import issue**: ${issue.msg}\n\n` +
                 '```suggestion\n' +
                 `import { ... } from '${issue.fixed}';\n` +
                 '```\n\n' +
                 `Auto-fix: \`pnpm imports:fix\``
      });
    } else {
      // Manual fix required
      warn(`Import issue in ${issue.file}:${issue.line}\n${issue.msg}`);
    }
  }
}
```

### 4. Summary Table

```javascript
function postSummary({ dsLint, formsLint, importIssues }) {
  const dsErrors = dsLint.reduce((sum, file) => sum + file.errorCount, 0);
  const formsErrors = formsLint.reduce((sum, file) => sum + file.errorCount, 0);
  const importErrors = importIssues.length;
  
  const total = dsErrors + formsErrors + importErrors;
  
  if (total === 0) {
    markdown('## ✅ Code Quality\n\nAll checks passed!');
    return;
  }
  
  markdown(`
## ⚠️ Code Quality Issues

| Check | Count |
|-------|-------|
| DS ESLint | ${dsErrors} |
| Forms ESLint | ${formsErrors} |
| Import Doctor | ${importErrors} |
| **Total** | **${total}** |

### Next Steps

1. Review inline comments below
2. Apply GitHub suggestions (one-click fixes)
3. For manual fixes, run:
   - ESLint: \`pnpm -F @intstudio/ds lint --fix\`
   - Imports: \`pnpm imports:fix\`
4. Commit fixes and push

### Auto-Fix Command

\`\`\`bash
pnpm imports:fix && \\
pnpm -F @intstudio/ds lint --fix && \\
pnpm -F @intstudio/forms lint --fix
\`\`\`
  `);
  
  fail('Code quality issues found. See inline comments for fixes.');
}
```

---

## Modifications Needed

### 1. Import Doctor JSON Output

Update `scripts/import-doctor.mjs` to support `--json` flag:

```javascript
const JSON_OUTPUT = process.argv.includes('--json');

// At end of script
if (JSON_OUTPUT) {
  console.log(JSON.stringify(problems, null, 2));
} else {
  // Existing human-readable output
}
```

### 2. ESLint Configs

Ensure both DS and Forms have lint scripts:

```json
// package.json (both packages)
{
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx"
  }
}
```

### 3. CI Workflow

Update `.github/workflows/api-stability.yml` to run Danger with reports:

```yaml
- name: Run linters
  run: |
    mkdir -p .reports
    pnpm -F @intstudio/ds lint --format json --output-file .reports/ds-eslint.json || true
    pnpm -F @intstudio/forms lint --format json --output-file .reports/forms-eslint.json || true
    node scripts/import-doctor.mjs --json > .reports/import-doctor.json || true

- name: Danger
  run: pnpm dlx danger ci
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Benefits

### Before (Manual Review)
1. PR author runs lint locally
2. Reviewer finds issues
3. Author makes fixes
4. Push again
5. Reviewer re-reviews
⏱️ **2-3 review cycles**

### After (Danger Inline)
1. PR opened
2. Danger posts inline suggestions
3. Author applies suggestions (one-click)
4. Done
⏱️ **1 review cycle**

---

## Example PR Comment

```
## ⚠️ Code Quality Issues

| Check | Count |
|-------|-------|
| DS ESLint | 2 |
| Forms ESLint | 1 |
| Import Doctor | 3 |
| **Total** | **6** |

### Next Steps

1. Review inline comments below
2. Apply GitHub suggestions (one-click fixes)
3. For manual fixes, run:
   - ESLint: `pnpm -F @intstudio/ds lint --fix`
   - Imports: `pnpm imports:fix`
4. Commit fixes and push

### Auto-Fix Command

```bash
pnpm imports:fix && \
pnpm -F @intstudio/ds lint --fix && \
pnpm -F @intstudio/forms lint --fix
```
```

### Inline Comment Example

> **cascade/no-self-package-imports** in `packages/forms/src/fields/TextField.tsx:5`
> 
> Packages cannot import from their own published name.
> 
> ```suggestion
> import { SomeUtil } from '../utils';
> ```

---

## Testing

### Local Testing

```bash
# Install Danger
pnpm add -D danger

# Run locally (requires GITHUB_TOKEN)
DANGER_GITHUB_API_TOKEN=<token> pnpm dlx danger pr <PR_URL>
```

### CI Testing

1. Open test PR
2. Check Danger bot comments
3. Verify inline suggestions work
4. Apply one-click fixes
5. Confirm fixes work

---

## Maintenance

### Adding New Rules

When adding ESLint rules:
1. Add auto-fix logic if possible
2. Add suggestion generator in `dangerfile.mjs`
3. Test on PR with violation

### Tuning Noise

If too many comments:
- Filter by severity (errors only)
- Batch similar issues
- Link to batch fix command

---

## Future Enhancements

### Phase 2
- [ ] Visual regression screenshots
- [ ] Performance budget violations
- [ ] Bundle size increases
- [ ] Accessibility audit results

### Phase 3
- [ ] Auto-commit fixes (with approval)
- [ ] Suggest refactoring patterns
- [ ] Link to relevant docs/ADRs

---

**Status:** Ready to implement (15 min)  
**ROI:** 50% fewer review cycles  
**Effort:** Low (builds on existing Danger setup)
