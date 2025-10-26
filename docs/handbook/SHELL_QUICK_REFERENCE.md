# Shell Quick Reference

**One-page cheat sheet for shell selection & composition.**

---

## Decision Tree

```
┌─ Need global app layout (header/nav/main/panels)?
│  → AppShell
│
├─ Need page structure (title/toolbar/content)?
│  → PageShell (inside AppShell.Main)
│
├─ Need list ↔ detail split?
│  → WorkbenchShell (inside PageShell.Content)
│
├─ Need canvas + inspector?
│  → CanvasShell (inside PageShell.Content)
│
├─ Need data table + filters + bulk actions?
│  → DataShell (inside PageShell.Content)
│
├─ Need bottom drawer (mobile-first)?
│  → BottomSheet
│
├─ Need centered dialog (desktop-first)?
│  → ModalShell
│
├─ Need side panel (left/right)?
│  → DrawerShell
│
├─ Need small inspector panel?
│  → PanelShell
│
├─ Need anchored picker/form?
│  → PopoverShell
│
├─ Need right-click menu?
│  → ContextMenuShell
│
├─ Need hint text?
│  → TooltipShell
│
├─ Need global search/actions?
│  → CommandPaletteShell
│
├─ Need notifications?
│  → ToastShell
│
└─ Need bottom tab bar?
   → DockShell
```

---

## Layer Hierarchy

```
┌─────────────────────────────────────────────┐
│ CommandPaletteShell (--z-command: 80)      │ ← Topmost HUD
├─────────────────────────────────────────────┤
│ ToastShell (--z-toast: 70)                  │ ← Notifications
├─────────────────────────────────────────────┤
│ PopoverShell, ContextMenuShell, TooltipShell│ ← Anchored UI
│ (--z-popover: 60)                           │
├─────────────────────────────────────────────┤
│ ModalShell, DrawerShell, PanelShell         │ ← Overlays
│ (--z-shell: 51, --z-scrim: 50)              │
├─────────────────────────────────────────────┤
│ BottomSheet                                 │ ← Bottom drawer
│ (--z-shell: 51, --z-scrim: 50)              │
├─────────────────────────────────────────────┤
│ AppShell (base layer, no z-index)           │ ← Page structure
│  ├─ PageShell                               │
│  │  ├─ WorkbenchShell / CanvasShell         │
│  │  └─ DataShell                            │
└─────────────────────────────────────────────┘
```

---

## Composition Patterns

### Pattern 1: Simple Dashboard

```tsx
<AppShell nav={...}>
  <AppShell.Header><Navbar /></AppShell.Header>
  <AppShell.Nav><Sidebar /></AppShell.Nav>
  <AppShell.Main>
    <PageShell>
      <PageShell.PageHeader>Dashboard</PageShell.PageHeader>
      <PageShell.Content>{/* Cards grid */}</PageShell.Content>
    </PageShell>
  </AppShell.Main>
</AppShell>
```

### Pattern 2: Email Client

```tsx
<AppShell>
  <AppShell.Header><Toolbar /></AppShell.Header>
  <AppShell.Main>
    <WorkbenchShell>
      <WorkbenchShell.Master>{/* Folders */}</WorkbenchShell.Master>
      <WorkbenchShell.Detail>{/* Thread list */}</WorkbenchShell.Detail>
      <WorkbenchShell.Secondary>{/* Email body */}</WorkbenchShell.Secondary>
    </WorkbenchShell>
  </AppShell.Main>
</AppShell>
```

### Pattern 3: Design Tool

```tsx
<AppShell>
  <AppShell.Header><Toolbar /></AppShell.Header>
  <AppShell.Main>
    <CanvasShell>
      <CanvasShell.ToolbarLeft>{/* Drawing tools */}</CanvasShell.ToolbarLeft>
      <CanvasShell.Canvas>{/* Artboard */}</CanvasShell.Canvas>
      <CanvasShell.Inspector>{/* Properties */}</CanvasShell.Inspector>
    </CanvasShell>
  </AppShell.Main>
</AppShell>
```

### Pattern 4: Data Browser

