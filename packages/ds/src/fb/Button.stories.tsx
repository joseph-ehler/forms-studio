/**
 * Button Stories - Automagic, production-unbreakable
 * 
 * Demonstrates:
 * - All 7 variants (automagic skin variables)
 * - All 3 sizes  
 * - Icon slots
 * - Loading states
 * - Dark mode & brand theming
 * - Interaction (play functions)
 * - A11y (axe tests)
 * 
 * See Button.matrix.stories.tsx for automated test coverage
 */

import type { Meta, StoryObj } from '@storybook/react';
import { expect,userEvent, within } from '@storybook/test';

import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'DS/FB/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: 'Button',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'success', 'warning', 'danger', 'info'],
      description: 'Semantic variant (automagic skin variables)',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size (bound to density tokens)',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading spinner',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable button',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// ============================================
// VARIANTS
// ============================================

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Action',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Action',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Action',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Delete',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Confirm',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Proceed with Caution',
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'Learn More',
  },
};

// ============================================
// SIZES
// ============================================

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

// ============================================
// STATES
// ============================================

export const Loading: Story = {
  args: {
    loading: true,
    loadingText: 'Saving...',
    children: 'Save',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
};

// ============================================
// ICONS
// ============================================

const SaveIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 12l-4-4h2.5V2h3v6H12l-4 4z"/>
    <path d="M14 14H2v-2h12v2z"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 0l6 8H2L8 0z"/>
  </svg>
);

export const WithIconLeft: Story = {
  args: {
    iconLeft: <SaveIcon />,
    children: 'Save',
  },
};

export const WithIconRight: Story = {
  args: {
    iconRight: <ArrowIcon />,
    children: 'Continue',
  },
};

export const WithBothIcons: Story = {
  args: {
    iconLeft: <SaveIcon />,
    iconRight: <ArrowIcon />,
    children: 'Export',
  },
};

// ============================================
// INTERACTION TESTS
// ============================================

export const InteractionTest: Story = {
  args: {
    children: 'Click Me',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    
    // Test initial state
    expect(button).toHaveAttribute('data-component', 'button');
    expect(button).toHaveAttribute('data-variant', 'primary');
    
    // Test click
    await userEvent.click(button);
    
    // Test keyboard navigation
    button.focus();
    expect(button).toHaveFocus();
  },
};

// ============================================
// VARIANT MATRIX (all combos)
// ============================================

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {(['primary', 'secondary', 'ghost', 'success', 'warning', 'danger', 'info'] as const).map(variant => (
        <div key={variant} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ width: '100px', textAlign: 'right', fontSize: '14px', textTransform: 'capitalize' }}>
            {variant}:
          </div>
          <Button variant={variant} size="sm">Small</Button>
          <Button variant={variant} size="md">Medium</Button>
          <Button variant={variant} size="lg">Large</Button>
          <Button variant={variant} disabled>Disabled</Button>
          <Button variant={variant} loading loadingText="Loading">Loading</Button>
        </div>
      ))}
    </div>
  ),
};

// ============================================
// THEMING DEMOS
// ============================================

export const DarkMode: Story = {
  render: () => (
    <div data-theme="dark" style={{ background: '#0c0c0d', padding: '2rem', borderRadius: '8px' }}>
      <h3 style={{ color: 'white', marginBottom: '1rem' }}>Dark Mode</h3>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {(['primary', 'secondary', 'ghost', 'success', 'warning', 'danger', 'info'] as const).map(variant => (
          <Button key={variant} variant={variant}>{variant}</Button>
        ))}
      </div>
    </div>
  ),
};

export const BrandTheming: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3 style={{ marginBottom: '1rem' }}>Default Brand (Blue)</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="info">Info</Button>
        </div>
      </div>
      
      <div data-brand="mint">
        <h3 style={{ marginBottom: '1rem' }}>Mint Brand (Green)</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="info">Info</Button>
        </div>
      </div>
      
      <div data-brand="berry">
        <h3 style={{ marginBottom: '1rem' }}>Berry Brand (Purple)</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="info">Info</Button>
        </div>
      </div>
    </div>
  ),
};

// ============================================
// DIAGNOSTICS
// ============================================

export const Diagnostics: Story = {
  render: () => (
    <div>
      <p style={{ marginBottom: '1rem', fontSize: '14px', color: '#6b7280' }}>
        Open DevTools and inspect the button elements. Notice:
      </p>
      <ul style={{ marginBottom: '2rem', fontSize: '14px', color: '#6b7280', paddingLeft: '1.5rem' }}>
        <li><code>data-component="button"</code> for targeting</li>
        <li><code>data-variant="..."</code> for variant inspection</li>
        <li><code>data-size="..."</code> for size inspection</li>
        <li><code>aria-busy="true"</code> when loading</li>
        <li><code>style="--btn-fg: ...; --btn-bg: ..."</code> skin variables</li>
      </ul>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Button variant="primary">Primary</Button>
        <Button variant="success">Success</Button>
        <Button variant="ghost" loading>Loading</Button>
      </div>
      <p style={{ marginTop: '2rem', fontSize: '14px', color: '#6b7280' }}>
        💡 Automagic System: Change <code>--ds-role-primary-bg</code> in tokens.css → all primary buttons update
      </p>
    </div>
  ),
};
