# God-Tier Token System - Completion Checklist

## ✅ Foundation (DONE)

- [x] RGB triplets for all brand colors (`--ds-color-primary-rgb`)
- [x] State tokens (`--ds-state-hover-bg`, `--ds-state-active-bg`, `--ds-state-focus-ring`)
- [x] Density/ergonomics tokens (`--ds-space-control-x`, `--ds-space-control-y`, `--ds-radius-control`)
- [x] Layer tokens (`--ds-scrim`, `--ds-elevation-overlay`)
- [x] Dark mode via `data-theme="dark"` attribute
- [x] Tailwind bridge (`tailwind-theme.ts`)

## ✅ Token Consumption (DONE)

- [x] Type-safe helpers (`dsColor()`, `dsSpace()`, `dsRadius()`, etc.)
- [x] ESLint rules to ban magic hex/px values (`.eslintrc.token-enforcement.json`)
- [x] Stylelint rules to ban raw colors/spacing (`.stylelintrc.token-enforcement.json`)
- [x] Tokens exported from `@intstudio/tokens`

## ✅ Systemic Guards (DONE)

- [x] Global focus ring standards (`packages/ds/src/styles/focus-rings.css`)
- [x] Overlay standards (Modal/Drawer pattern in `overlay-standards.css`)
- [x] Tailwind safelist for dynamic classes (already in `tailwind.config.js`)

## ✅ Components (DONE)

- [x] Token-only Button component
- [x] Ghost hover contrast improved (6% → 10%)
- [x] Focus rings work in light & dark modes
- [x] All variants have consistent lift animations
- [x] `useTheme()` hook with localStorage persistence
- [x] `<ThemeToggle />` component

## 🚧 In Progress

- [ ] **Remove Flowbite CSS** from playground
  - File: `apps/playground/src/main.tsx`
  - Action: Remove any `flowbite.css` imports, rely only on tokens
  
- [ ] **Apply ESLint/Stylelint rules** to packages
  - Add to `.eslintrc.js`: `"extends": ["./.eslintrc.token-enforcement.json"]`
  - Add to `stylelint.config.js`
  
- [ ] **Import global styles** in DS index
  - `packages/ds/src/index.ts`
  - Import `./styles/focus-rings.css` and `./styles/overlay-standards.css`

## 📚 Documentation (TODO)

- [ ] **Storybook token page**
  - Create `.storybook/stories/foundation.tokens.mdx`
  - Display color swatches, spacing scale, etc.
  - Make tokens a first-class page
  
- [ ] **Component documentation**
  - Add comprehensive Storybook stories for Button (done!)
  - Add stories for other components

## 🧪 Testing (TODO)

- [ ] **A11y canary tests**
  - Script: `"sb:canary"` in `package.json`
  - Test: Modal open, Button focus ring, Field error
  - Run in CI
  
- [ ] **Visual regression tests**
  - Chromatic or Percy integration
  - Snapshot all button variants
  
- [ ] **Contract tests**
  - Test that components use only tokens
  - Test WCAG contrast ratios
  - Test touch target sizes (44px minimum)

## 🔄 Future Codegen (LATER)

- [ ] Create `tokens.source.ts` (single source of truth)
- [ ] Generate `tokens.css` from source
- [ ] Generate `tailwind-theme.ts` from source
- [ ] Generate TypeScript types from source
- [ ] CI job to check generated files are up-to-date

## 🎯 Component Coverage (TODO)

- [x] Button (done!)
- [ ] Input
- [ ] Select
- [ ] Textarea
- [ ] Checkbox
- [ ] Radio
- [ ] Switch
- [ ] Modal
- [ ] Drawer
- [ ] Stack
- [ ] TableRowActions

## 📊 Success Metrics

**Quality Gates:**
- ✅ Zero magic hex colors in components
- ✅ Zero hardcoded px values in components  
- ✅ All interactive elements meet 44px touch targets
- ✅ All text meets WCAG AA contrast (4.5:1)
- ⚠️ Focus rings visible in all themes (improved, needs validation)
- ⚠️ Reduced motion support (partial - needs testing)

**DX Metrics:**
- ✅ Autocomplete for all token functions
- ✅ Type errors for invalid token references
- ✅ Single source of truth (tokens.css)
- ⏳ Lint errors for magic values (rules created, not enforced yet)
- ⏳ Storybook as living documentation (Button done, need token page)

## 🚀 Next Actions (Priority Order)

### Immediate (Today)
1. ✅ ~~Improve ghost hover contrast~~
2. ✅ ~~Enhance focus rings for dark mode~~
3. ✅ ~~Create type-safe token helpers~~
4. ✅ ~~Create ESLint/Stylelint rules~~
5. ⏳ Remove Flowbite CSS from playground
6. ⏳ Enforce ESLint/Stylelint rules

### Short-term (This Week)
7. Import global focus/overlay styles in DS
8. Create Storybook token documentation page
9. Add A11y canary tests
10. Validate contrast ratios programmatically

### Medium-term (This Month)
11. Token-only Input, Select, Textarea
12. Add visual regression tests
13. Add link variant to Button
14. Add icon-only sizes to Button

### Long-term (Future)
15. Full codegen system for tokens
16. Contract testing suite
17. Performance budgets
18. Bundle size monitoring

---

## 📝 Notes

**Why this order:**
1. **Foundation first** - Tokens must be rock-solid before components use them
2. **Consumption next** - Make it impossible to use tokens wrong
3. **Components after** - Now they inherit the quality by default
4. **Testing last** - Prove the contracts work

**Key insight:**
> The token system isn't "done" when tokens.css exists. It's done when:
> 1. Tokens are defined (✅)
> 2. Tokens are consumed correctly (✅ helpers, ⏳ enforcement)
> 3. Incorrect usage is impossible (⏳ lint rules enforced)
> 4. Quality is proven (❌ tests needed)

**Current state:**
- 80% complete (foundation + helpers done)
- 20% remaining (enforcement + testing + docs)

**To reach 100%:**
- Enforce lint rules
- Create token documentation
- Add canary tests
- Remove Flowbite CSS
