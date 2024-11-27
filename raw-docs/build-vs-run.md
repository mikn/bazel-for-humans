# Bazel: Separation of Build and Runtime Concerns

## Core Principle

Bazel is primarily a **build system**, not a scripting or task automation tool. Success with Bazel comes from maintaining this clear separation.

## What Belongs Where

### Build-Time Operations (Bazel's Domain)

#### 1. File and Dependency Management
```python
# Good: Using Bazel for managing build artifacts
filegroup(
    name = "configs",
    srcs = glob(["*.yaml"]),
)

go_binary(
    name = "server",
    srcs = ["main.go"],
    deps = [":server_lib"],
)
```

#### 2. Image and Resource Generation
```python
# Good: Using Bazel for build-time image handling
kustomize(
    name = "k8s_manifests",
    srcs = ["deployment.yaml"],
    image_overrides = {
        "registry.example.com/myapp": "//services/myapp:image",
    },
)
```

#### 3. Toolchain Management
```python
# Good: Platform-specific toolchain configuration
register_tool_toolchains(
    name = "kubectl",
    toolchain_type = "//tools/kubectl:toolchain_type",
    targets = {
        "//platforms:linux_amd64": "@kubectl_linux_amd64//:kubectl",
        "//platforms:darwin_arm64": "@kubectl_darwin_arm64//:kubectl",
    },
)
```

### Runtime Operations (Script Domain)

#### 1. Deployment Scripts
```bash
#!/bin/bash
# Good: Runtime deployment logic in shell script
bazel build //k8s:manifests
kubectl apply -f bazel-bin/k8s/manifests.yaml
```

#### 2. Development Workflows
```bash
#!/bin/bash
# Good: Development environment setup
bazel run //tools:kind -- create cluster
bazel run //tools:kubectl -- apply -f $(bazel build //k8s:setup)
```

#### 3. Service Orchestration
```bash
#!/bin/bash
# Good: Runtime service management
bazel build //services:all
./scripts/deploy_services.sh bazel-bin/services/*
```

## Common Antipatterns

### 1. Build Logic in Scripts
```bash
# Bad: Mixing build logic in scripts
#!/bin/bash
go build ./...
docker build -t myapp .
kubectl apply -f k8s/
```

### 2. Runtime Operations in Bazel
```python
# Bad: Using genrule for runtime operations
genrule(
    name = "deploy",
    srcs = [":manifests"],
    outs = ["deploy_result.txt"],
    cmd = "kubectl apply -f $(location :manifests) > $@",
)
```

### 3. Environment-Specific Build Logic
```python
# Bad: Environment-dependent build logic
kustomize(
    name = "manifests",
    cmd = "if [$ENV == 'prod']; then ...",  # Don't do this
)
```

## Real-World Example: Kubernetes Manifest Management

### Build Time (Bazel)
```python
# BUILD.bazel
load("//build:kustomize.bzl", "kustomize")

kustomize(
    name = "base",
    srcs = ["deployment.yaml", "service.yaml"],
    image_overrides = {
        "registry.example.com/myapp": "//services/myapp:image",
    },
)
```

### Runtime (Shell)
```bash
# tools/scripts/hydrate_cell.sh
#!/bin/bash
cell="$1"
shift
mkdir -p $BUILD_WORKSPACE_DIRECTORY/platform/cells/$cell/live/k8s
for manifest in "$@"; do
    cp -f "$manifest" $BUILD_WORKSPACE_DIRECTORY/platform/cells/$cell/live/k8s/
done
```

## Best Practices

### 1. Clear Boundaries
- Bazel for artifact generation
- Scripts for runtime operations
- No mixing of concerns

### 2. Proper Tool Selection
- Use Bazel rules for build operations
- Use shell/Python for runtime scripts
- Avoid genrules for runtime operations

### 3. Configuration Management
- Build-time configs in BUILD files
- Runtime configs in separate files
- Environment-specific settings in scripts

### 4. Error Handling
- Build errors handled by Bazel
- Runtime errors handled by scripts
- Clear separation of error domains

## Project Structure Example
```
project/
├── MODULE.bazel          # Dependencies and build setup
├── BUILD.bazel           # Build definitions only
├── src/                  # Source code
│   └── BUILD.bazel
├── scripts/              # Runtime operations
│   ├── deploy.sh
│   └── setup_env.sh
└── tools/                # Development tools
    └── BUILD.bazel
```

## Key Takeaways

1. **Bazel's Strength**:
   - Managing dependencies
   - Building artifacts
   - Ensuring reproducibility
   - Toolchain management

2. **Scripts' Strength**:
   - Environment setup
   - Deployment procedures
   - Service orchestration
   - Runtime operations

3. **Benefits of Separation**:
   - Clearer responsibilities
   - Better maintainability
   - Proper tool usage
   - Reliable operations