# Contributing to Intelligence Studio Forms

Thank you for contributing! This guide ensures consistency and quality across the codebase.

---

## Pre-Merge Checklist

Before opening a PR or merging to main, run:

```bash
pnpm doctor
```

This comprehensive command validates:
- ✅ **Barrels** - Export files are up to date
- ✅ **Lint** - Code style + custom rules (including SKIN completeness)
- ✅ **TypeScript** - All packages type-check
- ✅ **Build** - All packages compile successfully
- ✅ **Contrast** - WCAG 3:1 compliance for all color combinations

**Green `pnpm doctor` = OK to merge** ✅

If any check fails, fix it before requesting review.

---

## Development Workflow

### 1. Setup

```bash
# Install dependencies
pnpm install

# Verify setup
pnpm doctor
```

### 2. Development

```bash
# Start Storybook for component development
pnpm sb

# Run specific package in watch mode
pnpm --filter @intstudio/ds dev
```

### 3. Making Changes

**Component Development:**
- DS components: Use tokens only (`--ds-*`), co-locate CSS
- Forms fields: Use DS primitives, no custom CSS
- Always add tests (unit + E2E)

**Adding Variants:**
1. Update type definition
2. Add to SKIN map (4 lines)
3. Run `pnpm doctor`
4. Done (CSS updates automatically)

### 4. Before Commit

```bash
# Auto-fix common issues
pnpm lint:fix

# Regenerate barrels if needed
pnpm barrels

# Comprehensive validation
pnpm doctor
```

Git hooks will automatically validate:
- Documentation placement
- File naming conventions

---

## Code Standards

### Design System (DS)

**Location:** `packages/ds/`

**Rules:**
- ✅ Tokens only - No magic numbers
- ✅ Co-located CSS - `Component.tsx` + `Component.css`
- ✅ BEM-ish classes - `.ds-component__part`
- ✅ Runtime contracts - Dev-mode validation
- ✅ Logical properties - `inset-inline`, `padding-inline` (RTL support)

### Forms Layer

**Location:** `packages/forms/`

**Rules:**
- ✅ No CSS files - Use DS classes only
- ✅ DS primitives only - No custom components
- ✅ Thin wrappers - Controller + label + DS recipe
- ✅ Recipes return - `{ Trigger, Overlay }`

### Testing

**Required:**
- Shape contracts (touch targets, token usage)
- ARIA contracts (roles, focus trap, keyboard)
- E2E tests (focus, keyboard, reduced motion)

**Run tests:**
```bash
pnpm test           # Unit tests
pnpm sb:test:ci     # Storybook matrix tests
```

---

## Commands Reference

### Validation

```bash
pnpm doctor              # Comprehensive health check (use this!)
pnpm lint                # ESLint (including custom rules)
pnpm lint:fix            # Auto-fix linting issues
pnpm typecheck           # TypeScript validation
pnpm build               # Build all packages
pnpm design:contrast     # WCAG compliance check
```

### Development

```bash
pnpm sb                  # Storybook dev server
pnpm dev                 # Watch mode for all packages
pnpm barrels             # Regenerate barrel exports
pnpm barrels:check       # Verify barrels are current
```

### Testing

```bash
pnpm test                # Unit tests
pnpm sb:test             # Storybook tests (watch)
pnpm sb:test:ci          # Storybook tests (CI)
pnpm sb:build            # Build Storybook
```

---

## File Placement Rules

### Monorepo Root (`/`)

**ONLY for:**
- `README.md`, `CONTRIBUTING.md` (this file)
- `package.json`, config files
- Config directories (`.github`, `.husky`, `.vscode`)

**NEVER create:**
- `DEBUG_*.js`, `PHASE_*.md`, `*_COMPLETE.md` in root
- Any documentation files (use `docs/`)

### Documentation

- Session logs → `docs/archive/SESSION_YYYY-MM-DD.md`
- Architecture docs → `docs/handbook/`
- ADRs → `docs/adr/YYYY-MM-DD-title.md`
- Package docs → `packages/*/docs/`

### Scripts

- Utility scripts → `scripts/utils/`
- Cleanup scripts → `scripts/cleanup/`
- Codemods → `scripts/codemods/`
- Debug scripts → `scripts/debug/` (delete after use)

---

## Pull Request Guidelines

### Before Opening PR

1. ✅ Run `pnpm doctor` - all checks green
2. ✅ Add tests for new features
3. ✅ Update documentation if needed
4. ✅ Keep changes focused (one concern per PR)

### PR Description

Include:
- **What**: Brief description of changes
- **Why**: Problem being solved
- **How**: Approach taken
- **Testing**: How to verify changes

### Review Process

PRs require:
- ✅ Green CI (all workflows pass)
- ✅ Green `pnpm doctor`
- ✅ Approval from maintainer
- ✅ No unresolved comments

---

## Emergency Procedures

### Bypass Pre-commit Hook

**Only in emergencies:**
```bash
git commit --no-verify
```

**Fix immediately after:** The hook exists for a reason!

### Quick Fix After Failed Doctor

```bash
# Fix imports
pnpm lint:fix

# Regenerate barrels
pnpm barrels

# Rebuild
pnpm build

# Verify
pnpm doctor
```

---

## Questions?

- Check `docs/handbook/` for guides
- Review existing components for patterns
- Ask in PR comments or team chat

**Remember: Green `pnpm doctor` = Ship-ready code** 🚀
