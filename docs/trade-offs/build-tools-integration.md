# Build Tools Integration

Modern Bazel focuses on seamless integration with language-native build tools while maintaining reproducibility. This guide explores how to effectively combine Bazel with other build tools in your development workflow.

## Gazelle

### Modern Configuration
```python
# MODULE.bazel
bazel_dep(name = "gazelle", version = "0.35.0")

# Register gazelle dependencies
go_deps = use_extension("@gazelle//:extensions.bzl", "go_deps")
go_deps.from_file(go_mod = "//:go.mod")

# BUILD.bazel
gazelle(
    name = "gazelle",
    prefix = "example.com/myproject",
)
```

### Key Features
1. **BUILD File Generation**
   - Automatic dependency detection
   - Proto support
   - Multi-module support

2. **Go Integration**
   - Works with go.mod
   - Handles replace directives
   - Supports vendoring

### Best Practices
1. **Regular Updates**
   ```bash
   # Update BUILD files
   bazel run //:gazelle
   ```

2. **Module Organization**
   - One BUILD file per package
   - Clear import boundaries
   - Explicit visibility

## JavaScript/TypeScript Tools

### pnpm Integration
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

### Modern Build Tools
1. **esbuild**
   ```python
   # BUILD.bazel
   load("@aspect_rules_esbuild//esbuild:defs.bzl", "esbuild")

   esbuild(
       name = "bundle",
       entry_point = "src/index.ts",
       deps = [":app"],
       platform = "node",
       format = "esm",
   )
   ```

2. **SWC**
   ```python
   # BUILD.bazel
   load("@aspect_rules_swc//swc:defs.bzl", "swc")

   swc(
       name = "compile",
       srcs = glob(["src/**/*.ts"]),
       swcrc = ".swcrc",
   )
   ```

## Protocol Buffers

### Modern Setup
```python
# MODULE.bazel
bazel_dep(name = "rules_proto", version = "6.0.0")

# Proto toolchain setup
proto = use_extension("@rules_proto//proto:extensions.bzl", "proto")
proto.toolchain()
```

### Multi-language Generation
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

ts_proto_library(
    name = "api_ts_proto",
    protos = [":api_proto"],
)
```

## Development Workflow

### Local Development
1. **Fast Iteration**
   ```bash
   # TypeScript development
   pnpm run dev
   
   # Go development
   go test ./...
   
   # Verify with Bazel
   bazel test //...
   ```

2. **IDE Integration**
   ```json
   // .vscode/settings.json
   {
     "bazel.buildFlags": ["--config=dev"],
     "gopls.build.directoryFilters": ["-bazel-bin", "-bazel-out"],
     "typescript.tsdk": "node_modules/typescript/lib"
   }
   ```

### Production Builds
```bash
# Build for production
bazel build //... --config=release

# Cross-platform build
bazel build //... --platforms=@rules_rust//rust/platform:linux_amd64
```

## Common Patterns

### 1. Development Mode
- Use native tools for fast iteration
- Keep BUILD files up to date
- Regular Bazel verification

### 2. Production Mode
- Bazel for all builds
- Remote caching
- Reproducible outputs

### 3. CI/CD Integration
```yaml
# .github/workflows/bazel.yml
name: CI
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Mount bazel cache
        uses: actions/cache@v3
        with:
          path: "~/.cache/bazel"
          key: bazel
      
      - name: Build and Test
        run: |
          bazel test //...
```

## Best Practices

### 1. Module Organization
- Clear dependency boundaries
- Consistent versioning
- Platform compatibility

### 2. Development Flow
- Fast local iteration
- Regular Bazel validation
- Automated updates

### 3. Tool Integration
- Native tool support
- IDE compatibility
- Build caching

## Conclusion

Modern Bazel development focuses on:

1. **Developer Experience**
   - Fast iteration cycles
   - Native tool support
   - IDE integration

2. **Build Reliability**
   - Reproducible builds
   - Version control
   - Cross-platform support

3. **Ecosystem Integration**
   - Language-native tools
   - Modern build tools
   - CI/CD systems

The key is finding the right balance between development speed and build reliability. 