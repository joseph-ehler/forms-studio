/**
 * ESLint Import Hygiene Rules
 * 
 * Enforces barrel imports and prevents deep path spelunking.
 */

module.exports = {
  root: true,
  plugins: [
    '@typescript-eslint',
    'import',
    'simple-import-sort',
    'jsx-a11y',
    'cascade'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  ignorePatterns: [
    '**/flowbite-react-blocks*/**',
    'dist/**',
    '**/dist/**',
    'storybook-static/**',
    '.storybook/**',
    'node_modules/**'
  ],
  settings: {
    'import/resolver': {
      typescript: { alwaysTryTypes: true }
    }
  },
  overrides: [
    // 1) Apps & other packages (NOT ds) — block direct flowbite usage + behavior engines
    {
      files: ['apps/**/*.{ts,tsx}', 'packages/*/{src,**/src}/**/*.{ts,tsx}'],
      excludedFiles: [
        'packages/ds/**',
        'packages/ui-bridge/**',
        '**/*.stories.*',
        '**/*.test.*',
      ],
      rules: {
        'no-restricted-imports': ['error', {
          patterns: [
            {
              group: ['flowbite-react', 'flowbite-react/*'],
              message: 'Import Flowbite only via @intstudio/ds/fb'
            },
            {
              group: ['@intstudio/ds/primitives/*', '@ds/primitives/*'],
              message: 'Import shells from @intstudio/ds/shell. Primitives are for shells only.'
            }
          ],
          paths: [
            {
              name: 'react-spring-bottom-sheet',
              message: 'Use <Sheet/> from @intstudio/ds/primitives instead.',
            },
            {
              name: '@floating-ui/react',
              message: 'Use <Popover/> from @intstudio/ds/primitives instead.',
            },
            {
              name: 'react-virtuoso',
              message: 'Use DS <VirtList/> wrapper (coming soon) instead.',
            },
            {
              name: '@use-gesture/react',
              message: 'Use DS wrappers; gestures handled internally.',
            },
            {
              name: '@capacitor/haptics',
              message: 'Use haptic() from @intstudio/ds/capabilities instead.',
            },
            {
              name: '@capacitor/keyboard',
              message: 'Use useKeyboardInsets() from @intstudio/ds/capabilities instead.',
            },
          ],
        }],
      }
    },
    // 2) UI-bridge — allow Flowbite (wrapping layer)
    {
      files: ['packages/ui-bridge/**'],
      rules: {
        'no-restricted-imports': 'off'
      }
    },
    // 3) DS — allow internal imports inside DS, but forbid consumers from deep DS
    {
      files: ['packages/ds/**'],
      rules: {
        // Allow DS internals to import each other freely
        'import/no-internal-modules': ['error', {
          allow: ['**']  // effectively disable within DS package
        }],
        'no-restricted-imports': 'off',
        // SKIN completeness now enforced by TypeScript (see control/skin-contracts.ts)
      }
    },
    // 4) Global hygiene for everyone
    {
      files: ['**/*.{ts,tsx}'],
      rules: {
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
        // Avoid appearance inline styles; allow dynamic position transforms if you want to relax it later
        'no-restricted-syntax': [
          'error',
          {
            selector: "JSXAttribute[name.name='style']",
            message: "Avoid inline style={{}} for appearance; use Tailwind + tokens.",
          },
          {
            selector: "Literal[value=/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/]",
            message: "Use tokens (dsColor(), var(--ds-color-*)) not raw hex colors.",
          },
          {
            selector: "Literal[value=/rgba?\\(/]",
            message: "Use rgb(var(--…)/α) tokenized colors, not raw rgba().",
          }
        ],
        // Basic a11y enforcement
        'jsx-a11y/no-static-element-interactions': 'warn',
        'jsx-a11y/click-events-have-key-events': 'warn',
        'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      }
    },
    // 5) Dev-only files (stories, theme playgrounds, token definitions): relax appearance rules
    {
      files: [
        '**/*.stories.{ts,tsx}',
        'packages/**/storybook/**/*.{ts,tsx}',
        'packages/**/src/**/__stories__/**/*.{ts,tsx}',
        // theme playgrounds and legacy theme snippets
        'packages/**/src/tokens/themes/**/*.{ts,tsx}',
        // token definition files (generate CSS vars, can use rgba)
        'packages/**/src/tokens/**/*.{ts,tsx}',
        // dev utilities (audit tools can use rgba for checks)
        'packages/**/src/utils/audit*.{ts,tsx}',
        'packages/**/src/hooks/useStackPolicy.{ts,tsx}',
        // template files (reference implementations)
        'packages/**/src/**/*.template.{ts,tsx}'
      ],
      rules: {
        // allow rgba() / inline styles in dev surfaces & design infrastructure
        'no-restricted-syntax': 'off',
        // story files often import in non-canonical orders
        'simple-import-sort/imports': 'off',
        'simple-import-sort/exports': 'off'
      }
    },
    // 6) Components using SKIN pattern: allow inline styles for CSS variable injection
    {
      files: [
        'packages/ds/src/fb/Button.tsx',
        'packages/ds/src/fb/Input.tsx',
        'packages/ds/src/components/**/[A-Z]*.tsx'
      ],
      rules: {
        // Allow style= for SKIN variable injection (control panel pattern)
        'no-restricted-syntax': [
          'error',
          {
            selector: "Literal[value=/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/]",
            message: "Use tokens (dsColor(), var(--ds-color-*)) not raw hex colors.",
          },
          {
            selector: "Literal[value=/rgba?\\(/]",
            message: "Use rgb(var(--…)/α) tokenized colors, not raw rgba().",
          }
          // Note: Inline styles allowed for SKIN variable injection
        ]
      }
    }
  ]
};
