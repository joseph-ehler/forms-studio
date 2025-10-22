# Design Tokens

Design tokens are the **single source of truth** for all visual design decisions in Cascade.

## Philosophy

**Change once, update everywhere.**

Instead of hardcoding values throughout your codebase, tokens provide:
- **Consistency**: Same values used everywhere
- **Theming**: Swap values instantly (light/dark, multi-brand)
- **Maintainability**: Change in one place
- **Type safety**: TypeScript enforces valid values

## Token Categories

### 145 Total Tokens

| Category | Count | Purpose |
|----------|-------|---------|
| **Typography** | 5 | Font sizes, weights |
| **Spacing** | 12 | Gaps, margins, hierarchy |
| **Radius** | 8 | Border radius scale |
| **Interactive** | 33 | Touch targets, states, colors |
| **Colors** | 31 | Semantic, neutral, interactive |
| **Shadows** | 18 | Flat + hover/active elevation |
| **Transitions** | 15 | Durations, easings, motion |
| **Glassmorphism** | 11 | Frosted glass effects |
| **Z-Index** | 12 | Stacking coordination |

## Usage

### TypeScript

```typescript
import { 
  TYPO_TOKENS,
  SPACING_TOKENS,
  COLOR_TOKENS,
  SHADOW_TOKENS,
} from '@cascade/wizard-react/tokens'

// Use in styles
const styles = {
  fontSize: TYPO_TOKENS.size.md,
  padding: SPACING_TOKENS.form.labelGap,
  color: COLOR_TOKENS.interactive.primary,
  boxShadow: SHADOW_TOKENS.hover.medium,
}
```

### CSS Variables

```css
.my-component {
  font-size: var(--ds-label-size);
  padding: var(--ds-label-gap);
  color: var(--color-primary);
  box-shadow: var(--shadow-hover-medium);
}
```

### Design System Classes

```tsx
{/* Tokens already applied */}
<input className="ds-input" />
<button className="ds-button">Submit</button>
```

## Multi-Brand Theming

```html
<!-- Default brand, light theme -->
<html data-brand="default" data-theme="light">

<!-- ACME brand, dark theme -->
<html data-brand="acme" data-theme="dark">

<!-- TechCorp brand, light theme -->
<html data-brand="techcorp" data-theme="light">
```

Same components, different values. Zero code changes.

## Token Snapshot

Every release includes a `contracts/tokens@vX.json` snapshot:
- Golden baseline for diffing
- CI checks for intentional changes
- Requires `tokens-change` label on PRs
- Prevents accidental drift

## Next Steps

- [Typography Tokens →](/tokens/typography)
- [Spacing Tokens →](/tokens/spacing)
- [Color Tokens →](/tokens/colors)
- [Multi-Brand Guide →](/guide/multi-brand)
