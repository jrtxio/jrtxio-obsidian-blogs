---
{"dg-publish":true,"dg-path":"03 编程语言与理论/Racket 语言如何快速创建工程模板.md","permalink":"/03 编程语言与理论/Racket 语言如何快速创建工程模板/","created":"2025-11-25T15:03:21.225+08:00","updated":"2025-11-25T15:11:01.663+08:00"}
---

#Innolight #Lisp #Racket 

当你开始一个新的 Racket 项目时，是否常常为如何组织项目结构、配置文件该怎么写而感到困惑？幸运的是，Racket 社区提供了一个非常实用的工具——`raco new`，让你可以快速从模板创建项目，就像其他语言的脚手架工具一样。

# 什么是 raco new？

raco new 是一个命令行工具，它能够从预构建的模板快速创建新的 Racket 应用程序。这些模板托管在 GitHub 的 racket-templates 组织下，涵盖了各种常见的项目类型。

该工具的工作原理很简单：它会克隆你选择的模板仓库，然后移除 git 历史记录，给你一个全新的起点。这意味着你不需要手动删除模板的提交历史，可以立即开始你自己的版本控制。

# 安装 raco new

安装过程非常简单，只需要一条命令：

```bash
raco pkg install new
```

这会将 `new` 包安装到你的 Racket 环境中，并添加 `raco new` 命令到你的命令行工具集。

# 使用 raco new 创建项目

## 查看可用模板

在创建项目之前，你可以先看看有哪些模板可用：

```bash
raco new --list
```

