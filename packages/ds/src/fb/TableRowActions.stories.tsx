import type { Meta, StoryObj } from '@storybook/react';

import { TableRowActions } from './TableRowActions';

const meta: Meta<typeof TableRowActions> = {
  title: 'FB/TableRowActions',
  component: TableRowActions,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof TableRowActions>;

export const Basic: Story = {
  render: () => (
    <div className="flex justify-end p-4">
      <TableRowActions
        actions={['show', 'edit', 'delete']}
        onAction={(a) => console.log('action:', a)}
      />
    </div>
  ),
};
