/**
 * Dangerfile - Automated PR Feedback
 * 
 * Integrates with Import Doctor, API Extractor, and other repo tools
 * to provide inline, actionable feedback on pull requests.
 */

import { danger, warn, fail, message, markdown } from 'danger';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();

/**
 * Check for ESLint violations
 */
async function checkESLint() {
  const packages = ['@intstudio/ds', '@intstudio/forms'];
  let totalErrors = 0;
  let totalWarnings = 0;
  
  for (const pkg of packages) {
    try {
      const reportFile = `.reports/${pkg.split('/')[1]}-eslint.json`;
      execSync(
        `pnpm -F ${pkg} lint --format json --output-file ${reportFile}`,
        { cwd: ROOT, stdio: 'pipe' }
      );
    } catch {
      // Expected to fail if violations exist
    }
  }
  
  // Parse results
  for (const pkg of packages) {
    const reportFile = path.join(ROOT, `.reports/${pkg.split('/')[1]}-eslint.json`);
    
    if (!fs.existsSync(reportFile)) continue;
    
    try {
      const results = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
      
      for (const result of results) {
        if (!result.messages || result.messages.length === 0) continue;
        
        const filePath = result.filePath.replace(ROOT + '/', '');
        
        for (const msg of result.messages) {
          const severity = msg.severity === 2 ? 'error' : 'warning';
          
          if (severity === 'error') totalErrors++;
          else totalWarnings++;
          
          const icon = severity === 'error' ? '❌' : '⚠️';
          
          const suggestion = msg.fix ? 
            `\n\n**Auto-fixable:** Run \`pnpm -F ${pkg} lint --fix\`` : '';
          
          warn(
            `${icon} **${msg.ruleId}**: ${msg.message}${suggestion}`,
            filePath,
            msg.line
          );
        }
      }
    } catch {
      // Ignore parse errors
    }
  }
  
  if (totalErrors > 0 || totalWarnings > 0) {
    markdown(`\n## 🔍 ESLint Summary\n`);
    markdown(`| Package | Errors | Warnings |\n`);
    markdown(`|---------|--------|----------|\n`);
    markdown(`| DS | ${totalErrors} | ${totalWarnings} |\n`);
    markdown(`\n**Fix:** Run \`pnpm -F @intstudio/ds lint --fix && pnpm -F @intstudio/forms lint --fix\`\n`);
  }
}

/**
 * Check for Import Doctor violations
 */
