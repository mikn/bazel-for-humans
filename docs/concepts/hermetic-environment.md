# Hermetic Environment

## What is Hermeticity?

The word "hermetic" comes from Hermes Trismegistus, a legendary figure in alchemy who was said to have the power to seal vessels so perfectly that nothing could escape. In modern usage, "hermetically sealed" means completely airtight and isolated from external influences - like a vacuum-sealed container in a laboratory.

In software builds, hermeticity means creating a build environment that's completely sealed off from the surrounding system, containing everything it needs within itself. This means that given the same inputs, you'll get the same outputs every time, regardless of where or when you run the build.

## Why Hermeticity Matters

Consider these common build problems:
- "Works on my machine" but fails in CI
- Builds that depend on system-installed libraries
- Tests that pass locally but fail in production
- Security vulnerabilities from untrusted dependencies
- Flaky tests due to timestamp or environment differences

Hermeticity solves these by ensuring your build environment is:
1. **Complete** - All dependencies are explicitly declared
2. **Isolated** - No interference from the host system
3. **Reproducible** - Same inputs always produce same outputs
4. **Secure** - No untrusted or undeclared code execution

## How Bazel Ensures Hermeticity

### Out-of-Tree Builds

Unlike traditional build systems that create artifacts alongside source files ("in-tree"), Bazel strictly separates source and output:

```
workspace/
├── src/
│   ├── BUILD
│   └── main.cc
└── bazel-bin/      # Separate build output directory
    └── src/
        └── app     # Built binary
```

This separation:
- Prevents accidental dependencies on build artifacts
- Makes it impossible to use files that aren't declared
- Ensures build reproducibility
- Makes it easy to clean builds (just delete bazel-* directories)

### Sandboxing

Bazel sandboxes each build action to ensure hermeticity:

```python
# Each action runs in its own sandbox with:
# 1. Only declared inputs available
# 2. Limited system access
# 3. Controlled environment variables
cc_binary(
    name = "app",
    srcs = ["app.cc"],
    data = ["config.txt"],  # Must declare ALL needed files
)
```

On Linux, Bazel uses:
- Mount namespaces for filesystem isolation
- Process namespaces for process isolation
- Network namespaces for network control
- Resource limits for CPU/memory control

### Dependency Detection

Bazel enforces explicit dependency declaration:

```python
# This will fail - header dependency not declared
cc_library(
    name = "lib",
    srcs = ["lib.cc"],
    # Missing hdrs = ["lib.h"]
)

# This works - all dependencies explicit
cc_library(
    name = "lib",
    srcs = ["lib.cc"],
    hdrs = ["lib.h"],
    deps = ["//third_party/json"],
)
```

### Environment Control

Bazel controls the build environment through explicit configuration:

```python
# In .bazelrc - define a controlled environment
build --incompatible_strict_action_env
build --action_env=PATH=/bin:/usr/bin
build --action_env=LANG=C.UTF-8
```

## Why Not Just Use Containers for Builds?

While containers like Docker provide isolation, they're not optimized for build systems. Here's why Bazel takes a different approach:

### 1. Build Performance

#### Container Issues:
- Layer-based caching is too coarse
- Must rebuild entire layer if any file changes
- Uses VMs on macOS/Windows which makes builds much slower (cannot use the full machine)
- Network translation adds latency

#### Bazel's Approach:
```python
# Bazel caches at the action level
cc_binary(
    name = "app",
    srcs = ["app.cc"],
    deps = ["//lib"],  # Only rebuilds when dependencies change
)
```

### 2. Dependency Management

#### Container Issues:
```dockerfile
# Container makes ALL tools available to ALL builds
FROM ubuntu:22.04
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    nodejs
# Can't track what each build actually needs
```

#### Bazel's Approach:
```python
# Each target declares exactly what it needs
cc_binary(
    name = "app",
    srcs = ["app.cc"],
    deps = ["//third_party/protobuf"],
)

py_binary(
    name = "script",
    srcs = ["script.py"],
    deps = ["//third_party/requests"],
)
```

### 3. Cross-Platform Builds

#### Container Issues:
- Different behavior on Linux vs macOS/Windows
- Network structure varies by platform
- Filesystem access has different semantics
- Resource limits work differently

#### Bazel's Approach:
```python
# Same behavior everywhere
platform(
    name = "linux_x86_64",
    constraint_values = [
        "@platforms//os:linux",
        "@platforms//cpu:x86_64",
    ],
)

# Cross-compilation just works
build --platforms=//platforms:arm64
```

### 4. Build Correctness

#### Container Issues:
- Can accidentally use undeclared files
- Network access is hard to control
- Environment variables leak through
- No cryptographic verification

#### Bazel's Approach:
```python
# Every input must be declared
cc_binary(
    name = "app",
    srcs = ["app.cc"],
    data = ["config.txt"],
)

# Dependencies are verified
http_archive(
    name = "rules_cc",
    urls = ["https://github.com/.../rules_cc-1.0.0.tar.gz"],
    sha256 = "abc123...",
)
```

## Grades of Hermeticity

Not all builds are equally hermetic. Here's the spectrum from most to least hermetic:

### Grade 1: Fully Hermetic
- All dependencies statically linked
- No system calls except basic I/O
- No environment variables
- No network access
- Reproducible bit-for-bit

Example: Security-critical binaries, blockchain validators

### Grade 2: System Libc Only
- Dynamic libc, static everything else
- Limited system calls
- Controlled environment variables
- No network access

Example: Command-line tools, system utilities

### Grade 3: System Dependencies
- Uses system libraries
- Controlled environment
- Limited network access (only for dependencies)
- Verified external dependencies

Example: Most application builds

### Grade 4: Environment Dependent
- Uses system tools
- Depends on environment variables
- Network access during build
- Some non-reproducible outputs

Example: Development builds, prototypes

## Related Topics

- [Dependencies and Actions](dependencies-and-actions.md)
- [Remote Execution](remote-execution.md)
- [Configuration and Toolchains](configuration-and-toolchains.md)