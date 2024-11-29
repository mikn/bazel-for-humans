# Multi-language Projects

This example demonstrates how to build cross-platform microservices using multiple languages with Bazel:

1. **Go Service**: HTTP API gateway
2. **Rust Service**: Core calculation service
3. **Protocol Buffers**: Shared API definitions
4. **Cross-Platform**: Linux AMD64 and macOS ARM64 support

## Project Structure

```
multi-lang-project/
├── MODULE.bazel           # Module definition
├── BUILD.bazel           # Root build file
├── .bazelrc             # Bazel configuration
├── .bazelversion        # Pinned Bazel version
├── proto/               # Shared protos
│   └── calculator/
│       └── v1/
│           ├── BUILD.bazel
│           └── service.proto
├── gateway/             # Go API gateway
│   ├── cmd/
│   │   └── server/
│   │       ├── BUILD.bazel
│   │       └── main.go
│   └── internal/
│       └── service/
│           ├── BUILD.bazel
│           └── service.go
└── calculator/          # Rust calculation service
    ├── BUILD.bazel
    └── src/
        ├── main.rs     # gRPC server
        └── calculator.rs
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
build:linux_amd64 --cpu=k8

# macOS ARM64 settings
build:macos_arm64 --platforms=@rules_rust//rust/platform:darwin_arm64
build:macos_arm64 --cpu=darwin_arm64
```

## Module Configuration

Create the `MODULE.bazel` file:
```python
module(
    name = "multi_lang_demo",
    version = "0.1.0",
)

# Language rules
bazel_dep(name = "rules_go", version = "0.46.0")
bazel_dep(name = "rules_rust", version = "0.40.0")
bazel_dep(name = "rules_proto", version = "6.0.0")
bazel_dep(name = "gazelle", version = "0.35.0")

# Configure Go
go_sdk = use_extension("@rules_go//go:extension.bzl", "go_sdk")
go_sdk.download(
    version = "1.21.5",
    goarch = ["amd64", "arm64"],
    goos = ["linux", "darwin"],
)

# Configure Rust
rust = use_extension("@rules_rust//rust:extensions.bzl", "rust")
rust.toolchain(
    versions = ["1.75.0"],
    edition = "2021",
    dev_components = True,
    targets = [
        "x86_64-unknown-linux-gnu",
        "aarch64-apple-darwin",
    ],
)
```

## Proto Definitions

Create `proto/calculator/v1/service.proto`:
```protobuf
syntax = "proto3";

package calculator.v1;

option go_package = "multi-lang-demo/proto/calculator/v1;calculatorv1";
option rust_package = "calculator_v1";

message CalculateRequest {
    double x = 1;
    string operation = 2;
    double y = 3;
}

message CalculateResponse {
    double result = 1;
}

service Calculator {
    rpc Calculate(CalculateRequest) returns (CalculateResponse);
}
```

Let Gazelle generate the proto BUILD files:
```bash
bazel run //:gazelle
```

## Rust Calculator Service

Create `calculator/src/calculator.rs`:
```rust
#[derive(Debug)]
pub struct Calculator;

impl Calculator {
    pub fn new() -> Self {
        Calculator
    }

    pub fn calculate(&self, x: f64, operation: &str, y: f64) -> Result<f64, String> {
        match operation {
            "add" => Ok(x + y),
            "subtract" => Ok(x - y),
            "multiply" => Ok(x * y),
            "divide" => {
                if y == 0.0 {
                    Err("division by zero".to_string())
                } else {
                    Ok(x / y)
                }
            }
            _ => Err(format!("unknown operation: {}", operation)),
        }
    }
}
```

Create `calculator/src/main.rs`:
```rust
use tonic::{transport::Server, Request, Response, Status};
use calculator_v1::calculator_server::{Calculator as CalculatorService, CalculatorServer};
use calculator_v1::{CalculateRequest, CalculateResponse};
use std::env;

mod calculator;
use calculator::Calculator;

#[derive(Debug)]
pub struct CalculatorImpl {
    calculator: Calculator,
}

#[tonic::async_trait]
impl CalculatorService for CalculatorImpl {
    async fn calculate(
        &self,
        request: Request<CalculateRequest>,
    ) -> Result<Response<CalculateResponse>, Status> {
        let req = request.into_inner();
        match self.calculator.calculate(req.x, &req.operation, req.y) {
            Ok(result) => Ok(Response::new(CalculateResponse { result })),
            Err(e) => Err(Status::invalid_argument(e)),
        }
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let port = env::var("PORT").unwrap_or_else(|_| "50051".to_string());
    let addr = format!("0.0.0.0:{}", port).parse()?;

    println!("Calculator service listening on {}", addr);

    let calculator = CalculatorImpl {
        calculator: Calculator::new(),
    };

    Server::builder()
        .add_service(CalculatorServer::new(calculator))
        .serve(addr)
        .await?;

    Ok(())
}
```

