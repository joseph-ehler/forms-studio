# CommandPaletteShell → God Tier Roadmap

**Current Status:** MVP Working ✅  
**Goal:** Production-ready, world-class command palette  
**Effort:** ~3-4 days total

---

## P1: Quick Wins (1 day) - **Do This First**

### 1. Command Descriptions & Shortcuts (2 hours)

**Add to Command interface:**
```typescript
interface Command {
  id: string;
  label: string;
  description?: string;     // NEW: Subtitle text
  shortcut?: string;        // NEW: "⌘S" or "Ctrl+Shift+P"
  icon?: React.ReactNode;
  keywords?: string[];
  onSelect: () => void;
}
```

**Update UI:**
```tsx
<li className="ds-cp-item">
  {cmd.icon && <span className="ds-cp-icon">{cmd.icon}</span>}
  <div className="ds-cp-text">
    <span className="ds-cp-label">{cmd.label}</span>
    {cmd.description && (
      <span className="ds-cp-description">{cmd.description}</span>
    )}
  </div>
  {cmd.shortcut && (
    <kbd className="ds-cp-shortcut">{cmd.shortcut}</kbd>
  )}
</li>
```

**CSS:**
```css
.ds-cp-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ds-cp-description {
  font-size: 12px;
  color: var(--ds-text-muted, #6b7280);
}

.ds-cp-shortcut {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--ds-surface-raised, #f3f4f6);
  color: var(--ds-text-muted, #6b7280);
  font-family: 'SF Mono', Monaco, monospace;
}
```

**Impact:** Professional look, better UX

---

### 2. Keyboard Hints Footer (1 hour)

**Add footer to palette:**
```tsx
<div className="ds-cp-footer">
  <span className="ds-cp-hint">
    <kbd>↑↓</kbd> Navigate
  </span>
  <span className="ds-cp-hint">
    <kbd>Enter</kbd> Select
  </span>
  <span className="ds-cp-hint">
    <kbd>Esc</kbd> Close
  </span>
</div>
```

**CSS:**
```css
.ds-cp-footer {
  display: flex;
  gap: 16px;
  padding: 8px 16px;
  border-top: 1px solid var(--ds-border-subtle, #e5e7eb);
  background: var(--ds-surface-raised, #f9fafb);
  font-size: 12px;
  color: var(--ds-text-muted, #6b7280);
}

.ds-cp-hint kbd {
  padding: 2px 4px;
  border-radius: 3px;
  background: var(--ds-surface-base, #fff);
  border: 1px solid var(--ds-border-subtle, #e5e7eb);
  font-family: inherit;
  font-size: 11px;
}
```

**Impact:** Discoverability, guides new users

---

### 3. Command Categories (2 hours)

**Update Command interface:**
```typescript
interface Command {
  // ... existing
  category?: string;  // NEW: "Navigation", "Actions", "Settings"
}
```

**Group and render by category:**
```tsx
const grouped = React.useMemo(() => {
  const groups: Record<string, Command[]> = {};
  filtered.forEach(cmd => {
    const cat = cmd.category || 'Other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(cmd);
  });
  return groups;
}, [filtered]);

// Render:
{Object.entries(grouped).map(([category, cmds]) => (
  <React.Fragment key={category}>
    <li className="ds-cp-category">{category}</li>
    {cmds.map((cmd, idx) => (
      <li key={cmd.id} className="ds-cp-item">
        {/* ... */}
      </li>
    ))}
  </React.Fragment>
))}
```

**CSS:**
```css
.ds-cp-category {
  padding: 8px 16px 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ds-text-muted, #6b7280);
  background: var(--ds-surface-raised, #f9fafb);
  position: sticky;
  top: 0;
  z-index: 1;
}
```

**Impact:** Organization, scalability

---

### 4. Better Empty State (30 min)

**Replace simple "No results" with:**
```tsx
{filtered.length === 0 && (
  <div className="ds-cp-empty-state">
    <span className="ds-cp-empty-icon">🔍</span>
    <p className="ds-cp-empty-title">No commands found</p>
    <p className="ds-cp-empty-hint">
      Try a different search term
    </p>
  </div>
)}
```

