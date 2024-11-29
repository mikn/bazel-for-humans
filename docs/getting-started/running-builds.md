# Running Builds with Bazel

This guide explains how to use Bazel's command-line interface effectively.

## Understanding Build Labels

Bazel uses labels to identify targets:
```python
//path/to/package:target    # Explicit target
//path/to/package:all       # All targets in package
//path/to/package/...       # All targets in package and subpackages
:target                     # Target in current package
@repo//package:target      # Target in external repository
```

## Build Phases

Bazel builds go through three phases:

1. **Loading Phase**
   - Reads BUILD files
   - Evaluates build rules
   - Creates target graph

2. **Analysis Phase**
   - Examines dependencies
   - Creates action graph
   - Validates configuration

3. **Execution Phase**
   - Runs required actions
   - Manages parallelism
   - Updates build cache

## Basic Commands

### Building Targets

Build a specific target:
```bash
bazel build //path/to/package:target
```

Build all targets in a package:
```bash
bazel build //path/to/package:all
```

Build multiple targets:
```bash
bazel build //path/to/package:target1 //other/package:target2
```

### Running Programs

Run a binary target:
```bash
bazel run //path/to/package:binary
```

Run with arguments:
```bash
bazel run //path/to/package:binary -- arg1 arg2
```

### Running Tests

Run specific tests:
```bash
bazel test //path/to/package:test
```

Run all tests:
```bash
bazel test //...
```

## Build Options

### Common Options

```bash
# Build with optimization
bazel build -c opt //path/to:target

# Build with debug symbols
bazel build -c dbg //path/to:target

# Build for specific platform
bazel build --platforms=@platforms//os:linux //path/to:target

# Use specific toolchain
bazel build --crosstool_top=@my_toolchain //path/to:target
```

### Build Configuration

```bash
# Set Java version
bazel build --java_language_version=11 //...

# Set C++ standard
bazel build --cxxopt='-std=c++17' //...

# Define preprocessor macro
bazel build --define=VERSION=1.0 //...
```

### Output Control

```bash
# Show detailed progress
bazel build --show_progress //path/to:target

# Show all commands
bazel build -s //path/to:target

# Keep going after errors
bazel build --keep_going //path/to:target

# Show timing information
bazel build --show_timestamps //path/to:target
```

## Build Event Protocol

### Collecting Build Events

```bash
# Output to JSON
bazel build --build_event_json_file=events.json //...

# Output to binary protocol
bazel build --build_event_binary_file=events.pb //...

# Stream to endpoint
bazel build --build_event_text_file=- //... | grep ^SUCCESS
```

### Event Types

Build events include:
- Build progress
- Target completion
- Test results
- Build artifacts
- Configuration
- Timing information

Example event stream:
```bash
# Stream events to BigQuery
bazel build \
  --build_event_json_file=/tmp/build.json \
  --build_event_json_file_path_conversion=true \
  //...
```

## Query and Analysis

### Finding Targets

List all targets in a package:
```bash
bazel query //path/to/package:all
```

Find dependencies:
```bash
bazel query "deps(//path/to:target)"
```

Find reverse dependencies:
```bash
bazel query "rdeps(//..., //path/to:target)"
```

### Advanced Query Functions

Find all tests:
```bash
bazel query 'kind(".*_test", //...)'
```

Find Java libraries:
```bash
bazel query 'kind("java_library", //...)'
```

Find targets affected by a file:
```bash
bazel query "somepath(//..., //path/to:file)"
```

### Query Combinations

```bash
# Find test targets depending on a library
bazel query '
  kind(".*_test", rdeps(//..., //path/to:lib))
'

# Find all dependencies of multiple targets
bazel query '
  deps(
    //path/to:target1 +
    //path/to:target2
  )
'

# Find targets with specific attributes
bazel query '
  attr("testonly", 1, //...)
'
```

### Build Analysis

Show build graph:
```bash
bazel analyze-profile profile.json
```

Explain why something rebuilt:
```bash
bazel build --explain=explain.log //path/to:target
```

Profile build performance:
```bash
bazel build --profile=profile.json //path/to:target
```

## Build Maintenance

### Cleaning

Clean build outputs:
```bash
bazel clean
```

Clean everything including external dependencies:
```bash
bazel clean --expunge
```

### Caching

```bash
# Use specific output base
bazel --output_base=/path/to/base build //...

# Use specific output user root
bazel --output_user_root=/path/to/root build //...

# Configure remote cache
bazel build \
  --remote_cache=grpc://cache.example.com \
  --remote_timeout=3600 \
  //...
```

## Best Practices

1. **Target Selection**
   - Build only what you need
   - Use specific targets over :all
   - Group related targets
   - Use build patterns carefully

2. **Performance**
   - Use --keep_going for large builds
   - Enable remote caching when possible
   - Clean selectively
   - Profile slow builds

3. **Debugging**
   - Use -s for command visibility
   - Check explain.log for rebuild reasons
   - Profile large builds
   - Use build event protocol

4. **Query Usage**
   - Write focused queries
   - Use query combinations
   - Cache query results
   - Consider query performance

## Common Issues

### Build Failures
```bash
ERROR: Build failed
```
- Check build logs
- Use -s for more detail
- Look for missing dependencies
- Check configuration

### Performance Issues
```bash
INFO: Build completed slowly
```
- Use --explain
- Check resource usage
- Consider remote execution
- Profile the build

### Query Issues
```bash
ERROR: Query failed
```
- Check query syntax
- Verify target patterns
- Consider query scope
- Use simpler queries

## Related Documentation

- [BUILD Files](build-files.md)
- [Dependencies](dependencies.md)
- [Testing](testing.md)
- [Official Bazel Command Reference](https://bazel.build/reference/command-line-reference)

## Next Steps

- Learn about [Dependencies](dependencies.md) to manage project dependencies
- Explore [Build Rules](build-rules.md) to define custom build steps
- Study [Testing](testing.md) to write and run tests effectively 