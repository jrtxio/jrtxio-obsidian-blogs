---
{"dg-publish":true,"dg-path":"03 编程语言与理论/DrRacket Quickscript 入门指南.md","permalink":"/03 编程语言与理论/DrRacket Quickscript 入门指南/","created":"2025-11-25T14:50:13.894+08:00","updated":"2025-11-25T15:40:55.123+08:00"}
---

#Innolight #Lisp #Racket 
# 引言

如果你正在使用 DrRacket，那么你很可能已经发现了菜单栏中的 **Scripts** 菜单。这个看似不起眼的功能，实际上是 DrRacket 内置的强大脚本系统——**Quickscript**。通过 Quickscript，你可以用简短的 Racket 代码来自动化编辑器操作、扩展功能，而且**无需重启 DrRacket**。

本文将带你全面了解 Quickscript 的核心概念和使用方法，帮助你从零开始编写自己的脚本，真正让 DrRacket 成为适合你工作流的个性化工具。

# 什么是 Quickscript？

Quickscript 让你可以轻松地用小型 Racket 脚本来扩展 DrRacket，自动化编辑器中的操作，同时避免重启 DrRacket。每个脚本会自动添加到 Scripts 菜单中，你可以为脚本指定键盘快捷键，还能直接访问 DrRacket 的 GUI 元素进行高级操作。

## Quickscript 的特点

- **即时生效**：创建或修改脚本后，只需重新加载菜单，无需重启 DrRacket
- **简单易用**：创建新脚本只需点击菜单项，填写名称即可
- **功能强大**：可以处理选中文本、访问编辑器对象、操作文件、甚至修改 DrRacket 界面
- **易于分享**：每个脚本就是一个 `.rkt` 文件，可以轻松分享和安装

# 安装与准备

## 基础安装

Quickscript 已经随 DrRacket 自动安装，所以你不需要做任何额外操作就可以开始使用。

## 安装脚本库：quickscript-extra

虽然 Quickscript 本身可以独立使用，但强烈建议安装 quickscript-extra 包，它包含了大量实用脚本以及一些供用户自定义的示例脚本。

**安装方法**：

1. 在 DrRacket 中，点击 `File | Package Manager`
2. 在 "Package Source" 输入框中输入 `quickscript-extra`
3. 点击 "Install"

或者使用命令行：

```bash
raco pkg install quickscript-extra
```

安装完成后，点击 `Scripts | Manage | Compile scripts` 即可激活脚本（无需重启 DrRacket）。

# 第一个脚本：文本反转

让我们从一个简单的例子开始，创建一个反转选中文本的脚本。

## 步骤 1：创建脚本

1. 点击 `Scripts | Manage | New script...`
2. 输入脚本名称：`Reverse`
3. DrRacket 会自动在用户脚本目录中创建 `reverse.rkt` 文件并打开它

## 步骤 2：编写脚本代码

修改 define-script 定义为以下内容：

```racket
#lang racket/base
(require quickscript)

(define-script reverse-selection
  #:label "Reverse"
  (λ (selection)
    (list->string (reverse (string->list selection)))))
```

**代码说明**：

- `#:label "Reverse"`：指定脚本在菜单中显示的名称
- `(λ (selection) ...)`：定义脚本函数，`selection` 参数是当前选中的文本
- `(reverse (string->list selection))`：将字符串转为字符列表并反转

## 步骤 3：使用脚本

1. 保存文件（`Ctrl+S` 或 `Cmd+S`）
2. 在新标签页中输入一些文本，例如 `hello world`
3. 选中这些文本
4. 点击 `Scripts | Reverse`

你会看到文本被反转为 `dlrow olleh`！

# 核心概念详解

## 1. define-script 的基本结构

每个脚本都使用 `define-script` 宏来定义。完整的语法格式如下：

```racket
(define-script script-name
  ;; 属性（Properties）
  #:label "Menu Label"
  #:help-string "Description of the script"
  #:menu-path ("Submenu" "Subsubmenu")
  #:shortcut #\a
  #:shortcut-prefix (ctl shift)
  #:output-to selection
  #:persistent
  #:os-types (unix macosx windows)
  
  ;; 脚本函数
  (λ (selection #:frame fr #:editor ed #:file f)
    ;; 脚本逻辑
    "result string"))
```


> [!NOTE]
> 属性的参数是字面量，不是表达式，因此不能被引号包裹。这是因为 Quickscript 会读取脚本文件两次：第一次只提取必要的信息来构建菜单项（轻量快速），第二次才真正加载和执行脚本模块。

## 2. 脚本函数的参数

脚本函数至少需要一个 `selection` 参数，表示当前选中的文本。此外还可以使用以下可选的关键字参数：

- **`#:file`**：当前文件的路径（如果文件未保存则为 `#f`）
- **`#:editor`**：当前编辑器对象（定义窗口或交互窗口）
- **`#:definitions`**：定义窗口的编辑器对象
- **`#:interactions`**：交互窗口的编辑器对象
- **`#:frame`**：DrRacket 的主窗口框架对象（用于高级操作）

