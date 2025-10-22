import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Cascade Design System',
  description: 'Production-grade design system with unbreakable contracts',
  
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Tokens', link: '/tokens/' },
      { text: 'Components', link: '/components/' },
      { text: 'Contracts', link: '/contracts/' },
      { text: 'Guide', link: '/guide/' },
    ],
    
    sidebar: {
      '/tokens/': [
        {
          text: 'Design Tokens',
          items: [
            { text: 'Overview', link: '/tokens/' },
            { text: 'Typography', link: '/tokens/typography' },
            { text: 'Spacing', link: '/tokens/spacing' },
            { text: 'Colors', link: '/tokens/colors' },
            { text: 'Shadows', link: '/tokens/shadows' },
            { text: 'Motion', link: '/tokens/motion' },
          ]
        }
      ],
      
      '/components/': [
        {
          text: 'Components',
          items: [
            { text: 'Overview', link: '/components/' },
            { text: 'Buttons', link: '/components/buttons' },
            { text: 'Inputs', link: '/components/inputs' },
            { text: 'Overlays', link: '/components/overlays' },
          ]
        }
      ],
      
      '/contracts/': [
        {
          text: 'Contracts',
          items: [
            { text: 'Overview', link: '/contracts/' },
            { text: 'Visual', link: '/contracts/visual' },
            { text: 'Accessibility', link: '/contracts/accessibility' },
            { text: 'Performance', link: '/contracts/performance' },
          ]
        }
      ],
      
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Getting Started', link: '/guide/' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Multi-Brand', link: '/guide/multi-brand' },
            { text: 'Accessibility', link: '/guide/accessibility' },
            { text: 'Migration', link: '/guide/migration' },
          ]
        }
      ],
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-org/intelligence-studio-forms' }
    ],
    
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 Cascade Design System'
    }
  }
})
