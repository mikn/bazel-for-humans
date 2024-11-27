# Bazel Build Execution: Phases, Starlark, and Analysis

## Overview of Build Phases

Bazel executes builds in three distinct phases:
1. Loading Phase
2. Analysis Phase
3. Execution Phase

Each phase has specific responsibilities and constraints, and understanding them is crucial for effective Bazel usage.

## Loading Phase

### What Happens
1. Reads and evaluates `WORKSPACE`/`MODULE.bazel`
2. Loads and evaluates BUILD files
3. Evaluates Starlark code for rule definitions
4. Constructs the package graph

### Starlark Evaluation
```python
# This is evaluated during loading
load("@rules_go//go:def.bzl", "go_binary")

# Variables are computed during loading
SRCS = glob(["*.go"])  # glob() is a loading-phase function

# Rule instantiation happens during loading
go_binary(
    name = "server",
    srcs = SRCS,  # Values must be fully resolved
)
```

### Key Characteristics
- All Starlark functions marked `build_setting` run
- All macros are expanded
- All `load()` statements are processed
- File system operations (like `glob()`) execute
- Repository rules execute

### Inspecting Loading Phase
```bash
# See what files are being loaded
bazel build //my:target --show_loading_progress

# Query loaded packages
bazel query --output=package //my/package/...

# See load time per file
bazel build //... --profile=profile.log
# Then analyze with bazel analyze-profile
```

## Analysis Phase

### What Happens
1. Rule implementation functions execute
2. Providers are constructed and propagated
3. Action graph is built
4. Configuration transitions are applied

### Starlark Context
```python
def _impl(ctx):
    # This code runs during analysis
    output = ctx.actions.declare_file(ctx.label.name + ".out")
    
    # Action registration happens during analysis
    ctx.actions.run(
        outputs = [output],
        inputs = ctx.files.srcs,
        executable = ctx.executable.tool,
        arguments = ["-o", output.path],
    )
    
    return [DefaultInfo(files = depset([output]))]

# Rule definition happens during loading
my_rule = rule(
    implementation = _impl,  # Implementation runs during analysis
    attrs = {
        "srcs": attr.label_list(allow_files = True),
        "tool": attr.label(executable = True, cfg = "host"),
    },
)
```

### Key Characteristics
- Rule implementations execute
- Actions are registered but not run
- Configuration and platforms are resolved
- Target graph is constructed
- Providers are propagated

### Inspecting Analysis Phase
```bash
# See what actions would be executed
bazel aquery //my:target

# See detailed action graph
bazel aquery --output=text //my:target

# See provider information
bazel cquery //my:target --output=starlark

# Analyze dependencies
bazel cquery 'deps(//my:target)'
```

## Execution Phase

### What Happens
1. Action graph is traversed
2. Actions are executed in dependency order
3. Outputs are produced
4. Cache is consulted/updated

### Key Characteristics
- Actions actually run
- File system changes occur
- Remote execution happens
- Cache interactions occur
- Test execution occurs

### Inspecting Execution Phase
```bash
# See what's happening during build
bazel build //my:target --explain=log.txt --verbose_explanations

# See execution timing
bazel build //my:target --profile=profile.log

# See detailed execution info
bazel build //... --profile=prof.log --record_full_profiler_data
```

## Query Tools Deep Dive

### Basic Query (`query`)
- Operates on pre-analysis graph
- Shows target dependencies
- Fast but limited information

```bash
# Show all dependencies
bazel query "deps(//my:target)"

# Find reverse dependencies
bazel query "rdeps(//..., //my:lib)"

# Find path between targets
bazel query "somepath(//my:binary, //other:lib)"
```

### Configuration Query (`cquery`)
- Operates on post-analysis graph
- Shows configuration-specific information
- Includes provider data

```bash
# Show configured dependencies
bazel cquery "deps(//my:target)" --output=starlark

# Show transitions
bazel cquery "//my:target" --transitions=full

# Show provider information
bazel cquery "//my:target" --output=starlark
```

### Action Query (`aquery`)
- Shows action graph
- Includes command lines
- Shows input/output artifacts

```bash
# Show all actions
bazel aquery //my:target

# Show detailed action information
bazel aquery --output=text //my:target

# Show action inputs/outputs
bazel aquery --output=jsonproto //my:target
```

## Common Patterns and Gotchas

### 1. Loading vs Analysis Phase Confusion
```python
# Bad: Trying to access analysis-time info during loading
def my_macro():
    # This fails - ctx only exists during analysis
    if ctx.target_platform_has_constraint(foo):
        ...

# Good: Configuration-dependent logic in rule impl
def _impl(ctx):
    if ctx.target_platform_has_constraint(foo):
        ...
```

### 2. Action Registration Timing
```python
# Bad: Trying to run actions during analysis
def _impl(ctx):
    # This fails - can't execute during analysis
    result = ctx.execute(["tool", "arg"])

# Good: Register action for execution
def _impl(ctx):
    ctx.actions.run(
        executable = "tool",
        arguments = ["arg"],
    )
```

### 3. Provider Access
```python
# Bad: Accessing providers during loading
def my_macro(deps):
    # This fails - providers only exist during analysis
    for dep in deps:
        dep[GoInfo]

# Good: Access providers in rule implementation
def _impl(ctx):
    for dep in ctx.attr.deps:
        go_info = dep[GoInfo]
```

## Performance Optimization

### 1. Loading Phase
- Minimize glob() usage
- Avoid complex computations in macros
- Use `.bazelignore` for unused directories

### 2. Analysis Phase
- Minimize rule count
- Avoid unnecessary providers
- Use configuration trimming

### 3. Execution Phase
- Enable remote caching
- Use proper test size markers
- Optimize action inputs

## Best Practices

1. **Phase Awareness**
   - Understand which phase your code runs in
   - Use appropriate functions for each phase
   - Don't mix phase-specific operations

2. **Performance Monitoring**
   - Use `--profile` regularly
   - Monitor loading/analysis overhead
   - Track action counts

3. **Debugging**
   - Use appropriate query tool for phase
   - Understand error messages context
   - Track phase-specific issues

4. **Testing**
   - Test rules in all phases
   - Verify provider propagation
   - Check action registration