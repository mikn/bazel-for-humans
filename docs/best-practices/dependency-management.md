# Dependency Management Best Practices

This guide explains how Bazel solves common dependency management problems in development environments.

## The Problem with Traditional Approaches

### The "make lint" Problem

Many projects have documentation like this:

```markdown
# Project Setup
1. Install Python 3.9
2. Install Node.js 16
3. Install golangci-lint v1.50.1
4. Run `make lint` to check code
5. Run `make format` to format code
```

This approach has several issues:
- Different developers may have different tool versions
- CI may use different versions than local development
- New team members waste time setting up tools
- Tool versions aren't tracked in version control
- System-wide installations can conflict

## The Bazel Solution

Bazel solves these problems by:
1. Making tools part of the build system
2. Versioning tools alongside code
3. Automatically downloading and using correct versions through the [Bazel Central Registry](/concepts/bazel-central-registry)
4. Isolating tool installations

### Modern Dependency Management with Bzlmod

Bazel's modern dependency management system, Bzlmod, works with the Bazel Central Registry to provide:

1. **Centralized Package Management**
   - Verified, secure dependencies from BCR
   - Automatic version resolution
   - Compatibility checking

2. **Simplified Configuration**
   ```python
   # MODULE.bazel
   module(
       name = "my_project",
       version = "0.1.0",
   )
   
   # Development tools from BCR
   bazel_dep(name = "rules_python", version = "0.24.0")
   bazel_dep(name = "black", version = "23.3.0")
   bazel_dep(name = "golangci_lint", version = "1.50.1")
   ```

3. **Reproducible Environments**
   - All tools and dependencies are versioned
   - No system-wide installations needed
   - Same versions in CI and local development

### Example: Linting Setup

Traditional approach:
```makefile
# Makefile
lint:
    golangci-lint run ./...
    black .
    eslint .
```

Bazel approach:
```python
# MODULE.bazel
module(
    name = "my_project",
    version = "0.1.0",
)

# Development tools as dependencies
bazel_dep(name = "rules_go", version = "0.39.0")
bazel_dep(name = "rules_python", version = "0.5.0")
bazel_dep(name = "rules_nodejs", version = "5.8.0")

# Linters and formatters
dev_dependency(name = "golangci_lint", version = "1.50.1")
dev_dependency(name = "black", version = "22.3.0")
dev_dependency(name = "eslint", version = "8.31.0")
```

```python
# tools/lint/BUILD.bazel
load("@rules_python//python:defs.bzl", "py_binary")
load("@npm//eslint:index.bzl", "eslint_test")
load("@golangci_lint//:rules.bzl", "golangci_lint_test")

# Python formatting
py_binary(
    name = "black",
    main = "@black//:black",
    visibility = ["//visibility:public"],
)

# Go linting
golangci_lint_test(
    name = "go_lint",
    config = "//:.golangci.yml",
    paths = ["//..."],
)

# JavaScript linting
eslint_test(
    name = "js_lint",
    data = [
        "//:.eslintrc.js",
        "//:package.json",
        "//:.eslintignore",
    ],
    entry = ["//..."],
)
```

Now developers can run:
```bash
# Run all linters
bazel test //tools/lint:all

# Run specific linter
bazel run //tools/lint:black
```

## Managing Runtime Dependencies

### Traditional Approach

```markdown
# Runtime Setup
1. Install PostgreSQL 14
2. Install Redis 6
3. Install Kafka 2.8
4. Configure environment variables
```

### Bazel's Solution

```python
# MODULE.bazel
module(
    name = "my_project",
    version = "0.1.0",
)

# Runtime dependencies
bazel_dep(name = "rules_docker", version = "0.25.0")
bazel_dep(name = "rules_oci", version = "1.2.0")

# Development database
dev_dependency(name = "postgres_dev", version = "14.5")
```

```python
# tools/dev/BUILD.bazel
load("@rules_oci//oci:defs.bzl", "oci_image")

# Development database
oci_image(
    name = "postgres_dev",
    base = "@postgres_dev//image",
    env = {
        "POSTGRES_DB": "myapp_dev",
        "POSTGRES_PASSWORD": "dev_only",
    },
)

# Development environment
sh_binary(
    name = "dev_env",
    srcs = ["dev_env.sh"],
    data = [
        ":postgres_dev",
        "//config:dev.env",
    ],
)
```

Now developers can start a development environment:
```bash
bazel run //tools/dev:dev_env
```

## Benefits of Bazel's Approach

1. **Version Control**
   - Tool versions are tracked in `MODULE.bazel`
   - Changes to tool versions require code review
   - History of tool version changes is preserved

2. **Reproducibility**
   - Everyone uses exactly the same versions
   - CI matches development environment
   - New developers get correct versions automatically

3. **Isolation**
   - Tools don't pollute system
   - Multiple versions can coexist
   - No conflicts between projects

4. **Automation**
   - No manual installation steps
   - Tools are downloaded automatically
   - Configuration is version controlled

## Common Patterns

### Tool Wrappers

Create wrappers for common tools:

```python
# tools/format/BUILD.bazel
py_binary(
    name = "format_all",
    srcs = ["format_all.py"],
    deps = [
        "//tools/lint:black",
        "@go_sdk//:gopls",
    ],
)
```

```python
# tools/format/format_all.py
import subprocess

def main():
    subprocess.run(["bazel", "run", "//tools/lint:black"])
    subprocess.run(["bazel", "run", "@go_sdk//:gopls", "format"])

if __name__ == "__main__":
    main()
```

### Development Containers

Package development environment:

```python
# tools/devcontainer/BUILD.bazel
load("@rules_docker//container:container.bzl", "container_image")

container_image(
    name = "devcontainer",
    base = "@ubuntu//image",
    files = [
        "//tools/lint:all",
        "//tools/format:all",
        "//config:dev",
    ],
)
```

### Pre-commit Hooks

Integrate with git hooks:

```python
# tools/precommit/BUILD.bazel
sh_binary(
    name = "precommit",
    srcs = ["precommit.sh"],
    data = [
        "//tools/lint:all",
        "//tools/format:all",
    ],
)
```

## Best Practices

1. **Tool Management**
   - Use `dev_dependency` for development tools
   - Version all tools explicitly
   - Create convenient wrappers

2. **Runtime Dependencies**
   - Use containers for complex dependencies
   - Version runtime tools
   - Automate environment setup

3. **Documentation**
   - Document tool usage, not installation
   - Focus on workflows, not setup
   - Keep README simple

4. **Integration**
   - Use pre-commit hooks
   - Integrate with IDE plugins
   - Automate common tasks

## Next Steps

1. Learn about [Remote Execution](/concepts/remote-execution)
2. Explore [Build Performance](/best-practices/build-performance)
3. Practice with [External Dependencies](/examples/external-dependencies)
