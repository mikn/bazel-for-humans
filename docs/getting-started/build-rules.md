# Build Rules

This guide explains how to use build rules in modern Bazel to define your build targets.

## Understanding Build Rules

Build rules define how Bazel should build different types of targets. Each rule specifies:
- Input files and dependencies
- Build commands and tools
- Output files and artifacts

## Common Rules

### Python Rules

Basic Python binary:
```python
py_binary(
    name = "app",
    srcs = ["main.py"],
    deps = [":lib"],
)
```

Python library:
```python
py_library(
    name = "lib",
    srcs = ["lib.py"],
    deps = ["//common:utils"],
)
```

Python test:
```python
py_test(
    name = "lib_test",
    srcs = ["lib_test.py"],
    deps = [":lib"],
)
```

### Go Rules

Go binary:
```python
go_binary(
    name = "server",
    srcs = ["main.go"],
    deps = [":handlers"],
)
```

Go library:
```python
go_library(
    name = "handlers",
    srcs = ["handlers.go"],
    importpath = "example.com/myapp/handlers",
)
```

### Generic Rules

File groups:
```python
filegroup(
    name = "configs",
    srcs = glob(["*.json"]),
)
```

Shell scripts:
```python
sh_binary(
    name = "script",
    srcs = ["script.sh"],
    data = [":configs"],
)
```

## Rule Attributes

Common attributes used in rules:

### Basic Attributes

```python
py_library(
    name = "lib",              # Target name
    srcs = ["lib.py"],         # Source files
    deps = ["//common:utils"],  # Dependencies
    visibility = ["//visibility:public"],  # Access control
)
```

### Advanced Attributes

```python
py_binary(
    name = "app",
    srcs = ["main.py"],
    deps = [":lib"],
    main = "main.py",          # Entry point
    data = ["//data:config"],  # Runtime data
    args = ["--debug"],        # Default arguments
)
```

## Custom Rules

Define custom rules in `.bzl` files:

```python
# rules/python.bzl
def custom_py_binary(name, deps = None, **kwargs):
    """A custom Python binary rule with predefined settings."""
    py_binary(
        name = name,
        deps = deps + ["//common:base"],
        python_version = "PY3",
        **kwargs
    )
```

Use custom rules:
```python
load("//rules:python.bzl", "custom_py_binary")

custom_py_binary(
    name = "app",
    srcs = ["main.py"],
)
```

## Best Practices

1. **Rule Selection**
   - Use built-in rules when possible
   - Keep custom rules simple
   - Document rule behavior

2. **Dependencies**
   - Declare minimal dependencies
   - Use fine-grained targets
   - Avoid circular dependencies

3. **Visibility**
   - Restrict visibility appropriately
   - Use package groups
   - Document public APIs

4. **Testing**
   - Write test rules
   - Use test suites
   - Mock dependencies

## Common Patterns

### Multi-language Projects

Combining different rules:
```python
py_library(
    name = "py_lib",
    srcs = ["lib.py"],
)

go_library(
    name = "go_lib",
    srcs = ["lib.go"],
)

cc_binary(
    name = "app",
    srcs = ["main.cc"],
    deps = [
        ":py_lib",
        ":go_lib",
    ],
)
```

### Resource Handling

Managing data files:
```python
filegroup(
    name = "assets",
    srcs = glob([
        "static/**/*.css",
        "static/**/*.js",
    ]),
)

py_binary(
    name = "server",
    srcs = ["server.py"],
    data = [":assets"],
)
```

## Next Steps

1. Learn about [Module Dependencies](/getting-started/module-dependencies)
2. Explore [Core Concepts](/concepts/core-concepts)
3. Practice with [Multi-language Projects](/examples/multi-language)
