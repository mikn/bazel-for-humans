# Understanding Bazel Workspaces

A Bazel workspace is a directory that contains the source files for your software and a `WORKSPACE` file. This guide explains how to set up and manage Bazel workspaces effectively.

## Workspace Basics

### WORKSPACE File

The `WORKSPACE` file marks the root of your project:

```python
workspace(name = "my_project")

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
```

### Workspace Structure

A typical workspace structure:

```
my_project/
├── WORKSPACE
├── BUILD
├── src/
│   ├── BUILD
│   └── main.cc
├── lib/
│   ├── BUILD
│   └── helper.cc
└── tests/
    ├── BUILD
    └── test.cc
```

## External Dependencies

### HTTP Archives

Download and use external repositories:

```python
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

http_archive(
    name = "rules_python",
    url = "https://github.com/bazelbuild/rules_python/releases/download/0.5.0/rules_python-0.5.0.tar.gz",
    sha256 = "...",
)
```

### Git Repositories

Use code from Git repositories:

```python
load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")

git_repository(
    name = "my_repo",
    remote = "https://github.com/example/repo.git",
    tag = "v1.0.0",
)
```

## Workspace Rules

### Local Repositories

Reference local directories:

```python
local_repository(
    name = "my_other_project",
    path = "../other_project",
)
```

### Maven Dependencies

For Java projects:

```python
load("@rules_jvm_external//:defs.bzl", "maven_install")

maven_install(
    artifacts = [
        "junit:junit:4.12",
        "com.google.guava:guava:30.1-jre",
    ],
    repositories = [
        "https://repo1.maven.org/maven2",
    ],
)
```

## Best Practices

1. **Workspace Organization**
   - Keep the workspace structure clean and logical
   - Use meaningful package names
   - Group related files together

2. **Dependencies**
   - Pin dependency versions
   - Use SHA-256 hashes for http_archive
   - Keep dependencies up to date

3. **Repository Rules**
   - Prefer http_archive over git_repository
   - Use local_repository for development
   - Document complex repository rules

## Common Issues and Solutions

### Version Conflicts

If you encounter dependency version conflicts:

1. Use `bazel query` to analyze the dependency graph
2. Pin specific versions
3. Use version resolution rules

### Repository Rule Issues

When repository rules fail:

1. Check network connectivity
2. Verify SHA-256 hashes
3. Check for version compatibility

## Advanced Topics

### Multiple Workspaces

Working with multiple workspaces:

```python
local_repository(
    name = "project_a",
    path = "../project_a",
)

local_repository(
    name = "project_b",
    path = "../project_b",
)
```

### Custom Repository Rules

Creating custom repository rules:

```python
def _impl(repository_ctx):
    # Custom implementation
    repository_ctx.file("BUILD", "")

my_custom_rule = repository_rule(
    implementation = _impl,
    attrs = {
        "my_attr": attr.string(),
    },
)
```

## Next Steps

- Learn about [BUILD files](/guide/build-files)
- Explore [dependencies](/guide/dependencies)
- Check out example projects in our [examples section](/examples/basic-build)
