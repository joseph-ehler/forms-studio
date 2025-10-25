import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './Button';
import { Stack } from './Stack';

const meta: Meta<typeof Stack> = {
  title: 'FB/Stack',
  component: Stack,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Stack>;

export const Responsive: Story = {
  render: () => (
    <Stack direction="responsive" justify="between" spacing={4}>
      <Button>Left</Button>
      <Button variant="ghost">Center</Button>
      <Button variant="danger">Right</Button>
    </Stack>
  ),
};
