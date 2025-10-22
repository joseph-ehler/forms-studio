# eslint-plugin-cascade

ESLint rules for Cascade Design System. Enforces token usage and prevents drift.

## Installation

```bash
npm install --save-dev eslint-plugin-cascade
```

## Usage

Add to your `.eslintrc.json`:

```json
{
  "extends": ["plugin:cascade/recommended"],
  "plugins": ["cascade"]
}
```

## Rules

### `cascade/no-hardcoded-colors` (error)
Disallow hardcoded RGB/hex colors.

```tsx
// ❌ Bad
<div style={{ color: 'rgb(37, 99, 235)' }} />
<div className="text-blue-500" />

// ✅ Good
<div style={{ color: 'var(--color-primary)' }} />
import { COLOR_TOKENS } from '@/tokens';
```

### `cascade/no-hardcoded-radius` (error)
Disallow Tailwind `rounded-*` classes.

```tsx
// ❌ Bad
<input className="rounded-md" />

// ✅ Good
<input className="ds-input" />  // Includes radius
```

### `cascade/no-hardcoded-spacing` (error)
Disallow `min-h-[*]` arbitrary values.

```tsx
// ❌ Bad
<button className="min-h-[48px]" />

// ✅ Good
<button className="ds-button" />  // 48px min-height built-in
```

### `cascade/no-hardcoded-shadows` (error)
Disallow Tailwind `shadow-*` classes.

```tsx
// ❌ Bad
<button className="shadow-md" />

// ✅ Good
<button className="ds-button" />  // Shadows on hover only (flat design)
```

### `cascade/no-hardcoded-transitions` (error)
Disallow Tailwind `transition-*` classes.

```tsx
// ❌ Bad
<button className="transition-all" />

// ✅ Good
<button className="ds-button" />  // Transitions built-in, respects prefers-reduced-motion
```

### `cascade/use-ds-classes` (error)
Require `ds-input` or `ds-button` classes.

```tsx
// ❌ Bad
<input className="border rounded" />
<button className="bg-blue-500" />

// ✅ Good
<input className="ds-input" />
<button className="ds-button" />
```

### `cascade/no-inline-styles` (warn)
Discourage inline styles.

```tsx
// ⚠️  Warning
<div style={{ marginTop: 16 }} />

// ✅ Good
import { SPACING_TOKENS } from '@/tokens';
<div style={{ marginTop: SPACING_TOKENS.component.md }} />
```

### `cascade/touch-target-size` (error)
Enforce 44px minimum touch targets.

```tsx
// ❌ Bad
<button style={{ height: 20 }}>X</button>

// ✅ Good
<button className="ds-button">Close</button>  // 44px min
```

### `cascade/require-labels` (error)
Require labels for all inputs.

```tsx
// ❌ Bad
<input name="email" />

// ✅ Good
<label htmlFor="email">Email</label>
<input id="email" name="email" className="ds-input" />

// Also good
<input aria-label="Email" className="ds-input" />
```

## Why These Rules?

### Design System Compliance
- Prevents token drift
- Ensures consistent theming
- Makes rebranding instant (CSS var swap)

### Accessibility
- Touch targets meet WCAG AA (44px)
- Inputs always have labels (screen readers)
- Motion respects user preferences

### Performance
- No unused CSS (tree-shakeable)
- Consistent transitions (no jitter)
- Predictable bundle size

## Configuration

### Recommended (Default)
All rules enabled as errors except `no-inline-styles` (warning).

### Custom
```json
{
  "plugins": ["cascade"],
  "rules": {
    "cascade/no-hardcoded-colors": "error",
    "cascade/no-hardcoded-radius": "warn",
    "cascade/use-ds-classes": "off"
  }
}
```

## License

MIT
