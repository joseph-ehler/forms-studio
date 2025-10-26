# Shell Composition Examples

**Real-world patterns showing how shells compose from macro → micro.**

---

## Pattern 1: Simple Dashboard

**Stack:** AppShell + PageShell + Flowbite components

```tsx
import { AppShell, PageShell, NavShell } from '@intstudio/ds';
import { Navbar, Sidebar, Breadcrumb, Card } from 'flowbite-react';

export function SimpleDashboard() {
  return (
    <AppShell
      nav={{ collapsible: true, defaultOpen: true, persistKey: 'dashboard-nav' }}
    >
      {/* Header */}
      <AppShell.Header>
        <Navbar fluid className="border-b">
          <Navbar.Brand href="/">
            <Logo />
          </Navbar.Brand>
          <Navbar.Collapse>
            <GlobalSearch />
            <UserMenu />
          </Navbar.Collapse>
        </Navbar>
      </AppShell.Header>

      {/* Nav */}
      <AppShell.Nav>
        <NavShell>
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
        </NavShell>
      </AppShell.Nav>

      {/* Main Content */}
      <AppShell.Main>
        <PageShell layout="default">
          <PageShell.PageHeader>
            <Breadcrumb>
              <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
              <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
            </Breadcrumb>
            <h1 className="text-3xl font-bold">Dashboard</h1>
          </PageShell.PageHeader>

          <PageShell.Content>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-6">
                <Card>
                  <h2>Metric 1</h2>
                  <p>12,345</p>
                </Card>
                <Card>
                  <h2>Metric 2</h2>
                  <p>67,890</p>
                </Card>
                <Card>
                  <h2>Metric 3</h2>
                  <p>24,680</p>
                </Card>
              </div>
            </div>
          </PageShell.Content>
        </PageShell>
      </AppShell.Main>
    </AppShell>
  );
}
```

**Result:**
- ✅ Responsive nav (persistent on desktop, drawer on mobile)
- ✅ Consistent page structure
- ✅ Flowbite components themed by DS tokens
- ✅ Zero padding conflicts

---

## Pattern 2: Email Client (Workbench)

**Stack:** AppShell + WorkbenchShell + Flowbite components

```tsx
import { AppShell, WorkbenchShell } from '@intstudio/ds';
import { Sidebar, List, Card, Button } from 'flowbite-react';

export function EmailClient() {
  return (
    <AppShell>
      <AppShell.Header>
        <EmailToolbar />
      </AppShell.Header>

      <AppShell.Nav>
        <NavShell>
          <Sidebar>
            <Sidebar.Items>
              <Sidebar.Item icon={InboxIcon}>Inbox (24)</Sidebar.Item>
              <Sidebar.Item icon={SendIcon}>Sent</Sidebar.Item>
              <Sidebar.Item icon={ArchiveIcon}>Archive</Sidebar.Item>
            </Sidebar.Items>
          </Sidebar>
        </NavShell>
      </AppShell.Nav>

      <AppShell.Main>
        {/* Tri-pane: Folders → Thread List → Email Body */}
        <WorkbenchShell>
          <WorkbenchShell.Master>
            <div className="p-4">
              <h3 className="font-semibold mb-4">All Folders</h3>
              <List>
                <List.Item>Work</List.Item>
                <List.Item>Personal</List.Item>
                <List.Item>Projects</List.Item>
              </List>
            </div>
          </WorkbenchShell.Master>

          <WorkbenchShell.Detail>
            <div className="divide-y">
              {threads.map(thread => (
                <ThreadListItem key={thread.id} {...thread} />
              ))}
            </div>
          </WorkbenchShell.Detail>

          <WorkbenchShell.Secondary>
            <div className="p-6">
              <EmailBody email={selectedEmail} />
            </div>
          </WorkbenchShell.Secondary>
        </WorkbenchShell>
      </AppShell.Main>
    </AppShell>
  );
}
```

**Responsive behavior:**
- **Desktop (≥1024px):** 3 columns (folders | threads | email)
- **Tablet (768-1023px):** 2 columns (threads | email), folders in drawer
- **Mobile (<768px):** 1 column (threads), tap to open email full-screen

---

## Pattern 3: Design Tool (Canvas + Inspector)

**Stack:** AppShell + CanvasShell + PanelShell

