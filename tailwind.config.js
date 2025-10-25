/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './apps/**/*.{ts,tsx,html}',
    './packages/**/*.{ts,tsx,html}',
    '.storybook/**/*.{ts,tsx,mdx}',
    '**/*.stories.@(tsx|mdx)',
    './node_modules/flowbite-react/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Bridge design tokens to Tailwind
      colors: {
        surface: {
          base: 'var(--ds-color-surface-base)',
          raised: 'var(--ds-color-surface-raised)',
          sunken: 'var(--ds-color-surface-sunken)',
          overlay: 'var(--ds-color-surface-overlay)',
        },
        text: {
          DEFAULT: 'var(--ds-color-text)',
          subtle: 'var(--ds-color-text-subtle)',
          muted: 'var(--ds-color-text-muted)',
          inverse: 'var(--ds-color-text-inverse)',
        },
        border: {
          subtle: 'var(--ds-color-border-subtle)',
          medium: 'var(--ds-color-border-medium)',
          strong: 'var(--ds-color-border-strong)',
        },
      },
      spacing: {
        0: 'var(--ds-space-0)',
        1: 'var(--ds-space-1)',
        2: 'var(--ds-space-2)',
        3: 'var(--ds-space-3)',
        4: 'var(--ds-space-4)',
        5: 'var(--ds-space-5)',
        6: 'var(--ds-space-6)',
        8: 'var(--ds-space-8)',
        10: 'var(--ds-space-10)',
        12: 'var(--ds-space-12)',
        16: 'var(--ds-space-16)',
        20: 'var(--ds-space-20)',
        24: 'var(--ds-space-24)',
      },
      borderRadius: {
        sm: 'var(--ds-radius-sm)',
        DEFAULT: 'var(--ds-radius-md)',
        md: 'var(--ds-radius-md)',
        lg: 'var(--ds-radius-lg)',
        xl: 'var(--ds-radius-xl)',
        full: 'var(--ds-radius-full)',
      },
    },
  },
  plugins: [
    require('flowbite/plugin'),
  ],
};
