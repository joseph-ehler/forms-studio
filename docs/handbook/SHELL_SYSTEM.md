# Shell System - Complete Taxonomy

**Version:** 1.0.0  
**Philosophy:** Frames, not skins

---

## Mental Model

**Shells are containers (flex/grid) + behaviors.**

They provide:
- ✅ Layout structure (regions via flex/grid)
- ✅ Responsive behavior (breakpoints, off-canvas, overlay)
- ✅ System effects (z-index, inert, scroll-lock, safe-area)
- ✅ Contract (slots with zero padding, CSS vars, data attributes)

They do NOT provide:
- ❌ Colors/typography/visual styling → **DS tokens**
- ❌ Component visuals → **Flowbite (themed by tokens)**
- ❌ Content padding → **Your components**

```tsx
// Shell = frame
<AppShell>
  <AppShell.Header>{/* Flowbite Navbar (styled by tokens) */}</AppShell.Header>
  <AppShell.Main>{/* Your content (provides padding) */}</AppShell.Main>
</AppShell>
```

```css
/* Shell CSS = structure only */
.app-shell {
  display: grid;
  grid-template-areas: "header header" "nav main";
  grid-template-columns: var(--shell-nav-w, 280px) 1fr;
  /* NO colors, NO padding inside slots */
}
```

---

## 0. Cross-Cutting Rules (All Shells)

Every shell in the system follows these invariants:

### Owns
- **Regions**: Layout areas (Header/Body/Footer, Nav/Main/Panels, etc.)
- **Positioning**: Flex/grid structure, off-canvas, overlay mechanics
- **Behavior**: Responsive breakpoints, pointer modality adaptations
- **System effects**: Z-index, inert, scroll-lock, focus trap, safe-area
- **Contract**: CSS variables (`--shell-*`), data attributes (`data-shell-*`)

### Doesn't Own
- **Colors/typography**: Your DS tokens provide these
- **Component visuals**: Flowbite provides these (themed by tokens)
- **Content padding**: Slots are zero-padding; your components provide spacing

### Slots
- Every shell exposes **minimal slots** (Header/Body/Footer, etc.)
- **Zero padding by default**: Your content provides padding
- **Full-bleed available**: Components can paint edge-to-edge if needed

### Environment
- All shells can read `useAppEnvironment()` (mode, pointer, density)
- Shells adapt automatically based on device capabilities
- Override via explicit props when needed

---

## Taxonomy (Macro → Micro)

### Macro Shells (App-Level)

Global layout coordinators that own the page OS.

#### 1. AppShell
**Purpose:** Global layout OS for entire application.

**Slots:**
- `Header` - Top app bar (logo, search, user menu)
- `Nav` - Left sidebar (persistent or off-canvas)
- `Main` - Primary content region (routed pages)
- `Panels` - Right inspector/utility panels (inline or overlay)
- `Dock` - Bottom/side action bar (mobile)
- `Footer` - App footer (optional)

**Behavior:**
- Desktop: Persistent nav + inline panels
- Tablet: Off-canvas nav + overlay panels
- Mobile: Full-height nav drawer + full-screen panels + bottom dock

**CSS Variables:**
```css
--shell-nav-w       /* Nav width (280px desktop, 0 mobile) */
--shell-panels-w    /* Panels width (360px) */
--shell-header-h    /* Header height (56px) */
--shell-dock-h      /* Dock height (0 desktop, 64px mobile) */
--shell-gutter      /* Content gutter (16px) */
--shell-safe-top    /* Safe area top (iOS notch) */
--shell-safe-bottom /* Safe area bottom (iOS home indicator) */
--shell-safe-left
--shell-safe-right
```

**Data Attributes:**
```css
data-shell-mode     /* desktop | tablet | mobile */
data-pointer        /* fine | coarse */
data-density        /* compact | comfortable */
data-nav-open       /* true | false */
```

