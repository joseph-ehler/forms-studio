# AppShell System - Headless Layout Coordinator

**Version:** 1.0.0  
**Status:** ✅ Production Ready

## Overview

AppShell is a **thin, headless layout frame** that orchestrates macro-structure (regions, responsive behavior, layout state) without owning component visuals. It composes beautifully with Flowbite and your DS tokens to create adaptive UIs that scale from desktop → tablet → mobile with a configurable "web vs native" dial.

## Philosophy

### What AppShell Owns
- **Structure**: Global regions (Header/Nav/Main/Panels/Dock/Footer)
- **Responsive behavior**: Breakpoint & pointer-modality rules, off-canvas behaviors
- **Layout state**: collapsed nav, active panels, split sizes, safe-area, z-index
- **System effects**: scroll locking, inert, keyboard shortcuts mount point
- **Data publication**: `--shell-*` CSS vars and `data-*` attributes

### What AppShell Does NOT Own
- Component visuals (colors/typography/buttons) → **Your DS Tokens**
- Page content / business logic → **Your App**
- Component internals → **Flowbite (themed by tokens)**

**AppShell is a frame, not a skin.**

## Architecture

```
┌─────────────────────────────────────────┐
│ AppShell (owns layout & behavior)      │
│   ↓ publishes CSS vars & data-*        │
│   ↓ provides slots                      │
├─────────────────────────────────────────┤
│ Flowbite Components (themed by tokens) │
│   ↓ mounted inside slots                │
│   ↓ adapt via CSS vars/data-*          │
├─────────────────────────────────────────┤
│ Your Content (pages, forms, data)      │
└─────────────────────────────────────────┘
```

## Core API

### AppShell Component

```tsx
<AppShell
  nav={{ collapsible: true, defaultOpen: true, width: 280 }}
  panels={{ side: 'right', width: 360, overlayOn: ['tablet', 'mobile'] }}
  dock={{ position: 'bottom', visible: { mobile: true, desktop: false } }}
  header={{ height: 56, sticky: true }}
  breakpoints={{ sm: 640, md: 768, lg: 1024, xl: 1280 }}
  onLayoutChange={(state) => console.log(state)}
>
  <AppShell.Header>
    {/* Flowbite Navbar themed by DS tokens */}
  </AppShell.Header>

  <AppShell.Nav>
    {/* Flowbite Sidebar; AppShell controls collapsed state */}
  </AppShell.Nav>

  <AppShell.Main>
    {/* Your routed pages; AppShell provides container queries */}
  </AppShell.Main>

  <AppShell.Panels>
    {/* Right inspector / AI assistant panels */}
  </AppShell.Panels>

  <AppShell.Dock>
    {/* Bottom dock/toolbelt or tab bar on mobile */}
  </AppShell.Dock>

  <AppShell.Footer>
    {/* Optional app footer */}
  </AppShell.Footer>
</AppShell>
```

### Hooks

#### `useAppEnvironment()`

Single source of truth for device capabilities and breakpoints.

```tsx
const env = useAppEnvironment();
// {
//   mode: 'desktop' | 'tablet' | 'mobile',
//   pointer: 'fine' | 'coarse',
//   density: 'compact' | 'comfortable',
//   viewportWidth: 1440,
//   isNative: false,
//   safeArea: { top: 0, bottom: 0, left: 0, right: 0 }
// }
```

#### `useNav()`

Access nav state from anywhere in the shell.

```tsx
const { open, toggle } = useNav();
<button onClick={toggle}>
  {open ? 'Close' : 'Open'} Nav
</button>
```

#### `usePanels()`

Manage active panels (inspector, AI assistant, etc.).

```tsx
const { panels, open, close, toggle } = usePanels();

// Open inspector
open({ id: 'inspector', title: 'Inspector', closeable: true });

// Toggle AI assistant
toggle({ id: 'ai', title: 'AI Assistant' });
```

## Responsive Behavior

### Breakpoints & Modes

| Viewport Width | Mode      | Nav Behavior       | Panels Behavior  |
|----------------|-----------|-------------------|------------------|
| < 768px        | `mobile`  | Off-canvas drawer | Full-screen overlay |
| 768px - 1024px | `tablet`  | Off-canvas drawer | Slide-over overlay |
| ≥ 1024px       | `desktop` | Persistent inline | Inline (optional overlay) |

