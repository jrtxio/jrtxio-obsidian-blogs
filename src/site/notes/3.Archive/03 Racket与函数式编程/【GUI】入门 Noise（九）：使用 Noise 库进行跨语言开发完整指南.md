---
{"dg-publish":true,"dg-path":"03 Racket与函数式编程/【GUI】入门 Noise（九）：使用 Noise 库进行跨语言开发完整指南.md","permalink":"/03 Racket与函数式编程/【GUI】入门 Noise（九）：使用 Noise 库进行跨语言开发完整指南/"}
---

#lisp/racket #gui/noise  

本文将结合 `NoiseBackendExample` 官方示例，深入解析使用 Noise 库进行跨语言（Swift + Racket）开发的完整流程。

## 1. 核心架构：前端与后端的协奏

![Pasted image 20260122135259.png|650](/img/user/0.Asset/resource/Pasted%20image%2020260122135259.png)

使用 Noise 的工程典型的架构分为两部分：

- **Swift (前端)**：负责 UI 展示、用户交互。
- **Racket (后端)**：作为嵌入式后端，负责业务逻辑、数据处理、甚至网络请求。

两者通过 Noise 提供的 **RPC (远程过程调用)** 机制进行通信。

## 2. 开发流程：从定义到实现

开发一个功能通常遵循以下步骤：

### 第一步：在 Racket 中定义数据结构

在业务逻辑文件中（例如 `core/hn.rkt`），我们使用 `define-record` 定义数据结构：

```racket
;; core/hn.rkt
(define-record Story
  [id : UVarint]
  [title : String]
  [comments : (Listof UVarint)])

(define-record Comment
  [id : UVarint]
  [author : String]
  [timestamp : String]
  [text : String])
```

这些数据结构定义是整个通信契约的基础。

### 第二步：在 Racket 中定义 RPC 接口

在入口文件中（例如 `core/main.rkt`），我们使用 `define-rpc` 定义对外的接口：

```racket
;; core/main.rkt
(define-rpc (get-top-stories : (Listof hn:Story))
  (hn:get-top-stories))

(define-rpc (get-comments [for-item id : UVarint] : (Listof hn:Comment))
  (hn:get-comments id))
```

这些定义暴露了后端可供前端调用的接口。

### 第三步：编写 Racket 业务逻辑

在 Racket 侧实现具体的逻辑（例如 `core/hn.rkt`）。这部分代码是纯 Racket 代码，可以使用 Racket 强大的库（如 `net/http-easy`）：

```racket
;; core/hn.rkt
(define (get-top-stories [limit 30])
  (define story-ids
    (response-json
     (get (~url "topstories.json"))))
  (for/list/concurrent ([id (in-list story-ids)]
                        [_ (in-range limit)])
    (get-story id)))

(define (get-comments item-id)
  (define data (get-item item-id))
  (filter values (for/list/concurrent ([id (in-list (hash-ref data 'kids null))])
                   (get-comment id))))
```

### 第四步：生成 Swift 绑定代码

这是 Noise 的魔法所在。我们不需要手动编写 Swift 的网络请求或数据解析代码。Noise 提供了一个编译器工具 `raco noise-serde-codegen`，它会读取 Racket 文件，自动生成对应的 Swift 代码。

在示例中，生成的代码位于 `NoiseBackendExample/Backend.swift`。它包含了：

- 与 Racket `Story` 对应的 Swift `struct Story`。
- 与 Racket `Comment` 对应的 Swift `struct Comment`。
- 一个 `Backend` 类，包含了 `getTopStories()` 等异步方法。

### 第五步：在 Swift 中调用

在 Swift 工程中，我们只需要初始化 Backend，然后像调用本地异步函数一样调用后端逻辑：

```swift
// Model.swift
let b = Backend(
    withZo: Bundle.main.url(forResource: "res/core-\(ARCH)", withExtension: ".zo")!,
    andMod: "main",
    andProc: "main"
)
let stories = try await b.getTopStories()
```

