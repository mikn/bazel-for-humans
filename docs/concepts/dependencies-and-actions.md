# Dependencies and Actions in Modern Bazel

This guide explains how Bazel manages dependencies and executes actions in your build system.

## Understanding Dependencies

Dependencies in Bazel come in several forms, each serving a specific purpose in your build system.

### Types of Dependencies

#### 1. Module Dependencies
Module dependencies are declared in your `MODULE.bazel` file and represent high-level dependencies on other Bazel modules.

```python
module(
    name = "my_app",
    version = "1.0",
)

bazel_dep(name = "rules_python", version = "0.24.0")
bazel_dep(name = "rules_go", version = "0.41.0")

# Development dependencies are only used during development
dev_dependency(name = "buildifier", version = "6.3.3")
```

::: tip
Always use explicit versions for dependencies to ensure reproducible builds. The Bazel Central Registry provides a curated list of trusted dependencies.
:::

#### 2. Target Dependencies
Target dependencies are specified in your `BUILD.bazel` files and define relationships between build targets.

```python
cc_binary(
    name = "app",
    srcs = ["main.cc"],
    deps = [
        ":lib",                    # Local dependency in same package
        "//common:utils",          # Cross-package dependency
        "@boost//:filesystem",     # External dependency from module
    ],
)
```

::: warning
Avoid creating deep dependency chains. Flat dependency structures are easier to maintain and debug.
:::

#### 3. Runtime Dependencies
Runtime dependencies (data dependencies) are files or resources needed during program execution.

```python
py_binary(
    name = "server",
    srcs = ["server.py"],
    deps = [":lib"],              # Build-time dependency
    data = [
        "config.json",            # Runtime configuration
        "//resources:assets",     # Runtime resources
        "@some_module//:runtime", # External runtime dependency
    ],
)
```

## Action System

The action system is how Bazel turns your build rules into concrete build steps.

### 1. Action Definition
Actions define how inputs are transformed into outputs.

```python
def _custom_compile_impl(ctx):
    output = ctx.actions.declare_file(ctx.label.name + ".out")
    
    # Define the action that will create the output
    ctx.actions.run(
        outputs = [output],
        inputs = ctx.files.srcs,
        executable = ctx.executable.compiler,
        arguments = [
            "--output=" + output.path,
            "--optimization=" + ctx.attr.opt_level,
        ] + [f.path for f in ctx.files.srcs],
        env = {
            "LANG": "en_US.UTF-8",
            "PATH": "/bin:/usr/bin",
        },
        mnemonic = "CustomCompile",
        progress_message = "Compiling %{label} with optimization level %{opt_level}",
    )
    
    return [DefaultInfo(files = depset([output]))]
```

### 2. Action Execution
Bazel executes actions in parallel when possible, respecting the dependency graph.

```python
# These libraries can be built in parallel
cc_library(
    name = "lib1",
    srcs = ["a.cc", "b.cc"],
)

cc_library(
    name = "lib2",
    srcs = ["x.cc", "y.cc"],
)

# This target depends on both libraries and will wait for them
cc_binary(
    name = "app",
    srcs = ["main.cc"],
    deps = [
        ":lib1",
        ":lib2",
    ],
)
```

### 3. Action Caching
Bazel's caching system ensures that actions are only re-run when necessary.

```python
# Action cache key includes:
# - Input file contents (cryptographic hashes)
# - Command line arguments
# - Environment variables
# - System properties
# - Toolchain configuration

py_library(
    name = "lib",
    srcs = ["lib.py"],
    deps = ["//common:base"],
)
```

::: tip
To maximize cache hits:
- Use hermetic toolchains
- Avoid timestamps in outputs
- Minimize environment dependencies
:::

## Dependency Management

### 1. Direct vs Transitive Dependencies

