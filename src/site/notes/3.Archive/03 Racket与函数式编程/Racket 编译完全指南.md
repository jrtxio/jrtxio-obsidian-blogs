---
{"dg-publish":true,"dg-path":"03 Racket与函数式编程/Racket 编译完全指南.md","permalink":"/03 Racket与函数式编程/Racket 编译完全指南/"}
---

#lisp/racket

作为一名开发者，从源代码编译 Racket 不仅能让你获得最新的功能和性能优化，还能深入了解这个强大的语言实现。无论你是在 Linux、macOS 还是 Windows 上，这篇指南都会带你一步步完成编译过程。

## 仓库结构

Racket 仓库被组织成不同的目录，以分离源代码、标准库、包和构建基础设施。理解这种结构有助于你有效地浏览代码库。

```
racket/racket/
├── racket/src/                 │   ├── cs/                     # Racket CS (Chez Scheme) 实现
│   ├── bc/                     # Racket BC (C/字节码) 实现  
│   ├── expander/               # 宏扩展器和模块系统
│   ├── ChezScheme/             # 嵌入的 Chez Scheme 源代码
│   ├── rktio/                  # Racket I/O 抽象层
│   ├── worksp/                 # 工作区管理
│   └── version/                # 版本配置
│
├── racket/collects/            # Racket 标准库
│   ├── racket/                 # 核心 Racket 语言模块
│   ├── compiler/               # 编译器基础设施
│   ├── syntax/                 # 语法和宏系统
│   ├── net/                    # 网络库
│   ├── pkg/                    # 包管理
│   ├── setup/                  # 安装和设置工具
│   └── [many other collections]
│
├── pkgs/                       # 附加包
│   ├── base/                   # 基础语言包
│   ├── compiler-lib/           # 编译器库工具
│   ├── racket-doc/             # 文档源代码
│   ├── net-lib/                # 网络库
│   └── [package libraries]
│
├── main.zuo                    # Zuo 构建系统入口点
├── Makefile                    # 构建配置（封装 main.zuo）
├── README.md                   # 仓库概述
└── build.md                    # 官方构建说明
```

> **说明**：`Makefile` 实际上是一个封装层，所有构建操作都通过 main.zuo（Zuo 构建系统）执行。你可以直接使用 `zuo .` 命令代替 `make` 来调用相同的构建目标。

## 平台准备

### Unix/Linux 系统

在大多数 Linux 发行版上，你需要安装以下基础工具：

```bash
# Ubuntu/Debian
sudo apt-get install build-essential git

# Fedora/RHEL
sudo dnf install gcc make git

# Arch Linux
sudo pacman -S base-devel git
```

### macOS

在 macOS 上，确保你已安装 Xcode 命令行工具：

```bash
xcode-select --install
```

### Windows

Windows 的构建稍微复杂一些，需要：

- Microsoft Visual Studio（2008/9.0 到 2022/17.0 版本）
- 或者使用 Windows Subsystem for Linux (WSL)

## 快速开始：原地构建（推荐）

原地构建是默认且推荐的模式，它将构建和安装合并为一个操作，非常适合开发。

### Unix/Linux 和 macOS

```bash
# 克隆仓库
git clone https://github.com/racket/racket.git
cd racket

# 开始原地构建
make in-place

# 或者直接使用 make（默认就是 in-place）
make
```

构建过程会：

1. 编译 Zuo 构建系统
2. 构建最小化的 Racket
3. 从包服务器下载并安装指定的包（默认是 `main-distribution` 和 `main-distribution-test`）
4. 将 `pkgs/` 目录中的包链接到开发模式
5. 构建并安装文档

构建完成后，Racket 安装在仓库的 `racket/` 子目录中，可以直接使用：

```bash
# 测试安装
./racket/bin/racket --version

# 运行 REPL
./racket/bin/racket
```

### Windows

在 Windows 上，首先需要配置 Visual Studio 环境：

```cmd
# 打开 Developer Command Prompt for VS
# 然后进入 Racket 源代码目录
cd racket

# 配置构建环境（选择 x64 或 x86）
racket\src\worksp\msvcprep.bat x64

# 开始构建
nmake
```

`nmake` 命令会执行与 Unix 上 `make in-place` 相同的操作。

## 高级构建选项

### 选择特定包

默认情况下，构建系统会安装 `main-distribution` 和 `main-distribution-test` 包。如果你想只安装特定包：

```bash
make in-place PKGS="gui-lib readline-lib"
```

### 并行构建

利用多核 CPU 加速构建过程：

```bash
# 使用 GNU make 的 -j 选项
make -j4

# 或者使用更便携的 JOBS 变量
make JOBS=4
```

### 基础构建 vs 完整构建

**基础构建（仅构建最小化 Racket）**：

```bash
make base
```

`make base` 只编译 Racket 核心，不下载或安装任何包。构建完成后，你需要手动使用 `raco pkg` 安装所需的包。这种方式适合交叉编译引导或需要完全控制包安装的场景。

