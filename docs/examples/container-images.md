# Container Images Example

This example demonstrates how to build OCI container images using Bazel, showcasing:

1. **Multi-Platform Images**: Build for Linux AMD64 and ARM64
2. **Multi-Stage Builds**: Optimize image size using build stages
3. **Base Image Management**: Use distroless base images
4. **Layer Optimization**: Leverage Bazel's caching for efficient layers

## Project Structure

```
container-images/
├── MODULE.bazel           # Module definition
├── BUILD.bazel           # Root build file
├── .bazelrc             # Bazel configuration
├── .bazelversion        # Pinned Bazel version
├── app/
│   ├── BUILD.bazel      # Build rules for our application
│   └── main.go          # Simple Go application
└── container/
    ├── BUILD.bazel      # Container build rules
    └── Dockerfile       # Reference Dockerfile (not used by Bazel)
```

## Initial Setup

First, create a `.bazelversion` file:
```bash
echo "7.0.0" > .bazelversion
```

Create a `.bazelrc` with container settings:
```bash
# Common settings
build --enable_platform_specific_config

# Container settings
build --platforms=@rules_oci//platforms:linux_amd64
build:arm64 --platforms=@rules_oci//platforms:linux_arm64

# Registry settings
build --@rules_oci//config:default_registry=docker.io
```

## Module Configuration

Create the `MODULE.bazel` file:
```python
module(
    name = "container_example",
    version = "0.1.0",
)

# Go rules for the application
bazel_dep(name = "rules_go", version = "0.46.0")
bazel_dep(name = "gazelle", version = "0.35.0")

# Container rules
bazel_dep(name = "rules_oci", version = "1.7.2")
bazel_dep(name = "rules_pkg", version = "0.9.1")

# Configure Go
go_sdk = use_extension("@rules_go//go:extension.bzl", "go_sdk")
go_sdk.download(version = "1.21.5")

# Configure base images
oci = use_extension("@rules_oci//oci:extensions.bzl", "oci")
oci.pull(
    name = "distroless_base",
    digest = "sha256:ccaef5ee2f1850270d453fdf700a5392534f8d1a8ca2acda391fbb6a06b81c86",
    image = "gcr.io/distroless/base",
    platforms = [
        "linux/amd64",
        "linux/arm64",
    ],
)
use_repo(oci, "distroless_base")
```

## Application Code

Create `app/main.go`:
```go
package main

import (
    "fmt"
    "net/http"
    "os"
    "runtime"
)

func main() {
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        hostname, _ := os.Hostname()
        fmt.Fprintf(w, "Hello from %s running on %s/%s!\n",
            hostname,
            runtime.GOOS,
            runtime.GOARCH,
        )
    })

    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    fmt.Printf("Server starting on :%s\n", port)
    http.ListenAndServe(":"+port, nil)
}
```

Create `app/BUILD.bazel`:
```python
load("@rules_go//go:def.bzl", "go_binary")

go_binary(
    name = "server",
    srcs = ["main.go"],
    pure = "on",
    static = "on",
    visibility = ["//visibility:public"],
)
```

## Container Configuration

Create `container/BUILD.bazel`:
```python
load("@rules_oci//oci:defs.bzl", "oci_image", "oci_tarball")
load("@rules_pkg//pkg:tar.bzl", "pkg_tar")

# Package the binary
pkg_tar(
    name = "app_layer",
    srcs = ["//app:server"],
    package_dir = "/app",
)

# Create the container image
oci_image(
    name = "image",
    base = "@distroless_base",
    entrypoint = ["/app/server"],
    tars = [":app_layer"],
)

# Create platform-specific tags
oci_tarball(
    name = "image_amd64",
    image = ":image",
    platform = "@rules_oci//platforms:linux_amd64",
    repo_tags = ["example/server:amd64"],
)

oci_tarball(
    name = "image_arm64",
    image = ":image",
    platform = "@rules_oci//platforms:linux_arm64",
    repo_tags = ["example/server:arm64"],
)
```

## Building Images

Build for AMD64:
```bash
# Build AMD64 image
bazel build //container:image_amd64

# Load into Docker
docker load < bazel-bin/container/image_amd64.tar

# Run the container
docker run -p 8080:8080 example/server:amd64
```

Build for ARM64:
```bash
# Build ARM64 image
bazel build --config=arm64 //container:image_arm64

# Load into Docker
docker load < bazel-bin/container/image_arm64.tar

# Run the container
docker run -p 8080:8080 example/server:arm64
```

## Understanding Container Builds

When building container images, Bazel:

1. **Optimizes Layers**
   - Creates minimal layers based on dependencies
   - Reuses cached layers when possible
   - Maintains separate layer caches per platform

2. **Manages Base Images**
   - Downloads and caches base images
   - Verifies image digests
   - Handles multi-platform base images

3. **Builds Efficiently**
   - Builds binary for target platform
   - Creates consistent image layout
   - Generates platform-specific manifests

Try building both platforms:
```bash
# Build both platforms
bazel build //container:image_amd64 //container:image_arm64

# Compare the images
docker images example/server
```

## Caching in Action

Let's see how Bazel's caching works with containers:

```bash
# First build - downloads and builds everything
bazel build //container:image_amd64

# Second build - uses cache
bazel build //container:image_amd64

# Change application code
echo 'Modified!' >> app/main.go

# Rebuild - only rebuilds app layer
bazel build //container:image_amd64
```

## Common Operations

```bash
# Build with custom tag
bazel build //container:image_amd64 --action_env=CUSTOM_TAG=latest

# Build with different base image
bazel build //container:image_amd64 --action_env=BASE_IMAGE=alpine

# Push to registry
bazel run //container:image_amd64.push
```

## Next Steps

1. Add multi-stage builds
2. Configure CI/CD
3. Add health checks
4. Set up container registry

Would you like to continue with any of these next steps?