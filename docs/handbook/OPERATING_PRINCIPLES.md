# Operating Principles - Forms Studio

**Last Updated:** Oct 23, 2025  
**Status:** Battle-Tested & Locked

---

## 🎯 **Core Philosophy**

> "Build like a platform engineer - solve the problem once, in the system, and memorialize the fix in tooling."

**Three Non-Negotiables:**
1. **Systems over one-offs** - Fix it once, forever
2. **Contract-first, code second** - Declare truth, derive implementation
3. **Make mistakes impossible** - Guardrails > documentation

---

## 📋 **The Repeatable Migration Playbook**

### Lock This Sequence (Never Deviate)

**Every large change follows this exact order:**

```
1. Preflight (30-45 min)
   ↓
2. Baseline (git tag + snapshots)
   ↓
3. Codemod-First (AST transform + dry-run)
   ↓
4. Apply in Sequence (imports → props → barrels → build → guard)
   ↓
5. Compat Façade (only if breaking, with deletion date)
   ↓
6. Verification (build + guard + API report)
   ↓
7. Close (ADR + docs + deprecation warnings)
```

---

## 🚨 **Critical Thresholds**

### When Codemods are REQUIRED (Not Optional)

**Triggers:**
- ✅ Changes touching >10 files
- ✅ Any "sed will do" thought
- ✅ Import path changes
- ✅ Prop renames/removals
- ✅ Component moves
- ✅ API surface changes

**Rule:** If you're thinking "quick manual edit" for >10 files → STOP and write a codemod.

---

### Red Flags (STOP and Systematize)

**Immediate action required when you hear:**
- ❌ "Let's land this and fix later" (only OK if guardrail prevents regression)
- ❌ "Hand-editing more than 10 files"
- ❌ "Green locally, flaky in CI" (add pre-commit mirroring CI)
- ❌ Same bug appears 2+ times (extract pattern, add lint rule)

---

## 🛡️ **The 7-Step Migration Sequence**

### 1. Preflight (30-45 min)

**Required outputs:**
- [ ] RFC/migration plan (docs/adr/)
- [ ] Identified codemods needed
- [ ] Success metrics defined
- [ ] Rollback strategy documented

**Template:**
```markdown
# Migration: [Name]

## Goal
[What we're changing and why]

## Approach
[Codemod strategy, sequence, risk assessment]

## Success Criteria
- Build passes
- Guard passes
- API report clean
- 0 manual fixes needed

## Rollback
git revert [commit-range]
```

---

### 2. Baseline

**Commands:**
```bash
# Tag current state
git tag migration-baseline-$(date +%Y-%m-%d)

# Record current state
pnpm build > baseline-build.log 2>&1
pnpm guard > baseline-guard.log 2>&1
pnpm api:extract

# Commit baseline
git add .reports/api/
git commit -m "chore: baseline before [change]"
```

---

### 3. Codemod-First (NEVER Skip)

**Every codemod must have:**
- `--dry-run` flag
- Clear diff report
- File count
- Risk level (low/med/high)
- Rollback instructions

**Standard template:**
```javascript
#!/usr/bin/env node
/**
 * Codemod: [Name]
 * Description: [What it does]
 * Risk: [low|medium|high]
 * Rollback: git restore [pattern]
 */

import { parseArgs } from 'util';
import { glob } from 'glob';

const { values } = parseArgs({
  options: { 'dry-run': { type: 'boolean', default: false }}
});

const dryRun = values['dry-run'];

// 1. REPORT PHASE
console.log(`🔍 Scanning for files...`);
const files = await glob('**/*.{ts,tsx}', { ignore: ['**/node_modules/**', '**/dist/**'] });
console.log(`📊 Found ${files.length} files to transform`);

if (dryRun) {
  // Show diffs, don't apply
  showDiffs(files);
  console.log(`\n💡 Run without --dry-run to apply changes`);
  process.exit(0);
}

// 2. TRANSFORM PHASE
let transformed = 0;
for (const file of files) {
  if (transformFile(file)) transformed++;
}

// 3. SUMMARY
console.log(`\n✅ Transformed ${transformed}/${files.length} files`);
console.log(`\n📋 Next steps:`);
console.log(`   1. Review changes: git diff`);
console.log(`   2. pnpm barrels`);
console.log(`   3. pnpm build`);
console.log(`   4. pnpm guard`);
```

