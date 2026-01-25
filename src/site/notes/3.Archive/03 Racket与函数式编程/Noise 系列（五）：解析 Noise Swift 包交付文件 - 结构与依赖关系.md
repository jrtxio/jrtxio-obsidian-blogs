---
{"dg-publish":true,"dg-path":"03 Racket与函数式编程/Noise 系列（五）：解析 Noise Swift 包交付文件 - 结构与依赖关系.md","permalink":"/03 Racket与函数式编程/Noise 系列（五）：解析 Noise Swift 包交付文件 - 结构与依赖关系/"}
---

#lisp/racket #gui/noise 

Noise 作为 Swift 包，通过 SPM（Swift Package Manager）构建后，最终交付一个完整的 Racket 运行时嵌入解决方案。本文将详细说明每个交付文件的作用、来源、构建过程，以及在运行时如何被调用。

## 📦 一、交付产物概览

### 1.1 Swift Package vs Swift Library

**关键概念澄清**：**Noise 是一个 Swift Package，而不是一个单一的 Swift Library**。

在 Swift Package Manager 中：
- **Package（包）**：一个项目的容器，可以包含多个源文件、资源和配置
- **Library（库）**：Package 提供的可被其他项目使用的最终产品

**一个 Package 可以同时提供多个独立的 Library 产品**。

根据 Package.swift 的定义，Noise Package 提供了 3 个独立的 Library 产品：

```swift
products: [
  .library(
    name: "Noise",
    targets: ["Noise"]
  ),
  .library(
    name: "NoiseBackend",
    targets: ["NoiseBackend"]
  ),
  .library(
    name: "NoiseSerde",
    targets: ["NoiseSerde"]
  ),
],
```

### 1.2 完整交付产物

| 组件类型           | 名称                           | 类型                       | 平台        | 最终产物                                               |
| -------------- | ---------------------------- | ------------------------ | --------- | -------------------------------------------------- |
| **Library 产品** | `Noise`                      | Swift Library            | iOS/macOS | `Noise.framework` / `libNoise.dylib`               |
| **Library 产品** | `NoiseSerde`                 | Swift Library            | iOS/macOS | `NoiseSerde.framework` / `libNoiseSerde.dylib`     |
| **Library 产品** | `NoiseBackend`               | Swift Library            | iOS/macOS | `NoiseBackend.framework` / `libNoiseBackend.dylib` |
| **外部依赖**       | `RacketCS-ios.xcframework`   | XCFramework              | iOS       | `libracketcs-arm64-ios.a` + Headers                |
| **外部依赖**       | `RacketCS-macos.xcframework` | XCFramework              | macOS     | `libracketcs-universal-macos.a` + Headers          |
| **内部 Target**  | `NoiseBoot_iOS`              | Swift Target + Resources | iOS       | `NoiseBoot_iOS.framework` + `.bundle`              |
| **内部 Target**  | `NoiseBoot_macOS`            | Swift Target + Resources | macOS     | `NoiseBoot_macOS.framework` + `.bundle`            |

### 1.3 依赖关系

根据 Package.swift 的配置，三个 Library 之间的依赖关系如下：

```
┌─────────────────────────────────────────────────────────────┐
│                    Noise Swift Package                       │
│                  (一个 Package，多个产品)                    │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Noise      │       │ NoiseSerde   │       │ NoiseBackend │
│  (独立库)     │       │  (独立库)     │       │  (独立库)     │
└──────────────┘       └──────────────┘       └──────────────┘
        │                                           │
        │ 依赖                                       │ 依赖
        ▼                                           ▼
┌──────────────┐                            ┌──────────────┐
│ NoiseBoot_   │                            │   Noise      │
│ iOS/macOS    │                            │   +         │
│ (资源target) │                            │ NoiseSerde   │
└──────────────┘                            └──────────────┘
        │
        │ 依赖
        ▼
┌──────────────────────────────┐
│ RacketCS-ios/macos          │
│ (XCFramework，外部依赖)     │
└──────────────────────────────┘
```

**关键要点**：
- **NoiseSerde 不会编译到 Noise 中**，它们是**独立的 framework/dylib**
- **NoiseBackend 也不会编译到 Noise 中**，但它**依赖** Noise 和 NoiseSerde
- 三个库可以独立使用，或根据需要组合使用

### 1.4 使用场景分层

