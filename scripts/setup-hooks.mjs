#!/usr/bin/env node
/**
 * Cross-platform Git hooks installer
 * 
 * Installs pre-commit hook that validates:
 * - Documentation placement
 * - File/folder naming conventions
 * 
 * Safe to run multiple times (idempotent)
 * Works on Mac, Windows, Linux
 */

import { writeFile, mkdir, access, chmod } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { platform } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const isWindows = platform() === 'win32';

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function installHooks() {
  console.log('🔧 Setting up Git hooks...\n');
  
  const gitDir = join(ROOT, '.git');
  const hookDir = join(gitDir, 'hooks');
  const hookFile = join(hookDir, 'pre-commit');
  
  // Check if .git exists
  if (!(await fileExists(gitDir))) {
    console.log('⚠️  Not a Git repository (no .git directory)');
    console.log('   Skipping hook installation');
    return false;
  }
  
  // Ensure hooks directory exists
  await mkdir(hookDir, { recursive: true });
  
  // Pre-commit hook content (cross-platform)
  const hookContent = `#!/usr/bin/env node
/**
 * Pre-commit hook: Validate documentation placement and naming
 * 
 * This runs automatically before every commit.
 * To bypass (emergency only): git commit --no-verify
 */

import { execSync } from 'child_process';

console.log('🔍 Validating staged files...\\n');

try {
  // Get staged markdown files
  const mdFiles = execSync(
    'git diff --cached --name-only --diff-filter=ACMRD',
    { encoding: 'utf8' }
  )
    .trim()
    .split('\\n')
    .filter(f => f.endsWith('.md') && f.length > 0)
    .join(' ');
  
  // Get all staged files for naming check
  const allFiles = execSync(
    'git diff --cached --name-only --diff-filter=ACMRD',
    { encoding: 'utf8' }
  )
    .trim()
    .split('\\n')
    .filter(f => f.length > 0)
    .join(' ');
  
  let hasErrors = false;
  
  // Validate docs placement
  if (mdFiles) {
    console.log('📄 Checking documentation placement...\\n');
    try {
      execSync(\`node scripts/validate-docs.mjs --paths "\${mdFiles}"\`, {
        stdio: 'inherit',
      });
      console.log('');
    } catch {
      hasErrors = true;
    }
  }
  
  // Validate naming (only for TypeScript/JavaScript files)
  const codeFiles = allFiles
    .split(' ')
    .filter(f => /\\.(tsx?|jsx?|mjs)$/.test(f))
    .join(' ');
  
  if (codeFiles) {
    console.log('📝 Checking file naming conventions...\\n');
    try {
      execSync(\`node scripts/validate-naming.mjs --paths "\${codeFiles}"\`, {
        stdio: 'inherit',
      });
    } catch {
      hasErrors = true;
    }
  }
  
  if (hasErrors) {
    console.log('');
    console.log('❌ Commit blocked due to validation errors');
    console.log('');
    console.log('Fix the errors above, then try again.');
    console.log('Emergency bypass: git commit --no-verify (not recommended)');
    process.exit(1);
  }
  
  if (!mdFiles && !codeFiles) {
    console.log('✅ No files to validate\\n');
  }
  
  process.exit(0);
} catch (error) {
  console.error('❌ Hook failed:', error.message);
  process.exit(1);
}
`;
  
  // Write hook file
  await writeFile(hookFile, hookContent, { encoding: 'utf8' });
  
  // Make executable (Unix-like systems)
  if (!isWindows) {
    await chmod(hookFile, 0o755);
  }
  
  console.log('✅ Git hooks installed successfully!');
  console.log('');
  console.log('Pre-commit hook will now:');
  console.log('  • Validate docs placement (staged .md files)');
  console.log('  • Validate naming conventions (staged code files)');
  console.log('  • Run automatically before commits');
  console.log('  • Block commits with violations');
  console.log('');
  console.log('To bypass (emergency): git commit --no-verify');
  console.log('');
  
  return true;
}

// Run installer
installHooks().catch(err => {
  console.error('❌ Failed to install hooks:', err.message);
  process.exit(1);
});
