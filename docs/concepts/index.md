# Bazel Concepts

This section explains the core concepts and principles behind Bazel. Understanding these concepts will help you use Bazel effectively.

## Core Concepts

1. [Core Concepts Overview](core-concepts.md)
   - Basic building blocks
   - How components interact
   - Build process overview

2. [Labels and Targets](labels-and-targets.md)
   - Understanding Bazel labels
   - Different types of targets
   - Naming and referencing

3. [Packages and Visibility](packages-and-visibility.md)
   - Package organization
   - Visibility rules
   - Access control

## Build Process

4. [Dependencies and Actions](dependencies-and-actions.md)
   - Types of dependencies
   - How actions work
   - Build graph

5. [Build vs Runtime](build-vs-runtime.md)
   - Build-time vs runtime dependencies
   - Configuration differences
   - Resource management

## Environment and Execution

6. [Unified Environment](unified-environment.md)
   - Hermetic builds
   - Toolchain management
   - Platform configuration

7. [Remote Execution](remote-execution.md)
   - Distributed builds
   - Remote caching
   - Execution services

## Advanced Topics

8. [Rules and Evaluation](rules-and-evaluation.md)
   - Custom rules
   - Rule implementation
   - Starlark basics

9. [Providers and Aspects](providers-and-aspects.md)
   - Rule interfaces
   - Cross-cutting functionality
   - Build analysis

10. [Bazel Central Registry](bazel-central-registry.md)
    - Module management
    - Version resolution
    - Publishing modules

## Additional Resources

- [Official Bazel Documentation](https://bazel.build/docs)
- [Bazel Examples](https://github.com/bazelbuild/examples)
- [Bazel Rules](https://bazel.build/rules) 