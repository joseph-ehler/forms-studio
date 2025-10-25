# Quality Layer Pre-Flight Checklist

**Lock these decisions before building**

---

## ✅ Foundation & Tooling (LOCKED)

### Tailwind
- **Decision**: Pin to v3.4.14 (max compatibility with Flowbite)
- **Why**: Flowbite officially supports v3; v4 is experimental
- **Later**: Upgrade to v4 behind feature flag when Flowbite ready
- **Implementation**: `pnpm.overrides.tailwindcss: "3.4.14"`

### TypeScript
- **Decision**: Pin to 5.8.2 (satisfies peer ranges)
- **Why**: Flowbite peer dep requires `>=4.8.4 <5.9.0`
- **Implementation**: `pnpm.overrides.typescript: "5.8.2"`

### Flowbite Versions
- **Decision**: Standardize on single version
  - `flowbite-react`: 0.10.2
  - `flowbite`: 2.5.2
- **Why**: Eliminate version conflicts
- **Implementation**: `pnpm.overrides` for both packages

---

## ✅ Package Boundaries & Imports (LOCKED)

### Sealed Exports
- **Decision**: Apps import ONLY via sealed barrels
  - `@intstudio/ds/fb` - Flowbite wrappers
  - `@intstudio/ds/routes` - Bespoke routes
  - `@intstudio/ds/hooks` - State helpers
- **Enforcement**: ESLint + package.json exports field
- **Why**: Prevents deep imports, enables refactoring

### Direct Flowbite Blocked
- **Decision**: NO direct `flowbite-react` imports in apps
- **Enforcement**: ESLint `no-restricted-imports` rule
- **Why**: Quality layer must mediate all usage

### Auto-Barrels
- **Decision**: Generated on prebuild with `barrelsby`
- **Enforcement**: CI fails if barrels dirty
- **Why**: Single source of truth for exports

---

## ✅ Tokens & Theming (LOCKED)

### Single Source of Truth
- **Decision**: `@intstudio/tokens` (CSS variables)
- **Tailwind**: Maps utilities → `--ds-*` tokens
- **Why**: Change once, updates everywhere

### Named Variants
- **Decision**: No inline theme objects
- **Pattern**: `variant="primary|secondary|ghost|danger"`
- **Why**: Semantic, consistent, maintainable

### Dark Mode
- **Decision**: Tailwind `dark:` class strategy
- **Implementation**: Already in tokens
- **Why**: Standard, SSR-safe

### RTL Readiness
- **Decision**: Use logical properties where relevant
- **Implementation**: `ps-*` instead of `pl-*`, etc.
- **Why**: Future-proof for i18n

---

## ✅ Quality Contracts (NON-NEGOTIABLE)

### Accessibility
- **Decision**: Required props validated at runtime (dev only)
- **Example**: `ariaLabel` on dialogs throws if missing
- **Enforcement**: `if (process.env.NODE_ENV !== 'production' && !ariaLabel) throw`
- **Why**: Prevent shipping inaccessible UIs

### Focus & Keyboard
- **Decision**: 
  - Modals: focus trap + Escape closes + return focus
  - Panels: non-modal (no trap)
- **Implementation**: Built into Modal/Drawer wrappers
- **Why**: WCAG 2.1 AA compliance

### Diagnostics
- **Decision**: All wrappers expose state via data attributes
  - `data-component="modal"`
  - `data-state="open|closed"`
  - `data-label="..."`
- **Debug Mode**: `window.__DS_DEBUG = true` or `debug` prop
- **Why**: Observable, testable, debuggable

---

## ✅ Hooks & Patterns (LOCKED)

### State Helpers
- **Decision**: Standard hooks return `{ props }`
  - `useModal()` → `{ open, onOpen, onClose, props }`
  - `usePagination()` → `{ currentPage, totalPages, pageRange, props }`
- **Why**: 2-3 line usage at call site

### Compositions
- **Decision**: Extract repeated patterns immediately
  - `<Field>` - label + input + error + hint
  - `<TableRowActions>` - dropdown menu
  - `<Stack>` - responsive layout
- **Why**: DRY, consistent

---

## ✅ Bespoke Keepers (LOCKED)

### No Flowbite Replacement
Keep these as-is (already production-ready):
- ✅ `FullScreenRoute` - Mobile-first full-screen modal
- ✅ `FlowScaffold` + `useSubFlow` - URL-bound wizard
- ✅ `RoutePanel` - Desktop persistent panel
- ✅ `useOverlayPolicy` - Depth management
- ✅ `useFocusTrap` - Already hardened

**Why**: These are your differentiators; don't replace what works

---

## ✅ Storybook & Tests (LOCKED)

### Storybook Setup
- **Config**: Root Storybook with Vite
- **CSS Order**:
  1. `packages/tokens/src/tokens.css`
  2. Tailwind entry CSS
  3. (Optional) `flowbite/dist/flowbite.css`
- **Addons**: essentials + a11y + interactions
- **CI**: `storybook build` + `@storybook/test`

### A11y Checks
- **Tool**: `axe` on wrapper stories
- **CI**: Blocking on violations
- **Local**: Relaxed (warnings only)
- **Why**: Catch regressions early

