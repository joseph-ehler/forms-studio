import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SelectField } from './SelectField';

const meta: Meta<typeof SelectField> = {
  title: 'Forms/Fields/SelectField',
  component: SelectField,
};
export default meta;

type Story = StoryObj<typeof SelectField>;

export const Basic: Story = {
  args: {
    type: 'select',
    name: 'country',
    label: 'Country',
    placeholder: 'Choose one',
    options: [
      { label: 'United States', value: 'us' },
      { label: 'Canada', value: 'ca' },
      { label: 'Mexico', value: 'mx' },
    ],
  },
};

export const WithError: Story = {
  args: {
    type: 'select',
    name: 'country',
    label: 'Country',
    placeholder: 'Choose one',
    options: [
      { label: 'United States', value: 'us' },
      { label: 'Canada', value: 'ca' },
    ],
    error: 'Please select a country',
  },
};

export const Disabled: Story = {
  args: {
    type: 'select',
    name: 'country',
    label: 'Country',
    placeholder: 'Choose one',
    options: [
      { label: 'United States', value: 'us' },
      { label: 'Canada', value: 'ca' },
    ],
    disabled: true,
  },
};