```tsx
import { AppShell, CanvasShell, PanelShell, usePanels } from '@intstudio/ds';
import { Button, Tabs } from 'flowbite-react';

export function DesignTool() {
  const { toggle } = usePanels();

  return (
    <AppShell
      panels={{ side: 'right', width: 360, overlayOn: ['mobile', 'tablet'] }}
    >
      <AppShell.Header>
        <DesignToolbar />
      </AppShell.Header>

      <AppShell.Main>
        <CanvasShell>
          {/* Top toolbar */}
          <CanvasShell.ToolbarTop>
            <div className="flex items-center gap-2 p-2">
              <Button size="sm">
                <ZoomInIcon />
              </Button>
              <Button size="sm">
                <ZoomOutIcon />
              </Button>
              <Button size="sm">
                <GridIcon />
              </Button>
            </div>
          </CanvasShell.ToolbarTop>

          {/* Left tool palette */}
          <CanvasShell.ToolbarLeft>
            <div className="flex flex-col gap-2 p-2">
              <Button size="sm" color="light">
                <SelectIcon />
              </Button>
              <Button size="sm" color="light">
                <RectangleIcon />
              </Button>
              <Button size="sm" color="light">
                <CircleIcon />
              </Button>
              <Button size="sm" color="light">
                <TextIcon />
              </Button>
            </div>
          </CanvasShell.ToolbarLeft>

          {/* Canvas */}
          <CanvasShell.Canvas>
            <FabricCanvas />
          </CanvasShell.Canvas>

          {/* Inspector */}
          <CanvasShell.Inspector>
            <PanelShell>
              <PanelShell.Header>
                <Tabs>
                  <Tabs.Item title="Properties" active />
                  <Tabs.Item title="Layers" />
                </Tabs>
              </PanelShell.Header>
              <PanelShell.Body>
                <div className="p-4">
                  <PropertiesPanel />
                </div>
              </PanelShell.Body>
            </PanelShell>
          </CanvasShell.Inspector>
        </CanvasShell>
      </AppShell.Main>
    </AppShell>
  );
}
```

**Responsive behavior:**
- **Desktop:** Canvas + inline inspector (persistent)
- **Tablet/Mobile:** Canvas full-bleed, inspector overlay (swipe from right)

---

## Pattern 4: Data Browser (Filters + Table + Bulk Actions)

**Stack:** AppShell + PageShell + DataShell

```tsx
import { AppShell, PageShell, DataShell } from '@intstudio/ds';
import { Table, Checkbox, Button, Select } from 'flowbite-react';

export function DataBrowser() {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <AppShell>
      <AppShell.Header>
        <Navbar />
      </AppShell.Header>

      <AppShell.Nav>
        <NavShell>
          <Sidebar>{/* Nav items */}</Sidebar>
        </NavShell>
      </AppShell.Nav>

      <AppShell.Main>
        <PageShell>
          <PageShell.PageHeader>
            <h1>Users Database</h1>
          </PageShell.PageHeader>

          <PageShell.Toolbar>
            <div className="flex items-center gap-4 p-4">
              <SearchInput placeholder="Search users..." />
              <Button color="primary">
                <PlusIcon /> Add User
              </Button>
              <Button color="light">
                <ExportIcon /> Export
              </Button>
            </div>
          </PageShell.Toolbar>

          <PageShell.Content>
            <DataShell>
              {/* Filters Rail */}
              <DataShell.FiltersRail>
                <div className="p-4">
                  <h3 className="font-semibold mb-4">Filters</h3>
                  <div className="space-y-4">
                    <div>
                      <label>Status</label>
                      <Select>
                        <option>All</option>
                        <option>Active</option>
                        <option>Inactive</option>
                      </Select>
                    </div>
                    <div>
                      <label>Role</label>
                      <Select>
                        <option>All</option>
                        <option>Admin</option>
                        <option>User</option>
                      </Select>
                    </div>
                  </div>
                </div>
              </DataShell.FiltersRail>

              {/* Data Region */}
              <DataShell.DataRegion>
                <Table>
                  <Table.Head>
                    <Table.HeadCell>
                      <Checkbox
                        checked={selected.length === users.length}
                        onChange={handleSelectAll}
                      />
                    </Table.HeadCell>
                    <Table.HeadCell>Name</Table.HeadCell>
                    <Table.HeadCell>Email</Table.HeadCell>
                    <Table.HeadCell>Role</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                    {users.map(user => (
                      <Table.Row key={user.id}>
                        <Table.Cell>
                          <Checkbox
                            checked={selected.includes(user.id)}
                            onChange={() => handleSelect(user.id)}
                          />
                        </Table.Cell>
                        <Table.Cell>{user.name}</Table.Cell>
                        <Table.Cell>{user.email}</Table.Cell>
                        <Table.Cell>{user.role}</Table.Cell>
                        <Table.Cell>
                          <Badge color={user.status === 'active' ? 'green' : 'gray'}>
                            {user.status}
                          </Badge>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </DataShell.DataRegion>

              {/* Selection Bar (sticky bottom) */}
              {selected.length > 0 && (
                <DataShell.SelectionBar>
                  <div className="flex items-center justify-between p-4">
                    <span>{selected.length} selected</span>
                    <div className="flex gap-2">
                      <Button size="sm" color="light">
                        Export
                      </Button>
                      <Button size="sm" color="light">
                        Archive
                      </Button>
                      <Button size="sm" color="failure">
                        Delete
                      </Button>
                    </div>
                  </div>
                </DataShell.SelectionBar>
              )}
            </DataShell>
          </PageShell.Content>

          <PageShell.PageFooter>
            <div className="flex justify-between items-center p-4">
              <span>Showing 1-20 of 100</span>
              <Pagination currentPage={1} totalPages={5} />
            </div>
          </PageShell.PageFooter>
        </PageShell>
      </AppShell.Main>
    </AppShell>
  );
}
```

