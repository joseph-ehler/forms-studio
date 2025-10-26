import type { Preview } from '@storybook/react';
import { createElement } from 'react';
import { Flowbite } from 'flowbite-react';
import { dsFlowbiteTheme } from '../packages/ds/src/primitives/Sheet/flowbiteTheme';

// 1) Tokens (CSS vars) - single source of truth
import '../packages/tokens/src/tokens.css';

// 2) Flowbite base styles
import 'flowbite/dist/flowbite.css';

// 3) Vaul drawer styles (for Sheet primitive)
import '../node_modules/vaul/style.css';

// 4) DS styles (includes Sheet.css with backdrop fix)
import '../packages/ds/src/primitives/Sheet/Sheet.css';

/**
 * Global decorator: wraps all stories in Flowbite theme provider
 * Uses dsFlowbiteTheme for DS token parity
 */
export const decorators = [
  (Story: any) => {
    return createElement(
      Flowbite,
      { theme: { theme: dsFlowbiteTheme } },
      createElement(
        'div',
        { className: 'min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white' },
        createElement(Story, null)
      )
    );
  },
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
