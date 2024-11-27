# Bazel Glossary and Concept Relationships

## Core Building Blocks and Their Relationships

### Workspace (Your Build Root)
- **Definition**: The root directory containing all your source code and build files
- **Marked by**: `WORKSPACE`, `WORKSPACE.bazel`, or `MODULE.bazel` file
- **Purpose**: Defines the boundary of what you want to build
- **Contains**:
  - Your source code
  - BUILD files
  - Configuration files
- **Key concept**: Everything in Bazel starts from a workspace

### Rulesets (Build Logic)
- **Definition**: Collections of rules and macros that define how to build code
- **Examples**: `rules_go`, `rules_python`, `rules_java`
- **Provided by**: External maintainers
- **Purpose**: Abstract away build complexity
- **Characteristics**:
  - No source code, only build logic
  - Reusable across projects
  - Versioned and distributed
- **Relationship to Workspace**: Imported and used to build your code

### Repositories (External Code)
- **Definition**: Units of external code or binaries
- **Types**:
  - Source repositories (Git)
  - Binary archives
  - Local directories
- **Characteristics**:
  - Hermetic (isolated)
  - Immutable once fetched
  - Have their own root
- **Relationship to Workspace**: Provide external dependencies

### Modules (Modern Dependency Management)
- **Definition**: Bzlmod system for managing dependencies
- **Purpose**: Separate build logic from dependency management
- **Marked by**: `MODULE.bazel` file
- **Benefits**:
  - Clear separation of concerns
  - Version resolution
  - Dependency graph management
- **Relationship to Workspace**: Modernizes how workspaces handle dependencies

## Build Concepts

### Rules
1. **Repository Rules**
   - **Purpose**: Fetch and create external repositories
   - **When**: Loading phase
   - **Examples**: `http_archive`, `git_repository`
   - **Context**: Repository context

2. **Build Rules**
   - **Purpose**: Define how to produce outputs
   - **When**: Analysis phase
   - **Examples**: `cc_binary`, `java_library`
   - **Context**: Rule context

### Contexts (Different Phases of Build)
1. **Repository Context**
   - Available during repository rule execution
   - Methods for external resource management
   - File system operations

2. **Module Context**
   - Available during module extension execution
   - Dependency management operations
   - Build setting configuration

3. **Rule Context**
   - Available during build rule execution
   - Access to dependencies and configurations
   - Output management

### Targets
1. **Build Targets**
   - **Definition**: Things that can be built
   - **Identified by**: Labels (//path/to:target)
   - **Types**:
     - Files
     - Rules
     - Package groups

2. **Test Targets**
   - Special build targets for testing
   - Created by `*_test` rules
   - Support size specifications

### Output Files
- **Definition**: Files produced by build rules
- **Types**:
  - Source files (existing)
  - Generated files (created during build)
  - Derived files (from other files)
- **Key concept**: Must be explicitly declared

## Build Process

### Phases
1. **Loading Phase**
   - Evaluates BUILD files
   - Creates target graph
   - Executes repository rules

2. **Analysis Phase**
   - Creates action graph
   - Evaluates rule implementations
   - Determines what to build

3. **Execution Phase**
   - Executes actions
   - Produces outputs
   - Runs tests

### Build vs Run
- **Build**: Creates artifacts
- **Run**: Builds and executes
- **Different**:
  - Contexts
  - Permissions
  - Caching behavior

## Advanced Concepts

### Aspects
- **Definition**: Extensions to existing rules
- **Purpose**: Compute derived artifacts
- **Uses**:
  - Static analysis
  - Documentation generation
  - Build modifications

### Module Extensions
- **Definition**: Custom module functionality
- **Purpose**: Extend dependency management
- **Uses**:
  - Custom toolchain registration
  - Complex dependency resolution

## Common Patterns and Best Practices

### Project Structure
```
my_project/
├── MODULE.bazel        # Modern dependency management
├── BUILD.bazel         # Root build file
├── src/                # Source code
│   └── BUILD.bazel     # Source build rules
├── tests/              # Tests
│   └── BUILD.bazel     # Test rules
└── tools/              # Build tools
    └── BUILD.bazel     # Tool rules
```

### Dependency Management
1. **Modern Approach (Preferred)**
   ```python
   module(name = "my_project")
   bazel_dep(name = "rules_go")
   ```

2. **Legacy Approach**
   ```python
   workspace(name = "my_project")
   http_archive(name = "rules_go")
   ```

### Key Relationships Map
```
Workspace
├── Uses Rulesets (for build logic)
├── Contains BUILD files (define targets)
├── References Repositories (external code)
└── Managed by Modules (dependency system)

Rules
├── Repository Rules (fetch code)
└── Build Rules (build code)
    └── Use Contexts (access build info)
        └── Produce Output Files

Targets
├── Build Targets (things to build)
└── Test Targets (things to test)
    └── Modified by Aspects (extensions)
```

## Beginner Focus Areas

1. **Start With**:
   - Understanding workspaces
   - Basic BUILD files
   - Simple targets

2. **Next Steps**:
   - Common rules usage
   - Dependencies
   - Testing

3. **Advanced Topics**:
   - Custom rules
   - Aspects
   - Module extensions

## Common Gotchas
1. Output files must be declared
2. BUILD files need visibility declarations
3. Dependencies must be explicit
4. Hermeticity is enforced
5. Toolchains need configuration

This glossary and concept map focuses on the relationships between different Bazel concepts, which is crucial for beginners to understand how everything fits together. It can serve as a foundation for creating a beginner's guide that introduces concepts in a logical order while maintaining awareness of their interconnections.