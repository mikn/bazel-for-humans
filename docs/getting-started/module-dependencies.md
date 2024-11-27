# Module Dependencies

This guide explains how to manage dependencies in modern Bazel using Bzlmod.

## Understanding Module Dependencies

In modern Bazel, dependencies are declared in your `MODULE.bazel` file using `bazel_dep`. Each dependency is a module that provides rules, libraries, or binaries for your project.

## Types of Dependencies

### Direct Dependencies

These are modules your project directly depends on:

```python
bazel_dep(name = "rules_python", version = "0.5.0")
bazel_dep(name = "rules_go", version = "0.39.0")
```

### Development Dependencies

Tools and libraries only needed during development:

```python
dev_dependency(name = "buildifier", version = "6.0.0")
```

### Multiple-Version Dependencies

When you need specific versions for different use cases:

```python
bazel_dep(name = "protobuf", version = "3.19.0")
single_version_override(
    module_name = "protobuf",
    version = "3.19.0",
)
```

## Version Selection

### Version Constraints

Specify version requirements:

```python
bazel_dep(
    name = "rules_python",
    version = "0.5.0",
    repo_name = "py_rules",  # Optional: use a different name locally
)
```

### Version Resolution

Bazel automatically resolves version conflicts by:
1. Using the highest compatible version
2. Applying single_version_override rules
3. Following dependency constraints

## Common Patterns

### Language-Specific Dependencies

Python dependencies:
```python
bazel_dep(name = "rules_python", version = "0.5.0")
python = use_extension("@rules_python//python:extensions.bzl", "python")
python.toolchain(python_version = "3.9")
```

Go dependencies:
```python
bazel_dep(name = "rules_go", version = "0.39.0")
go_deps = use_extension("@rules_go//go:extensions.bzl", "go_deps")
go_deps.module(
    path = "github.com/google/uuid",
    version = "v1.3.0",
)
```

### Third-Party Dependencies

Using external libraries:

```python
bazel_dep(name = "rules_python", version = "0.5.0")
pip = use_extension("@rules_python//python:extensions.bzl", "pip")
pip.parse(
    name = "pip",
    requirements_lock = "//third_party:requirements_lock.txt",
)
use_repo(pip, "pip")
```

## Best Practices

1. **Version Pinning**
   - Always specify exact versions
   - Use version overrides sparingly
   - Document version choices

2. **Dependency Organization**
   - Group related dependencies
   - Use meaningful repo_names
   - Keep third-party deps separate

3. **Version Management**
   - Regularly update dependencies
   - Test after updates
   - Use CI to verify compatibility

4. **Documentation**
   - Document non-obvious dependencies
   - Explain version constraints
   - Keep a changelog

## Common Issues

### Version Conflicts

If you encounter version conflicts:

1. Check your direct dependencies
2. Use `single_version_override`
3. Update to compatible versions

### Missing Dependencies

When dependencies are not found:

1. Verify the module name
2. Check version availability
3. Ensure registry access

## Next Steps

1. Learn about [Build Rules](/getting-started/build-rules)
2. Explore [Core Concepts](/concepts/core-concepts)
3. Practice with [Multi-language Projects](/examples/multi-language)
