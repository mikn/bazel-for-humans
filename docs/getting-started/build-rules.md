# Build Rules

This guide explains how to use build rules in Bazel to define your build targets.

## Understanding Build Rules

Build rules define how Bazel should build different types of targets. Each rule specifies:
- Input files and dependencies
- Commands and tools to execute
- Output files and artifacts
- Configuration and platform settings

## Rule Types

### Core Rules

These are built into Bazel:

```python
# Basic file operations
filegroup(name = "assets", srcs = ["data.txt"])
genrule(name = "gen", outs = ["out.txt"], cmd = "...")

# Shell scripts
sh_binary(name = "script", srcs = ["script.sh"])
sh_test(name = "test", srcs = ["test.sh"])
```

### Language-Specific Rules

Rules for different programming languages:

```python
# C/C++
cc_binary(
    name = "app",
    srcs = ["main.cc"],
    deps = [":lib"],
)

# Java
java_library(
    name = "lib",
    srcs = glob(["src/main/java/**/*.java"]),
    deps = ["@maven//:com_google_guava_guava"],
)

# Python
py_binary(
    name = "app",
    srcs = ["main.py"],
    deps = [":lib"],
    python_version = "PY3",
)

# Protocol Buffers
proto_library(
    name = "proto",
    srcs = ["data.proto"],
)
```

## Rule Attributes

### Common Attributes

Most rules support these attributes:
```python
cc_library(
    name = "lib",                    # Required: Target name
    srcs = ["lib.cc"],              # Source files
    deps = ["//common:utils"],       # Build dependencies
    data = ["//data:config"],       # Runtime dependencies
    visibility = ["//visibility:public"],  # Access control
    tags = ["no-remote"],           # Special properties
)
```

### Platform-Specific Attributes

Configure for different platforms:
```python
cc_binary(
    name = "app",
    srcs = ["app.cc"],
    deps = select({
        "//config:linux": [":linux_lib"],
        "//config:darwin": [":darwin_lib"],
        "//conditions:default": [":default_lib"],
    }),
    target_compatible_with = [
        "@platforms//os:linux",
    ],
)
```

## Starlark Rules

### Writing Custom Rules

Define in `.bzl` files:
```python
# my_rules.bzl
def _impl(ctx):
    output = ctx.actions.declare_file(ctx.label.name + ".out")
    ctx.actions.run(
        outputs = [output],
        inputs = ctx.files.srcs,
        executable = ctx.executable._tool,
        arguments = [output.path] + [f.path for f in ctx.files.srcs],
    )
    return [DefaultInfo(files = depset([output]))]

my_rule = rule(
    implementation = _impl,
    attrs = {
        "srcs": attr.label_list(allow_files = True),
        "_tool": attr.label(
            default = "//tools:processor",
            executable = True,
            cfg = "exec",
        ),
    },
)
```

### Using Custom Rules

```python
load("//rules:my_rules.bzl", "my_rule")

my_rule(
    name = "custom",
    srcs = ["input.txt"],
)
```

## Best Practices

1. **Rule Design**
   - Use built-in rules when possible
   - Keep custom rules focused and reusable
   - Document rule behavior and requirements
   - Follow the single responsibility principle

2. **Attribute Configuration**
   - Make attributes clear and well-documented
   - Use appropriate attribute types
   - Provide sensible defaults
   - Validate attribute values

3. **Dependencies**
   - Keep dependency graphs shallow
   - Use fine-grained targets
   - Avoid circular dependencies
   - Properly declare indirect dependencies

4. **Testing**
   - Write rule unit tests
   - Test with different platforms
   - Verify output correctness
   - Test error conditions

## Common Patterns

### Test Rules

```python
cc_test(
    name = "lib_test",
    srcs = ["lib_test.cc"],
    deps = [
        ":lib",
        "@com_google_googletest//:gtest_main",
    ],
    size = "small",
)
```

### Multi-output Rules

```python
genrule(
    name = "generate",
    srcs = ["input.txt"],
    outs = [
        "output1.txt",
        "output2.txt",
    ],
    cmd = "$(location //tools:generator) $(SRCS) $(OUTS)",
    tools = ["//tools:generator"],
)
```

### Macro Rules

```python
def cc_test_suite(name, srcs, deps = None):
    """Create a test suite from multiple source files."""
    tests = []
    for src in srcs:
        test_name = "%s_%s" % (name, src.replace(".cc", ""))
        cc_test(
            name = test_name,
            srcs = [src],
            deps = deps,
        )
        tests.append(test_name)
    
    native.test_suite(
        name = name,
        tests = tests,
    )
```

## Related Documentation

- [Rules](https://bazel.build/rules)
- [Starlark Language](https://bazel.build/rules/language)
- [Writing Rules](https://bazel.build/rules/rules)
- [Testing Rules](https://bazel.build/rules/testing)
