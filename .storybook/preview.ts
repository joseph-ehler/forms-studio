import type { Preview } from '@storybook/react';
import { createElement } from 'react';
import { Flowbite } from 'flowbite-react';

// 1) Tokens (CSS vars) - single source of truth
import '../packages/tokens/src/tokens.css';

// 2) Flowbite base styles
import 'flowbite/dist/flowbite.css';

// 3) Tailwind utilities (if you have a shared entry point, use it here)
// For now, relying on Flowbite's base + your tokens

/**
 * Global decorator: wraps all stories in Flowbite theme provider
 * Ensures consistent styling with real app
 */
export const decorators = [
  (Story: any) =>
    createElement(
      Flowbite,
      {},
      createElement(
        'div',
        { className: 'min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white' },
        createElement(Story)
      )
    ),
];

const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    // A11y: reduce local noise (enforce strict checks in CI)
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: false, // Disable locally, enforce in CI
          },
        ],
      },
    },
    // Standard viewports for responsive testing
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: { width: '375px', height: '667px' },
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1440px', height: '900px' },
        },
      },
    },
  },
};

export default preview;
