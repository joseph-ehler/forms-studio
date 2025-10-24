import type { StorybookConfig } from '@storybook/react-vite';

/**
 * Root Storybook - Composition View
 * 
 * This Storybook composes DS and Forms Storybooks into a unified showcase.
 * It has no local stories - all content comes from package-level Storybooks.
 * 
 * Architecture Benefits:
 * - Fast per-package development (isolated Storybooks)
 * - Unified showcase for design review
 * - Clear package boundaries (no coupling)
 * - Per-package versioning & deployment
 * 
 * Usage:
 *   pnpm storybook:all   # Start all 3 Storybooks
 *   pnpm storybook       # Start root composition only
 * 
 * See: docs/architecture/STORYBOOK_ARCHITECTURE.md
 */

const config: StorybookConfig = {
  // No local stories - composition only
  stories: [],
  
  // Compose from package-level Storybooks
  refs: {
    'design-system': {
      title: 'Design System',
      url: process.env.DS_STORYBOOK_URL || 'http://localhost:6006',
      expanded: true,
    },
    'forms': {
      title: 'Form Fields',
      url: process.env.FORMS_STORYBOOK_URL || 'http://localhost:6007',
      expanded: true,
    },
  },
  
  addons: [
    '@storybook/addon-essentials',
  ],
  
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  
  docs: {
    autodocs: 'tag',
  },
};

export default config;
