# Unified Build and Runtime Environment

This guide explains how Bazel's three core systems work together to create a powerful, unified development environment:
1. Build System (hermetic builds)
2. Repository System (dependency management)
3. Runtime Environment (execution and tooling)

## The Three Pillars

### 1. Build System
- Hermetic builds ensuring reproducibility
- Deterministic outputs across platforms
- Platform-independent build definitions
- Incremental and parallel compilation
- Remote caching and execution support
- Toolchain resolution and configuration

### 2. Repository System
- Modern dependency management with Bzlmod
- Centralized version control
- Tool and runtime management
- Cross-platform compatibility
- Reproducible dependency resolution
- Security and provenance verification

### 3. Runtime Environment
- Consistent execution environments
- Automated tool orchestration
- Standardized development workflows
- Deployment automation and validation
- Environment-specific configurations
- Hermetic test execution

## Why This Matters

Traditional development environments often suffer from these issues:

```markdown
# Common Development Setup Problems

1. Environment Setup
   - Different Node.js versions between developers
   - Incompatible Python package versions
   - Missing or incorrect system dependencies
   - Inconsistent tool versions

2. Build Process
   - Non-reproducible builds
   - Platform-specific build scripts
   - Manual dependency management
   - Inconsistent build flags

3. Runtime Environment
   - Environment variable mismatches
   - Different container versions
   - Inconsistent tool configurations
   - Platform-specific paths
```

::: warning
These issues lead to the "works on my machine" problem, making builds unreliable and debugging difficult.
:::

## Bazel's Unified Solution

### 1. Define Development Environment

```python
# MODULE.bazel
module(
    name = "my_project",
    version = "1.0.0",
    compatibility_level = 1,
)

# Build tools with modern versions
bazel_dep(name = "rules_go", version = "0.41.0")
bazel_dep(name = "rules_python", version = "0.24.0")
bazel_dep(name = "rules_nodejs", version = "5.8.0")
bazel_dep(name = "rules_docker", version = "0.25.0")
bazel_dep(name = "rules_pkg", version = "0.9.1")

# Development tools
dev_dependency(name = "buildifier", version = "6.3.3")
dev_dependency(name = "golangci_lint", version = "1.54.2")
dev_dependency(name = "black", version = "23.7.0")

# Runtime tools
dev_dependency(name = "kubectl", version = "1.27.3")
dev_dependency(name = "helm", version = "3.12.2")

# Override transitive dependencies if needed
single_version_override(
    module_name = "protobuf",
    version = "3.19.0",
)
```

### 2. Create Hermetic Tool Wrappers

```python
# tools/BUILD.bazel
load("@rules_python//python:defs.bzl", "py_binary")
load("@io_bazel_rules_go//go:def.bzl", "go_binary")
load("@rules_pkg//pkg:mappings.bzl", "pkg_files", "strip_prefix")

# Development tools with explicit versions
py_binary(
    name = "format",
    srcs = ["format.py"],
    deps = ["@black//:black"],
    python_version = "PY3",
    srcs_version = "PY3",
)

go_binary(
    name = "lint",
    srcs = ["lint.go"],
    deps = [
        "@com_github_golangci_lint//cmd/golangci-lint",
        "//tools/config:lint_config",
    ],
    pure = "on",
)

# Runtime tools with environment setup
sh_binary(
    name = "dev_env",
    srcs = ["dev_env.sh"],
    data = [
        ":format",
        ":lint",
        "@kubectl//:kubectl",
        "@helm//:helm",
        "//config:dev",
    ],
    env = {
        "DOCKER_BUILDKIT": "1",
        "COMPOSE_DOCKER_CLI_BUILD": "1",
    },
    deps = ["//tools/lib:env_setup"],
)

# Tool configurations
pkg_files(
    name = "tool_configs",
    srcs = glob(["config/**/*.yaml"]),
    prefix = "config",
    strip_prefix = strip_prefix.from_pkg("config"),
)
```

