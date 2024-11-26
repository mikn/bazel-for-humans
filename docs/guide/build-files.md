# Understanding BUILD Files

BUILD files are the core of Bazel's build system. They define the relationships between targets and specify how they should be built.

## Basic Structure

A BUILD file consists of build rules that define targets:

```python
cc_binary(
    name = "hello-world",
    srcs = ["hello-world.cc"],
)
```

## Common Build Rules

### C/C++

```python
cc_library(
    name = "hello-lib",
    srcs = ["hello-lib.cc"],
    hdrs = ["hello-lib.h"],
    visibility = ["//visibility:public"],
)

cc_binary(
    name = "hello-world",
    srcs = ["main.cc"],
    deps = [":hello-lib"],
)

cc_test(
    name = "hello-test",
    srcs = ["hello-test.cc"],
    deps = [":hello-lib"],
)
```

### Python

```python
py_library(
    name = "mylib",
    srcs = ["mylib.py"],
    deps = [
        "//another/package:dependency",
    ],
)

py_binary(
    name = "myapp",
    srcs = ["myapp.py"],
    deps = [":mylib"],
)
```

### Java

```python
java_library(
    name = "mylib",
    srcs = glob(["src/main/java/**/*.java"]),
    deps = [
        "@maven//:com_google_guava_guava",
    ],
)
```

## Important Concepts

### Visibility

Control who can depend on your targets:

```python
py_library(
    name = "mylib",
    srcs = ["mylib.py"],
    visibility = [
        "//visibility:public",  # Anyone can depend on this
        "//my/package:__subpackages__",  # Only subpackages can depend on this
        "//my/package:__pkg__",  # Only targets in this package can depend on this
    ],
)
```

### Labels

References to build targets:

- `:foo` - Target in current package
- `//path/to/package:target` - Fully qualified label
- `@repo//package:target` - Target in external repository

### Globs

Pattern matching for files:

```python
py_library(
    name = "mylib",
    srcs = glob(
        ["*.py"],
        exclude = ["*_test.py"],
    ),
)
```

## Best Practices

1. **Package Organization**
   - Keep related files together
   - Use meaningful target names
   - Group related targets

2. **Dependencies**
   - Minimize dependencies
   - Use fine-grained targets
   - Avoid circular dependencies

3. **Visibility**
   - Use the most restrictive visibility possible
   - Make libraries public only when necessary
   - Use package groups for complex visibility rules

4. **File Organization**
   - One BUILD file per directory
   - Keep BUILD files simple
   - Use load statements at the top

## Common Patterns

### Test Targets

```python
py_test(
    name = "mylib_test",
    srcs = ["mylib_test.py"],
    deps = [":mylib"],
)
```

### Data Dependencies

```python
py_binary(
    name = "myapp",
    srcs = ["myapp.py"],
    data = [
        "//path/to/data:config.json",
        "//path/to/data:resources",
    ],
)
```

### Multiple Targets

```python
[py_test(
    name = "test_%s" % src[:-3],
    srcs = [src],
    deps = [":mylib"],
) for src in glob(["*_test.py"])]
```

## Debugging BUILD Files

1. Use `bazel query` to analyze dependencies
2. Use `bazel build --verbose_failures` for detailed error messages
3. Use `bazel clean` to clean build artifacts

## Next Steps

- Learn about [workspaces](/guide/workspaces)
- Explore [dependencies](/guide/dependencies)
- See examples in our [examples section](/examples/basic-build)
