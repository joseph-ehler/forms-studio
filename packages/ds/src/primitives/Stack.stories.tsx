import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from './Stack';
import { Card } from './Card';

const meta: Meta<typeof Stack> = {
  title: 'Primitives/Stack',
  component: Stack,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Stack>;

export const TightSpacing: Story = {
  render: () => (
    <Stack spacing="tight" style={{ width: 360 }}>
      <Card>Item A</Card>
      <Card>Item B</Card>
      <Card>Item C</Card>
    </Stack>
  ),
};

export const NormalSpacing: Story = {
  render: () => (
    <Stack spacing="normal" style={{ width: 360 }}>
      <Card>Item A</Card>
      <Card>Item B</Card>
      <Card>Item C</Card>
    </Stack>
  ),
};

export const RelaxedSpacing: Story = {
  render: () => (
    <Stack spacing="relaxed" style={{ width: 360 }}>
      <Card>Item A</Card>
      <Card>Item B</Card>
      <Card>Item C</Card>
    </Stack>
  ),
};

export const HorizontalRow: Story = {
  render: () => (
    <Stack direction="row" spacing="normal">
      <Card>Item A</Card>
      <Card>Item B</Card>
      <Card>Item C</Card>
    </Stack>
  ),
};

export const Wrapped: Story = {
  render: () => (
    <Stack direction="row" spacing="normal" wrap style={{ width: 200 }}>
      <Card>Item A</Card>
      <Card>Item B</Card>
      <Card>Item C</Card>
      <Card>Item D</Card>
      <Card>Item E</Card>
    </Stack>
  ),
};