**When:** Every page uses this as the root layout.

**Flowbite Integration:**
- `Header` → Flowbite `Navbar`
- `Nav` → Flowbite `Sidebar`
- `Main` → Your pages with `Tabs`, `Tables`, etc.

---

#### 2. PageShell
**Purpose:** Page-level structure inside `AppShell.Main`.

**Slots:**
- `PageHeader` - Page title, breadcrumbs, actions
- `Toolbar` - Filters, search, view toggles
- `Content` - Main page content
- `PageAside` - Secondary info rail (optional)
- `PageFooter` - Page-level actions/pagination

**Behavior:**
- Keeps page chrome (title, breadcrumbs, toolbar) consistent
- `Toolbar` sticks on scroll (optional)
- `PageAside` inline on desktop, drawer on mobile

**CSS Variables:**
```css
--page-header-h     /* Page header height (80px) */
--page-toolbar-h    /* Toolbar height (48px) */
--page-gutter       /* Content padding (24px desktop, 16px mobile) */
--page-aside-w      /* Aside width (280px) */
```

**Data Attributes:**
```css
data-page-layout    /* default | wide | narrow */
data-toolbar-sticky /* true | false */
```

**Recipes:**
- Dashboard page (metrics grid + filters)
- CRUD page (table + toolbar + actions)
- Report page (header + filters + visualization)

**Flowbite Integration:**
- `PageHeader` → `Breadcrumb`, `Button` group
- `Toolbar` → `Tabs`, `Pills`, `SearchInput`, `Select`
- `Content` → `Table`, `Card` grid, `Timeline`

---

### Meso Shells (Workspace Patterns)

Productivity layouts for browse/edit, canvas/inspector, data-heavy flows.

#### 3. WorkbenchShell
**Purpose:** List ↔ detail split panes for "browse + edit" workflows.

**Slots:**
- `Master` - List/tree (folders, items, threads)
- `Detail` - Selected item detail/editor
- `Secondary` - Optional third pane (preview, metadata)

**Behavior:**
- Desktop: Resizable splits (persistent)
- Tablet: Master + Detail (swipe or overlay)
- Mobile: Master only; Detail full-screen on selection

**CSS Variables:**
```css
--split-master      /* Master width (320px or %) */
--split-detail      /* Detail width (1fr or %) */
--split-secondary   /* Secondary width (280px) */
--splitter-size     /* Drag handle size (4px) */
```

**Recipes:**
- Email (folders / list / detail)
- Files (tree / list / preview)
- Issues (board / detail / comments)

---

#### 4. CanvasShell
**Purpose:** Full-bleed working surface with inspector (design, map, chart).

**Slots:**
- `Canvas` - Full-bleed working area (map, artboard, chart)
- `Inspector` - Right properties panel
- `ToolbarTop` - Top tool strip (actions, view controls)
- `ToolbarLeft` - Left tool palette (drawing tools)

**Behavior:**
- Desktop: Inspector inline, toolbars persistent
- Tablet/Mobile: Inspector overlay, toolbars collapsible
- Canvas uses container queries for zoom/pan controls

**CSS Variables:**
```css
--canvas-inspector-w  /* Inspector width (320px) */
--canvas-toolbar-h    /* Top toolbar height (48px) */
--canvas-palette-w    /* Left palette width (56px) */
```

**Recipes:**
- Map editor (Mapbox + inspector)
- Design surface (Fabric.js + properties)
- Chart builder (Recharts + data panel)

---

#### 5. DataShell
**Purpose:** Data-heavy pages with filters, tables, selection summaries.

**Slots:**
- `Toolbar` - Actions, search, export
- `FiltersRail` - Filter controls (inline or drawer)
- `DataRegion` - Table/grid/list
- `SelectionBar` - Multi-select actions (bottom)

**Behavior:**
- Desktop: Filters rail inline (left), persistent selection bar
- Tablet: Filters drawer, collapsible selection bar
- Mobile: Filters sheet, selection bar overlay

