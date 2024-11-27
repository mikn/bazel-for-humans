# External Dependencies

This guide demonstrates how to manage external dependencies in modern Bazel using Bzlmod.

## Understanding External Dependencies

In modern Bazel, external dependencies are managed through the `MODULE.bazel` file using:
- `bazel_dep`: For rule sets and other Bazel modules
- `use_extension`: For language-specific package management
- `dev_dependency`: For development-only tools

## Common Patterns

### Python Dependencies

```python
# MODULE.bazel
module(
    name = "my_project",
    version = "0.1.0",
)

bazel_dep(name = "rules_python", version = "0.5.0")
python = use_extension("@rules_python//python:extensions.bzl", "python")
python.toolchain(python_version = "3.9")

# pip dependencies
pip = use_extension("@rules_python//python:extensions.bzl", "pip")
pip.parse(
    name = "pip",
    requirements_lock = "//third_party:requirements_lock.txt",
)
use_repo(pip, "pip")
```

```python
# third_party/requirements.txt
requests==2.28.1
pandas==1.5.2
```

```python
# third_party/BUILD.bazel
load("@pip//:requirements.bzl", "requirement")

py_library(
    name = "requests",
    deps = [requirement("requests")],
    visibility = ["//visibility:public"],
)

py_library(
    name = "pandas",
    deps = [requirement("pandas")],
    visibility = ["//visibility:public"],
)
```

### Go Dependencies

```python
# MODULE.bazel
module(
    name = "my_project",
    version = "0.1.0",
)

bazel_dep(name = "rules_go", version = "0.39.0")
go = use_extension("@rules_go//go:extensions.bzl", "go")
go.toolchain(version = "1.19")

# Direct Go dependencies
go_deps = use_extension("@rules_go//go:extensions.bzl", "go_deps")
go_deps.module(
    path = "github.com/google/uuid",
    version = "v1.3.0",
)
go_deps.module(
    path = "github.com/stretchr/testify",
    version = "v1.8.1",
)
use_repo(go_deps, "com_github_google_uuid", "com_github_stretchr_testify")
```

### Java/Maven Dependencies

```python
# MODULE.bazel
module(
    name = "my_project",
    version = "0.1.0",
)

bazel_dep(name = "rules_jvm_external", version = "4.5")
maven = use_extension("@rules_jvm_external//:extensions.bzl", "maven")
maven.install(
    name = "maven",
    artifacts = [
        "junit:junit:4.13.2",
        "com.google.guava:guava:31.1-jre",
    ],
    repositories = [
        "https://repo1.maven.org/maven2",
    ],
)
use_repo(maven, "maven")
```

## Version Management

### Version Constraints

```python
# MODULE.bazel
bazel_dep(
    name = "protobuf",
    version = "3.19.0",
    repo_name = "com_google_protobuf",
)

# Override a transitive dependency
single_version_override(
    module_name = "zlib",
    version = "1.2.13",
)
```

### Development Dependencies

```python
# MODULE.bazel
dev_dependency(name = "buildifier", version = "6.0.0")
dev_dependency(name = "blacken", version = "0.5.0")
```

## Common Use Cases

### HTTP Archives

```python
# MODULE.bazel
bazel_dep(name = "bazel_skylib", version = "1.3.0")
load("@bazel_skylib//lib:versions.bzl", "versions")

versions.check(minimum_bazel_version = "6.0.0")

http_archive(
    name = "custom_tool",
    urls = ["https://example.com/archive.tar.gz"],
    sha256 = "...",
    strip_prefix = "tool-1.0",
)
```

### Git Dependencies

```python
# MODULE.bazel
git_override(
    module_name = "my_fork",
    remote = "https://github.com/me/project.git",
    commit = "abc123",
)
```

### Local Dependencies

```python
# MODULE.bazel
local_path_override(
    module_name = "local_lib",
    path = "../local_lib",
)
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

3. **Security**
   - Verify checksums
   - Use trusted repositories
   - Update dependencies regularly

4. **Performance**
   - Minimize external dependencies
   - Use fine-grained targets
   - Cache repository downloads

## Troubleshooting

### Missing Dependencies

If a dependency is not found:

1. Check the module name and version
2. Verify the repository URL
3. Check network connectivity
4. Clear the repository cache:
   ```bash
   bazel clean --expunge
   ```

### Version Conflicts

If you encounter version conflicts:

1. Use `single_version_override`
2. Update to compatible versions
3. Fork and maintain a compatible version

## Next Steps

1. Explore [Multi-language Projects](/examples/multi-language)
2. Learn about [Build Performance](/best-practices/build-performance)
3. Understand [Remote Execution](/concepts/remote-execution)
