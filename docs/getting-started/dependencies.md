# Dependencies in Bazel

This guide explains how to manage dependencies in your Bazel projects effectively.

## Understanding Dependencies

Dependencies in Bazel can be:
- Local (within your workspace)
- External (from remote repositories)
- System-level (tools and libraries)

## Declaring Dependencies

In your `BUILD` files:
```python
cc_library(
    name = "my_lib",
    deps = [
        "//path/to/other:lib",
        "@external_repo//some:lib",
    ],
)
```

## Managing External Dependencies

There are two main approaches to managing external dependencies in Bazel:

### Using WORKSPACE (Traditional Approach)

```python
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

http_archive(
    name = "com_google_googletest",
    urls = ["https://github.com/google/googletest/archive/release-1.11.0.zip"],
    strip_prefix = "googletest-release-1.11.0",
    sha256 = "...",
)
```

### Using Bzlmod (Modern Approach)

In your `MODULE.bazel` file:
```python
module(
    name = "my_project",
    version = "1.0",
)

bazel_dep(name = "googletest", version = "1.11.0")
```

## Best Practices

1. Use precise versions for external dependencies
2. Always include SHA-256 hashes for http_archive rules
3. Prefer Bzlmod over WORKSPACE for new projects (Bzlmod is the modern dependency management system)
4. Keep dependencies close to where they're used
5. Use recommended rules from well-maintained rule sets

## Related Documentation

- [Working with External Dependencies](https://bazel.build/external/overview)
- [Managing External Dependencies with Bzlmod](https://bazel.build/external/bzlmod)
- [Recommended Rules](https://bazel.build/rules)
- [Dependencies Guide](https://bazel.build/run/dependencies)
