import React from 'react';
import type { Preview } from '@storybook/react';
import { AppProvider } from '@intstudio/ds';

// Import built DS styles (includes all tokens and components)
import '@intstudio/ds/dist/index.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => {
      return (
        <AppProvider theme="light" onThemeChange={() => {}}>
          <Story />
        </AppProvider>
      );
    },
  ],
};

export default preview;
