# Workspaces in Bazel

This guide explains how to set up and manage Bazel workspaces effectively. While older Bazel projects used a WORKSPACE file for configuration, modern Bazel uses a more predictable MODULE.bazel file and the Bazel Central Registry for dependency management.

## What is a Workspace?

A Bazel workspace is a directory that contains your project's source files and build configuration. At its core, it needs:
- Source files
- BUILD files (defining targets)
- A module definition file (MODULE.bazel)
- Configuration files (.bazelrc, .bazelignore)

## Understanding Rulesets

Bazel's core functionality is intentionally minimal - it provides a framework for building and testing code, but doesn't know how to build specific languages or create specific outputs. This is where rulesets come in.

A ruleset is a collection of build rules that teach Bazel how to build certain types of targets. For example:
- `rules_python` provides rules like `py_binary` and `py_test` for Python code
- `rules_go` provides rules like `go_binary` and `go_library` for Go code
- `rules_docker` provides rules like `container_image` for Docker containers

You'll need different rulesets depending on what you're building. Most modern rulesets are available through the [Bazel Central Registry](/concepts/bazel-central-registry) (BCR), which is Bazel's official ruleset registry. The [BCR](/concepts/bazel-central-registry) provides:
- Verified and tested versions of rulesets
- Automatic dependency management
- Compatibility information between rulesets
- Security through checksums and verification

The BCR is central to modern Bazel development - it's where you'll find most of the rules you need, and it makes dependency management much simpler than the legacy WORKSPACE approach. Learn more about how the BCR works and how to publish your own rulesets in our [Bazel Central Registry guide](/concepts/bazel-central-registry).

## Module Definition

### Modern Approach (Recommended)

The `MODULE.bazel` file is a configuration file that Bazel evaluates to understand your project's structure. Like BUILD files, it contains declarations that Bazel reads and processes - it does not execute functions or run code. This makes it predictable and safe.

```python
# MODULE.bazel is declarative - these are not function calls
module(
    name = "my_project",
    version = "1.0",
)

# Import rulesets from the Bazel Central Registry
bazel_dep(name = "rules_python", version = "0.27.1")
bazel_dep(name = "rules_go", version = "0.42.0")

# Even toolchain registration is declarative
register_toolchains("//toolchains:my_toolchain")
```

The module system (Bzlmod) provides:
- Pure configuration without execution
- Automatic dependency resolution
- Central registry integration
- Predictable evaluation order

### Working with Legacy Documentation

When searching for Bazel documentation or examples, you'll often find instructions like this:
```python
# Add this to your WORKSPACE file
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
http_archive(
    name = "rules_foo",
    urls = ["https://github.com/example/rules_foo/archive/v1.0.0.zip"],
    sha256 = "...",
)

# Then load and call the ruleset's setup function
load("@rules_foo//:deps.bzl", "rules_foo_dependencies")
rules_foo_dependencies()
```

When you encounter such documentation:

1. **Check the BCR First**
   - Visit [registry.bazel.build](https://registry.bazel.build) and for more info, check our [BCR guide](/concepts/bazel-central-registry)
   - Search for the ruleset by name
   - Check if there's a newer version available
   - Review the ruleset's documentation and compatibility information

2. **If the Ruleset is in BCR**
   ```python
   # In MODULE.bazel - much simpler!
   bazel_dep(name = "rules_foo", version = "1.0.0")
   ```
   - No need for manual downloads
   - No need for setup functions
   - Dependencies are handled automatically

3. **If the Ruleset is Not in BCR**
   - Check the ruleset's documentation for Bzlmod support
   - Look for alternative rulesets in BCR
   - Consider using [multiple_version_override](https://bazel.build/external/migration#using_http_archive):
     ```python
     # In MODULE.bazel
     bazel_dep(name = "rules_foo", version = "0.0.0")  # Dummy version
     single_version_override(
         module_name = "rules_foo",
         patches = ["//patches:rules_foo.patch"],
         patch_strip = 1,
     )
     ```
   - As a last resort, you might need a hybrid approach with both MODULE.bazel and WORKSPACE

4. **Common Patterns in Legacy Docs**
   - `http_archive` calls indicate external dependencies
   - `load()` statements often need to be reordered in WORKSPACE
   - Setup functions (like `foo_dependencies()`) are usually automatic with Bzlmod
   - SHA hashes in WORKSPACE become unnecessary with BCR

### Legacy Approach (WORKSPACE)

The older `WORKSPACE` file is a Starlark script that actively executes code to set up your workspace. Each function call in a WORKSPACE file:
- Actually runs when the file is loaded
- Can download files and create directories
- Must be ordered correctly to work
- Can have complex side effects

Example of the legacy approach (not recommended for new projects):
```python
# WORKSPACE functions are executed in order
workspace(name = "my_project")  # This runs first

# This function runs and downloads files
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
http_archive(
    name = "rules_cc",
    urls = ["https://github.com/bazelbuild/rules_cc/releases/download/0.0.1/rules_cc-0.0.1.tar.gz"],
    sha256 = "...",
)

# This must come after http_archive because it uses its results
load("@rules_cc//cc:repositories.bzl", "rules_cc_dependencies")
rules_cc_dependencies()  # This function runs and sets up more repositories
```

## Configuration Files

### .bazelrc

The `.bazelrc` file contains default command-line options:

```python
# Common settings
build --incompatible_enable_cc_toolchain_resolution
test --test_output=errors
```

### .bazelignore

The `.bazelignore` file specifies directories to exclude from the build:

```
# Generated or external directories
node_modules
dist
target
```

## Project Structure

A modern Bazel workspace typically looks like this:
```
my_project/
├── MODULE.bazel         # Module definition (replaces WORKSPACE)
├── .bazelrc            # Build settings
├── .bazelversion       # Pinned Bazel version
├── BUILD.bazel         # Root package build targets
├── src/                # Source code
│   └── BUILD.bazel     # Package build targets
└── toolchains/         # Custom toolchains (if needed)
    └── BUILD.bazel     # Toolchain definitions
```

## Best Practices

1. **Use MODULE.bazel**
   - Prefer the module system over WORKSPACE
   - Use the Bazel Central Registry
   - Keep dependencies minimal

2. **Workspace Organization**
   - Use meaningful package names
   - Keep the root clean
   - Group related files

3. **Version Control**
   - Version control .bazelrc
   - Include .bazelversion
   - Document setup requirements

4. **Dependencies**
   - Use exact versions
   - Keep dependencies up to date
   - Document version requirements

## Related Documentation

- [Bzlmod User Guide](https://bazel.build/external/overview)
- [Configuration Guide](https://bazel.build/run/bazelrc)
- [Platforms and Toolchains](https://bazel.build/concepts/platforms)
- [Bazel Central Registry](https://registry.bazel.build)
