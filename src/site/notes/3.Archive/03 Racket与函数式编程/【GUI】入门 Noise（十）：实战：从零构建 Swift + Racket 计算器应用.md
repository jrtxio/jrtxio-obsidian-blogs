---
{"dg-publish":true,"dg-path":"03 Racket与函数式编程/【GUI】入门 Noise（十）：实战：从零构建 Swift + Racket 计算器应用.md","permalink":"/03 Racket与函数式编程/【GUI】入门 Noise（十）：实战：从零构建 Swift + Racket 计算器应用/"}
---

#lisp/racket  #gui/noise

今天，我们来点实际的：如何从零开始构建一个"计算器"应用，前端使用 SwiftUI，后端完全用 Racket 实现。

这将不需要任何复杂的 C 语言胶水代码，我们将体验纯粹的 **Swift + Racket** 开发流。

## 准备工作

在开始之前，有一个非常关键的点需要注意：**版本匹配**。

Noise 仓库中自带了一些预编译的 Racket 运行时库 (`Lib/`) 和引导文件 (`Sources/NoiseBoot_*/boot/`)。但是，**这些文件的版本必须严丝合缝地匹配你用来编译 Racket 代码的 Racket 编译器版本**。

如果你本地安装的 Racket 是最新的 Release 版（比如 8.12），而 Noise 仓库里自带的是旧版（比如 8.11），那么运行时就会崩溃或报错。这是因为 Racket CS 的字节码格式 (`.zo`) 对版本非常敏感。

### 0. 检查版本 & 重新编译（新手必读）

为了避免版本地狱，我强烈建议你**不要**依赖系统安装的 Racket，而是直接编译一份专用于该项目的 Racket 库。别担心，这比你想象的要简单。

**Step 0.1: 下载 Racket 源码**

```bash
git clone https://github.com/racket/racket.git
cd racket
# 切换到与 Noise 兼容的稳定版本，例如 v8.12
git checkout v8.12
```

**Step 0.2: 编译 macOS 版本 (用于模拟器和本机调试)**

Racket 默认使用 CS（Chez Scheme）后端。这里采用 in-place build，适合开发、调试以及后续运行时抽取。

```bash
make cs -j$(sysctl -n hw.ncpu)
```

构建完成后，Racket 将以 in-place 形式存在于源码树中，可直接用于后续步骤。

**Step 0.3: 更新 Noise 库**

编译完成后，使用 Noise 自带的脚本把新编译的库复制过去。假设你在 Noise 目录中：

```bash
# assuming /path/to/racket is where you cloned racket
./Bin/copy-libs.sh arm64-macos /path/to/racket
```

**Step 0.4: 进阶 - 编译 iOS 真机版本**

如果需要在 iOS 真机上使用 Racket，需要额外构建一份用于嵌入的 Racket CS 运行时。该过程基于 Noise 的定制构建流程，用于生成可在 iOS 环境中链接和使用的静态运行时库。

在 Racket 仓库根目录下创建独立的构建目录：

```bash
mkdir build-ios
cd build-ios
```

**构建 iOS 真机版本**

```bash
../configure \
    --host=aarch64-apple-darwin \
    --enable-ios=iPhoneOS \
    --enable-pb \
    --enable-racket=auto \
    --enable-libffi

make -j$(sysctl -n hw.ncpu)
```

**Step 0.5: 更新 iOS 真机库**

```bash
./Bin/copy-libs.sh arm64-ios /path/to/racket
```

**重要说明：iOS 模拟器**

对于 iOS 模拟器，你**不需要**单独构建运行时库。Noise 使用 iOS 真机的 boot 文件来支持模拟器环境。`copy-libs.sh` 脚本会自动处理这一点：

```bash
# 这个命令会复制静态库，但不会复制 boot 文件
# （因为模拟器直接使用 iOS 的 boot 文件）
./Bin/copy-libs.sh arm64-iphonesimulator /path/to/racket
```

运行上述脚本后，`Lib/` 和 `Sources/NoiseBoot_*/boot/` 下的文件就会被更新。这样你就彻底解决了 `"version mismatch"` 的隐患。

**Boot 文件位置说明**

