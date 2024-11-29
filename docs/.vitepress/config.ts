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
      { text: 'Trade-offs & Decisions', link: '/trade-offs/choosing-bazel' },
      { text: 'Best Practices', link: '/best-practices/project-structure' },
      { text: 'Examples', link: '/examples/go-microservice' },
    ],

    sidebar: {
      '/getting-started/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/getting-started/' },
            { text: 'Workspaces', link: '/getting-started/workspaces' },
            { text: 'BUILD Files', link: '/getting-started/build-files' },
            { text: 'Running Builds', link: '/getting-started/running-builds' },
            { text: 'Dependencies', link: '/getting-started/dependencies' },
            { text: 'Build Rules', link: '/getting-started/build-rules' },
            { text: 'Testing', link: '/getting-started/testing' },
            { text: 'Module Dependencies', link: '/getting-started/module-dependencies' }
          ]
        }
      ],
      '/concepts/': [
        {
          text: 'Core Concepts',
          items: [
            { text: 'Overview', link: '/concepts/core-concepts' },
            { text: 'Hermetic Environment', link: '/concepts/hermetic-environment' },
            { text: 'Labels and Targets', link: '/concepts/labels-and-targets' },
            { text: 'Packages and Visibility', link: '/concepts/packages-and-visibility' },
            { text: 'Dependencies and Actions', link: '/concepts/dependencies-and-actions' },
            { text: 'Remote Repositories', link: '/concepts/remote-repositories' },
            { text: 'Bazel Central Registry', link: '/concepts/bazel-central-registry' },
            { text: 'Build vs Runtime', link: '/concepts/build-vs-runtime' },
            { text: 'Rules and Evaluation', link: '/concepts/rules-and-evaluation' }
          ]
        },
        {
          text: 'Advanced Concepts',
          items: [
            { text: 'Configuration and Toolchains', link: '/concepts/configuration-and-toolchains' },
            { text: 'Providers and Aspects', link: '/concepts/providers-and-aspects' },
            { text: 'Remote Execution', link: '/concepts/remote-execution' }
          ]
        }
      ],
      '/trade-offs/': [
        {
          text: 'Trade-offs & Decisions',
          items: [
            { text: 'Choosing Bazel', link: '/trade-offs/choosing-bazel' },
            { text: 'Native vs Bazel Toolchains', link: '/trade-offs/native-vs-bazel-toolchains' },
            { text: 'Language Ecosystems', link: '/trade-offs/language-ecosystems' },
            { text: 'Build Tools Integration', link: '/trade-offs/build-tools-integration' },
            { text: 'Migration Considerations', link: '/trade-offs/migration-considerations' }
          ]
        }
      ],
      '/best-practices/': [
        {
          text: 'Best Practices',
          items: [
            { text: 'Project Structure', link: '/best-practices/project-structure' },
            { text: 'Testing and CI', link: '/best-practices/testing-and-ci' },
            { text: 'Toolchains', link: '/best-practices/toolchains' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Go Microservice', link: '/examples/go-microservice' },
            { text: 'Rust Binary', link: '/examples/rust-binary' },
            { text: 'Container Images', link: '/examples/container-images' },
            { text: 'Cross Platform Builds', link: '/examples/cross-platform' },
            { text: 'Multi-language Project', link: '/examples/multi-language' }
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
      copyright: 'Copyright 2024-present'
    }
  },

  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    languages: [
      { id: 'bash', scopeName: 'source.shell', path: 'bash.tmLanguage.json' },
      { id: 'python', scopeName: 'source.python', path: 'python.tmLanguage.json' },
      { id: 'javascript', scopeName: 'source.js', path: 'javascript.tmLanguage.json' },
      { id: 'typescript', scopeName: 'source.ts', path: 'typescript.tmLanguage.json' },
      { id: 'json', scopeName: 'source.json', path: 'json.tmLanguage.json' },
      { id: 'go', scopeName: 'source.go', path: 'go.tmLanguage.json' },
      { id: 'protobuf', scopeName: 'source.protobuf', path: 'protobuf.tmLanguage.json' }
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
