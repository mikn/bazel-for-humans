# Build vs Runtime

This guide explains the important distinction between build-time and runtime in Bazel. Understanding this difference is crucial for correctly structuring your build and avoiding common pitfalls.

## Key Concepts

### Build Time vs Runtime

1. **Build Time**
   - When Bazel executes your build rules
   - When source files are compiled
   - When dependencies are linked
   - When resources are processed

2. **Runtime**
   - When your compiled program actually runs
   - When configuration files are read
   - When resources are loaded
   - When dynamic libraries are loaded

## Dependencies

### Build Dependencies vs Runtime Dependencies

```python
cc_binary(
    name = "server",
    srcs = ["server.cc"],           # Build-time: needed for compilation
    deps = [":server_lib"],         # Build-time: needed for linking
    data = ["config.json"],         # Runtime: needed when program runs
)
```

### Understanding the Difference

1. **Build Dependencies (`deps`)**
   - Must be available during compilation
   - Are linked into the binary
   - Affect the build graph
   ```python
   cc_library(
       name = "server_lib",
       srcs = ["server_lib.cc"],
       hdrs = ["server_lib.h"],     # Used at build time
       deps = ["@boost//:asio"],    # Linked at build time
   )
   ```

2. **Runtime Dependencies (`data`)**
   - Must be available when program runs
   - Are not linked into the binary
   - Are packaged with the binary
   ```python
   py_binary(
       name = "app",
       srcs = ["app.py"],
       data = [
           "templates/",            # Used at runtime
           "//config:settings.json", # Used at runtime
       ],
   )
   ```

## Build-Time Considerations

### 1. Build Environment

The build environment is controlled by Bazel:
```python
# Build environment settings
build --incompatible_strict_action_env  # Hermetic build environment
build --workspace_status_command="./status.sh"  # Build-time info
```

### 2. Build-Time Variables

```python
# Stamp variables available at build time
genrule(
    name = "version_info",
    outs = ["version.txt"],
    cmd = """
        echo "Build time: $${BUILD_TIMESTAMP}" > $(OUTS)
        echo "Git commit: $${STABLE_GIT_COMMIT}" >> $(OUTS)
    """,
    stamp = 1,  # Enable build stamping
)
```

### 3. Build-Time Configuration

```python
# Config settings affect build time behavior
config_setting(
    name = "opt_build",
    values = {"compilation_mode": "opt"},
)

cc_binary(
    name = "app",
    srcs = ["app.cc"],
    defines = select({
        ":opt_build": ["NDEBUG"],
        "//conditions:default": [],
    }),
)
```

## Runtime Considerations

### 1. Runtime Environment

The runtime environment is where your program executes:
```python
# Runtime data must be explicitly declared
py_binary(
    name = "server",
    srcs = ["server.py"],
    data = [
        "//config:prod.json",     # Production config
        "//config:dev.json",      # Development config
    ],
)
```

### 2. Runtime Configuration

```python
# Runtime configuration through environment variables
sh_binary(
    name = "app",
    srcs = ["app.sh"],
    env = {
        "APP_CONFIG": "$(location :config.json)",
        "APP_MODE": "production",
    },
    data = [":config.json"],
)
```

### 3. Runtime Dependencies

```python
# Dynamic runtime dependencies
java_binary(
    name = "app",
    srcs = ["App.java"],
    resources = [
        "//resources:strings",     # Loaded at runtime
        "//resources:images",      # Loaded at runtime
    ],
    data = [
        "//config:plugins",        # Loaded dynamically
        "@jvm_runtime//:libs",     # Runtime JVM libraries
    ],
)
```

## Common Patterns

### 1. Configuration Files

```python
# Build-time configuration
genrule(
    name = "build_config",
    srcs = ["config.template"],
    outs = ["config.h"],
    cmd = "$(location //tools:config_gen) $(SRCS) > $(OUTS)",
    tools = ["//tools:config_gen"],
)

# Runtime configuration
cc_binary(
    name = "app",
    srcs = ["app.cc"],
    data = ["config.json"],  # Read at runtime
)
```

### 2. Resource Handling

```python
# Build-time resource processing
genrule(
    name = "process_resources",
    srcs = glob(["resources/*.txt"]),
    outs = ["processed_resources.dat"],
    cmd = "$(location //tools:resource_compiler) $(SRCS) > $(OUTS)",
    tools = ["//tools:resource_compiler"],
)

# Runtime resource loading
cc_binary(
    name = "app",
    srcs = ["app.cc"],
    data = [":processed_resources.dat"],
)
```

### 3. Plugin Systems

```python
# Build-time plugin compilation
cc_library(
    name = "plugin_lib",
    srcs = ["plugin.cc"],
    hdrs = ["plugin.h"],
)

# Runtime plugin loading
cc_binary(
    name = "app",
    srcs = ["app.cc"],
    deps = [":plugin_interface"],
    data = [":plugin_lib"],  # Loaded dynamically at runtime
)
```

## Best Practices

1. **Dependency Declaration**
   - Use `deps` for build-time dependencies
   - Use `data` for runtime dependencies
   - Be explicit about what's needed when

2. **Configuration Management**
   - Keep build configuration in BUILD files
   - Keep runtime configuration in data files
   - Use appropriate config for each phase

3. **Resource Handling**
   - Process resources at build time when possible
   - Package runtime resources appropriately
   - Consider resource loading performance

## Common Issues

### 1. Missing Runtime Dependencies
```bash
ERROR: cannot find file 'config.json'
```
- Add file to `data` attribute
- Ensure file is in correct location
- Check runtime path resolution

### 2. Build/Runtime Environment Mismatch
```bash
ERROR: binary requires library 'libxyz.so'
```
- Ensure runtime environment has necessary libraries
- Consider bundling runtime dependencies
- Use appropriate toolchain configuration

### 3. Configuration Timing
```bash
ERROR: undefined symbol 'CONFIG_VALUE'
```
- Move build-time config to BUILD files
- Move runtime config to data files
- Use appropriate configuration mechanism

## Related Documentation

- [Dependencies and Actions](dependencies-and-actions.md)
- [Hermetic Environment](hermetic-environment.md)
- [Official Bazel Dependencies Documentation](https://bazel.build/concepts/dependencies)
- [Official Bazel Runtime Documentation](https://bazel.build/extending/rules#runfiles)

## Next Steps

- Learn about [Hermetic Environment](hermetic-environment.md) to understand how Bazel manages build and runtime environments
- Explore [Remote Execution](remote-execution.md) to see how build and runtime environments are handled in distributed builds
- Study [Dependencies and Actions](dependencies-and-actions.md) to better understand the build process
- Read about [Toolchain Resolution](https://bazel.build/concepts/toolchains) to learn how Bazel manages build tools