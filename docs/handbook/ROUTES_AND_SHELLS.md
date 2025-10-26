# Routes and Shells - The Relationship

**TL;DR:** Routes are **recipes** built on shells + routing logic. They're high-level compositions for URL-bound patterns.

---

## Mental Model

```
┌─────────────────────────────────────────┐
│ ROUTES (URL-bound recipes)              │
│ Shells + routing guards + focus trap   │
│ Examples: FullScreenRoute, FlowScaffold│
└─────────────────────────────────────────┘
                    ↓ Built with
┌─────────────────────────────────────────┐
│ SHELLS (Structure-only)                 │
│ Layout + responsive + contracts         │
│ Examples: ModalShell, PageShell         │
└─────────────────────────────────────────┘
```

**Key Insight:** Routes = Shells + Router Integration

---

## What Routes Are

Routes are **opinionated compositions** that add routing concerns to shells:

| Route Component | = | Shell | + | Routing Concerns |
|----------------|---|-------|---|-----------------|
| `FullScreenRoute` | = | `ModalShell` | + | URL state, guards, focus trap |
| `FlowScaffold` | = | `PageShell` | + | Multi-step state, URL sync |
| `RoutePanel` | = | `DrawerShell` | + | URL persistence, desktop layout |

---

## Detailed Breakdown

### 1. FullScreenRoute

**What it is:**
- Full-screen modal for focused tasks (e.g., "Create Project", "Edit Profile")
- URL-bound (e.g., `/projects/new`, `/profile/edit`)
- Desktop-first (centered modal with keyboard navigation)

**Built from:**
```tsx
FullScreenRoute = ModalShell + {
  URL state management (open/close via router)
  Route guards (canLeave, beforeEnter)
  Focus trap (automatic)
  Keyboard shortcuts (ESC to go back)
  History integration (back button closes modal)
}
```

**Example:**
```tsx
<Routes>
  <Route path="/projects/new" element={
    <FullScreenRoute
      ariaLabel="Create Project"
      onClose={() => navigate('/projects')}
    >
      <ProjectForm />
    </FullScreenRoute>
  } />
</Routes>
```

**Use when:** You need a full-screen experience tied to a URL (not just local component state).

---

### 2. FlowScaffold

**What it is:**
- Multi-step wizard with URL-synced steps (e.g., `/onboarding/step-1`, `/onboarding/step-2`)
- Progressive disclosure (each step is a sub-route)
- Remembers progress (refresh returns to same step)

**Built from:**
```tsx
FlowScaffold = PageShell + {
  Step state management (current, visited, completed)
  URL sync (steps map to routes)
  Navigation (next/prev/jump)
  Progress tracking
  Guards (prevent skipping required steps)
}
```

**Example:**
```tsx
<FlowScaffold
  steps={[
    { id: 'profile', title: 'Your Profile', path: '/onboarding/profile' },
    { id: 'preferences', title: 'Preferences', path: '/onboarding/preferences' },
    { id: 'complete', title: 'Complete', path: '/onboarding/complete' },
  ]}
>
  <Outlet /> {/* Nested routes render step content */}
</FlowScaffold>
```

**Use when:** You have multi-step processes that should be URL-addressable and bookmarkable.

---

### 3. RoutePanel

**What it is:**
- Side panel for auxiliary content (e.g., `/app?panel=settings`, `/app/project/123?inspector=open`)
- Desktop-persistent, mobile-overlay
- URL-querystring driven

**Built from:**
```tsx
RoutePanel = DrawerShell + {
  URL query parameter binding (e.g., ?panel=settings)
  History integration (closing updates URL)
  Responsive (drawer on mobile, persistent on desktop)
  Remembers state across navigation
}
```

**Example:**
```tsx
<Routes>
  <Route path="/app" element={
    <>
      <MainContent />
      <RoutePanel
        queryParam="panel"
        ariaLabel="Settings Panel"
      >
        <SettingsContent />
      </RoutePanel>
    </>
  } />
</Routes>
```

**Use when:** You need auxiliary UI that should be deep-linkable (e.g., share link with panel open).

---

## Routes vs Shells: When to Use What

### Use a Shell (No routing needed)

```tsx
// Component-local modal (no URL)
<ModalShell open={showModal} onClose={() => setShowModal(false)}>
  <ConfirmDeleteDialog />
</ModalShell>

// Component-local drawer (no URL)
<DrawerShell open={filtersOpen} onClose={() => setFiltersOpen(false)}>
  <FilterForm />
</DrawerShell>
```

**Characteristics:**
- ✅ State managed by React (`useState`)
- ✅ No URL change when opening/closing
- ✅ Local to single component
- ✅ Not shareable/bookmarkable
- ✅ Simpler (no routing concerns)

---

### Use a Route (URL-bound needed)

```tsx
// Route-based modal (URL changes)
<Route path="/projects/:id/edit" element={
  <FullScreenRoute ariaLabel="Edit Project">
    <ProjectEditForm />
  </FullScreenRoute>
} />

// Route-based panel (query parameter)
<RoutePanel queryParam="inspector">
  <Inspector />
</RoutePanel>
```

