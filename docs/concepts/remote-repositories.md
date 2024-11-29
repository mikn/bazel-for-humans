# Remote Repositories

This guide explains how Bazel works with remote repositories, which are external dependencies hosted outside your workspace. Remote repositories can include source code, pre-built binaries, or build rules.

## Understanding Remote Repositories

### What are Remote Repositories?

Remote repositories in Bazel are:
- External code sources that your project depends on
- Identified by the `@repository_name` prefix
- Defined in either `WORKSPACE` or `MODULE.bazel`
- Fetched and cached during the build

## Repository Rules

### Common Repository Rules

```python
# HTTP Archive
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

http_archive(
    name = "com_google_googletest",
    urls = ["https://github.com/google/googletest/archive/v1.14.0.zip"],
    strip_prefix = "googletest-1.14.0",
    sha256 = "...",
)

# Git Repository
load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")

git_repository(
    name = "rules_cc",
    remote = "https://github.com/bazelbuild/rules_cc.git",
    tag = "0.0.9",
)

# Local Repository
load("@bazel_tools//tools/build_defs/repo:local.bzl", "local_repository")

local_repository(
    name = "my_local_dep",
    path = "/absolute/path/to/dep",
)
```

## Modern Approach with Bzlmod

### Module Dependencies

```python
# MODULE.bazel
module(
    name = "my_project",
    version = "1.0",
)

bazel_dep(name = "rules_cc", version = "0.0.9")
bazel_dep(name = "googletest", version = "1.14.0")

# Optional: Override sources
single_version_override(
    module_name = "rules_cc",
    patches = ["@//patches:rules_cc.patch"],
)
```

## Repository Caching

### Cache Configuration

```python
# .bazelrc
build --repository_cache=~/.cache/bazel-repo
build --experimental_repository_cache_hardlinks
build --experimental_repository_cache_urls=https://repo-cache.example.com
```

### Cache Management
```bash
# Clear repository cache
bazel clean --expunge

# Pre-fetch repositories
bazel fetch //...
```

## Best Practices

### 1. Version Pinning
```python
# Good: Pinned version with hash
http_archive(
    name = "rules_python",
    sha256 = "abc...",
    strip_prefix = "rules_python-0.27.1",
    url = "https://github.com/bazelbuild/rules_python/archive/0.27.1.zip",
)

# Bad: Floating version
git_repository(
    name = "rules_python",
    remote = "https://github.com/bazelbuild/rules_python.git",
    branch = "main",  # Avoid using floating refs
)
```

### 2. Mirror Configuration
```python
# Multiple URLs for reliability
http_archive(
    name = "rules_cc",
    urls = [
        "https://mirror1.example.com/rules_cc-0.0.9.zip",
        "https://mirror2.example.com/rules_cc-0.0.9.zip",
        "https://github.com/bazelbuild/rules_cc/archive/0.0.9.zip",
    ],
    sha256 = "...",
)
```

### 3. Patch Management
```python
# Apply patches cleanly
http_archive(
    name = "patched_repo",
    patches = ["@//patches:fix.patch"],
    patch_args = ["-p1"],
    patch_cmds = [
        "find . -name '*.sh' -exec chmod +x {} \\;",
    ],
)
```

## Common Issues

### 1. Download Failures
```bash
ERROR: An error occurred during the fetch of repository 'rules_cc'
```
- Check network connectivity
- Verify URLs are accessible
- Try alternative mirrors
- Check proxy settings

### 2. Hash Mismatches
```bash
ERROR: SHA256 hash does not match
```
- Verify the correct hash
- Check for repository updates
- Clear repository cache
- Use a known good mirror

### 3. Patch Failures
```bash
ERROR: patch command failed
```
- Check patch format
- Verify patch level (-p1 vs -p0)
- Ensure clean source tree
- Update patch for new versions

## Related Documentation

- [Module Dependencies](../getting-started/module-dependencies.md)
- [Bazel Central Registry](bazel-central-registry.md)
- [Version Resolution](version-resolution.md)
- [Official Remote Repository Documentation](https://bazel.build/external/overview)

## Next Steps

- Learn about [Version Resolution](version-resolution.md) to understand how Bazel handles dependency versions
- Explore [Bazel Central Registry](bazel-central-registry.md) for a modern approach to dependencies
- Study [Module Dependencies](../getting-started/module-dependencies.md) to use Bzlmod effectively
- Read about [Dependencies](../getting-started/dependencies.md) for general dependency management
