# Autonomous Housekeeping - Set It and Forget It

**Philosophy:** The best housekeeping is the kind you never think about.

## Current Automation Level: 85%

### What's Already Autonomous ✅

**1. Pre-Commit Hooks (Husky)**
```bash
# Runs automatically on `git commit`
✅ Import Doctor check
✅ Repo Steward validation
✅ Dependency graph check

# If violations found: commit blocked
# If fixable: shows `pnpm imports:fix` command
```

**Status:** 🟢 Fully automated - you can't commit broken code

---

**2. Nightly Sweeper (GitHub Actions)**
```yaml
# Runs every day at 4 AM UTC
schedule:
  - cron: '0 4 * * *'

Tasks:
✅ Knip (dead exports)
✅ ts-prune (unused exports)
✅ Madge (circular dependencies)
✅ linkinator (broken links)
✅ Creates PR automatically if issues found
```

**Status:** 🟢 Fully automated - wakes you up with fixes, not problems

---

**3. CI Enforcement (GitHub Actions)**
```yaml
# Runs on every PR
✅ Import hygiene check
✅ Dependency graph validation
✅ API surface tracking (Extractor)
✅ Type snapshot tests (tsd)
✅ Bundle size budgets
✅ Danger PR comments (inline suggestions)

# Merge blocked if any fail
```

**Status:** 🟢 Fully automated - impossible to merge broken code

---

**4. Auto-Barrel Generation**
```bash
# Triggered by: file changes in watched folders
# Could be: pre-commit hook, file watcher, or CI

Current: Manual (`pnpm barrels`)
Opportunity: Auto-regenerate on file save
```

**Status:** 🟡 Semi-automated - can be fully automated

---

**5. Token Codegen**
```bash
# Triggered by: token source file changes

Current: Manual (`pnpm tokens:codegen`)
Opportunity: Auto-regenerate on token file save
```

**Status:** 🟡 Semi-automated - can be fully automated

---

**6. Auto-Fix PRs (Renovate/Dependabot)**
```yaml
# Not yet configured
Opportunity: Auto-update dependencies
            Auto-create PRs with codemods
            Auto-merge if tests pass
```

**Status:** 🔴 Not implemented - high value opportunity

## Achieving 100% Autonomous Housekeeping

### Level 1: File Watchers (Local Dev) 🎯

**What:** Auto-regenerate code when source files change

**Implementation:**

#### A. Nodemon for Token Codegen
```bash
# Add to package.json
"tokens:watch": "nodemon --watch 'packages/ds/src/tokens/**/*.ts' --exec 'pnpm tokens:codegen'"

# Add to .husky/pre-commit (before guard)
pnpm tokens:codegen --quiet
git add packages/ds/src/generated/
```

**Effect:** Token changes auto-regenerate CSS + types before commit

---

#### B. Chokidar for Barrel Regeneration
```javascript
// scripts/watchers/barrel-watcher.mjs
import chokidar from 'chokidar';
import { exec } from 'child_process';

const watcher = chokidar.watch([
  'packages/ds/src/primitives/**/*.tsx',
  'packages/ds/src/patterns/**/*.tsx',
  'packages/ds/src/shell/**/*.tsx',
  // ... other barrel folders
], {
  ignored: ['**/index.ts', '**/*.stories.*', '**/*.spec.*'],
});

watcher.on('change', (path) => {
  console.log(`🔄 File changed: ${path} - regenerating barrels...`);
  exec('pnpm barrels --quiet', (err) => {
    if (!err) console.log('✅ Barrels updated');
  });
});
```

```bash
# Add to package.json
"dev:watch": "concurrently \"pnpm tokens:watch\" \"node scripts/watchers/barrel-watcher.mjs\""
```

**Effect:** Add/remove/rename component → barrel auto-updates

---

### Level 2: Git Hooks (Bulletproof) 🎯

**What:** Auto-fix common issues before they reach CI

