---
"@joseph-ehler/wizard-react": minor
---

# Design System Surgical Fixes & Improvements

## Breaking Changes
None - all changes are backwards compatible.

## New Features

### Color Token Migration
- Replaced all hardcoded RGB values with semantic color tokens
- Components now theme-aware (supports light/dark/brand switching)
- Removed `!important` overrides - proper token cascade

### Prose Component (NEW)
- Added `<Prose>` component - THE ONLY place typography gets external margins
- For CMS/markdown content with vertical rhythm
- Size variants: `sm`, `md`, `lg`
- Scoped to `.ds-prose` (can't leak)

### Pure CSS Grid
- Removed Tailwind dependency from Grid component
- Created `ds-grid.css` with pure CSS responsive classes
- Portable to any project without framework lock-in
- Breakpoints: Mobile (1 col) → Tablet (2 cols) → Desktop (3-4 cols)

### System Theme Tracking
- AppProvider now tracks OS theme changes in real-time
- `theme="system"` responds to OS preference changes
- MediaQueryList listener with proper cleanup

### Form Width Consistency
- Aligned `--ds-content-b2c-form` token: 800px → 576px
- Matches FormLayout default (single source of truth)
- Policy: "Forms are single-column and constrained by default"

## Improvements

### Typography
- All atoms now properly neutral (`margin: 0`)
- Label, HelperText, Caption use semantic color tokens
- Dark mode handled by token cascade (no manual overrides)
- Focus styles use `--ds-color-border-focus`

### Spacing System
- FormLayout component for form-optimized layouts (576px, 24px spacing)
- Stack component simplified (removed 'auto', kept tight/normal/relaxed)
- All spacing enforced to 4px grid

### Token System
- Three-layer architecture: Semantic → Alias → Raw
- Runtime switching (no rebuild)
- Theme-aware, brand-swappable, tenant-aware

## Files Changed

### New Files
- `Prose.tsx` - CMS content component
- `ds-prose.css` - Content rhythm styles
- `FormLayout.tsx` - Form-optimized container
- `ds-grid.css` - Pure CSS grid classes

### Modified Files
- `ds-typography.css` - Color tokens, neutralized atoms
- `AppContext.tsx` - OS theme tracking
- `Grid.tsx` - Pure CSS classes
- `shell.vars.css` - Form width alignment (576px)
- `components/index.ts` - Export new components

### Deleted Files
- `ds-spacing.css` - Legacy margin-based system (removed)

## Migration Guide

### No Breaking Changes
All existing code continues to work. New features are additive.

### Recommended Adoption
1. **Forms**: Use `<FormLayout>` for automatic 576px constraint
2. **CMS Content**: Wrap in `<Prose>` for vertical rhythm
3. **Themes**: Set `theme="system"` for OS tracking
4. **Grid**: Tailwind classes automatically work (but pure CSS is now default)

## Documentation
- `DESIGN_SYSTEM_COMPLETE.md` - Full system reference
- `DESIGN_TOKENS_ARCHITECTURE.md` - Token system architecture
- `SPACING_AND_FORMS.md` - Spacing usage guide
- `SURGICAL_FIXES_2025.md` - Detailed fix documentation
