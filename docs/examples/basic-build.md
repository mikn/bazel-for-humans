# Basic Build Example

This example demonstrates a simple Bazel build setup with multiple languages and test targets. For more information about build configuration, see our [Getting Started guide](/getting-started/).

## Project Structure

```
basic-example/
├── WORKSPACE
├── BUILD
├── src/
│   ├── BUILD
│   ├── main.py
│   └── lib/
│       ├── BUILD
│       └── calculator.py
└── tests/
    ├── BUILD
    └── calculator_test.py
```

## WORKSPACE File

First, create a `WORKSPACE` file:

```python
workspace(name = "basic_example")

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Python rules
http_archive(
    name = "rules_python",
    sha256 = "9fcf91dbcc31fde6d1edb15f48b1421fa01092a8e30c1fb4dasf8d6d0307aff3",
    strip_prefix = "rules_python-0.8.0",
    url = "https://github.com/bazelbuild/rules_python/archive/refs/tags/0.8.0.tar.gz",
)

load("@rules_python//python:pip.bzl", "pip_parse")

pip_parse(
    name = "pip",
    requirements_lock = "//third_party:requirements.txt",
)

load("@pip//:requirements.bzl", "install_deps")
install_deps()
```

## Source Files

### src/main.py

```python
from lib.calculator import Calculator

def main():
    calc = Calculator()
    result = calc.add(5, 3)
    print(f"5 + 3 = {result}")

if __name__ == "__main__":
    main()
```

### src/lib/calculator.py

```python
class Calculator:
    def add(self, a: int, b: int) -> int:
        return a + b

    def subtract(self, a: int, b: int) -> int:
        return a - b

    def multiply(self, a: int, b: int) -> int:
        return a * b

    def divide(self, a: int, b: int) -> float:
        if b == 0:
            raise ValueError("Cannot divide by zero")
        return a / b
```

### tests/calculator_test.py

```python
import unittest
from src.lib.calculator import Calculator

class CalculatorTest(unittest.TestCase):
    def setUp(self):
        self.calc = Calculator()

    def test_add(self):
        self.assertEqual(self.calc.add(3, 5), 8)
        self.assertEqual(self.calc.add(-1, 1), 0)

    def test_subtract(self):
        self.assertEqual(self.calc.subtract(5, 3), 2)
        self.assertEqual(self.calc.subtract(1, 1), 0)

    def test_multiply(self):
        self.assertEqual(self.calc.multiply(3, 5), 15)
        self.assertEqual(self.calc.multiply(-2, 3), -6)

    def test_divide(self):
        self.assertEqual(self.calc.divide(6, 2), 3.0)
        with self.assertRaises(ValueError):
            self.calc.divide(1, 0)

if __name__ == "__main__":
    unittest.main()
```

## BUILD Files

### BUILD (root)

```python
package(default_visibility = ["//visibility:public"])
```

### src/BUILD

```python
py_binary(
    name = "calculator_app",
    srcs = ["main.py"],
    deps = ["//src/lib:calculator"],
)
```

### src/lib/BUILD

```python
py_library(
    name = "calculator",
    srcs = ["calculator.py"],
    visibility = ["//visibility:public"],
)
```

### tests/BUILD

```python
py_test(
    name = "calculator_test",
    srcs = ["calculator_test.py"],
    deps = ["//src/lib:calculator"],
)
```

## Building and Testing

Build the application:

```bash
bazel build //src:calculator_app
```

Run the tests:

```bash
bazel test //tests:calculator_test
```

Run the application:

```bash
bazel run //src:calculator_app
```

## Understanding the Build

Let's break down what's happening:

1. The `WORKSPACE` file sets up our Python build environment
2. The root `BUILD` file sets default visibility
3. The source `BUILD` files define our binary and library targets
4. The test `BUILD` file defines our test target

## Build Graph

The dependency graph looks like this:

```
calculator_app (//src:calculator_app)
└── calculator (//src/lib:calculator)

calculator_test (//tests:calculator_test)
└── calculator (//src/lib:calculator)
```

## Next Steps

- Learn about [dependencies](/getting-started/dependencies)
- Explore more complex [BUILD files](/getting-started/build-files)
- Understand [workspaces](/getting-started/workspaces) in detail