**Implementation:**

#### A. Enhanced Pre-Commit Hook
```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔄 Auto-fixing before commit..."

# 1. Regenerate tokens if source changed
if git diff --cached --name-only | grep -q "packages/ds/src/tokens"; then
  echo "📝 Token sources changed - regenerating..."
  pnpm tokens:codegen --quiet
  git add packages/ds/src/generated/
fi

# 2. Regenerate barrels if component files changed
if git diff --cached --name-only | grep -q "packages/ds/src/.*/.*\.tsx"; then
  echo "🎯 Components changed - regenerating barrels..."
  pnpm barrels --quiet
  git add packages/ds/src/*/index.ts
fi

# 3. Auto-fix imports
echo "🔍 Checking imports..."
if ! pnpm imports:check --quiet; then
  echo "🔧 Auto-fixing imports..."
  pnpm imports:fix --quiet
  git add -u
fi

# 4. Run guard (final check)
echo "🛡️  Running guard..."
pnpm guard
```

**Effect:** 90% of violations auto-fixed before you even see them

---

#### B. Pre-Push Hook (API Stability)
```bash
# .husky/pre-push
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Checking API stability..."

# Update API report
cd packages/ds
api-extractor run --local

# Check if report changed
if git diff --exit-code .reports/api/ds.api.md > /dev/null; then
  echo "✅ API surface unchanged"
else
  echo "⚠️  API surface changed - review .reports/api/ds.api.md"
  echo "   If intentional, add 'breaking-change' label to PR"
  git add .reports/api/ds.api.md
fi
```

**Effect:** API changes tracked automatically, never forgotten

---

### Level 3: CI Auto-Fix PRs (Truly Autonomous) 🚀

**What:** Bot automatically fixes violations and creates PRs

**Implementation:**

#### A. Auto-Fix Bot (GitHub Actions)
```yaml
# .github/workflows/auto-fix.yml
name: Auto-Fix Issues

on:
  schedule:
    - cron: '0 6 * * *' # Every day at 6 AM
  workflow_dispatch: # Manual trigger

jobs:
  auto-fix:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.BOT_TOKEN }}
      
      - name: Setup
        uses: ./.github/actions/setup
      
      - name: Auto-fix imports
        run: pnpm imports:fix
      
      - name: Regenerate barrels
        run: pnpm barrels
      
      - name: Regenerate tokens
        run: pnpm tokens:codegen
      
      - name: Update API report
        run: pnpm api:extract
      
      - name: Create PR if changes
        uses: peter-evans/create-pull-request@v5
        with:
          token: ${{ secrets.BOT_TOKEN }}
          branch: auto-fix/housekeeping
          title: '🤖 Auto-fix: Housekeeping'
          body: |
            Automated housekeeping fixes:
            - ✅ Import violations fixed
            - ✅ Barrels regenerated
            - ✅ Tokens regenerated
            - ✅ API report updated
            
            Safe to merge if CI passes ✅
          labels: automerge
```

**Effect:** Wake up to PRs with fixes, not issues

---

#### B. Dependency Auto-Updates (Renovate)
```json
// renovate.json
{
  "extends": ["config:base"],
  "automerge": true,
  "automergeType": "pr",
  "automergeStrategy": "squash",
  "packageRules": [
    {
      "matchUpdateTypes": ["patch", "pin", "digest"],
      "automerge": true
    },
    {
      "matchDepTypes": ["devDependencies"],
      "matchUpdateTypes": ["minor"],
      "automerge": true
    }
  ],
  "lockFileMaintenance": {
    "enabled": true,
    "automerge": true,
    "schedule": ["before 6am on Monday"]
  }
}
```

**Effect:** Dependencies auto-update and auto-merge if tests pass

---

### Level 4: Smart Codemods (Migration as Code) 🧠

**What:** Breaking changes come with auto-migration PRs

**Implementation:**