### Pointer Modality

- **Fine (mouse)**: Compact density, hover affordances, focus rings
- **Coarse (touch)**: Comfortable density, larger hit targets, gestures

### Auto-Adaptations

AppShell automatically:
1. Reads viewport width & pointer type
2. Sets `data-shell-mode`, `data-pointer`, `data-density` on `<html>`
3. Publishes `--shell-nav-w`, `--shell-panels-w`, `--shell-header-h` CSS vars
4. Adjusts grid layout (persistent vs off-canvas nav)
5. Manages backdrop/scrim for overlays
6. Respects safe-area insets (Capacitor/native apps)

## Recipes

Pre-built compositions for common app layouts.

### DashboardShell

Classic app layout: persistent nav + header + main grid.

```tsx
<DashboardShell
  header={<MyNavbar />}
  nav={<MySidebar />}
>
  <DashboardContent />
</DashboardShell>
```

**Use cases:** Admin panels, analytics dashboards, settings pages.

### WorkbenchShell

Content-heavy layout: collapsible nav + split main + right panels.

```tsx
<WorkbenchShell
  header={<Toolbar />}
  nav={<ProjectTree />}
  panels={<Inspector />}
>
  <SplitView left={<FileList />} right={<FileDetail />} />
</WorkbenchShell>
```

**Use cases:** Email clients, project management, file browsers, IDEs.

## CSS Variables Published

AppShell publishes these CSS vars for adaptive styling:

| Variable | Description | Example |
|----------|-------------|---------|
| `--shell-nav-w` | Nav width | `280px` |
| `--shell-panels-w` | Panels width | `360px` |
| `--shell-header-h` | Header height | `56px` |
| `--shell-dock-size` | Dock size | `56px` |
| `--shell-safe-top` | Safe area top | `44px` (iOS notch) |
| `--shell-safe-bottom` | Safe area bottom | `34px` (iOS home indicator) |
| `--shell-safe-left` | Safe area left | `0px` |
| `--shell-safe-right` | Safe area right | `0px` |

## Data Attributes Published

AppShell sets these on `<html>` for adaptive CSS:

| Attribute | Values | Usage |
|-----------|--------|-------|
| `data-shell-mode` | `desktop` \| `tablet` \| `mobile` | Breakpoint-based layout |
| `data-pointer` | `fine` \| `coarse` | Touch vs mouse |
| `data-density` | `compact` \| `comfortable` | Spacing scale |
| `data-nav-open` | `true` \| `false` | Nav visibility state |

### Example Usage

```css
/* Adjust spacing for touch devices */
:root[data-pointer="coarse"] .my-component {
  padding: var(--ds-space-6); /* More generous */
}

/* Mobile-specific styles */
:root[data-shell-mode="mobile"] .my-toolbar {
  flex-direction: column;
}
```

## Integration with Flowbite

### 1. Theme Flowbite with Your Tokens

```tsx
// Tailwind config
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--ds-primary-10)',
        'primary-hover': 'var(--ds-primary-9)',
        // ... map all DS tokens
      }
    }
  }
}
```

### 2. Mount Flowbite in Slots

```tsx
import { Navbar, Sidebar } from 'flowbite-react';

<AppShell.Header>
  <Navbar fluid className="bg-surface-base border-b">
    {/* Logo, search, user menu */}
  </Navbar>
</AppShell.Header>

<AppShell.Nav>
  <Sidebar>
    <Sidebar.Items>
      {/* Nav links */}
    </Sidebar.Items>
  </Sidebar>
</AppShell.Nav>
```

### 3. AppShell Manages State

- **Nav collapse**: `useNav()` hook provides `toggle()`
- **Panel overlays**: `usePanels()` hook provides `open()`, `close()`
- **Responsive behavior**: Automatic via `data-shell-mode`

## Native-Feel Dial

### Desktop (pointer: fine)
- Focus rings visible
- Hover affordances
- Keyboard shortcuts (⌘K for command palette)
- Resizable splits
- Precise scrollbars