Create `calculator/BUILD.bazel`:
```python
load("@rules_rust//rust:defs.bzl", "rust_binary", "rust_library")

rust_library(
    name = "calculator_lib",
    srcs = ["src/calculator.rs"],
    edition = "2021",
)

rust_binary(
    name = "calculator",
    srcs = ["src/main.rs"],
    edition = "2021",
    deps = [
        ":calculator_lib",
        "//proto/calculator/v1:calculator_rust_proto",
        "@crates//:tonic",
        "@crates//:tokio",
    ],
)
```

## Go API Gateway

Create `gateway/cmd/server/main.go`:
```go
package main

import (
    "log"
    "net/http"
    "os"
    "runtime"

    "multi-lang-demo/gateway/internal/service"
)

func main() {
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    calcAddr := os.Getenv("CALCULATOR_ADDR")
    if calcAddr == "" {
        calcAddr = "localhost:50051"
    }

    gateway, err := service.NewGateway(calcAddr)
    if err != nil {
        log.Fatalf("failed to create gateway: %v", err)
    }

    http.HandleFunc("/calculate", gateway.HandleCalculate)

    log.Printf("Gateway starting on :%s (%s/%s)", 
        port, 
        runtime.GOOS, 
        runtime.GOARCH,
    )

    if err := http.ListenAndServe(":"+port, nil); err != nil {
        log.Fatalf("failed to serve: %v", err)
    }
}
```

Create `gateway/internal/service/service.go`:
```go
package service

import (
    "context"
    "encoding/json"
    "net/http"
    pb "multi-lang-demo/proto/calculator/v1"
    "google.golang.org/grpc"
    "google.golang.org/grpc/credentials/insecure"
)

type Gateway struct {
    client pb.CalculatorClient
}

func NewGateway(calcAddr string) (*Gateway, error) {
    conn, err := grpc.Dial(calcAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
    if err != nil {
        return nil, err
    }

    return &Gateway{
        client: pb.NewCalculatorClient(conn),
    }, nil
}

type CalculateRequest struct {
    X         float64 `json:"x"`
    Operation string  `json:"operation"`
    Y         float64 `json:"y"`
}

func (g *Gateway) HandleCalculate(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
        return
    }

    var req CalculateRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    resp, err := g.client.Calculate(context.Background(), &pb.CalculateRequest{
        X:         req.X,
        Operation: req.Operation,
        Y:         req.Y,
    })
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(map[string]float64{
        "result": resp.Result,
    })
}
```

Let Gazelle generate the Go BUILD files:
```bash
bazel run //:gazelle
```

## Building and Running

Start the calculator service:
```bash
# Build and run for Linux AMD64
bazel run --config=linux_amd64 //calculator

# Or for macOS ARM64
bazel run --config=macos_arm64 //calculator
```

In another terminal, start the gateway:
```bash
# Build and run for Linux AMD64
bazel run --config=linux_amd64 //gateway/cmd/server

# Or for macOS ARM64
bazel run --config=macos_arm64 //gateway/cmd/server
```

Test the services:
```bash
# Test addition
curl -X POST http://localhost:8080/calculate \
    -H "Content-Type: application/json" \
    -d '{"x": 5, "operation": "add", "y": 3}'

# Test division
curl -X POST http://localhost:8080/calculate \
    -H "Content-Type: application/json" \
    -d '{"x": 10, "operation": "divide", "y": 2}'
```

## Understanding Cross-Platform Builds

When you build this project, Bazel:

1. **Selects Correct Toolchains**
   - Uses platform-specific Go compiler
   - Uses platform-specific Rust compiler
   - Configures correct target triples

2. **Manages Dependencies**
   - Downloads platform-specific dependencies
   - Builds native code for target platform
   - Caches platform-specific artifacts

3. **Optimizes Builds**
   - Reuses common intermediate artifacts
   - Only rebuilds platform-specific parts
   - Maintains separate caches per platform