async function checkImports() {
  try {
    // Run Import Doctor in check mode with JSON output
    execSync('node scripts/import-doctor.mjs --json > .reports/import-doctor.json', {
      cwd: ROOT,
      stdio: 'pipe',
    });
  } catch (error) {
    // Expected to fail if violations exist
  }

  const reportPath = path.join(ROOT, '.reports/import-doctor.json');
  
  if (!fs.existsSync(reportPath)) {
    return;
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  
  if (report.violations && report.violations.length > 0) {
    markdown('## 🚨 Import Hygiene Violations\n');
    
    const violationsByFile = {};
    for (const violation of report.violations) {
      if (!violationsByFile[violation.file]) {
        violationsByFile[violation.file] = [];
      }
      violationsByFile[violation.file].push(violation);
    }
    
    for (const [file, violations] of Object.entries(violationsByFile)) {
      markdown(`\n### \`${file}\`\n`);
      
      for (const v of violations) {
        const line = v.line || 1;
        
        // Build suggestion block if we have a fix
        let suggestion = '';
        if (v.fixed) {
          suggestion = `
\`\`\`suggestion
import { ... } from '${v.fixed}'
\`\`\`
`;
        }
        
        warn(
          `**${v.reason}**\n\`\`\`diff\n- import { ... } from '${v.spec}'\n+ import { ... } from '${v.fixed || '(see repo.imports.yaml)'}'\n\`\`\`${suggestion}`,
          file,
          line
        );
      }
    }
    
    markdown('\n**Fix:** Run `pnpm imports:fix` to auto-correct all violations with one command.\n');
  }
}

/**
 * Check API surface changes
 */
async function checkAPIChanges() {
  const apiReportPath = '.reports/api/ds.api.md';
  const gitDiff = danger.git;
  
  // Check if API report changed
  const apiChanged = gitDiff.modified_files.includes(apiReportPath) || 
                     gitDiff.created_files.includes(apiReportPath);
  
  if (apiChanged) {
    const hasBreakingLabel = danger.github.issue.labels.some(l => l.name === 'breaking-change');
    
    if (!hasBreakingLabel) {
      warn('⚠️ API surface changed but PR is missing `breaking-change` label. Please review the API diff.');
    }
    
    markdown('## 📋 API Surface Changed\n');
    markdown('Review the API Extractor report to ensure changes are intentional.\n');
    markdown(`[View API Report](.reports/api/ds.api.md)\n`);
  }
}

/**
 * Check token changes
 */
async function checkTokenChanges() {
  const gitDiff = danger.git;
  
  const tokenFilesChanged = gitDiff.modified_files.filter(f => 
    f.includes('packages/ds/src/tokens/')
  );
  
  if (tokenFilesChanged.length > 0) {
    const hasTokenLabel = danger.github.issue.labels.some(l => l.name === 'tokens-change');
    
    if (!hasTokenLabel) {
      fail('🎨 Token files changed but PR is missing `tokens-change` label.');
    }
    
    markdown('## 🎨 Token Changes Detected\n');
    markdown(`Changed files:\n`);
    for (const file of tokenFilesChanged) {
      markdown(`- \`${file}\`\n`);
    }
    markdown('\n**Required:** Run `pnpm tokens:codegen` to regenerate CSS/types.\n');
  }
}

/**
 * Check bundle size
 */
async function checkBundleSize() {
  const sizePath = '.reports/bundle-size.json';
  
  if (!fs.existsSync(sizePath)) {
    return;
  }
  
  const sizes = JSON.parse(fs.readFileSync(sizePath, 'utf8'));
  
  const CSS_BUDGET = 25 * 1024; // 25KB
  const JS_BUDGET = 50 * 1024;  // 50KB
  
  if (sizes.css && sizes.css.gzipped > CSS_BUDGET) {
    fail(`📦 CSS bundle exceeds budget: ${(sizes.css.gzipped / 1024).toFixed(2)}KB / ${CSS_BUDGET / 1024}KB`);
  }
  
  if (sizes.js && sizes.js.gzipped > JS_BUDGET) {
    fail(`📦 JS bundle exceeds budget: ${(sizes.js.gzipped / 1024).toFixed(2)}KB / ${JS_BUDGET / 1024}KB`);
  }
  
  if (sizes.css || sizes.js) {
    markdown('## 📦 Bundle Sizes\n');
    markdown('| Asset | Size | Budget | Status |\n');
    markdown('|-------|------|--------|--------|\n');
    
    if (sizes.css) {
      const cssOk = sizes.css.gzipped <= CSS_BUDGET;
      markdown(`| CSS (gzipped) | ${(sizes.css.gzipped / 1024).toFixed(2)}KB | ${CSS_BUDGET / 1024}KB | ${cssOk ? '✅' : '❌'} |\n`);
    }
    
    if (sizes.js) {
      const jsOk = sizes.js.gzipped <= JS_BUDGET;
      markdown(`| JS (gzipped) | ${(sizes.js.gzipped / 1024).toFixed(2)}KB | ${JS_BUDGET / 1024}KB | ${jsOk ? '✅' : '❌'} |\n`);
    }
  }
}

/**
 * Check for large PR
 */
function checkPRSize() {
  const gitDiff = danger.git;
  const additions = gitDiff.additions || 0;
  const deletions = gitDiff.deletions || 0;
  const total = additions + deletions;
  
  if (total > 800) {
    warn(`📏 Large PR: ${total} lines changed. Consider breaking into smaller PRs for easier review.`);
  }
}

/**
 * Check for missing tests
 */
function checkTests() {
  const gitDiff = danger.git;
  
  const hasSourceChanges = gitDiff.modified_files.some(f => 
    f.includes('/src/') && (f.endsWith('.ts') || f.endsWith('.tsx'))
  );
  
  const hasTestChanges = gitDiff.modified_files.some(f => 
    f.includes('.spec.') || f.includes('.test.') || f.includes('/tests/')
  );
  
  if (hasSourceChanges && !hasTestChanges) {
    warn('🧪 Source code changed but no test files updated. Consider adding tests.');
  }
}

/**
 * Check for missing changeset
 */
function checkChangeset() {
  const gitDiff = danger.git;
  
  const hasChangeset = gitDiff.created_files.some(f => f.includes('.changeset/'));
  
  const hasPackageChanges = gitDiff.modified_files.some(f => 
    f.startsWith('packages/') && !f.includes('node_modules')
  );
  
  if (hasPackageChanges && !hasChangeset) {
    const labels = danger.github.issue.labels.map(l => l.name);
    const skipChangeset = labels.includes('skip-changeset') || labels.includes('chore');
    
    if (!skipChangeset) {
      warn('📝 Package changes detected but no changeset found. Run `pnpm changeset` to create one.');
    }
  }
}

/**
 * Main
 */
async function main() {
  console.log('🤖 Running Danger checks...\n');
  
  // Ensure reports directory
  execSync('mkdir -p .reports', { cwd: ROOT });
  
  // Core checks
  await checkESLint();
  await checkImports();
  await checkAPIChanges();
  await checkTokenChanges();
  await checkBundleSize();
  
  // Quality checks
  checkPRSize();
  checkTests();
  checkChangeset();
  
  // Success message
  if (!danger.results.fails.length && !danger.results.warnings.length) {
    message('✅ All automated checks passed!');
  }
}

main().catch(error => {
  fail(`Danger run failed: ${error.message}`);
});
