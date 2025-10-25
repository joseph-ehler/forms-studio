/**
 * ESLint rules for Quality Layer - enforce import hygiene & API boundaries
 * 
 * Blocks:
 * - Direct flowbite-react imports (use @intstudio/ds/fb)
 * - Deep DS imports (use sealed barrels)
 * - Inline styles
 * 
 * Allows:
 * - camelCase filenames for hooks (useModal.ts)
 */

module.exports = {
  plugins: ['import'],
  rules: {
    // Block deep imports into DS internals
    'import/no-internal-modules': ['error', {
      forbid: [
        '@intstudio/ds/dist/**',
        '@intstudio/ds/src/**'
      ]
    }],
    
    // Block direct Flowbite & enforce sealed barrels
    'no-restricted-imports': ['error', {
      patterns: [
        {
          group: ['flowbite-react', 'flowbite-react/*'],
          message: '❌ Import from @intstudio/ds/fb instead. Direct flowbite-react imports bypass quality layer.'
        },
        {
          group: ['@intstudio/ds/src/*'],
          message: '❌ Use sealed barrels: @intstudio/ds/fb, @intstudio/ds/routes, @intstudio/ds/hooks'
        }
      ]
    }],
    
    // Block inline styles (use Tailwind + tokens)
    'react/forbid-dom-props': ['error', {
      forbid: [
        {
          propName: 'style',
          message: '❌ Use Tailwind classes or --ds-* tokens instead of inline styles'
        }
      ]
    }]
  },
  
  overrides: [
    {
      // Allow Flowbite imports ONLY in DS package wrappers
      files: ['packages/ds/src/fb/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': 'off'
      }
    },
    {
      // Allow style prop in Storybook stories
      files: ['**/*.stories.{ts,tsx}'],
      rules: {
        'react/forbid-dom-props': 'off'
      }
    }
  ]
};
