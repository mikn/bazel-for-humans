# Bazel Central Registry

The Bazel Central Registry (BCR) is the official, centralized repository of Bazel modules that serves as the default registry for Bzlmod. It provides a curated, secure source of commonly used build rules and dependencies with version compatibility guarantees.

For more information about dependency management, see our [Getting Started guide](/getting-started/).

## What is the Bazel Central Registry?

The BCR is:
- A curated collection of verified Bazel modules
- The default registry for Bzlmod-enabled projects
- A source of security-reviewed dependencies
- A community-driven repository of build rules
- A compatibility layer between modules
- A source of truth for version resolution

::: tip
The BCR is the recommended source for Bazel modules as it provides security, compatibility, and reliability guarantees.
:::

## Benefits of Using the BCR

### 1. Security and Trust

- All modules undergo security review before acceptance
- Source code is publicly visible and audited
- Version changes are tracked and verified
- Module metadata includes integrity hashes
- Dependencies are scanned for vulnerabilities
- Changes require maintainer approval

### 2. Standardization

- Semantic versioning scheme
- Consistent module naming conventions
- Shared best practices and patterns
- Clear module interfaces and APIs
- Compatibility level guarantees
- Documented breaking changes

### 3. Ease of Use

- Automatic dependency resolution
- Simple version specification
- Transitive dependency management
- Platform compatibility checks
- Clear upgrade paths
- Integration with build tools

## Using the BCR

### Basic Usage

```python
module(
    name = "my_project",
    version = "1.0.0",
    compatibility_level = 1,
)

# Core build rules from BCR
bazel_dep(name = "rules_go", version = "0.42.0")
bazel_dep(name = "rules_python", version = "0.27.1")
bazel_dep(name = "rules_java", version = "6.4.0")
bazel_dep(name = "rules_proto", version = "5.3.0-21.7")

# Development tools
dev_dependency(name = "buildifier", version = "6.3.3")
dev_dependency(name = "gazelle", version = "0.33.0")
```

::: warning
Not all dependencies are available in the BCR. Some may require alternative sources or direct repository rules. Always check the BCR first, then consider alternatives if needed.
:::

### Version Selection

When selecting versions:

```python
# MODULE.bazel

# Recommended: Use explicit versions
bazel_dep(name = "rules_proto", version = "5.3.0-21.7")

# Handle version conflicts
single_version_override(
    module_name = "protobuf",
    version = "3.19.0",
    patches = ["@//patches:protobuf.patch"],  # Optional patches
)

# Multiple versions (when necessary)
multiple_version_override(
    module_name = "golang",
    versions = ["1.19.0", "1.20.0"],  # Use sparingly
)

# Development dependencies
dev_dependency(name = "black", version = "23.7.0")
```

### Registry Configuration

The `--registry` flag configures which registries Bazel uses to fetch modules. This is essential when working with private registries or custom BCR forks.

```bash
# Basic registry configuration
bazel build --registry=https://bcr.bazel.build //...

# Private registry with fallback to BCR
bazel build \
    --registry=https://registry.company.com \
    --registry=https://bcr.bazel.build //...

# GitHub-hosted registry (e.g., BCR fork)
bazel build \
    --registry=https://raw.githubusercontent.com/my-org/bazel-central-registry/main \
    --registry=https://bcr.bazel.build //...
```

Configure registries in `.bazelrc` for consistency:
```python
# .bazelrc

# Registry configuration
build --registry=https://registry.company.com  # Private registry
build --registry=https://bcr.bazel.build      # Official BCR

# Registry authentication (if needed)
build --registry_auth=https://registry.company.com=bearer_token

# Registry caching
build --repository_cache=~/.cache/bazel/repos
```

## Advanced Usage

### 1. Module Extensions

```python
# MODULE.bazel
module(
    name = "my_project",
    version = "1.0.0",
)

bazel_dep(name = "rules_foo", version = "1.0.0")

# Use module extension
foo = use_extension("@rules_foo//:extensions.bzl", "foo")
foo.toolchain(
    name = "foo_toolchain",
    version = "1.2.3",
)
use_repo(foo, "foo_toolchain")
```

### 2. Dependency Overrides

