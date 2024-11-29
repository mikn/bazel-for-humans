# Module Dependencies

This guide explains how to manage dependencies in modern Bazel using Bzlmod.

## Understanding Module Dependencies

In modern Bazel, dependencies are declared in your `MODULE.bazel` file using `bazel_dep`. Each dependency is a module that provides rules, libraries, or binaries for your project.

## The Bazel Central Registry

The [Bazel Central Registry](https://bcr.bazel.build/) is the official registry for Bazel modules. It provides:
- Verified and tested modules
- Version compatibility information
- Security through checksums
- Standardized module metadata

## Types of Dependencies

### Direct Dependencies

These are modules your project directly depends on:

```python
bazel_dep(name = "rules_python", version = "0.27.1")
bazel_dep(name = "rules_go", version = "0.42.0")
```

### Development Dependencies

Tools and libraries only needed during development:

```python
dev_dependency(name = "buildifier", version = "6.3.3")
```

### Multiple-Version Dependencies

Bazel's Multiple Version Compatibility (MVC) system handles multiple versions:

```python
bazel_dep(name = "protobuf", version = "3.19.0")
single_version_override(
    module_name = "protobuf",
    version = "3.19.0",
    patches = ["//patches:protobuf.patch"],
)
```

## Module Extensions

Module extensions are the Bzlmod way to configure dependencies, replacing repository rules:

```python
# Root module extension
root_module_extension = use_extension("//tools:my_extension.bzl", "root_ext")
root_module_extension.configure(param = "value")

# Regular module extension
my_ext = use_extension("@other_module//tools:ext.bzl", "ext")
use_repo(my_ext, "generated_repo")
```

## Common Patterns

### Python Dependencies

```python
bazel_dep(name = "rules_python", version = "0.27.1")
python = use_extension("@rules_python//python/extensions:python.bzl", "python")
python.toolchain(
    python_version = "3.11",
)

pip = use_extension("@rules_python//python/extensions:pip.bzl", "pip")
pip.parse(
    hub_name = "pip",
    python_version = "3.11",
    requirements_lock = "//third_party:requirements_lock.txt",
)
use_repo(pip, "pip")
```

### Go Dependencies

```python
bazel_dep(name = "rules_go", version = "0.42.0")
go_deps = use_extension("@rules_go//go:extensions.bzl", "go_deps")
go_deps.module(
    path = "github.com/google/uuid",
    version = "v1.3.0",
)
use_repo(go_deps, "uuid")
```

## Version Resolution

Bazel's version resolution follows these rules:
1. Direct dependencies take precedence
2. `single_version_override` takes highest priority
3. Compatible version selection using semver
4. Explicit version ranges are respected
5. Registry metadata is consulted for compatibility

## Best Practices

1. **Version Management**
   - Use exact versions from the Bazel Central Registry
   - Document version override reasons
   - Keep dependencies up to date

2. **Module Organization**
   - Use module extensions over repository rules
   - Keep third-party dependencies separate
   - Document module configurations

3. **Security**
   - Use the Bazel Central Registry when possible
   - Verify checksums for external dependencies
   - Review patch files regularly

## Common Issues and Solutions

### Version Conflicts

When encountering version conflicts:
1. Check the dependency graph (`bazel mod graph`)
2. Use `single_version_override` if needed
3. Update to compatible versions
4. Consider module extension configuration

### Missing Dependencies

For missing dependencies:
1. Verify the module name in the registry
2. Check version availability
3. Ensure registry access
4. Look for alternative modules

## Related Documentation

- [Bzlmod User Guide](https://bazel.build/external/bzlmod)
- [Bazel Central Registry](https://bazel.build/external/registry)
- [Module Extensions](https://bazel.build/rules/module_extensions)
- [Version Resolution](https://bazel.build/external/module_resolution)
