# Bazel Actions: From Dependencies to Execution

## Core Concepts

### Actions
- Smallest unit of work in Bazel
- Deterministic transformation from inputs to outputs
- Must declare all inputs and outputs explicitly
- No network access or undeclared dependencies allowed

```python
# Example action registration
def _impl(ctx):
    output = ctx.actions.declare_file(ctx.label.name + ".cc")
    ctx.actions.run(
        outputs = [output],           # Must declare all outputs
        inputs = ctx.files.srcs,      # Must declare all inputs
        executable = ctx.executable.compiler,
        arguments = ["-o", output.path] + [f.path for f in ctx.files.srcs],
        mnemonic = "Compile",         # For build logging
        progress_message = "Compiling {}".format(ctx.label),
    )
```

## Graph Types

### 1. Dependency Graph (Loading Phase)
- Represents target dependencies
- Created during loading phase
- Static, based on BUILD files
- Does not include configuration

```python
# Dependencies declared in BUILD files
cc_binary(
    name = "app",
    deps = [":lib"],    # Creates edge in dependency graph
)

cc_library(
    name = "lib",
    deps = [":base"],   # Another edge
)
```

### 2. Target Graph (Analysis Phase)
- Configured version of dependency graph
- Includes platform-specific information
- Created during analysis phase
- Nodes are configured targets

```python
# Configuration affects target graph
cc_binary(
    name = "app",
    deps = select({
        "//config:linux": [":lib_linux"],
        "//config:mac": [":lib_mac"],
    }),
)
```

### 3. Action Graph (Analysis Phase Output)
- Concrete build steps
- Generated from target graph
- Directed acyclic graph (DAG)
- Each node is a specific action

```python
# This rule generates multiple actions
def _impl(ctx):
    # Preprocessing action
    preprocessed = ctx.actions.declare_file(ctx.label.name + ".i")
    ctx.actions.run(
        outputs = [preprocessed],
        inputs = ctx.files.srcs,
        executable = ctx.executable.preprocessor,
        arguments = ["-o", preprocessed.path] + [f.path for f in ctx.files.srcs],
    )
    
    # Compilation action
    object_file = ctx.actions.declare_file(ctx.label.name + ".o")
    ctx.actions.run(
        outputs = [object_file],
        inputs = [preprocessed],  # Output of previous action
        executable = ctx.executable.compiler,
        arguments = ["-c", preprocessed.path, "-o", object_file.path],
    )
```

## Graph Relationships

### From Dependencies to Actions
1. **Dependency Graph** (What depends on what)
   ```python
   # BUILD.bazel
   cc_binary(
       name = "app",
       srcs = ["main.cc"],
       deps = [":lib"],
   )
   ```

2. **Target Graph** (With configuration)
   ```python
   # Internal representation
   //my:app[linux-x86_64]
       → //my:lib[linux-x86_64]
           → //my:base[linux-x86_64]
   ```

3. **Action Graph** (Concrete steps)
   ```python
   # Generated actions
   Compile(main.cc) → Object(main.o)
       → Compile(lib.cc) → Object(lib.o)
           → Link(app)
   ```

## Action Types

### 1. File Generation
```python
# Generate a header file
ctx.actions.write(
    output = ctx.actions.declare_file("config.h"),
    content = "#define VERSION \"1.0.0\"\n",
)
```

### 2. Command Execution
```python
# Run a compiler
ctx.actions.run(
    executable = ctx.executable.compiler,
    arguments = ["-c", input.path, "-o", output.path],
    inputs = [input],
    outputs = [output],
)
```

### 3. Shell Commands
```python
# Use shell features (less preferred)
ctx.actions.run_shell(
    command = "cat $1 > $2",
    arguments = [input.path, output.path],
    inputs = [input],
    outputs = [output],
)
```

## Action Requirements

### 1. Hermeticity
```python
# Good: All inputs explicitly declared
ctx.actions.run(
    inputs = ctx.files.srcs + ctx.files.deps,  # All inputs listed
    ...
)

# Bad: Missing input declaration
ctx.actions.run_shell(
    command = "gcc -o $@ $<",  # Implicit dependency on gcc
    ...
)
```

### 2. Determinism
```python
# Good: Deterministic output location
output = ctx.actions.declare_file(ctx.label.name + ".o")

# Bad: Non-deterministic output
ctx.actions.run_shell(
    command = "date > ${@}",  # Output depends on execution time
    ...
)
```

### 3. Isolation
```python
# Good: No network access
ctx.actions.run(
    executable = ctx.executable.tool,
    inputs = [ctx.file.data],  # Data comes from declared input
    ...
)

# Bad: Network dependency
ctx.actions.run_shell(
    command = "curl https://example.com/data > ${@}",  # Network dependency
    ...
)
```

## Inspecting Actions

### Using aquery
```bash
# Show all actions for a target
bazel aquery //my:target

# Show detailed action information
bazel aquery --output=text //my:target

# Show inputs and outputs
bazel aquery --output=jsonproto //my:target
```

### Action Graph Visualization
```bash
# Generate GraphViz dot file
bazel aquery --output=graph //my:target > graph.dot

# Convert to visual format
dot -Tpng graph.dot > graph.png
```

## Performance Considerations

### 1. Action Granularity
```python
# Better: Single action for related work
ctx.actions.run(
    executable = "compiler",
    arguments = ["-c", "-O2"] + [f.path for f in srcs],
    outputs = [compiled],
)

# Worse: Multiple actions for each file
for src in srcs:
    ctx.actions.run(...)  # Creates many small actions
```

### 2. Input Specification
```python
# Better: Precise input specification
ctx.actions.run(
    inputs = ctx.files.srcs,  # Only needed files
    ...
)

# Worse: Over-broad inputs
ctx.actions.run(
    inputs = ctx.files._all_files,  # Too many unnecessary inputs
    ...
)
```

### 3. Output Usage
```python
# Better: Direct output usage
out = ctx.actions.declare_file(...)
ctx.actions.run(outputs = [out])

# Worse: Directory output
outdir = ctx.actions.declare_directory(...)  # Can be less efficient
```

## Best Practices

1. **Action Definition**
   - Declare all inputs and outputs
   - Use precise input sets
   - Prefer run() over run_shell()

2. **Graph Optimization**
   - Minimize action count
   - Keep actions focused
   - Use appropriate granularity

3. **Performance**
   - Monitor action counts
   - Profile action execution
   - Optimize critical paths

4. **Debugging**
   - Use aquery for inspection
   - Verify action hermeticity
   - Check determinism