```tsx
<AppShell>
  <AppShell.Header><Navbar /></AppShell.Header>
  <AppShell.Nav><Sidebar /></AppShell.Nav>
  <AppShell.Main>
    <PageShell>
      <PageShell.Toolbar>{/* Search, export */}</PageShell.Toolbar>
      <PageShell.Content>
        <DataShell>
          <DataShell.FiltersRail>{/* Filters */}</DataShell.FiltersRail>
          <DataShell.DataRegion>{/* Table */}</DataShell.DataRegion>
          <DataShell.SelectionBar>{/* Bulk actions */}</DataShell.SelectionBar>
        </DataShell>
      </PageShell.Content>
    </PageShell>
  </AppShell.Main>
</AppShell>
```

---

## Responsive Behavior Matrix

| Shell | Desktop (≥1024px) | Tablet (768-1023px) | Mobile (<768px) |
|-------|-------------------|---------------------|-----------------|
| **AppShell.Nav** | Persistent inline | Off-canvas drawer | Off-canvas drawer |
| **AppShell.Panels** | Inline (optional) | Overlay | Full-screen overlay |
| **AppShell.Dock** | Hidden | Optional | Visible (bottom) |
| **WorkbenchShell** | Resizable splits | Master + Detail swap | Master only → Detail full-screen |
| **CanvasShell.Inspector** | Inline | Overlay | Overlay |
| **DataShell.FiltersRail** | Inline | Drawer | Sheet |
| **BottomSheet** | Optional modal | Bottom drawer | Bottom drawer |
| **ModalShell** | Centered | Centered | Full-screen or bottom |
| **DrawerShell** | Side (pushes content) | Overlay | Overlay |
| **PanelShell** | Inline | Overlay | Overlay |

---

## Slot Contract (All Shells)

### Zero Padding
```tsx
// ❌ WRONG: Shell provides padding
<AppShell.Main className="p-6">
  {children}
</AppShell.Main>

// ✅ CORRECT: Your content provides padding
<AppShell.Main>
  <div className="p-6">
    {children}
  </div>
</AppShell.Main>
```

### Full-Bleed Available
```tsx
// Full-bleed hero image
<PageShell.Content>
  <img src="/hero.jpg" className="w-full" />
  <div className="p-6">
    {/* Content with padding */}
  </div>
</PageShell.Content>
```

---

## CSS Variables by Shell

### AppShell
```css
--shell-nav-w       /* 280px → 0 (mobile) */
--shell-panels-w    /* 360px */
--shell-header-h    /* 56px */
--shell-dock-h      /* 0 → 64px (mobile) */
--shell-gutter      /* 16px */
--shell-safe-*      /* iOS safe-area insets */
```

### PageShell
```css
--page-header-h     /* 80px */
--page-toolbar-h    /* 48px */
--page-gutter       /* 24px → 16px (mobile) */
--page-aside-w      /* 280px */
```

### WorkbenchShell
```css
--split-master      /* 320px or % */
--split-detail      /* 1fr or % */
--split-secondary   /* 280px */
--splitter-size     /* 4px */
```

### CanvasShell
```css
--canvas-inspector-w  /* 320px */
--canvas-toolbar-h    /* 48px */
--canvas-palette-w    /* 56px */
```

### DataShell
```css
--data-filters-w      /* 280px */
--data-toolbar-h      /* 56px */
--data-selection-h    /* 64px */
```

---

## Data Attributes (Global)

Set on `<html>` by `AppShell`:

```css
[data-shell-mode="desktop"]   /* ≥1024px */
[data-shell-mode="tablet"]    /* 768-1023px */
[data-shell-mode="mobile"]    /* <768px */

[data-pointer="fine"]         /* Mouse/trackpad */
[data-pointer="coarse"]       /* Touch */

[data-density="compact"]      /* Dense UI */
[data-density="comfortable"]  /* Spacious UI */

[data-nav-open="true"]        /* Nav visible */
[data-nav-open="false"]       /* Nav hidden */
```

**Usage:**
```css
/* Adjust for touch */
:root[data-pointer="coarse"] .button {
  min-height: 44px;
}

/* Mobile-specific */
:root[data-shell-mode="mobile"] .toolbar {
  flex-direction: column;
}
```

