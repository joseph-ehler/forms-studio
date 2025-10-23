import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(tsx|mdx)'],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
    '@storybook/addon-viewport',
    '@storybook/addon-toolbars',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {},
};

export default config;
