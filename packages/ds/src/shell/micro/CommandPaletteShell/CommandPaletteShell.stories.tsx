/**
 * CommandPaletteShell Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { CommandPaletteShell } from './CommandPaletteShell';
import type { Command, CommandProvider } from './CommandPaletteShell';

const meta: Meta<typeof CommandPaletteShell> = {
  title: 'Shell/Micro/CommandPaletteShell',
  component: CommandPaletteShell,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
⌘K Command Palette Shell

**Composes:**
- overlay-policy (blocking stack)
- focus-policy (trap + restore)
- shortcut-broker (⌘K registration, 'palette' scope)
- shell-events (analytics)
- haptics (selection feedback on native)

**Features:**
- ⌘K/Ctrl+K to open
- ↑/↓ to navigate
- Enter to select
- Esc to close
- Fuzzy search (simple substring match)
- Haptics on selection (native only)

**Usage:**
\`\`\`tsx
<CommandPaletteShell
  open={open}
  onOpenChange={setOpen}
  commands={commands}
/>

// Press ⌘K to open
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CommandPaletteShell>;

// Sample commands (God-Tier Edition with descriptions, shortcuts, categories)
const sampleCommands: Command[] = [
  // Navigation
  {
    id: 'new-doc',
    label: 'New Document',
    description: 'Create a blank document',
    shortcut: '⌘N',
    category: 'Navigation',
    keywords: ['create', 'file'],
    onSelect: () => console.log('New Document'),
  },
  {
    id: 'search',
    label: 'Search Files',
    description: 'Find files in your workspace',
    shortcut: '⌘P',
    category: 'Navigation',
    keywords: ['find'],
    onSelect: () => console.log('Search'),
  },
  {
    id: 'go-to-line',
    label: 'Go to Line',
    description: 'Jump to a specific line number',
    shortcut: '⌘G',
    category: 'Navigation',
    keywords: ['jump', 'line'],
    onSelect: () => console.log('Go to Line'),
  },
  // Actions
  {
    id: 'save',
    label: 'Save',
    description: 'Save the current document',
    shortcut: '⌘S',
    category: 'Actions',
    keywords: ['write'],
    onSelect: () => console.log('Save'),
  },
  {
    id: 'save-as',
    label: 'Save As...',
    description: 'Save with a new name',
    shortcut: '⌘⇧S',
    category: 'Actions',
    keywords: ['write', 'copy'],
    onSelect: () => console.log('Save As'),
  },
  {
    id: 'export',
    label: 'Export PDF',
    description: 'Export document as PDF',
    category: 'Actions',
    keywords: ['download', 'print'],
    onSelect: () => console.log('Export PDF'),
  },
  {
    id: 'share',
    label: 'Share',
    description: 'Share with collaborators',
    category: 'Actions',
    keywords: ['send', 'email'],
    onSelect: () => console.log('Share'),
  },
  // Settings
  {
    id: 'open-settings',
    label: 'Open Settings',
    description: 'Configure preferences',
    shortcut: '⌘,',
    category: 'Settings',
    keywords: ['preferences', 'config'],
    onSelect: () => console.log('Open Settings'),
  },
  {
    id: 'toggle-theme',
    label: 'Toggle Dark Mode',
    description: 'Switch between light and dark themes',
    category: 'Settings',
    keywords: ['theme', 'dark', 'light'],
    onSelect: () => console.log('Toggle Theme'),
  },
  // Help
  {
    id: 'help',
    label: 'Open Help',
    description: 'View documentation',
    shortcut: 'F1',
    category: 'Help',
    keywords: ['docs', 'support'],
    onSelect: () => console.log('Help'),
  },
  {
    id: 'shortcuts',
    label: 'Keyboard Shortcuts',
    description: 'View all keyboard shortcuts',
    shortcut: '⌘K ⌘S',
    category: 'Help',
    keywords: ['keys', 'help'],
    onSelect: () => console.log('Shortcuts'),
  },
];

// Interactive wrapper
function InteractivePalette({ commands = sampleCommands }: { commands?: Command[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 0.5rem 0' }}>Command Palette Demo</h3>
        <p style={{ margin: '0 0 1rem 0', color: '#6b7280' }}>
          Press <kbd style={{ background: '#fff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #d1d5db' }}>⌘K</kbd> or <kbd style={{ background: '#fff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #d1d5db' }}>Ctrl+K</kbd> to open
        </p>
        <button
          onClick={() => setOpen(true)}
          style={{
            padding: '8px 16px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Open Palette Manually
        </button>
      </div>

      <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '8px' }}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>Keyboard Nav:</h4>
        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
          <li>↑/↓ to navigate</li>
          <li>Enter to select</li>
          <li>Esc to close</li>
          <li>Type to filter</li>
        </ul>
      </div>

      <div style={{ marginTop: '1rem', padding: '1rem', background: '#dbeafe', borderRadius: '8px' }}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>Events:</h4>
        <p style={{ margin: 0, fontSize: '14px', color: '#1e40af' }}>
          Open console and check: <code>__shellEventsDebug.getEventLog()</code>
        </p>
      </div>

      <CommandPaletteShell
        open={open}
        onOpenChange={setOpen}
        commands={commands}
        onCommandSelect={(cmd) => {
          console.log('Command selected:', cmd.label);
        }}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <InteractivePalette />,
};

export const WithIcons: Story = {
  render: () => {
    const commandsWithIcons: Command[] = [
      {
        id: 'new',
        label: 'New Document',
        icon: <span>📄</span>,
        keywords: ['create', 'file'],
        onSelect: () => console.log('New'),
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: <span>⚙️</span>,
        keywords: ['preferences'],
        onSelect: () => console.log('Settings'),
      },
      {
        id: 'search',
        label: 'Search',
        icon: <span>🔍</span>,
        keywords: ['find'],
        onSelect: () => console.log('Search'),
      },
      {
        id: 'theme',
        label: 'Toggle Theme',
        icon: <span>🌓</span>,
        keywords: ['dark', 'light'],
        onSelect: () => console.log('Theme'),
      },
    ];

    return <InteractivePalette commands={commandsWithIcons} />;
  },
};

export const ManyCommands: Story = {
  render: () => {
    const manyCommands: Command[] = Array.from({ length: 50 }, (_, i) => ({
      id: `cmd-${i}`,
      label: `Command ${i + 1}`,
      keywords: [`option${i}`, `item${i}`],
      onSelect: () => console.log(`Command ${i + 1}`),
    }));

    return <InteractivePalette commands={manyCommands} />;
  },
};

export const EmptyState: Story = {
  render: () => <InteractivePalette commands={[]} />,
};

export const CustomPlaceholder: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div style={{ padding: '2rem' }}>
        <button onClick={() => setOpen(true)}>Open Palette</button>
        <CommandPaletteShell
          open={open}
          onOpenChange={setOpen}
          commands={sampleCommands}
          placeholder="Search for actions..."
        />
      </div>
    );
  },
};

export const WithProviders: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    // Fake async provider (simulates API search)
    const fakeDocsProvider: CommandProvider = {
      id: 'docs',
      placeholder: 'Search docs or commands…',
      async search(query) {
        // Simulate network delay
        await new Promise(r => setTimeout(r, 300));
        if (!query) return [];
        
        // Return fake results based on query
        return [
          {
            id: `doc-${query}-1`,
            label: `Documentation for "${query}"`,
            description: 'View help docs',
            category: 'Documentation',
            icon: <span>📚</span>,
            onSelect: () => console.log(`Open docs for: ${query}`),
          },
          {
            id: `doc-${query}-2`,
            label: `API Reference: ${query}`,
            description: 'View API documentation',
            category: 'Documentation',
            icon: <span>🔧</span>,
            onSelect: () => console.log(`Open API docs for: ${query}`),
          },
        ];
      },
    };

    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Async Providers Demo</h3>
          <p style={{ margin: '0 0 1rem 0', color: '#6b7280' }}>
            Type to search both static commands AND dynamic documentation results
          </p>
          <button
            onClick={() => setOpen(true)}
            style={{
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Open Palette with Providers
          </button>
        </div>

        <div style={{ padding: '1rem', background: '#dbeafe', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 0.5rem 0' }}>Features:</h4>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            <li>Static commands (instant)</li>
            <li>Dynamic docs search (300ms delay)</li>
            <li>Loading spinner while fetching</li>
            <li>Fuzzy search on all results</li>
            <li>Recent commands tracked</li>
          </ul>
        </div>

        <CommandPaletteShell
          open={open}
          onOpenChange={setOpen}
          commands={sampleCommands}
          providers={[fakeDocsProvider]}
        />
      </div>
    );
  },
};