- iOS 真机: Sources/NoiseBoot_iOS/boot/arm64-ios
- macOS (ARM64):Sources/NoiseBoot_macOS/boot/arm64-macos
- macOS (x86_64): Sources/NoiseBoot_macOS/boot/x86_64-macos

### 1. 安装 Racket

确保你的 PATH 里有 `racket` 和 `raco` 命令。

### 2. 创建 Swift 项目

在 Xcode 中创建一个新的 iOS 或 macOS App，命名为 `NoiseCalculator`。

### 3. 克隆 Noise

将 Noise 作为子模块放入项目中。推荐包含：`Sources/Noise`, `Sources/NoiseSerde`, `Sources/NoiseBackend`, `Sources/NoiseBoot_iOS` (iOS) 或 `Sources/NoiseBoot_macOS` (macOS)。

## 第一步：定义通信协议 (The Contract)

Noise 的核心理念是 **Code Generation**。我们首先在 Racket 中定义数据结构和接口。

在项目根目录下创建一个名为 `definition.rkt` 的文件：

```racket
#lang racket/base

(require noise/backend)

;; 定义一个数据结构
(define-record OperationLog
  [operator : String]
  [operand1 : Float64]
  [operand2 : Float64]
  [result   : Float64])

;; 定义 RPC 接口
;; 注意：这里只定义接口签名，函数体可以留空
(define-rpc (calculator-add [a : Float64] [b : Float64] : Float64)
  (void)) ;; 占位实现，实际实现在 server.rkt

(define-rpc (calculator-log [op : OperationLog] : Void)
  (void)) ;; 占位实现
```

**说明**：虽然 `define-rpc` 宏会保存函数体作为处理器，但在实际项目中，通常会在 `server.rkt` 中重新定义实现，以便分离接口定义和业务逻辑。这里使用 `(void)` 作为占位实现。

## 第二步：生成 Swift 代码 (The Magic)

通过 Racket 脚本生成对应的 Swift 代码。创建一个 `build.rkt`：

```racket
#lang racket/base
(require noise/codegen
         "definition.rkt") ;; 引入刚才的定义

(with-output-to-file "Generated.swift"
  #:exists 'replace
  (lambda ()
    (write-Swift-code)))
```

运行这个脚本：

```bash
racket build.rkt
```

你会得到一个 `Generated.swift` 文件。把它拖进你的 Xcode 项目中。你会看到里面自动生成了 `OperationLog` 结构体和带有 `calculatorAdd` 方法的 `Backend` 类扩展。

**生成的 API 签名说明**：

生成的 Swift 方法使用**无标签参数**（这是 Racket 到 Swift 代码生成的约定）：

```swift
// 生成的同步方法
public func calculatorAdd(_ a: Float64, _ b: Float64) -> Future<String, Float64>

// 生成的异步便捷方法
public func calculatorAdd(_ a: Float64, _ b: Float64) async throws -> Float64
```

## 第三步：实现 Racket 后端 (The Server)

现在我们需要真正的业务逻辑。创建一个 `server.rkt`：

```racket
#lang racket/base
(require noise/backend
         "definition.rkt") ;; 引入定义以便复用 RPC 声明

(provide main)

;; 实现具体的 RPC 逻辑
;; 注意：函数名必须与 define-rpc 中定义的一致
(define (calculator-add a b)
  (displayln (format "Racket calculating: ~a + ~a" a b))
  (+ a b))

(define (calculator-log op)
  (displayln (format "Log: ~a" op))
  (void))

;; 启动服务的入口函数
;; Noise Backend 会传入两个文件描述符：in 和 out
(define (main in-fd out-fd)
  (serve in-fd out-fd))
```

**说明**：这里我们重新定义了 `calculator-add` 和 `calculator-log`，覆盖了 `definition.rkt` 中的占位实现。

## 第四步：编译 Racket 代码 (The Build)

Noise 直接加载编译后的 `.zo` 字节码。你需要编译你的 Racket 文件。

```bash
raco make server.rkt
```

这将生成 `compiled/server_rkt.zo`（具体路径取决于 Racket 版本）。

**关键步骤**：将生成的 `.zo` 文件以及 `definition_rkt.zo` 添加到 Xcode 项目的 **Copy Bundle Resources** 中。