**示例：显示当前文件路径**

```racket
(define-script current-file-example
  #:label "Current file example"
  #:output-to message-box
  (λ (selection #:file f)
    (string-append "File: " 
                   (if f (path->string f) "no-file")
                   "\nSelection: " 
                   selection)))
```

## 3. 脚本属性详解

### #:label（必需）

菜单中显示的脚本名称。

### #:menu-path

将脚本放入子菜单的路径。例如：

```racket
#:menu-path ("Text" "Transform")
```

会创建 `Scripts > Text > Transform > [你的脚本]` 的菜单结构。

### #:shortcut 和 #:shortcut-prefix

为脚本分配键盘快捷键：

```racket
#:shortcut #\r
#:shortcut-prefix (ctl shift)  ; Ctrl+Shift+R
```

### #:output-to

指定脚本输出的目标位置：

- `selection`（默认）：替换当前选中的文本
- `new-tab`：在新标签页中显示输出
- `message-box`：在消息框中显示
- `clipboard`：复制到剪贴板
- `#f`：不输出（适合只执行副作用的脚本）

### #:persistent

如果不提供 #:persistent 关键字，每次调用脚本都会在新的命名空间中执行。但如果提供了 #:persistent，则只在第一次调用时创建命名空间，后续调用会重用相同的命名空间。

**持久化脚本示例：计数器**

```racket
(define count 0)

(define-script persistent-counter
  #:label "Persistent counter"
  #:persistent
  #:output-to message-box
  (λ (selection)
    (set! count (+ count 1))
    (number->string count)))
```

每次点击这个脚本，计数器都会增加。如果不使用 `#:persistent`，计数器永远显示 1。

**重置持久化脚本**：点击 `Scripts | Manage | Stop persistent scripts`。

### #:os-types

限制脚本只在特定操作系统上运行：

```racket
#:os-types (unix macosx)  ; 不在 Windows 上运行
```

# 高级功能：Hooks（钩子）

除了手动触发的脚本，Quickscript 还支持**钩子（Hooks）**，它们在特定事件发生时自动运行，不会在菜单中创建项目。

## define-hook 的语法

```racket
(define-hook hook-name
  #:help-string "Description"
  #:persistent
  (λ (#:frame fr #:file f ...)
    ;; 钩子逻辑
    (void)))
```

## 可用的钩子类型

- **`after-load-file`**：文件加载后触发
- **`on-save-file`**：文件保存前触发
- **`after-save-file`**：文件保存后触发
- **`after-create-new-tab`**：创建新标签页时触发
- **`on-tab-change`**：标签页切换时触发
- **`on-tab-close`**：标签页关闭前触发
- **`on-startup`**：DrRacket 启动时触发
- **`after-create-new-drracket-frame`**：新建 DrRacket 窗口后触发
- **`on-close`**：DrRacket 窗口关闭时触发

## 钩子示例：文件加载提示

```racket
(define-hook after-load-file
  (λ (#:file f #:in-new-tab? new-tab?)
    (message-box "File Loaded" 
                 (format "Loaded: ~a\nNew tab: ~a" 
                         (if f (path->string f) "unnamed")
                         new-tab?))))
```

# 实用脚本示例

## 1. 在选中文本周围添加括号

```racket
(define-script wrap-parens
  #:label "Wrap with Parentheses"
  #:shortcut #\p
  #:shortcut-prefix (ctl)
  (λ (selection)
    (string-append "(" selection ")")))
```

## 2. 转换为大写

```racket
(define-script to-upper
  #:label "To Uppercase"
  #:menu-path ("Text")
  (λ (selection)
    (string-upcase selection)))
```

## 3. 插入当前日期时间

```racket
(require racket/date)

(define-script insert-datetime
  #:label "Insert Date/Time"
  #:output-to selection
  (λ (selection)
    (date->string (current-date) #t)))
```

## 4. 统计选中文本的字数

```racket
(define-script word-count
  #:label "Word Count"
  #:output-to message-box
  (λ (selection)
    (define words (length (string-split selection)))
    (format "Word count: ~a" words)))
```

## 5. 在新标签页中评估表达式

```racket
(define-script eval-to-new-tab
  #:label "Eval to New Tab"
  #:output-to new-tab
  (λ (selection)
    (with-output-to-string
      (λ () 
        (pretty-print (eval (read (open-input-string selection))))))))
```

## 6. 高级示例：获取所有打开的标签页数量

```racket
(require racket/class)

(define-script count-tabs
  #:label "Count Tabs"
  #:output-to message-box
  (λ (selection #:frame fr)
    (format "Number of tabs: ~a" 
            (send fr get-tab-count))))
```

# 脚本管理

## 脚本文件位置

用户创建的脚本保存在系统的首选项目录下。可以通过 `Scripts | Manage | Open script...` 快速访问。

## 脚本库管理

点击 `Scripts | Manage | Library` 可以：