### Mobile (pointer: coarse, mode: mobile)
- Larger hit targets (min 44px)
- Gesture-driven panels/drawers
- Haptic feedback (via Capacitor)
- Safe-area insets respected
- Bottom action bar (Dock)

### Automatic Adaptations

```tsx
const env = useAppEnvironment();

// Auto density
if (env.pointer === 'coarse') {
  // Comfortable spacing, larger buttons
}

// Auto haptics
if (env.isNative) {
  haptic('light'); // from capabilities/platform
}

// Auto safe-area
if (env.safeArea.bottom > 0) {
  // Add padding for iOS home indicator
}
```

## Best Practices

### ✅ Do

- **Use slots for content**: `<AppShell.Main>` wraps your pages
- **Let AppShell manage state**: `useNav()`, `usePanels()` hooks
- **Theme Flowbite with tokens**: Consistent visuals across shell + components
- **Leverage CSS vars**: `var(--shell-nav-w)` for adaptive layouts
- **Persist nav state**: `nav={{ persistKey: 'my-app-nav' }}`

### ❌ Don't

- **Don't style AppShell directly**: It's structure-only; style Flowbite components inside slots
- **Don't hardcode breakpoints**: Use `useAppEnvironment()` hook
- **Don't manually wire nav toggle**: `useNav()` auto-wires it
- **Don't ignore safe-area**: Check `env.safeArea` for native apps

## File Structure

```
packages/ds/src/shell/
├── AppShell.tsx          # Core component + slots
├── AppShell.css          # Structural grid CSS
├── useAppEnvironment.ts  # Device/breakpoint detection
├── usePanels.tsx         # Panels state management
├── recipes/
│   ├── DashboardShell.tsx
│   └── WorkbenchShell.tsx
└── index.ts              # Barrel exports
```

## Testing

AppShell includes:
- **Type safety**: Full TypeScript coverage
- **SSR-safe**: No `window` access during render
- **Reduced motion**: Respects `prefers-reduced-motion`
- **RTL support**: Logical properties (`inset-inline`, `padding-inline`)

## Performance

- **Zero JS overhead**: CSS Grid + CSS vars do the heavy lifting
- **Lazy slot rendering**: Slots not in DOM until provided
- **Efficient updates**: CSS var changes don't trigger re-renders
- **Tree-shakeable**: Import only what you need

## Migration from Existing Layouts

### From Manual Grid

```tsx
// Before: Manual grid layout
<div className="grid grid-cols-[280px_1fr]">
  <aside>Nav</aside>
  <main>Content</main>
</div>

// After: AppShell
<AppShell nav={{ width: 280 }}>
  <AppShell.Nav>Nav</AppShell.Nav>
  <AppShell.Main>Content</AppShell.Main>
</AppShell>
```

### From Mantine/Chakra AppShell

```tsx
// Before: Mantine AppShell (tight coupling)
<MantineAppShell navbar={<Navbar />} header={<Header />}>
  {children}
</MantineAppShell>

// After: Our AppShell (slots + Flowbite freedom)
<AppShell>
  <AppShell.Header>{/* Flowbite Navbar */}</AppShell.Header>
  <AppShell.Nav>{/* Flowbite Sidebar */}</AppShell.Nav>
  <AppShell.Main>{children}</AppShell.Main>
</AppShell>
```

## Future Enhancements

- **Command Palette mount**: Global `⌘K` shortcut registry
- **Shortcut system**: Per-shell keyboard accelerators
- **Dock badges**: Notification counts on dock items
- **Panel stacks**: Multiple panels with tab bar
- **Split panes**: Resizable splitters in Main

## Summary

AppShell is a **simple, high-leverage primitive** that solves macro-layout once. It's:

- **Headless**: You control the visuals via tokens + Flowbite
- **Responsive**: Desktop/tablet/mobile auto-adaptations
- **Adaptive**: "Web vs native" feel via pointer + Capacitor
- **Composable**: Slots + hooks + recipes for velocity
- **Battle-tested**: Follows same patterns as OverlayPicker, Sheet, Routes

**One shell, infinite compositions—desktop to mobile—with tokens + Flowbite.**
