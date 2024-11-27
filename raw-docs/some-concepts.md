# Bazel Concepts Guide

## Core Building Blocks

### 1. Rulesets
- Collections of rules and macros that define how to build code
- Typically provided by others as reusable building blocks
- Examples:
  - `rules_go` for building Go code
  - `rules_python` for Python
  - `rules_java` for Java
- Located in:
  - External repositories
  - Can be loaded via `MODULE.bazel` or `WORKSPACE`
- Key characteristics:
  - Define build logic but contain no actual source code
  - Provide abstractions like `go_binary`, `py_test`, etc.
  - Can be versioned and distributed
  - Usually prefixed with `rules_` by convention

### 2. Repositories
- Units of external code or binaries
- Can be:
  - Source code repositories (e.g., Git repositories)
  - Binary archives (e.g., `.tar.gz`, `.zip`)
  - Local directories
- Characteristics:
  - Have their own root directory
  - Are hermetic (isolated from other repositories)
  - Immutable once fetched
  - Referenced by repository rules like:
    - `http_archive`
    - `git_repository`
    - `local_repository`

### 3. Workspaces
- Your project's root directory where you actually build code
- Defined by either:
  - `WORKSPACE` file (legacy)
  - `WORKSPACE.bazel` file (legacy)
  - `MODULE.bazel` file (modern)
- Contains:
  - Your source code
  - BUILD files
  - Dependencies configuration
- Characteristics:
  - Single root directory
  - All build files must be under this directory
  - Can have multiple packages (subdirectories with BUILD files)
  - Is where you actually run `bazel build` commands

### 4. Bazel Modules (Bzlmod)
- Modern system for managing dependencies
- Replaces the legacy WORKSPACE system
- Defined in `MODULE.bazel` files
- Key benefits:
  - Separates concerns:
    - Workspaces focus on building your code
    - Modules handle dependency management
  - Supports version resolution
  - Cleaner dependency graph
  - Better reproducibility

#### Relationship Between Components

```
┌─────────────────────────────────────────┐
│ Your Workspace                          │
│ (MODULE.bazel or WORKSPACE)             │
│                                         │
│  ┌────────────────────────────────┐     │
│  │ Your Source Code               │     │
│  │ - src/                         │     │
│  │ - BUILD files                  │     │
│  └────────────────────────────────┘     │
│                                         │
│  ┌────────────────────────────────┐     │
│  │ External Rulesets              │     │
│  │ - rules_go                     │     │
│  │ - rules_python                 │     │
│  │ (Providing build logic)        │     │
│  └────────────────────────────────┘     │
│                                         │
│  ┌────────────────────────────────┐     │
│  │ External Repositories          │     │
│  │ - Source dependencies          │     │
│  │ - Binary dependencies          │     │
│  │ (Providing actual code/bins)   │     │
│  └────────────────────────────────┘     │
└─────────────────────────────────────────┘
```

### Example Configuration

```python
# MODULE.bazel (Modern approach)
module(
    name = "my_project",
    version = "1.0",
)

# Import rulesets
bazel_dep(name = "rules_go", version = "0.39.1")
bazel_dep(name = "rules_python", version = "0.24.0")

# Configure external repositories
git_override(
    module = "github.com/my-org/my-dep",
    commit = "abc123",
)

http_archive(
    name = "some_binary_dep",
    urls = ["https://example.com/archive.tar.gz"],
    sha256 = "...",
)
```

```python
# Alternative WORKSPACE approach (Legacy)
workspace(name = "my_project")

# Import rulesets
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

http_archive(
    name = "rules_go",
    urls = ["https://github.com/bazelbuild/rules_go/releases/download/v0.39.1/rules_go-v0.39.1.zip"],
    sha256 = "...",
)

# Load and configure the ruleset
load("@rules_go//go:deps.bzl", "go_register_toolchains", "go_rules_dependencies")
go_rules_dependencies()
go_register_toolchains(version = "1.19.5")

# External repository for actual code
git_repository(
    name = "my_dep",
    remote = "https://github.com/my-org/my-dep.git",
    commit = "abc123",
)
```

### Key Points
1. **Separation of Concerns**:
   - Rulesets provide build logic
   - Repositories provide external code
   - Workspace is where your code lives
   - Modules manage dependencies

2. **Modern vs Legacy**:
   - Modern: Use `MODULE.bazel` with Bzlmod
   - Legacy: Use `WORKSPACE` with repository rules
   - Both can coexist during migration

3. **Dependency Flow**:
   - Your workspace uses rulesets to build code
   - Rulesets may depend on other rulesets
   - External repositories provide additional code
   - Modules manage this dependency graph