| 使用场景 | 需要的库 | 说明 |
|---------|---------|------|
| 基本的 Racket 运行时嵌入 | 仅 `Noise` | 直接使用 Racket C API，与 Racket 运行时交互 |
| 在 Swift 和 Racket 之间序列化数据 | `Noise` + `NoiseSerde` | 需要跨语言数据交换 |
| 完整的 RPC 客户端-服务器架构 | `Noise` + `NoiseSerde` + `NoiseBackend` | 最高层抽象，基于 pipe 的 IPC |

这些产物通过 Makefile 中的 `make all` 命令统一构建：

```makefile
all: \
  RacketCS-ios.xcframework \
  RacketCS-macos.xcframework \
  Tests/NoiseTest/Modules/mods.zo
```

---

## 🔧 二、Racket CS 运行时（XCFramework）

### 2.1 作用

Racket CS 运行时是 Noise 的核心组件，提供：
- Chez Scheme 解释器和编译器
- Racket 语言层
- 垃圾回收器
- 数值计算库
- 字符串和 I/O 处理

### 2.2 最终交付文件

#### RacketCS-ios.xcframework

根据 [Makefile#L5-L15](Makefile#L5-L15) 的构建规则：

```makefile
RacketCS-ios.xcframework: Lib/include/* Lib/libracketcs-arm64-ios.a Lib/libracketcs-arm64-iphonesimulator.a
  rm -fr $@
  xcodebuild -create-xcframework \
    -library Lib/libracketcs-arm64-iphonesimulator.a -headers Lib/include \
    -library Lib/libracketcs-arm64-ios.a -headers Lib/include \
    -output $@
```

**最终内部结构**：

```
RacketCS-ios.xcframework/
├── Info.plist
└── ios-arm64/                              # 真机版本
    ├── libracketcs-arm64-ios.a             # ✅ 静态库文件（运行时链接）
    └── Headers/                            # 头文件目录（编译时引用）
        ├── chezscheme-arm64-ios.h
        ├── racket.h
        ├── racketcs.h
        └── racketcsboot.h
└── ios-arm64_x86_64-simulator/             # 模拟器版本
    ├── libracketcs-arm64-iphonesimulator.a  # ✅ 静态库文件（运行时链接）
    └── Headers/
        ├── chezscheme-arm64-iphonesimulator.h
        ├── racket.h
        ├── racketcs.h
        └── racketcsboot.h
```

#### RacketCS-macos.xcframework

根据 Makefile 和 Lib/Makefile：

```makefile
Lib/libracketcs-universal-macos.a: libracketcs-arm64-macos.a libracketcs-x86_64-macos.a
  lipo -create -output $@ libracketcs-arm64-macos.a libracketcs-x86_64-macos.a

RacketCS-macos.xcframework: Lib/include/* Lib/libracketcs-universal-macos.a
  rm -fr $@
  xcodebuild -create-xcframework \
    -library Lib/libracketcs-universal-macos.a \
    -headers Lib/include \
    -output $@
```

**最终内部结构**：

```
RacketCS-macos.xcframework/
├── Info.plist
└── macos-arm64_x86_64/                      # 通用二进制版本
    ├── libracketcs-universal-macos.a       # ✅ 静态库文件（同时包含 ARM64 和 x86_64）
    └── Headers/                            # 头文件目录（编译时引用）
        ├── chezscheme-arm64-macos.h
        ├── chezscheme-x86_64-macos.h
        ├── racket.h
        ├── racketcs.h
        └── racketcsboot.h
```

### 2.3 来源与构建过程

这些 `.a` 静态库文件是从 Racket 源码编译而来的。根据 README.md 的说明：

#### 构建要求

**iOS 平台构建**：

```bash
# 配置 Racket（真机）
configure \
  --host=aarch64-apple-darwin \
  --enable-ios=iPhoneOS \
  --enable-pb \
  --enable-racket=auto \
  --enable-libffi

# 合并 libffi
libtool -s \
  -o racket/lib/libracketcs1.a \
  racket/lib/libracketcs.a \
  /path/to/libffi.a \
  && mv racket/libracketcs{1,}.a
```

对于 iPhone Simulator，将 `--enable-ios=iPhoneSimulator`。

**macOS 平台构建**：

直接编译对应的架构版本，然后使用 `lipo` 合并为通用二进制。

#### 复制库文件

构建完成后，使用提供的脚本复制库文件：

```bash
./Bin/copy-libs.sh <platform> <racket-src-path>

# 例如：
./Bin/copy-libs.sh arm64-ios /path/to/src/racket
./Bin/copy-libs.sh arm64-macos /path/to/src/racket
./Bin/copy-libs.sh x86_64-macos /path/to/src/racket
```

支持的参数：

| OS | Architecture | 参数 |
|----|--------------|------|
| macOS | x86_64 | `x86_64-macos` |
| macOS | arm64/aarch64 | `arm64-macos` |
| iOS | arm64/aarch64 | `arm64-ios` |
| iOS Simulator | arm64/aarch64 | `arm64-iphonesimulator` |

#### 头文件来源

Lib/include 目录包含的头文件在构建 Racket 时生成，主要包括：

- `chezscheme-*.h` - Chez Scheme C API（根据平台区分）
- `racket.h` - Racket C API
- `racketcs.h` - Racket CS API
- `racketcsboot.h` - Racket 启动配置

### 2.4 运行时调用方式

在 [Racket.swift](Sources/Noise/Racket.swift#L1-L50) 中，通过外部函数声明调用 Racket CS 的 C 函数：

```swift
import RacketCS  // 从 XCFramework 导入

public struct Racket {
  public init(execPath: String = "racket") {
    var args = racket_boot_arguments_t()
    // ...
    racket_boot(&args)  // 调用 Racket CS C 函数
    racket_deactivate_thread()
    // ...
  }
}
```

这些外部函数的实现就在 `libracketcs-*.a` 静态库中。

---

## 🚀 三、Boot 文件（Racket 运行时引导字节码）

### 3.1 作用

Boot 文件是 Racket CS 启动时加载的预编译字节码，它们引导运行时初始化：

- **petite.boot**：Chez Scheme 的 Petite 编译器（最小化版本）
- **scheme.boot**：完整的 Chez Scheme 运行时
- **racket.boot**：Racket 语言层扩展

### 3.2 最终交付文件

#### iOS 平台

根据 [Package.swift#L40-L44](Package.swift#L40-L44) 和 [Package.swift#L57-L58](Package.swift#L57-L58)：

```swift
.target(
  name: "NoiseBoot_iOS",
  resources: [.copy("boot")]
),
.target(
  name: "Noise",
  dependencies: [
    .target(name: "NoiseBoot_iOS", condition: .when(platforms: [.iOS])),
    // ...
  ]
)
```

**来源**：[Sources/NoiseBoot_iOS/boot/arm64-ios/](Sources/NoiseBoot_iOS/boot/arm64-ios/)

**最终打包到**：`NoiseBoot_iOS.bundle/resources/boot/arm64-ios/`

**包含的文件**：
- ✅ `petite.boot` - Chez Scheme Petite 编译器引导文件
- ✅ `scheme.boot` - Chez Scheme 完整运行时引导文件
- ✅ `racket.boot` - Racket 语言扩展引导文件

#### macOS 平台

根据 [Package.swift#L45-L49](Package.swift#L45-L49)：

```swift
.target(
  name: "NoiseBoot_macOS",
  resources: [.copy("boot")]
),
```

**来源**：[Sources/NoiseBoot_macOS/boot/](Sources/NoiseBoot_macOS/boot/)

**最终打包到**：`NoiseBoot_macOS.bundle/resources/boot/`

**包含的文件结构**：

```
boot/
├── arm64-macos/                  # ARM64 Mac
│   ├── petite.boot                # ✅
│   ├── scheme.boot                # ✅
│   └── racket.boot                # ✅
└── x86_64-macos/                  # Intel Mac
    ├── petite.boot                # ✅
    ├── scheme.boot                # ✅
    └── racket.boot                # ✅
```

### 3.3 来源

这些 boot 文件在构建 Racket 源码时生成。根据 [README.md#L14-L15](README.md#L14-L15)：

> Git LFS is used to store the binary files in `Lib/` and in `Sources/Noise/boot`

这些文件通常通过 Git LFS（Git Large File Storage）存储，因为它们是二进制大文件。

仓库也提供了针对不同 Racket 版本的预编译分支：

- `racket-9.0`
- `racket-8.18`
- `racket-8.17`
- `racket-8.16`
- `racket-8.15`（第一个包含 iOS 构建的分支）
- `racket-8.14`
- `racket-8.13`
- `racket-8.12`
- `racket-8.11.1`
- `racket-8.11`
- `racket-8.10`

### 3.4 运行时调用方式

#### iOS 平台的调用

[NoiseBoot_iOS.swift](Sources/NoiseBoot_iOS/NoiseBoot.swift#L1-L8) 提供固定的 URL：

```swift
public struct NoiseBoot {
  public static let petiteURL = Bundle.module.url(
    forResource: "boot/arm64-ios/petite", 
    withExtension: "boot"
  )!
  public static let schemeURL = Bundle.module.url(
    forResource: "boot/arm64-ios/scheme", 
    withExtension: "boot"
  )!
  public static let racketURL = Bundle.module.url(
    forResource: "boot/arm64-ios/racket", 
    withExtension: "boot"
  )!
}
```

#### macOS 平台的调用

[NoiseBoot_macOS.swift](Sources/NoiseBoot_macOS/NoiseBoot.swift#L1-L16) 根据当前架构自动选择：

```swift
#if arch(x86_64)
let ARCH = "x86_64"
#elseif arch(arm64)
let ARCH = "arm64"
#endif

public struct NoiseBoot {
  public static let petiteURL = Bundle.module.url(
    forResource: "boot/\(ARCH)-macos/petite", 
    withExtension: "boot"
  )!
  // ... 类似地定义 schemeURL 和 racketURL
}
```

#### Racket 运行时初始化

在 [Racket.swift#L31-L35](Sources/Noise/Racket.swift#L31-L35) 中，这些 boot 文件被传递给 Racket CS 的启动函数：

```swift
public init(execPath: String = "racket") {
  var args = racket_boot_arguments_t()
  args.exec_file = execPath.utf8CString.cstring()
  args.boot1_path = NoiseBoot.petiteURL.path.utf8CString.cstring()  // petite.boot
  args.boot2_path = NoiseBoot.schemeURL.path.utf8CString.cstring()  // scheme.boot
  args.boot3_path = NoiseBoot.racketURL.path.utf8CString.cstring()  // racket.boot
  racket_boot(&args)
  // ...
}
```

---

## ⚙️ 四、Swift 库产品详解

### 4.1 Noise 库

**作用**：Racket CS 运行时的核心包装器

**来源**：[Sources/Noise/Racket.swift](Sources/Noise/Racket.swift#L1-L328)

**编译产物**：
- ✅ `Noise.swiftmodule` - Swift 接口定义
- ✅ `Noise.framework/Noise`（或 `libNoise.dylib`）- **独立的**编译后二进制

**依赖关系**（见 [Package.swift#L51-L65](Package.swift#L51-L65)）：

```swift
.target(
  name: "Noise",
  dependencies: [
    .target(name: "NoiseBoot_iOS", condition: .when(platforms: [.iOS])),
    .target(name: "NoiseBoot_macOS", condition: .when(platforms: [.macOS])),
    .target(name: "RacketCS-ios", condition: .when(platforms: [.iOS])),
    .target(name: "RacketCS-macos", condition: .when(platforms: [.macOS])),
  ],
  linkerSettings: [
    .linkedLibrary("curses", .when(platforms: [.macOS])),
    .linkedLibrary("iconv"),
  ]
)
```

**运行时会被链接的库**：
- RacketCS XCFramework（提供 Racket CS C API）
- `libcurses.dylib`（仅 macOS，终端支持）
- `libiconv.dylib`（字符编码转换）

**重要**：Noise 库**不依赖** NoiseSerde 或 NoiseBackend，可以独立使用。

### 4.2 NoiseSerde 库

**作用**：提供 Racket 和 Swift 之间的数据序列化与反序列化协议

**来源**：
- [Sources/NoiseSerde/Serde.swift](Sources/NoiseSerde/Serde.swift#L1-L356) - 定义 `Readable` 和 `Writable` 协议
- [Sources/NoiseSerde/Port.swift](Sources/NoiseSerde/Port.swift#L1-L1) - I/O 端口抽象
- [Sources/NoiseSerde/DataInputPort.swift](Sources/NoiseSerde/DataInputPort.swift#L1-L1) 等 - 具体端口实现

**编译产物**：
- ✅ `NoiseSerde.swiftmodule`
- ✅ `NoiseSerde.framework/NoiseSerde`（或 `libNoiseSerde.dylib`）- **独立的**编译后二进制

**依赖关系**（见 [Package.swift#L74-L75](Package.swift#L74-L75)）：

```swift
.target(
  name: "NoiseSerde"
)
```

**重要**：NoiseSerde 库**不依赖任何其他 Noise 库**，它是一个完全独立的序列化框架，可以单独使用。

**主要组件**：

```swift
// 基本协议
public protocol Readable {
  static func read(from inp: InputPort, using buf: inout Data) -> Self
}

public protocol Writable {
  func write(to out: OutputPort)
}

// 基本类型扩展
extension Bool: Readable, Writable { ... }
extension Data: Readable, Writable { ... }
extension Float32: Readable, Writable { ... }
// ... 更多类型
```

### 4.3 NoiseBackend 库

**作用**：基于 NoiseSerde 构建的客户端-服务器通信框架

**来源**：
- [Sources/NoiseBackend/Backend.swift](Sources/NoiseBackend/Backend.swift#L1-L171) - 服务器实现
- [Sources/NoiseBackend/Callout.swift](Sources/NoiseBackend/Callout.swift#L1-L31) - 跨语言回调机制
- [Sources/NoiseBackend/Future.swift](Sources/NoiseBackend/Future.swift#L1-L1) - 异步 API 支持

**编译产物**：
- ✅ `NoiseBackend.swiftmodule`
- ✅ `NoiseBackend.framework/NoiseBackend`（或 `libNoiseBackend.dylib`）- **独立的**编译后二进制

**依赖关系**（见 [Package.swift#L67-L72](Package.swift#L67-L72)）：

```swift
.target(
  name: "NoiseBackend",
  dependencies: [
    "Noise",
    "NoiseSerde"
  ]
)
```

**重要**：NoiseBackend 库**依赖** Noise 和 NoiseSerde，但它依然是**独立的 framework/dylib**，不会编译到 Noise 或 NoiseSerde 中。使用 NoiseBackend 时，需要同时链接这三个库。

### 4.4 编译产物结构

当你使用 SPM 构建 Noise Package 时，会生成以下**独立的**框架/动态库：

```
.build/release/
├── Noise.framework/                    # 独立框架
│   ├── Noise (二进制文件)
│   └── Modules/
│       ├── Noise.swiftmodule
│       └── ...
├── NoiseSerde.framework/               # 独立框架
│   ├── NoiseSerde (二进制文件)
│   └── Modules/
│       ├── NoiseSerde.swiftmodule
│       └── ...
└── NoiseBackend.framework/             # 独立框架
    ├── NoiseBackend (二进制文件)
    └── Modules/
        ├── NoiseBackend.swiftmodule
        └── ...
```

在你的项目中导入时，你可以选择：

```swift
// 方式 1：只用 Noise
import Noise

// 方式 2：使用序列化
import Noise
import NoiseSerde

// 方式 3：使用完整的 RPC 框架
import Noise
import NoiseSerde
import NoiseBackend
```

---

## 🔄 五、完整构建流程

```
1. 构建前置要求
   ├─ 安装 Racket 源码
   ├─ 安装 Git LFS（用于拉取二进制文件）
   └─ 安装 Swift 工具链

2. 从 Racket 源码编译
   ├─ iOS 真机: configure --enable-ios=iPhoneOS --enable-pb
   │             make
   │             libtool -s 合并 libffi
   ├─ iOS 模拟器: configure --enable-ios=iPhoneSimulator --enable-pb
   │               make
   │               libtool -s 合并 libffi
   └─ macOS: 配置对应架构，make

3. 复制库文件到 Noise 仓库
   └─ ./Bin/copy-libs.sh <platform> <racket-src-path>
      ├─ arm64-ios      → Lib/libracketcs-arm64-ios.a
      ├─ arm64-iphonesimulator → Lib/libracketcs-arm64-iphonesimulator.a
      ├─ arm64-macos    → Lib/libracketcs-arm64-macos.a
      └─ x86_64-macos   → Lib/libracketcs-x86_64-macos.a

4. 运行 make
   ├─ make -C Lib libracketcs-universal-macos.a
   │  └─ lipo 合并两个 macOS 架构
   ├─ xcodebuild -create-xcframework RacketCS-ios.xcframework
   │  └─ 合并 iOS 真机和模拟器版本
   ├─ xcodebuild -create-xcframework RacketCS-macos.xcframework
   │  └─ 合并 macOS 通用版本
   └─ make -C Tests/NoiseTest/Modules mods.zo

5. Swift Package Manager 构建
   ├─ 编译 NoiseBoot_iOS（包含 boot/*.boot 资源）
   ├─ 编译 NoiseBoot_macOS（包含 boot/**/*.boot 资源）
   ├─ 编译 Noise（链接 RacketCS XCFramework）
   │  └─ 生成独立的 Noise.framework/libNoise.dylib
   ├─ 编译 NoiseSerde
   │  └─ 生成独立的 NoiseSerde.framework/libNoiseSerde.dylib
   ├─ 编译 NoiseBackend（依赖 Noise 和 NoiseSerde）
   │  └─ 生成独立的 NoiseBackend.framework/libNoiseBackend.dylib
   └─ 生成最终产物
      ├─ RacketCS-ios.xcframework
      ├─ RacketCS-macos.xcframework
      ├─ Noise.framework/libNoise.dylib
      ├─ NoiseSerde.framework/libNoiseSerde.dylib
      └─ NoiseBackend.framework/libNoiseBackend.dylib
```

---

## 📋 六、最终文件清单总结

### 参与链接的文件（编译时/运行时）

| 文件 | 来源 | 类型 | 平台 | 作用 |
|------|------|------|------|------|
| `libracketcs-arm64-ios.a` | XCFramework | 静态库 | iOS 真机 | Racket 运行时 |
| `libracketcs-arm64-iphonesimulator.a` | XCFramework | 静态库 | iOS 模拟器 | Racket 运行时 |
| `libracketcs-universal-macos.a` | XCFramework | 静态库 | macOS | Racket 运行时（通用） |
| `libcurses.dylib` | 系统库 | 动态库 | macOS | 终端支持 |
| `libiconv.dylib` | 系统库 | 动态库 | iOS/macOS | 字符编码转换 |

### 运行时加载的 Boot 文件

| 文件 | 来源 | 平台 | 调用时机 |
|------|------|------|----------|
| `boot/arm64-ios/petite.boot` | NoiseBoot Bundle | iOS | Racket 运行时初始化（第一阶段） |
| `boot/arm64-ios/scheme.boot` | NoiseBoot Bundle | iOS | Racket 运行时初始化（第二阶段） |
| `boot/arm64-ios/racket.boot` | NoiseBoot Bundle | iOS | Racket 运行时初始化（第三阶段） |
| `boot/arm64-macos/petite.boot` | NoiseBoot Bundle | macOS (ARM) | Racket 运行时初始化（第一阶段） |
| `boot/arm64-macos/scheme.boot` | NoiseBoot Bundle | macOS (ARM) | Racket 运行时初始化（第二阶段） |
| `boot/arm64-macos/racket.boot` | NoiseBoot Bundle | macOS (ARM) | Racket 运行时初始化（第三阶段） |
| `boot/x86_64-macos/petite.boot` | NoiseBoot Bundle | macOS (Intel) | Racket 运行时初始化（第一阶段） |
| `boot/x86_64-macos/scheme.boot` | NoiseBoot Bundle | macOS (Intel) | Racket 运行时初始化（第二阶段） |
| `boot/x86_64-macos/racket.boot` | NoiseBoot Bundle | macOS (Intel) | Racket 运行时初始化（第三阶段） |

### 编译时引用的头文件

| 文件 | 来源 | 用途 |
|------|------|------|
| `chezcheme-arm64-ios.h` | XCFramework | Chez Scheme C API（iOS 真机） |
| `chezscheme-arm64-iphonesimulator.h` | XCFramework | Chez Scheme C API（iOS 模拟器） |
| `chezscheme-arm64-macos.h` | XCFramework | Chez Scheme C API（macOS ARM） |
| `chezscheme-x86_64-macos.h` | XCFramework | Chez Scheme C API（macOS Intel） |
| `racket.h` | XCFramework | Racket C API |
| `racketcs.h` | XCFramework | Racket CS API |
| `racketcsboot.h` | XCFramework | Racket 启动配置 |

### Swift Library 编译产物（独立框架）

| Library | 最终产物 | 依赖 |
|---------|---------|------|
| **Noise** | `Noise.framework` / `libNoise.dylib` | RacketCS XCFramework, NoiseBoot, libcurses, libiconv |
| **NoiseSerde** | `NoiseSerde.framework` / `libNoiseSerde.dylib` | 无（独立） |
| **NoiseBackend** | `NoiseBackend.framework` / `libNoiseBackend.dylib` | Noise, NoiseSerde |

---

## 🔎 七、验证方法

如果你想验证构建后的文件，可以使用以下命令：

```bash
# 1. 构建 Noise
make all

# 2. 查看 XCFramework 内容
ls -la RacketCS-ios.xcframework/
find RacketCS-ios.xcframework/ -type f
find RacketCS-macos.xcframework/ -type f

# 3. 查看 Swift 编译产物（如果使用 SPM 构建）
swift build
find .build/debug/ -name "*.swiftmodule"
find .build/debug/ -name "*.framework"

# 4. 查看资源包
find .build/debug/ -name "*.bundle"
ls -la .build/debug/NoiseBoot_iOS_*.bundle/resources/boot/
```

---

## 📚 八、总结与核心要点

### 8.1 架构设计总结

Noise Swift Package 采用**分层模块化设计**，将功能划分为三个独立的 Library 产品：

```
层次架构：
┌─────────────────────────────────────┐
│    应用层（你的应用代码）              │
└─────────────────────────────────────┘
                │ 使用哪个库都可以
    ┌───────────┼───────────┐
    │           │           │
    ▼           ▼           ▼
┌───────┐ ┌─────────┐ ┌───────────┐
│ Noise │ │NoiseSerde││NoiseBackend│
│ 核心  │ │ 序列化  │ │ RPC框架   │
└───────┘ └─────────┘ └───────────┘
    │           │           │
    └───────────┴───────────┘
                │
        ┌───────┴───────┐
        ▼               ▼
┌───────────┐   ┌───────────┐
│ Racket CS │   │ Boot文件  │
│ 运行时    │   │          │
└───────────┘   └───────────┘
```

### 8.2 核心要点

| 问题 | 答案 |
|------|------|
| Noise 是什么？ | 一个 Swift Package，包含多个 Library 产品 |
| 包含几个 Swift Library？ | **3 个独立的 Library 产品**：Noise、NoiseSerde、NoiseBackend |
| 它们的关系是什么？ | Noise 和 NoiseSerde 相互独立，NoiseBackend 依赖另外两者 |
| NoiseSerde 会编译到 Noise 中吗？ | **不会**，它们是完全独立的 framework/dylib |
| NoiseBackend 会编译到 Noise 中吗？ | **不会**，但使用 NoiseBackend 时需要同时链接 Noise 和 NoiseSerde |
| 最终会生成几个二进制文件？ | 至少 **3 个独立的** Swift 框架/动态库，加上 XCFramework |

### 8.3 交付文件构成

Noise Swift Package 通过精心设计的构建流程，将以下文件交付为完整的 Racket 运行时嵌入解决方案：

1. **Racket CS 运行时**（`libracketcs-*.a`）- 从 Racket 源码编译的 C 代码，通过 XCFramework 封装
2. **Boot 文件**（`*.boot`）- Racket 的预编译字节码，通过 Swift Package 的资源机制打包
3. **Swift 封装层**（3 个独立的框架）- 编译后的 Swift 代码，提供类型安全的接口

这些文件协同工作：
- 静态库提供 Racket 运行时的 C 实现
- Boot 文件引导运行时初始化
- Swift 代码桥接 Racket 和 Swift 之间的交互

**关键构建命令**：
```bash
# 从源码构建
make all

# 使用 Swift Package
swift build
```

### 8.4 设计优势

这种分层设计让使用者可以根据需要选择使用哪个层级的功能，避免引入不必要的依赖：

- **最小依赖**：只用 Noise，只引入 Racket 运行时
- **数据交换**：加 NoiseSerde，获得序列化能力
- **完整方案**：加 NoiseBackend，获得 RPC 框架

---

## 🎯 进一步阅读

想深入了解 Noise 的架构和工作原理，可以继续探索：

- [架构概览](6-architecture-overview) - Noise 的整体设计思路
- [Racket CS 运行时初始化](7-racket-cs-runtime-initialization) - 详细了解运行时启动流程
- [NoiseSerde 框架](11-readable-and-writable-protocols) - 序列化机制详解
- [NoiseBackend 架构](20-client-server-communication-pattern) - 客户端-服务器通信模式

这篇文章现在完整涵盖了 Noise Swift 包的最终交付文件、它们的来源、构建过程、依赖关系以及运行时调用方式，特别澄清了 Package 与 Library 的概念区别。