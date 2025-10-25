# ADR: Flowbite Elite Architecture

**Date**: 2025-01-24  
**Status**: Accepted  
**Context**: Strategic pivot to Flowbite-based design system with elite quality wrapping

## Context

Building a comprehensive design system from scratch is time-intensive and diverts focus from business logic. Meanwhile:

1. **Flowbite provides 450+ production-ready blocks** across application, marketing, and e-commerce UI
2. **Active maintenance** - Regular updates, bug fixes, accessibility improvements
3. **Tailwind-first** - Matches modern workflow, minimal CSS
4. **Battle-tested** - Used by thousands of projects

However, Flowbite alone lacks:
- Our systematic quality patterns (auto-wiring, runtime contracts, diagnostics)
- Our flat design aesthetic
- Our bespoke macro UX (FullScreenRoute, FlowScaffold, RoutePanel)
- Our elite hooks (useOverlayPolicy, useSubFlow, useFocusTrap)

## Decision

**Adopt a layered architecture**: Flowbite as foundation + elite wrapping layer + bespoke components

### Layer 0: Tokens (`@intstudio/tokens`)

**Single source of truth** - CSS variables consumed by Tailwind and components:

```css
:root {
  --ds-color-primary: #2F6FED;
  --ds-space-4: 1rem;
  --ds-radius-lg: 0.5rem;
  --ds-shadow-overlay-md: 0 8px 24px rgba(0,0,0,0.12);
  --ds-z-modal: 90;
  /* 100+ tokens */
}
```

**Tailwind bridge**:
```js
// tailwind.config.js
import { tokensTheme } from '@intstudio/tokens/tailwind-theme';

export default {
  theme: {
    extend: tokensTheme
  }
}
```

### Layer 1: Flowbite Foundation

**Official packages**:
- `flowbite-react` - Core components (Button, Modal, Input, etc.)
- `flowbite-react-icons` - Icon library
- `flowbite-typography` - Rich text styling
- `tailwind-merge` - Class merging utility

**450+ blocks library** (local):
- Application UI: Tables, CRUD, Forms, Modals, Drawers, Navbars
- Marketing UI: Hero, CTA, Features, Pricing, Auth, Blog
- E-commerce UI: Cart, Checkout, Orders, Products
- Publisher UI: Content management

### Layer 2: DS (`@intstudio/ds`)

**Four sub-packages**:

#### `/fb` - Elite Flowbite Wrappers

Thin wrappers around Flowbite components adding:
- **Runtime contracts**: `ariaLabel` required, throws in dev mode
- **Consistent API**: Semantic variants (`primary`, `ghost`, `danger`)
- **Auto-wiring**: Context provides refs/state, consumers receive
- **Flat design**: Theme overrides for no shadows by default
- **Diagnostics**: `data-*` attributes, `debugX()` helpers

**Example**:
```tsx
// packages/ds/src/fb/Modal.tsx
import { Modal as FBModal } from 'flowbite-react';

export function Modal({ ariaLabel, ...props }) {
  if (process.env.NODE_ENV !== 'production' && !ariaLabel) {
    throw new Error('[DS.Modal] ariaLabel is required');
  }
  return <FBModal aria-label={ariaLabel} {...props} />;
}
```

#### `/blocks` - Organized Flowbite Blocks

Curated, organized blocks from the 450+ library:
```
blocks/
  application/
    tables/
    crud/
    modals/
  marketing/
    hero/
    cta/
    pricing/
  ecommerce/
    cart/
    checkout/
```

#### `/routes` - Bespoke Macro UX (KEEP)

**Differentiator** - Unique patterns Flowbite can't provide:
- `FullScreenRoute` - Mobile-first full-screen modal
- `FlowScaffold` + `useSubFlow` - URL-bound wizard
- `RoutePanel` - Desktop persistent panel

These are your **special sauce** - don't replace with Flowbite.

#### `/hooks` - Elite Hooks (KEEP)

**Value-add** - Systematic patterns:
- `useOverlayPolicy` - Depth/escalation management
- `useFocusTrap` - Keyboard navigation & focus management
- `useSubFlow` - Step-based wizard state
- `useTelemetry` - Analytics integration

### Layer 3: Apps

**Consume only DS**, never Flowbite directly:

