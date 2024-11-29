# Cross Platform Builds

This example demonstrates how to handle the common scenario of building and testing code across Mac ARM64 (M1/M2) and Linux AMD64 environments. We'll cover platform-specific configuration, toolchains, and common pitfalls.

## Common Scenarios

1. Development on Mac M1/M2, deployment to Linux AMD64
2. CI running on Linux AMD64, developers on Mac ARM64
3. Building containers that run on Linux AMD64 from Mac ARM64

## Platform Configuration

Create a `.bazelrc` with platform-specific settings:

```bash
# Common settings
build --incompatible_strict_action_env

# Platform detection and configuration
build:linux_amd64 --platforms=@rules_go//go/toolchain:linux_amd64
build:darwin_arm64 --platforms=@rules_go//go/toolchain:darwin_arm64

# Automatically select platform config
build --enable_platform_specific_config

# Host-specific settings (automatically applied based on host platform)
build:linux --host_platform=@rules_go//go/toolchain:linux_amd64
build:macos --host_platform=@rules_go//go/toolchain:darwin_arm64

# Container builds should always target Linux AMD64
build --platforms=@rules_oci//platforms:linux_amd64
```

## Example Project

Here's a simple Go project that demonstrates cross-platform builds:

```
cross-platform/
├── MODULE.bazel
├── BUILD.bazel
├── .bazelrc
├── .bazelversion
└── cmd/
    └── hello/
        ├── BUILD.bazel
        └── main.go
```

### MODULE.bazel

```python
module(
    name = "cross_platform",
    version = "0.1.0",
)

# Basic rules
bazel_dep(name = "rules_go", version = "0.46.0")
bazel_dep(name = "rules_oci", version = "1.7.2")

# Configure Go
go_sdk = use_extension("@rules_go//go:extension.bzl", "go_sdk")
go_sdk.download(version = "1.21.5")

# Register toolchains
register_toolchains(
    "@go_sdk//:darwin_arm64_toolchain",
    "@go_sdk//:linux_amd64_toolchain",
)
```

### cmd/hello/main.go

```go
package main

import (
    "fmt"
    "runtime"
)

func main() {
    fmt.Printf("Hello from %s/%s!\n", runtime.GOOS, runtime.GOARCH)
}
```

### cmd/hello/BUILD.bazel

```python
load("@rules_go//go:def.bzl", "go_binary")
load("@rules_oci//oci:defs.bzl", "oci_image")
load("@rules_pkg//pkg:tar.bzl", "pkg_tar")

go_binary(
    name = "hello",
    srcs = ["main.go"],
    # Build pure Go code for better cross-compilation
    pure = "on",
    # Static linking for containers
    static = "on",
    visibility = ["//visibility:public"],
)

# Container image will always be Linux AMD64
oci_image(
    name = "hello_image",
    base = "@distroless_base",
    entrypoint = ["/hello"],
    tars = [":hello_tar"],
)

pkg_tar(
    name = "hello_tar",
    srcs = [":hello"],
)
```

## Building for Different Platforms

### Local Development

On Mac ARM64:
```bash
# Build for local development
bazel build //cmd/hello

# Build specifically for Linux AMD64
bazel build --platforms=@rules_go//go/toolchain:linux_amd64 //cmd/hello
```

On Linux AMD64:
```bash
# Build for local development
bazel build //cmd/hello

# Build specifically for Mac ARM64
bazel build --platforms=@rules_go//go/toolchain:darwin_arm64 //cmd/hello
```

### Container Builds

Building containers from Mac:
```bash
# Container will always be Linux AMD64
bazel build //cmd/hello:hello_image
```

## Common Issues and Solutions

### 1. CGO Dependencies

CGO can cause cross-compilation issues. Solutions:

```python
go_binary(
    name = "hello",
    srcs = ["main.go"],
    pure = "on",  # Avoid CGO
    static = "on",  # Static linking
)
```

### 2. Platform-Specific Code

Use build constraints for platform-specific code:

```go
//go:build darwin && arm64

package main

// Mac ARM64-specific code
```

### 3. Container Builds on Mac

Always use Linux AMD64 platform for containers:

```bash
# In .bazelrc
build --platforms=@rules_oci//platforms:linux_amd64
```

### 4. Testing Across Platforms

Run tests on both platforms:

```bash
# Test on current platform
bazel test //...

# Test on specific platform
bazel test --platforms=@rules_go//go/toolchain:linux_amd64 //...
```

## CI Configuration

Example GitHub Actions workflow:

```yaml
name: Cross Platform Build

on: [push, pull_request]

jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest]
        include:
          - os: ubuntu-latest
            platform: linux_amd64
          - os: macos-latest
            platform: darwin_arm64
    
    runs-on: ${{ matrix.os }}
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Build
      run: |
        bazel build \
          --platforms=@rules_go//go/toolchain:${{ matrix.platform }} \
          //...
    
    - name: Test
      run: |
        bazel test \
          --platforms=@rules_go//go/toolchain:${{ matrix.platform }} \
          //...
```

## Best Practices

1. **Development Environment**
   - Use `.bazelrc.user` for local overrides
   - Set default platform in `.bazelrc`
   - Use `pure` Go builds when possible

2. **Container Builds**
   - Always target Linux AMD64
   - Use distroless base images
   - Enable platform-specific config

3. **Testing**
   - Test on both platforms regularly
   - Use CI matrix for platform coverage
   - Handle platform-specific failures

4. **Performance**
   - Use remote cache for cross-platform builds
   - Enable platform-specific optimizations
   - Cache container layers effectively

## Next Steps

- Learn about [Container Images](container-images.md) for advanced containerization
- Explore [Go Microservice](go-microservice.md) for a complete service example
- Study [Rust Binary](rust-binary.md) for another language example 