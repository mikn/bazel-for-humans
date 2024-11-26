# Bazel for Humans

A comprehensive documentation site that makes Bazel accessible and practical for everyone.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run docs:dev

# Build for production
npm run docs:build

# Preview production build
npm run docs:preview
```

## Project Structure

```
.
├── docs/
│   ├── .vitepress/
│   │   └── config.ts    # VitePress configuration
│   ├── guide/           # Guide documentation
│   ├── reference/       # API reference
│   ├── examples/        # Example configurations
│   └── index.md        # Home page
├── package.json
├── tsconfig.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Documentation Guidelines

- Use clear and concise language
- Include code examples where appropriate
- Follow the existing directory structure
- Test your changes locally before submitting

## Development

### Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher

### Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run docs:dev`
4. Visit `http://localhost:5173` in your browser

### Building for Production

```bash
npm run docs:build
```

The built files will be in `docs/.vitepress/dist/`

## Deployment

This site is configured for deployment on Cloudflare Pages. The build command is `npm run docs:build` and the build output directory is `docs/.vitepress/dist`.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