**Characteristics:**
- ✅ State synced with URL
- ✅ Opening/closing changes URL
- ✅ Shareable/bookmarkable
- ✅ Browser back/forward works
- ✅ Refresh preserves state
- ⚠️ More complex (routing concerns)

---

## Decision Matrix

| Scenario | Use |
|----------|-----|
| Confirmation dialog | **ModalShell** (local state) |
| Quick filter drawer | **DrawerShell** (local state) |
| Bottom sheet picker | **BottomSheet** (local state) |
| "Create Project" task | **FullScreenRoute** (URL-bound) |
| Onboarding wizard | **FlowScaffold** (URL-bound) |
| Settings panel (shareable) | **RoutePanel** (URL-bound) |
| Inspector (deep-linkable) | **RoutePanel** (URL-bound) |

**Rule of thumb:**
- **Local transient UI** → Shells
- **Shareable/bookmarkable UI** → Routes

---

## Implementation Relationship

```
packages/ds/src/
├── shell/                    ← Structure-only (no routing)
│   ├── ModalShell.tsx
│   ├── DrawerShell.tsx
│   ├── PageShell.tsx
│   └── ...
│
├── routes/                   ← Shells + routing logic
│   ├── FullScreenRoute.tsx   # Uses ModalShell internally
│   ├── FlowScaffold.tsx      # Uses PageShell internally
│   └── RoutePanel.tsx        # Uses DrawerShell internally
```

**Key Points:**
1. Routes **import and use** shells internally
2. Routes **don't reinvent** layout/behavior (shells do that)
3. Routes **add** routing concerns (guards, URL sync, history)
4. Shells **can be used** standalone (without routing)

---

## Future Direction (v3.0.0)

### Potential Consolidation

Consider moving routes under `shell/recipes/route-shells/`:

```
shell/
├── macro/
├── meso/
├── micro/
└── recipes/
    ├── DashboardShell.tsx
    ├── WorkbenchShell.tsx
    └── route-shells/         ← Routes as recipes
        ├── FullScreenRouteShell.tsx
        ├── FlowScaffoldShell.tsx
        └── RoutePanelShell.tsx
```

**Benefits:**
- Single taxonomy (all shells in one place)
- Clearer that routes are "specialized shells"
- Easier to discover (one directory to search)

**Tradeoffs:**
- Breaking change (import paths change)
- Migration needed (codemod + deprecation period)

**Decision:** Keep separate for now (backward compat). Consider for v3.0.0.

---

## Porting Guide

### Migrating from Route to Shell

If you have a route but don't need URL binding:

```tsx
// Before (URL-bound)
<Route path="/confirm-delete" element={
  <FullScreenRoute>
    <ConfirmDialog />
  </FullScreenRoute>
} />

// After (local state)
<ModalShell open={showConfirm} onClose={() => setShowConfirm(false)}>
  <ConfirmDialog />
</ModalShell>
```

### Migrating from Shell to Route

If you have a shell but need URL binding:

```tsx
// Before (local state)
<DrawerShell open={settingsOpen} onClose={() => setSettingsOpen(false)}>
  <Settings />
</DrawerShell>

// After (URL-bound)
<RoutePanel queryParam="settings">
  <Settings />
</RoutePanel>
```

---

## Examples by Use Case

### Task-focused modals
```tsx
// Create, Edit, Configure tasks
<FullScreenRoute path="/projects/:id/edit">
  <ProjectEditForm />
</FullScreenRoute>
```

### Multi-step flows
```tsx
// Onboarding, checkout, wizards
<FlowScaffold steps={checkoutSteps}>
  <Outlet />
</FlowScaffold>
```

### Auxiliary panels
```tsx
// Settings, inspector, help
<RoutePanel queryParam="panel">
  <SettingsPanel />
</RoutePanel>
```

### Quick actions
```tsx
// Confirmation, filters, pickers
<ModalShell open={open}>
  <QuickActionForm />
</ModalShell>
```

---

## Summary

| Aspect | Routes | Shells |
|--------|--------|--------|
| **Purpose** | URL-bound patterns | Structure-only |
| **State** | Synced with URL | Local React state |
| **Shareable** | Yes (bookmarkable) | No |
| **Browser nav** | Back/forward works | N/A |
| **Complexity** | Higher (routing) | Lower (simpler) |
| **Examples** | FullScreenRoute, FlowScaffold | ModalShell, DrawerShell |
| **Built with** | Shells + routing | Layout primitives |

**Mental Model:** Routes are specialized shells with routing superpowers.

---

## Key Takeaways

1. **Routes ⊃ Shells** - Routes are built on top of shells
2. **Shells are reusable** - Can be used with or without routing
3. **Routes add router concerns** - Guards, URL sync, history
4. **Choose based on need** - URL-bound? Route. Local? Shell.
5. **Same structure** - Both use slots, both are frames not skins

**Motto:** "Routes are shells with URLs."
