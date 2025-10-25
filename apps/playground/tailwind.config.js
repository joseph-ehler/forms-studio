/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    // Include DS package for Flowbite components
    '../../packages/ds/src/**/*.{js,ts,jsx,tsx}',
    // Include node_modules for Flowbite
    '../../node_modules/flowbite-react/dist/esm/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Map DS tokens to Tailwind theme
        danger: '#dc2626', // red-600
        success: '#16a34a', // green-600
        warning: '#ea580c', // orange-600
        info: '#0284c7', // sky-600
        primary: {
          DEFAULT: '#2F6FED',
          hover: '#1e5dd7',
        },
        surface: {
          base: '#ffffff',
          raised: '#fafafa',
          sunken: '#f5f5f5',
        },
        text: {
          DEFAULT: '#0b0b0c',
          subtle: '#6b7280', // gray-500
          muted: '#9ca3af', // gray-400
          inverse: '#ffffff',
        },
      },
      // Override Flowbite's default cyan focus rings with our primary color
      ringColor: {
        DEFAULT: '#2F6FED', // Use DS primary instead of cyan
      },
      ringOffsetColor: {
        DEFAULT: '#ffffff',
      },
    },
  },
  safelist: [
    // Dynamic spacing classes
    { pattern: /gap-(0|1|2|3|4|5|6|8|10|12)/ },
    { pattern: /p[xy]?-(0|1|2|3|4|5|6|8|10|12)/ },
    { pattern: /m[xy]?-(0|1|2|3|4|5|6|8|10|12)/ },
    
    // Dynamic radius classes
    { pattern: /rounded-(none|sm|md|lg|xl|full)/ },
    
    // Dynamic color classes (in case of dynamic variant generation)
    { pattern: /bg-(primary|secondary|danger|success|warning)/ },
    { pattern: /text-(primary|secondary|danger|success|warning)/ },
    { pattern: /border-(primary|secondary|danger|success|warning)/ },
  ],
  
  plugins: [
    require('flowbite/plugin')({
      charts: false,
    }),
  ],
};
