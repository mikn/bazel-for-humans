# Build vs Runtime in Modern Bazel

Understanding the distinction between build time and runtime is crucial for creating correct and efficient Bazel builds. This guide explains the key differences and best practices for handling both phases.

## Core Concepts

### Build Time vs Runtime

#### Build Time
Build time refers to when Bazel executes your build:
- Bazel evaluates and executes actions
- Source files are compiled and linked
- Dependencies are resolved and validated
- Generated files are created
- Tests are executed
- Resource files are copied to their destinations

#### Runtime
Runtime occurs when the built artifacts are actually executed:
- Programs are launched and executed
- Files and resources are accessed from their runtime locations
- Dynamic dependencies are resolved
- Environment variables are read
- Configuration is loaded
- Network connections are established

::: tip
Understanding this distinction is crucial for proper dependency management and file access patterns.
:::

## Common Patterns

### 1. File Access

#### Build Time Access
```python
# BUILD.bazel
cc_binary(
    name = "app",
    srcs = ["main.cc"],
    data = ["config/settings.json"],  # Build-time declaration
)

# main.cc
#include <fstream>
#include <string>
#include "tools/cpp/runfiles/runfiles.h"

int main(int argc, char** argv) {
    // Correct runtime access using runfiles
    std::string error;
    auto runfiles = bazel::tools::cpp::runfiles::Runfiles::Create(argv[0], &error);
    if (runfiles == nullptr) {
        std::cerr << "Failed to load runfiles: " << error << std::endl;
        return 1;
    }
    
    std::string path = runfiles->Rlocation("myapp/config/settings.json");
    std::ifstream config(path);
}
```

::: warning
Never use absolute paths or relative paths that depend on the current working directory. Always use runfiles for runtime file access.
:::

### 2. Dependencies

#### Build Dependencies
```python
# MODULE.bazel
module(
    name = "myapp",
    version = "1.0",
)

bazel_dep(name = "rules_go", version = "0.41.0")
bazel_dep(name = "protobuf", version = "3.19.0")

# BUILD.bazel
go_library(
    name = "lib",
    srcs = ["lib.go"],
    deps = [
        "@com_github_golang_protobuf//proto",  # Build dependency
        "//proto:myservice_go_proto",          # Generated code dependency
    ],
)
```

#### Runtime Dependencies
```python
# BUILD.bazel
py_binary(
    name = "server",
    srcs = ["server.py"],
    deps = [
        requirement("flask"),      # Build-time Python package dependency
    ],
    data = [
        "templates/**/*.html",     # Runtime template files
        "//static:assets",         # Runtime static assets
        "//config:settings.yaml",  # Runtime configuration
    ],
)

# server.py
import os
from rules_python.python.runfiles import runfiles

def main():
    r = runfiles.Create()
    
    # Correct runtime path resolution
    template_dir = r.Rlocation("myapp/templates")
    config_path = r.Rlocation("myapp/config/settings.yaml")
    
    app = Flask(__name__,
                template_folder=template_dir,
                static_folder=r.Rlocation("myapp/static"))
```

### 3. Configuration

#### Build Configuration
```python
# .bazelrc
build --cpu=x86_64
build --compilation_mode=opt
build --stamp  # Include build timestamp

# BUILD.bazel
config_setting(
    name = "opt_build",
    values = {"compilation_mode": "opt"},
)

cc_binary(
    name = "app",
    srcs = ["main.cc"],
    copts = select({
        ":opt_build": [
            "-O2",
            "-DNDEBUG",
        ],
        "//conditions:default": [
            "-O0",
            "-g",
        ],
    }),
    defines = select({
        ":opt_build": ["PRODUCTION=1"],
        "//conditions:default": ["DEVELOPMENT=1"],
    }),
)
```

