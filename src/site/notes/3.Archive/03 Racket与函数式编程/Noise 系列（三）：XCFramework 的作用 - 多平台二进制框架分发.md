---
{"dg-publish":true,"dg-path":"03 Racket与函数式编程/Noise 系列（三）：XCFramework 的作用 - 多平台二进制框架分发.md","permalink":"/03 Racket与函数式编程/Noise 系列（三）：XCFramework 的作用 - 多平台二进制框架分发/"}
---

#lisp/racket #gui/noise 

## XCFramework 是什么

XCFramework 是 Apple 在 Xcode 11 引入的一种新的二进制框架分发格式。想象一下，如果你需要在 iOS 真机、模拟器、macOS 等多个平台使用同一个框架，旧的 fat framework 方式会因为架构冲突而无法同时满足需求。XCFramework 解决了这个问题，它可以在一个包中包含多个平台和架构的二进制文件，让框架分发变得简单优雅。

## Noise 如何构建 XCFramework

### 构建流程

Noise 将 Racket CS 运行时编译为 XCFramework，主要通过以下步骤：

#### 1. 编译静态库

- **iOS 平台**：分别编译真机和模拟器版本
  - `Lib/libracketcs-arm64-ios.a`（真机）
  - `Lib/libracketcs-arm64-iphonesimulator.a`（模拟器）
  
- **macOS 平台**：编译多架构并合并
  - 先编译 `libracketcs-arm64-macos.a` 和 `libracketcs-x86_64-macos.a`
  - 使用 `lipo` 工具合并为 `libracketcs-universal-macos.a`

具体操作见 Makefile：

```makefile
RacketCS-ios.xcframework: Lib/include/* Lib/libracketcs-arm64-ios.a Lib/libracketcs-arm64-iphonesimulator.a
	rm -fr $@
	xcodebuild -create-xcframework \
		-library Lib/libracketcs-arm64-iphonesimulator.a -headers Lib/include \
		-library Lib/libracketcs-arm64-ios.a -headers Lib/include \
		-output $@

RacketCS-macos.xcframework: Lib/include/* Lib/libracketcs-universal-macos.a
	rm -fr $@
	xcodebuild -create-xcframework \
		-library Lib/libracketcs-universal-macos.a \
		-headers Lib/include \
		-output $@
```

#### 2. 创建 XCFramework

使用 `xcodebuild -create-xcframework` 命令将静态库和头文件打包：

- iOS 版本包含两个静态库（真机和模拟器），共享同一套头文件
- macOS 版本包含一个 universal 静态库和头文件

#### 3. 集成到 Swift Package

在 Package.swift 中通过 `binaryTarget` 引用：

```swift
.binaryTarget(
  name: "RacketCS-ios",
  path: "RacketCS-ios.xcframework"
),
.binaryTarget(
  name: "RacketCS-macos",
  path: "RacketCS-macos.xcframework"
),
```

然后在 Noise 目标中根据平台条件依赖相应的 XCFramework：

```swift
target(
  name: "Noise",
  dependencies: [
    .target(name: "NoiseBoot_iOS", condition: .when(platforms: [.iOS])),
    .target(name: "NoiseBoot_macOS", condition: .when(platforms: [.macOS])),
    .target(name: "RacketCS-ios", condition: .when(platforms: [.iOS])),
    .target(name: "RacketCS-macos", condition: .when(platforms: [.macOS])),
  ],
```

## 为什么这么做

### 1. Racket CS 运行时的特殊需求

Racket CS 是一个用 C 语言编写的 Scheme 实现，包含垃圾回收器、JIT 编译器等复杂组件。它需要作为预编译的二进制库分发，而不是 Swift 源代码。使用 XCFramework 可以将编译好的 Racket 运行时及其头文件打包成一个独立的分发单元。

### 2. 多平台支持的必要性

Noise 需要支持：
- iOS 真机（arm64）
- iOS 模拟器（arm64，在 Apple Silicon Mac 上）
- macOS（arm64 和 x86_64）

传统的 framework 无法同时包含这些不同平台的二进制文件，而 XCFramework 可以轻松处理。

### 3. 分发便利性

通过 XCFramework + Swift Package Manager：
- 用户只需在 `Package.swift` 中添加依赖
- SPM 会自动根据构建目标选择正确的平台版本
- 无需手动处理不同架构的库文件

### 4. 简化开发流程

开发者运行 `make` 即可构建所有 XCFramework，见 Makefile：

```makefile
all: \
	RacketCS-ios.xcframework \
	RacketCS-macos.xacos.xcframework
```

这种设计让 Noise 的开发者可以在本地构建完整的框架，而最终用户只需通过 SPM 拉取预编译好的二进制文件即可使用。