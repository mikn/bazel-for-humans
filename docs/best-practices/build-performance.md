# Build Performance

This guide covers best practices and techniques for optimizing Bazel build performance.

## Key Principles

1. **Minimize Build Graph Size**
   - Use fine-grained targets
   - Avoid unnecessary dependencies
   - Leverage build caching

2. **Optimize Dependencies**
   - Use precise dependencies
   - Avoid circular dependencies
   - Minimize external dependencies

3. **Leverage Remote Execution**
   - Set up remote caching
   - Configure remote execution
   - Optimize network usage

## Common Optimizations

### 1. Target Granularity

Create smaller, focused targets:

```python
# Good: Separate targets for library and tests
py_library(
    name = "core",
    srcs = ["core.py"],
)

py_test(
    name = "core_test",
    srcs = ["core_test.py"],
    deps = [":core"],
)

# Bad: One large target with everything
py_library(
    name = "all",
    srcs = glob(["*.py"]),
)
```

### 2. Dependency Management

Use precise dependencies:

```python
# Good: Explicit dependencies
py_library(
    name = "app",
    srcs = ["app.py"],
    deps = [
        ":config",  # Only what's needed
        ":utils",
    ],
)

# Bad: Over-broad dependencies
py_library(
    name = "app",
    srcs = ["app.py"],
    deps = ["//..."],  # Everything in the project
)
```

### 3. Build Caching

Optimize for caching:

```python
# Good: Deterministic outputs
genrule(
    name = "generate",
    srcs = ["input.txt"],
    outs = ["output.txt"],
    cmd = "cat $(location input.txt) > $(location output.txt)",
)

# Bad: Non-deterministic outputs
genrule(
    name = "generate",
    outs = ["output.txt"],
    cmd = "date > $(location output.txt)",  # Changes every time
)
```

## Configuration Best Practices

### 1. Bazelrc Settings

```bash
# .bazelrc
build --spawn_strategy=remote
build --remote_cache=grpc://cache.example.com
build --jobs=AUTO
```

### 2. Resource Settings

```bash
# .bazelrc
build --local_ram_resources=HOST_RAM*.8
build --local_cpu_resources=HOST_CPUS-2
```

### 3. Caching Settings

```bash
# .bazelrc
build --disk_cache=/path/to/cache
build --repository_cache=/path/to/repo/cache
```

## Common Issues

### 1. Memory Usage

If you're experiencing high memory usage:

```bash
# .bazelrc
build --memory_fraction=0.7
build --experimental_guard_against_concurrent_changes
```

### 2. Network Bottlenecks

For slow remote execution:

```bash
# .bazelrc
build --remote_timeout=3600
build --experimental_remote_download_outputs=minimal
```

### 3. Cache Misses

To debug cache misses:

```bash
# .bazelrc
build --verbose_explanations
build --explain=/path/to/log
```

## Monitoring and Profiling

### 1. Build Analysis

Use build event protocol:

```bash
# .bazelrc
build --build_event_json_file=/path/to/log.json
```

### 2. Performance Profiling

Enable profiling:

```bash
# .bazelrc
build --generate_json_trace_profile
build --profile=/path/to/profile.json
```

## Next Steps

1. Learn about [Remote Execution](/concepts/remote-execution)
2. Explore [Multi-language Projects](/examples/multi-language)
3. Practice with [External Dependencies](/examples/external-dependencies)
