import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  framework: {
    name: '@storybook/react-vite',
    options: { strictMode: true },
  },
  stories: [
    '../packages/**/src/**/*.stories.@(tsx|mdx)',
    '../apps/**/src/**/*.stories.@(tsx|mdx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
    '@storybook/addon-viewport',
    '@storybook/test',
  ],
  docs: {
    autodocs: true,
  },
  viteFinal: async (config) => {
    // Critical for pnpm monorepos to resolve linked workspaces like real packages
    config.resolve = config.resolve || {};
    config.resolve.preserveSymlinks = true;
    return config;
  },
};

export default config;
