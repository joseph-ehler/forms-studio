# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added (30-Day Velocity - Week 1) 🚀 IN PROGRESS

- **CommandPaletteShell** (`shell/micro/CommandPaletteShell/`)
  - ⌘K/Ctrl+K global command interface
  - Uses shortcut broker with 'palette' scope (highest priority)
  - Fuzzy search (simple substring matching)
  - Keyboard navigation (↑/↓, Enter, Esc)
  - Haptics on selection (native platforms)
  - Emits shell events for analytics
  - Composes overlay-policy, focus-policy, shortcut-broker, haptics
  - Zero new behavior - pure composition

### Added (Sprint B - Polish) ✅ COMPLETE

- **RAF Flood Guard** (`shell/behavior/variant-resolver.ts`)
  - Coalesces multiple `applyContract()` calls per frame
  - Prevents DOM thrashing when multiple shells update
  - Single RAF batch processes all pending updates
- **Motion Token CSS Consumption**
  - ModalShell, DrawerShell now use `--motion-duration-*` and `--motion-ease-*`
  - Automatic reduced-motion support via tokens
  - Themeable motion globally
- **OverlaySheet CSS Classes** (`primitives/overlay/OverlaySheet.css`)
  - Replaced inline styles with CSS classes
  - Token-driven backdrop and positioning
  - Better themeability and maintainability
- **aria-labelledby Fallbacks**
  - ModalShell and DrawerShell auto-wire header IDs
  - Better screen reader UX (dialogs announce their titles)
  - Explicit `ariaLabel` prop still works for flexibility

### Added (Phase 3 P0 - God-Tier UX Foundations) ✅ INTEGRATED

- **Global Shortcut Broker** (`shell/behavior/shortcut-broker.ts`)
  - Centralized keyboard shortcut registration with scope priority
  - Automatic precedence: palette > modal > drawer > page
  - Dev-mode debug helpers for testing
  - **Integrated:** ModalShell and DrawerShell now use shortcut broker
- **Haptics Adapter** (`shell/core/environment/useHaptics.ts`)
  - Tactile feedback for native platforms (Capacitor)
  - `impact()`, `selection()`, `notify()` methods
  - Silent no-op fallback on web
- **Motion & Surface Tokens** (`tokens/src/motion-tokens.ts`)
  - Standardized durations: `--motion-duration-1/2/3`
  - Easing curves: `--motion-ease-standard`, `--motion-spring-sheet`
  - Surface colors: `--overlay-scrim-bg`
  - Automatic reduced-motion support
- **Shell Events Bus** (`shell/behavior/shell-events.ts`)
  - Centralized event emission for observability
  - Event types: overlay open/close, sheet bucket, nav toggle, shortcuts
  - Dev-mode event log and debugging
  - **Integrated:** overlay-policy emits overlay:open/overlay:close events
- **Global Loading State** (`shell/core/state/useLoadingState.ts`)
  - Centralized loading state management
  - `GlobalProgressBar` component for AppShell.Header
  - Auto-progress and manual control
  - Ref-counted for concurrent loading operations
  - **Integrated:** GlobalProgressBar now renders in AppShell

### Added (Phase 2)

- **Behavior Layer (Layer 4)**: Centralized overlay, focus, layout, and variant policies
  - `pushOverlay()` - Single overlay stack manager with automatic scrim/lock/inert coordination
  - `setBodyScrollLock()` - Refcounted body scroll lock with iOS bounce prevention
  - `setUnderlayRoot()` - Safe inert targeting for overlay underlays
  - `trapFocus()`, `captureFocus()`, `restoreFocus()` - Focus management with edge case handling
  - `resolveLayout()`, `applyContract()` - Layout decisions and variant publishing
  - `publishShellVars()`, `publishShellAttrs()` - Contract publishers with RAF batching
- **OverlaySheet (Primitive)**: Bottom-anchored overlay mechanics
  - Portal rendering to `document.body` via React `createPortal`
  - Stack coordination via behavior layer
  - No slots, no responsive policy - true Layer 2 primitive
- **BottomSheet (Shell)**: Simplified shell composing OverlaySheet
  - Located at `@intstudio/ds/shell/micro/BottomSheet`
  - Provides slots (Header, Content, Footer)
  - Composes behavior layer policies
  - Gradual migration path from full-featured primitives version
- **Environment Override**: `setShellEnvironment()` for deterministic testing
  - Evented store pattern with subscriptions
  - Exposed as `window.__setShellEnvironment` for Playwright/Storybook
  - Enables reliable visual regression and E2E tests
- **Debug Helpers**: `__overlayDebug` API for canary tests (dev-only)
  - `getOrder()` - Get overlay stack order
  - `getTopmostBlocking()` - Get topmost blocking overlay ID
  - `getLockCount()` - Get refcounted scroll lock count
  - `getStackSize()` - Get total overlays in stack

### Changed

- **ModalShell**: Refactored to use behavior layer policies
  - Removed local scroll-lock implementation → uses `pushOverlay()`
  - Removed local focus trap → uses `trapFocus()` from focus-policy
  - Removed local inert management → handled by overlay-policy
  - Zero code duplication
- **DrawerShell**: Refactored to use behavior layer policies
  - Only registers with overlay stack in overlay mode
  - Removed conditional scroll-lock/inert code
  - Uses centralized focus management
- **PopoverShell**: Updated focus management
  - Uses `captureFocus()` and `restoreFocus()` from focus-policy
  - Non-blocking by design (doesn't call `pushOverlay`)
- **AppShell**: Added underlay root registration
  - Calls `setUnderlayRoot()` on mount for safe inert targeting
  - Prevents accidentally inerting overlay portals
  - Added `id="app-main"` and `data-cq="main"` to Main slot

### Deprecated

- **`@intstudio/ds/primitives/BottomSheet`**: Use `@intstudio/ds/shell/micro/BottomSheet` instead
  - Simplified shell version recommended for new code
  - Full-featured primitives version remains for complex scenarios requiring Vaul features
  - Will be reconsidered in v3.0

### Fixed

- **iOS/Safari scroll lock**: Added `overscroll-behavior: contain` to prevent elastic bounce
- **Focus restore edge cases**: Handles elements removed from DOM or marked inert/hidden
- **Duplicate overlay IDs**: Dev-mode warning prevents stack corruption
- **Underlay inert safety**: Fallback chain prevents inerting overlay portals

### Tooling

- **ESLint**: Prevent app imports from `@intstudio/ds/primitives/*`
  - Enforces boundary: primitives for shells only, apps use shells
  - Added to `.eslintrc.import-hygiene.cjs`
- **Playwright Canaries**: 4 critical behavior validation tests
  - Mode flip via `setShellEnvironment`
  - Single scrim with stacked overlays
  - Z-order matches token strata
  - Container query layout switches

### Documentation

- `BEHAVIOR_LAYER.md` - Complete ownership map and API reference
- `SESSION_2025-01-25_refinements-applied.md` - 7 surgical refinements log
- `SESSION_2025-01-25_phase2-audit.md` - Implementation audit and checklist
- `PHASE_2_EXECUTION_PLAN.md` - Detailed execution plan

---

## [0.4.0] - Previous Release

Initial shell system with AppShell, PageShell, NavShell, and recipes.
