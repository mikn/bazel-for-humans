# Getting Started with Bazel

This guide will help you get started with Bazel, explaining the basic concepts and showing you how to set up your first build.

## Installation

First, install Bazel on your system:

::: code-group
```bash [Linux]
sudo apt install curl gnupg
curl -fsSL https://bazel.build/bazel-release.pub.gpg | gpg --dearmor > bazel.gpg
sudo mv bazel.gpg /etc/apt/trusted.gpg.d/
echo "deb [arch=amd64] https://storage.googleapis.com/bazel-apt stable jdk1.8" | sudo tee /etc/apt/sources.list.d/bazel.list
sudo apt update && sudo apt install bazel
```

```bash [macOS]
brew install bazel
```

```powershell [Windows]
choco install bazel
```
:::

## Your First Bazel Workspace

Create a new directory for your project and initialize it as a Bazel workspace:

```bash
mkdir my-project
cd my-project
touch WORKSPACE
```

### Creating Your First BUILD File

Create a simple Python application with a BUILD file:

::: code-group
```python [main.py]
def main():
    print("Hello from Bazel!")

if __name__ == "__main__":
    main()
```

```python [BUILD]
py_binary(
    name = "hello",
    srcs = ["main.py"],
    main = "main.py",
)
```
:::

The `BUILD` file defines a target that can be built with Bazel. Let's break down its components:

- `py_binary`: A rule that builds a Python executable
- `name`: The name of the target
- `srcs`: Source files needed to build the target
- `main`: The entry point of the executable

## Building and Running

Build and run your application using Bazel:

```bash
# Build the target
bazel build //:hello

# Run the target
bazel run //:hello
```

## Understanding the Output

When you run Bazel, it creates several directories:

- `bazel-bin`: Contains build outputs
- `bazel-out`: Contains intermediate build outputs
- `bazel-my-project`: A symlink to the project's workspace
- `bazel-testlogs`: Contains test logs

## Next Steps

Now that you've created your first Bazel build, you can:

1. Learn about [dependencies](/guide/dependencies)
2. Explore [BUILD files](/guide/build-files) in detail
3. Understand [workspaces](/guide/workspaces)

::: tip
Remember to check the official [Bazel documentation](https://bazel.build/docs) for detailed information about specific features and configurations.
:::

::: warning
Bazel's build process is hermetic, meaning it should be reproducible across different machines. However, this also means you need to explicitly declare all dependencies.
:::
