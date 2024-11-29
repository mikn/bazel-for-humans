# Testing with Bazel

This guide explains how to write and run tests using Bazel's built-in test support.

## Test Rules

Bazel provides language-specific test rules:

```python
# C++ test
cc_test(
    name = "my_test",
    srcs = ["my_test.cc"],
    deps = [
        ":lib_under_test",
        "@com_google_googletest//:gtest_main",
    ],
)

# Python test
py_test(
    name = "my_test",
    srcs = ["my_test.py"],
    deps = [":lib_under_test"],
)

# Java test
java_test(
    name = "MyTest",
    srcs = ["MyTest.java"],
    test_class = "com.example.MyTest",
    deps = [":lib_under_test"],
)
```

## Test Suites

### Creating Test Suites

```python
test_suite(
    name = "all_tests",
    tests = [
        "//path/to:test1",
        "//path/to:test2",
    ],
)

# Tag-based suite
test_suite(
    name = "smoke_tests",
    tags = ["smoke"],
)

# Size-based suite
test_suite(
    name = "small_tests",
    tests = [":all_tests"],
    size = "small",
)
```

### Running Test Suites

```bash
# Run all tests in a suite
bazel test //path/to:all_tests

# Run smoke tests
bazel test //... --test_tag_filters=smoke

# Run small tests
bazel test //... --test_size_filters=small
```

## Test Filtering

### Tag-based Filtering

```bash
# Run only smoke tests
bazel test --test_tag_filters=smoke //...

# Exclude flaky tests
bazel test --test_tag_filters=-flaky //...

# Combine filters
bazel test --test_tag_filters=smoke,-flaky //...
```

### Size-based Filtering

```bash
# Run small tests
bazel test --test_size_filters=small //...

# Run medium and large tests
bazel test --test_size_filters=medium,large //...
```

### Pattern-based Filtering

```bash
# Run specific test patterns
bazel test //path/to/...  # All tests in package
bazel test //...          # All tests in workspace
bazel test //path/to:*    # All targets in package
```

## Test Infrastructure

### Test Data

```python
py_test(
    name = "data_test",
    srcs = ["data_test.py"],
    data = [
        "//data:test_files",
        "@external_repo//data:more_files",
    ],
)
```

### Test Environment

```python
py_test(
    name = "env_test",
    srcs = ["env_test.py"],
    env = {
        "CUSTOM_ENV": "value",
    },
)
```

### Test Size

```python
py_test(
    name = "big_test",
    srcs = ["big_test.py"],
    size = "large",  # small, medium, large, enormous
    timeout = "long",
)
```

## Test Execution

### Local Execution

```bash
# Run tests locally
bazel test --test_output=all //...

# Run with multiple cores
bazel test --local_test_jobs=4 //...

# Run until failure
bazel test --runs_per_test=100 --runs_per_test_detects_flakes //...
```

### Remote Execution

```bash
# Run tests remotely
bazel test \
  --remote_executor=grpc://executor.example.com \
  --remote_cache=grpc://cache.example.com \
  //...

# Configure timeouts
bazel test \
  --remote_timeout=3600 \
  --test_timeout=120,300,1200,3600 \
  //...
```

### Execution Strategy

```bash
# Force local execution
bazel test --strategy=TestRunner=local //...

# Force remote execution
bazel test --strategy=TestRunner=remote //...

# Hybrid execution
bazel test \
  --strategy=TestRunner=dynamic \
  --remote_executor=grpc://executor.example.com \
  //...
```

## Test Coverage

### Collecting Coverage

```bash
# Generate coverage report
bazel coverage //...

# Generate HTML report
bazel coverage --coverage_report_generator=@bazel_tools//tools/coverage:coverage_report_generator //...

# Filter coverage
bazel coverage --instrumentation_filter="//path/..." //...
```

### Coverage Configuration

```python
# Enable coverage for specific targets
cc_test(
    name = "my_test",
    srcs = ["my_test.cc"],
    deps = [":lib_under_test"],
    coverage = True,
)
```

## Test Logs and Outputs

### Test Outputs

```bash
# Show all test output
bazel test --test_output=all //...

# Show only failures
bazel test --test_output=errors //...

# Keep test outputs
bazel test --test_output=all --test_keep_going //...
```

### Test Logs

```bash
# Show test logs
bazel test --test_output=streamed //...

# Save test logs
bazel test --test_output=errors --test_summary=detailed //...

# Analyze test logs
bazel test --test_output=all --test_summary=terse //...
```

### Test Results

```bash
# Generate XML results
bazel test --test_output=xml //...

# Generate JSON results
bazel test --test_output=json //...

# Custom results directory
bazel test --test_output=all --test_results_dir=/path/to/results //...
```

## Test Sharding

### Running Tests in Parallel

```bash
# Run tests with 4 shards
bazel test --test_sharding_strategy=explicit --test_shards=4 //...

# Run tests with automatic sharding
bazel test --test_sharding_strategy=automatic //...
```

### Configuring Sharding

```python
py_test(
    name = "sharded_test",
    srcs = ["sharded_test.py"],
    shard_count = 4,
)
```

## Best Practices

1. **Test Organization**
   - Keep tests close to code
   - Use clear naming conventions
   - Group related tests
   - Create focused test suites

2. **Test Dependencies**
   - Minimize test dependencies
   - Use test-only dependencies
   - Isolate test data
   - Manage test environments

3. **Test Execution**
   - Use appropriate test sizes
   - Enable sharding for large tests
   - Configure timeouts properly
   - Use remote execution when beneficial

4. **Test Maintenance**
   - Clean test outputs regularly
   - Monitor test performance
   - Update test dependencies
   - Review test coverage

## Common Issues

### Test Failures
```bash
ERROR: Test failed
```
- Check test logs
- Use --test_output=all
- Verify test environment
- Check test dependencies

### Flaky Tests
```bash
ERROR: Test sometimes fails
```
- Use --runs_per_test
- Check for race conditions
- Verify test isolation
- Add debugging output

### Resource Issues
```bash
ERROR: Test timeout
```
- Adjust test size
- Configure timeouts
- Use test sharding
- Consider remote execution

## Related Documentation

- [BUILD Files](build-files.md)
- [Running Builds](running-builds.md)
- [Dependencies](dependencies.md)
- [Official Bazel Testing Documentation](https://bazel.build/reference/test-encyclopedia)

## Next Steps

- Learn about [Build Rules](build-rules.md) to create custom test rules
- Explore [Remote Execution](../concepts/remote-execution.md) for distributed testing
- Study [Dependencies](dependencies.md) to manage test dependencies 