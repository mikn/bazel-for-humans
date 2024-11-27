# Multi-language Projects

This guide demonstrates how to set up and manage a multi-language project using modern Bazel with Bzlmod.

## Project Overview

We'll create a web service with:
- Go backend
- Python data processing
- Protocol Buffers for API definitions

## Project Structure

```
multi-lang-project/
├── MODULE.bazel           # Module definition
├── BUILD.bazel           # Root build file
├── .bazelrc             # Bazel configuration
├── api/
│   ├── BUILD.bazel
│   └── service.proto    # Proto definitions
├── backend/
│   ├── BUILD.bazel
│   ├── main.go         # Go service
│   └── handlers/
│       ├── BUILD.bazel
│       └── handlers.go
└── processor/
    ├── BUILD.bazel
    └── process.py      # Python processor
```

## Setup

### Module Configuration

```python
# MODULE.bazel
module(
    name = "multi_lang_demo",
    version = "0.1.0",
)

# Language rules
bazel_dep(name = "rules_go", version = "0.39.0")
bazel_dep(name = "rules_python", version = "0.5.0")
bazel_dep(name = "rules_proto", version = "4.0.0")

# Go setup
go = use_extension("@rules_go//go:extensions.bzl", "go")
go.toolchain(version = "1.19")

# Python setup
python = use_extension("@rules_python//python:extensions.bzl", "python")
python.toolchain(python_version = "3.9")

# Protocol Buffers
proto = use_extension("@rules_proto//proto:repositories.bzl", "proto")
proto.dependencies()
```

### Proto Definitions

```protobuf
// api/service.proto
syntax = "proto3";

package api;

option go_package = "example.com/multi_lang_demo/api";

message DataRequest {
    string input = 1;
}

message DataResponse {
    string processed = 1;
}

service DataProcessor {
    rpc Process(DataRequest) returns (DataResponse);
}
```

```python
# api/BUILD.bazel
load("@rules_proto//proto:defs.bzl", "proto_library")
load("@rules_go//proto:def.bzl", "go_proto_library")
load("@rules_python//python:proto.bzl", "py_proto_library")

proto_library(
    name = "service_proto",
    srcs = ["service.proto"],
    visibility = ["//visibility:public"],
)

go_proto_library(
    name = "service_go_proto",
    importpath = "example.com/multi_lang_demo/api",
    proto = ":service_proto",
    visibility = ["//visibility:public"],
)

py_proto_library(
    name = "service_py_proto",
    deps = [":service_proto"],
    visibility = ["//visibility:public"],
)
```

### Python Processor

```python
# processor/process.py
from api import service_pb2
from api import service_pb2_grpc

def process_data(input_str: str) -> str:
    return f"Processed: {input_str.upper()}"

class Processor(service_pb2_grpc.DataProcessorServicer):
    def Process(self, request, context):
        processed = process_data(request.input)
        return service_pb2.DataResponse(processed=processed)
```

```python
# processor/BUILD.bazel
load("@rules_python//python:defs.bzl", "py_library")

py_library(
    name = "processor",
    srcs = ["process.py"],
    deps = ["//api:service_py_proto"],
    visibility = ["//visibility:public"],
)
```

### Go Backend

```go
// backend/main.go
package main

import (
    "context"
    "log"
    "net"

    "google.golang.org/grpc"
    pb "example.com/multi_lang_demo/api"
    "example.com/multi_lang_demo/backend/handlers"
)

func main() {
    lis, err := net.Listen("tcp", ":50051")
    if err != nil {
        log.Fatalf("failed to listen: %v", err)
    }
    s := grpc.NewServer()
    pb.RegisterDataProcessorServer(s, handlers.NewServer())
    log.Printf("server listening at %v", lis.Addr())
    if err := s.Serve(lis); err != nil {
        log.Fatalf("failed to serve: %v", err)
    }
}
```

```python
# backend/BUILD.bazel
load("@rules_go//go:def.bzl", "go_binary", "go_library")

go_binary(
    name = "server",
    embed = [":backend_lib"],
    visibility = ["//visibility:public"],
)

go_library(
    name = "backend_lib",
    srcs = ["main.go"],
    importpath = "example.com/multi_lang_demo/backend",
    deps = [
        "//api:service_go_proto",
        "//backend/handlers",
        "@org_golang_google_grpc//:go_default_library",
    ],
)
```

## Building and Running

Build all targets:
```bash
bazel build //...
```

Run the server:
```bash
bazel run //backend:server
```

## Testing

Add tests for each component:

```python
# processor/BUILD.bazel
py_test(
    name = "processor_test",
    srcs = ["process_test.py"],
    deps = [":processor"],
)
```

```go
# backend/BUILD.bazel
go_test(
    name = "backend_test",
    srcs = ["main_test.go"],
    embed = [":backend_lib"],
)
```

Run all tests:
```bash
bazel test //...
```

## Next Steps

1. Learn about [External Dependencies](/examples/external-dependencies)
2. Explore [Build Performance](/best-practices/build-performance)
3. Understand [Remote Execution](/concepts/remote-execution)
