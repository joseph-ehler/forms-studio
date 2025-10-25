import type { Meta, StoryObj } from '@storybook/react';

import { useDisclosure } from '../hooks/useDisclosure';
import { Button } from './Button';
import { Drawer } from './Drawer';

const meta: Meta<typeof Drawer> = {
  title: 'FB/Drawer',
  component: Drawer,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Drawer>;

export const Basic: Story = {
  render: () => {
    const d = useDisclosure();
    return (
      <div style={{ height: 200 }}>
        <Button onClick={d.onOpen}>Open Drawer</Button>
        <Drawer ariaLabel="Notifications" position="right" {...d.props}>
          <div className="p-4">Drawer content</div>
        </Drawer>
      </div>
    );
  },
};
