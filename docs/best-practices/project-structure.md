# Project Structure Best Practices

This guide covers best practices for organizing Bazel projects, from small single-language projects to large multi-language monorepos.

## Key Principles

1. **Clear Organization**
   - Logical directory structure
   - Consistent naming conventions
   - Well-defined package boundaries

2. **Scalable Architecture**
   - Modular design
   - Clear dependency boundaries
   - Reusable components

3. **Developer Experience**
   - Easy navigation
   - Clear build paths
   - Efficient workflows

## Basic Project Structure

### 1. Single Language Project

```
my-go-project/
├── MODULE.bazel           # Module definition
├── BUILD.bazel           # Root build file
├── .bazelrc             # Bazel configuration
├── .bazelversion        # Pinned Bazel version
├── cmd/                 # Entry points
│   └── server/
│       ├── BUILD.bazel
│       └── main.go
├── internal/            # Private packages
│   ├── auth/
│   │   ├── BUILD.bazel
│   │   └── auth.go
│   └── db/
│       ├── BUILD.bazel
│       └── db.go
├── pkg/                 # Public packages
│   └── api/
│       ├── BUILD.bazel
│       └── api.go
└── test/               # Integration tests
    ├── BUILD.bazel
    └── integration_test.go
```

### 2. Multi-Language Project

```
my-project/
├── MODULE.bazel
├── BUILD.bazel
├── .bazelrc
├── .bazelversion
├── go/                  # Go services
│   ├── cmd/
│   └── internal/
├── rust/                # Rust components
│   ├── src/
│   └── tests/
├── proto/               # Shared protos
│   └── api/
│       └── v1/
├── web/                 # Web frontend
│   ├── src/
│   └── public/
└── deploy/              # Deployment configs
    ├── k8s/
    └── terraform/
```

## BUILD File Organization

### 1. Root BUILD.bazel

```python
# Root BUILD.bazel
load("@gazelle//:def.bzl", "gazelle")

# Gazelle configuration
gazelle(
    name = "gazelle",
    prefix = "example.com/myproject",
)

# Project-wide defaults
package(default_visibility = ["//visibility:private"])
```

### 2. Library BUILD Files

```python
# pkg/api/BUILD.bazel
load("@rules_go//go:def.bzl", "go_library", "go_test")

go_library(
    name = "api",
    srcs = ["api.go"],
    importpath = "example.com/myproject/pkg/api",
    visibility = ["//visibility:public"],
)

go_test(
    name = "api_test",
    srcs = ["api_test.go"],
    embed = [":api"],
)
```

### 3. Binary BUILD Files

```python
# cmd/server/BUILD.bazel
load("@rules_go//go:def.bzl", "go_binary")

go_binary(
    name = "server",
    srcs = ["main.go"],
    deps = [
        "//internal/auth",
        "//internal/db",
        "//pkg/api",
    ],
)
```

## Package Organization

### 1. Public vs Private APIs

```python
# Public API in pkg/
go_library(
    name = "api",
    srcs = ["api.go"],
    importpath = "example.com/myproject/pkg/api",
    visibility = ["//visibility:public"],
)

# Private implementation in internal/
go_library(
    name = "auth",
    srcs = ["auth.go"],
    importpath = "example.com/myproject/internal/auth",
    visibility = ["//my-project:__subpackages__"],
)
```

### 2. Shared Components

```python
# proto/BUILD.bazel
proto_library(
    name = "api_proto",
    srcs = ["api.proto"],
    visibility = ["//visibility:public"],
)

# Generate for multiple languages
go_proto_library(
    name = "api_go_proto",
    proto = ":api_proto",
)

rust_proto_library(
    name = "api_rust_proto",
    proto = ":api_proto",
)
```

## Common Patterns

### 1. Feature Organization

Group related features:

```
features/
├── auth/              # Authentication feature
│   ├── BUILD.bazel
│   ├── service.go
│   └── models.go
├── billing/           # Billing feature
│   ├── BUILD.bazel
│   ├── service.go
│   └── models.go
└── notifications/     # Notifications feature
    ├── BUILD.bazel
    ├── service.go
    └── models.go
```

### 2. Test Organization

Organize tests by type:

```
test/
├── unit/             # Unit tests alongside code
├── integration/      # Integration tests
│   ├── BUILD.bazel
│   └── db_test.go
├── e2e/              # End-to-end tests
│   ├── BUILD.bazel
│   └── api_test.go
└── performance/      # Performance tests
    ├── BUILD.bazel
    └── load_test.go
```

### 3. Tool Organization

Keep tools separate:

```
tools/
├── BUILD.bazel
├── generate/         # Code generation tools
├── lint/            # Linting tools
└── release/         # Release tools
```

## Best Practices

1. **Directory Structure**
   - Use consistent naming
   - Group related code
   - Separate public and private code

2. **BUILD Files**
   - Keep them simple
   - Use consistent formatting
   - Minimize visibility

3. **Dependencies**
   - Clear dependency boundaries
   - Minimal public APIs
   - Version shared code

4. **Testing**
   - Co-locate unit tests
   - Separate integration tests
   - Organize by test type

## Common Issues

### 1. Visibility Issues

Handle visibility properly:

```python
# Too permissive
package(
    default_visibility = ["//visibility:public"],  # Avoid this
)

# Better approach
package(
    default_visibility = ["//visibility:private"],
)

go_library(
    name = "api",
    visibility = [
        "//cmd/server:__pkg__",  # Only what's needed
        "//internal/auth:__pkg__",
    ],
)
```

### 2. Circular Dependencies

Avoid circular dependencies:

```python
# Bad: auth depends on db, db depends on auth
# internal/auth/BUILD.bazel
go_library(
    name = "auth",
    deps = ["//internal/db"],
)

# internal/db/BUILD.bazel
go_library(
    name = "db",
    deps = ["//internal/auth"],  # Creates cycle
)

# Better: Extract shared code
# pkg/models/BUILD.bazel
go_library(
    name = "models",
    visibility = ["//visibility:public"],
)
```

### 3. Over-fragmentation

Balance package granularity:

```python
# Too granular
go_library(
    name = "string_utils",
    srcs = ["string_utils.go"],
)

go_library(
    name = "time_utils",
    srcs = ["time_utils.go"],
)

# Better: Group related utilities
go_library(
    name = "utils",
    srcs = [
        "string_utils.go",
        "time_utils.go",
    ],
)
```

## Next Steps

1. Learn about [Dependencies](../getting-started/dependencies.md)
2. Study [Performance Best Practices](https://bazel.build/configure/best-practices)
3. Explore [Testing and CI/CD](testing-and-ci.md) 