#### Runtime Configuration
```python
# BUILD.bazel
go_binary(
    name = "server",
    srcs = ["main.go"],
    data = [
        "config/prod.yaml",
        "config/dev.yaml",
    ],
)

# main.go
package main

import (
    "os"
    "path/filepath"
    
    "github.com/bazelbuild/rules_go/go/tools/bazel"
)

func main() {
    // Runtime environment-based config selection
    env := os.Getenv("ENV")
    configFile := "dev.yaml"
    if env == "prod" {
        configFile = "prod.yaml"
    }
    
    // Use runfiles for reliable path resolution
    runfiles, err := bazel.RunfilesPath()
    if err != nil {
        log.Fatal(err)
    }
    
    configPath := filepath.Join(runfiles, "myapp/config", configFile)
    config, err := loadConfig(configPath)
}
```

## Common Issues and Solutions

### 1. Path Resolution

#### Build Time Paths
```python
# BUILD.bazel
py_binary(
    name = "app",
    srcs = ["app.py"],
    data = ["data/input.txt"],
)

# app.py
from rules_python.python.runfiles import runfiles

def read_data():
    r = runfiles.Create()
    
    # Correct: Use runfiles for path resolution
    data_path = r.Rlocation("myapp/data/input.txt")
    with open(data_path) as f:
        return f.read()
        
    # Wrong: Hard-coded paths
    # with open("data/input.txt") as f:  # Will fail
    # with open("/absolute/path/input.txt") as f:  # Will fail
```

### 2. Environment Variables

#### Build Time Environment
```python
# .bazelrc
build --action_env=COMPILER_PATH=/usr/local/bin
build --action_env=INCLUDE_PATH=/usr/include

# BUILD.bazel
genrule(
    name = "generate",
    srcs = ["input.txt"],
    outs = ["output.txt"],
    cmd = "$(COMPILER_PATH)/tool $(INCLUDE_PATH) $(SRCS) > $(OUTS)",
    env = {
        "LANG": "en_US.UTF-8",
        "PATH": "/bin:/usr/bin",
    },
)
```

#### Runtime Environment
```python
# BUILD.bazel
go_binary(
    name = "server",
    srcs = ["main.go"],
    env = {
        "APP_NAME": "myapp",
    },
)

# main.go
package main

import (
    "os"
    "strconv"
)

func main() {
    // Runtime environment configuration with defaults
    debug, _ := strconv.ParseBool(os.Getenv("DEBUG", "false"))
    port, _ := strconv.Atoi(os.Getenv("PORT", "8080"))
    env := os.Getenv("ENV", "development")
    
    // Use environment-specific settings
    config := loadConfig(env)
    startServer(config, port)
}
```

## Best Practices

### 1. File Access
- Always use runfiles for runtime file access
- Never use absolute paths
- Avoid relative paths that depend on current working directory
- Package all required runtime files in the `data` attribute
- Use platform-independent path manipulation

### 2. Dependencies
- Declare all direct dependencies explicitly
- Use fine-grained targets to minimize rebuilds
- Separate runtime data from build dependencies
- Version all external dependencies
- Use dependency injection for better testing

### 3. Configuration
- Use build configurations for compile-time options
- Use runtime configuration for dynamic settings
- Follow the principle of least privilege
- Make configuration explicit and documented
- Provide sensible defaults

### 4. Environment
- Declare build-time environment requirements
- Document required runtime environment variables
- Provide defaults for optional settings
- Use hermetic toolchains
- Keep development and production environments similar

## Common Mistakes to Avoid

1. **Path Resolution**
   - Using absolute paths
   - Relying on current working directory
   - Hardcoding path separators
   - Not using runfiles

2. **Dependencies**
   - Missing runtime dependencies
   - Undeclared build dependencies
   - Circular dependencies
   - Not versioning external dependencies

3. **Configuration**
   - Mixing build and runtime configuration
   - Hardcoding environment-specific values
   - Not providing defaults
   - Unsafe configuration loading

4. **Environment**
   - Undeclared environment dependencies
   - Assuming environment variables exist
   - Not handling missing variables
   - Using different environments for build and runtime
