# Out-of-Tree vs In-Tree Builds: Early Error Detection

## Key Differences

### In-Tree Builds (Traditional)
```
myapp/
├── main.go
├── generated/           # Generated files in source tree
│   └── api.pb.go       # Can exist from previous builds
├── pkg/
│   ├── lib.go
│   └── lib.a           # Built artifact in source
└── myapp               # Binary in source tree
```

### Out-of-Tree Builds (Bazel)
```
myapp/
├── main.go
├── pkg/
│   └── lib.go
└── BUILD.bazel

bazel-bin/                # All outputs isolated
├── myapp
├── pkg/
│   └── lib.a
└── generated/
    └── api.pb.go
```

## How This Catches Errors Earlier

### 1. Missing Generated Files

#### In-Tree (Late Detection)
```go
// main.go
import "myapp/generated/api"  // Might work! Old generated file exists

$ go build                    // Succeeds with stale generated code
// Bug discovered much later when API doesn't match expectations
```

#### Out-of-Tree (Immediate Detection)
```python
# BUILD.bazel
go_binary(
    name = "app",
    srcs = ["main.go"],
    deps = [":api_go_proto"],  # Must be explicit
)
# Error: main.go imports "myapp/generated/api" which is not provided
```

### 2. Undeclared Tool Dependencies

#### In-Tree (Late Detection)
```bash
# Works on your machine:
$ make proto              # Uses locally installed protoc
$ go build ./...         # Works fine

# Fails in CI or for other developers:
$ git clean -fdx
$ make proto
# Error: protoc: command not found
```

#### Out-of-Tree (Immediate Detection)
```python
proto_library(
    name = "api_proto",
    srcs = ["api.proto"],
)

go_proto_library(
    name = "api_go_proto",
    protos = [":api_proto"],
)
# Tool dependency is explicit and hermetic
```

### 3. Accidental Build Artifact Dependencies

#### In-Tree (Late Detection)
```go
// Might work because lib.a exists from previous build
import "mycompany/internal/build/lib"

$ go build                  # Works locally
$ go test ./...            # Fails in CI
# "cannot find package"
```

#### Out-of-Tree (Immediate Detection)
```python
go_binary(
    name = "app",
    srcs = ["main.go"],
    deps = ["//internal/lib"],  # Must declare all deps
)
# Error: no such package 'internal/build'
```

### 4. Mixed Generated and Source Files

#### In-Tree (Late Detection)
```bash
# Developer A:
$ protoc --go_out=. api.proto
$ git add generated/api.pb.go  # Accidentally commits generated file
$ git commit -m "Update API"

# Developer B:
$ protoc --go_out=. api.proto  # Different version of protoc
# Silent failure: committed generated file takes precedence
```

#### Out-of-Tree (Immediate Detection)
```python
# Generated files can't be committed because they're not in source tree
# Every build generates them fresh in bazel-bin/
proto_library(
    name = "api_proto",
    srcs = ["api.proto"],
)
```

## Why This Matters

### 1. Build Reliability
* Every build starts clean
* No dependency on previous build state
* Same behavior locally and in CI
* No hidden tool dependencies

### 2. Development Velocity
* Errors caught at build definition time
* No "works on my machine" issues
* Clear dependency requirements
* Easy environment setup

### 3. Code Quality
* No accidentally committed generated files
* No stale artifacts affecting builds
* Clear separation of source and generated code
* Explicit dependencies

## Common Scenarios It Prevents

1. **Stale Generated Code**
   * In-tree: Can use old generated files without realizing
   * Out-of-tree: Always fresh generation

2. **Missing Build Steps**
   * In-tree: Might work if artifacts exist
   * Out-of-tree: Must declare complete build

3. **Tool Version Mismatches**
   * In-tree: Different versions on different machines
   * Out-of-tree: Hermetic toolchain

4. **Incomplete Dependencies**
   * In-tree: Hidden by existing artifacts
   * Out-of-tree: Must be explicitly declared

## Best Practices

1. **Never Commit Generated Files**
   * Keep source tree clean
   * Generate everything during build
   * Version control BUILD files only

2. **Explicit Dependencies**
   * Declare all source dependencies
   * Declare all tool dependencies
   * No implicit requirements

3. **Clean Development**
   * Use bazel run for tools
   * Keep build artifacts isolated
   * Regular clean builds