**CSS Variables:**
```css
--data-filters-w      /* Filters rail width (280px) */
--data-toolbar-h      /* Toolbar height (56px) */
--data-selection-h    /* Selection bar height (64px) */
```

**Recipes:**
- Table browser (filters + bulk actions)
- Analytics dashboard (controls + chart grid)
- CRM list (filters + export + selection)

---

### Micro Shells (Overlay & HUD)

Transient UI frames that coordinate layering & input policy.

#### 6. BottomSheet ✅ (Built)
**Purpose:** Bottom-anchored interactive drawer with snap points.

**Slots:** `Header`, `Content`, `Footer`

**Behavior:**
- Snap physics (peek/work/owned buckets)
- `footerMode="auto|always|never"`
- Drag handle, swipe-to-dismiss
- Keyboard aware (avoids virtual keyboard)

**Z-Index:** `--z-scrim` (50) + `--z-shell` (51)

**Use For:** Mobile-first flows, quick inspectors, filter drawers

---

#### 7. ModalShell
**Purpose:** Centered blocking dialog (keyboard-first, desktop feel).

**Slots:** `Header`, `Body`, `Actions`

**Behavior:**
- Focus trap (Tab loop)
- ESC dismisses, overlay click policy (optional)
- Sizes: `sm` (400px), `md` (600px), `lg` (800px), `xl` (1200px)
- Scroll lock on body

**Z-Index:** `--z-scrim` (50) + `--z-shell` (51, above sheet)

**Use For:** Confirms, wizards, blocking forms, settings

**Note:** Separate primitive from BottomSheet (no conflation).

---

#### 8. DrawerShell
**Purpose:** Left/right off-canvas panel (not bottom).

**Slots:** `Header`, `Body`, `Footer`

**Behavior:**
- Desktop: Pushes content (optional)
- Tablet/Mobile: Overlays with backdrop
- Slide-in animation (left/right)

**Z-Index:** `--z-shell` (51, equals modal level)

**Use For:** Mobile nav, secondary info, filter panels, shopping cart

---

#### 9. PanelShell
**Purpose:** Inline/overlay inspector for small utility panels.

**Slots:** `Header`, `Body`, `Footer` (optional)

**Behavior:**
- Desktop: Inline region (right side)
- Tablet/Mobile: Overlay from side
- Smaller than DrawerShell (320px vs 400px)

**Use For:** `AppShell.Panels` content (properties, AI assistant, quick view)

---

#### 10. PopoverShell
**Purpose:** Anchored overlay for light interactions.

**Slots:** `Header` (optional), `Body`

**Behavior:**
- Placement: top/bottom/left/right (auto-flip on collision)
- Arrow pointing to anchor
- Dismiss on outside click or ESC
- Focus return to anchor

**Z-Index:** `--z-popover` (60)

**Use For:** Date pickers, color pickers, mini forms, quick actions

---

#### 11. ContextMenuShell
**Purpose:** Right-click / long-press menu.

**Slots:** `Items` (nested groups)

**Behavior:**
- Keyboard support (arrow keys, typeahead)
- Nested submenus
- Icons + shortcuts display

**Z-Index:** `--z-popover` (60)

**Use For:** List actions, canvas actions, text editor

---

#### 12. TooltipShell
**Purpose:** Non-interactive hints (respects `prefers-reduced-motion`).

**Behavior:**
- Delay before show (600ms)
- Proper ARIA attributes (`role="tooltip"`, `aria-describedby`)
- No interactive content

**Z-Index:** `--z-popover` (60)

**Use For:** Icon-only buttons, truncated text, hints

---

#### 13. CommandPaletteShell
**Purpose:** Global "Go/Do" interface (⌘K).

**Slots:** `Search`, `Results`, `FooterHints`

