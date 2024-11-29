# Toolchain Best Practices

This guide covers best practices for configuring and managing toolchains in Bazel, focusing on cross-platform development.

## Key Principles

1. **Hermetic Builds**
   - Toolchains are version controlled
   - No system dependencies
   - Reproducible across environments

2. **Platform Support**
   - Clear platform definitions
   - Consistent toolchain selection
   - Cross-compilation support

3. **Performance**
   - Efficient toolchain registration
   - Minimal download sizes
   - Optimized configurations

## Toolchain Configuration

### 1. Basic Setup

Define platforms and toolchains:

```python
# platforms/BUILD.bazel
platform(
    name = "linux_amd64",
    constraint_values = [
        "@platforms//os:linux",
        "@platforms//cpu:x86_64",
    ],
)

platform(
    name = "macos_arm64",
    constraint_values = [
        "@platforms//os:macos",
        "@platforms//cpu:arm64",
    ],
)
```

### 2. Language Toolchains

Configure language-specific toolchains:

```python
# MODULE.bazel
module(
    name = "my_project",
    version = "0.1.0",
)

# Go toolchain
bazel_dep(name = "rules_go", version = "0.46.0")
go_sdk = use_extension("@rules_go//go:extension.bzl", "go_sdk")
go_sdk.download(
    version = "1.21.5",
    # Support both platforms
    goarch = ["amd64", "arm64"],
    goos = ["linux", "darwin"],
)

# Rust toolchain
bazel_dep(name = "rules_rust", version = "0.40.0")
rust = use_extension("@rules_rust//rust:extensions.bzl", "rust")
rust.toolchain(
    versions = ["1.75.0"],
    edition = "2021",
    dev_components = True,
    targets = [
        "x86_64-unknown-linux-gnu",
        "aarch64-apple-darwin",
    ],
)
```

### 3. Compiler Settings

Configure compiler-specific settings:

```python
# toolchains/cc/BUILD.bazel
cc_toolchain_config(
    name = "linux_config",
    cpu = "k8",
    compiler = "clang",
    cxx_builtin_include_directories = [
        "/usr/lib/llvm-14/lib/clang/14.0.0/include",
    ],
    host_system_name = "x86_64-unknown-linux-gnu",
    target_system_name = "x86_64-unknown-linux-gnu",
    target_libc = "glibc",
    abi_version = "glibc",
    abi_libc_version = "2.31",
    tool_paths = {
        "gcc": "/usr/bin/clang",
        "cpp": "/usr/bin/clang++",
        "ar": "/usr/bin/llvm-ar",
        "strip": "/usr/bin/llvm-strip",
    },
)
```

## Cross-Platform Support

### 1. Platform Configuration

Set up platform-specific configs:

```python
# .bazelrc
# Linux AMD64
build:linux_amd64 --platforms=//platforms:linux_amd64
build:linux_amd64 --cpu=k8
build:linux_amd64 --host_cpu=k8

# macOS ARM64
build:macos_arm64 --platforms=//platforms:macos_arm64
build:macos_arm64 --cpu=darwin_arm64
build:macos_arm64 --host_cpu=darwin_arm64
```

### 2. Cross-Compilation

Configure cross-compilation:

```python
# toolchains/BUILD.bazel
load("@rules_rust//rust:toolchain.bzl", "rust_toolchain")

rust_toolchain(
    name = "rust_linux_amd64",
    target_triple = "x86_64-unknown-linux-gnu",
    # ... other settings
)

rust_toolchain(
    name = "rust_macos_arm64",
    target_triple = "aarch64-apple-darwin",
    # ... other settings
)
```

### 3. Toolchain Selection

Control toolchain selection:

```python
# BUILD.bazel
rust_binary(
    name = "my_binary",
    srcs = ["main.rs"],
    target_compatible_with = select({
        "//platforms:is_linux_amd64": [],
        "//platforms:is_macos_arm64": [],
        "//conditions:default": ["@platforms//:incompatible"],
    }),
)
```

## Common Patterns

### 1. Toolchain Registration

Register toolchains efficiently:

```python
# MODULE.bazel
register_toolchains(
    "//toolchains:rust_linux_amd64_toolchain",
    "//toolchains:rust_macos_arm64_toolchain",
)

# Alternative: use wildcards carefully
register_toolchains(
    "//toolchains:all",
)
```

### 2. Constraint Settings

Define custom constraints:

```python
# platforms/BUILD.bazel
constraint_setting(
    name = "libc",
)

constraint_value(
    name = "glibc",
    constraint_setting = ":libc",
)

constraint_value(
    name = "musl",
    constraint_setting = ":libc",
)
```

### 3. Platform Transitions

Handle platform transitions:

```python
# BUILD.bazel
transition_rule(
    name = "cross_compile",
    target = ":my_binary",
    target_platform = "//platforms:linux_amd64",
)
```

## Best Practices

1. **Platform Definitions**
   - Use standard constraints
   - Define custom constraints sparingly
   - Document platform requirements

2. **Toolchain Configuration**
   - Version all toolchains
   - Use hermetic toolchains
   - Configure for all supported platforms

3. **Cross-Compilation**
   - Test cross-compilation regularly
   - Verify binary compatibility
   - Document platform-specific issues

4. **Performance**
   - Minimize toolchain downloads
   - Cache toolchains effectively
   - Use appropriate optimization levels

## Common Issues

### 1. Missing Tools

Handle missing tools:

```python
# toolchains/BUILD.bazel
genrule(
    name = "download_tool",
    outs = ["tool"],
    cmd = "curl -L https://example.com/tool > $@",
    visibility = ["//visibility:private"],
)

toolchain(
    name = "custom_toolchain",
    toolchain = ":custom_impl",
    toolchain_type = "@rules_custom//toolchain:type",
    exec_compatible_with = [
        "@platforms//os:linux",
        "@platforms//cpu:x86_64",
    ],
)
```

### 2. Platform Compatibility

Handle platform compatibility:

```python
# BUILD.bazel
config_setting(
    name = "is_linux_amd64",
    constraint_values = [
        "@platforms//os:linux",
        "@platforms//cpu:x86_64",
    ],
)

cc_binary(
    name = "platform_specific",
    srcs = select({
        ":is_linux_amd64": ["linux_impl.cc"],
        "//conditions:default": ["generic_impl.cc"],
    }),
)
```

### 3. Toolchain Versions

Manage toolchain versions:

```python
# MODULE.bazel
# Pin specific versions
go_sdk.download(
    version = "1.21.5",
    sha256 = "73cac0215254d0c7d1241fa40837851f3b9a8a742d0b54714cbdfb3feaf8f0af",
)

# Use version constraints
bazel_dep(
    name = "rules_go",
    version = "0.46.0",
    repo_name = "io_bazel_rules_go",
)
```

## Next Steps

1. Learn about [Build Performance](build-performance.md)
2. Study [Cross Platform Builds](/examples/cross-platform)
3. Explore [Container Images](/examples/container-images) 