### E2E Tests
- **Tool**: Playwright (light smoke tests only)
- **Coverage**: Dialogs, flows, critical paths
- **Why**: Keep lean, focus on integration

---

## ✅ Lint & CI Gates (LOCKED)

### ESLint Rules
- ❌ Block `flowbite-react` imports in apps
- ❌ Block deep DS imports (`@intstudio/ds/src/*`)
- ❌ Block inline `style={{}}` (use Tailwind + tokens)
- ✅ Allow Flowbite ONLY in `packages/ds/src/fb/**`

### CI Required Checks
1. Docs placement validation
2. Naming conventions
3. Import hygiene (no deep, no self-package)
4. Boundaries (apps → packages)
5. Storybook build + test
6. Barrels clean (auto-generated, committed)

---

## ✅ Migration & Deprecation (LOCKED)

### Codemods
- **Decision**: Automated transforms for breaking changes
- **Standard**: AST transforms (ts-morph/jscodeshift)
- **Requirements**: `--dry-run`, risk level, rollback instructions
- **Why**: Safe, auditable, repeatable

### Deprecation Path
- **Process**:
  1. Add `@deprecated` JSDoc
  2. Add ESLint rule to block new usage
  3. Ship codemod in same release
  4. Delete after 1-2 releases
- **Why**: Clean API surface, no legacy cruft

---

## ✅ Forms & Schema (LOCKED)

### RHF + Zod
- **Decision**: Baked into Form wrapper
- **Package**: `@intstudio/core` (optional)
- **When**: Schema-first when useful, JSON spec optional
- **Why**: Consistent validation, type-safe

---

## ✅ Icons (LOCKED)

### Strategy
- **Prefer**: `flowbite-react-icons` or dedicated icon lib
- **Avoid**: Inline SVG bloat
- **Lazy Load**: Large icon sets
- **Why**: Bundle efficiency

---

## ✅ Performance & SSR (LOCKED)

### Bundle Budgets
- **Tool**: `size-limit` on `@intstudio/ds`
- **Budget**: Start generous, tighten over time
- **Why**: Prevent bundle bloat

### SSR Safety
- **Decision**: Guard `window` usage in wrappers/hooks
- **Pattern**: `typeof window !== 'undefined'`
- **Why**: Support Next.js, Remix, etc.

---

## ✅ Naming & Docs (LOCKED)

### File Naming
- **Components**: PascalCase (`Modal.tsx`)
- **Hooks**: camelCase (`useModal.ts`)
- **Others**: kebab-case (`debug-modal.ts`)
- **Enforcement**: Existing validator
- **Why**: Consistent conventions

### Docs Placement
- **Decision**: Keep current enforced structure
- **Validation**: Pre-commit hooks
- **Why**: Predictable, discoverable

---

## ✅ Critical: No "Elite" Branding

**Decision**: Components are just `Modal`, `Button`, `Field`

**Why**: 
- Quality is baked in, not branded
- Namespace `@intstudio/ds/fb` signals quality layer
- Cleaner APIs, less cognitive overhead
- "Elite" feels pretentious

**Examples**:
- ✅ `<Modal ariaLabel="..." {...modal.props}>`
- ❌ `<EliteModal ariaLabel="..." {...modal.props}>`

---

## Exit Criteria (Must be YES)

Before considering Phase 1 complete:

- [ ] TS 5.8.x installed, no peer warnings
- [ ] Tailwind 3.4.x installed, no peer warnings
- [ ] Flowbite versions standardized (0.10.2 / 2.5.2)
- [ ] 3 wrappers built: Modal, Field, Button
- [ ] useModal() hook working
- [ ] Test page demos full flow
- [ ] Storybook renders correctly
- [ ] ESLint blocks direct flowbite imports
- [ ] Sealed exports enforced
- [ ] Modal throws if ariaLabel missing (dev mode)
- [ ] Focus returns after modal close
- [ ] Field auto-wires aria-describedby
- [ ] data-* attributes present on all wrappers
- [ ] No peer dependency warnings on `pnpm install`

---

## Timeline

**Week 1**: Foundation (this checklist complete)
**Week 2**: First 3 wrappers + validation
**Week 3-4**: Expand coverage (5 more wrappers)
**Week 5-6**: Migration + codemods
**Week 7-8**: Polish + docs

---

## Success Metrics

**Quality**:
- A11y: 100% of wrappers enforce required contracts
- Bundle: Stay under budget (generous at first)
- DX: 2-3 line usage per component

**Velocity**:
- Modal usage: 10 lines → 3 lines (70% reduction)
- Form usage: 15 lines → 5 lines (67% reduction)
- Table usage: 30 lines → 3 lines (90% reduction)

**Hygiene**:
- Direct flowbite imports: 0 (ESLint enforced)
- Deep DS imports: 0 (ESLint enforced)
- Inline styles: 0 (ESLint enforced)

---

## What's Next

1. ✅ This checklist reviewed and locked
2. ⏳ Root package.json updated (overrides + scripts)
3. ⏳ First 3 wrappers scaffolded
4. ⏳ Test page created
5. ⏳ Validation run

**Status**: PREFLIGHT COMPLETE ✈️
