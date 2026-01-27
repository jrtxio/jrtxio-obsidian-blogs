---
{"dg-publish":true,"dg-path":"03 Racket与函数式编程/Noise 系列（四）：如何为 Noise 编译 Racket - 多平台构建指南.md","permalink":"/03 Racket与函数式编程/Noise 系列（四）：如何为 Noise 编译 Racket - 多平台构建指南/"}
---

#lisp/racket #gui/noise 

## 1. macOS 本地编译

对于在 Mac 本机运行的应用，**使用默认编译配置即可**，无需特殊参数。

### 1.1 编译步骤

```bash
# 克隆 Racket 源码仓库
git clone https://github.com/racket/racket.git
cd racket

# 配置并编译（使用默认选项）
./configure
make -j$(sysctl -n hw.ncpu)

# 编译完成后，切换到 Noise 项目并提取所需文件
cd /path/to/Noise  # 切换到 Noise 项目根目录
./Bin/copy-libs.sh arm64-macos /path/to/racket/source
```

### 1.2 Apple Silicon (M1/M2/M3) 和 Intel 的区别

```bash
# Apple Silicon (ARM64)
./Bin/copy-libs.sh arm64-macos /path/to/racket/source

# Intel (x86_64)
./Bin/copy-libs.sh x86_64-macos /path/to/racket/source
```

**关键点**：
- 默认配置会自动生成 `libracketcs.a`、头文件（`chezscheme.h`、`racketcs.h`、`racketcsboot.h`）和 boot 文件（`petite.boot`、`scheme.boot`、`racket.boot`）
- copy-libs.sh 会自动复制对应架构的文件

## 2. iOS 真机编译

这是**需要特殊配置**的场景。iOS 需要可移植字节码（Portable Bytecode）才能在设备上运行。

### 2.1 编译步骤

```bash
# 克隆 Racket 源码
git clone https://github.com/racket/racket.git
cd racket

# 为 iOS 真机配置（ARM64）
./configure \
  --host=aarch64-apple-darwin \
  --enable-ios=iPhoneOS \
  --enable-pb \
  --enable-racket=auto \
  --enable-libffi

# 开始编译
make -j$(sysctl -n hw.ncpu)

# 合并 libffi（必须步骤！）
# 首先获取 libffi，可以用 Homebrew 安装或从源码编译
# 然后合并到 libracketcs.a
libtool -static \
  -o racket/lib/libracketcs1.a \
  racket/lib/libracketcs.a \
  /path/to/libffi.a \
  && mv racket/lib/libracketcs{1,}.a

# 切换到 Noise 项目并提取文件
cd /path/to/Noise
./Bin/copy-libs.sh arm64-ios /path/to/racket/source
```

### 2.2 特殊参数详解

| 参数 | 作用 | 必需性 |
|------|------|--------|
| `--host=aarch64-apple-darwin` | 指定目标架构为 ARM64 Darwin | ✅ 必须 |
| `--enable-ios=iPhoneOS` | 启用 iOS 模式 | ✅ 必须 |
| `--enable-pb` | **关键！** 启用可移植字节码 | ✅ 必须 |
| `--enable-racket=auto` | 自动配置 Racket 子系统 | ✅ 必须 |
| `--enable-libffi` | 启用 libffi 支持（跨平台调用） | ✅ 必须 |

### 2.3 获取 libffi

```bash
# 方法 1：使用 Homebrew 安装
brew install libffi

# 方法 2：从源码编译（交叉编译到 iOS）
git clone https://github.com/libffi/libffi.git
cd libffi
./configure --host=aarch64-apple-darwin \
  --enable-static \
  --disable-shared
make

# libffi.a 就在当前目录
```

## 3. iOS 模拟器编译

iOS 模拟器也需要特殊配置，但 boot 文件可以复用 iOS 真机的版本。

### 3.1 编译步骤

```bash
# 在 Racket 源码目录
git clone https://github.com/racket/racket.git
cd racket

# 为 iOS 模拟器配置
./configure \
  --host=aarch64-apple-darwin \
  --enable-ios=iPhoneSimulator \
  --enable-pb \
  --enable-racket=auto \
  --enable-libffi

# 编译
make -j$(sysctl -n hw.ncpu)

# 合并 libffi
libtool -static \
  -o racket/lib/libracketcs1.a \
  racket/lib/libracketcs.a \
  /path/to/libffi.a \
  && mv racket/lib/libracketcs{1,}.a

# 注意：不需要复制 boot 文件，模拟器使用 iOS 的 boot 文件
# 但需要复制共享库和头文件
cd /path/to/Noise
./Bin/copy-libs.sh arm64-iphonesimulator /path/to/racket/source
```

