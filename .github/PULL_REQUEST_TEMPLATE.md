# Pull Request

## Description

<!-- Brief description of what this PR does -->

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)

## Checklist

### Code Quality

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] My changes generate no new warnings or errors

### Documentation & Naming

- [ ] ✅ **No root-level or package-root docs added** (docs must be in `docs/` or `packages/*/docs/`)
- [ ] ✅ **Naming validator passes** (`pnpm validate:naming`)
- [ ] ✅ **Docs in approved locations** (if docs added)
- [ ] I have updated documentation as needed
- [ ] My files follow naming conventions (kebab-case for files, PascalCase for components)

### Testing

- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] I have added/updated E2E tests if needed

### Design System (if applicable)

- [ ] Components use DS primitives (no custom CSS in Forms layer)
- [ ] Only `--ds-*` tokens used (no magic numbers)
- [ ] ARIA attributes added/verified
- [ ] Keyboard navigation tested
- [ ] Mobile/responsive behavior verified

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
