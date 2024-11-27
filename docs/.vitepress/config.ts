import { defineConfig } from 'vitepress'
import { withMermaid } from "vitepress-plugin-mermaid";

export default withMermaid({
  title: "Bazel for Humans",
  description: "Making Bazel accessible and practical for everyone",
  
  head: [
    ['link', { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  ],

  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started/' },
      { text: 'Concepts', link: '/concepts/core-concepts' },
      { text: 'Best Practices', link: '/best-practices/dependency-management' },
      { text: 'Examples', link: '/examples/basic-build' },
    ],

    sidebar: {
      '/getting-started/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/getting-started/' },
            { text: 'Build Rules', link: '/getting-started/build-rules' },
            { text: 'Module Dependencies', link: '/getting-started/module-dependencies' },
          ]
        }
      ],
      '/concepts/': [
        {
          text: 'Core Concepts',
          items: [
            { text: 'Modern Bazel Overview', link: '/concepts/core-concepts' },
            { text: 'Labels and Targets', link: '/concepts/labels-and-targets' },
            { text: 'Packages and Visibility', link: '/concepts/packages-and-visibility' },
            { text: 'Dependencies and Actions', link: '/concepts/dependencies-and-actions' },
            { text: 'Build vs Runtime', link: '/concepts/build-vs-runtime' },
            { text: 'Bazel Central Registry', link: '/concepts/bazel-central-registry' },
          ]
        },
        {
          text: 'Advanced Concepts',
          items: [
            { text: 'Unified Environment', link: '/concepts/unified-environment' },
            { text: 'Providers and Aspects', link: '/concepts/providers-and-aspects' },
            { text: 'Rules and Evaluation', link: '/concepts/rules-and-evaluation' },
            { text: 'Remote Execution', link: '/concepts/remote-execution' },
          ]
        }
      ],
      '/best-practices/': [
        {
          text: 'Best Practices',
          items: [
            { text: 'Dependency Management', link: '/best-practices/dependency-management' },
            { text: 'Build Performance', link: '/best-practices/build-performance' },
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Basic Build', link: '/examples/basic-build' },
            { text: 'Multi-language Project', link: '/examples/multi-language' },
            { text: 'External Dependencies', link: '/examples/external-dependencies' },
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
      'go',
      'protobuf'
    ]
  },

  mermaid: {
    // Mermaid configuration options
    theme: 'default',
    darkMode: true,
    themeVariables: {
      lineColor: '#999',
      textColor: '#333',
    }
  },
  mermaidPlugin: {
    class: "mermaid-diagram", // Additional CSS class for styling
  },
})
