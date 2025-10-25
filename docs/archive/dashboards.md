# Design System Control Dashboard

Quick links to all quality gates and reports.

---

## 🎯 Quality Gates

### Matrix Tests
- **Storybook Matrix**: [Button Matrix](http://localhost:6006/?path=/story/ds-fb-button--matrix-all-variants)
- **Run Command**: `pnpm sb:test`
- **CI**: Check latest workflow runs

### Contrast Reports
- **Run Command**: `pnpm design:contrast`
- **Local Output**: Console (all role pairs)
- **CI Artifact**: `.github/workflows/ci.yml` (if published)

### Type Safety
- **Run Command**: `pnpm typecheck`
- **Coverage**: All packages

### Lint + SKIN Validation
- **Run Command**: `pnpm lint`
- **Rules**: Import hygiene, SKIN completeness, token usage
- **ESLint Plugin**: `tools/eslint-plugin-cascade/`

### Build Health
- **Run Command**: `pnpm build`
- **Packages**: All packages in monorepo

---

## 📊 Component Status

| Component | Variants | SKIN Complete | Matrix Tests | Contrast | Docs |
|-----------|----------|---------------|--------------|----------|------|
| Button    | 7        | ✅            | ✅           | ✅       | ✅   |
| Input     | -        | 🚧 Template   | -            | -        | -    |
| Select    | -        | -             | -            | -        | -    |

---

## 🔗 Quick Links

### Development
- [Storybook Dev](http://localhost:6006)
- [Design Tokens](../../../tokens/src/tokens.css)
- [Variant Registry](./variants.config.ts)
- [SKIN Registry](../registry/skins/)

### Documentation
- [Automagic Button System](../../../../docs/handbook/AUTOMAGIC_BUTTON_SYSTEM.md)
- [Foolproof Checklist](../../../../docs/handbook/FOOLPROOF_BUTTON_CHECKLIST.md)
- [ESLint Stabilization](../../../../docs/handbook/ESLINT_STABILIZATION.md)
- [Contributing Guide](../../../../CONTRIBUTING.md)

### CI/CD
- [GitHub Actions](../../../../.github/workflows/)
- [Latest Runs](https://github.com/your-org/intelligence-studio-forms/actions)

---

## 🛠️ Commands

### Development
```bash
pnpm sb              # Storybook dev server
pnpm dev             # Watch all packages
```

### Validation
```bash
pnpm doctor          # Comprehensive health check
pnpm ds:doctor       # Same (alias)
pnpm lint            # ESLint + SKIN validation
pnpm typecheck       # TypeScript
pnpm build           # Build all packages
pnpm design:contrast # WCAG compliance
```

### Generation
```bash
pnpm ds:new          # Scaffold new component (coming soon)
pnpm barrels         # Regenerate exports
```

---

## 📝 Adding Components

**Current**: Follow `Input.template.tsx` pattern  
**Future**: `pnpm ds:new ComponentName`

Will scaffold:
- Component files (TSX, CSS, stories, matrix, contracts)
- SKIN map in registry
- Schema in control
- Auto-wired to variants registry

---

## 🎯 Success Metrics

**Green on all?** → Ship it 🚀

- ✅ `pnpm lint` (SKIN completeness, import hygiene)
- ✅ `pnpm typecheck` (type coverage)
- ✅ `pnpm build` (all packages compile)
- ✅ `pnpm sb:test` (matrix assertions)
- ✅ `pnpm design:contrast` (WCAG 3:1)

---

**Last Updated**: 2025-01-24
