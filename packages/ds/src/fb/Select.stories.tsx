import type { Meta, StoryObj } from '@storybook/react';

import { Field } from './Field';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  title: 'FB/Select',
  component: Select,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Select>;

const opts = [
  { label: 'Private', value: 'private' },
  { label: 'Team', value: 'team' },
  { label: 'Public', value: 'public' },
];

export const Basic: Story = {
  render: () => (
    <Field label="Visibility" id="vis">
      <Select id="vis" options={opts} placeholder="Choose one…" />
    </Field>
  ),
};