---

### 4. Apply in Sequence

**CRITICAL:** This order is non-negotiable

```bash
# Step 1: Imports first
pnpm imports:fix

# Step 2: Props/patterns second
node scripts/codemods/[transform].mjs

# Step 3: Barrels third
pnpm barrels

# Step 4: Build fourth
pnpm build

# Step 5: Guard last
pnpm guard
```

**Why this order:**
- Imports must be correct before transforms
- Props must be correct before barrels
- Barrels must be correct before build
- Build must pass before guard

---

### 5. Compat Façade (Only If Needed)

**Rule:** Compat shims DIE after 1-2 releases

**Process:**
1. Add re-export ONLY for breaking changes
2. Set removal date (max 2 releases)
3. Add ESLint rule FORBIDDING old pattern
4. Ship codemod in SAME release
5. Monitor usage
6. DELETE after 1-2 releases

**Example façade:**
```typescript
/**
 * @deprecated Import from @intstudio/forms instead
 * This re-export will be removed in v2.0.0 (Jan 2026)
 * Migration: pnpm codemod fields-ds-to-forms
 */
export { TextField } from '@intstudio/forms/fields';
```

**Matching ESLint rule:**
```javascript
// packages/eslint-plugin-cascade/src/rules/no-ds-fields.js
module.exports = {
  meta: {
    type: 'error',
    docs: {
      description: 'Prevent importing fields from DS (moved to @intstudio/forms)',
    },
    fixable: 'code',
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (node.source.value === '@intstudio/ds/fields') {
          context.report({
            node,
            message: 'Import fields from @intstudio/forms/fields instead',
            fix(fixer) {
              return fixer.replaceText(node.source, "'@intstudio/forms/fields'");
            },
          });
        }
      },
    };
  },
};
```

---

### 6. Verification

**Required checks:**
```bash
# Must all pass
pnpm build              # ESM + CJS + DTS
pnpm guard              # imports + deps + names
pnpm depgraph:check     # boundaries
pnpm api:extract        # surface changes

# Review diffs
git diff .reports/api/
```

---

### 7. Close

**Required documentation:**
- [ ] ADR in `docs/adr/YYYY-MM-DD-[name].md`
- [ ] Session summary in `docs/archive/SESSION_YYYY-MM-DD_[name].md`
- [ ] Deprecation warnings added to code
- [ ] Changeset created with migration command
- [ ] Removal date scheduled (GitHub issue/calendar)

---

## 📐 **Contract-First Development**

### Principle: Declare Truth, Derive Code

**Contracts we maintain:**
1. **Zod schemas** - Form validation truth
2. **Design tokens** - Visual truth
3. **API reports** - Public surface truth
4. **Barrel exports** - Public API truth
5. **TypeScript types** - Shape truth

**When adding features:**
```
1. Define contract FIRST (schema/token/type)
   ↓
2. Generate/derive code FROM contract
   ↓
3. Validate contract in tests
   ↓
4. Snapshot contract (API Extractor/Zod)
```

**Example - Form Field:**
```typescript
// 1. Contract FIRST (Zod schema)
const TextFieldSchema = z.object({
  name: z.string(),
  label: z.string().optional(),
  required: z.boolean().default(false),
  maxLength: z.number().optional(),
});

// 2. Derive types FROM contract
type TextFieldProps = z.infer<typeof TextFieldSchema>;

// 3. Component implements contract
export const TextField: React.FC<TextFieldProps> = (props) => {
  // Validate props against contract
  const validated = TextFieldSchema.parse(props);
  // ...
};

// 4. Snapshot contract
// packages/forms/contracts/TextField.v1.json
```

---

## 🎯 **Systems Over One-Offs**

### Rule: Fix It Once, In The System

**Triggers for systematization:**

| Pattern | Action |
|---------|--------|
| Issue appears 2x | Extract to utility/component |
| Issue appears 3x | Add guardrail (lint rule/hook) |
| Manual checklist | Automate in pre-commit |
| "Remember to..." | Auto-wire or add lint rule |
| Onboarding gotcha | Redesign API |

**Tools at our disposal:**
- ✅ ESLint rules (prevent at author-time)
- ✅ Import Doctor (auto-fix imports)
- ✅ Barrelizer (auto-generate exports)
- ✅ Codemods (safe transforms)
- ✅ Pre-commit hooks (enforce before commit)
- ✅ CI gates (catch before merge)
- ✅ Nightly sweeper (auto-maintenance)