```python
# MODULE.bazel

# Override a transitive dependency
single_version_override(
    module_name = "protobuf",
    version = "3.19.0",
    patches = ["@//patches:protobuf.patch"],
)

# Multiple versions (advanced use case)
multiple_version_override(
    module_name = "golang",
    versions = ["1.19.0", "1.20.0"],
)

# Development overrides
dev_dependency(
    name = "rules_foo",
    version = "1.0.0",
    dev_override = "@//third_party/rules_foo",
)
```

### 3. Version Constraints

```python
# MODULE.bazel

# Specify version constraints
bazel_dep(
    name = "rules_python",
    version = "0.27.1",
    repo_name = "rules_python_27",  # Optional custom name
)

# Use compatibility level
module(
    name = "my_project",
    version = "1.0.0",
    compatibility_level = 1,
    bazel_compatibility = [">=6.0.0"],
)
```

## Best Practices

### 1. Version Management

- Use explicit, pinned versions
- Document version selection criteria
- Regularly update dependencies
- Test version updates thoroughly
- Monitor security advisories
- Use compatibility levels

### 2. Registry Configuration

- Use BCR as the primary source
- Configure private registries properly
- Document registry priorities
- Set up registry authentication
- Enable registry caching
- Monitor registry health

### 3. Dependency Organization

- Group related dependencies
- Use dev_dependencies appropriately
- Document override reasons
- Maintain clean upgrade paths
- Monitor dependency updates
- Handle breaking changes

## Contributing to the BCR

The BCR is community-driven and welcomes contributions:

### 1. Submitting New Modules

1. Fork the [BCR repository](https://github.com/bazelbuild/bazel-central-registry)
2. Follow module creation guidelines
3. Add module metadata and tests
4. Submit a pull request
5. Address review feedback
6. Maintain the module

### 2. Updating Existing Modules

1. Check current module status
2. Test changes locally
3. Update module metadata
4. Submit pull request
5. Provide test results
6. Document changes

### 3. Best Practices for Contributors

- Follow semantic versioning
- Provide comprehensive documentation
- Include examples and tests
- Maintain backward compatibility
- Respond to security issues
- Support multiple Bazel versions

## Migration from WORKSPACE

Migrating from WORKSPACE to Bzlmod requires careful planning:

### 1. Assessment Phase

1. Inventory current dependencies
2. Check BCR availability
3. Identify complex cases
4. Plan migration strategy
5. Set up testing environment

### 2. Migration Process

```python
# Old WORKSPACE
load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")

git_repository(
    name = "rules_go",
    remote = "https://github.com/bazelbuild/rules_go",
    commit = "a9666b7e46a3d33b90d05a1a0a6ed3a0a9255ccd",
)

# New MODULE.bazel
module(
    name = "my_project",
    version = "1.0.0",
    compatibility_level = 1,
)

bazel_dep(name = "rules_go", version = "0.42.0")

# Handle complex cases
single_version_override(
    module_name = "protobuf",
    version = "3.19.0",
    patches = ["@//patches:protobuf.patch"],
)
```

### 3. Migration Strategies

1. **Gradual Migration**
   - Start with simple dependencies
   - Migrate one module at a time
   - Test thoroughly between migrations
   - Keep WORKSPACE as fallback

2. **Complex Cases**
   - Use repository rules when needed
   - Create custom module extensions
   - Document workarounds
   - Plan for future updates

::: tip
Consider using the `--experimental_enable_bzlmod` flag during migration to test Bzlmod behavior while keeping WORKSPACE as a fallback.
:::

## Troubleshooting

### Common Issues

1. **Version Conflicts**
   - Check dependency graph
   - Use version overrides
   - Update incompatible dependencies
   - Consider multiple versions

2. **Registry Problems**
   - Verify registry URLs
   - Check authentication
   - Clear repository cache
   - Monitor registry status

3. **Migration Issues**
   - Review migration guide
   - Check compatibility
   - Test incrementally
   - Document workarounds

::: warning
Always maintain a rollback plan when making significant changes to your dependency management system.
:::

## Next Steps

1. Explore the [BCR GitHub repository](https://github.com/bazelbuild/bazel-central-registry)
2. Review [Bzlmod documentation](/getting-started/)
3. Learn about [Remote Repositories](/concepts/remote-repositories)
4. Understand [Version Resolution](/concepts/version-resolution)
