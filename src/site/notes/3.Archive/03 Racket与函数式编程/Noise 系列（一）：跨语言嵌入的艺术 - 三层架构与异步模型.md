---
{"dg-publish":true,"dg-path":"03 Racket与函数式编程/Noise 系列（一）：跨语言嵌入的艺术 - 三层架构与异步模型.md","permalink":"/03 Racket与函数式编程/Noise 系列（一）：跨语言嵌入的艺术 - 三层架构与异步模型/"}
---

#lisp/racket  #gui/noise 

你是否想过在你的 iOS 或 macOS 应用中嵌入一个像 Racket 这样的 Lisp 运行时？或者，你是否在使用其他语言（如 Python, Rust, Go）时，想要引入某种脚本语言的能力，却苦于不知道如何优雅地实现跨语言交互？

[Noise](https://github.com/Bogdanp/Noise) 项目提供了一个非常精彩的范例。它不仅仅是一个简单的 FFI 绑定，更是一套完整的、类型安全的、支持异步并发的**嵌入式后端架构**。

本文将带你深入剖析 Noise 的源码，揭示其底层的实现机制。读完本文，你将掌握一套通用的跨语言嵌入模式，并能够将其应用到你熟悉的任何语言中。

## 核心架构概览

Noise 的架构可以概括为三层模型：

1. **Runtime Embedding (C Layer)**: 通过 C 接口启动和管理 Racket 运行时。
2. **Data Bridge (Serialization Layer)**: 定义一套二进制协议，让 Swift 和 Racket 互相"听得懂"。
3. **Execution Model (IPC/Actor Layer)**: 不直接从 Swift 调用 Racket 函数，而是建立一个 Client-Server 模型，通过管道（Pipes）通信。

让我们逐层拆解。

## 第一层：启动运行时 (The C Bridge)

任何嵌入式项目的第一步都是初始化。Noise 使用的是 **Racket CS (Chez Scheme)** 版本。在 Sources/Noise/Racket.swift 中，我们可以看到核心的初始化代码。Racket CS 的启动需要特定的"boot files"（引导文件），这些文件包含了运行时的基础逻辑。

```swift
// 实际实现
public init(execPath: String = "racket") {
  var args = racket_boot_arguments_t()
  args.exec_file = execPath.utf8CString.cstring()
  args.boot1_path = NoiseBoot.petiteURL.path.utf8CString.cstring()
  args.boot2_path = NoiseBoot.schemeURL.path.utf8CString.cstring()
  args.boot3_path = NoiseBoot.racketURL.path.utf8CString.cstring()
  racket_boot(&args)
  racket_deactivate_thread()
  args.exec_file.deallocate()
  args.boot1_path.deallocate()
  args.boot2_path.deallocate()
  args.boot3_path.deallocate()
}
```

**关键点：**

- **资源管理**：你需要将这些 `.boot` 文件打包进你的应用资源包中，并在运行时获取它们的路径。
- **线程模型**：`racket_boot` 运行的线程会成为 Racket 的 "Main Place"。后续的所有操作如果不加以控制，都会在这个线程上发生。
- **线程安全**：Noise 提供了 `bracket`、`activate` 和 `deactivate` 方法来管理线程状态，避免与垃圾回收器竞争。

**给其他语言的启示：** 如果你的目标语言（如 Lua, Python, Guile）有 C API，第一步永远是构建一个最小的 C 包装器来处理 `init`/`boot`。

## 第二层：数据桥梁 (The Serialization War)

大多数 FFI 项目死于复杂的数据转换。手动将 Swift 的 `String` 转换为 C 的 `char*`，再转换为 Racket 的 `string`，不仅繁琐而且容易内存泄漏。

Noise 选择了一条更聪明的路：**自定义二进制序列化协议 (NoiseSerde)**。

它不依赖 JSON（太慢且不支持复杂类型），而是定义了一套紧凑的格式：

- **Varint**: 可变长度整数，节省空间。
- **Length-Prefixed Bytes**: 字符串和二进制数据先写长度，再写内容。
- **Tagging**: Enum 和 Optional 使用 tag 字节前缀。

**实现细节：**

- Swift 端 (Sources/NoiseSerde/Serde.swift): 实现了 `Readable` 和 `Writable` 协议，直接操作 `Data` 缓冲区。
- Racket 端 (Racket/noise-serde-lib/serde.rkt): 对称地实现了读取和写入逻辑。

更妙的是，Noise 使用 Racket 强大的宏系统编写了一个代码生成器 (codegen.rkt)。你在 Racket 中定义数据结构：

```racket
(define-record Person
  [name : String]
  [age : Varint])
```

代码生成器会自动生成对应的 Swift `struct` 和序列化代码。

**给其他语言的启示：** 不要手动写 boilerplate 转换代码。定义一个中间协议（可以是 Protobuf，也可以是像 Noise 这样简单的自定义协议），然后**生成**两端的代码。这是保证类型安全和开发效率的关键。

## 第三层：执行模型 (The Backend Pattern)

这是 Noise 最精髓的部分。

通常我们嵌入脚本语言时，倾向于直接调用函数：`Swift -> call -> Racket Function`。但这在 UI 编程中是致命的。如果 Racket 函数执行了 5 秒钟，你的 iOS 界面就会卡死 5 秒。

Noise 采用了一种 **Async Client-Server** 模型，尽管它们运行在同一个进程中。

### 1. 通信管道 (Pipes)

Swift 创建两个管道（Pipe）：一个用于输入（Swift -> Racket），一个用于输出（Racket -> Swift）。它将这两个管道的文件描述符（File Descriptors）直接传递给 Racket！

从 Sources/NoiseBackend/Backend.swift 可以看到：

```swift
// Swift 端
private let ip = Pipe() // in  from Racket's perspective
private let op = Pipe() // out from Racket's perspective
```

在 `serve` 方法中，这些文件描述符被传递给 Racket：

```swift
let ifd = Val.fixnum(Int(ip.fileHandleForReading.fileDescriptor))
let ofd = Val.fixnum(Int(op.fileHandleForWriting.fileDescriptor))
let serve = r.require(Val.symbol(proc), from: mod).unsafeCar()
serve.unsafeApply(Val.cons(ifd, Val.cons(ofd, Val.null)))
```

### 2. Racket 服务器循环

Racket 端启动一个后台线程，运行一个事件循环（在 backend.rkt 中实现）：

```racket
(define (serve in-fd out-fd)
  (define rpc-infos (get-rpc-infos))
  (define cust (make-custodian))
  (define thd
    (parameterize ([current-custodian cust])
      (define server-in (unsafe-file-descriptor->port in-fd 'in '(read)))
      (define server-out (unsafe-file-descriptor->port out-fd 'out '(write)))
      (thread/suspend-to-kill
       (lambda ()
         (let loop ()
           (sync
            (handle-evt (thread-receive-evt)
              (lambda (_)
                (match (thread-receive)
                  [`(response ,id ,response-type ,response-data)
                   (write-uvarint id server-out)
                   (write-data response-type response-data server-out)
                   (flush-output server-out)
                   (loop)])))
            (handle-evt server-in
              (lambda (in)
                (define req-id (read-uvarint in))
                (define rpc-id (read-uvarint in))
                (match-define (rpc-info _id rpc-name rpc-args response-type handler)
                  (hash-ref rpc-infos rpc-id))
                (define args (for/list ([ra (in-list rpc-args)])
                              (read-field (rpc-arg-type ra) in)))
                ;; 为每个请求创建独立的 custodian 和子线程
                (define request-cust (make-custodian))
                (thread
                  (lambda ()
                    (parameterize ([current-custodian request-cust])
                      (define response-data
                        (with-handlers ([exn:fail? (lambda (e) e)])
                          (apply handler args)))
                      (thread-send thd `(response ,req-id ,response-type ,response-data))))
                (loop)))))))))
```

**关键设计：**
- **隔离性**：每个请求都在独立的 `custodian` 中运行，失败不会影响其他请求或主服务器
- **异步处理**：请求在子线程中执行，不阻塞主循环
- **错误隔离**：异常通过 `with-handlers` 捕获并作为响应发送回 Swift

### 3. Swift 客户端封装

Swift 端封装了一个 `Backend` 类，它维护一个 `pending` 字典。

从 Sources/NoiseBackend/Backend.swift 可以看到：

- **发送请求**：生成一个 `id`，将请求序列化写入管道，创建一个 `Future` 存入 `pending[id]`。
- **接收响应**：后台线程不断读取输出管道，根据 `id` 找到对应的 `Future` 并完成它。

```swift
private func read() {
  let inp = FileHandleInputPort(withHandle: op.fileHandleForReading)
  var buf = Data(count: 8*1024)
  while true {
    let id = UVarint.read(from: inp, using: &buf)
    mu.wait()
    guard let handler = pending[id] else {
      mu.signal()
      continue
    }
    mu.signal()
    let readDuration = handler.handle(from: inp, using: &buf)
    mu.wait()
    pending.removeValue(forKey: id)
    // ... 统计更新
    mu.signal()
  }
}
```

这样，你在 Swift 中调用 Racket 函数就变成了全异步的：

```swift
// Swift
let result = await backend.simulateProcess(data)
```

**给其他语言的启示：** 不要尝试在主线程同步调用解释器。

1. **隔离**：将解释器放在单独的线程中。
2. **通信**：使用类似 Actor 模型的方式通信（管道、Socket、或者线程安全的队列）。
3. **异步**：在宿主语言中暴露 Async/Await 接口，隐藏底层的通信细节。
4. **错误隔离**：为每个请求创建独立的资源上下文（如 Racket 的 custodian），防止级联失败。

## 总结：如何构建你自己的 Noise？

如果你想为 Python、Rust 或 Go 实现类似的嵌入：

1. **C-Interop**: 链接运行时库，实现初始化。
2. **Protocol**: 定义一个简单的二进制协议，不要用复杂的 JSON 解析。
3. **Codegen**: 编写脚本自动生成两端的类型定义和序列化代码。
4. **Async Loop**: 在嵌入语言端实现一个 `While True` 循环读取输入、处理、写回输出。在宿主语言端实现 `Future/Promise` 映射。
5. **Isolation**: 确保每个请求在独立的上下文中执行，失败不会崩溃整个系统。

Noise 不仅仅是一个 Racket 包装器，它展示了现代多语言编程的最佳实践：**类型安全、异步设计、代码生成、错误隔离**。这才是"嵌入"一门语言的正确姿势。