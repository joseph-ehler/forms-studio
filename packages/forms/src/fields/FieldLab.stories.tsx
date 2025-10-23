/**
 * Field Lab - Visual QA for all form fields
 * 
 * This story will be populated as fields are migrated.
 * Each migrated field gets added here for visual QA.
 */

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Forms/Field Lab',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Placeholder: Story = {
  render: () => (
    <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
      <h2>Field Lab - Coming Soon</h2>
      <p style={{ color: '#666' }}>
        Fields will be added here as they're migrated from DS to Forms.
      </p>
      <p style={{ color: '#666' }}>
        Use <code>pnpm process:migrate-batch</code> to migrate fields.
      </p>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
