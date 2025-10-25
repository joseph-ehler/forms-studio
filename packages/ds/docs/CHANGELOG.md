# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2025-10-24

### Added ✨

- **Button (Token-only)**: Production-grade implementation replacing Flowbite wrapper
  - RGB triplets for alpha channels (focus rings, scrims)
  - State tokens (--ds-state-hover-bg, --ds-state-active-bg, etc.)
  - Density tokens (--ds-space-control-y, --ds-radius-control)
  - Layer tokens (--ds-scrim, --ds-elevation-overlay)
  - 4 variants: primary, secondary, ghost, danger
  - 3 sizes: sm, md, lg (bound to density tokens)
  - Icon slots (left/right) with auto-padding
  - Loading state with spinner + aria-busy
  - Smooth hover/active/focus transitions (150ms cubic-bezier)
  - Reduced motion support (@media prefers-reduced-motion)
  - High contrast mode ready
  - Comprehensive Storybook stories with interaction tests
  
- **Token System Upgrades**:
  - RGB triplets for all brand colors (primary, danger, success, etc.)
  - State tokens for consistent interactions
  - Density control tokens for app-wide ergonomics
  - Layer tokens for flat design separation
  
- **Deprecation System**: Systematic workflow for phasing out old implementations
  - `deprecated()` utility for marking components
  - `deprecations.json` registry
  - Runtime warnings in dev mode
  - Migration guides in `docs/migrations/`

### Changed 🔄

- **Button**: Switched from Flowbite wrapper to token-only implementation
  - API remains identical (no breaking changes)
  - Visual improvements: smoother transitions, primary-colored focus rings
  - Removed cyan color bleed from Flowbite defaults
  
### Deprecated ⚠️

- **Button (Flowbite wrapper)**: Removed immediately in favor of token-only version
  - No migration needed - API is identical
  - Visual improvements only
  - Old files deleted (Button.old.tsx)

### Infrastructure 🔧

- Removed `flowbite.css` from playground (using token-only components)
- Added Tailwind safelist for dynamic classes
- Added `cookie` dependency to fix Vite warnings
- Updated focus ring colors to use primary instead of cyan

---

## [0.3.0] - 2025-10-23

### Added

- Field wrapper with automatic ARIA wiring
- Modal with focus trap
- Drawer component
- Input, Select, Stack primitives
- TableRowActions dropdown

---

## [0.2.0] - Initial Release

- Basic Flowbite wrappers
- Design tokens package
- Tailwind theme integration
