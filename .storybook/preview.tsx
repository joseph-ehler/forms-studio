import type { Preview } from '@storybook/react';

/**
 * Root Storybook Preview Configuration
 * 
 * Since this is a composition-only Storybook, preview config
 * is inherited from the composed Storybooks (DS and Forms).
 * 
 * This file can be used to set global parameters that apply
 * to the composed view (e.g., viewport presets, backgrounds).
 */

const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