```tsx
// ✅ Correct
import { Modal, Button } from '@intstudio/ds/fb';
import { FullScreenRoute } from '@intstudio/ds/routes';
import { useOverlayPolicy } from '@intstudio/ds/hooks';

// ❌ Wrong - bypasses elite layer
import { Modal } from 'flowbite-react';
```

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│         Apps (Forms, Playground)        │
│    Consume only @intstudio/ds/*        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         @intstudio/ds (Layer 2)         │
│  ┌──────────┬──────────┬──────────┐    │
│  │   /fb    │ /blocks  │ /routes  │    │
│  │  Elite   │ Curated  │ Bespoke  │    │
│  │ Wrappers │  Blocks  │  Macro   │    │
│  └────┬─────┴─────┬────┴────┬─────┘    │
└───────┼───────────┼─────────┼──────────┘
        │           │         │
┌───────▼───────────▼─────────┴──────────┐
│   Flowbite (Layer 1)                   │
│   flowbite-react + 450+ blocks         │
└──────────────┬─────────────────────────┘
               │
┌──────────────▼─────────────────────────┐
│   @intstudio/tokens (Layer 0)          │
│   CSS vars + Tailwind theme            │
└────────────────────────────────────────┘
```

## Package Structure

```
packages/
  tokens/
    src/
      tokens.css           # CSS variables (single source of truth)
      tailwind-theme.ts    # Tailwind config bridge
      index.ts             # TypeScript constants
    package.json           # Exports: tokens.css, tailwind-theme
    
  ds/
    src/
      fb/                  # Elite wrappers (70% coverage)
        Button.tsx
        Input.tsx
        Select.tsx
        Modal.tsx
        Drawer.tsx
        Dropdown.tsx
        index.ts
      blocks/              # Organized Flowbite blocks
        application/
          tables/
          crud/
          modals/
        marketing/
          hero/
          cta/
          pricing/
        ecommerce/
          cart/
          checkout/
        index.ts
      routes/              # Bespoke macro UX (KEEP)
        FullScreenRoute/
        FlowScaffold/
        RoutePanel/
        index.ts
      hooks/               # Elite hooks (KEEP)
        useOverlayPolicy.ts
        useSubFlow.ts
        useFocusTrap.ts
        index.ts
      index.ts             # Main barrel (re-exports all)
    tsup.config.ts         # Multi-entry build
    package.json           # Sealed exports
    
  core/                    # Zod + RHF glue (optional)
    src/
      Form.tsx             # RHF + zodResolver wrapper
      schema/              # Zod helpers
```

## Sealed Exports (Enforcement)

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./fb": "./dist/fb/index.js",
    "./blocks": "./dist/blocks/index.js",
    "./routes": "./dist/routes/index.js",
    "./hooks": "./dist/hooks/index.js"
  }
}
```

**Blocks deep imports**: Node resolver prevents `@intstudio/ds/src/**` imports.

## Guardrails

### ESLint Rules

```js
{
  'no-restricted-imports': ['error', {
    patterns: [
      {
        group: ['flowbite-react', 'flowbite-react/*'],
        message: 'Import from @intstudio/ds/fb instead'
      },
      {
        group: ['@intstudio/ds/src/*'],
        message: 'Use barrel imports: @intstudio/ds/fb, /routes, /hooks'
      }
    ]
  }]
}
```

### Runtime Contracts

All elite wrappers enforce:
```tsx
if (process.env.NODE_ENV !== 'production' && !ariaLabel) {
  throw new Error('[DS.Component] ariaLabel is required');
}
```

### TypeScript

```tsx
interface EliteModalProps {
  ariaLabel: string;  // Required, not optional
  // ... other props
}
```

## Migration Strategy

### Phase 1: Foundation (Week 1)

- [x] Create `@intstudio/tokens` package
- [x] Install Flowbite packages in `@intstudio/ds`
- [x] Update `package.json` exports structure
- [x] Create tsup multi-entry config
- [ ] Scaffold 5 core elite wrappers: Button, Input, Modal, Drawer, Dropdown

### Phase 2: Elite Wrappers (Week 2-3)

- [ ] Button, Input, Select, Checkbox, Radio (forms)
- [ ] Modal, Drawer, Dropdown, Popover (overlays)
- [ ] Card, Badge, Alert, Toast (display)
- [ ] Navbar, Sidebar, Tabs (navigation)

**Goal**: 20 elite wrappers covering 70% of use cases

### Phase 3: Blocks Organization (Week 4)

- [ ] Move flowbite-react-blocks content to `packages/ds/src/blocks/`
- [ ] Organize by category (application, marketing, ecommerce)
- [ ] Generate index barrels
- [ ] Document in Storybook

### Phase 4: Migration (Week 5-6)

- [ ] Codemod: Replace custom primitives with elite wrappers
- [ ] Update existing forms to use `@intstudio/ds/fb`
- [ ] Deprecate old primitives (JSDoc + ESLint warnings)
- [ ] Update documentation

### Phase 5: Polish (Week 7-8)

- [ ] Flat design theme overrides
- [ ] Storybook with all wrappers + blocks
- [ ] E2E tests for critical flows
- [ ] Performance audit
- [ ] API Extractor stability tracking

## What We Keep (Bespoke)

**DO NOT migrate these** - they're differentiators:

1. **FullScreenRoute** - Mobile-first full-screen modal pattern
2. **FlowScaffold** + **useSubFlow** - URL-bound wizard with step management
3. **RoutePanel** - Desktop persistent panel with responsive behavior
4. **useOverlayPolicy** - Depth/escalation management (unique to our system)
5. **useFocusTrap** - Already hardened beyond Flowbite's capabilities

These represent your **architectural innovation** - Flowbite can't do them well.

## Bundle Impact

**Before** (custom primitives):
- `@intstudio/ds`: ~14KB gzipped

**After** (Flowbite + Elite):
- `@intstudio/tokens`: ~2KB
- `flowbite-react`: ~15KB (tree-shakeable)
- `@intstudio/ds` (elite layer): ~8KB
- **Total**: ~25KB (+11KB)

**Trade-off**: +11KB for:
- ✅ 450+ production-ready blocks
- ✅ Active maintenance (not on us)
- ✅ 10x faster feature development
- ✅ Better defaults

**Mitigation**:
- Tree-shaking (only import used components)
- Lazy loading (code-split overlays)
- Tailwind purge (remove unused utilities)

## Success Metrics

**Quantitative**:
- Time to ship new UI: <50% of previous
- Test coverage: >80% (inherited from Flowbite)
- Bundle size: <30KB total
- Build time: <10s

**Qualitative**:
- Developer velocity: "Fast and confident"
- Consistency: "Looks cohesive across all pages"
- Maintainability: "Upgrades are trivial"
- Quality: "Accessible by default"

## Consequences

### Positive

✅ **10x faster development** - 450+ blocks vs. building from scratch  
✅ **Active maintenance** - Flowbite team handles updates/bugs  
✅ **Better defaults** - Battle-tested accessibility, keyboard nav  
✅ **Focus on business logic** - Not reinventing buttons/modals  
✅ **Systematic quality** - Elite layer enforces our patterns  
✅ **Keep differentiators** - Bespoke routes/hooks remain  
✅ **Easy upgrades** - Apps depend on DS, not Flowbite directly

### Negative

⚠️ **Bundle size increase** - +11KB (mitigated with tree-shaking)  
⚠️ **Tailwind lock-in** - CSS variables still portable, but utilities tied to TW  
⚠️ **Learning curve** - Team needs to learn Flowbite patterns  
⚠️ **Customization limits** - Some behaviors may be hard to override

### Neutral

🔄 **Migration effort** - 6-8 weeks to fully transition  
🔄 **Two-layer abstraction** - Flowbite → Elite → App (clear boundaries)  
🔄 **Block curation** - Need to organize 450+ blocks meaningfully

## Alternatives Considered

### 1. Full Custom (Current State)

**Pros**: Complete control, perfect fit  
**Cons**: Slow, maintenance burden, feature parity lag  
**Verdict**: ❌ Not sustainable at scale

### 2. Headless UI + Custom Styling

**Pros**: Maximum flexibility, smaller bundle  
**Cons**: Still building everything, no block library  
**Verdict**: ❌ Same problem as custom

### 3. Material UI / Chakra UI

**Pros**: Comprehensive, mature ecosystems  
**Cons**: Heavy bundles, different design language, harder to override  
**Verdict**: ❌ Too opinionated, bundle bloat

### 4. Radix UI + shadcn/ui

**Pros**: Modern, composable, good DX  
**Cons**: No block library, still building compositions  
**Verdict**: ⚠️ Good alternative, but less comprehensive than Flowbite

### 5. Flowbite Elite (Chosen)

**Pros**: 450+ blocks, active maintenance, thin elite layer, keeps bespoke  
**Cons**: Tailwind lock-in, +11KB bundle  
**Verdict**: ✅ Best balance of speed, quality, and control

## Rollback Plan

If Flowbite proves too restrictive:

1. **Selective replacement**: Keep Flowbite for 80%, custom for 20%
2. **Elite layer grows**: More overrides in wrapping layer
3. **Headless swap**: Replace Flowbite with Radix under elite layer (same API)
4. **Full rollback**: Remove Flowbite, keep elite layer architecture

The **elite layer abstraction** makes swapping the foundation layer possible without touching apps.

## Related

- **ADR**: `2025-01-24-barrel-import-standardization.md` (import hygiene)
- **Docs**: `packages/tokens/README.md` (token system)
- **Docs**: `packages/ds/README.md` (design system guide)
- **Migration**: Codemods in `scripts/codemods/migrate-to-elite-flowbite.mjs`

## References

- [Flowbite Documentation](https://flowbite.com)
- [Flowbite React](https://flowbite-react.com)
- [Flowbite Blocks](https://flowbite.com/blocks/)
- [Tailwind CSS](https://tailwindcss.com)

---

**Approved by**: Engineering Team  
**Implemented**: 2025-01-24 (in progress)  
**Review Date**: 2025-04-24 (3 months)