### 3. Bridge Build and Runtime

```python
# tools/dev/BUILD.bazel
load("@rules_docker//container:container.bzl", "container_image", "container_layer")
load("@rules_pkg//pkg:tar.bzl", "pkg_tar")

# Base development environment
container_layer(
    name = "dev_base",
    directory = "/app",
    files = [
        "//tools:format",
        "//tools:lint",
        "@kubectl//:kubectl",
        "@helm//:helm",
    ],
)

# Tool configurations layer
container_layer(
    name = "tool_configs",
    directory = "/etc/config",
    tars = ["//tools:tool_configs.tar"],
)

# Development container with layered approach
container_image(
    name = "dev_image",
    base = "@ubuntu//image",
    layers = [
        ":dev_base",
        ":tool_configs",
    ],
    env = {
        "PATH": "/app/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
        "PYTHONPATH": "/app/lib/python",
        "GOPATH": "/app/go",
    },
    labels = {
        "org.opencontainers.image.source": "https://github.com/myorg/myproject",
        "org.opencontainers.image.version": "1.0.0",
    },
)

# Development environment runner
sh_binary(
    name = "dev_env",
    srcs = ["dev_env.sh"],
    data = [
        ":dev_image.tar",
        "//config:dev.env",
    ],
    args = ["$(location :dev_image.tar)"],
)
```

```bash
#!/bin/bash
# tools/dev/dev_env.sh
set -euo pipefail

# Load environment variables
if [[ -f "${BUILD_WORKSPACE_DIRECTORY}/config/dev.env" ]]; then
    source "${BUILD_WORKSPACE_DIRECTORY}/config/dev.env"
fi

# Parse arguments
IMAGE_TAR="$1"

# Load development image
IMAGE_ID=$(docker load -i "${IMAGE_TAR}" | sed -n 's/^Loaded image ID: sha256:\([a-f0-9]*\).*/\1/p')
IMAGE_TAG="dev_image:${IMAGE_ID}"
docker tag "sha256:${IMAGE_ID}" "${IMAGE_TAG}"

# Start development container with proper mounts
docker run -it --rm \
    --env-file "${BUILD_WORKSPACE_DIRECTORY}/config/dev.env" \
    --mount type=bind,source="${BUILD_WORKSPACE_DIRECTORY}",target=/workspace \
    --mount type=volume,source=dev_cache,target=/root/.cache \
    --workdir /workspace \
    --network host \
    --security-opt seccomp=unconfined \
    "${IMAGE_TAG}" "$@"
```

## Using the Unified Environment

### 1. Development Workflow

```bash
# Format code with consistent style
bazel run //tools:format

# Run linters with project-specific rules
bazel run //tools:lint

# Start development environment with all tools
bazel run //tools/dev:dev_env

# Run specific tool in development environment
bazel run //tools/dev:dev_env -- tools/format
```

### 2. Build and Test

```bash
# Build everything with remote cache
bazel build //... --remote_cache=grpc://cache.example.com

# Run tests with specific config
bazel test //... --config=ci

# Build specific service with custom platform
bazel build //services/myapp:image --platforms=@io_bazel_rules_go//go/toolchain:linux_amd64
```

### 3. Deployment

```bash
# Deploy to development environment
bazel run //tools/dev:deploy -- --env=dev

# Deploy to staging with specific version
bazel run //tools/staging:deploy -- --version=1.2.3

# Deploy to production with approval
bazel run //tools/prod:deploy -- --version=1.2.3 --require-approval
```

## Benefits of Unification

### 1. Complete Reproducibility
- Hermetic builds with explicit dependencies
- Versioned tools and runtime environments
- Consistent configurations across environments
- Locked dependencies with integrity checks
- Platform-independent build definitions

### 2. Efficient Development
- Zero manual setup requirements
- Fast, incremental builds with caching
- Automated workflows and tooling
- IDE integration with language servers
- Standardized formatting and linting

