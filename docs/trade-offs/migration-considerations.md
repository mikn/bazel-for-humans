# Migration Considerations

Moving to modern Bazel with Bzlmod requires careful planning and execution. This guide focuses on migrating Go, Rust, and TypeScript projects to Bazel's module system.

## Migration Strategies

### 1. New Projects
- Start with MODULE.bazel
- Use modern rules
- Follow best practices from start
- Avoid legacy patterns

### 2. Existing Projects
- Gradual module adoption
- One language at a time
- Maintain compatibility
- Test thoroughly

## Modern Setup

### 1. Module Configuration
```python
# MODULE.bazel
module(
    name = "my_project",
    version = "0.1.0",
)

# Core dependencies
bazel_dep(name = "rules_go", version = "0.46.0")
bazel_dep(name = "gazelle", version = "0.35.0")
bazel_dep(name = "rules_rust", version = "0.40.0")
bazel_dep(name = "aspect_rules_ts", version = "2.1.0")
bazel_dep(name = "aspect_rules_js", version = "1.34.0")

# Go toolchain
go_sdk = use_extension("@rules_go//go:extension.bzl", "go_sdk")
go_sdk.download(version = "1.21.5")

# Rust toolchain
rust = use_extension("@rules_rust//rust:extensions.bzl", "rust")
rust.toolchain(edition = "2021", versions = ["1.75.0"])

# TypeScript/JavaScript toolchain
npm = use_extension("@aspect_rules_js//npm:extensions.bzl", "npm")
npm.npm_translate_lock(
    name = "npm",
    pnpm_lock = "//:pnpm-lock.yaml",
    verify_node_modules_ignored = "//:.npmignore",
)
```

### 2. Development Tools
```python
# BUILD.bazel
load("@bazel_gazelle//:def.bzl", "gazelle")

gazelle(
    name = "gazelle",
    prefix = "example.com/myproject",
)
```

### 3. IDE Configuration
```json
// .vscode/settings.json
{
    "bazel.buildFlags": ["--config=dev"],
    "bazel.enableCodeLens": true,
    "gopls.build.directoryFilters": ["-bazel-bin", "-bazel-out"],
    "rust-analyzer.linkedProjects": ["Cargo.toml"],
    "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Common Challenges

### 1. Dependency Management
- Registry-based dependencies
- Version resolution
- Platform compatibility
- Feature flags

### 2. Build Configuration
- Platform settings
- Toolchain selection
- Build caching
- Remote execution

### 3. Development Workflow
- Fast iteration
- IDE integration
- Testing strategy
- Debug support

## Language-Specific Migration

### Go Projects
1. **Initial Setup**
   ```python
   # MODULE.bazel
   bazel_dep(name = "rules_go", version = "0.46.0")
   bazel_dep(name = "gazelle", version = "0.35.0")
   
   # Configure Go
   go_sdk = use_extension("@rules_go//go:extension.bzl", "go_sdk")
   go_sdk.download(version = "1.21.5")
   ```

2. **Migration Steps**
   - Keep go.mod as source of truth
   - Use Gazelle for BUILD files
   - Update module dependencies
   - Test incrementally

### Rust Projects
1. **Setup**
   ```python
   # MODULE.bazel
   bazel_dep(name = "rules_rust", version = "0.40.0")
   
   # Configure Rust
   rust = use_extension("@rules_rust//rust:extensions.bzl", "rust")
   rust.toolchain(edition = "2021", versions = ["1.75.0"])
   ```

2. **Migration Steps**
   - Direct crates.io integration
   - Platform-specific dependencies
   - Test configuration
   - Debug setup

### TypeScript Projects
1. **Configuration**
   ```python
   # MODULE.bazel
   bazel_dep(name = "aspect_rules_js", version = "1.34.0")
   bazel_dep(name = "aspect_rules_ts", version = "2.1.0")
   
   # Configure npm
   npm = use_extension("@aspect_rules_js//npm:extensions.bzl", "npm")
   npm.npm_translate_lock(
       name = "npm",
       pnpm_lock = "//:pnpm-lock.yaml",
       verify_node_modules_ignored = "//:.npmignore",
   )
   ```

2. **Migration Steps**
   - Use pnpm for dependencies
   - Configure TypeScript
   - Set up esbuild/SWC
   - Enable HMR

## Development Workflow

### 1. Local Development
```bash
# Go development
go test ./...
bazel test //...

# Rust development
cargo check
bazel build //...

# TypeScript development
pnpm run dev
bazel run //app:dev
```

### 2. CI/CD Pipeline
```yaml
# .github/workflows/bazel.yml
name: CI
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build and Test
        run: |
          bazel test //...
          bazel build //... --platforms=@rules_rust//rust/platform:linux_amd64
```

## Best Practices

### 1. Module Organization
- Clear dependency boundaries
- Consistent versioning
- Platform compatibility
- Feature management

### 2. Development Flow
- Fast local iteration
- Regular validation
- Automated updates
- Clear documentation

### 3. Testing Strategy
- Unit tests with native tools
- Integration tests with Bazel
- Cross-platform testing
- Performance benchmarks

## Migration Checklist

### 1. Pre-Migration
- [ ] Audit current dependencies
- [ ] Plan module structure
- [ ] Set up toolchains
- [ ] Configure IDE support

### 2. During Migration
- [ ] Convert to MODULE.bazel
- [ ] Update rule versions
- [ ] Test each component
- [ ] Validate builds

### 3. Post-Migration
- [ ] Remove legacy code
- [ ] Update documentation
- [ ] Train team
- [ ] Monitor performance

## Measuring Success

### 1. Build Metrics
- Build time
- Cache hit rate
- Cross-platform success
- Test coverage

### 2. Developer Experience
- Local build time
- IDE responsiveness
- Debug capability
- Team feedback

### 3. Code Quality
- Dependency clarity
- Build reproducibility
- Test reliability
- Documentation quality

## Conclusion

Successful migration to modern Bazel requires:

1. **Clear Strategy**
   - Modular approach
   - Incremental changes
   - Regular validation
   - Team alignment

2. **Technical Excellence**
   - Modern tooling
   - Best practices
   - Performance focus
   - Quality assurance

3. **Team Support**
   - Clear documentation
   - Regular training
   - Quick feedback
   - Continuous improvement

Remember that migration is an opportunity to improve your build system and development workflow. 