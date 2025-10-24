/**
 * CSS Shape Contract Tests
 * 
 * Validates that components enforce shape guarantees via CSS tokens
 * Guards against regression: min-heights, touch targets, spacing
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Helper: Get CSS custom property value
function getCSSVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// Helper: Parse CSS value to pixels
function parsePx(value: string): number {
  return parseFloat(value.replace('px', ''));
}

describe('CSS Shape Contracts', () => {
  describe('Touch Target Minimum (44px)', () => {
    test('Option enforces touch target', () => {
      render(<Option label="Test option" value="test" />);
      
      const option = screen.getByRole('option');
      const height = parsePx(getComputedStyle(option).height);
      const touchTarget = parsePx(getCSSVar('--ds-touch-target'));
      
      expect(height).toBeGreaterThanOrEqual(touchTarget);
    });

    test('Button enforces touch target', () => {
      render(<button className="ds-button">Click me</button>);
      
      const button = screen.getByRole('button');
      const minHeight = parsePx(getComputedStyle(button).minHeight);
      const touchTarget = parsePx(getCSSVar('--ds-touch-target'));
      
      expect(minHeight).toBeGreaterThanOrEqual(touchTarget);
    });

    test('Close button enforces touch target', () => {
      render(<button className="ds-icon-btn" aria-label="Close">×</button>);
      
      const button = screen.getByRole('button');
      const width = parsePx(getComputedStyle(button).width);
      const height = parsePx(getComputedStyle(button).height);
      const touchTarget = parsePx(getCSSVar('--ds-touch-target'));
      
      expect(width).toBeGreaterThanOrEqual(touchTarget);
      expect(height).toBeGreaterThanOrEqual(touchTarget);
    });
  });

  describe('Token Usage', () => {
    test('RoutePanel uses token for width', () => {
      render(
        <RoutePanel ariaLabel="Test panel">
          Content
        </RoutePanel>
      );
      
      const panel = document.querySelector('.ds-route-panel');
      const styles = getComputedStyle(panel!);
      
      // Should use CSS var, not hardcoded value
      expect(styles.width).toContain('var(--ds-route-panel-width');
    });

    test('FullScreenRoute uses token for z-index', () => {
      render(
        <FullScreenRoute ariaLabel="Test route">
          Content
        </FullScreenRoute>
      );
      
      const route = screen.getByRole('dialog');
      const zIndex = getComputedStyle(route).zIndex;
      const modalZ = getCSSVar('--ds-z-lane-modal');
      
      expect(zIndex).toBe(modalZ);
    });

    test('Button uses token for border-radius', () => {
      render(<button className="ds-button">Click</button>);
      
      const button = screen.getByRole('button');
      const borderRadius = getComputedStyle(button).borderRadius;
      const radius6 = getCSSVar('--ds-radius-6');
      
      expect(borderRadius).toBe(radius6);
    });
  });

  describe('Spacing Contracts', () => {
    test('RoutePanel content uses consistent padding', () => {
      render(
        <RoutePanel ariaLabel="Test">
          Content
        </RoutePanel>
      );
      
      const content = document.querySelector('.ds-route-panel__content');
      const padding = getComputedStyle(content!).padding;
      const space4 = getCSSVar('--ds-space-4');
      
      expect(padding).toContain(space4);
    });

    test('FlowScaffold header uses token spacing', () => {
      render(
        <FlowScaffold title="Test" step={1} total={3}>
          Content
        </FlowScaffold>
      );
      
      const header = document.querySelector('.ds-flow__header');
      const gap = getComputedStyle(header!).gap;
      const space3 = getCSSVar('--ds-space-3');
      
      expect(gap).toBe(space3);
    });
  });

  describe('Focus Indicators', () => {
    test('Button has visible focus outline', () => {
      render(<button className="ds-button">Click</button>);
      
      const button = screen.getByRole('button');
      button.focus();
      
      const outline = getComputedStyle(button).outline;
      
      // Should have non-zero outline when focused
      expect(outline).not.toBe('none');
      expect(outline).not.toBe('0px');
    });

    test('Option has focus indicator', () => {
      render(<Option label="Test" value="test" />);
      
      const option = screen.getByRole('option');
      option.focus();
      
      const outline = getComputedStyle(option).outline;
      
      expect(outline).not.toBe('none');
    });
  });

  describe('Reduced Motion', () => {
    beforeEach(() => {
      // Mock prefers-reduced-motion
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query.includes('prefers-reduced-motion: reduce'),
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));
    });

    test('FullScreenRoute disables animation', () => {
      render(
        <FullScreenRoute ariaLabel="Test">
          Content
        </FullScreenRoute>
      );
      
      const route = screen.getByRole('dialog');
      const transition = getComputedStyle(route).transition;
      
      // Should have no transition when reduced motion preferred
      expect(transition).toBe('none');
    });

    test('Button disables hover transition', () => {
      render(<button className="ds-button">Click</button>);
      
      const button = screen.getByRole('button');
      const transition = getComputedStyle(button).transition;
      
      expect(transition).toBe('none');
    });
  });

  describe('Safe Override Vars', () => {
    test('RoutePanel width can be overridden', () => {
      render(
        <RoutePanel
          ariaLabel="Test"
          style={{ '--ds-route-panel-width': '40rem' } as any}
        >
          Content
        </RoutePanel>
      );
      
      const panel = document.querySelector('.ds-route-panel');
      const width = getComputedStyle(panel!).width;
      
      expect(width).toBe('40rem');
    });

    test('RoutePanel z-index cannot be overridden', () => {
      render(
        <RoutePanel
          ariaLabel="Test"
          style={{ '--ds-z-lane-panel': '1' } as any}
        >
          Content
        </RoutePanel>
      );
      
      const panel = document.querySelector('.ds-route-panel');
      const zIndex = getComputedStyle(panel!).zIndex;
      const tokenZ = getCSSVar('--ds-z-lane-panel');
      
      // Should use token, not override
      expect(zIndex).toBe(tokenZ);
    });
  });

  describe('RTL Support', () => {
    test('Panel uses logical properties', () => {
      document.documentElement.setAttribute('dir', 'rtl');
      
      render(
        <RoutePanel ariaLabel="Test" position="right">
          Content
        </RoutePanel>
      );
      
      const panel = document.querySelector('.ds-route-panel--right');
      const styles = getComputedStyle(panel!);
      
      // In RTL, right panel should attach to left
      expect(styles.left).toBe('0px');
      expect(styles.right).toBe('auto');
      
      document.documentElement.removeAttribute('dir');
    });
  });
});