**Responsive behavior:**
- **Desktop:** Filters rail inline (left), persistent selection bar
- **Tablet:** Filters in drawer (toggle button)
- **Mobile:** Filters in BottomSheet, selection bar overlays content

---

## Pattern 5: Multi-Step Form (Modal + BottomSheet)

**Stack:** ModalShell (desktop) + BottomSheet (mobile) + Form

```tsx
import { useAppEnvironment, ModalShell, BottomSheet } from '@intstudio/ds';
import { Button, TextInput, Select } from 'flowbite-react';

export function MultiStepForm({ open, onClose }: Props) {
  const env = useAppEnvironment();
  const [step, setStep] = useState(1);

  // Desktop: Use ModalShell
  if (env.mode === 'desktop') {
    return (
      <ModalShell open={open} onClose={onClose} size="lg">
        <ModalShell.Header>
          <h2>Create New Project</h2>
          <p className="text-sm text-gray-500">Step {step} of 3</p>
        </ModalShell.Header>

        <ModalShell.Body>
          <div className="space-y-4 p-6">
            {step === 1 && <Step1Fields />}
            {step === 2 && <Step2Fields />}
            {step === 3 && <Step3Fields />}
          </div>
        </ModalShell.Body>

        <ModalShell.Actions>
          <div className="flex justify-between p-4">
            <Button color="light" onClick={onClose}>
              Cancel
            </Button>
            <div className="flex gap-2">
              {step > 1 && (
                <Button color="light" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              )}
              <Button color="primary" onClick={() => step === 3 ? onSubmit() : setStep(step + 1)}>
                {step === 3 ? 'Create' : 'Next'}
              </Button>
            </div>
          </div>
        </ModalShell.Actions>
      </ModalShell>
    );
  }

  // Mobile/Tablet: Use BottomSheet
  return (
    <BottomSheet open={open} onOpenChange={setOpen}>
      <BottomSheet.Header>
        <h2>Create New Project</h2>
        <p className="text-sm">Step {step} of 3</p>
      </BottomSheet.Header>

      <BottomSheet.Content>
        <div className="space-y-4 p-6">
          {step === 1 && <Step1Fields />}
          {step === 2 && <Step2Fields />}
          {step === 3 && <Step3Fields />}
        </div>
      </BottomSheet.Content>

      <BottomSheet.Footer>
        <div className="flex flex-col gap-2 p-4">
          <Button color="primary" fullSized onClick={() => step === 3 ? onSubmit() : setStep(step + 1)}>
            {step === 3 ? 'Create Project' : 'Next'}
          </Button>
          {step > 1 && (
            <Button color="light" fullSized onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          <Button color="light" fullSized onClick={onClose}>
            Cancel
          </Button>
        </div>
      </BottomSheet.Footer>
    </BottomSheet>
  );
}
```

**Adaptive UX:**
- **Desktop:** Centered modal (keyboard-first, ESC to close)
- **Mobile:** Bottom sheet (gesture-first, swipe to dismiss)
- **Same logic, different presentation**

---

## Pattern 6: Command Palette + Toast Stack

**Stack:** CommandPaletteShell + ToastShell (HUD layer)

```tsx
import { CommandPaletteShell, ToastShell, useToast } from '@intstudio/ds';

export function AppWithCommands() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { addToast } = useToast();

  // Global ⌘K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCommand = (command: Command) => {
    setPaletteOpen(false);
    
    // Execute command
    switch (command.id) {
      case 'goto-dashboard':
        router.push('/dashboard');
        addToast({ message: 'Navigated to Dashboard', type: 'success' });
        break;
      case 'create-project':
        openCreateProjectModal();
        break;
      // ... more commands
    }
  };

  return (
    <>
      <AppShell>{/* Your app */}</AppShell>

      {/* Command Palette (HUD layer) */}
      <CommandPaletteShell
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
      >
        <CommandPaletteShell.Search
          placeholder="Type a command or search..."
        />
        <CommandPaletteShell.Results>
          {filteredCommands.map(cmd => (
            <CommandItem
              key={cmd.id}
              {...cmd}
              onClick={() => handleCommand(cmd)}
            />
          ))}
        </CommandPaletteShell.Results>
        <CommandPaletteShell.FooterHints>
          <kbd>↑↓</kbd> Navigate
          <kbd>↵</kbd> Execute
          <kbd>ESC</kbd> Close
        </CommandPaletteShell.FooterHints>
      </CommandPaletteShell>

      {/* Toast Stack (HUD layer) */}
      <ToastShell position="top-right" />
    </>
  );
}
```

**Result:**
- ⌘K opens command palette (topmost layer)
- Toasts appear above all other UI
- Zero z-index conflicts (token-driven layering)

---

## Key Takeaways

1. **Shells compose naturally:** AppShell → PageShell → WorkbenchShell → Flowbite components
2. **Slots have zero padding:** Your content provides spacing
3. **Responsive by default:** Shells adapt based on `useAppEnvironment()`
4. **Token-driven:** Colors/spacing from DS tokens, not hardcoded
5. **One codebase, infinite feels:** Desktop webby, mobile native, same code

**Shells are frames. Flowbite + tokens provide the skin.**