```python
cc_library(
    name = "app",
    srcs = ["app.cc"],
    deps = [":lib"],          # Direct dependency
    tags = ["requires-lib"],  # Metadata for dependency
)

cc_library(
    name = "lib",
    srcs = ["lib.cc"],
    deps = [":core"],         # Transitive to "app"
    tags = ["requires-core"], # Metadata for dependency
)

cc_library(
    name = "core",
    srcs = ["core.cc"],
)
```

### 2. Version Resolution
Modern Bazel uses Bzlmod for version resolution:

```python
# MODULE.bazel
module(
    name = "my_app",
    version = "1.0",
)

bazel_dep(name = "rules_python", version = "0.24.0")

# Override a transitive dependency version
single_version_override(
    module_name = "rules_java",
    version = "5.5.0",
    patches = ["@//patches:rules_java.patch"],
)

# Multiple versions allowed in specific cases
multiple_version_override(
    module_name = "protobuf",
    versions = ["3.19.0", "4.23.0"],
)
```

### 3. Dependency Visibility
Control access to your targets:

```python
# Internal implementation details
cc_library(
    name = "internal",
    srcs = ["internal.cc"],
    visibility = ["//visibility:private"],
)

# Package-private implementation
cc_library(
    name = "package_private",
    srcs = ["pkg_private.cc"],
    visibility = [":__pkg__"],
)

# Public API
cc_library(
    name = "public_api",
    srcs = ["public.cc"],
    deps = [":internal"],
    visibility = ["//visibility:public"],
)
```

## Action Graph

### 1. Graph Structure
Actions form a directed acyclic graph (DAG):

```python
# Proto generation action
genrule(
    name = "proto_gen",
    srcs = ["schema.proto"],
    outs = ["schema.pb.go"],
    cmd = "$(location @com_google_protobuf//:protoc) " +
          "$(SRCS) --go_out=$(OUTS)",
    tools = ["@com_google_protobuf//:protoc"],
)

# Depends on generated proto
go_library(
    name = "lib",
    srcs = [
        "lib.go",
        ":proto_gen",
    ],
    importpath = "example.com/myapp/lib",
)

# Final binary depends on library
go_binary(
    name = "app",
    srcs = ["main.go"],
    deps = [":lib"],
)
```

### 2. Parallel Execution
Bazel automatically parallelizes independent actions:

```python
cc_binary(
    name = "app",
    srcs = ["main.cc"],
    deps = [
        ":lib1",  # Built independently
        ":lib2",  # Built independently
        ":lib3",  # Built independently
    ],
)
```

### 3. Incremental Builds
Bazel's incremental build system minimizes unnecessary work:

```python
cc_library(
    name = "lib",
    srcs = ["lib.cc"],     # Change triggers recompile
    hdrs = ["lib.h"],      # Change triggers rebuild of dependents
    deps = [":base"],      # Change in base's interface triggers rebuild
)
```

## Best Practices

1. **Dependency Organization**
   - Keep dependencies close to where they're used
   - Use fine-grained targets to minimize rebuild scope
   - Prefer direct dependencies over transitive ones

2. **Version Management**
   - Use explicit versions in `MODULE.bazel`
   - Document version constraints and compatibility
   - Regularly update dependencies for security fixes

3. **Action Optimization**
   - Minimize action inputs to improve caching
   - Use appropriate granularity for targets
   - Leverage platform-specific configurations

4. **Cache Efficiency**
   - Use hermetic toolchains
   - Avoid timestamps and non-deterministic outputs
   - Keep build environments consistent

## Key Takeaways

1. **Dependency Management**
   - Use explicit dependencies
   - Minimize dependency scope
   - Version pin for stability

2. **Action System**
   - Actions are hermetic
   - Parallel execution when possible
   - Caching based on inputs

3. **Best Practices**
   - Group related dependencies
   - Optimize action inputs
   - Use version management

## Next Steps

- Learn about [Build vs Runtime](/concepts/build-vs-runtime)
- Understand [Remote Execution](/concepts/remote-execution)
- Explore [Rules and Evaluation](/concepts/rules-and-evaluation)
