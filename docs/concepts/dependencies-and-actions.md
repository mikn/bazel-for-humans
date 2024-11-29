# Dependencies and Actions

This guide explains how Bazel handles dependencies between targets and turns them into concrete build steps (actions). Think of dependencies as a recipe's ingredients list, and actions as the cooking instructions.

## Understanding Dependencies

### Types of Dependencies

Bazel has several types of dependencies:

1. **Build Dependencies (`deps`)**
   - Code needed at compile time
   - Libraries your code links against
   - Headers and source files needed to build

```python
cc_library(
    name = "hello_lib",
    srcs = ["hello.cc"],
    hdrs = ["hello.h"],
    deps = [
        "//common:base",          # Another library we need
        "@boost//:filesystem",    # External dependency
    ],
)
```

2. **Runtime Dependencies (`data`)**
   - Files needed when the program runs
   - Configuration files
   - Resource files

```python
cc_binary(
    name = "server",
    srcs = ["server.cc"],
    deps = [":server_lib"],
    data = [
        "//config:settings.json",  # Config file
        "//resources:images",      # Resource directory
    ],
)
```

3. **Tool Dependencies**
   - Programs needed during the build
   - Code generators
   - Compilers and toolchains

```python
genrule(
    name = "generate_code",
    srcs = ["input.proto"],
    outs = ["generated.pb.cc"],
    tools = ["//tools:protoc"],    # Tool needed for generation
    cmd = "$(location //tools:protoc) $(SRCS) > $(OUTS)",
)
```

### Dependency Graph

Bazel builds a graph of all dependencies:
```python
# This dependency graph:
//main:binary
  |-- //lib:helper_lib
  |   |-- //lib:utils
  |   |-- @boost//:filesystem
  |-- //tools:code_gen
      |-- //tools:compiler
```

## Understanding Actions

### What are Actions?

Actions are the specific steps Bazel takes to build your targets. Each action:
- Has defined inputs and outputs
- Runs a specific command
- Is hermetic (reproducible)
- Can be cached

### Action Examples

1. **Compilation Action**
```python
# This cc_library creates actions to:
cc_library(
    name = "lib",
    srcs = ["lib.cc"],
    hdrs = ["lib.h"],
)
# 1. Compile lib.cc to lib.o
# 2. Create lib.a archive
```

2. **Linking Action**
```python
# This cc_binary creates actions to:
cc_binary(
    name = "app",
    srcs = ["main.cc"],
    deps = [":lib"],
)
# 1. Compile main.cc to main.o
# 2. Link main.o with lib.a to create app
```

3. **Code Generation Action**
```python
# This genrule creates an action to:
genrule(
    name = "generate",
    srcs = ["input.txt"],
    outs = ["output.txt"],
    cmd = "cat $(SRCS) | tr '[:lower:]' '[:upper:]' > $(OUTS)",
)
# Run the specified command to transform input.txt to output.txt
```

## How Dependencies and Actions Work Together

### Build Process

1. **Loading Phase**
   - Reads BUILD files
   - Builds target graph
   - Validates dependencies

2. **Analysis Phase**
   - Creates action graph
   - Determines required actions
   - Validates action inputs/outputs

3. **Execution Phase**
   - Runs necessary actions
   - Caches results
   - Produces outputs

### Example Build Flow

```python
# Given these targets:
cc_library(
    name = "utils",
    srcs = ["utils.cc"],
    hdrs = ["utils.h"],
)

cc_binary(
    name = "app",
    srcs = ["app.cc"],
    deps = [":utils"],
)

# Bazel will:
1. Load the BUILD file
2. Create target graph: app -> utils
3. Create actions:
   - Compile utils.cc -> utils.o
   - Create utils.a
   - Compile app.cc -> app.o
   - Link app.o + utils.a -> app
4. Execute actions in order
```

## Best Practices

### Dependency Management

1. **Keep Dependencies Minimal**
   ```python
   # Good: Direct dependency
   cc_binary(
       name = "app",
       deps = [":needed_lib"],  # We directly use this
   )

   # Bad: Unnecessary dependency
   cc_binary(
       name = "app",
       deps = [
           ":needed_lib",
           ":unused_lib",  # We don't use this
       ],
   )
   ```

2. **Use Fine-grained Targets**
   ```python
   # Good: Separate libraries
   cc_library(name = "auth")
   cc_library(name = "db")
   cc_library(
       name = "server",
       deps = [":auth", ":db"],
   )

   # Bad: Monolithic library
   cc_library(
       name = "everything",
       srcs = glob(["*.cc"]),
   )
   ```

3. **Proper Dependency Types**
   ```python
   cc_binary(
       name = "app",
       deps = [":lib"],         # Build dependency
       data = ["config.json"],  # Runtime dependency
   )
   ```

### Action Efficiency

1. **Minimize Action Inputs**
   ```python
   # Good: Specific inputs
   genrule(
       name = "gen",
       srcs = ["needed.txt"],
       outs = ["out.txt"],
   )

   # Bad: Too many inputs
   genrule(
       name = "gen",
       srcs = glob(["*.txt"]),  # Unnecessary files trigger rebuilds
       outs = ["out.txt"],
   )
   ```

2. **Use Appropriate Tools**
   ```python
   # Good: Use built-in rules when possible
   cc_binary(
       name = "app",
       srcs = ["app.cc"],
   )

   # Avoid: Custom genrule for standard operations
   genrule(
       name = "app",
       srcs = ["app.cc"],
       outs = ["app"],
       cmd = "gcc $(SRCS) -o $(OUTS)",
   )
   ```

## Troubleshooting

### Common Issues

1. **Missing Dependencies**
   ```bash
   ERROR: 'boost/filesystem.hpp' file not found
   ```
   - Check if dependency is in `deps`
   - Verify dependency's `visibility`
   - Check if headers are in `hdrs`

2. **Action Failures**
   ```bash
   ERROR: action 'Compiling lib.cc' failed
   ```
   - Check action inputs exist
   - Verify command is correct
   - Look for missing tools

3. **Circular Dependencies**
   ```bash
   ERROR: cycle in dependency graph
   ```
   - Identify the cycle
   - Refactor dependencies
   - Consider creating a common dependency

## Related Documentation

- [Labels and Targets](labels-and-targets.md)
- [Build vs Runtime](build-vs-runtime.md)
- [Official Bazel Dependencies Documentation](https://bazel.build/concepts/dependencies)
- [Official Bazel Actions Documentation](https://bazel.build/rules/concepts#actions)

## Next Steps

- Learn about [Hermetic Environment](hermetic-environment.md) to understand how Bazel ensures reproducible actions
- Explore [Remote Execution](remote-execution.md) to see how actions can be distributed
- Study [Rules and Evaluation](rules-and-evaluation.md) to create custom rules and actions
