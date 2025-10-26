# @intstudio/tokens

Design system tokens - single source of truth for all design values.

## Installation

```bash
pnpm add @intstudio/tokens
```

## Usage

### CSS Variables

Import in your app entry point:

```tsx
import '@intstudio/tokens/tokens.css';
```

All tokens are available as CSS variables:

```css
.my-component {
  padding: var(--ds-space-4);
  background: var(--ds-color-surface-base);
  border: 1px solid var(--ds-color-border-subtle);
  border-radius: var(--ds-radius-lg);
}
```

### Tailwind Configuration

Import in `tailwind.config.js`:

```js
import { tokensTheme } from '@intstudio/tokens/tailwind-theme';

export default {
  theme: {
    extend: tokensTheme
  }
}
```

Then use Tailwind utilities:

```tsx
<div className="p-4 bg-surface-base border border-border-subtle rounded-lg">
  Content
</div>
```

### TypeScript Constants

```tsx
import { tokens } from '@intstudio/tokens';

const zIndex = tokens.zIndex.modal; // 90
const spacing = tokens.space[4];     // '1rem'
```

## Token Categories

- **Spacing**: `--ds-space-*` (0-24)
- **Colors**: `--ds-color-*` (surface, text, border, semantic)
- **Border Radius**: `--ds-radius-*` (sm, md, lg, xl, full)
- **Shadows**: `--ds-shadow-overlay-*` (sm, md, lg, xl) - **flat design, overlays only**
- **Z-Index**: `--ds-z-*` (dropdown, panel, modal, toast, etc.)
- **Typography**: `--ds-text-*`, `--ds-font-*`, `--ds-weight-*`
- **Touch Targets**: `--ds-touch-target` (44px minimum)
- **Transitions**: `--ds-transition-*` (fast, base, slow)

## Design Philosophy

**Flat Design System**:
- NO shadows by default on surfaces
- Borders for visual separation
- Subtle background color changes for hierarchy
- Shadows ONLY on overlays/modals
- Glass variant available for special cases

## Dark Mode

Automatically adapts via `prefers-color-scheme: dark`.

## Reduced Motion

Honors `prefers-reduced-motion: reduce` by disabling transitions.