---

## 🔄 **Quality Gate Sequence**

### Author-Time
```
TypeScript → ESLint → Prettier → Format on save
```

### Pre-Commit (Husky)
```bash
pnpm barrels        # Auto-generate exports
pnpm imports:fix    # Auto-correct imports
pnpm guard          # Validate (imports + deps + names)
```

### CI (GitHub Actions)
```bash
pnpm depgraph:check     # Boundary violations
pnpm api:extract        # Breaking changes
pnpm build              # All packages
pnpm test               # Smoke + integration
pnpm playwright test    # E2E critical paths
```

### Nightly (Automated PR)
```bash
pnpm tokens:codegen     # Regenerate from source
pnpm barrels            # Regenerate all barrels
pnpm imports:fix        # Fix any drift
pnpm api:extract        # Update snapshots
# Opens PR with: "chore: nightly auto-fix"
```

---

## 📊 **Success Metrics**

### Per Migration

**Time:**
- Preflight → Done: <45 min
- Dry-run → Apply: <30 min
- Apply → Green CI: <15 min
- **Total: <90 min**

**Quality:**
- Rollbacks needed: **0**
- Regressions introduced: **0**
- Manual fixes after: **0**
- CI rounds to green: **1**

**Leverage:**
- Same pattern reuse: **>3 times**
- Time saved on repeat: **>80%**
- Future changes: **push-button**

---

### Per Quarter

**Infrastructure:**
- Guardrails added: **>2**
- Codemods created: **>1**
- Auto-fixes added: **>3**
- Nightly sweeper tasks: **>1**

**Debt Reduction:**
- Compat shims removed: **>80%**
- Manual steps automated: **>50%**
- Documentation updated: **100%**

---

## 🎨 **JSON-Rendered Future Alignment**

### Spec → IR → Render Pipeline

**Phase 4+ roadmap:**

```
JSON Spec
   ↓ (validate + compile)
Typed IR
   ↓ (render)
DS Primitives
   ↓ (brand/theme)
Final UI
```

**Quality gates for specs:**
- Spec Doctor (validates against contracts)
- Cost budgets (perf/complexity scoring)
- A11y checks (automated)
- Golden spec tests (brand × theme × a11y matrix)
- Visual regression (across variants)

**This makes quality a property of the compiler, not the author.**

---

## 🚀 **What We're Nailing**

✅ **Systems over one-offs** - Every bug becomes a guardrail  
✅ **Clear boundaries** - DS ↔ Forms ↔ Core never blur  
✅ **Contract thinking** - Zod, tokens, API snapshots, spec/IR  
✅ **Incremental proof** - Green before scaling  
✅ **Documentation & visibility** - Session summaries, ADRs, what/why  

---

## ⚠️ **What to Watch**

### Anti-Patterns to Avoid

❌ **sed-level refactors** - Brittle for >10 files  
→ **Use AST codemods instead**

❌ **Parallel fixes** - Chasing whack-a-mole  
→ **Lock the sequence: imports → props → barrels → build → guard**

❌ **Compat linger** - Shims creeping back  
→ **Delete after 1-2 releases + ESLint forbids**

❌ **Manual edits >10 files** - High regression risk  
→ **Write codemod first**

❌ **"Quick sed will do"** - Famous last words  
→ **AST transform or bust**

---

## 📚 **Living Documents**

**This file updates after:**
- Every major migration (quarterly review)
- Every new guardrail added
- Every process improvement discovered
- Every anti-pattern encountered

**Related docs:**
- `docs/handbook/MIGRATION_PLAYBOOK.md` - Detailed migration guide
- `docs/handbook/DEBUGGING_PLAYBOOK.md` - Console scripts library
- `docs/ENGINEERING_PRINCIPLES.md` - Core methodology
- `docs/adr/` - Architecture decision records

---

## 🎯 **The Bottom Line**

> "Solve the problem once, in the system. Make the right thing automatic, the wrong thing impossible."

**Our competitive advantage:**
- Infrastructure compounds
- Quality is systematic
- Velocity increases over time
- Future changes are push-button

**Keep this energy. We're building leverage, not just features.**

---

**Last Review:** Oct 23, 2025  
**Next Review:** Jan 2026  
**Status:** ✅ Locked and Battle-Tested
