# Managing Dependencies in Bazel

This guide explains how to manage dependencies in your Bazel projects.

## Types of Dependencies

Bazel supports several types of dependencies:

1. **Internal Dependencies**: Dependencies between targets in your workspace
2. **External Dependencies**: Third-party dependencies from outside your workspace
3. **Language-Specific Dependencies**: Dependencies specific to programming languages

## Internal Dependencies

Internal dependencies are specified in your `BUILD` files:

```python
py_library(
    name = "mylib",
    srcs = ["mylib.py"],
)

py_binary(
    name = "myapp",
    srcs = ["myapp.py"],
    deps = [":mylib"],  # Internal dependency
)
```

## External Dependencies

External dependencies are declared in your `WORKSPACE` file:

```python
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

http_archive(
    name = "rules_python",
    url = "https://github.com/bazelbuild/rules_python/releases/download/0.5.0/rules_python-0.5.0.tar.gz",
    sha256 = "...",
)
```

## Language-Specific Dependencies

### Python Dependencies

For Python projects, you can use `rules_python`:

```python
load("@rules_python//python:pip.bzl", "pip_parse")

pip_parse(
    name = "pip",
    requirements_lock = "//third_party:requirements.txt",
)
```

### Java Dependencies

For Java projects, you can use Maven dependencies:

```python
maven_install(
    artifacts = [
        "junit:junit:4.12",
        "com.google.guava:guava:30.1-jre",
    ],
)
```

## Best Practices

1. **Version Pinning**: Always pin dependency versions for reproducible builds
2. **Dependency Organization**: Keep third-party dependencies in a separate directory
3. **Minimal Dependencies**: Only include dependencies that are actually needed
4. **Transitive Dependencies**: Be aware of and manage transitive dependencies

## Common Issues and Solutions

### Version Conflicts

If you encounter version conflicts:

1. Use `bazel query` to analyze dependencies
2. Pin specific versions in your WORKSPACE file
3. Use version resolution rules when necessary

### Missing Dependencies

If Bazel can't find a dependency:

1. Check your WORKSPACE file configuration
2. Verify the dependency is properly declared in BUILD files
3. Ensure external repository rules are properly configured

## Next Steps

- Learn about [BUILD files](/guide/build-files)
- Explore [workspaces](/guide/workspaces)
- Check out example projects in our [examples section](/examples/basic-build)
