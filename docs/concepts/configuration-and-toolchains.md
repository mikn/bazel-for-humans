# Configuration and Toolchains

This guide explains how Bazel ensures consistent builds across different environments through configuration and toolchains.

## Understanding Build Configuration

When you build software, you need to consider:
- What machine will run the code? (target platform)
- What machine will build the code? (host platform)
- What tools are needed to build the code? (toolchain)

For example, you might want to:
- Build Android apps on a Linux machine
- Compile Windows executables on macOS
- Build ARM64 binaries on an x86_64 system

Bazel handles this through three key concepts:
1. Platforms (define where code runs and builds)
2. Toolchains (provide the tools needed)
3. Configuration (connect platforms to toolchains)

## Platforms

A platform represents a specific environment where code either:
- Runs (target platform)
- Gets built (host platform)

```python
platform(
    name = "linux_arm64",
    constraint_values = [
        "@platforms//cpu:arm64",
        "@platforms//os:linux",
    ],
)
```

Common platform examples:
- `@platforms//cpu:x86_64` + `@platforms//os:linux`
- `@platforms//cpu:arm64` + `@platforms//os:android`
- `@platforms//cpu:x86_64` + `@platforms//os:windows`

## Toolchains

A toolchain is a set of tools needed to build code, such as:
- Compilers
- Linkers
- Code generators
- Build utilities

Instead of specifying these tools directly, Bazel uses toolchains to:
1. Define what tools are needed
2. Select the right tools for each platform
3. Configure the tools correctly

Example: C++ Toolchain
```python
# No need to specify compiler directly
cc_binary(
    name = "hello",
    srcs = ["hello.cc"],
)

# Bazel automatically:
# 1. Finds the right C++ toolchain for your platform
# 2. Uses the correct compiler and flags
# 3. Links with the right libraries
```

## Cross-compilation

One of the main benefits of toolchains is cross-compilation:

```python
# Build an ARM64 binary on an x86_64 machine
bazel build //my:binary \
    --platforms=@platforms//cpu:arm64
```

Bazel will:
1. Use your x86_64 machine as the host platform
2. Target ARM64 as the target platform
3. Find a toolchain that can build ARM64 code
4. Configure the toolchain correctly

## Configuration Files

Common settings go in `.bazelrc`:

```python
# Default to optimized builds
build --compilation_mode=opt

# Build for ARM64 by default
build --platforms=@platforms//cpu:arm64

# Use specific C++ compiler
build --cpp_compiler=clang
```

## Advanced Topics

### Creating Custom Toolchains

For specialized build requirements, you can create custom toolchains:

```python
toolchain_type(
    name = "custom_compiler_toolchain",
)

# Implementation details in later sections...
```

### Platform Constraints

Platforms can have custom constraints:

```python
constraint_setting(name = "gpu")
constraint_value(
    name = "cuda",
    constraint_setting = ":gpu",
)
```

## Best Practices

1. **Platform Selection**
   - Use standard platforms when possible
   - Define custom platforms only when needed
   - Document platform requirements

2. **Toolchain Management**
   - Keep toolchains self-contained
   - Provide clear interfaces
   - Test with all supported platforms

3. **Configuration**
   - Use .bazelrc for common settings
   - Keep platform-specific configs separate
   - Document configuration options

## Common Issues

### Wrong Platform
```bash
ERROR: Target platform does not match constraints
```
- Check platform constraints
- Verify toolchain compatibility
- Review build configuration

### Missing Toolchain
```bash
ERROR: no matching toolchain found
```
- Ensure toolchain is registered
- Check platform compatibility
- Verify toolchain implementation

## Related Documentation

- [Core Concepts](core-concepts.md)
- [Dependencies and Actions](dependencies-and-actions.md)
- [Official Toolchain Documentation](https://bazel.build/extending/toolchains)
- [Official Platform Documentation](https://bazel.build/concepts/platforms)

## Next Steps

- Learn about [Hermetic Environment](hermetic-environment.md) to understand how Bazel manages environments
- Explore [Rules and Evaluation](rules-and-evaluation.md) to create custom rules
- Study [Dependencies and Actions](dependencies-and-actions.md) to understand the build process