---
{"dg-publish":true,"dg-path":"02 软件开发/如何将 Racket 嵌入到 Swift 项目？.md","permalink":"/02 软件开发/如何将 Racket 嵌入到 Swift 项目？/","created":"2025-07-16T10:58:13.000+08:00","updated":"2025-09-22T16:37:39.686+08:00"}
---

#Innolight

本文结合 Noise 和 Remember 两个真实项目，介绍如何在 macOS/iOS 的 Swift 应用中嵌入 Racket CS 运行时，实现基于序列化 RPC 的跨语言调用架构，助你快速搭建灵活且高效的内嵌脚本环境。

# 1. Noise 与 Remember 简介

- **Noise** 是一个 Swift 封装库，包装了 Racket CS 运行时，简化了 Swift 调用 Racket 的复杂度。
- **Remember** 是一个具体应用，基于 Noise，帮助用户快速存储“待办事项”和“提醒”，实现异步消息管理。
- Remember 的业务逻辑大量依赖 Racket 脚本，通过 Noise 实现 Swift ↔ Racket 的高效通信。

# 2. Noise 项目架构

Noise 将 Racket CS 运行时拆解为：

- **静态库与启动文件**：Racket CS 编译生成的二进制文件和字节码启动文件。
- **Swift 桥接层**：封装 Racket C API，提供 `Racket` 类型和 `Val` 类型，管理 Racket VM 生命周期与数据交互。
- **序列化支持**（通过 NoiseSerde）：自动生成的数据结构序列化代码，保证 Swift 和 Racket 之间数据格式一致。
- **业务调用模块**（NoiseBackend）：封装具体命令的序列化 RPC，支持异步调用模式。

# 3. Racket 运行时准备与集成

1. 克隆 Racket 源码，编译对应平台静态库：

```bash
git clone https://github.com/racket/racket.git
cd racket
git checkout v8.17
make PLATFORM=macosx
```

2. 使用 Noise 自带脚本复制资源到项目：

```bash
./Bin/copy-libs.sh arm64-macos /path/to/racket/racket
```

3. 利用 Xcode 工具合成多架构 `xcframework`，方便 Swift Package Manager 使用：

```bash
xcodebuild -create-xcframework \
  -library Lib/libracketcs-arm64-macos.a -headers Lib/include \
  -output RacketCS-macos.xcframework
```

4. 在 `Package.swift` 中声明：

```swift
.binaryTarget(name: "RacketCS-macos", path: "./RacketCS-macos.xcframework")
```

# 4. Swift 与 Racket 的通信机制

- **基于序列化的异步 RPC 机制**，而非简单的直接函数调用。
- Swift 通过 `NoiseBackend` 模块调用封装的 RPC 接口，向 Racket 发送序列化的命令和参数。
- Racket 端解析命令，执行业务逻辑后返回序列化的结果。
- Swift 反序列化结果并继续处理。

# 5. Remember 项目中的调用示例

Remember 中业务层 `Backend` 类示例：

```swift
public func commit(command s: String) -> Future<String, Entry> {
  return impl.send(
    writeProc: { out in
      UVarint(0x0001).write(to: out) // 命令ID
      s.write(to: out)               // 序列化参数
    },
    readProc: { inp, buf in
      return Entry.read(from: inp, using: &buf) // 反序列化返回数据
    }
  )
}
```

这表示：

- Swift 先将命令ID和参数写到输出流（序列化）。
- Racket 收到命令后调用对应业务逻辑。
- 结果以二进制流返回，Swift 反序列化成业务模型。

# 6. 线程与 GC 管理

- Racket CS VM 是单线程模型，调用前必须激活线程，调用后释放。
- Noise 提供 `bracket` 等函数帮你自动管理线程状态，保证调用安全。

# 7. 双向交互能力

- Swift 调用 Racket 业务逻辑（如 Remember 的提醒存储）。
- Racket 可通过 FFI 调用 Swift 导出函数，实现业务回调或扩展。

# 8. 总结

- Noise 把复杂的 Racket CS VM 封装为易用的 Swift 库。
- Remember 作为示范应用，展示了如何通过 Noise 的序列化 RPC 架构实现高效跨语言业务交互。
- 你可以基于 Noise 的设计，结合业务需要，实现类似的 Racket 嵌入式解决方案。