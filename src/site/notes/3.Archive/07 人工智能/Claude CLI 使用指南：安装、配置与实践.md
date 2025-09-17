---
{"dg-publish":true,"dg-path":"07 人工智能/Claude CLI 使用指南：安装、配置与实践.md","permalink":"/07 人工智能/Claude CLI 使用指南：安装、配置与实践/","created":"2025-09-11T10:10:55.000+08:00","updated":"2025-09-17T19:37:07.138+08:00"}
---

#Innolight

# 一、前言

Claude CLI 是 Anthropic 推出的命令行工具，旨在为开发者提供高效的 AI 辅助开发体验。通过 Claude CLI，开发者可以在终端中直接与 Claude 模型进行交互，执行代码分析、生成、重构等任务。

# 二、安装 Claude CLI

## 1. 使用 npm 安装

确保系统已安装 Node.js（版本 18 或更高）和 npm，然后在终端中运行以下命令：

```
npm install -g @anthropic-ai/claude-code
```

## 2. 验证安装

安装完成后，运行以下命令验证安装是否成功：

```
claude --version
```

若输出版本号，则表示安装成功。

# 三、登录与配置

## 1. 登录

首次使用 Claude CLI 时，需进行登录。运行以下命令：

```
claude
```

系统将提示您进行身份验证。您可以选择使用 Claude.ai 或 Anthropic Console 账户进行登录。

## 2. 配置文件

Claude CLI 支持通过配置文件管理设置。配置文件通常位于 ~/.config/claude/config.json，内容示例如下：

```
{
  "default_model": "claude-3-5-sonnet",
  "api_key": "your_api_key"
}
```

您可以手动编辑该文件，或使用以下命令进行配置：

```
claude config set default_model claude-3-5-sonnet
claude config set api_key your_api_key
```

# 四、常用命令速查表

|**命令**|**功能说明**|
|---|---|
|claude|启动交互式会话（REPL）。|
|claude "query"|启动带初始提示的交互式会话。|
|claude -p "query"|以非交互模式执行查询，适用于脚本或自动化任务。|
|claude -c 或 claude --continue|继续上次会话，恢复上下文。|
|claude -r <session-id> "query"|恢复指定会话 ID 的上下文并执行查询。|
|claude models|列出可用的 Claude 模型。|
|claude --add-dir <path>|添加额外的工作目录供 Claude 访问。|
|claude --allowedTools <tools>|指定允许使用的工具列表。|
|claude --disallowedTools <tools>|指定禁止使用的工具列表。|
|claude update|更新 Claude CLI 到最新版本。|

# 五、特殊命令（以/开头）

在交互式会话中，Claude CLI 支持以下特殊命令：

|**命令**|**功能说明**|
|---|---|
|/help|显示可用命令列表。|
|/clear|清空当前会话的对话历史。|
|/reset|重置当前会话的状态。|
|/exit|退出当前交互式会话。|
|/model <model-name>|切换当前会话使用的模型。|
|/memory on 或 /memory off|启用或禁用会话记忆功能。|
|/save|保存当前会话。|
|/load|加载上次保存的会话。|
|/export|导出当前会话到文件。|
|/init|初始化项目，生成 CLAUDE.md 文件。|
|/config|查看或修改当前会话的配置。|
|/status|显示当前会话的状态信息。|
|/doctor|诊断安装问题。|
|/cost|显示当前会话的 token 使用情况。|

# 六、工程化开发流程：上下文工程

Claude CLI 的设计理念之一是 **上下文工程（Context Engineering）**。它不仅是一个对话接口，更是面向开发者的工程化助手。下面以一个新建项目为例，展示典型工作流。

## 1. 初始化工程

```
claude init
```

在当前目录生成 .claude 配置文件，用于管理上下文。

## 2. 添加文件上下文

```
claude add main.c
claude add include/utils.h
```

也可以直接添加整个目录：

```
claude add src/
```

## 3. 上下文内操作

生成单元测试：

```
claude "为 main.c 生成单元测试"
```

重构代码：

```
claude "优化 utils.h 的线程安全性"
```

## 4. 文档生成

```
claude "根据项目文件生成 README.md"
```

## 5. 会话持久化

保存当前上下文与对话：

```
claude --save dev-session.json
```

下次可继续加载：

```
claude --load dev-session.json
```

这种方式让 Claude 能够长期理解项目上下文，实现从代码生成、重构到文档输出的闭环。
  
# 七、总结

Claude CLI 不仅仅是一个命令行对话工具，更是一个支持 **上下文工程化** 的开发助手。通过合理使用工程初始化、文件上下文、会话持久化等功能，可以让 Claude 深入理解项目，形成闭环式的开发支持。