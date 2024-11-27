# Understanding bazel run: The Build-Runtime Bridge

## Overview

`bazel run` is a powerful convenience mechanism that bridges build and runtime operations:
- Resolves and builds dependencies
- Sets up execution environments
- Manages arguments and environment variables
- Stages necessary files
- Provides Make-like task execution

## Core Functionality

### 1. Basic Operation
```bash
# Build and execute
bazel run //cmd:tool

# With arguments
bazel run //cmd:tool -- arg1 arg2

# With environment variables
ENV_VAR=value bazel run //cmd:tool
```

### 2. Transparent Resolution
```python
# BUILD.bazel
go_binary(
    name = "tool",
    srcs = ["main.go"],
    deps = [":library"],
)
```
`bazel run` automatically:
- Builds the binary
- Builds all dependencies
- Sets up the execution environment
- Manages binary location and execution

## Real-World Example: get_cell Tool

### Build Definition
```python
# BUILD.bazel
tool_runner(
    name = "get_cell",
    tool = "//tools/bin/get_cell:get_cell",
    data = ["@un_locode_data//file"],
    args = ["$(location @un_locode_data//file)"],
)
```

### Implementation
```go
func run(cmd *cobra.Command, args []string) error {
    file := args[0]  # Gets staged data file path
    lat, lon, err := parseCoordinates(args[1], args[2])
    // ... implementation
}
```

### Usage
```bash
bazel run //tools:get_cell -- 63.829323 20.273889
```

## Common Patterns

### 1. Development Tools
```python
# BUILD.bazel
tool_runner(
    name = "golangci-lint",
    in_workspace = True,
    tool = select({
        "//platforms:linux_amd64": "@golangci_lint_linux_amd64//:golangci-lint",
        "//platforms:darwin_arm64": "@golangci_lint_darwin_arm64//:golangci-lint",
    }),
)
```
```bash
# Usage
bazel run //:golangci-lint -- ./...
```

### 2. Build and Deploy Tools
```python
# BUILD.bazel
tool_runner(
    name = "kubectl",
    in_workspace = True,
    tool = select({...}),
    data = [":k8s_manifests"],
)
```
```bash
# Usage
bazel run //:kubectl -- apply -f $(location :k8s_manifests)
```

### 3. Code Generation
```python
# BUILD.bazel
tool_runner(
    name = "generate_versions",
    cmd_args = ["--output-path=$BUILD_WORKSPACE_DIRECTORY/tools/data/versions"],
    tool = ":version_gen",
)
```
```bash
# Usage
bazel run //:generate_versions
```

## Make-like Task Execution

### Traditional Make vs Bazel Run
```bash
# Make approach
make lint
make generate
make deploy

# Bazel equivalent
bazel run //:golangci-lint
bazel run //:generate_versions
bazel run //:kubectl -- apply -f k8s/
```

### Key Differences
1. **Dependency Management**
   - Make: Manual dependency specification
   - Bazel: Automatic dependency resolution

2. **Tool Management**
   - Make: Assumes tools are installed
   - Bazel: Manages tool versions and availability

3. **Platform Handling**
   - Make: Often requires platform-specific logic
   - Bazel: Handles platform differences transparently

## Benefits

### 1. Convenience
- Single command for complex operations
- Consistent interface across tools
- Familiar Make-like usage

### 2. Correctness
- Ensures dependencies are built
- Manages tool versions
- Handles platform differences

### 3. Reproducibility
- Consistent execution environment
- Versioned external data
- Controlled file staging

## Best Practices

### 1. Tool Definition
```python
# Good: Clear tool definition with platform support
tool_runner(
    name = "tool",
    tool = select({...}),
    in_workspace = True,
)
```

### 2. Data Handling
```python
# Good: Explicit data dependencies
tool_runner(
    name = "tool",
    data = [":required_data"],
    args = ["$(location :required_data)"],
)
```

### 3. Environment Setup
```python
# Good: Workspace-aware execution
tool_runner(
    name = "tool",
    in_workspace = True,
    env = {
        "CONFIG_PATH": "$(location :config)",
    },
)
```

## Key Takeaways

1. `bazel run` is more than just "build and execute"
2. Provides Make-like convenience with Bazel's reproducibility
3. Handles complex dependency chains transparently
4. Manages platform-specific details automatically
5. Bridges build-time and runtime operations safely