### 3. Reliable Deployment
- Identical tools across all environments
- Consistent runtime configurations
- Automated deployment processes
- Version-controlled environment definitions
- Reproducible container builds

## Best Practices

### 1. Clear Separation of Concerns

Build-time operations:
```python
# BUILD.bazel
go_binary(
    name = "server",
    srcs = ["main.go"],
    deps = [":server_lib"],
    pure = "on",
    static = "on",
    race = "off",
)
```

Runtime operations:
```python
# tools/BUILD.bazel
sh_binary(
    name = "deploy",
    srcs = ["deploy.sh"],
    data = [
        "//k8s:manifests",
        "@kubectl//:kubectl",
        "//config:deploy_config",
    ],
    args = ["$(location //k8s:manifests)"],
)
```

### 2. Tool Management

Version all tools with explicit compatibility:
```python
# MODULE.bazel
module(
    name = "myproject",
    version = "1.0.0",
    compatibility_level = 1,
)

bazel_dep(name = "buildifier", version = "6.3.3")
bazel_dep(name = "golangci_lint", version = "1.54.2")

# Tool configuration
tool_config(
    name = "golangci_lint_config",
    src = "//tools/config:golangci.yaml",
)
```

Create maintainable wrappers:
```python
# tools/BUILD.bazel
sh_binary(
    name = "lint_all",
    srcs = ["lint_all.sh"],
    data = [
        "//tools:golangci_lint",
        "//tools:buildifier",
        "//tools/config:lint_configs",
    ],
    deps = ["//tools/lib:lint_utils"],
)
```

### 3. Environment Configuration

Use modern .bazelrc settings:
```bash
# .bazelrc

# Enable Bzlmod
build --enable_bzlmod

# Use platforms
build --platforms=//platforms:default

# Remote execution
build:remote --remote_executor=grpc://remote.example.com

# Developer settings
build:dev --config=debug
build:dev --spawn_strategy=local

# CI settings
build:ci --config=release
build:ci --spawn_strategy=remote
```

Use typed environment configurations:
```python
# config/BUILD.bazel
load("//tools/config:defs.bzl", "environment_config")

environment_config(
    name = "dev",
    src = "dev.yaml",
    schema = "//schema:environment.json",
    visibility = ["//visibility:public"],
)
```

## Common Patterns

### 1. Development Containers

```python
# tools/devcontainer/BUILD.bazel
load("@rules_docker//container:container.bzl", "container_image")
load("@rules_pkg//pkg:mappings.bzl", "pkg_files")

# Development container with layered approach
container_image(
    name = "devcontainer",
    base = "@ubuntu//image",
    layers = [
        "//tools:dev_tools",
        "//tools:configs",
    ],
    env = {
        "DEVCONTAINER": "1",
        "SHELL": "/bin/bash",
    },
)
```

### 2. IDE Integration

```python
# tools/ide/BUILD.bazel
py_binary(
    name = "setup_ide",
    srcs = ["setup_ide.py"],
    data = [
        "//tools:format",
        "//tools:lint",
        "//tools/config:ide_settings",
    ],
    deps = [
        "//tools/lib:ide_utils",
        "@rules_python//python/runfiles",
    ],
)
```

### 3. CI/CD Integration

```python
# ci/BUILD.bazel
sh_binary(
    name = "ci_workflow",
    srcs = ["ci.sh"],
    data = [
        "//tools:test",
        "//tools:build",
        "//tools:deploy",
        "//ci/config:workflow",
    ],
    env = {
        "CI": "1",
        "DOCKER_BUILDKIT": "1",
    },
)
```

::: tip
Always use explicit versions, hermetic tools, and reproducible configurations to ensure consistent behavior across all environments.
:::

## Next Steps

1. Learn about [Build vs Runtime](/concepts/build-vs-runtime) for deeper understanding
2. Explore [Dependency Management](/best-practices/dependency-management) with Bzlmod
3. Understand [Remote Execution](/concepts/remote-execution) for scalable builds
