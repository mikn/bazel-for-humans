import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Bazel for Humans",
  description: "Making Bazel accessible and practical for everyone",
  
  head: [
    ['link', { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  ],

  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Reference', link: '/reference/concepts' },
      { text: 'Examples', link: '/examples/basic-build' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Basic Concepts', link: '/guide/basic-concepts' },
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Workspaces', link: '/guide/workspaces' },
            { text: 'BUILD Files', link: '/guide/build-files' },
            { text: 'Dependencies', link: '/guide/dependencies' },
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Basic Build', link: '/examples/basic-build' },
          ]
        }
      ],
      '/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'Core Concepts', link: '/reference/concepts' },
            { text: 'Command Reference', link: '/reference/commands' },
            { text: 'Configuration', link: '/reference/configuration' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/yourusername/bazel-for-humans' }
    ],

    search: {
      provider: 'local'
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright 2023-present'
    }
  },

  markdown: {
    lineNumbers: true,
    // Configure Shiki for syntax highlighting
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    languages: [
      'bash',
      'python',
      'javascript',
      'typescript',
      'json',
      {
        id: 'bazel',
        scopeName: 'source.python',
        path: 'python',
        aliases: ['bzl', 'BUILD']
      }
    ]
  }
})