**Behavior:**
- Remember last context
- Pluggable sources (pages, actions, docs)
- Keyboard-first (no mouse required)

**Z-Index:** `--z-command` (80, topmost HUD layer)

**Use For:** Navigation, actions, search

---

#### 14. ToastShell
**Purpose:** Transient notifications (stack, timeouts).

**Slots:** `Icon`, `Message`, `Action` (optional)

**Behavior:**
- Accessible live region (`role="status"`)
- Position: top-right/top-center/bottom-right (configurable)
- Queue management (max 3 visible)
- Auto-dismiss (5s default)

**Z-Index:** `--z-toast` (70)

**Use For:** Confirmations, errors, progress updates

---

#### 15. DockShell
**Purpose:** Persistent bottom/side command bar (mobile & canvas).

**Slots:** `Items` (icons/buttons), Badge support

**Behavior:**
- Safe-area aware (iOS home indicator)
- Hides when virtual keyboard opens
- Desktop: Optional side dock (like macOS)

**Use For:** Mobile tab bar, canvas tool palette

---

### Navigation Shells

Specialized coordinators for nav + header behaviors.

#### 16. NavShell
**Purpose:** Coordinates sidebar open/collapse/overlay for any nav content.

**Slots:** `NavHeader`, `NavBody`, `NavFooter`

**Behavior:**
- Desktop: Persistent inline
- Tablet/Mobile: Off-canvas overlay
- Inert main content while open
- Scroll lock

**Adapters:** Wraps Flowbite `Sidebar` (themed by tokens)

---

#### 17. HeaderShell
**Purpose:** Sticky app/page header coordinator.

**Slots:** `Brand`, `PrimaryActions`, `SecondaryActions`, `SearchRegion`

**Behavior:**
- Collapse on scroll (optional)
- Container queries for tool density
- Safe-area aware (iOS notch)

**Adapters:** Wraps Flowbite `Navbar` (themed by tokens)

---

## "Which Shell When?" Decision Matrix

| Need | Shell |
|------|-------|
| Global layout, regions | **AppShell** |
| Page chrome (title, toolbar) | **PageShell** |
| Split panes (list/detail) | **WorkbenchShell** |
| Full-bleed canvas + inspector | **CanvasShell** |
| Data grid + filters + selection | **DataShell** |
| Mobile-first interaction drawer | **BottomSheet** |
| Blocking desktop dialog | **ModalShell** |
| Side reveal (filters/info) | **DrawerShell** |
| Small inspector/utility panel | **PanelShell** |
| Anchored light interaction | **PopoverShell** |
| Right-click menus | **ContextMenuShell** |
| Hints | **TooltipShell** |
| Global action/search | **CommandPaletteShell** |
| Notifications | **ToastShell** |
| Mobile/tool bar | **DockShell** |
| Sidebar coordinator | **NavShell** |
| Header coordinator | **HeaderShell** |

---

## Z-Index & Layering (Single Source of Truth)

```css
/* tokens/elevation.ts */
--z-underlay  : 49    /* Underlay dimmer/scale target */
--z-scrim     : 50    /* Backdrops (sheet, modal, drawer) */
--z-shell     : 51    /* Surfaces (sheet, modal, drawer, panel) */
--z-popover   : 60    /* Popovers, menus, tooltips */
--z-toast     : 70    /* Toast notifications */
--z-command   : 80    /* Command palette (topmost HUD) */
```

**Rules:**
- Every shell uses tokens above; **no hardcoded numbers**
- Shells at same level (e.g., modal + drawer) share `--z-shell`
- Order controlled by DOM order, not z-index wars

---

## Flowbite Integration Points

### Inside Slots
- **AppShell.Header** → Flowbite `Navbar`
- **AppShell.Nav** → Flowbite `Sidebar`
- **PageShell.Toolbar** → Flowbite `Tabs`, `Pills`, `Select`
- **DataShell.DataRegion** → Flowbite `Table`, `Pagination`
- **ModalShell.Actions** → Flowbite `Button` group

