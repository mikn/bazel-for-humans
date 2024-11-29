# Rust Binary Example

This example demonstrates how to build a Rust binary using Bazel, showcasing:

1. **Cross-Platform Builds**: Build for Linux AMD64 and macOS ARM64
2. **Cargo Integration**: Work with existing Cargo.toml and dependencies
3. **Bazel's Caching**: See how Bazel caches Rust artifacts

## Project Structure

```
rust-binary/
├── MODULE.bazel           # Module definition
├── BUILD.bazel           # Root build file
├── Cargo.toml            # Rust package definition
├── Cargo.lock            # Dependency lock file
├── .bazelrc             # Bazel configuration
├── .bazelversion        # Pinned Bazel version
└── src/
    ├── BUILD.bazel      # Build rules for our binary
    └── main.rs          # Our Rust application
```

## Initial Setup

First, create a `.bazelversion` file:
```bash
echo "7.0.0" > .bazelversion
```

Create a `.bazelrc` with cross-platform settings:
```bash
# Common settings
build --enable_platform_specific_config

# Linux AMD64 settings
build:linux_amd64 --platforms=@rules_rust//rust/platform:linux_amd64

# macOS ARM64 settings
build:macos_arm64 --platforms=@rules_rust//rust/platform:darwin_arm64

# Test settings
test --test_output=errors
```

## Module Configuration

Create the `MODULE.bazel` file:
```python
module(
    name = "rust_binary",
    version = "0.1.0",
)

# Rust rules
bazel_dep(name = "rules_rust", version = "0.40.0")

# Configure Rust toolchain
rust = use_extension("@rules_rust//rust:extensions.bzl", "rust")
rust.toolchain(
    versions = ["1.75.0"],
    edition = "2021",
    dev_components = True,
)
use_repo(rust, "rust_toolchains")
register_toolchains("@rust_toolchains//:all")
```

## Rust Package Configuration

Create `Cargo.toml`:
```toml
[package]
name = "hello_rust"
version = "0.1.0"
edition = "2021"

[dependencies]
clap = { version = "4.4", features = ["derive"] }
```

## Application Code

Create `src/main.rs`:
```rust
use clap::Parser;

#[derive(Parser)]
#[command(name = "hello")]
#[command(about = "A friendly greeter")]
struct Args {
    #[arg(short, long)]
    name: Option<String>,
}

fn main() {
    let args = Args::parse();
    let name = args.name.unwrap_or_else(|| "World".to_string());
    println!("Hello, {}!", name);
    println!("Built with Bazel for {}/{}", 
        std::env::consts::OS,
        std::env::consts::ARCH
    );
}
```

## Build Configuration

Create `src/BUILD.bazel`:
```python
load("@rules_rust//rust:defs.bzl", "rust_binary")

rust_binary(
    name = "hello_rust",
    srcs = ["main.rs"],
    edition = "2021",
    deps = [
        "@crates//:clap",
    ],
    visibility = ["//visibility:public"],
)
```

## Building for Different Platforms

Build for Linux AMD64:
```bash
# Build for Linux AMD64
bazel build --config=linux_amd64 //src:hello_rust

# Run on Linux AMD64
bazel run --config=linux_amd64 //src:hello_rust -- --name="Bazel"
```

Build for macOS ARM64:
```bash
# Build for macOS ARM64
bazel build --config=macos_arm64 //src:hello_rust

# Run on macOS ARM64
bazel run --config=macos_arm64 //src:hello_rust -- --name="Bazel"
```

## Understanding Cross-Platform Builds

When you build for different platforms, Bazel:

1. **Selects the Right Toolchain**
   - Uses platform-specific Rust compiler
   - Sets correct target triple
   - Configures platform-specific flags

2. **Manages Dependencies**
   - Downloads platform-specific dependencies
   - Builds native code for target platform
   - Caches platform-specific artifacts separately

3. **Optimizes Builds**
   - Reuses common intermediate artifacts
   - Only rebuilds platform-specific parts
   - Maintains separate caches per platform

Try building for both platforms:
```bash
# Build for both platforms
bazel build --config=linux_amd64 //src:hello_rust
bazel build --config=macos_arm64 //src:hello_rust

# See what's different
ls -l bazel-bin/src/hello_rust_*
```

## Caching in Action

Let's see how Bazel's caching works with Rust:

```bash
# First build - downloads and compiles everything
bazel build --config=linux_amd64 //src:hello_rust

# Second build - uses cache
bazel build --config=linux_amd64 //src:hello_rust

# Clean and rebuild
bazel clean
bazel build --config=linux_amd64 //src:hello_rust

# Build for different platform - reuses some artifacts
bazel build --config=macos_arm64 //src:hello_rust
```

## Common Operations

Build and run with arguments:
```bash
# Run with arguments
bazel run //src:hello_rust -- --name="Friend"

# Build release version
bazel build -c opt //src:hello_rust

# Run tests
bazel test //src:hello_rust_test
```

## Next Steps
