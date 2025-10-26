# Complete Shell Architecture - Visual Map

**The Big Picture: How Everything Fits Together**

---

## System Layers (Bottom → Top)

```
┌─────────────────────────────────────────────────────────────┐
│ LAYER 5: YOUR APPLICATION                                  │
│ Business logic, pages, forms, data fetching               │
│ Example: Dashboard.tsx, UserForm.tsx, ProjectList.tsx     │
└─────────────────────────────────────────────────────────────┘
                            ↓ Uses
┌─────────────────────────────────────────────────────────────┐
│ LAYER 4: SHELLS (High-Level Compositions)                 │
│ Structure + responsive behavior + contracts                │
│                                                             │
│ Macro: AppShell, PageShell, NavShell                       │
│ Meso: WorkbenchShell, CanvasShell, DataShell               │
│ Micro: BottomSheet, ModalShell, DrawerShell                │
│ Recipes: DashboardShell, FullScreenRoute                   │
└─────────────────────────────────────────────────────────────┘
                            ↓ Built with
┌─────────────────────────────────────────────────────────────┐
│ LAYER 3: FLOWBITE COMPONENTS                               │
│ Visual components (themed by design tokens)                │
│ Example: Navbar, Sidebar, Table, Button, Card             │
└─────────────────────────────────────────────────────────────┘
                            ↓ Styled by
┌─────────────────────────────────────────────────────────────┐
│ LAYER 2: DESIGN TOKENS                                     │
│ Single source of truth for look & feel                     │
│ Example: --ds-primary-10, --ds-space-4, --ds-radius-md    │
└─────────────────────────────────────────────────────────────┘
                            ↓ Powers
┌─────────────────────────────────────────────────────────────┐
│ LAYER 1: PRIMITIVES (Low-Level Mechanics)                  │
│ Reusable building blocks (no opinions)                     │
│ Example: OverlayCore, FloatingUI, FocusTrap                │
└─────────────────────────────────────────────────────────────┘
```

---

## Current File Structure (What We Have)

```
packages/ds/src/
│
├── tokens/                     ← LAYER 2: Design Tokens
│   ├── colors.ts
│   ├── spacing.ts
│   ├── elevation.ts
│   └── index.ts
│
├── primitives/                 ← LAYER 1: Low-Level Mechanics
│   ├── Sheet/                  ⚠️ Should be BottomSheet/
│   │   ├── Sheet.tsx
│   │   ├── Sheet.css
│   │   └── SheetContext.tsx
│   └── Popover/
│       └── Popover.tsx
│
├── shell/                      ← LAYER 4: Shells
│   ├── AppShell.tsx
│   ├── AppShell.css
│   ├── PageShell.tsx
│   ├── PageShell.css
│   ├── NavShell.tsx
│   ├── NavShell.css
│   ├── useAppEnvironment.ts    ← Hook for device detection
│   ├── usePanels.tsx           ← Hook for panel state
│   ├── recipes/
│   │   ├── DashboardShell.tsx
│   │   └── WorkbenchShell.tsx
│   └── index.ts
│
├── routes/                     ← LAYER 4: Route Shells
│   ├── flow-scaffold/          ⚠️ Overlaps with shell concept
│   │   ├── FlowScaffold.tsx
│   │   └── useSubFlow.ts
│   ├── full-screen-route/      ⚠️ Could be ModalShell recipe
│   │   └── FullScreenRoute.tsx
│   └── route-panel/            ⚠️ Could be DrawerShell recipe
│       └── RoutePanel.tsx
│
├── fb/                         ← LAYER 3: Flowbite (themed)
│   ├── Button.tsx
│   ├── Input.tsx
│   └── ... (23 components)
│
└── index.ts                    ← Main barrel
```

---

## Proposed File Structure (Refined)