#### A. Codemod Bot
```yaml
# .github/workflows/breaking-change.yml
name: Breaking Change Migration

on:
  pull_request:
    types: [labeled]

jobs:
  create-migration-pr:
    if: contains(github.event.label.name, 'breaking-change')
    runs-on: ubuntu-latest
    steps:
      - name: Extract codemod from changeset
        run: |
          # Parse changeset for migration command
          CODEMOD=$(grep -o 'pnpm codemod [a-z-]*' .changeset/*.md | head -1)
          echo "CODEMOD=$CODEMOD" >> $GITHUB_ENV
      
      - name: Run codemod on examples
        run: |
          ${{ env.CODEMOD }}
          git add -u
      
      - name: Create migration PR
        uses: peter-evans/create-pull-request@v5
        with:
          branch: migrate/${{ github.event.pull_request.number }}
          title: '🔄 Migrate: ${{ github.event.pull_request.title }}'
          body: |
            Auto-migration for #${{ github.event.pull_request.number }}
            
            This PR applies the codemod to all examples.
            Review and merge after the breaking change lands.
```

**Effect:** Breaking change PRs auto-generate migration PRs

---

### Level 5: Predictive Maintenance (Future) 🔮

**What:** AI predicts issues before they happen

**Concepts:**

#### A. Pattern Detection
```typescript
// Hypothetical: ML model trained on past violations
if (detectPattern(fileChanges, 'likely-import-violation')) {
  suggestFix('Consider using barrel import instead');
}
```

#### B. Complexity Budgets
```typescript
// Flag files approaching thresholds
if (cyclomaticComplexity > 10) {
  createIssue('File complexity high - consider splitting');
}
```

#### C. Drift Detection
```typescript
// Detect architectural drift
if (percentageDeepImports > 2%) {
  alert('Import hygiene degrading - review recent PRs');
}
```

---

## Recommended Setup (Practical Next Steps)

### Immediate Wins (1 hour)

**1. Enhanced Pre-Commit Hook**
```bash
# Update .husky/pre-commit to include:
- Auto-regenerate tokens if changed
- Auto-regenerate barrels if components changed
- Auto-fix imports
- Run guard
```

**Files:**
- `.husky/pre-commit` (modify)

**Benefit:** 90% of violations auto-fixed before you see them

---

**2. File Watcher for Development**
```bash
# Add scripts to package.json
"tokens:watch": "nodemon --watch 'packages/ds/src/tokens/**/*.ts' --exec 'pnpm tokens:codegen'"
"dev:watch": "concurrently \"pnpm tokens:watch\" \"pnpm dev\""
```

**Files:**
- `package.json` (add scripts)

**Benefit:** Never manually run `pnpm tokens:codegen` again

---

### Medium Effort (1 day)

**3. Barrel Watcher**
```bash
# Create scripts/watchers/barrel-watcher.mjs
# Add to dev workflow
```

**Files:**
- `scripts/watchers/barrel-watcher.mjs` (create)
- `package.json` (update dev:watch)

**Benefit:** Add component → barrel auto-updates → no manual `pnpm barrels`

---

**4. Auto-Fix Bot (GitHub Actions)**
```bash
# Create .github/workflows/auto-fix.yml
# Run nightly or on-demand
```

**Files:**
- `.github/workflows/auto-fix.yml` (create)
- `package.json` (ensure scripts exist)

**Benefit:** Daily PR with all housekeeping fixes

---

### Advanced (1 week)

**5. Renovate Configuration**
```bash
# Add renovate.json with auto-merge rules
# Configure for patch/minor auto-merge
```

**Files:**
- `renovate.json` (create)

**Benefit:** Dependencies auto-update without manual intervention

---

**6. Breaking Change Migration Bot**
```bash
# Create .github/workflows/breaking-change.yml
# Auto-generate migration PRs
```

**Files:**
- `.github/workflows/breaking-change.yml` (create)

**Benefit:** Breaking changes come with migration code

