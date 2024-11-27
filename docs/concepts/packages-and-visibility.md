# Packages and Visibility in Modern Bazel

Packages in Bazel are collections of related files and their associated build rules. Visibility rules control how these packages can be used by other parts of your build. Understanding both is crucial for creating maintainable builds.

## Package Concepts

### What is a Package?
- A directory containing a BUILD.bazel file
- All files in that directory (unless claimed by a subpackage)
- Build rules that create targets
- Visibility declarations that control access

### Package Naming
- Follows directory structure from workspace root
- Uses forward slashes (/) even on Windows
- Cannot cross repository boundaries
- Must be unique within a repository

## Package Structure

### Basic Layout
```
my_project/
├── MODULE.bazel           # Module definition
├── BUILD.bazel           # Root package
├── .bazelrc             # Bazel configuration
└── src/
    ├── BUILD.bazel      # Source package
    ├── lib/
    │   └── BUILD.bazel  # Library package
    └── test/
        └── BUILD.bazel  # Test package
```

## Visibility Rules

### Default Visibility
```python
# In BUILD.bazel
package(
    default_visibility = ["//visibility:private"],  # Most restrictive
)

# Or
package(
    default_visibility = ["//visibility:public"],   # Least restrictive
)
```

### Target-specific Visibility
```python
py_library(
    name = "lib",
    srcs = ["lib.py"],
    # Only visible to specific packages
    visibility = [
        "//my/package:__pkg__",          # This package only
        "//my/package:__subpackages__",  # This package and subpackages
        "@other_module//some/pkg:__pkg__",  # Package in another module
    ],
)
```

### Package Groups
```python
# Define a group of packages
package_group(
    name = "internal_pkgs",
    packages = [
        "//src/...",          # All packages under src
        "//test/integration",  # Specific package
    ],
)

cc_library(
    name = "internal_lib",
    visibility = [":internal_pkgs"],
)
```

## Common Patterns

### 1. API Boundaries
```python
# Private implementation
cc_library(
    name = "internal",
    srcs = ["internal.cc"],
    visibility = ["//visibility:private"],
)

# Public API
cc_library(
    name = "public_api",
    srcs = ["api.cc"],
    deps = [":internal"],
    visibility = ["//visibility:public"],
)
```

### 2. Test Access
```python
cc_library(
    name = "testonly_lib",
    testonly = True,  # Can only be used by tests
    visibility = ["//javatests:__subpackages__"],
)

cc_test(
    name = "lib_test",
    srcs = ["lib_test.cc"],
    deps = [":testonly_lib"],
)
```

### 3. Module Boundaries
```python
# In src/lib/BUILD.bazel
cc_library(
    name = "lib",
    visibility = [
        "//src:__subpackages__",  # Visible within our module
        "@other_module//authorized/path:__pkg__",  # Specific external access
    ],
)
```

## Best Practices

### 1. Package Organization
```python
# Good: Logical grouping with clear boundaries
//src/
    auth/           # Authentication package
        BUILD.bazel
        auth.py
        session.py
    api/            # API package
        BUILD.bazel
        handlers.py
    models/         # Data models
        BUILD.bazel
        user.py

# Avoid: Too fine-grained or too coarse
//src/everything/  # Too coarse
//src/auth/impl/session/manager/  # Too fine-grained
```

### 2. Visibility Control
- Start with private visibility by default
- Explicitly declare public APIs
- Use package groups for related access
- Document visibility decisions

### 3. Test Structure
```python
# Source package
//src/lib/
    BUILD.bazel
    lib.py

# Test package (parallel structure)
//src/lib/tests/
    BUILD.bazel
    lib_test.py
```

## Common Issues

### 1. Visibility Problems
```python
# Error: Target '@other_module//lib:utils' is not visible
deps = ["@other_module//lib:utils"]  # Missing visibility

# Fix: Add visibility in @other_module//lib:BUILD.bazel
cc_library(
    name = "utils",
    visibility = ["//visibility:public"],  # Or more specific
)
```

### 2. Package Boundary Violations
```python
# Error: File not in package
srcs = ["../util/helper.py"]  # Crosses package boundary

# Fix: Create a dependency
deps = ["//src/util:helper"]
```

### 3. Circular Dependencies
```python
# Avoid circular dependencies between packages
//src/a:lib_a  ->  //src/b:lib_b  ->  //src/a:lib_a

# Solution: Restructure or create a common dependency
//src/common:shared  <-  //src/a:lib_a
                    <-  //src/b:lib_b
```

## See Also

- [Labels and Targets](/concepts/labels-and-targets)
- [Dependencies and Actions](/concepts/dependencies-and-actions)
- [Build vs Runtime](/concepts/build-vs-runtime)