### Theme with Token Bridge
```tsx
// Never override deeply
<Button color="primary">Save</Button>

// Token bridge maps DS tokens → Flowbite
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: 'var(--ds-primary-10)',
      'primary-hover': 'var(--ds-primary-9)',
    }
  }
}
```

### Adapters (Thin Wrappers)
- **NavAdapter** - Controls collapsed/open state for `Sidebar`
- **PanelsAdapter** - Controls active panels
- **CommandAdapter** - Wires ⌘K to `CommandPaletteShell`

---

## Minimal Set to Build First (Pragmatic)

### Phase 1: Foundation
1. ✅ **AppShell** (built)
2. **PageShell**
3. **NavShell** (AppShell adapter)

### Phase 2: Overlays
4. ✅ **BottomSheet** (built)
5. **ModalShell**
6. **DrawerShell**
7. **PopoverShell**

### Phase 3: HUD
8. **TooltipShell**
9. **ContextMenuShell**
10. **ToastShell**
11. **CommandPaletteShell**

### Phase 4: Workspace
12. **WorkbenchShell**
13. **CanvasShell**
14. **DataShell**

### Phase 5: Polish
15. **PanelShell**
16. **DockShell**
17. **HeaderShell**

---

## Composition Example

```tsx
// App.tsx (root)
<AppShell
  nav={{ collapsible: true, defaultOpen: true }}
  panels={{ side: 'right', overlayOn: ['mobile', 'tablet'] }}
>
  <AppShell.Header>
    <HeaderShell>
      <HeaderShell.Brand><Logo /></HeaderShell.Brand>
      <HeaderShell.SearchRegion><GlobalSearch /></HeaderShell.SearchRegion>
      <HeaderShell.PrimaryActions><UserMenu /></HeaderShell.PrimaryActions>
    </HeaderShell>
  </AppShell.Header>

  <AppShell.Nav>
    <NavShell>
      <NavShell.NavBody>
        <Sidebar>{/* Flowbite Sidebar themed */}</Sidebar>
      </NavShell.NavBody>
    </NavShell>
  </AppShell.Nav>

  <AppShell.Main>
    {/* Route: Dashboard Page */}
    <PageShell>
      <PageShell.PageHeader>
        <Breadcrumb />
        <h1>Dashboard</h1>
      </PageShell.PageHeader>

      <PageShell.Toolbar>
        <Tabs>{/* Filters */}</Tabs>
      </PageShell.Toolbar>

      <PageShell.Content>
        {/* Your dashboard content */}
      </PageShell.Content>
    </PageShell>
  </AppShell.Main>

  <AppShell.Panels>
    <PanelShell>
      <PanelShell.Header>Inspector</PanelShell.Header>
      <PanelShell.Body>{/* Properties */}</PanelShell.Body>
    </PanelShell>
  </AppShell.Panels>
</AppShell>

{/* Overlays (portaled to document.body) */}
<CommandPaletteShell />
<ToastShell />
```

**Layer cake:**
- **AppShell** = app OS (persistent)
- **PageShell** = page structure (routed)
- **Shells inside slots** = Flowbite themed by tokens
- **Micro shells** = portaled overlays (transient)

---

## Summary

### Shells Provide
- ✅ Layout structure (flex/grid)
- ✅ Responsive behavior (breakpoints, off-canvas)
- ✅ System effects (z-index, inert, scroll-lock, safe-area)
- ✅ Contract (slots, CSS vars, data attributes)

### Shells Do NOT Provide
- ❌ Colors/typography → **DS tokens**
- ❌ Component visuals → **Flowbite**
- ❌ Content padding → **Your components**

### Result
**One codebase, infinite compositions. Desktop → tablet → mobile. Web feel → native feel. Macro → micro coverage without bloat.**

**Shells are frames, not skins.**
