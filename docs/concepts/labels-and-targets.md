# Labels and Targets

This guide explains how Bazel identifies and builds different parts of your code. If you're familiar with programming but new to build systems, think of labels as "addresses" and targets as "things that can be built".

## Understanding Labels

### What is a Label?

A label is like a URL for your code - it uniquely identifies any buildable thing in your workspace. Just like a web URL has a specific format, labels follow this pattern:

```python
@repository//package/path:target_name
```

Breaking this down:
- `@repository`: Which codebase this is in (optional, defaults to your main code)
- `//package/path`: Where in the codebase to look
- `:target_name`: What specific thing to build

### Label Examples

```python
# Building something in your main codebase
//my/cool/project:app                # Build the 'app' target
//my/cool/project                    # Use the default target
:app                                # Target in current package

# Building from external code
@rules_python//python:defs.bzl      # Python rules from external repo
@com_github_google//lib:utils       # Library from GitHub
```

## Understanding Targets

### What is a Target?

A target is anything that can be built. Think of it like this:
- A binary target is like your final executable
- A library target is like a reusable component
- A test target is your test suite
- A file target is just a file or group of files

### Common Target Types

```python
# A program you can run
cc_binary(
    name = "my_app",
    srcs = ["main.cc"],
)

# A library others can use
cc_library(
    name = "utils",
    srcs = ["utils.cc"],
    hdrs = ["utils.h"],
)

# Tests for your code
cc_test(
    name = "utils_test",
    srcs = ["utils_test.cc"],
    deps = [":utils"],
)
```

## How Labels and Targets Work Together

### Building Things

When you run a Bazel command, you use labels to specify what to build:

```bash
# Build a specific target
bazel build //my/project:app

# Build everything in a package
bazel build //my/project/...

# Run a binary
bazel run //my/project:app

# Run tests
bazel test //my/project:all_tests
```

### Dependencies Between Targets

Targets can depend on other targets using labels:

```python
cc_binary(
    name = "app",
    srcs = ["app.cc"],
    deps = [
        ":utils",                          # Local dependency
        "//common/math:geometry",          # From another package
        "@boost//:filesystem",             # From external repository
    ],
)
```

## Best Practices

1. **Label Naming**
   - Use descriptive, lowercase names
   - Use underscores to separate words
   - Keep names concise but clear

2. **Target Organization**
   - Group related targets in the same package
   - Split large targets into smaller, reusable pieces
   - Use clear naming patterns (e.g., `*_test` for tests)

3. **Dependencies**
   - Depend on the most specific target needed
   - Avoid unnecessary dependencies
   - Keep dependency chains short

## Common Patterns

### Library and Binary
```python
cc_library(
    name = "greeting",
    srcs = ["greeting.cc"],
    hdrs = ["greeting.h"],
)

cc_binary(
    name = "hello_world",
    srcs = ["main.cc"],
    deps = [":greeting"],
)
```

### Tests and Test Data
```python
cc_test(
    name = "greeting_test",
    srcs = ["greeting_test.cc"],
    deps = [":greeting"],
    data = ["test_data.txt"],
)
```

### File Groups
```python
filegroup(
    name = "configs",
    srcs = glob(["config/*.json"]),
)
```

## Troubleshooting

### Common Issues

1. **Label Not Found**
   ```bash
   ERROR: no such package '//my/project'
   ```
   - Check if the package path is correct
   - Ensure BUILD file exists in that directory

2. **Target Not Found**
   ```bash
   ERROR: no such target '//my/project:app'
   ```
   - Check if target name matches BUILD file
   - Look for typos in the label

3. **Visibility Error**
   ```bash
   ERROR: Target '//my/project:lib' is not visible
   ```
   - Check if the target's visibility allows access
   - Add necessary visibility declarations

## Related Documentation

- [Packages and Visibility](packages-and-visibility.md)
- [Dependencies and Actions](dependencies-and-actions.md)
- [Official Bazel Labels Documentation](https://bazel.build/concepts/labels)

## Next Steps

- Learn about [Packages and Visibility](packages-and-visibility.md) to understand how to control access to your targets
- Explore [Dependencies and Actions](dependencies-and-actions.md) to see how targets are built
- Study [Build Rules](../getting-started/build-rules.md) to create your own targets
- Read about [Workspaces](../getting-started/workspaces.md) to manage external dependencies