```
packages/ds/src/
│
├── tokens/                     ← LAYER 2: Design Tokens
│   └── ... (no changes)
│
├── primitives/                 ← LAYER 1: Mechanics
│   ├── overlay/
│   │   ├── OverlayCore.tsx     # Portal, backdrop, focus trap
│   │   ├── OverlaySheet.tsx    # Bottom-anchored overlay
│   │   ├── OverlayModal.tsx    # Centered overlay
│   │   └── OverlayDrawer.tsx   # Side overlay
│   └── positioning/
│       └── FloatingUI.tsx      # Anchored positioning
│
├── shell/                      ← LAYER 4: Shells
│   ├── core/                   # Shared hooks/utils
│   │   ├── useAppEnvironment.ts
│   │   └── useShellContext.ts
│   │
│   ├── macro/                  # App-level structure
│   │   ├── AppShell/
│   │   │   ├── AppShell.tsx
│   │   │   └── AppShell.css
│   │   ├── PageShell/
│   │   │   ├── PageShell.tsx
│   │   │   └── PageShell.css
│   │   └── NavShell/
│   │       ├── NavShell.tsx
│   │       └── NavShell.css
│   │
│   ├── meso/                   # Workspace patterns
│   │   ├── WorkbenchShell/
│   │   ├── CanvasShell/
│   │   └── DataShell/
│   │
│   ├── micro/                  # Overlays & HUD
│   │   ├── BottomSheet/        # Renamed from Sheet
│   │   │   ├── BottomSheet.tsx # Uses OverlaySheet primitive
│   │   │   └── BottomSheet.css
│   │   ├── ModalShell/         # New
│   │   │   ├── ModalShell.tsx  # Uses OverlayModal primitive
│   │   │   └── ModalShell.css
│   │   ├── DrawerShell/        # New
│   │   │   ├── DrawerShell.tsx # Uses OverlayDrawer primitive
│   │   │   └── DrawerShell.css
│   │   ├── PopoverShell/       # New (wraps Popover primitive)
│   │   ├── TooltipShell/
│   │   ├── ContextMenuShell/
│   │   ├── ToastShell/
│   │   └── CommandPaletteShell/
│   │
│   └── recipes/                # High-level compositions
│       ├── DashboardShell.tsx
│       ├── WorkbenchShell.tsx
│       └── route-shells/       # Routes as recipes
│           ├── FullScreenRouteShell.tsx  # Uses ModalShell
│           ├── FlowScaffoldShell.tsx     # Uses PageShell
│           └── RoutePanelShell.tsx       # Uses DrawerShell
│
├── fb/                         ← LAYER 3: Flowbite
│   └── ... (no changes)
│
└── index.ts                    ← Main barrel
```

---

## Data Flow (How Information Flows)

### 1. Device Detection (useAppEnvironment)
```
Browser
   ↓ window.innerWidth, pointer events, safe-area
useAppEnvironment()
   ↓ returns { mode, pointer, density, safeArea }
Shells
   ↓ adapt layout based on mode/pointer
CSS
   ↓ data-shell-mode="mobile", data-pointer="coarse"
Your Components
   ↓ read data-* attrs or CSS vars for styling
```

### 2. Layout State (CSS Variables)
```
AppShell
   ↓ publishes --shell-nav-w, --shell-header-h
PageShell
   ↓ publishes --page-gutter, --page-toolbar-h
Your CSS
   ↓ reads var(--shell-nav-w) for adaptive layouts
```

### 3. State Management (Context Hooks)
```
AppShell
   ↓ provides NavContext, PanelsContext
NavShell / PanelsShell
   ↓ consumes context
useNav() / usePanels()
   ↓ access state (open/close/toggle)
Your Components
   ↓ call hooks to control nav/panels
```

---

## Composition Patterns

### Pattern 1: Dashboard (Macro Only)
```tsx
<AppShell>                          ← Macro shell (global layout)
  <AppShell.Header>
    <Navbar />                      ← Flowbite component
  </AppShell.Header>

  <AppShell.Nav>
    <NavShell>                      ← Nav coordinator
      <Sidebar />                   ← Flowbite component
    </NavShell>
  </AppShell.Nav>

  <AppShell.Main>
    <PageShell>                     ← Macro shell (page structure)
      <PageShell.PageHeader>
        <Breadcrumb />              ← Flowbite component
        <h1>Dashboard</h1>
      </PageShell.PageHeader>

      <PageShell.Content>
        <YourDashboardContent />    ← Your app
      </PageShell.Content>
    </PageShell>
  </AppShell.Main>
</AppShell>
```

