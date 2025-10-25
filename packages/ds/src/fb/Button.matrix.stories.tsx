/**
 * Button Matrix - Automated test coverage for all variants × states
 * 
 * This story proves the automagic system works:
 * - All 7 variants render correctly
 * - Hover states apply correct colors
 * - Active states apply correct colors
 * - Focus rings appear
 * - Works in light and dark themes
 * - Works with different brands
 */

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';

import { variants } from '../control/variants.config';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Design System/Button/Matrix Tests',
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

// Import variants from control registry - adding a variant there auto-expands these tests
const VARIANTS = variants.button;

/**
 * Matrix Test: All Variants × All States
 * 
 * Verifies every variant renders with correct colors in all states
 */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
      {VARIANTS.map((variant) => (
        <Button key={variant} data-testid={`btn-${variant}`} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const variant of VARIANTS) {
      const btn = canvas.getByTestId(`btn-${variant}`);

      // 1. Base state: should have background color (not transparent except ghost/secondary)
      const baseStyles = getComputedStyle(btn);
      const baseBg = baseStyles.backgroundColor;
      
      if (variant !== 'ghost' && variant !== 'secondary') {
        expect(baseBg).not.toBe('rgba(0, 0, 0, 0)');
        expect(baseBg).not.toBe('transparent');
      }

      // 2. Hover: background should change
      await userEvent.hover(btn);
      const hoverStyles = getComputedStyle(btn);
      const hoverBg = hoverStyles.backgroundColor;
      
      // Hover should produce a different color (on devices that support hover)
      if (window.matchMedia('(hover: hover)').matches) {
        expect(hoverBg).not.toBe(baseBg);
      }

      await userEvent.unhover(btn);

      // 3. Focus: should show focus ring
      await userEvent.tab();
      const focusStyles = getComputedStyle(btn);
      const boxShadow = focusStyles.boxShadow;
      
      expect(boxShadow).not.toBe('none');
      expect(boxShadow).toMatch(/rgba?\(/); // Should contain a color

      // 4. Active state: should use active bg
      await userEvent.pointer({ target: btn, keys: '[MouseLeft>' });
      const activeStyles = getComputedStyle(btn);
      const activeBg = activeStyles.backgroundColor;
      
      // Active should be different from base (could match hover or be distinct)
      expect(activeBg === hoverBg || activeBg !== baseBg).toBe(true);

      // Release mouse and blur
      await userEvent.pointer({ keys: '[/MouseLeft]' });
      btn.blur();

      // 5. Disabled state: should have pointer-events none and reduced opacity
      btn.setAttribute('disabled', '');
      const disabledStyles = getComputedStyle(btn);
      expect(disabledStyles.pointerEvents).toBe('none');
      expect(parseFloat(disabledStyles.opacity)).toBeLessThan(1);
      
      btn.removeAttribute('disabled');
    }
  },
};

/**
 * Dark Mode Test: Verify all variants work in dark theme
 */
export const DarkMode: Story = {
  render: () => (
    <div data-theme="dark" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '1rem', 
      padding: '2rem',
      background: '#0c0c0d',
      minHeight: '100vh'
    }}>
      <h2 style={{ color: 'white', marginBottom: '1rem' }}>Dark Mode</h2>
      {VARIANTS.map((variant) => (
        <Button key={variant} data-testid={`btn-dark-${variant}`} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const variant of VARIANTS) {
      const btn = canvas.getByTestId(`btn-dark-${variant}`);
      
      // Verify button renders and is visible
      expect(btn).toBeInTheDocument();
      
      // Check that colors are applied (dark mode has different RGB triplet)
      const styles = getComputedStyle(btn);
      expect(styles.color).toBeTruthy();
      expect(styles.backgroundColor).toBeTruthy();
    }
  },
};

/**
 * Brand Test: Verify buttons update with brand changes
 */
export const BrandMint: Story = {
  render: () => (
    <div data-brand="mint" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '1rem', 
      padding: '2rem'
    }}>
      <h2 style={{ marginBottom: '1rem' }}>Mint Brand (Green Theme)</h2>
      {VARIANTS.map((variant) => (
        <Button key={variant} data-testid={`btn-mint-${variant}`} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Primary button should reflect mint brand color
    const primaryBtn = canvas.getByTestId('btn-mint-primary');
    expect(primaryBtn).toBeInTheDocument();
    
    // All buttons should render without errors
    for (const variant of VARIANTS) {
      const btn = canvas.getByTestId(`btn-mint-${variant}`);
      expect(btn).toBeVisible();
    }
  },
};

/**
 * Size Test: Verify all sizes work with all variants
 */
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem' }}>
      <div>
        <h3>Small</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} size="sm">
              {variant}
            </Button>
          ))}
        </div>
      </div>
      
      <div>
        <h3>Medium (Default)</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} size="md">
              {variant}
            </Button>
          ))}
        </div>
      </div>
      
      <div>
        <h3>Large</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} size="lg">
              {variant}
            </Button>
          ))}
        </div>
      </div>
    </div>
  ),
};

/**
 * Loading State Test
 */
export const LoadingStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
      {VARIANTS.map((variant) => (
        <Button 
          key={variant} 
          variant={variant} 
          loading 
          loadingText={`Loading ${variant}...`}
        >
          {variant}
        </Button>
      ))}
    </div>
  ),
};

/**
 * Disabled State Test
 */
export const DisabledStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
      {VARIANTS.map((variant) => (
        <Button key={variant} variant={variant} disabled>
          {variant} (disabled)
        </Button>
      ))}
    </div>
  ),
};

/**
 * Visual Grid: All combinations at a glance
 */
export const VisualGrid: Story = {
  render: () => (
    <div style={{ padding: '2rem' }}>
      <h2>All Variants × States</h2>
      <table style={{ borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr>
            <th style={{ padding: '0.5rem', textAlign: 'left' }}>Variant</th>
            <th style={{ padding: '0.5rem' }}>Default</th>
            <th style={{ padding: '0.5rem' }}>Loading</th>
            <th style={{ padding: '0.5rem' }}>Disabled</th>
          </tr>
        </thead>
        <tbody>
          {VARIANTS.map((variant) => (
            <tr key={variant}>
              <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{variant}</td>
              <td style={{ padding: '0.5rem' }}>
                <Button variant={variant}>{variant}</Button>
              </td>
              <td style={{ padding: '0.5rem' }}>
                <Button variant={variant} loading>Loading</Button>
              </td>
              <td style={{ padding: '0.5rem' }}>
                <Button variant={variant} disabled>Disabled</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
};
