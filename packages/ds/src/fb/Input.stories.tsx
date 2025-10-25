import type { Meta, StoryObj } from '@storybook/react';

import { Field } from './Field';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'FB/Input',
  component: Input,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Basic: Story = {
  render: () => (
    <Field label="Email" id="email" hint="We'll never spam.">
      <Input id="email" type="email" placeholder="you@example.com" />
    </Field>
  ),
};

export const ErrorState: Story = {
  render: () => (
    <Field label="Email" id="email2" error="Invalid email">
      <Input id="email2" type="email" placeholder="you@example.com" error="Invalid email" />
    </Field>
  ),
};