**Layers:**
- AppShell + PageShell = Macro shells
- Navbar, Sidebar, Breadcrumb = Flowbite (Layer 3)
- Your content = Layer 5

---

### Pattern 2: Workbench (Macro + Meso)
```tsx
<AppShell>                          ← Macro (global layout)
  <AppShell.Header>...</AppShell.Header>
  <AppShell.Nav>...</AppShell.Nav>

  <AppShell.Main>
    <WorkbenchShell>                ← Meso shell (split panes)
      <WorkbenchShell.Master>
        <FolderTree />              ← Your component
      </WorkbenchShell.Master>

      <WorkbenchShell.Detail>
        <FileList />                ← Your component
      </WorkbenchShell.Detail>

      <WorkbenchShell.Secondary>
        <FilePreview />             ← Your component
      </WorkbenchShell.Secondary>
    </WorkbenchShell>
  </AppShell.Main>
</AppShell>
```

**Layers:**
- AppShell = Macro shell
- WorkbenchShell = Meso shell (workspace pattern)
- Your components = Layer 5

---

### Pattern 3: Full Stack (Macro + Meso + Micro)
```tsx
{/* App structure */}
<AppShell>                          ← Macro (global layout)
  <AppShell.Header>...</AppShell.Header>
  <AppShell.Nav>...</AppShell.Nav>

  <AppShell.Main>
    <PageShell>                     ← Macro (page structure)
      <PageShell.Content>
        <DataShell>                 ← Meso (data-heavy pattern)
          <DataShell.FiltersRail>
            <FilterForm />
          </DataShell.FiltersRail>

          <DataShell.DataRegion>
            <Table />               ← Flowbite component
          </DataShell.DataRegion>
        </DataShell>
      </PageShell.Content>
    </PageShell>
  </AppShell.Main>
</AppShell>

{/* Overlays (portaled to body) */}
<BottomSheet open={filterOpen}>     ← Micro shell (mobile filters)
  <BottomSheet.Header>
    <h2>Filters</h2>
  </BottomSheet.Header>
  <BottomSheet.Content>
    <FilterForm />
  </BottomSheet.Content>
  <BottomSheet.Footer>
    <Button onClick={apply}>Apply</Button>
  </BottomSheet.Footer>
</BottomSheet>

<ModalShell open={confirmOpen}>     ← Micro shell (confirmation)
  <ModalShell.Header>
    <h2>Confirm Delete</h2>
  </ModalShell.Header>
  <ModalShell.Body>
    <p>Are you sure?</p>
  </ModalShell.Body>
  <ModalShell.Actions>
    <Button onClick={cancel}>Cancel</Button>
    <Button color="danger" onClick={confirm}>Delete</Button>
  </ModalShell.Actions>
</ModalShell>
```

**Layers:**
- AppShell, PageShell = Macro
- DataShell = Meso
- BottomSheet, ModalShell = Micro
- Table, Button = Flowbite (Layer 3)
- Your logic = Layer 5

---

## Z-Index Stratification

```
┌─────────────────────────────────────────┐
│ CommandPaletteShell                    │  --z-command: 80
│ (⌘K global actions)                    │
├─────────────────────────────────────────┤
│ ToastShell                             │  --z-toast: 70
│ (notifications)                         │
├─────────────────────────────────────────┤
│ PopoverShell, ContextMenuShell         │  --z-popover: 60
│ TooltipShell                           │
├─────────────────────────────────────────┤
│ ModalShell, DrawerShell, PanelShell   │  --z-shell: 51
│ BottomSheet                            │  --z-scrim: 50
├─────────────────────────────────────────┤
│ AppShell, PageShell                    │  (no z-index, base layer)
│ (persistent structure)                 │
└─────────────────────────────────────────┘
```

**Rule:** All z-index values come from design tokens. No hardcoded numbers.

---

## Responsive Behavior Matrix

