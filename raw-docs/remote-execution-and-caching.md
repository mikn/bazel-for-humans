# Bazel Remote Execution and Caching

## Core Concepts

### What Makes Remote Execution Possible
- Actions are hermetic (fully defined inputs/outputs)
- Deterministic execution
- Content-addressable storage
- Action graph can be distributed
- Standardized remote execution protocol

### Key Components
```python
# Each action is fully specified
def _impl(ctx):
    ctx.actions.run(
        outputs = [ctx.outputs.out],      # All outputs declared
        inputs = ctx.files.srcs,          # All inputs declared
        executable = ctx.executable.tool,  # Tool is an input
        arguments = ["--out", ctx.outputs.out.path],
    )
```

## Remote Execution Architecture

### 1. Action Digests
- Inputs are hashed for identification
- Command specification is hashed
- Combined digest uniquely identifies action
```bash
# Example action digest components
Input files: sha256(file1) + sha256(file2) + ...
Command: sha256(command + args + env)
Action: sha256(inputs_digest + command_digest)
```

### 2. Content-Addressable Storage (CAS)
```python
# Files are stored and retrieved by content hash
cas_key = sha256(file_content)
# Same content = same key, regardless of path
```

### 3. Action Cache
```python
# Cache key format
cache_key = {
    "action_digest": action_sha256,
    "command_digest": command_sha256,
    "input_digest": inputs_sha256,
    "platform": platform_properties,
}
```

## Configuration

### 1. Basic Remote Cache
```bash
# .bazelrc
build --remote_cache=grpc://cache.example.com:9092
```

### 2. Remote Execution
```bash
# .bazelrc
build --remote_executor=grpc://executor.example.com:9093
build --remote_cache=grpc://cache.example.com:9092
```

### 3. Authentication
```bash
# .bazelrc
build --google_default_credentials  # GCP
# or
build --remote_header=Authorization="Bearer ${TOKEN}"
```

## Efficiency Features

### 1. Input Deduplication
```python
# Multiple targets using same input
cc_library(
    name = "lib1",
    srcs = ["common.h"],  # Uploaded once, reused
)

cc_library(
    name = "lib2",
    srcs = ["common.h"],  # Reuses cached content
)
```

### 2. Action Result Caching
```bash
# Cache hits are instantaneous
$ bazel build //my:target
INFO: Build completed successfully, 1 action executed
$ bazel clean
$ bazel build //my:target
INFO: Build completed successfully, 0 actions executed  # Cache hit
```

### 3. Incremental Upload/Download
```python
# Only changed files are transferred
def _impl(ctx):
    ctx.actions.run(
        outputs = [ctx.outputs.out],
        inputs = ctx.files.srcs,  # Only changed inputs uploaded
        executable = ctx.executable.tool,
    )
```

## Best Practices

### 1. Action Hermeticity
```python
# Good: All inputs explicitly declared
cc_binary(
    name = "app",
    srcs = ["main.cc"],
    deps = [":lib"],           # Explicit dependency
    data = ["//data:config"],  # Explicit data files
)

# Bad: Hidden dependencies
genrule(
    name = "generate",
    outs = ["out.txt"],
    cmd = "cat $$(which some_tool) > $@",  # Hidden dependency!
)
```

### 2. Platform Specification
```python
# Define execution platform requirements
platform(
    name = "my_platform",
    constraint_values = [
        "@platforms//os:linux",
        "@platforms//cpu:x86_64",
    ],
)

# Use platform in build
build --platforms=//platforms:my_platform
```

### 3. Cache Management
```bash
# Optimize cache usage
build --experimental_remote_cache_compression  # Compress transfers
build --remote_download_minimal               # Download only needed files
build --remote_upload_local_results           # Share local results
```

## Performance Optimization

### 1. Action Granularity
```python
# Good: Appropriate granularity
cc_library(
    name = "lib",
    srcs = glob(["*.cc"]),  # One action per file
)

# Bad: Too fine-grained
[cc_library(
    name = "lib_" + f[:-3],
    srcs = [f],
) for f in glob(["*.cc"])]  # Too many small actions
```

### 2. Input Size Management
```python
# Good: Precise input specification
cc_binary(
    name = "app",
    srcs = ["main.cc"],
    deps = [":lib"],  # Only needed dependencies
)

# Bad: Over-broad inputs
cc_binary(
    name = "app",
    srcs = glob(["**/*.cc"]),  # Too many unnecessary files
)
```

### 3. Caching Strategy
```python
# Optimize for cache hits
build --incompatible_strict_action_env  # Predictable environment
build --workspace_status_command=./status.sh  # Controlled volatility
```

## Debugging Remote Execution

### 1. Execution Log
```bash
# See remote execution details
bazel build //my:target --remote_execution_log=/tmp/rx.log
```

### 2. Cache Stats
```bash
# View cache performance
bazel build //my:target --remote_cache_stats
```

### 3. Action Inspection
```bash
# Examine specific action
bazel aquery //my:target --output=text
```

## Key Takeaways

1. **Efficiency Through Design**
   - Content-addressable storage
   - Automatic deduplication
   - Incremental transfers
   - Parallel execution

2. **Requirements for Success**
   - Hermetic actions
   - Deterministic outputs
   - Explicit dependencies
   - Platform compatibility

3. **Performance Benefits**
   - Distributed execution
   - Shared caching
   - Reduced network usage
   - Faster builds

4. **Operational Considerations**
   - Cache management
   - Network configuration
   - Authentication
   - Platform specification