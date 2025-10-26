# AppShell Quick Start

Get a full-featured app layout running in 5 minutes.

## Installation

Already included in `@intstudio/ds` v2.0+.

```bash
pnpm add @intstudio/ds
```

## Step 1: Basic Setup (Dashboard)

```tsx
import { DashboardShell } from '@intstudio/ds';
import { Navbar, Sidebar } from 'flowbite-react';

export function App() {
  return (
    <DashboardShell
      header={
        <Navbar fluid className="border-b">
          <Navbar.Brand href="/">
            <img src="/logo.svg" alt="Logo" className="h-8" />
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Navbar.Link href="/dashboard">Dashboard</Navbar.Link>
            <Navbar.Link href="/settings">Settings</Navbar.Link>
          </Navbar.Collapse>
        </Navbar>
      }
      nav={
        <Sidebar>
          <Sidebar.Items>
            <Sidebar.ItemGroup>
              <Sidebar.Item href="/dashboard" icon={HomeIcon}>
                Dashboard
              </Sidebar.Item>
              <Sidebar.Item href="/projects" icon={FolderIcon}>
                Projects
              </Sidebar.Item>
            </Sidebar.ItemGroup>
          </Sidebar.Items>
        </Sidebar>
      }
    >
      {/* Your routed content */}
      <Outlet />
    </DashboardShell>
  );
}
```

**That's it!** You now have:
- ✅ Responsive nav (persistent on desktop, drawer on mobile)
- ✅ Sticky header
- ✅ Collapsible sidebar with localStorage persistence
- ✅ Automatic breakpoint adaptations
- ✅ Safe-area support for native apps

## Step 2: Add Nav Toggle Button

```tsx
import { useNav } from '@intstudio/ds';

function NavToggleButton() {
  const { open, toggle } = useNav();
  
  return (
    <button onClick={toggle} className="md:hidden">
      {open ? <XIcon /> : <MenuIcon />}
    </button>
  );
}

// Add to your Navbar
<Navbar.Brand>
  <NavToggleButton />
  <img src="/logo.svg" alt="Logo" />
</Navbar.Brand>
```

## Step 3: Add Right Panel (Workbench)

For apps with inspectors or AI assistants:

```tsx
import { WorkbenchShell, usePanels } from '@intstudio/ds';

export function App() {
  return (
    <WorkbenchShell
      header={<MyToolbar />}
      nav={<MySidebar />}
      panels={<InspectorPanel />}
    >
      <Outlet />
    </WorkbenchShell>
  );
}

// Toggle inspector from anywhere
function ToggleInspectorButton() {
  const { toggle } = usePanels();
  
  return (
    <button onClick={() => toggle({ id: 'inspector', title: 'Inspector' })}>
      <InspectorIcon />
    </button>
  );
}
```

## Step 4: Adapt to Device Capabilities

```tsx
import { useAppEnvironment } from '@intstudio/ds';

function MyComponent() {
  const env = useAppEnvironment();
  
  // Adapt UI based on mode
  if (env.mode === 'mobile') {
    return <MobileView />;
  }
  
  // Adjust spacing for touch
  const spacing = env.pointer === 'coarse' ? 'p-6' : 'p-4';
  
  return (
    <div className={spacing}>
      {/* Your content */}
    </div>
  );
}
```

## Step 5: Add Bottom Dock (Mobile)

```tsx
<AppShell
  dock={{
    position: 'bottom',
    visible: { mobile: true, desktop: false },
    size: 64
  }}
>
  {/* ... other slots */}
  
  <AppShell.Dock>
    <nav className="flex justify-around items-center h-full">
      <DockButton icon={HomeIcon} label="Home" href="/" />
      <DockButton icon={SearchIcon} label="Search" href="/search" />
      <DockButton icon={ProfileIcon} label="Profile" href="/profile" />
    </nav>
  </AppShell.Dock>
</AppShell>
```

## Common Patterns

### Persist Nav State

```tsx
<DashboardShell
  navConfig={{
    persistKey: 'my-app-nav', // Saves to localStorage
    defaultOpen: true
  }}
/>
```

### Custom Breakpoints

```tsx
<AppShell
  breakpoints={{
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  }}
/>
```

### Listen to Layout Changes

```tsx
<AppShell
  onLayoutChange={(state) => {
    console.log('Mode:', state.mode); // desktop/tablet/mobile
    console.log('Nav open:', state.navOpen);
    console.log('Active panels:', state.activePanels);
  }}
/>
```

### Adaptive Styling with CSS

```css
/* Touch-friendly spacing */
:root[data-pointer="coarse"] .my-button {
  min-height: 44px;
  padding: 12px 24px;
}

/* Mobile layout adjustments */
:root[data-shell-mode="mobile"] .my-grid {
  grid-template-columns: 1fr;
}

/* Desktop-only features */
:root[data-shell-mode="desktop"] .my-splitter {
  display: block;
}
```

## Recipes Comparison

| Recipe | Nav | Panels | Dock | Use Case |
|--------|-----|--------|------|----------|
| **DashboardShell** | Persistent | No | Optional | Admin, analytics, settings |
| **WorkbenchShell** | Collapsible | Right overlay | No | Email, IDE, project mgmt |

## Next Steps

- Read [APPSHELL_SYSTEM.md](./APPSHELL_SYSTEM.md) for full API reference
- See [Flowbite React docs](https://flowbite-react.com) for component library
- Check [DS Tokens](../tokens/README.md) for theming

## Troubleshooting

### Nav not collapsing on mobile?

Check that `nav.collapsible` is `true` and verify `data-shell-mode` is set on `<html>`.

### Panels not overlaying on tablet?

Ensure `panels.overlayOn` includes `'tablet'`.

### Safe-area not working?

Verify you're running in Capacitor and have `viewport-fit=cover` in your `<meta>` tag:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

### Layout changes not persisting?

Set `nav.persistKey` to enable localStorage persistence.

## Example Apps

See working examples in:
- `apps/demo-app/` - Dashboard with all features
- `apps/workbench-demo/` - Workbench with panels
