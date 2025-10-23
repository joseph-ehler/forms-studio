import type { Preview } from '@storybook/react';
import React from 'react';

// Import DS token layers so stories look real
import '../src/styles/tokens/color.vars.css';
import '../src/styles/tokens/typography.vars.css';
import '../src/styles/tokens/surface.vars.css';
import '../src/styles/tokens/shell.vars.css';
import '../src/styles/tokens/section.vars.css';
import '../src/styles/tokens/media.vars.css';
import '../src/styles/tokens/input.vars.css';
import '../src/styles/tokens/button.vars.css';
import '../src/styles/tokens/density.vars.css';
import '../src/styles/tokens/a11y.vars.css';

const preview: Preview = {
  globalTypes: {
    brand: {
      name: 'Brand',
      description: 'White-label brand',
      toolbar: {
        icon: 'paintbrush',
        items: ['default', 'acme', 'techcorp', 'sunset'],
        showName: true,
      },
    },
    theme: {
      name: 'Theme',
      description: 'Light/Dark/System',
      toolbar: {
        icon: 'mirror',
        items: ['light', 'dark', 'system'],
        showName: true,
      },
    },
    a11yProfile: {
      name: 'A11Y',
      description: 'Accessibility profile',
      toolbar: {
        icon: 'accessibility',
        items: ['default', 'readable', 'lowVision', 'dyslexia', 'hyperlegible', 'motionSafe', 'colorblindSafe'],
        showName: true,
      },
    },
  },
  decorators: [
    (Story, ctx) => {
      // Apply brand/theme/a11y at runtime (uses your public APIs)
      const root = document.documentElement;
      root.setAttribute('data-brand', String(ctx.globals.brand || 'default'));
      const theme = String(ctx.globals.theme || 'system');
      if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      } else {
        root.setAttribute('data-theme', theme);
      }
      // Optional: call your applyA11y with a preset mapping
      // @ts-ignore
      import('../src/a11y/a11yProfiles').then(({ A11Y_PRESETS }) => {
        // @ts-ignore
        import('../src/a11y/applyA11y').then(({ applyA11y }) => {
          const key = String(ctx.globals.a11yProfile || 'default');
          const preset = A11Y_PRESETS[key] || {};
          applyA11y(preset);
        });
      });
      return <Story />;
    },
  ],
  parameters: {
    a11y: { element: '#root' },
    layout: 'centered',
  },
};

export default preview;
