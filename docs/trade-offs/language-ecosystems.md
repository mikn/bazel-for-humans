# Language Ecosystems

Each programming language comes with its own ecosystem of tools, practices, and expectations. This guide explores how modern Bazel (with Bzlmod) integrates with various language ecosystems.

## Go Ecosystem

### Modern Go Integration
1. **Module Configuration**
   ```python
   # MODULE.bazel
   bazel_dep(name = "rules_go", version = "0.46.0")
   bazel_dep(name = "gazelle", version = "0.35.0")
   
   # Configure Go toolchain
   go_sdk = use_extension("@rules_go//go:extension.bzl", "go_sdk")
   go_sdk.download(version = "1.21.5")
   ```

2. **Gazelle Integration**
   ```python
   # BUILD.bazel
   gazelle(
       name = "gazelle",
       prefix = "example.com/myproject",
   )
   ```

### Development Workflow
1. **Adding Dependencies**
   ```bash
   # Add dependency to go.mod
   go get github.com/example/pkg
   
   # Update Bazel dependencies
   bazel run //:gazelle
   ```

2. **IDE Integration**
   - gopls works with go.work
   - VSCode/IntelliJ support
   - Seamless debugging

## Rust Ecosystem

### Modern Rust Integration
1. **Module Configuration**
   ```python
   # MODULE.bazel
   bazel_dep(name = "rules_rust", version = "0.40.0")
   
   # Configure Rust toolchain
   rust = use_extension("@rules_rust//rust:extensions.bzl", "rust")
   rust.toolchain(
       edition = "2021",
       versions = ["1.75.0"],
   )
   ```

2. **Crates Management**
   ```python
   # BUILD.bazel
   rust_binary(
       name = "app",
       srcs = ["src/main.rs"],
       deps = [
           "@crates//:serde",
           "@crates//:tokio",
       ],
       edition = "2021",
   )
   ```

### Development Experience
1. **Dependency Management**
   - Direct crates.io integration
   - Feature flag support
   - Platform-specific deps

2. **IDE Support**
   - rust-analyzer compatibility
   - Integrated debugging
   - Test runner support

## JavaScript/TypeScript Ecosystem

### Modern JS/TS Integration
1. **Module Configuration**
   ```python
   # MODULE.bazel
   bazel_dep(name = "aspect_rules_js", version = "1.34.0")
   bazel_dep(name = "aspect_rules_ts", version = "2.1.0")
   
   npm = use_extension("@aspect_rules_js//npm:extensions.bzl", "npm")
   npm.npm_translate_lock(
       name = "npm",
       pnpm_lock = "//:pnpm-lock.yaml",
       verify_node_modules_ignored = "//:.npmignore",
   )
   ```

2. **Build Configuration**
   ```python
   # BUILD.bazel
   ts_project(
       name = "app",
       srcs = glob(["src/**/*.ts"]),
       deps = [
           "//:node_modules/@types/node",
           "//:node_modules/express",
       ],
   )
   ```

### Modern Development Flow
1. **Package Management**
   - pnpm for deterministic installs
   - Direct npm registry access
   - Lockfile synchronization

2. **Build Tools**
   - esbuild for fast builds
   - SWC for transpilation
   - Modern bundling support

## Cross-Language Projects

### Shared Dependencies
1. **Proto Files**
   ```python
   # MODULE.bazel
   bazel_dep(name = "rules_proto", version = "6.0.0")
   
   # Proto generation for multiple languages
   proto = use_extension("@rules_proto//proto:extensions.bzl", "proto")
   proto.toolchain()
   ```

2. **Generated Code**
   ```python
   # BUILD.bazel
   proto_library(
       name = "api_proto",
       srcs = ["api.proto"],
   )
   
   go_proto_library(
       name = "api_go_proto",
       protos = [":api_proto"],
   )
   
   rust_proto_library(
       name = "api_rust_proto",
       protos = [":api_proto"],
   )
   ```

### Best Practices
1. **Module Organization**
   - Clear dependency boundaries
   - Version alignment
   - Platform compatibility

2. **Development Flow**
   - Language-native tools for iteration
   - Bazel for production builds
   - Consistent toolchain versions

## Common Patterns

### 1. Development Mode
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

### 2. Production Builds
```bash
# Cross-platform build
bazel build //... --platforms=@rules_rust//rust/platform:linux_amd64
bazel build //... --platforms=@rules_rust//rust/platform:darwin_arm64
```

## IDE Integration

### VSCode Setup
1. **Extensions**
   - Bazel extension
   - Language servers
   - Debugger support

2. **Settings**
   ```json
   {
     "bazel.buildFlags": ["--config=dev"],
     "bazel.testFlags": ["--test_output=streamed"]
   }
   ```

## Conclusion

Modern Bazel with Bzlmod provides:

1. **Simplified Dependencies**
   - Direct registry integration
   - Version resolution
   - Platform support

2. **Better Integration**
   - Native tool compatibility
   - IDE support
   - Development workflows

3. **Cross-platform Support**
   - Consistent toolchains
   - Platform-specific builds
   - Reproducible results

The key is leveraging Bzlmod's modern features while maintaining compatibility with language-native development workflows. 