同时，你也需要 Racket 的启动文件（`.boot`）。根据你的目标平台，从以下位置找到它们并添加到资源包中：
- iOS 真机: `Sources/NoiseBoot_iOS/boot/arm64-ios/` 下的 `petite.boot`, `scheme.boot`, `racket.boot`
- iOS 模拟器: 同样使用 `Sources/NoiseBoot_iOS/boot/arm64-ios/`（模拟器共用 iOS 真机的 boot 文件）
- macOS: `Sources/NoiseBoot_macOS/boot/arm64-macos/` 或 `x86_64-macos/` 下的对应文件

## 第五步：Swift 前端调用 (The Client)

回到 Xcode，在 `ContentView.swift` 或 ViewModel 中：

```swift
import SwiftUI
import Noise
import NoiseBackend

class CalculatorViewModel: ObservableObject {
    var backend: Backend!
    @Published var result: String = ""
    
    init() {
        // 1. 初始化 Backend
        // 这里的路径指向我们在 Copy Bundle Resources 里放入的 server_rkt.zo
        guard let serverZo = Bundle.main.url(forResource: "server_rkt", withExtension: "zo") else {
            fatalError("Could not find server_rkt.zo")
        }

        // "server" 是模块名（Racket文件名），"main" 是我们 export 的入口函数
        self.backend = Backend(withZo: serverZo, andMod: "server", andProc: "main")
    }

    func calculate(a: Double, b: Double) {
        Task {
            do {
                // 2. 像调用 Swift 函数一样调用 Racket
                // 注意：生成的 API 使用无标签参数（_ a: _ b:）
                // 注意：这是异步的！
                let sum = try await backend.calculatorAdd(a, b)
                await MainActor.run {
                    self.result = "\(sum)"
                }
            } catch {
                print("Error: \(error)")
            }
        }
    }
}
```

完整的 SwiftUI 视图示例：

```swift
struct ContentView: View {
    @StateObject private var viewModel = CalculatorViewModel()
    @State private var input1 = ""
    @State private var input2 = ""
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Noise Calculator")
                .font(.largeTitle)
            
            TextField("第一个数", text: $input1)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .keyboardType(.decimalPad)
            
            TextField("第二个数", text: $input2)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .keyboardType(.decimalPad)
            
            Button("计算") {
                if let a = Double(input1), let b = Double(input2) {
                    viewModel.calculate(a: a, b: b)
                }
            }
            .buttonStyle(.borderedProminent)
            
            if !viewModel.result.isEmpty {
                Text("结果: \(viewModel.result)")
                    .font(.title2)
                    .foregroundColor(.green)
            }
        }
        .padding()
    }
}
```

## 避坑指南 (Tips)

1. **Boot Files**: 确保你的 Bundle 里有 `petite.boot`, `scheme.boot`, `racket.boot`。Racket 初始化全靠它们。iOS 模拟器使用与真机相同的 boot 文件，不需要单独准备。

2. **线程模型**: `Backend` 类会自动处理线程。Racket 运行在一个后台线程，Swift 调用在任意线程，回调在后台线程（所以更新 UI 需要切换到 MainActor）。

3. **模块路径**: Racket 的 `require` 机制比较依赖路径。在打包到 iOS App 时，确保所有依赖的 `.zo` 文件都在扁平的目录结构下，或者正确设置了 `current-library-collection-paths`。

4. **API 调用格式**: 生成的 Swift 方法使用无标签参数（`_ param` 而不是 `param: param`），这是 Noise 代码生成器的约定，调用时请遵循此格式。

5. **RPC 实现覆盖**: 虽然 `define-rpc` 在 `definition.rkt` 中包含函数体，但实际运行时会使用 `server.rkt` 中的实现（因为 `server.rkt` 被 `raco make` 编译后优先加载）。建议在 `definition.rkt` 中只定义接口和类型。

## 结语

通过这五个步骤，你已经成功在其 iOS 应用中嵌入了一个全功能的 Racket 后端。

这套架构最美妙的地方在于**分离**。你可以把所有复杂的算法、数据处理逻辑放在 Racket 中（甚至可以在 REPL 里调试代码），而 Swift 只负责渲染漂亮的 UI。

还可以更进一步吗？当然。你可以利用 Racket 强大的宏来 DSL 化你的业务逻辑，然后通过 Noise 这个管道无缝传输给 Swift。