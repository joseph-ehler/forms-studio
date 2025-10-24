# Production Ship Checklist

**Status**: Ready to ship 🚢  
**Date**: Oct 24, 2025

---

## ✅ Pre-Flight Checks

### **1. Tests Pass**
```bash
# E2E tests
pnpm test:e2e
# Expected: 40 specs pass

# Unit tests (shape contracts)
pnpm test:unit
# Expected: CSS contracts + a11y tests pass

# Build
pnpm build
# Expected: All packages build successfully

# Analyze bundle
pnpm analyze
# Expected: Bundle size within budgets
```

### **2. Accessibility**
```bash
# Run axe on all states
pnpm test:a11y

# Manual keyboard test
# - Tab through all interactive elements
# - Esc closes panels/routes
# - Focus returns correctly
```

### **3. Visual Regression**
```bash
# Run Chromatic
pnpm chromatic

# Review snapshots
# - Panel open/closed
# - Dialog states
# - Flow steps
# - Reduced motion variants
```

### **4. Lint & Type Check**
```bash
# ESLint
pnpm lint
# Expected: No errors

# TypeScript
pnpm typecheck
# Expected: No type errors

# Stylelint
pnpm stylelint
# Expected: No style violations
```

---

## 📦 Package Checklist

### **@intstudio/ds@2.0.0**

**Exports**:
- [x] `@intstudio/ds/routes` - FullScreenRoute, FlowScaffold, RoutePanel
- [x] `@intstudio/ds/hooks` - useFocusTrap, useTelemetry, useSubFlow
- [x] `@intstudio/ds/primitives/overlay` - SheetDialog, SheetPanel, Option

**Files**:
- [x] Barrel exports (`index.ts`)
- [x] Type definitions (`.d.ts`)
- [x] CSS files (tokenized)
- [x] Source maps

**Metadata**:
- [x] `package.json` version bumped
- [x] `CHANGELOG.md` updated
- [x] `README.md` current
- [x] `sideEffects` includes CSS

---

## 📚 Documentation Ready

- [x] **CONTRIBUTING.md** - Component patterns
- [x] **CSS_OVERRIDE_VARS.md** - Safe customization
- [x] **ADOPTION_GUIDE.md** - Migration recipes
- [x] **WEEK_2_3_FINAL_STATUS.md** - Implementation summary
- [x] **Storybook** - Live examples published

---

## 🔒 Guardrails Active

- [x] ESLint rules enforcing (2 new rules)
- [x] Runtime validation (dev mode)
- [x] Type safety (TypeScript strict)
- [x] CSS tokens only (stylelint)
- [x] Bundle size monitoring (CI)

---

## 🧪 Smoke Test Script

```bash
#!/bin/bash
# smoke-test.sh

echo "🧪 Running smoke tests..."

# 1. Build
echo "Building..."
pnpm build || exit 1

# 2. Lint
echo "Linting..."
pnpm lint || exit 1

# 3. Type check
echo "Type checking..."
pnpm typecheck || exit 1

# 4. Unit tests
echo "Running unit tests..."
pnpm test:unit || exit 1

# 5. E2E tests
echo "Running E2E tests..."
pnpm test:e2e || exit 1

# 6. Bundle size
echo "Checking bundle size..."
pnpm analyze

echo "✅ All smoke tests passed!"
```

---

## 🚀 Deployment Steps

### **1. Tag Release**
```bash
git tag v2.0.0
git push origin v2.0.0
```

### **2. Publish to npm**
```bash
pnpm changeset version
pnpm changeset publish
```

### **3. Deploy Storybook**
```bash
pnpm build-storybook
pnpm chromatic --project-token=XXX
```

### **4. Update Docs Site**
```bash
cd docs
pnpm build
pnpm deploy
```

---

## 📢 Announce

### **Changelog Entry**

```markdown
## [2.0.0] - 2025-10-24

### Added
- **FullScreenRoute**: Full-screen modal routes with focus trap
- **FlowScaffold**: Multi-step wizard with URL-bound steps
- **RoutePanel**: Non-modal desktop panel, responsive
- **useSubFlow**: URL-bound step management hook
- **useFocusTrap**: Reusable focus trap hook
- **useTelemetry**: Event tracking hook

### Features
- Complete micro/meso/macro navigation hierarchy
- Automatic sheet → route escalation
- 40 E2E tests
- 2 new ESLint rules
- Full accessibility compliance
- RTL support
- Reduced motion support
- SSR-safe

### Migration Guide
See ADOPTION_GUIDE.md for migration recipes
```

### **Release Notes**

Post to:
- [ ] Internal Slack (#eng-updates)
- [ ] GitHub Releases
- [ ] Documentation site

---

## ✅ Post-Ship

- [ ] Monitor error tracking (first 24h)
- [ ] Collect feedback from early adopters
- [ ] Schedule bug bash (Week 4)
- [ ] Plan next iteration

---

**All checks passed? Ship it! 🚢**
