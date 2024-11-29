# Rules and Evaluation in Modern Bazel

## Understanding Rules

Rules in Bazel define how to transform inputs into outputs. In modern Bazel, rules are more modular and composable thanks to Bzlmod.

### Rule Structure

```python
# Basic rule definition
def _my_rule_impl(ctx):
    # Rule implementation
    output = ctx.actions.declare_file(ctx.label.name + ".out")
    
    ctx.actions.run(
        outputs = [output],
        inputs = ctx.files.srcs,
        executable = ctx.executable.compiler,
        arguments = ["-o", output.path] + [f.path for f in ctx.files.srcs],
    )
    
    return [DefaultInfo(files = depset([output]))]

my_rule = rule(
    implementation = _my_rule_impl,
    attrs = {
        "srcs": attr.label_list(allow_files = True),
        "compiler": attr.label(
            executable = True,
            cfg = "exec",
        ),
    },
)
```

## Rule Evaluation

### 1. Loading Phase
```python
# BUILD.bazel
load("//my/rules:defs.bzl", "my_rule")

# Loading happens first
my_rule(
    name = "target",
    srcs = ["input.txt"],
    compiler = ":tool",
)
```

### 2. Analysis Phase
```python
def _impl(ctx):
    # Analysis phase: Create action graph
    inputs = ctx.files.srcs
    output = ctx.actions.declare_file(...)
    
    # Declare the action
    ctx.actions.run(
        outputs = [output],
        inputs = inputs,
        executable = ctx.executable.tool,
    )
    
    # Return providers for other rules
    return [
        DefaultInfo(...),
        MyInfo(...),
    ]
```

### 3. Execution Phase
```python
# Actions are executed based on the action graph
# Parallel execution when possible
cc_binary(
    name = "app",
    srcs = ["main.cc"],
    deps = [
        ":lib1",  # Built independently
        ":lib2",  # Built independently
    ],
)
```

## Rule Types

### 1. Binary Rules
```python
def _binary_impl(ctx):
    output = ctx.actions.declare_file(ctx.label.name)
    
    ctx.actions.run(
        outputs = [output],
        inputs = ctx.files.srcs,
        executable = ctx.executable.compiler,
        arguments = ["-o", output.path] + [f.path for f in ctx.files.srcs],
    )
    
    # Binary rules must return executable
    return [DefaultInfo(
        files = depset([output]),
        executable = output,
    )]

my_binary = rule(
    implementation = _binary_impl,
    executable = True,  # Marks as executable
    ...
)
```

### 2. Library Rules
```python
def _library_impl(ctx):
    # Collect sources
    srcs = ctx.files.srcs
    
    # Collect dependencies
    deps = [dep[MyInfo].transitive_sources 
            for dep in ctx.attr.deps]
    
    # Create compilation action
    objects = []
    for src in srcs:
        obj = ctx.actions.declare_file(
            src.basename.replace(".c", ".o")
        )
        objects.append(obj)
        ctx.actions.run(
            outputs = [obj],
            inputs = [src],
            executable = ctx.executable.compiler,
        )
    
    # Return provider for dependents
    return [MyInfo(
        objects = objects,
        transitive_sources = depset(
            direct = srcs,
            transitive = deps,
        ),
    )]

my_library = rule(
    implementation = _library_impl,
    attrs = {
        "srcs": attr.label_list(allow_files = True),
        "deps": attr.label_list(providers = [MyInfo]),
    },
)
```

### 3. Test Rules
```python
def _test_impl(ctx):
    # Create test executable
    test_bin = ctx.actions.declare_file(ctx.label.name)
    
    ctx.actions.run(
        outputs = [test_bin],
        inputs = ctx.files.srcs + ctx.files.data,
        executable = ctx.executable.compiler,
    )
    
    # Test rules must be executable
    return [DefaultInfo(
        files = depset([test_bin]),
        executable = test_bin,
        runfiles = ctx.runfiles(files = ctx.files.data),
    )]

my_test = rule(
    implementation = _test_impl,
    test = True,  # Marks as test rule
    attrs = {
        "srcs": attr.label_list(allow_files = True),
        "data": attr.label_list(allow_files = True),
    },
)
```

## Rule Attributes

### 1. Basic Attributes
```python
my_rule = rule(
    attrs = {
        "srcs": attr.label_list(
            allow_files = True,
            doc = "Source files",
        ),
        "deps": attr.label_list(
            providers = [MyInfo],
            doc = "Dependencies",
        ),
        "out": attr.output(
            doc = "Output file",
        ),
    },
)
```

### 2. Configuration Attributes
```python
my_rule = rule(
    attrs = {
        "compiler": attr.label(
            executable = True,
            cfg = "exec",
            default = "//tools:default_compiler",
        ),
        "opts": attr.string_list(
            default = ["-O2"],
        ),
        "config": attr.label(
            providers = [ConfigInfo],
            default = "//config:default",
        ),
    },
)
```

### 3. Platform Attributes
```python
my_rule = rule(
    attrs = {
        "target_compatible_with": attr.label_list(
            providers = [ConstraintValueInfo],
        ),
        "toolchains": attr.label_list(
            providers = [MyToolchainInfo],
        ),
    },
)
```

## Best Practices

### 1. Rule Design
```python
# Good: Clear, focused rule
compile_lib = rule(
    implementation = _compile_lib_impl,
    attrs = {
        "srcs": attr.label_list(allow_files = True),
        "deps": attr.label_list(providers = [LibInfo]),
    },
)

# Bad: Too many responsibilities
do_everything = rule(
    implementation = _do_everything_impl,
    attrs = {
        "srcs": attr.label_list(allow_files = True),
        "compile_opts": attr.string_list(),
        "link_opts": attr.string_list(),
        "test_args": attr.string_list(),
        # Too many unrelated attributes
    },
)
```

### 2. Provider Usage
```python
# Good: Clear provider interface
LibInfo = provider(
    fields = ["objects", "headers", "includes"],
)

# Bad: Vague provider
Info = provider(
    fields = ["stuff"],
)
```

### 3. Action Creation
```python
# Good: Explicit inputs and outputs
ctx.actions.run(
    outputs = [declared_output],
    inputs = ctx.files.srcs,
    executable = ctx.executable.tool,
    arguments = ["--out", declared_output.path],
)

# Bad: Hidden dependencies
ctx.actions.run_shell(
    command = "gcc $( find . -name '*.c' ) -o out",
)
```

## Key Takeaways

1. **Rule Design**
   - Keep rules focused
   - Use clear interfaces
   - Follow Bazel conventions

2. **Evaluation Process**
   - Understand the phases
   - Handle dependencies correctly
   - Use providers effectively

3. **Best Practices**
   - Write hermetic rules
   - Document attributes
   - Test rule behavior

## Related Documentation

- [Providers and Aspects](providers-and-aspects.md)
- [Dependencies and Actions](dependencies-and-actions.md)
- [Official Bazel Rules Documentation](https://bazel.build/extending/rules)
- [Official Bazel Starlark Documentation](https://bazel.build/rules/language)

## Next Steps

- Learn about [Providers and Aspects](providers-and-aspects.md) to create more sophisticated rules
- Explore [Dependencies and Actions](dependencies-and-actions.md) to understand how rules create the build graph
- Study [Build Rules](../getting-started/build-rules.md) to see common rule patterns
- Read about [Toolchains](https://bazel.build/extending/toolchains) to understand how rules interact with tools
