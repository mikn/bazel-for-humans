# Testing and CI/CD Best Practices

This guide covers best practices for testing and continuous integration with Bazel.

## Key Principles

1. **Test Isolation**
   - Each test should be hermetic
   - Tests should not depend on external services
   - Test data should be versioned with code

2. **Test Organization**
   - Group related tests
   - Use appropriate test sizes
   - Balance test granularity

3. **CI/CD Integration**
   - Leverage remote caching
   - Use build stamping
   - Configure test sharding

## Test Structure

### 1. Test Sizes

Organize tests by size:

```python
# Small tests - unit tests, no external deps
go_test(
    name = "util_test",
    size = "small",
    srcs = ["util_test.go"],
    deps = [":util"],
)

# Medium tests - integration tests, local deps
go_test(
    name = "service_test",
    size = "medium",
    srcs = ["service_test.go"],
    deps = [
        ":service",
        "//testing/testdata",
    ],
)

# Large tests - e2e tests, external deps
go_test(
    name = "e2e_test",
    size = "large",
    srcs = ["e2e_test.go"],
    tags = ["e2e"],
    deps = ["//..."],
)
```

### 2. Test Data

Manage test data properly:

```python
# Package test data
filegroup(
    name = "testdata",
    srcs = glob(["testdata/**"]),
    visibility = ["//visibility:public"],
)

# Use in tests
rust_test(
    name = "parser_test",
    srcs = ["parser_test.rs"],
    data = [":testdata"],
)
```

### 3. Test Tags

Use tags for test categorization:

```python
# Integration test requiring database
go_test(
    name = "db_test",
    size = "medium",
    srcs = ["db_test.go"],
    tags = [
        "requires-db",
        "integration",
    ],
)

# End-to-end test
go_test(
    name = "e2e_test",
    size = "large",
    srcs = ["e2e_test.go"],
    tags = [
        "e2e",
        "manual",
    ],
)
```

## CI Configuration

### 1. Basic CI Setup

```yaml
# .github/workflows/bazel.yml
name: Bazel Build and Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Mount bazel cache
        uses: actions/cache@v3
        with:
          path: "~/.cache/bazel"
          key: bazel-${{ runner.os }}-${{ hashFiles('MODULE.bazel') }}
      
      - name: Run tests
        run: |
          bazel test //... \
            --config=ci \
            --test_output=errors
```

### 2. Test Sharding

Configure test sharding for large test suites:

```bash
# .bazelrc
build:ci --test_sharding_strategy=explicit
build:ci --test_env=SPLIT_SIZE=10

# Run with sharding
bazel test //... --test_sharding_strategy=explicit --runs_per_test=10
```

### 3. Remote Caching

Set up remote caching for CI:

```bash
# .bazelrc
build:ci --remote_cache=grpc://remote.cache
build:ci --remote_upload_local_results
build:ci --remote_download_minimal
```

## Common Patterns

### 1. Test Helpers

Create reusable test infrastructure:

```python
# testing/testutil/BUILD.bazel
go_library(
    name = "testutil",
    srcs = ["testutil.go"],
    visibility = ["//visibility:public"],
    deps = [
        "@com_github_stretchr_testify//assert",
        "//testing/fixtures",
    ],
)
```

### 2. Mock Generation

Generate mocks consistently:

```python
# Generate mocks for interfaces
go_mockgen(
    name = "mock_service",
    interfaces = ["Service"],
    library = "//internal/service",
    package = "mock_service",
)
```

### 3. Integration Tests

Handle integration test dependencies:

```python
# testing/integration/BUILD.bazel
container_image(
    name = "test_db",
    base = "@postgres_base//image",
    env = {
        "POSTGRES_DB": "test",
        "POSTGRES_PASSWORD": "test",
    },
)

go_test(
    name = "integration_test",
    srcs = ["integration_test.go"],
    deps = [":test_db"],
    tags = ["requires-db"],
)
```

## Best Practices

1. **Test Organization**
   - Use appropriate test sizes
   - Group related tests together
   - Maintain test data alongside tests

2. **CI Configuration**
   - Use build stamping for versioning
   - Configure test sharding
   - Set up remote caching

3. **Test Dependencies**
   - Make tests hermetic
   - Version test data
   - Use mock generation

4. **Performance**
   - Configure test sharding
   - Use remote caching
   - Run tests in parallel

## Common Issues

### 1. Flaky Tests

Handle flaky tests:

```python
# Mark known flaky tests
go_test(
    name = "flaky_test",
    srcs = ["flaky_test.go"],
    flaky = True,
    # Consider fixing instead of marking flaky
)
```

### 2. Resource Constraints

Handle resource-intensive tests:

```python
# Mark tests needing resources
go_test(
    name = "memory_test",
    srcs = ["memory_test.go"],
    tags = ["requires-ram-8g"],
)
```

### 3. External Dependencies

Handle tests with external dependencies:

```python
# Skip tests requiring external services
go_test(
    name = "external_test",
    srcs = ["external_test.go"],
    tags = [
        "external",
        "manual",
    ],
)
```

## Next Steps

1. Learn about [Build Performance](build-performance.md)
2. Study [Container Images](/examples/container-images)
3. Explore [Cross Platform Builds](/examples/cross-platform) 