### 3.2 关于 boot 文件

从 copy-libs.sh 可以看到，脚本对 iPhone Simulator 有特殊处理：

```bash
# 对于 iPhoneSimulator，使用 iOS boot 文件
echo "warning: boot files ignored for $ARCH"
```

这意味着 iOS 模拟器直接使用 iOS 真机的 boot 文件，不需要单独编译。

## 4. 版本匹配策略

### 4.1 使用预编译分支（推荐）

如果你的 Racket 版本与 Noise 提供的分支匹配，可以跳过编译步骤：

```bash
# 在 Noise 项目中切换到对应分支
git checkout racket-9.0      # 或 racket-8.18、racket-8.17 等
make

# 可用的预编译分支：
# racket-9.0, racket-8.18, racket-8.17, racket-8.16, racket-8.15
# racket-8.14, racket-8.13, racket-8.12, racket-8.11.1, racket-8.11, racket-8.10
```

### 4.2 检查版本匹配

```bash
# 检查你当前安装的 Racket 版本
racket --version

# 检查 Noise 预编译文件对应的 Racket 版本
# 这在 README.md 中有详细说明
```

## 5. 常见问题排查

### 5.1 iOS 编译失败

```bash
# 确保 Xcode 命令行工具已安装
xcode-select --install

# 检查 iOS SDK 路径
xcrun --sdk iphoneos --show-sdk-path

# 如果提示找不到 SDK，设置 SDK 路径
export SDKROOT=$(xcrun --sdk iphoneos --show-sdk-path)
```

### 5.2 libffi 合并失败

```bash
# 确保使用 -static 标志编译 libffi
# 如果 libffi.a 是动态库，需要重新编译静态版本

# 检查 libffi.a 是否是静态库
file /path/to/libffi.a
# 应该显示 "current ar archive" 而不是 "Mach-O dynamically linked"
```

### 5.3 版本不匹配导致崩溃

```
症状：运行时出现奇怪的内存错误、段错误

原因：libracketcs.a、boot 文件与你编译 Racket 代码的版本不一致

解决：确保所有组件使用同一版本的 Racket 编译
```

### 5.4 --enable-pb 未生效

```bash
# 检查 configure 输出中是否确认启用了 PB
# 应该看到类似这样的输出：
# "Portable bytecode support: yes"

# 如果没有，检查 configure 参数是否正确
```

## 6. 完整工作流程示例

假设你要为 iOS 应用编译 Racket 8.18：

```bash
# 1. 克隆 Racket 8.18 源码
git clone https://github.com/racket/racket.git
cd racket
git checkout 8.18

# 2. 编译 iOS 真机版本
./configure \
  --host=aarch64-apple-darwin \
  --enable-ios=iPhoneOS \
  --enable-pb \
  --enable-racket=auto \
  --enable-libffi

make -j$(sysctl -n hw.ncpu)

# 3. 合并 libffi
brew install libffi
libtool -static \
  -o racket/lib/libracketcs1.a \
  racket/lib/libracketcs.a \
  $(brew --prefix libffi)/lib/libffi.a \
  && mv racket/lib/libracketcs{1,}.a

# 4. 切换到 Noise 项目
cd /path/to/Noise

# 5. 提取 iOS 真机文件
./Bin/copy-libs.sh arm64-ios /path/to/racket/source

# 6. 重新编译模拟器版本（重复步骤 2-3，改用 iPhoneSimulator）
# 7. 提取模拟器文件
./Bin/copy-libs.sh arm64-iphonesimulator /path/to/racket/source

# 8. 构建 Noise
make
```

## 7. 总结对比表

| 平台 | 配置命令 | libffi | 难度 | 文件目标 |
|------|---------|--------|------|---------|
| macOS ARM64 | `./configure` | 不需要 | ⭐ | `arm64-macos` |
| macOS x86_64 | `./configure` | 不需要 | ⭐ | `x86_64-macos` |
| iOS 真机 | `./configure --enable-ios --enable-pb ...` | **必须** | ⭐⭐⭐ | `arm64-ios` |
| iOS 模拟器 | `./configure --enable-ios --enable-pb ...` | **必须** | ⭐⭐⭐ | `arm64-iphonesimulator` |

**核心要点**：
1. **macOS 本地**：直接 `./configure && make`，最简单
2. **iOS（真机/模拟器）**：必须加 `--enable-pb --enable-ios --enable-libffi` 等参数，还需要合并 libffi
3. **boot 文件**：iOS 模拟器复用真机的 boot 文件，不需要单独编译
4. **版本匹配**：优先使用预编译分支，必要时从源码编译