# BUILD Files in Bazel

This guide explains how to write and organize BUILD files effectively.

## What are BUILD Files?

BUILD files are the core of Bazel's build system. They define:
- Targets that can be built
- Dependencies between targets
- Build rules and their attributes
- Package visibility and constraints

## Basic Structure

```python
load("@rules_cc//cc:defs.bzl", "cc_binary", "cc_library")

package(default_visibility = ["//visibility:private"])

cc_library(
    name = "hello_lib",
    srcs = ["hello.cc"],
    hdrs = ["hello.h"],
    visibility = ["//visibility:public"],
)

cc_binary(
    name = "hello_world",
    srcs = ["main.cc"],
    deps = [":hello_lib"],
)
```

## Target Naming

Target names should be:
- Descriptive and meaningful
- Lowercase with underscores
- Unique within the package
- Related to their function

Example:
```python
cc_library(
    name = "string_utils",  # Good: descriptive
    srcs = ["string_utils.cc"],
)
```

## Common Rules

Built-in rules for various languages:
```python
# C/C++
cc_binary(name = "app")
cc_library(name = "lib")
cc_test(name = "test")

# Java
java_binary(name = "app")
java_library(name = "lib")
java_test(name = "test")

# Python
py_binary(name = "app")
py_library(name = "lib")
py_test(name = "test")

# Protocol Buffers
proto_library(name = "proto")
```

## Visibility

Control who can depend on your targets:

```python
package(default_visibility = ["//visibility:private"])

cc_library(
    name = "internal_lib",
    # Uses package default visibility
)

cc_library(
    name = "public_lib",
    visibility = ["//visibility:public"],
)

cc_library(
    name = "limited_lib",
    visibility = [
        "//my/package:__subpackages__",
        "//other/package:__pkg__",
    ],
)
```

## Dependencies

Different types of dependencies:
```python
cc_binary(
    name = "app",
    deps = [
        ":local_lib",  # Within same package
        "//other/package:lib",  # Different package
        "@external_repo//:lib",  # External repository
    ],
    data = ["//path/to:data_file"],  # Runtime dependencies
)
```

## Best Practices

1. **Package Organization**
   - Keep BUILD files close to source
   - One BUILD file per directory
   - Group related targets together

2. **Target Design**
   - Make targets as small as practical
   - Avoid circular dependencies
   - Use appropriate visibility

3. **Dependencies**
   - Minimize dependency chains
   - Use precise dependencies
   - Document non-obvious deps

4. **Maintainability**
   - Use buildifier for formatting
   - Document complex build rules
   - Use macros for repetitive patterns

## Common Patterns

### Test Targets
```python
cc_test(
    name = "lib_test",
    srcs = ["lib_test.cc"],
    deps = [
        ":lib",
        "@com_google_googletest//:gtest_main",
    ],
)
```

### Data Dependencies
```python
py_binary(
    name = "tool",
    srcs = ["tool.py"],
    data = [
        "//path/to:config.json",
        "//path/to:resources",
    ],
)
```

## Related Documentation

- [Writing BUILD Files](https://bazel.build/concepts/build-files)
- [Visibility Rules](https://bazel.build/concepts/visibility)
- [Labels](https://bazel.build/concepts/labels)
- [Dependencies](https://bazel.build/concepts/dependencies)
