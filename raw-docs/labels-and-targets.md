# Bazel Labels: Target Identification and Resolution

## Core Label Forms

### Full Canonical Form
```python
@@myrepo//my/app/main:app_binary
^       ^              ^
|       |              └── Target name
|       └── Package path from repository root
└── Canonical repository name (double-@@)
```

### Repository Names

#### 1. Canonical Form (@@repo)
- Unique within workspace
- Unambiguous identification regardless of context
```python
@@rules_java++toolchains+local_jdk//java:compiler
```

#### 2. Apparent Form (@repo)
- Context-dependent resolution
- More commonly used in BUILD files
```python
@rules_java//java:compiler
```

#### 3. Current Repository
- Used when referencing targets in same repository
- Repository prefix can be omitted
```python
//my/app/main:app_binary
```

## Label Components

### 1. Package Path
```python
# Full package specification
//my/app/main:target

# Same package reference
:target
target     # For files, colon is optional
```

### 2. Target Names
```python
# Rule target (conventional to keep colon)
//my/app:my_lib

# File target (conventional to omit colon)
//my/app/main/testdata/input.txt

# Default target (package name equals target name)
//my/app/lib         # Equivalent to //my/app/lib:lib
```

### 3. Subdirectory Handling
```python
# File in subdirectory of package
//my/app/main:testdata/input.txt

# Not allowed - incorrect package reference
//my/app:testdata/input.txt  # If testdata/ has its own BUILD file
```

## Package vs Target References

### Package References
```python
# In package_group declarations
package_group(
    name = "my_pkg_group",
    packages = ["//my/app/..."],
)

# In .bzl files
# //my/app refers to the package
```

### Target References
```python
# In BUILD files
deps = ["//my/app"]  # Refers to //my/app:app target
```

## Label Resolution Rules

### 1. Within Same Package
```python
# In //my/app/BUILD
cc_library(
    name = "lib",
    deps = [
        ":util",           # Same package
        "//other/pkg:lib", # Different package
    ],
)
```

### 2. Cross-Package References
```python
# Must use full package path
cc_binary(
    name = "app",
    deps = [
        "//my/app/util:lib",    # Correct
        "util:lib",             # Wrong - relative path
    ],
)
```

### 3. Repository References
```python
# External repository
deps = ["@rules_go//go:core"]

# Main repository (works from external repos)
deps = ["@@//my/app:lib"]

# Current repository
deps = ["//my/app:lib"]
```

## Common Patterns

### 1. Source Files
```python
cc_library(
    name = "lib",
    srcs = [
        "lib.cc",            # Current package
        "//include:lib.h",   # Different package
    ],
)
```

### 2. Dependencies
```python
go_binary(
    name = "app",
    srcs = ["main.go"],
    deps = [
        ":config",                          # Same package
        "//common/logger",                  # Same repository
        "@com_github_spf13_cobra//:cobra",  # External repository
    ],
)
```

### 3. Data Files
```python
sh_test(
    name = "integration_test",
    srcs = ["test.sh"],
    data = [
        "testdata/input.txt",         # Same package
        "//data:test_resources",      # Different package
        "@test_data//:golden_files",  # External repository
    ],
)
```

## Best Practices

### 1. Label Clarity
```python
# Good: Explicit and clear
deps = ["//third_party/protobuf:protobuf"]

# Bad: Ambiguous
deps = ["protobuf:protobuf"]
```

### 2. Repository References
```python
# Good: Explicit repository for external deps
deps = ["@org_golang_x_net//http2"]

# Bad: Implicit repository
deps = ["//external/org_golang_x_net/http2"]
```

### 3. Package References
```python
# Good: Use full package path for cross-package deps
deps = ["//my/app/util:lib"]

# Bad: Relative paths across packages
deps = ["../util:lib"]
```

## Common Gotchas

### 1. Package vs Target Reference
```python
# Common mistake: Thinking //my/app refers to all targets
deps = ["//my/app"]  # Actually refers to //my/app:app
```

### 2. Subdirectory vs Package
```python
# Wrong: Using subdirectory as package
deps = ["//my/app/util/helper"]  # Only valid if helper is package name

# Correct: Reference file in subdirectory
srcs = ["//my/app:util/helper.cc"]
```

### 3. Canonical Label Resolution
```python
# These are different in external repositories:
deps = ["//my/app:lib"]    # Looks in current repository
deps = ["@@//my/app:lib"]  # Always refers to main repository
```

## Label Validation

### 1. Valid Characters
- Target names: `a-z`, `A-Z`, `0-9`, `!%-@^_"#$&'()*-+,;<=>?[]{|}~/`
- Package names: Similar but more restricted for language compatibility

### 2. Path Constraints
- No absolute paths (starting with `/`)
- No `..` or `.` references
- No `//` in paths
- Must be in normal form

### 3. Package Names
- Should be valid identifiers in target languages
- Avoid leading digits
- Avoid special characters in language-specific packages

## Key Takeaways

1. **Label Structure**
   - Use canonical form for unambiguous references
   - Understand context-dependent resolution
   - Follow package boundaries

2. **Best Practices**
   - Be explicit about repositories
   - Use full package paths for cross-package references
   - Follow naming conventions

3. **Common Patterns**
   - File references
   - Dependencies
   - Cross-repository references

4. **Gotchas**
   - Package vs target references
   - Repository resolution
   - Path normalization