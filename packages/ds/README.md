# @intstudio/ds

**Design System Core** - Route shells, hooks, and design tokens.

## What's Inside

### Routes (Application Structure)
- `FullScreenRoute` - Full-screen modal dialogs
- `RoutePanel` - Side panels (desktop)
- `FlowScaffold` - Multi-step wizards

### Hooks (Behavioral Logic)
- `useFocusTrap` - Auto focus management
- `useSubFlow` - Multi-step state + URL sync
- `useOverlayPolicy` - Overlay behavior context
- `useStackPolicy` - Stack management
- `useTelemetry` - Event tracking
- `useDeviceType` - Device detection

### Tokens (Design DNA)
- Colors, spacing, shadows, z-index, typography
- All CSS custom properties (`--ds-*`)

## Usage

```tsx
import { FullScreenRoute } from '@intstudio/ds';

export function MyRoute() {
  return (
    <FullScreenRoute ariaLabel="Settings">
      <div className="p-6">
        {/* Your content */}
      </div>
    </FullScreenRoute>
  );
}
```

## Philosophy

This package contains **only the high-value IP**:
- Route shells (macro UX patterns)
- Behavioral hooks (reusable logic)
- Design tokens (visual consistency)

For form fields, use `@intstudio/ui-bridge` (Flowbite wrappers).

---

**Minimal. Focused. Fast.**
