# Packages and Visibility

This guide explains how Bazel organizes code into packages and controls access between them. If you're familiar with programming concepts, packages are similar to modules in Python or packages in Java, while visibility rules are like access modifiers (public, private, etc.).

## Understanding Packages

### What is a Package?

A package is a collection of related files and the rules for building them. Every package:
- Has exactly one BUILD file (either `BUILD` or `BUILD.bazel`)
- Contains source files and build rules
- Has its own namespace for targets
- Controls what other packages can use its targets

Example package structure:
```
src/main/server/
├── BUILD.bazel        # Defines the package
├── server.cc          # Source files
├── server.h
├── auth/             # Subpackage
│   ├── BUILD.bazel
│   ├── auth.cc
│   └── auth.h
└── db/              # Subpackage
    ├── BUILD.bazel
    ├── db.cc
    └── db.h
```

### Package Names

Package names are derived from their directory path:
```python
//src/main/server        # Main server package
//src/main/server/auth   # Auth subpackage
//src/main/server/db     # Database subpackage
```

## Understanding Visibility

### What is Visibility?

Visibility controls which packages can use your targets. It's like access control in programming:
- `private` → visible only within the package
- `public` → visible to everyone
- Custom visibility → visible to specific packages

### Setting Visibility

```python
# Make a target private (default)
cc_library(
    name = "internal_lib",
    srcs = ["internal.cc"],
    # No visibility = private to package
)

# Make a target public
cc_library(
    name = "public_lib",
    srcs = ["public.cc"],
    visibility = ["//visibility:public"],
)

# Make a target visible to specific packages
cc_library(
    name = "auth_lib",
    srcs = ["auth.cc"],
    visibility = [
        "//src/main/server:__pkg__",        # Just this package
        "//src/main/server:__subpackages__", # This package and below
        "//src/test/server:__pkg__",        # Test package
    ],
)
```

### Package Groups

For complex visibility patterns, use package groups:

```python
# Define a group of packages
package_group(
    name = "server_packages",
    packages = [
        "//src/main/server/...",  # All server packages
        "//src/test/server/...",  # All server test packages
    ],
)

# Use the package group
cc_library(
    name = "server_lib",
    srcs = ["server.cc"],
    visibility = [":server_packages"],
)
```

## Package Organization

### Best Practices

1. **Package Granularity**
   - Keep packages focused and cohesive
   - One package per major component
   - Split large packages into subpackages

2. **Package Hierarchy**
   ```
   src/                      # Source root
   ├── main/                 # Main code
   │   ├── server/          # Server component
   │   ├── client/          # Client component
   │   └── common/          # Shared code
   └── test/                # Tests
       ├── server/
       ├── client/
       └── common/
   ```

3. **Visibility Design**
   - Start private by default
   - Make public only what's necessary
   - Use package groups for complex patterns
   - Document visibility decisions

### Common Patterns

#### Component-based Organization
```python
# //src/main/server/BUILD.bazel
cc_library(
    name = "server_lib",
    srcs = ["server.cc"],
    visibility = ["//src/main:__subpackages__"],
)

# //src/main/client/BUILD.bazel
cc_library(
    name = "client_lib",
    srcs = ["client.cc"],
    deps = ["//src/main/server:server_lib"],
)
```

#### Test Access
```python
# //src/main/server/BUILD.bazel
cc_library(
    name = "server_lib",
    srcs = ["server.cc"],
    testonly = True,  # Only tests can depend on this
    visibility = ["//src/test/server:__pkg__"],
)
```

## Dependencies Between Packages

### Direct Dependencies

```python
cc_binary(
    name = "server",
    srcs = ["server.cc"],
    deps = [
        "//src/main/server/auth:auth_lib",  # Must be visible
        "//src/main/server/db:db_lib",      # Must be visible
    ],
)
```

### Transitive Dependencies

```python
# //src/main/server/auth/BUILD.bazel
cc_library(
    name = "auth_lib",
    srcs = ["auth.cc"],
    deps = ["//src/main/server/db:db_lib"],  # Auth depends on DB
    visibility = ["//src/main/server:__pkg__"],
)

# //src/main/server/BUILD.bazel
cc_binary(
    name = "server",
    srcs = ["server.cc"],
    deps = ["//src/main/server/auth:auth_lib"],  # Server gets DB through Auth
)
```

## Troubleshooting

### Common Issues

1. **Visibility Errors**
   ```bash
   ERROR: Target '//src/main/server:internal_lib' is not visible
   ```
   - Check the target's visibility settings
   - Verify package dependencies are necessary
   - Consider using package groups

2. **Circular Dependencies**
   ```bash
   ERROR: cycle in dependency graph
   ```
   - Identify the dependency cycle
   - Refactor packages to break the cycle
   - Consider creating a common dependency

3. **Missing BUILD Files**
   ```bash
   ERROR: no such package '//src/main/server'
   ```
   - Ensure BUILD file exists
   - Check file permissions
   - Verify package path

## Related Documentation

- [Labels and Targets](labels-and-targets.md)
- [Dependencies and Actions](dependencies-and-actions.md)
- [Official Bazel Packages Documentation](https://bazel.build/concepts/packages)
- [Official Bazel Visibility Documentation](https://bazel.build/concepts/visibility)

## Next Steps

- Explore [Dependencies and Actions](dependencies-and-actions.md) to understand how packages interact
- Learn about [Build Files](../getting-started/build-files.md) to create effective package structures
- Study [Module Dependencies](../getting-started/module-dependencies.md) for managing external packages
- Read about [Core Concepts](core-concepts.md) to see how packages fit into the bigger picture