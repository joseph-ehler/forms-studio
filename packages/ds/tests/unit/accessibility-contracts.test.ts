/**
 * Accessibility Contract Tests
 * 
 * Validates ARIA requirements and keyboard behavior
 * Uses axe-core for automated a11y scanning
 */

import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

expect.extend(toHaveNoViolations);

describe('Accessibility Contracts', () => {
  describe('FullScreenRoute', () => {
    test('has required ARIA attributes', () => {
      render(
        <FullScreenRoute ariaLabel="Checkout">
          Content
        </FullScreenRoute>
      );
      
      const dialog = screen.getByRole('dialog');
      
      expect(dialog).toHaveAttribute('aria-label', 'Checkout');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('tabindex', '-1');
    });

    test('passes axe scan', async () => {
      const { container } = render(
        <FullScreenRoute ariaLabel="Checkout">
          <h1>Checkout</h1>
          <button>Continue</button>
        </FullScreenRoute>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('traps focus within dialog', async () => {
      const user = userEvent.setup();
      
      render(
        <FullScreenRoute ariaLabel="Test">
          <button>First</button>
          <button>Second</button>
          <button>Third</button>
        </FullScreenRoute>
      );
      
      const first = screen.getByText('First');
      const third = screen.getByText('Third');
      
      // Tab from last element should cycle to first
      third.focus();
      await user.keyboard('{Tab}');
      
      expect(first).toHaveFocus();
    });

    test('Shift+Tab cycles backwards', async () => {
      const user = userEvent.setup();
      
      render(
        <FullScreenRoute ariaLabel="Test">
          <button>First</button>
          <button>Second</button>
        </FullScreenRoute>
      );
      
      const first = screen.getByText('First');
      const second = screen.getByText('Second');
      
      // Shift+Tab from first should go to last
      first.focus();
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      
      expect(second).toHaveFocus();
    });
  });

  describe('RoutePanel', () => {
    test('has correct role and label', () => {
      render(
        <RoutePanel ariaLabel="Filters">
          Content
        </RoutePanel>
      );
      
      const panel = screen.getByRole('complementary');
      
      expect(panel).toHaveAttribute('aria-label', 'Filters');
      expect(panel).toHaveAttribute('tabindex', '-1');
      expect(panel).not.toHaveAttribute('aria-modal');
    });

    test('passes axe scan', async () => {
      const { container } = render(
        <RoutePanel ariaLabel="Filters">
          <h2>Filter by</h2>
          <label>
            Category
            <select>
              <option>All</option>
            </select>
          </label>
        </RoutePanel>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('does not trap focus', async () => {
      const user = userEvent.setup();
      
      render(
        <>
          <button>Outside</button>
          <RoutePanel ariaLabel="Test">
            <button>Inside</button>
          </RoutePanel>
        </>
      );
      
      const inside = screen.getByText('Inside');
      const outside = screen.getByText('Outside');
      
      inside.focus();
      await user.keyboard('{Tab}');
      
      // Focus should escape panel
      expect(outside).toHaveFocus();
    });
  });

  describe('FlowScaffold', () => {
    test('announces progress', () => {
      render(
        <FlowScaffold title="Create project" step={2} total={3}>
          Content
        </FlowScaffold>
      );
      
      const progress = screen.getByText('Step 2 of 3');
      
      expect(progress).toHaveAttribute('aria-live', 'polite');
    });

    test('title is properly associated', () => {
      render(
        <FlowScaffold title="Create project" step={1} total={3}>
          Content
        </FlowScaffold>
      );
      
      const title = screen.getByText('Create project');
      const container = screen.getByRole('document');
      
      expect(title).toHaveAttribute('id', 'flow-title');
      expect(container).toHaveAttribute('aria-labelledby', 'flow-title');
    });

    test('passes axe scan', async () => {
      const { container } = render(
        <FlowScaffold
          title="Create project"
          step={1}
          total={3}
          footer={<button>Next</button>}
        >
          <label>
            Name
            <input type="text" />
          </label>
        </FlowScaffold>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation', () => {
    test('Esc closes RoutePanel', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      
      render(
        <RoutePanel ariaLabel="Test" onClose={onClose}>
          Content
        </RoutePanel>
      );
      
      await user.keyboard('{Escape}');
      
      expect(onClose).toHaveBeenCalled();
    });

    test('Esc triggers FullScreenRoute navigation', async () => {
      const user = userEvent.setup();
      const onBeforeExit = jest.fn(() => true);
      
      render(
        <FullScreenRoute ariaLabel="Test" onBeforeExit={onBeforeExit}>
          Content
        </FullScreenRoute>
      );
      
      await user.keyboard('{Escape}');
      
      expect(onBeforeExit).toHaveBeenCalled();
    });
  });

  describe('Screen Reader Announcements', () => {
    test('FlowScaffold announces step changes', async () => {
      const { rerender } = render(
        <FlowScaffold title="Test" step={1} total={3}>
          Step 1
        </FlowScaffold>
      );
      
      let liveRegion = screen.getByText('Step 1 of 3');
      expect(liveRegion).toBeInTheDocument();
      
      rerender(
        <FlowScaffold title="Test" step={2} total={3}>
          Step 2
        </FlowScaffold>
      );
      
      liveRegion = screen.getByText('Step 2 of 3');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Reduced Motion States', () => {
    beforeEach(() => {
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query.includes('prefers-reduced-motion: reduce'),
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));
    });

    test('FullScreenRoute respects reduced motion', async () => {
      const { container } = render(
        <FullScreenRoute ariaLabel="Test">
          Content
        </FullScreenRoute>
      );
      
      // Should still pass a11y even with reduced motion
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
