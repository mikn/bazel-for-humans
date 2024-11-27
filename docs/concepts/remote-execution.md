# Remote Execution and Caching in Modern Bazel

Remote execution and caching are powerful features in modern Bazel that enable distributed builds and efficient caching across your team.

## Core Concepts

### What Makes Remote Execution Possible

1. **Hermetic Actions**
   - Fully defined inputs and outputs
   - Deterministic execution
   - No side effects

2. **Content Addressing**
   - Files identified by content hash
   - Location-independent references
   - Automatic deduplication

3. **Action Graph**
   - Dependencies explicitly declared
   - Parallelizable execution
   - Distributed computation

## Remote Execution Architecture

### 1. Action Digests
```python
# Each action is uniquely identified
action_digest = {
    "command_digest": hash(command + args + env),
    "input_root_digest": hash(input_files),
    "output_files": ["out1", "out2"],
    "platform": {
        "properties": [
            {"name": "os", "value": "linux"},
            {"name": "arch", "value": "x86_64"},
        ]
    }
}
```

### 2. Content-Addressable Storage (CAS)
```python
# Files are stored by content hash
file_digest = hash(file_content)
cas.store(file_digest, file_content)

# Retrieve file by digest
content = cas.retrieve(file_digest)
```

### 3. Action Cache
```python
# Cache key components
cache_key = {
    "action_digest": action_sha256,
    "command_digest": command_sha256,
    "input_digest": inputs_sha256,
    "platform": platform_properties,
}

# Cache hit = skip execution
if cache_key in action_cache:
    return action_cache[cache_key]
```

## Setting Up Remote Execution

### 1. Basic Configuration
```python
# .bazelrc
build --remote_executor=grpc://remote.build:8980
build --remote_cache=grpc://cache.build:8980
build --remote_instance_name=projects/my-project
```

### 2. Authentication
```python
# .bazelrc
build --google_credentials=/path/to/service-account.json
build --remote_header=Authorization=Bearer $(cat /path/to/token)
```

### 3. Platform Configuration
```python
# platform/BUILD.bazel
platform(
    name = "linux_x86",
    constraint_values = [
        "@platforms//os:linux",
        "@platforms//cpu:x86_64",
    ],
)

# .bazelrc
build --extra_execution_platforms=//platform:linux_x86
```

## Remote Caching

### 1. Cache Configuration
```python
# .bazelrc
# Enable remote caching
build --remote_cache=grpc://cache.example.com:8980

# Optional: Upload local results
build --remote_upload_local_results=true

# Optional: Accept cached failures
build --remote_accept_cached=true
```

### 2. Cache Keys
```python
# Cache key includes:
- Action digest
- Command line flags
- Environment variables
- System properties
- Input file contents
- Output paths
```

### 3. Cache Management
```python
# Clear remote cache
bazel clean --expunge_async --remote_cache=grpc://cache:8980

# Ignore cache for specific targets
build --noremote_accept_cached //my/package:target
```

## Best Practices

### 1. Hermeticity
```python
# Good: Fully specified inputs
genrule(
    name = "generate",
    srcs = [":input_file"],
    tools = [":generator"],
    outs = ["output.txt"],
    cmd = "$(location :generator) $(SRCS) > $(OUTS)",
)

# Bad: Undeclared inputs
genrule(
    name = "non_hermetic",
    outs = ["output.txt"],
    cmd = "curl https://example.com > $(OUTS)",  # External dependency
)
```

### 2. Platform Specification
```python
# Explicit platform requirements
platform(
    name = "my_platform",
    constraint_values = [
        "@platforms//os:linux",
        "@platforms//cpu:x86_64",
        "//constraints:jdk11",
    ],
)

# Target platform compatibility
java_binary(
    name = "app",
    target_compatible_with = [
        "//constraints:jdk11",
    ],
)
```

### 3. Cache Optimization
```python
# Minimize action inputs
cc_library(
    name = "lib",
    srcs = ["lib.cc"],
    hdrs = ["lib.h"],      # Only public headers
    textual_hdrs = ["internal.h"],  # Implementation headers
)

# Use toolchain dependencies
load("@rules_cc//cc:defs.bzl", "cc_toolchain")
cc_library(
    name = "lib",
    deps = ["@local_config_cc//:cc_toolchain"],
)
```

## Performance Optimization

### 1. Action Graph
```python
# Parallelize independent actions
cc_binary(
    name = "app",
    srcs = ["main.cc"],
    deps = [
        ":lib1",  # Built independently
        ":lib2",  # Built independently
    ],
)
```

### 2. Cache Hits
```python
# Maximize cache reuse
build --experimental_remote_merkle_tree_cache
build --experimental_remote_cache_compression
build --experimental_remote_cache_async
```

### 3. Network Optimization
```python
# Tune network settings
build --remote_timeout=3600
build --experimental_remote_retry_max_attempts=5
build --experimental_remote_retry_initial_delay_millis=100
```

## Monitoring and Debugging

### 1. Basic Monitoring
```bash
# Show cache stats
bazel build --remote_cache=... --show_cache_stats //...

# Debug cache misses
bazel build --remote_cache=... --explain=debug.log //...
```

### 2. Detailed Logging
```python
# .bazelrc
build --verbose_failures
build --experimental_remote_grpc_log=grpc.log
build --experimental_remote_cache_failed_actions
```

### 3. Action Inspection
```bash
# Show action graph
bazel aquery --output=text //my:target

# Show cache keys
bazel aquery --output=proto //my:target
```

## Key Takeaways

1. **Remote Execution Benefits**
   - Distributed build capacity
   - Shared cache across team
   - Consistent build environment

2. **Best Practices**
   - Ensure action hermeticity
   - Specify platforms explicitly
   - Optimize for cache hits

3. **Performance Tips**
   - Parallelize when possible
   - Minimize network transfer
   - Monitor and debug effectively

## Next Steps

- Explore [Build Performance](/best-practices/build-performance)
- Practice with [Multi-language Projects](/examples/multi-language)
- Learn about [External Dependencies](/examples/external-dependencies)