**CSS:**
```css
.ds-cp-empty-state {
  padding: 32px 16px;
  text-align: center;
}

.ds-cp-empty-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
  opacity: 0.5;
}

.ds-cp-empty-title {
  margin: 0 0 4px 0;
  font-weight: 500;
  color: var(--ds-text-base, #111827);
}

.ds-cp-empty-hint {
  margin: 0;
  font-size: 14px;
  color: var(--ds-text-muted, #6b7280);
}
```

**Impact:** Better UX when no matches

---

## P2: Production Features (1.5 days) - **Next Sprint**

### 1. Fuzzy Search (3 hours)

**Install:**
```bash
pnpm add fuse.js
```

**Implement:**
```typescript
import Fuse from 'fuse.js';

const fuse = React.useMemo(() => {
  return new Fuse(commands, {
    keys: ['label', 'keywords', 'description'],
    threshold: 0.3,
    includeScore: true,
  });
}, [commands]);

const filtered = query
  ? fuse.search(query).map(result => result.item)
  : commands;
```

**Impact:** Better search, typo tolerance

---

### 2. Recent Commands (4 hours)

**Add storage:**
```typescript
const RECENT_KEY = 'commandpalette:recent';

const [recentIds, setRecentIds] = React.useState<string[]>(() => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
});

const trackRecent = (cmdId: string) => {
  const updated = [cmdId, ...recentIds.filter(id => id !== cmdId)].slice(0, 5);
  setRecentIds(updated);
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
};

// On select:
const onSelect = (cmd: Command) => {
  trackRecent(cmd.id);
  // ... rest
};
```

**Show recent section:**
```tsx
{!query && recentCommands.length > 0 && (
  <>
    <li className="ds-cp-category">Recent</li>
    {recentCommands.map(cmd => (
      <li key={cmd.id} className="ds-cp-item">{/* ... */}</li>
    ))}
    <li className="ds-cp-divider" />
  </>
)}
```

**Impact:** Faster access to common commands

---

### 3. Command Providers (Async Sources) (5 hours)

**New interface:**
```typescript
interface CommandProvider {
  id: string;
  search: (query: string) => Promise<Command[]>;
  placeholder?: string;
}

interface CommandPaletteShellProps {
  commands?: Command[];          // Static
  providers?: CommandProvider[]; // Dynamic
  // ...
}
```

**Implementation:**
```typescript
const [dynamicCommands, setDynamicCommands] = React.useState<Command[]>([]);
const [isLoading, setIsLoading] = React.useState(false);

// Debounced search
React.useEffect(() => {
  if (!providers || !query) {
    setDynamicCommands([]);
    return;
  }
  
  const timer = setTimeout(async () => {
    setIsLoading(true);
    const results = await Promise.all(
      providers.map(p => p.search(query))
    );
    setDynamicCommands(results.flat());
    setIsLoading(false);
  }, 200);
  
  return () => clearTimeout(timer);
}, [query, providers]);

// Merge static + dynamic
const allCommands = [...(commands || []), ...dynamicCommands];
```

**Loading state:**
```tsx
{isLoading && (
  <li className="ds-cp-loading">
    <span className="ds-cp-spinner" />
    Searching...
  </li>
)}
```

**Impact:** Dynamic commands, API integration

---

### 4. Mobile Full-Screen Mode (2 hours)

**Detect mobile:**
```typescript
import { useAppEnvironment } from '../../core/environment';

const env = useAppEnvironment();
const isMobile = env.mode === 'mobile';
```

**Conditional styling:**
```css
.ds-cp-container[data-mobile="true"] {
  inset: 0;
  width: 100%;
  max-height: 100vh;
  border-radius: 0;
}

.ds-cp-list[data-mobile="true"] {
  max-height: calc(100vh - 120px);
}
```

**Impact:** Native mobile feel

---

## P3: Advanced Features (1 day) - **When Needed**

