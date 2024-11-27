# Bazel Core Concepts: Packages, Visibility, and More

## Packages

### Basic Concept
A package is the fundamental unit of code organization in Bazel, defined as:
- A directory containing a BUILD or BUILD.bazel file
- All files and subdirectories beneath it (except those belonging to other packages)

```
my_project/
├── BUILD.bazel           # Defines a package
├── foo/
│   ├── BUILD.bazel      # Defines another package
│   ├── foo.go
│   └── foo_test.go
└── bar/
    └── bar.go           # Part of root package (no BUILD file in bar/)
```

### Package Names and Labels
```python
# Full package specification
//path/to/package:target

# Example target in current package
:my_binary

# Example target in different package
//services/api:server

# Package-default target
//services/api
```

## Visibility

### Basic Concept
Visibility controls which packages can depend on targets within a package.

### Common Patterns
```python
# Private by default - only visible within package
go_library(
    name = "internal_lib",
)

# Public to specific packages
go_library(
    name = "api_lib",
    visibility = [
        "//services/frontend:__pkg__",    # Single package
        "//services/backend/...",         # Package and subpackages
    ],
)

# Public to entire project
go_library(
    name = "common_lib",
    visibility = ["//visibility:public"],
)

# Restricted to specific organization
go_library(
    name = "internal_api",
    visibility = ["@org_name//..."],
)
```

### Visibility Specifications
```python
# Common visibility patterns
visibility = [
    "//visibility:public",           # Visible to everyone
    "//visibility:private",          # Default - package private
    "//some/package:__pkg__",        # Just this package
    "//some/package:__subpackages__",# Package and its subpackages
    "@//foo/bar/...",               # All packages under foo/bar
    "@repository//foo/bar:__pkg__",  # External repository reference
]
```

## Package Groups

### Purpose
- Define reusable visibility groups
- Manage visibility for multiple targets
- Create logical groupings of packages

### Definition and Usage
```python
# BUILD.bazel
package_group(
    name = "api_consumers",
    packages = [
        "//services/web/...",
        "//services/mobile/...",
    ],
)

go_library(
    name = "api_lib",
    visibility = [":api_consumers"],
)
```

## Package Boundaries

### Best Practices
1. **Package Granularity**
   ```python
   # Good: Logical grouping
   //services/auth/
   ├── BUILD.bazel
   ├── auth.go        # Core auth logic
   ├── handlers/      # HTTP handlers
   │   └── BUILD.bazel
   └── store/        # Storage logic
       └── BUILD.bazel
   ```

2. **Visibility Boundaries**
   ```python
   # Good: Clear visibility boundaries
   go_library(
       name = "auth_lib",
       visibility = ["//visibility:private"],  # Implementation details
   )

   go_binary(
       name = "auth_service",
       visibility = ["//visibility:public"],   # Public interface
   )
   ```

## Directory Structure and Packages

### Common Patterns

#### 1. Service Structure
```
services/
├── BUILD.bazel           # Service collection package
├── api/
│   ├── BUILD.bazel      # API package
│   └── server.go
└── database/
    ├── BUILD.bazel      # Database package
    └── db.go
```

#### 2. Library Structure
```
lib/
├── BUILD.bazel
├── public/              # Public interfaces
│   ├── BUILD.bazel
│   └── api.go
└── internal/            # Implementation details
    ├── BUILD.bazel
    └── impl.go
```

## Load Statements and Visibility

### Package Dependencies
```python
# BUILD.bazel
load("//tools/build:rules.bzl", "custom_rule")  # Load from package
load("@rules_go//go:def.bzl", "go_binary")      # Load from external repo

custom_rule(
    name = "my_target",
    visibility = ["//visibility:public"],
)
```

## Package Features

### 1. Package Documentation
```python
# BUILD.bazel
"""
Package auth provides authentication services.

This package implements OAuth2 and basic auth.
"""

load("@rules_go//go:def.bzl", "go_library")
```

### 2. Package-Level Default Visibility
```python
# BUILD.bazel
package(default_visibility = ["//visibility:public"])

# All targets in this package will be public unless specified
```

### 3. Package Configurations
```python
# BUILD.bazel
config_setting(
    name = "linux_arm64",
    constraint_values = [
        "@platforms//os:linux",
        "@platforms//cpu:arm64",
    ],
)
```

## Common Gotchas

1. **Circular Dependencies**
   - Packages cannot have circular dependencies
   - Must refactor to break cycles

2. **Visibility vs Load**
   - Visibility controls usage of targets
   - Load statements control access to rules/macros

3. **Package Boundaries**
   - Cannot have nested BUILD files within same package
   - Must maintain clear package boundaries

4. **Default Visibility**
   - Private by default
   - Must be explicit about public interfaces

## Best Practices

1. **Package Organization**
   - Keep packages focused and cohesive
   - Use meaningful package boundaries
   - Follow your language's conventions

2. **Visibility Management**
   - Be explicit about visibility
   - Use package groups for complex visibility
   - Keep implementation details private

3. **Package Documentation**
   - Document package purpose
   - Explain visibility choices
   - Note any special requirements

4. **Package Testing**
   - Test targets in same package
   - Use test visibility when needed
   - Consider separate test packages

## Key Takeaways

1. **Packages are Fundamental**
   - Basic unit of code organization
   - Defined by BUILD files
   - Clear boundaries and ownership

2. **Visibility is Critical**
   - Controls dependencies
   - Enforces encapsulation
   - Manages API boundaries

3. **Structure Matters**
   - Package layout affects usability
   - Visibility affects maintainability
   - Organization affects scalability