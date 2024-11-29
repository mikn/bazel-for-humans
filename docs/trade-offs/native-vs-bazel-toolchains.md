# Native vs Bazel Toolchains

Understanding how Bazel interacts with native toolchains is crucial for making informed decisions about build system architecture. This guide explores the relationship between Bazel and language-native build tools.

## Core Concepts

### What is a Native Toolchain?
- Language-specific build tools (`go build`, `cargo`, `npm`)
- Package managers (`go mod`, `cargo`, `npm/yarn`)
- Development tools (formatters, linters, LSP servers)

### Bazel's Role
- Orchestrates native toolchains
- Provides hermetic build environment
- Manages cross-language dependencies
- Ensures reproducible builds

## Go Ecosystem

### go mod vs Bazel
- **go mod**:
  - Native dependency management
  - Simple, straightforward workflow
  - Integrated with Go tooling
  - Fast development iterations

- **Bazel + Gazelle**:
  - More complex setup
  - Hermetic builds
  - Cross-language support
  - Better monorepo support

### Gazelle's Role
- Bridges go.mod and Bazel worlds
- Generates BUILD files from Go code
- Manages proto generation
- Handles external dependencies

### Common Challenges
1. **Adding Dependencies**
   ```bash
   # go mod workflow
   go get github.com/example/pkg
   
   # Bazel workflow
   go get github.com/example/pkg
   bazel run //:gazelle-update-repos
   bazel run //:gazelle
   ```

2. **Development Tools**
   - gopls expects go.mod
   - Some tools need GOPATH/module setup
   - IDE integration complexities

## JavaScript/TypeScript Ecosystem

### npm/yarn vs Bazel
- **npm/yarn**:
  - Vast package ecosystem
  - Simple dependency management
  - Fast development workflow
  - Native TypeScript support

- **Bazel**:
  - Fine-grained caching
  - Hermetic builds
  - Better monorepo support
  - Cross-language integration

### Build Tool Complexity
1. **Multiple Compilers**
   - TypeScript (tsc)
   - Babel
   - SWC
   - esbuild

2. **Bundlers**
   - webpack
   - Rollup
   - Parcel
   - Vite

### Integration Strategies
1. **Pure Bazel**
   - Use Bazel rules for everything
   - Better hermeticity
   - Slower development cycle

2. **Hybrid Approach**
   - Use npm/yarn for development
   - Use Bazel for production builds
   - Compromise on hermeticity

## Rust Ecosystem

### Cargo vs Bazel
- **Cargo**:
  - Native Rust package manager
  - Excellent development experience
  - Integrated testing and benchmarking
  - Simple dependency management

- **Bazel + cargo-raze**:
  - Cross-language support
  - Better monorepo support
  - Hermetic builds
  - More complex setup

### Integration Points
1. **cargo-raze**
   - Generates Bazel rules from Cargo.toml
   - Manages external dependencies
   - Maintains compatibility

2. **Development Workflow**
   ```bash
   # Update dependencies
   cargo add some-crate
   cargo raze
   bazel build //...
   ```

## Performance Implications

### Development Mode
1. **Native Toolchains**
   - Faster iteration cycles
   - Immediate feedback
   - Better IDE integration

2. **Bazel**
   - Initial build overhead
   - Caching benefits
   - Remote execution potential

### Production Builds
1. **Native Toolchains**
   - Simple configuration
   - Platform-specific quirks
   - Less predictable

2. **Bazel**
   - Consistent results
   - Cross-platform support
   - Better caching

## Making It Work Together

### Best Practices
1. **Keep Both Worlds in Sync**
   - Maintain native manifests (go.mod, package.json)
   - Use generation tools (Gazelle, cargo-raze)
   - Regular synchronization

2. **Development Workflow**
   - Use native tools for quick iterations
   - Use Bazel for CI/CD
   - Maintain hermetic guarantees

3. **IDE Integration**
   - Configure language servers properly
   - Use Bazel-aware IDE plugins
   - Set up development shortcuts

### Common Patterns
1. **Development Mode**
   ```bash
   # Quick iteration cycle
   go test ./...
   cargo check
   npm run dev
   
   # Verify Bazel build
   bazel build //...
   ```

2. **CI/CD Mode**
   ```bash
   # Full hermetic build
   bazel build //...
   bazel test //...
   ```

## Conclusion

The choice between native toolchains and Bazel isn't binary. Most successful projects find a balance that works for their specific needs:

1. **Use Native Toolchains For**:
   - Rapid development
   - Simple projects
   - Developer tooling
   - Quick experiments

2. **Use Bazel For**:
   - Production builds
   - Cross-language projects
   - Large scale development
   - CI/CD pipelines

The key is finding the right balance for your project's needs while maintaining productivity and build reliability. 