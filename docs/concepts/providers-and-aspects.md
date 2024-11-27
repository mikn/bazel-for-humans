# Providers and Aspects in Modern Bazel

## Understanding Providers

### What Are Providers?

Providers are the mechanism for passing information between rules in Bazel. They enable structured data sharing and form the backbone of Bazel's dependency system.

### Basic Provider Structure

```python
# Define a provider
FooInfo = provider(
    fields = ["sources", "includes", "deps_info"],
    doc = "Information about Foo compilation",
)

# Rule implementation using provider
def _foo_library_impl(ctx):
    # Collect information
    sources = ctx.files.srcs
    includes = ctx.attr.includes
    
    # Create provider instance
    return [
        FooInfo(
            sources = sources,
            includes = includes,
            deps_info = collect_deps(ctx.attr.deps),
        ),
    ]
```

## Common Built-in Providers

### 1. DefaultInfo
```python
def _custom_binary_impl(ctx):
    output = ctx.actions.declare_file(ctx.label.name)
    
    return [DefaultInfo(
        files = depset([output]),           # Output files
        runfiles = ctx.runfiles(files = [output]),  # Runtime files
        executable = output,                # For binary targets
    )]
```

### 2. OutputGroupInfo
```python
def _custom_library_impl(ctx):
    # Different output groups for different purposes
    return [OutputGroupInfo(
        compilation = depset([compiled_lib]),
        debug_info = depset([debug_symbols]),
        documentation = depset([generated_docs]),
    )]
```

### 3. CcInfo
```python
def _custom_cc_impl(ctx):
    return [CcInfo(
        compilation_context = cc_common.create_compilation_context(
            headers = depset(ctx.files.hdrs),
            includes = depset(ctx.attr.includes),
        ),
        linking_context = cc_common.create_linking_context(...),
    )]
```

## Provider Composition

### 1. Collecting from Dependencies
```python
def _collect_providers(ctx):
    # Gather providers from deps
    dep_infos = [dep[FooInfo] for dep in ctx.attr.deps]
    
    # Combine information
    all_sources = depset(
        direct = ctx.files.srcs,
        transitive = [info.sources for info in dep_infos],
    )
    
    return FooInfo(
        sources = all_sources,
        includes = ctx.attr.includes,
        deps_info = dep_infos,
    )
```

### 2. Provider Chains
```python
def _library_impl(ctx):
    # Get providers from dependencies
    cc_info = ctx.attr.dep[CcInfo]
    foo_info = ctx.attr.dep[FooInfo]
    
    # Create new compilation context
    new_cc_info = cc_common.merge_cc_infos(
        cc_infos = [cc_info, process_foo_info(foo_info)]
    )
    
    return [new_cc_info]
```

## Understanding Aspects

### What Are Aspects?

Aspects are a way to extend rules with additional behavior and outputs. They can traverse the dependency graph and collect or generate information.

### Basic Aspect Structure

```python
# Define an aspect
collect_sources = aspect(
    implementation = _collect_sources_impl,
    attr_aspects = ["deps"],
    attrs = {
        "_tool": attr.label(
            default = "//tools:collector",
            executable = True,
            cfg = "exec",
        ),
    },
)

def _collect_sources_impl(target, ctx):
    # Collect sources from this target
    srcs = target.files.to_list()
    
    # Collect from dependencies
    dep_sources = [dep[OutputGroupInfo].sources 
                  for dep in ctx.rule.attr.deps]
    
    return [OutputGroupInfo(
        sources = depset(srcs, transitive = dep_sources)
    )]
```

### Common Aspect Use Cases

### 1. Code Generation
```python
proto_gen = aspect(
    implementation = _proto_gen_impl,
    attr_aspects = ["deps"],
    attrs = {
        "_protoc": attr.label(
            default = "@com_google_protobuf//:protoc",
            executable = True,
            cfg = "exec",
        ),
    },
)

def _proto_gen_impl(target, ctx):
    # Generate code for each proto file
    outputs = []
    for src in target.files.to_list():
        output = ctx.actions.declare_file(
            src.basename.replace(".proto", ".pb.go")
        )
        outputs.append(output)
        ctx.actions.run(
            outputs = [output],
            inputs = [src],
            executable = ctx.executable._protoc,
            arguments = ["--go_out=" + output.path, src.path],
        )
    
    return [OutputGroupInfo(
        generated = depset(outputs)
    )]
```

### 2. Documentation Generation
```python
doc_gen = aspect(
    implementation = _doc_gen_impl,
    attr_aspects = ["deps"],
    attrs = {
        "_doc_tool": attr.label(
            default = "//tools:doc_generator",
            executable = True,
            cfg = "exec",
        ),
    },
)

def _doc_gen_impl(target, ctx):
    # Generate documentation
    doc_file = ctx.actions.declare_file(
        target.label.name + ".md"
    )
    
    ctx.actions.run(
        outputs = [doc_file],
        inputs = target.files.to_list(),
        executable = ctx.executable._doc_tool,
        arguments = ["-o", doc_file.path] + 
                   [f.path for f in target.files.to_list()],
    )
    
    return [OutputGroupInfo(
        docs = depset([doc_file])
    )]
```

## Best Practices

### 1. Provider Design
```python
# Good: Clear, focused provider
CompileInfo = provider(
    fields = ["objects", "includes", "flags"],
    doc = "Compilation artifacts and settings",
)

# Bad: Too broad/vague
BuildInfo = provider(
    fields = ["stuff", "more_stuff"],
)
```

### 2. Aspect Performance
```python
# Good: Minimal traversal
collect_headers = aspect(
    implementation = _collect_headers_impl,
    attr_aspects = ["deps"],  # Only traverse deps
)

# Bad: Excessive traversal
collect_all = aspect(
    implementation = _collect_all_impl,
    attr_aspects = ["*"],  # Traverses everything
)
```

### 3. Provider Propagation
```python
def _merge_providers(ctx):
    # Good: Explicit provider handling
    dep_infos = [dep[MyInfo] for dep in ctx.attr.deps
                if MyInfo in dep]
    
    # Bad: Assuming provider exists
    dep_infos = [dep[MyInfo] for dep in ctx.attr.deps]
```

## Key Takeaways

1. **Provider Usage**
   - Use providers for structured data sharing
   - Design providers with clear purpose
   - Handle missing providers gracefully

2. **Aspect Design**
   - Use aspects for cross-cutting concerns
   - Minimize dependency traversal
   - Cache results when possible

3. **Best Practices**
   - Keep providers focused
   - Design for performance
   - Handle errors gracefully

## Next Steps

- Learn about [Rules and Evaluation](/concepts/rules-and-evaluation)
- Explore [Remote Execution](/concepts/remote-execution)
- Understand [Build Performance](/best-practices/build-performance)