- 添加额外的脚本目录
- 启用/禁用特定脚本
- 排除某些文件

## 重新加载脚本

- **`Scripts | Manage | Reload menu`**：重新加载菜单结构（修改 `#:label` 等属性后需要）
- **`Scripts | Manage | Compile scripts`**：编译所有脚本（安装新脚本或更新后需要）

# Shadow Scripts（影子脚本）

当你安装第三方脚本包（如 quickscript-extra）时，你可能想要修改某些脚本的属性（如快捷键或菜单路径），但直接修改会在包更新时丢失。

**解决方案**：使用 **Shadow Scripts**。

## 创建 Shadow Script

1. 打开 `Scripts | Manage | Library`
2. 选择第三方脚本目录（如 quickscript-extra）
3. 选择想要自定义的脚本
4. 点击 **Shadow**

这会在你的用户脚本目录中创建一个新脚本，它会调用原始脚本的逻辑，但你可以自由修改其属性，且不会在包更新时丢失。

# 从网络获取脚本：url2script

quickscript-extra 包含一个特殊的脚本叫 `url2script`，可以直接从网络获取脚本。

## 使用方法

1. 找到脚本的原始代码 URL（如 GitHub Gist、GitLab Snippet）
2. 点击 `Scripts | url2script | Fetch script...`
3. 粘贴 URL

url2script 足够智能，可以理解来自 GitHub Gists、GitLab Snippets、Pastebin 和 PasteRack 的非原始 URL。

## 更新已获取的脚本

1. 通过 `Scripts | Manage | Open script...` 打开脚本
2. 点击 `Scripts | url2script | Update current script`

# 调试技巧

## 1. 使用 message-box 输出调试信息

```racket
(define-script debug-example
  #:label "Debug"
  #:output-to message-box
  (λ (selection #:file f)
    (format "Selection: ~s\nFile: ~s" selection f)))
```

## 2. 在 REPL 中测试脚本逻辑

在编写复杂脚本前，先在 DrRacket 的交互窗口中测试核心逻辑。

## 3. 检查持久化状态

如果持久化脚本行为异常，使用 `Scripts | Manage | Stop persistent scripts` 重置状态。

# 最佳实践

## 1. 保持脚本简洁

每个脚本应该专注于一个任务。如果需要复杂功能，可以创建多个脚本，或者在脚本中调用其他脚本的函数。

## 2. 添加帮助信息

```racket
#:help-string "Reverses the selected text character by character"
```

## 3. 合理使用菜单路径

将相关脚本组织到同一子菜单中：

```racket
#:menu-path ("Text" "Transform")
```

## 4. 分配直观的快捷键

为常用脚本分配快捷键，但要避免与 DrRacket 内置快捷键冲突。

## 5. 脚本命名规范

- 函数名使用小写和连字符：`my-script-function`
- 避免使用与 Racket 内置函数重名的名称（如 `reverse`）

## 6. 错误处理

对可能失败的操作添加错误处理：

```racket
(define-script safe-eval
  #:label "Safe Eval"
  #:output-to message-box
  (λ (selection)
    (with-handlers ([exn:fail? (λ (e) 
                                  (format "Error: ~a" 
                                          (exn-message e)))])
      (format "Result: ~a" 
              (eval (read (open-input-string selection)))))))
```

# 分享你的脚本

## 方法 1：发布为 Gist

最简单的方式是将小型脚本发布为 Gist 或在 PasteRack 上发布，然后分享链接。

1. 在 [GitHub Gist](https://gist.github.com/) 上创建新 Gist
2. 粘贴脚本代码
3. 添加许可证信息（如 MIT 或 Apache 2.0）
4. 分享 Gist URL

其他用户可以通过 `url2script` 直接安装。

## 方法 2：创建包

如果你有一组相关的脚本，可以创建一个 Racket 包并发布到 [pkgs.racket-lang.org](https://pkgs.racket-lang.org/)。

# 进一步探索

## 查看 quickscript-extra 中的脚本

quickscript-extra 包含了各种实用脚本，例如：

- `abstract-variable`：从选中的表达式创建变量
- `bookmarks`：在代码行之间快速导航
- `color-chooser`：颜色选择器
- `open-terminal`：在当前文件目录打开终端
- `backup-file`：自动备份文件

浏览这些脚本的源码是学习高级技巧的好方法。

## 访问 Racket Wiki

可以在 Racket Wiki 上找到更多脚本：[Quickscript Scripts for DrRacket](https://github.com/racket/racket/wiki/Quickscript-Scripts-for-DrRacket)

# 结语

Quickscript 是 DrRacket 中一个被低估但极其强大的功能。通过编写自定义脚本，你可以：

- **自动化重复性任务**：文本转换、格式化、代码生成
- **增强编辑器功能**：添加新的工具和命令
- **优化工作流程**：快捷键、自动化操作
- **个性化你的编辑器**：让 DrRacket 完全符合你的需求

现在，打开 DrRacket，点击 `Scripts | Manage | New script...`，开始创建你的第一个脚本吧！