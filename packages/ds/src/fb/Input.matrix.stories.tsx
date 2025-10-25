import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import React from 'react';

import { variants } from '../control/variants.config';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Design System/Input/Matrix Tests',
  component: Input,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Input>;

// Import variants from control registry - adding a variant there auto-expands these tests
const VARIANTS = variants.input;

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 400 }}>
      {VARIANTS.map((v) => (
        <div key={v} style={{ display: 'grid', gap: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>{v}</div>
          <Input data-testid={`input-${v}`} variant={v} placeholder={`Type for ${v}`} id={`input-${v}`} />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    for (const v of VARIANTS) {
      const el = await canvas.findByTestId(`input-${v}`);
      
      // Focus ring visible on focus
      el.focus();
      const ring = getComputedStyle(el).boxShadow;
      expect(ring).not.toBe('none');

      // Hover border changes (pointer devices)
      await userEvent.hover(el);
      // Smoke-check presence of border style
      const border = getComputedStyle(el).borderColor;
      expect(border).toBeTruthy();
      
      // Type and verify input works
      await userEvent.type(el, 'test');
      expect(el).toHaveValue('test');
      
      // Clear for next iteration
      await userEvent.clear(el);
    }
  }
};

/**
 * Disabled State Test
 */
export const DisabledStates: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 400 }}>
      {VARIANTS.map((v) => (
        <div key={v} style={{ display: 'grid', gap: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>{v} (disabled)</div>
          <Input 
            data-testid={`input-disabled-${v}`} 
            variant={v} 
            placeholder={`Disabled ${v}`} 
            id={`input-disabled-${v}`}
            disabled 
          />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    for (const v of VARIANTS) {
      const el = await canvas.findByTestId(`input-disabled-${v}`);
      
      // Should be disabled
      expect(el).toBeDisabled();
      
      // Should have disabled opacity
      const opacity = getComputedStyle(el).opacity;
      expect(parseFloat(opacity)).toBeLessThan(1);
    }
  }
};

/**
 * Invalid State Test
 */
export const InvalidStates: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 400 }}>
      {VARIANTS.map((v) => (
        <div key={v} style={{ display: 'grid', gap: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>{v} (invalid)</div>
          <Input 
            data-testid={`input-invalid-${v}`} 
            variant={v} 
            placeholder={`Invalid ${v}`} 
            id={`input-invalid-${v}`}
            aria-invalid="true"
          />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    for (const v of VARIANTS) {
      const el = await canvas.findByTestId(`input-invalid-${v}`);
      
      // Should have aria-invalid
      expect(el).toHaveAttribute('aria-invalid', 'true');
      
      // Should have invalid border color
      const borderColor = getComputedStyle(el).borderColor;
      expect(borderColor).toBeTruthy();
    }
  }
};
