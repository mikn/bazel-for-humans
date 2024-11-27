# Understanding Labels and Targets in Modern Bazel

Labels in Bazel are references that uniquely identify build targets. In modern Bazel with Bzlmod, labels follow a consistent pattern that reflects the module-based architecture.

## Label Structure

### Basic Format
```python
@module//path/to/package:target
^      ^                ^
|      |                └── Target name (optional, defaults to package name)
|      └── Package path from module root
└── Module name (optional for local module)
```

### Module References

#### 1. Local Module References
```python
# Reference within your module
//my/package:target     # Explicit target
//my/package           # Package default target
:target               # Target in current package
```

#### 2. External Module References
```python
# Reference to external module
@rules_python//python:defs.bzl
@rules_go//go:def.bzl
```

## Target Types

### 1. Build Rule Targets
```python
# In BUILD.bazel
load("@rules_python//python:defs.bzl", "py_binary")

py_binary(
    name = "app",
    srcs = ["main.py"],
)

# Referenced as //my/package:app
```

### 2. File Targets
```python
# Source files
//my/package:main.py
//my/package/main.py    # Both forms are equivalent

# Generated files
//my/package:protos/message_pb2.py
```

### 3. Package Groups
```python
# In BUILD.bazel
package_group(
    name = "internal",
    packages = [
        "//my/package/...",    # All packages under my/package
    ],
)
```

## Label Resolution

### Same Package References
```python
# In //my/app/BUILD.bazel
py_library(
    name = "lib",
    srcs = ["lib.py"],
    deps = [
        ":utils",           # Same package
        "//common:base",    # Different package
        "@pytest//:lib",    # External module
    ],
)
```

### Cross-Package References
```python
# Must use full package path
py_binary(
    name = "app",
    deps = [
        "//my/app/util:lib",    # Local module
        "@rules_python//python/pip_install:requirements.bzl",  # External
    ],
)
```

## Common Patterns

### 1. Source Organization
```python
# Preferred: Clear package boundaries
//src/server:main.py
//src/server/auth:handler.py
//src/server/db:models.py

# Avoid: Deeply nested packages
//src/com/example/myapp/server/internal/auth:handler.py
```

### 2. Test References
```python
py_test(
    name = "lib_test",
    srcs = ["lib_test.py"],
    deps = [
        ":lib",                    # Target under test
        "@pytest//:pytest",        # Test framework
        "//testing/utils:mock",    # Test utilities
    ],
)
```

### 3. Data Dependencies
```python
go_binary(
    name = "server",
    srcs = ["main.go"],
    data = [
        "config.json",            # Data file in same package
        "//configs:prod.json",    # Data from another package
    ],
)
```

## Best Practices

### 1. Label Clarity
```python
# Good: Explicit and clear
deps = ["//third_party/protobuf:lib"]
deps = ["@rules_go//go:def.bzl"]

# Avoid: Ambiguous or implicit
deps = ["protobuf"]
deps = ["//external/rules_go/go:def.bzl"]  # Use @rules_go instead
```

### 2. Package Organization
- Keep related targets in the same package
- Use meaningful package names
- Avoid deep package hierarchies
- Group tests with their targets

### 3. Visibility
```python
py_library(
    name = "internal_lib",
    visibility = ["//my/package:__subpackages__"],  # Visible to subpackages
)

py_library(
    name = "public_lib",
    visibility = ["//visibility:public"],  # Visible to all
)
```

## Common Issues

1. **Label Resolution Failures**
   - Check package paths are correct
   - Verify target exists in specified package
   - Ensure proper visibility settings

2. **Module References**
   - Use `@module` prefix for external dependencies
   - Verify module is declared in MODULE.bazel
   - Check for version compatibility

3. **Path Issues**
   - Use forward slashes (/) even on Windows
   - Package paths are relative to module root
   - File paths are relative to BUILD.bazel location

## See Also

- [Packages and Visibility](/concepts/packages-and-visibility)
- [Dependencies and Actions](/concepts/dependencies-and-actions)
- [Bazel Central Registry](/concepts/bazel-central-registry)