**完整构建（默认）**：

```bash
make in-place
```

`make in-place` 在 `make base` 的基础上，还会从包服务器下载并安装默认包，并构建文档。

### 使用本地包构建

如果你已经下载过包，想避免再次下载：

```bash
make as-is
```

`make as-is` 使用 `pkgs/` 目录中已有的包和本地缓存构建，不会从网络下载任何新包。如果本地缺少必要的包，构建可能会失败。

### 构建特定实现

Racket 有两种主要实现：

**Racket CS（Chez Scheme 实现）- 默认推荐**

```bash
# 构建并安装 Racket CS（这是 make in-place 的简写）
make cs

# 或更明确的方式
make in-place VM=cs
```

> **注意**：`make cs` 不是独立构建模式，而是 `make in-place` 的变体，明确指定使用 Racket CS 实现。

**Racket BC（字节码实现）**

```bash
# 构建并安装 Racket BC
make bc

# 或更明确的方式
make in-place VM=bc
```

**同时构建两种实现**：

```bash
make both
```

### 增量构建

如果你已经完成过一次完整构建，只想重新编译已修改的代码而不下载新包：

```bash
# 重新构建 CS，不下载新包
make also-cs

# 重新构建 BC，不下载新包
make also-bc
```

### Unix 风格安装

如果你想要一个干净的生产环境安装，可以使用 Unix 风格：

```bash
# Unix/Linux
make unix-style PREFIX=/usr/local/racket

# macOS
make unix-style PREFIX=/usr/local/racket
```

Unix 风格安装会将 Racket 安装到指定目录，构建完成后可以删除源代码目录。

**注意**：Unix 风格安装在 Windows 上不支持。

## 重新构建和更新

### 更新现有构建

```bash
# 拉取最新代码
git pull

# 重新构建（会下载新包）
make in-place

# 或者只重新构建，不下载新包
make as-is
```

### 本地修改后重新构建

如果你只修改了 `pkgs/` 目录中的包文件，不需要完整的重新构建：

```bash
./racket/bin/raco setup
```

如果修改了核心 Racket 代码（`racket/src/` 或 `racket/collects/`）：

```bash
# 完整重新构建
make as-is
```

## 常见问题排查

### 构建失败

**macOS 代码签名问题**：在 Apple Silicon 上可能会遇到代码签名冲突，这是构建系统和现代 macOS 工具链之间的已知问题。

**内存不足**：如果构建过程中遇到内存问题，尝试减少并行构建的任务数：

```bash
make JOBS=2
```

**依赖问题**：确保所有必需的构建工具都已安装。

**包下载失败**：检查网络连接，或使用 `make as-is` 使用本地已有包。

### 平台特定问题

**Windows 构建错误**：
- 确保使用正确的 Visual Studio 版本
- 确保正确配置了构建环境变量（`msvcprep.bat`）
- 确保使用 `nmake` 而不是 `make`

**Linux 编译器兼容性**：
- 某些旧发行版可能需要更新的编译器
- 考虑使用容器环境进行构建

## 交叉编译和定制化构建（高级）

对于高级用户，Racket 支持交叉编译，但需要正确配置多个变量：

```bash
# 为 ARM Linux 交叉编译（简化示例）
make in-place \
  CONFIGURE_ARGS="--host=arm-linux" \
  BOOTFILE_RACKET=/path/to/host/racket
```

> **注意**：交叉编译是一个复杂的主题，完整的配置涉及 `BOOTFILE_RACKET`、`SCHEME`、`CS_HOST_WORKAREA_PREFIX` 等多个变量。详细信息请参考 build.md。

你可以通过 `CONFIGURE_ARGS` 传递额外的配置选项：

```bash
make in-place CONFIGURE_ARGS="--enable-pthread"
```

## 构建时间对比

不同的构建模式有不同的构建时间：

| 构建模式 | 构建时间 | 说明 |
|---------|---------|------|
| 源代码发行版（带预构建包） | 最快 | 只需编译平台特定组件 |
| Git 仓库原地构建（首次） | 中等 | 完整构建 + 包下载 |
| Git 仓库原地构建（更新） | 较快 | 增量构建 |
| 最小化构建（make base） | 最基础 | 不包含包和文档 |

## 总结和建议

根据你的需求选择合适的构建方式：

| 用途 | 推荐方式 |
|------|----------|
| 开发和贡献 | `make in-place` |
| 生产环境部署 | `make unix-style PREFIX=...` |
| 快速测试最新功能（有缓存） | `make as-is` |
| 学习 Racket 内部 | `make base` + 手动包安装 |
| 明确使用 CS 实现 | `make cs` 或 `make in-place VM=cs` |

从源代码编译 Racket 可能看起来有些复杂，但一旦你设置了环境并理解了构建过程，就会体会到它的灵活性和强大功能。无论是为了贡献代码，还是为了获取最新特性，掌握 Racket 的编译过程都是值得的投资。