这个命令会列出所有托管在 racket-templates 组织下的可用模板。你也可以访问 [racket-templates 的 GitHub 仓库](https://github.com/racket-templates/racket-templates)查看完整的模板目录。

## 创建新项目

使用模板创建项目的基本语法是：

```bash
raco new <template-name> <optional-folder-location>
```

例如，如果你想创建一个命令行应用：

```bash
raco new cli-command my-cli-app
```

这会在 `my-cli-app` 目录下创建一个基于 cli-command 模板的新项目。如果你省略了目录参数，工具会在当前目录下创建一个以模板名命名的文件夹。

## 常见模板示例

- **rosette**: 用于程序验证和合成的 `#lang rosette` 模板
- **cli-command**: 命令行应用模板
- **gui-app**: GUI 应用程序模板
- **template**: 用于创建新模板的元模板

# 实战：使用模板创建项目

理论说完了，让我们通过两个实际例子来看看如何使用模板创建项目并运行它们。

## 示例 1：创建命令行工具（cli-command）

假设你想创建一个命令行工具，比如一个简单的问候程序：

**第一步：创建项目**

```bash
raco new cli-command my-greeting-tool
cd my-greeting-tool
```

**第二步：查看项目结构**

创建完成后，你会看到项目包含一些基础文件，其中最重要的是主程序文件（通常是 `hello.rkt` 或类似名称）。这是一个可以直接运行的示例程序。

**第三步：运行开发版本**

在开发阶段，你可以直接用 `racket` 命令运行：

```bash
racket hello.rkt
```

或者使用 DrRacket IDE 打开文件并点击运行按钮。

**第四步：编译成可执行文件**

当你准备好发布时，可以将程序编译成独立的可执行文件：

```bash
raco exe -o my-greeting hello.rkt
```

这会创建一个名为 `my-greeting`（或 Windows 上的 `my-greeting.exe`）的可执行文件。

**第五步：测试命令行参数**

cli-command 模板通常包含命令行参数解析示例。你可以查看帮助信息：

```bash
./my-greeting -h
# 或 Windows 上
my-greeting.exe -h
```

**修改代码**

打开 `hello.rkt`，你会看到使用 Racket 的命令行解析库的示例代码。你可以根据需要修改参数定义、添加新功能等。如果需要创建交互式命令行应用，可以考虑使用 [charterm](https://docs.racket-lang.org/charterm/index.html) 包。

## 示例 2：创建图形界面应用（gui-app）

接下来创建一个带图形界面的应用：

**第一步：创建项目**

```bash
raco new gui-app my-calculator
cd my-calculator
```

**第二步：运行应用**

GUI 应用可以直接运行，会弹出一个窗口：

```bash
racket main.rkt
```

或者使用专门的 GUI 运行器：

```bash
gracket main.rkt
```

> **注意**：`gracket` 是 Racket 的 GUI 版本启动器，在某些平台上表现更好。对于简单的 GUI 应用，使用 `racket` 也完全可以。

**第三步：理解模板代码**

gui-app 模板基于经典论文 "Programming Languages as Operating Systems"（1999）的代码现代化版本，它展示了如何使用 Racket 的 GUI 工具包创建窗口、按钮和其他控件。

打开主文件，你会看到使用 `racket/gui` 库的示例：

- 如何创建窗口（frame）
- 如何添加按钮、文本框等控件
- 如何处理用户交互事件

**第四步：编译和分发**

编译 GUI 应用：

```bash
raco exe -o MyCalculator main.rkt
```

如果要创建可分发的独立版本（包含所有依赖库）：

```bash
raco distribute my-calculator-dist MyCalculator
```

这会创建一个 `my-calculator-dist` 目录，包含可以在其他机器上运行的完整应用。

**进一步学习**

- 查看 [Racket GUI 文档](https://docs.racket-lang.org/gui/index.html) 了解更多控件和功能
- 参考 [7GUI 基准测试](https://github.com/mfelleisen/7GUI) 项目，这是一系列 GUI 编程练习
- 探索 Racket 发行版中包含的 [games 合集](https://github.com/racket/games) 查看更多 GUI 示例

## 开发技巧

无论是命令行还是 GUI 应用，以下是一些通用的开发建议：

1. **使用 DrRacket 开发**：DrRacket IDE 提供了很好的调试和开发体验，如果你使用命令行开发，可以安装 `drracket-cmdline-args` 插件来测试命令行参数：

```bash
raco pkg install drracket-cmdline-args
```

2. **增量开发**：从模板提供的简单示例开始，逐步添加功能，而不是一次性重写所有代码
3. **查阅文档**：
    - [命令行解析文档](https://docs.racket-lang.org/reference/Command-Line_Parsing.html)
    - [创建可执行文件文档](https://docs.racket-lang.org/raco/exe.html)
    - [分发应用程序文档](https://docs.racket-lang.org/raco/exe-dist.html)
4. **参考其他模板**：如果你的需求不完全匹配现有模板，可以查看多个模板的代码，学习不同的实现方式
    

# 创建你自己的模板

如果你经常创建某种类型的 Racket 项目，为什么不创建一个自己的模板呢？Racket 社区非常欢迎贡献新模板。

## 第一步：从模板创建模板

是的，你没看错！有一个专门的模板用来帮助你创建新模板：

```bash
raco new template my-awesome-template
```

这会创建一个包含基本配置的模板骨架，你可以在此基础上进行定制。

## 第二步：开发你的模板

开发模板时需要注意以下几点：

1. **选择合适的许可证**：建议使用 MIT 许可证，但你可以根据需要选择
2. **确保模板是可工作的示例**：模板应该是一个尽可能接近实际工作的应用，需要的配置越少越好（最好是零配置）
3. **编写清晰的 README**：说明如何使用你的模板，包含必要的依赖和使用示例
4. **测试你的模板**：确保别人可以顺利使用你的模板创建项目

## 第三步：提交你的模板

当你的模板准备好后，就可以分享给 Racket 社区了：

1. **创建 Pull Request**：访问 [racket-templates/racket-templates](https://github.com/racket-templates/racket-templates) 仓库
2. **添加模板配置文件**：在 `templates` 目录下创建一个以你的模板命名的文件，内容格式如下：

```racket
(name your-template-name
 repo "your-github-username/your-repo-name"
 from github
 desc "简短描述你的模板是做什么的。")
```

例如，Rosette 模板的配置是这样的：

```racket
(name rosette
 repo "racket-templates/rosette-template"
 from github
 desc "A #lang rosette template for program verification and synthesis.")
```

3. **提交 PR**：等待社区审核和合并

模板目前支持托管在 GitHub 和 GitLab 上，如果你想使用其他托管服务，可以向社区提出建议。

# 社区支持

如果你在使用 `raco new` 或创建模板时遇到问题，Racket 社区非常友好和乐于助人：

- **提问**：在 [Racket Discourse](https://racket.discourse.group/) 或 [Racket Discord](https://discord.gg/6Zq8sH5) 上提问，没有愚蠢的问题
- **报告 Bug**：在相应的 GitHub 仓库上创建 issue
- **参与改进**：通过 Pull Request 贡献代码或文档

# 小结

`raco new` 是一个简单但强大的工具，它能帮助你：

- 快速启动新项目，无需从零开始配置
- 学习 Racket 项目的最佳实践和常见结构
- 与社区分享你的项目模板

无论你是 Racket 新手还是经验丰富的开发者，`raco new` 都能让你的开发流程更加高效。现在就试试吧，从一个模板开始你的下一个 Racket 项目！