## 3. 编译与构建原理：从 Racket 到 App 资源

当我们在 Xcode 中点击运行，或者在终端执行 `make` 时，通过 Makefile 发生了一系列构建动作。

### 编译流程图

![Pasted image 20260121113846.png](/img/user/0.Asset/resource/Pasted%20image%2020260121113846.png)

### 关键构建步骤解析 (基于 Makefile)

#### 1. 编译 Racket 运行时 (`.zo` 文件)

```bash
raco ctool --runtime ${RUNTIME_PATH} --runtime-access ${RUNTIME_NAME} --mods ${APP_SRC}/res/core-${ARCH}.zo ${RKT_SRC}/main.rkt
```

- `raco ctool` 是 Racket 的编译工具。
- 它将所有的 Racket 源代码及其依赖（包括标准库中用到的部分）打包编译成一个单一的二进制文件（`.zo` 格式）。
- 这个 `.zo` 文件包含了整个"后端"逻辑和运行时环境。
- 这也是为什么最终的 App 不需要安装 Racket 解释器也能运行的原因，所有需要的都被打进去了。

#### 2. 生成 Swift 代码 (Backend.swift)

```bash
raco noise-serde-codegen ${RKT_SRC}/main.rkt > ${APP_SRC}/Backend.swift
```

- 这个命令分析 `main.rkt` 中的 `define-rpc` 和 `define-record`。
- 生成的 `Backend.swift` 负责序列化（Serialization）和反序列化数据，并通过 Noise 底层通道发送给嵌入的 Racket 运行时。

## 4. Swift 工程管理

### 资源文件的引入

编译生成的 `.zo` 文件（例如 `res/core-arm64.zo`）被视为资源文件（Resource）。在 Swift 代码中，通过 `Bundle.main.url` 加载这个文件：

```swift
Bundle.main.url(forResource: "res/core-\(ARCH)", withExtension: ".zo")
```

这也解释了为什么 Makefile 中要根据架构（`uname -m`）来命名文件，因为不同的 CPU 架构（x86_64 vs arm64）需要不同的 Racket 字节码/运行时。

### 启动后端

在 App 启动时（例如 `Model` 初始化时），Swift 代码会创建一个 `Backend` 实例。这个初始化过程实际上是在 App 进程内启动了一个微型的 Racket 虚拟机，加载了我们编译好的 `.zo` 文件，并开始监听请求。

`andMod: "main"` 对应 Racket 中的模块名（`main.rkt` 提供的模块），`andProc: "main"` 对应 Racket 中的主函数：

```racket
;; core/main.rkt
(define (main in-fd out-fd)
  (module-cache-clear!)
  (collect-garbage)
  (let/cc trap
    (parameterize ([exit-handler
                    (lambda (err-or-code)
                      (when (exn:fail? err-or-code)
                        ((error-display-handler)
                         (format "trap: ~a" (exn-message err-or-code))
                         err-or-code))
                      (trap))])
      (define stop (serve in-fd out-fd))
      (with-handlers ([exn:break? void])
        (sync never-evt))
      (stop))))
```

这个 `main` 函数接收两个文件描述符参数（`in-fd` 和 `out-fd`），用于 RPC 通信的输入输出流。

## 5. 实战指南：如何构建自己的 Noise 工程

如果你想从零开始构建一个使用 Noise 的 App，建议遵循以下结构和配置。

### 建议的工程目录结构

保持清晰的分层非常重要。建议采用如下结构：

```
MyNoiseApp/
├── Makefile             # 核心构建脚本
├── core/                # [后端] Racket 源码目录
│   ├── main.rkt         # 入口文件 (定义 RPC 和启动函数)
│   └── hn.rkt           # 业务逻辑与数据结构定义
├── MyiOSApp/            # [前端] iOS 工程目录 (Xcode Project)
│   ├── Backend.swift    # 自动生成的绑定代码 (不要手动修改)
│   ├── Model.swift      # 状态管理与后端调用
│   └── res/             # 存放编译后的 .zo 资源 (由 Makefile 生成)
└── ...
```