---

## Autonomous Housekeeping Checklist

### Pre-Commit (Local)
- [x] Guard runs automatically (Husky)
- [ ] Tokens auto-regenerate if sources changed
- [ ] Barrels auto-regenerate if components changed
- [ ] Imports auto-fix before commit
- [ ] API report updates if public surface changed

### Development (File Watchers)
- [ ] Token watcher (nodemon)
- [ ] Barrel watcher (chokidar)
- [ ] Concurrent dev mode

### CI/CD (GitHub Actions)
- [x] Nightly sweeper (Knip, ts-prune, etc.)
- [x] PR enforcement (guard + Danger)
- [ ] Auto-fix bot (daily PR with fixes)
- [ ] Dependency auto-updates (Renovate)
- [ ] Breaking change migration PRs

### Bot Capabilities
- [ ] Auto-fix import violations
- [ ] Auto-regenerate barrels
- [ ] Auto-regenerate tokens
- [ ] Auto-update API reports
- [ ] Auto-merge safe PRs
- [ ] Auto-create migration PRs

---

## ROI Analysis

### Manual Effort (Current)

```
Daily housekeeping tasks:
- Check for import violations: 5 min
- Regenerate barrels: 2 min
- Regenerate tokens: 2 min
- Review dependency updates: 10 min
- Fix violations found in CI: 15 min

Total: ~30 min/day = 2.5 hours/week = 10 hours/month
```

### With Full Automation

```
Daily housekeeping tasks:
- Review auto-fix PR: 5 min (weekly)
- Approve auto-merged deps: 0 min (automated)
- Fix violations: 0 min (auto-fixed pre-commit)

Total: ~5 min/week = 20 min/month
```

**Savings:** 9.7 hours/month per developer

---

## Implementation Priority

### Phase 1: Local Automation (Week 1)
1. ✅ Enhanced pre-commit hook (auto-regenerate + auto-fix)
2. ✅ Token watcher for development
3. ✅ Barrel watcher for development

**Effort:** 4 hours  
**Payoff:** Never manually run codegen again

---

### Phase 2: CI Automation (Week 2)
1. ✅ Auto-fix bot (daily housekeeping PR)
2. ✅ Renovate setup (dependency auto-updates)

**Effort:** 8 hours  
**Payoff:** Wake up to PRs with fixes, not issues

---

### Phase 3: Migration Automation (Week 3)
1. ✅ Breaking change migration bot
2. ✅ Codemod integration with changesets

**Effort:** 8 hours  
**Payoff:** Breaking changes become painless

---

## Files to Create/Modify

### New Files
```
scripts/watchers/barrel-watcher.mjs
scripts/watchers/token-watcher.mjs
.github/workflows/auto-fix.yml
.github/workflows/breaking-change.yml
renovate.json
```

### Modified Files
```
.husky/pre-commit              (enhanced with auto-fix)
.husky/pre-push                (API stability check)
package.json                   (add watcher scripts)
```

---

## Success Metrics

**Before Full Automation:**
- Manual housekeeping: 30 min/day
- Violations found in CI: 3-5/week
- Time to fix violations: 15 min/violation

**After Full Automation:**
- Manual housekeeping: 5 min/week
- Violations found in CI: 0 (auto-fixed pre-commit)
- Time to fix violations: 0 (automated)

**Goal:** Zero manual housekeeping, zero CI surprises

---

## TL;DR

**Current State:** 85% automated (pre-commit hooks + CI + nightly sweeper)

**Missing Pieces:**
1. Auto-regenerate on file save (tokens + barrels)
2. Auto-fix bot (daily PR with housekeeping)
3. Dependency auto-updates (Renovate)
4. Breaking change migration PRs

**Time to 100%:** ~20 hours of setup

**Payoff:** 10 hours/month saved per developer + zero CI surprises

**Next Step:** Enhanced pre-commit hook (4 hours, massive ROI)