---

## Hooks API

### useAppEnvironment()
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

### useNav()
```tsx
const { open, toggle } = useNav();
<button onClick={toggle}>Toggle Nav</button>
```

### usePanels()
```tsx
const { panels, open, close, toggle } = usePanels();
open({ id: 'inspector', title: 'Inspector' });
```

---

## Flowbite Component Mapping

| Flowbite Component | Shell Slot |
|--------------------|------------|
| `Navbar` | `AppShell.Header` |
| `Sidebar` | `AppShell.Nav` |
| `Breadcrumb` | `PageShell.PageHeader` |
| `Tabs` | `PageShell.Toolbar` |
| `Table` | `DataShell.DataRegion` |
| `Pagination` | `PageShell.PageFooter` |
| `Button` | Any (themed by tokens) |
| `Select`, `Input` | `PageShell.Toolbar` or forms |
| `Card` | `PageShell.Content` |
| `Modal` (Flowbite) | ❌ Use `ModalShell` instead |
| `Drawer` (Flowbite) | ❌ Use `DrawerShell` instead |

**Why not use Flowbite's Modal/Drawer?**
- Our shells manage z-index, inert, scroll-lock, focus trap, safe-area consistently
- Flowbite components go **inside** our shells as content

---

## Implementation Priority

### ✅ Shipped
1. AppShell
2. BottomSheet

### 🚧 Next (Phase 1)
3. PageShell
4. NavShell
5. ModalShell

### 📋 Backlog (Phase 2)
6. DrawerShell
7. PopoverShell
8. TooltipShell
9. WorkbenchShell

### 🎯 Future (Phase 3)
10. CanvasShell
11. DataShell
12. ContextMenuShell
13. CommandPaletteShell
14. ToastShell
15. PanelShell
16. DockShell
17. HeaderShell

---

## Common Mistakes

### ❌ Styling Shells Directly
```tsx
// WRONG: Adding colors to shell
<AppShell className="bg-gray-100">
```

**Fix:** Style Flowbite components inside slots.

### ❌ Hardcoding Breakpoints
```tsx
// WRONG: Manual media queries
if (window.innerWidth < 768) { ... }
```

**Fix:** Use `useAppEnvironment()` hook.

### ❌ Manual Nav State
```tsx
// WRONG: Own state for nav
const [navOpen, setNavOpen] = useState(true);
```

**Fix:** Use `useNav()` hook (auto-wired).

### ❌ Adding Padding to Slots
```tsx
// WRONG: Shell adds padding
<AppShell.Main className="p-6">
```

**Fix:** Your content provides padding.

### ❌ Ignoring Safe-Area
```tsx
// WRONG: Fixed bottom bar without safe-area
<div className="fixed bottom-0">
```

**Fix:** Check `env.safeArea.bottom` for iOS home indicator.

---

## Testing Checklist

When building a new shell:

- [ ] Desktop layout (≥1024px)
- [ ] Tablet layout (768-1023px)
- [ ] Mobile layout (<768px)
- [ ] Pointer: fine (mouse)
- [ ] Pointer: coarse (touch)
- [ ] Safe-area insets (iOS notch/home indicator)
- [ ] Reduced motion (`prefers-reduced-motion`)
- [ ] RTL support (`dir="rtl"`)
- [ ] Keyboard navigation (Tab, ESC, arrow keys)
- [ ] Focus trap (overlays)
- [ ] Scroll lock (overlays)
- [ ] Z-index layering (multiple overlays)
- [ ] Container queries (if applicable)

---

## Resources

- [SHELL_SYSTEM.md](./SHELL_SYSTEM.md) - Complete taxonomy
- [APPSHELL_SYSTEM.md](./APPSHELL_SYSTEM.md) - AppShell deep dive
- [APPSHELL_QUICKSTART.md](./APPSHELL_QUICKSTART.md) - 5-minute setup
- [DS Tokens](../tokens/README.md) - Design tokens reference
- [Flowbite React](https://flowbite-react.com) - Component library