| Shell | Desktop (≥1024px) | Tablet (768-1023px) | Mobile (<768px) |
|-------|-------------------|---------------------|-----------------|
| **AppShell.Nav** | Persistent inline | Off-canvas drawer | Off-canvas drawer |
| **AppShell.Panels** | Inline (optional) | Overlay | Full-screen overlay |
| **AppShell.Dock** | Hidden | Optional | Bottom bar (visible) |
| **PageShell.Toolbar** | Horizontal | Wraps | Stacks vertically |
| **PageShell.PageAside** | Inline | Drawer | Hidden (drawer) |
| **WorkbenchShell** | 3-col splits | 2-col (Master+Detail) | 1-col (stack) |
| **CanvasShell.Inspector** | Inline | Overlay | Overlay |
| **DataShell.FiltersRail** | Inline | Drawer | BottomSheet |
| **BottomSheet** | Modal (centered) | Bottom drawer | Bottom drawer |
| **ModalShell** | Centered dialog | Centered dialog | Full-screen or bottom |
| **DrawerShell** | Side (pushes content) | Overlay | Overlay |

**Powered by:** `useAppEnvironment()` hook (single source of truth)

---

## Key Design Decisions

### 1. Primitives vs Shells
- **Primitives:** Low-level mechanics (OverlayCore, FloatingUI)
- **Shells:** High-level compositions (BottomSheet, ModalShell)
- **Rule:** App developers use shells, not primitives

### 2. Routes vs Shells
- **Routes:** URL-bound patterns (FullScreenRoute, FlowScaffold)
- **Shells:** Structure-only patterns (AppShell, ModalShell)
- **Relationship:** Routes are recipes built on shells + routing logic

### 3. Slots = Zero Padding
- **Shell slots:** No padding (full-bleed by default)
- **Your content:** Provides padding
- **Result:** No padding conflicts, full control

### 4. Token-Driven Everything
- **Z-index:** `--z-shell`, `--z-popover`, etc.
- **Spacing:** `--ds-space-4`, `--ds-space-6`, etc.
- **Colors:** `--ds-primary-10`, `--ds-surface-base`, etc.
- **Rule:** Zero hardcoded values

### 5. Auto-Wiring via Context
- **useNav():** Nav state auto-wired (no prop drilling)
- **usePanels():** Panel state auto-wired
- **useAppEnvironment():** Device state auto-wired
- **Rule:** "Pit of success" - correct by default

---

## Health Check Summary

### ✅ Architecture Strengths
1. **Clear layering:** Primitives → Shells → Flowbite → Your App
2. **Consistent patterns:** All shells follow same contract (slots, CSS vars, data attrs)
3. **Responsive by design:** useAppEnvironment() powers all adaptations
4. **Token-driven:** No hardcoded values, all from design tokens
5. **Flowbite synergy:** Components live in slots, themed by tokens

### ⚠️ Minor Issues (Easy Fixes)
1. **Naming:** `Sheet` should be `BottomSheet` (rename with deprecation)
2. **Docs:** Need PRIMITIVES_VS_SHELLS.md (created ✅)
3. **Missing shells:** ModalShell, DrawerShell, PopoverShell (implement next)

### 🎯 No Major Architectural Flaws
The foundation is **solid**. Refinements are mostly naming/docs/missing implementations.

---

## Next Steps (Prioritized)

### This Week
1. Rename Sheet → BottomSheet (with deprecation alias)
2. Document primitives vs shells (done ✅)
3. Update SHELL_SYSTEM.md with routes relationship

### Next 2 Weeks
4. Implement ModalShell (centered dialog)
5. Implement DrawerShell (side panels)
6. Wrap PopoverShell (anchored overlays)

### Month 2
7. Complete micro shells (Toast, Tooltip, ContextMenu)
8. Implement meso shells (CanvasShell, DataShell)

### v3.0.0 (Future)
9. Consider directory restructure (macro/meso/micro/)
10. Consider merging routes into shell/recipes/
11. Complete all 17 shells in taxonomy

---

## Verdict

**Architecture Grade: A-**

The shell system is **fundamentally sound**. The "frames not skins" philosophy works perfectly. Minor refinements will bring it to A+.

**Ship it!** 🚀
