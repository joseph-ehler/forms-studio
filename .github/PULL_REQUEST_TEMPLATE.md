# Pull Request

## Summary

<!-- 1-3 lines: what changed and why -->

## Scope

- [ ] DS primitives (Flowbite + SKIN)
- [ ] Control Panel changes (`control/`, `registry/`)
- [ ] Forms layer (contracts/renderer)
- [ ] Tokens/roles
- [ ] Docs / ADR

## Validation

```bash
✅ pnpm lint:prod       # Prod-only lint
✅ pnpm typecheck       # All packages
✅ pnpm build           # All packages compile
```

- [ ] All checks passing
- [ ] Barrels up-to-date (if applicable)

## Architecture Checklist

### DS Layer (if applicable)

- [ ] Variants defined in `control/variants.config.ts`
- [ ] SKIN keys in `control/skin-contracts.ts` (TypeScript contracts)
- [ ] SKIN maps in `registry/skins/*.skin.ts`
- [ ] Components read only `--component-*` vars (never `--ds-role-*` directly)
- [ ] No magic numbers (only tokens)

### Forms Layer (if applicable)

- [ ] Contracts in `field-contracts.ts` (TypeScript types)
- [ ] Registry in `field-types.ts` (central mapping)
- [ ] Fields compose `@intstudio/ds/fb/*` primitives (no Flowbite imports)
- [ ] No CSS files in Forms layer (DS classes only)

### General

- [ ] ARIA attributes present/verified
- [ ] Documentation updated (`WHERE-TO-EDIT.md`, ADRs)

### Refactor (if applicable)

- [ ] **Renames**: Used `pnpm refactor:rename` (not manual) - see [`RENAME_WORKFLOW.md`](../../docs/handbook/RENAME_WORKFLOW.md)
- [ ] **Rename sanity**: Ran `pnpm doctor:rename` before commit
- [ ] **Golden sources**: No protected directories deleted (flowbite-react-blocks, etc.)

## Related Issues

<!-- Link to related issues, e.g., "Fixes #123" or "Relates to #456" -->

## Screenshots/Videos (if applicable)

<!-- Add screenshots or videos to demonstrate changes -->

## Additional Notes

<!-- Any additional context or notes for reviewers -->

---

## Pre-Flight Validation

Before requesting review, please verify:

```bash
# Validate docs placement
pnpm validate:docs

# Validate file naming
pnpm validate:naming

# Run all validators
pnpm validate:all

# Lint markdown
pnpm lint:md

# Build packages
pnpm build

# Run tests
pnpm test
```

## For Reviewers

- [ ] Code quality is acceptable
- [ ] Tests are adequate
- [ ] Documentation is clear and complete
- [ ] No violations of naming/placement rules
- [ ] Changes align with project architecture