### Makefile 适配模板

你可以直接复制下面的 Makefile 模板，并根据你的项目名称修改开头的变量即可：

```makefile
# === 配置区域 ===
# 你的 Swift 工程文件夹名称
APP_SRC = MyiOSApp
# 你的 Racket 源码文件夹名称
RKT_SRC = core
# Racket 入口文件名称 (通常是 main.rkt)
RKT_MAIN = main.rkt
# === 自动构建逻辑 (通常无需修改) ===

ARCH = $(shell uname -m)
# 编译产物存放路径 (对应 Swift 中的 Bundle Resource)
RESOURCES_PATH = ${APP_SRC}/res
RUNTIME_NAME = runtime-${ARCH}
RUNTIME_PATH = ${RESOURCES_PATH}/${RUNTIME_NAME}

.PHONY: all clean

# 默认目标：编译 Racket 运行时 + 生成 Swift 代码
all: ${RESOURCES_PATH}/core-${ARCH}.zo ${APP_SRC}/Backend.swift

clean:
	rm -r ${RESOURCES_PATH}

# 规则 1: 编译 Racket 代码为 .zo 库
${RESOURCES_PATH}/core-${ARCH}.zo: ${RKT_SRC}/*.rkt
	@mkdir -p ${RESOURCES_PATH}
	@rm -fr ${RUNTIME_PATH}
	@echo "Compiling Racket core..."
	raco ctool \
	  --runtime ${RUNTIME_PATH} \
	  --runtime-access ${RUNTIME_NAME} \
	  --mods $@ ${RKT_SRC}/${RKT_MAIN}

# 规则 2: 生成 Swift 绑定代码
${APP_SRC}/Backend.swift: ${RKT_SRC}/${RKT_MAIN}
	@echo "Generating Swift bindings..."
	raco noise-serde-codegen ${RKT_SRC}/${RKT_MAIN} > $@
```

### 使用步骤

1. **创建目录**：按照上述结构创建文件夹。
2. **保存 Makefile**：将模板保存为 `Makefile`。
3. **编写 Racket**：
   - 在 `core/hn.rkt` 中定义数据结构（`define-record`）和业务逻辑
   - 在 `core/main.rkt` 中定义 RPC 接口（`define-rpc`）和启动函数
4. **初次编译**：在终端运行 `make`。
   - 这会生成 `MyiOSApp/res/core-arm64.zo` (或其他架构)。
   - 这会生成 `MyiOSApp/Backend.swift`。
5. **Xcode 配置**：
   - 将 `Backend.swift` 拖入 Xcode 工程。
   - 将 `res` 文件夹拖入 Xcode 工程（确保选择 "Create folder references"，这样文件夹结构会被保留，且里面的新文件会被自动识别）。
6. **迭代开发**：
   - 每次修改 Racket 代码后，运行 `make` 更新资源和绑定代码。
   - 在 Xcode 中运行 App 即可看到最新效果。

## 总结

使用了 Noise 库后，开发模式转变为：

1. **定义数据**：在 Racket 侧（如 `core/hn.rkt`）定义数据结构。
2. **定义接口**：在 Racket 侧（如 `core/main.rkt`）定义 RPC 接口和启动函数。
3. **生成**：自动生成 Swift 胶水代码。
4. **打包**：将 Racket 侧编译为独立的 `.zo` 资源包。
5. **运行**：Swift 加载资源包，并在本地通过内存/管道直接与 Racket 逻辑通信。

这种模式极大地简化了跨语言调用的复杂性，让开发者可以专注于业务逻辑，同时享受 Swift 的 UI 优势和 Racket 的逻辑表达能力。