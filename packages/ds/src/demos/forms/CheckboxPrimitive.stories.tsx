/**
 * Checkbox Primitive (.ds-checkbox) Stories
 * 
 * Visual validation for the new .ds-checkbox primitive
 * Phase 1 Beautification: Demonstrates correct checkbox styling
 * 
 * BEFORE: Checkboxes incorrectly used .ds-input (text input styling)
 * AFTER: Checkboxes use .ds-checkbox (proper checkbox styling)
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

// Dummy component to organize stories
const CheckboxPrimitiveDemo = () => <div />;

const meta = {
  title: 'Primitives/Checkbox',
  component: CheckboxPrimitiveDemo,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof CheckboxPrimitiveDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic checkbox with correct .ds-checkbox class
export const Basic: Story = {
  render: () => (
    <div style={{ padding: '2rem' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
        <input type="checkbox" className="ds-checkbox" />
        <span>I agree to the terms and conditions</span>
      </label>
    </div>
  ),
};

// Checked state
export const Checked: Story = {
  render: () => (
    <div style={{ padding: '2rem' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
        <input type="checkbox" className="ds-checkbox" defaultChecked />
        <span>Checkbox is checked</span>
      </label>
    </div>
  ),
};

// Disabled states
export const Disabled: Story = {
  render: () => (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'not-allowed' }}>
        <input type="checkbox" className="ds-checkbox" disabled />
        <span>Disabled unchecked</span>
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'not-allowed' }}>
        <input type="checkbox" className="ds-checkbox" disabled defaultChecked />
        <span>Disabled checked</span>
      </label>
    </div>
  ),
};

// Error state (aria-invalid)
export const Error: Story = {
  render: () => (
    <div style={{ padding: '2rem' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
        <input type="checkbox" className="ds-checkbox" aria-invalid="true" />
        <span style={{ color: 'var(--color-error, #B91C1C)' }}>You must accept the terms *</span>
      </label>
      <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--color-error, #B91C1C)' }}>
        This field is required
      </div>
    </div>
  ),
};

// Focus ring (keyboard navigation)
export const FocusRing: Story = {
  render: () => (
    <div style={{ padding: '2rem' }}>
      <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#64748B' }}>
        Click inside this area, then press <kbd style={{ padding: '0.125rem 0.25rem', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '0.25rem' }}>Tab</kbd> to focus the checkbox. 
        You should see a blue focus ring.
      </p>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
        <input type="checkbox" className="ds-checkbox" />
        <span>Tab to focus this checkbox</span>
      </label>
    </div>
  ),
};

// Comparison: Before (.ds-input) vs After (.ds-checkbox)
export const BeforeAfterComparison: Story = {
  render: () => (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 600 }}>
          ❌ BEFORE: Wrong class (.ds-input)
        </h3>
        <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#64748B' }}>
          Checkbox looked like a text input box - confusing!
        </p>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input type="checkbox" className="ds-input" style={{ width: 'auto' }} />
          <span>This is wrong (text input styling on checkbox)</span>
        </label>
      </div>

      <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 600 }}>
          ✅ AFTER: Correct class (.ds-checkbox)
        </h3>
        <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#64748B' }}>
          Clear checkbox appearance - proper square box with checkmark!
        </p>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input type="checkbox" className="ds-checkbox" />
          <span>This is correct (proper checkbox styling)</span>
        </label>
      </div>
    </div>
  ),
};

// All states in one view
export const AllStates: Story = {
  render: () => (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem', fontWeight: 600 }}>
        Checkbox States
      </h3>
      
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
        <input type="checkbox" className="ds-checkbox" />
        <span>Default (unchecked)</span>
      </label>
      
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
        <input type="checkbox" className="ds-checkbox" defaultChecked />
        <span>Checked</span>
      </label>
      
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'not-allowed' }}>
        <input type="checkbox" className="ds-checkbox" disabled />
        <span>Disabled unchecked</span>
      </label>
      
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'not-allowed' }}>
        <input type="checkbox" className="ds-checkbox" disabled defaultChecked />
        <span>Disabled checked</span>
      </label>
      
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
        <input type="checkbox" className="ds-checkbox" aria-invalid="true" />
        <span style={{ color: 'var(--color-error, #B91C1C)' }}>Error state *</span>
      </label>
    </div>
  ),
};
