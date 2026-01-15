---
{"dg-publish":true,"dg-path":"03 Racket与函数式编程/如何使用 Noise 开发 macOS 和 iOS 应用.md","permalink":"/03 Racket与函数式编程/如何使用 Noise 开发 macOS 和 iOS 应用/"}
---

#lisp #racket 

## 什么是 Noise

Noise 是一个 Swift 包装器，围绕 Racket CS 运行时，旨在简化将 Racket 嵌入到 Swift 应用程序中。它允许你在 macOS 和 iOS 应用中使用 Racket 语言的强大功能，同时保持与 Swift 代码的无缝集成。

## 支持的平台

- macOS 13+
- iOS 16+

## 核心组件

Noise 包含三个主要模块：

1. **Noise** - 核心模块，提供与 Racket 运行时的基本交互
2. **NoiseBackend** - 构建在 Noise 之上，提供后台线程运行的 Racket 服务器
3. **NoiseSerde** - 提供 Racket 和 Swift 之间的数据序列化/反序列化

## 环境设置

### 1. 克隆仓库

```bash
git clone https://github.com/Bogdanp/Noise.git
cd Noise
```

### 2. 安装 Git LFS

Noise 使用 Git LFS 存储二进制文件，所以你需要安装 Git LFS：

```bash
# 在 macOS 上
brew install git-lfs
git lfs install

# 拉取 LFS 文件
git lfs pull
```

### 3. 安装 Racket 包

```bash
raco pkg install Racket/noise-serde{-lib,-doc}/
```

### 4. 构建项目

```bash
make
```

## 编译流程

### 1. 库文件管理

Noise 中的共享库和引导文件必须与你用来编译 Racket 代码的 Racket 版本匹配。如果版本不匹配，你需要从源代码构建 Racket 并运行：

```bash
./Bin/copy-libs.sh <target> /path/to/src/racket
```

其中 `<target>` 取决于你的目标 OS 和架构：

| OS            | Architecture  | 参数                  |
|---------------|---------------|----------------------|
| macOS         | x86_64        | `x86_64-macos`        |
| macOS         | arm64/aarch64 | `arm64-macos`         |
| iOS           | arm64/aarch64 | `arm64-ios`           |
| iOS Simulator | arm64/aarch64 | `arm64-iphonesimulator` |

### 2. iOS 特定配置

对于 iOS，你需要使用以下标志配置 Racket 以生成可移植的字节码构建：

```bash
configure \
  --host=aarch64-apple-darwin \
  --enable-ios=iPhoneOS \
  --enable-pb \
  --enable-racket=auto \
  --enable-libffi
```

对于 iPhone Simulator，将 `--enable-ios` 标志的值更改为 `iPhoneSimulator`。

构建后，你需要将相关的 `libffi` 归档合并到生成的 `libracketcs.a` 中：

```bash
libtool -s \
  -o racket/lib/libracketcs1.a \
  racket/lib/libracketcs.a \
  /path/to/libffi.a \
  && mv racket/libracketcs{1,}.a
```

## 基本用法

### 1. 创建 Racket 实例

```swift
import Noise

// 创建 Racket 实例
// execPath 需要指向一个文件，用于帮助确定运行时路径
let cookiePath = Bundle.main.resourceURL!
  .appendingPathComponent("cookie")
  .path

let racket = Racket(execPath: cookiePath)
```

### 2. 执行 Racket 代码

```swift
racket.bracket {
  // 加载编译后的 Racket 代码
  racket.load(zo: Bundle.main.url(forResource: "mods", withExtension: "zo")!)
  
  // 引用模块和函数
  let mod = Val.cons(Val.symbol("quote"), Val.cons(Val.symbol("fib"), Val.null))
  let fib = racket.require(Val.symbol("fib"), from: mod).car()!
  
  // 调用函数
  let result = fib.apply(Val.cons(Val.fixnum(8), Val.null))!.car()!
  print("Fibonacci(8) = \(result.fixnum()!)") // 输出: Fibonacci(8) = 21
}
```

### 3. 处理不同类型的数据

```swift
// 处理字符串
let strResult = proc.apply(Val.cons(Val.string("hello"), Val.null))!
let stringValue = strResult.car()?.bytestring()!

// 处理字节向量
let byteResult = proc.apply(Val.null)!
let bytevector = byteResult.car()!.bytevector()!.map({ UInt8(bitPattern: $0) })

// 处理数字
let numResult = proc.apply(Val.cons(Val.fixnum(42), Val.null))!
let numberValue = numResult.car()!.fixnum()!
```

## 使用 NoiseBackend

NoiseBackend 提供了一个客户端-服务器实现，其中 Racket 服务器在后台线程中连续运行，Swift 客户端通过管道与它通信。

```swift
import NoiseBackend

// 创建后端
let backend = Backend()

// 发送请求
backend.send {
  // 这里的代码在 Racket 服务器线程中执行
  (require "my-module.rkt")
  (my-function arg1 arg2)
} then: {
  result in
  // 处理结果
  print("Result: \(result)")
}
```

## 使用 NoiseSerde

NoiseSerde 提供了一种方法来定义可以在 Racket 和 Swift 之间自动共享（通过序列化和反序列化）的数据结构。

### 在 Racket 中定义数据结构

```racket
#lang racket
(require noise/serde)

(serde struct person ([name : string] [age : fixnum]))
```

### 在 Swift 中使用

```swift
import NoiseSerde

// 使用从 Racket 生成的结构体
let person = Person(name: "Alice", age: 30)

// 序列化和反序列化
let data = try! person.serialize()
let deserializedPerson = try! Person.deserialize(from: data)
```

## 最佳实践

1. **路径管理**：确保正确设置 `execPath`，使用 "cookie" 文件来帮助确定运行时路径。
2. **错误处理**：始终使用 `bracket` 方法执行 Racket 代码，确保资源正确释放。
3. **性能考虑**：对于频繁调用的 Racket 函数，考虑使用 NoiseBackend 以避免重复加载和初始化。
4. **代码组织**：将 Racket 代码编译为 `.zo` 文件，然后在 Swift 中加载，而不是在运行时解释源代码。
5. **内存管理**：注意 Racket 对象的生命周期，避免内存泄漏。

## 常见问题

### 1. 运行时路径问题

**症状**：无法找到引导文件或模块。

**解决方案**：确保正确设置 `execPath`，并确保引导文件位于正确的位置。

### 2. 版本不匹配

**症状**：运行时错误或崩溃。

**解决方案**：确保 Racket 版本与库文件版本匹配，或使用 `copy-libs.sh` 脚本复制正确的库文件。

### 3. iOS 构建问题

**症状**：iOS 构建失败或运行时错误。

**解决方案**：确保使用正确的配置标志构建 Racket，并正确合并 `libffi` 归档。

## 示例项目

查看 [NoiseBackendExample](https://github.com/Bogdanp/NoiseBackendExample) 了解如何使用 Noise 构建完整的应用程序。

## 总结

Noise 为 macOS 和 iOS 开发者提供了一种强大的方式，可以在他们的应用中集成 Racket 语言的功能。通过遵循本文档中的步骤，你可以快速开始使用 Noise 开发你的应用程序，利用 Racket 的强大功能同时保持与 Swift 代码的无缝集成。

无论是构建复杂的计算逻辑、处理数据、还是实现领域特定语言，Noise 都为你提供了一种优雅的方式来将 Racket 的能力带入你的 macOS 和 iOS 应用中。
