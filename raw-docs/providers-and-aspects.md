# Bazel Providers: Information Sharing Between Rules

## Core Concepts

### What Are Providers?
- Structured data that rules pass to other rules
- Implements Bazel's dependency mechanism
- Enables rule composition and information flow
- Essential for creating custom build logic

### Provider Role
```python
# Provider declaration
FooInfo = provider(
    fields = ["sources", "includes", "compile_flags"],
    doc = "Information about Foo compilation",
)

# Rule implementation that creates provider
def _foo_library_impl(ctx):
    return [
        FooInfo(
            sources = ctx.files.srcs,
            includes = ctx.attr.includes,
            compile_flags = ctx.attr.copts,
        ),
        # Can return multiple providers
        DefaultInfo(files = depset(ctx.files.srcs)),
    ]
```

## Common Built-in Providers

### 1. DefaultInfo
- Most basic and common provider
- Present on all targets
- Defines runfiles and primary outputs

```python
def _impl(ctx):
    output = ctx.actions.declare_file(ctx.label.name + ".out")
    return [DefaultInfo(
        files = depset([output]),           # Primary outputs
        runfiles = ctx.runfiles(files = [output]),  # Runtime files
        executable = output,                # For executable targets
    )]
```

### 2. OutputGroupInfo
- Groups outputs by purpose
- Used for IDE integration and custom output sets
- Enables selective output building

```python
def _impl(ctx):
    lib = ctx.actions.declare_file("lib.so")
    debug = ctx.actions.declare_file("lib.debug")
    return [OutputGroupInfo(
        main = depset([lib]),
        debug_symbols = depset([debug]),
    )]
```

### 3. CcInfo
- C/C++ compilation information
- Includes headers, libraries, compilation flags
- Used for C/C++ dependency management

```python
def _impl(ctx):
    return [CcInfo(
        compilation_context = cc_common.create_compilation_context(
            headers = depset(ctx.files.hdrs),
            includes = depset(ctx.attr.includes),
            defines = depset(ctx.attr.defines),
        ),
        linking_context = cc_common.create_linking_context(...),
    )]
```

### 4. JavaInfo
- Java compilation and runtime information
- Manages classpath, source jars, and resources
- Essential for Java rule interop

```python
def _impl(ctx):
    return [JavaInfo(
        output_jar = ctx.outputs.jar,
        compile_jar = ctx.outputs.jar,
        source_jar = ctx.outputs.srcjar,
        deps = [dep[JavaInfo] for dep in ctx.attr.deps],
    )]
```

## Creating Custom Providers

### 1. Simple Information Provider
```python
# Define provider
MetadataInfo = provider(
    fields = ["version", "description", "tags"],
    doc = "Metadata about a target",
)

# Use in rule
def _metadata_impl(ctx):
    return [MetadataInfo(
        version = ctx.attr.version,
        description = ctx.attr.description,
        tags = ctx.attr.tags,
    )]

metadata_rule = rule(
    implementation = _metadata_impl,
    attrs = {
        "version": attr.string(mandatory = True),
        "description": attr.string(),
        "tags": attr.string_list(),
    },
)
```

### 2. Build Information Provider
```python
# Define provider for build information
BuildInfo = provider(
    fields = [
        "sources",
        "dependencies",
        "flags",
        "outputs",
    ],
)

def _custom_library_impl(ctx):
    # Collect dependency information
    deps_info = [dep[BuildInfo] for dep in ctx.attr.deps]
    
    # Accumulate information
    all_sources = depset(
        direct = ctx.files.srcs,
        transitive = [dep.sources for dep in deps_info],
    )
    
    # Return provider
    return [BuildInfo(
        sources = all_sources,
        dependencies = deps_info,
        flags = ctx.attr.flags,
        outputs = ctx.outputs.outs,
    )]
```

### 3. Composite Provider Pattern
```python
CompileInfo = provider(fields = ["headers", "includes"])
LinkInfo = provider(fields = ["libraries", "link_flags"])

def _compile_impl(ctx):
    # Create both providers
    compile_info = CompileInfo(
        headers = ctx.files.hdrs,
        includes = ctx.attr.includes,
    )
    link_info = LinkInfo(
        libraries = ctx.files.libs,
        link_flags = ctx.attr.linkopts,
    )
    
    # Return multiple providers
    return [compile_info, link_info]
```

## Provider Usage Patterns

### 1. Dependency Collection
```python
def _collect_deps_impl(ctx):
    # Gather transitive dependencies
    transitive_sources = depset(
        direct = ctx.files.srcs,
        transitive = [dep[MyInfo].sources for dep in ctx.attr.deps],
        order = "postorder",
    )
    
    return [MyInfo(
        sources = transitive_sources,
        direct_deps = ctx.attr.deps,
    )]
```

### 2. Provider Propagation
```python
def _propagate_impl(ctx):
    # Propagate provider from deps with additional info
    dep_info = ctx.attr.dep[MyInfo]
    return [MyInfo(
        sources = depset(
            direct = ctx.files.srcs,
            transitive = [dep_info.sources],
        ),
        metadata = {"parent": ctx.label} + dep_info.metadata,
    )]
```

### 3. Provider Transformation
```python
def _transform_impl(ctx):
    # Transform one provider type to another
    src_info = ctx.attr.src[SourceInfo]
    return [ProcessedInfo(
        files = process_files(src_info.files),
        metadata = enhance_metadata(src_info.metadata),
    )]
```

## Best Practices

### 1. Provider Design
```python
# Good: Clear field documentation
MyInfo = provider(
    fields = {
        "sources": "Depset of source files",
        "includes": "List of include directories",
        "flags": "Compilation flags",
    },
)

# Bad: Unclear structure
UnclearInfo = provider(fields = ["x", "y", "z"])
```

### 2. Provider Access
```python
def _impl(ctx):
    # Good: Handle missing providers
    info = getattr(ctx.attr.dep, "MyInfo", None)
    if info:
        process_info(info)
    
    # Bad: Assume provider exists
    info = ctx.attr.dep[MyInfo]  # May fail
```

### 3. Provider Composition
```python
# Good: Logical grouping
CompilationInfo = provider(
    fields = ["sources", "headers", "includes", "flags"],
)

# Bad: Too many separate providers
SourceInfo = provider(fields = ["sources"])
HeaderInfo = provider(fields = ["headers"])
IncludeInfo = provider(fields = ["includes"])
FlagInfo = provider(fields = ["flags"])
```

## Common Gotchas

1. **Depset Mutability**
   ```python
   # Bad: Modifying depset
   info.sources.extend(new_sources)
   
   # Good: Create new depset
   new_sources = depset(
       direct = ctx.files.srcs,
       transitive = [info.sources],
   )
   ```

2. **Provider Order**
   ```python
   # Order matters for some built-in rules
   return [
       DefaultInfo(...),  # Should usually be first
       MyInfo(...),
   ]
   ```

3. **Missing Providers**
   ```python
   # Remember to check for optional providers
   has_feature = ProvidersInfo in target
   if has_feature:
       use_feature(target[ProvidersInfo])
   ```

## Key Takeaways

1. **Provider Purpose**
   - Share information between rules
   - Enable rule composition
   - Structure build dependencies

2. **Design Principles**
   - Keep providers focused
   - Document fields clearly
   - Use logical grouping

3. **Usage Patterns**
   - Collect and propagate information
   - Transform between providers
   - Handle missing providers gracefully

4. **Performance**
   - Use depsets for large collections
   - Minimize provider count
   - Avoid unnecessary propagation