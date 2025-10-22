---
to: packages/wizard-react/src/fields/<%= name %>.stories.tsx
---
import type { Meta, StoryObj } from '@storybook/react'
import { <%= name %> } from './<%= name %>'

const meta = {
  title: 'Fields/<%= name %>',
  component: <%= name %>,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof <%= name %>>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Select...',
  },
}

export const WithValue: Story = {
  args: {
    value: new Date(),
    placeholder: 'Select date',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled',
  },
}

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  args: {
    placeholder: 'Select...',
  },
}