### 1. Virtualized List (4 hours)

**For 1000+ commands:**
```bash
pnpm add react-window
```

```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={360}
  itemCount={filtered.length}
  itemSize={44}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      {/* Render command at index */}
    </div>
  )}
</FixedSizeList>
```

**Impact:** Performance with massive command lists

---

### 2. Command Actions (Multi-Select) (3 hours)

**Support sub-actions:**
```typescript
interface Command {
  // ... existing
  actions?: Array<{
    id: string;
    label: string;
    onSelect: () => void;
  }>;
}
```

**UI:**
```tsx
// On →: Show actions
// On ←: Go back to commands
```

**Impact:** Nested workflows

---

### 3. Global Command Registry (5 hours)

**Create registry:**
```typescript
// shell/behavior/command-registry.ts
const registry = new Map<string, Command>();

export function registerCommand(cmd: Command) {
  registry.set(cmd.id, cmd);
  return () => registry.delete(cmd.id);
}

export function getCommands(): Command[] {
  return Array.from(registry.values());
}

export function useCommandRegistry() {
  const [commands, setCommands] = React.useState(getCommands);
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCommands(getCommands());
    }, 100);
    return () => clearInterval(interval);
  }, []);
  
  return commands;
}
```

**Usage:**
```typescript
// Anywhere in app:
React.useEffect(() => {
  return registerCommand({
    id: 'my-command',
    label: 'My Action',
    onSelect: () => {},
  });
}, []);

// In palette:
const commands = useCommandRegistry();
```

**Impact:** Dynamic command registration across app

---

## Implementation Priority

### Week 1 (P1 - Quick Wins)
**Day 1:**
- ✅ Descriptions & shortcuts (2h)
- ✅ Keyboard hints footer (1h)
- ✅ Command categories (2h)
- ✅ Better empty state (30min)

**Effort:** 1 day  
**Impact:** Professional polish

---

### Week 2 (P2 - Production)
**Days 2-3:**
- ✅ Fuzzy search (3h)
- ✅ Recent commands (4h)
- ✅ Async providers (5h)
- ✅ Mobile full-screen (2h)

**Effort:** 1.5 days  
**Impact:** Production-ready

---

### Later (P3 - Advanced)
**When you have 1000+ commands or need nested actions:**
- Virtualized list (4h)
- Command actions (3h)
- Global registry (5h)

**Effort:** 1 day  
**Impact:** Enterprise-scale

---

## God Tier Checklist

**UX:**
- [x] Works (MVP)
- [ ] Descriptions & shortcuts shown
- [ ] Keyboard hints visible
- [ ] Commands categorized
- [ ] Better empty states
- [ ] Fuzzy search
- [ ] Recent commands
- [ ] Loading states

**Tech:**
- [x] Composes A+ foundations
- [x] TypeScript complete
- [x] Accessibility ready
- [x] Events emitted
- [x] Haptics ready
- [x] Motion tokens
- [ ] Async command sources
- [ ] Mobile optimized
- [ ] Virtualization (if needed)

**Production:**
- [ ] All P1 features
- [ ] All P2 features
- [ ] Storybook stories updated
- [ ] Usage docs
- [ ] Migration guide

---

## Quick Start: P1 Today

**Start with descriptions & shortcuts:**

```typescript
// Update your commands:
const commands: Command[] = [
  {
    id: 'new-doc',
    label: 'New Document',
    description: 'Create a blank document',  // NEW
    shortcut: '⌘N',                          // NEW
    icon: <span>📄</span>,
    keywords: ['create', 'file'],
    onSelect: () => {},
  },
  // ...
];
```

**Then add the footer and categories.**

**In 1 day, you'll have a god-tier palette.**

---

## ROI

**Time Investment:**
- P1: 1 day → Professional polish
- P2: 1.5 days → Production ready
- P3: 1 day → Enterprise scale

**Total:** 3.5 days for world-class command palette

**Value:** Every app needs ⌘K. Build it once, use everywhere.

---

**Start with P1 today. Ship god-tier by next week.** 🚀
