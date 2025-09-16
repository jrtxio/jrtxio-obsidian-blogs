---
{"dg-publish":true,"dg-path":"07 人工智能/iFlow CLI 实践指南：配置、命令与项目开发流程.md","permalink":"/07 人工智能/iFlow CLI 实践指南：配置、命令与项目开发流程/","created":"2025-09-11T13:50:03.000+08:00","updated":"2025-09-11T13:52:06.000+08:00"}
---

#Innolight

# 一、前言

iFlow CLI 是阿里心流团队推出的终端 AI 工具，旨在为开发者提供高效、智能的辅助能力。

通过 iFlow CLI，用户可以：

- 与 AI 进行自然语言交互
- 分析、生成、重构代码
- 自动生成文档
- 管理和搜索项目文件
- 集成到自动化工作流中

其核心理念是 **上下文工程（Context Engineering）**，强调项目级别的上下文管理，使 AI 能够理解整个项目，而非单次交互。

# 二、安装 iFlow CLI

## 1. 系统要求

- Node.js ≥ 20
- npm ≥ 9
- 支持 Windows、macOS、Linux

## 2. 安装命令

在任意支持 Node.js 的终端中执行：

```bash
npm install -g @iflow-ai/iflow-cli
```

## 3. 验证安装

```bash
iflow --version
```

输出版本号表示安装成功。

# 三、配置 iFlow CLI

iFlow CLI 配置体系分为 **三层**：全局配置文件、环境变量、命令行参数。

## 1. 全局配置文件

- macOS / Linux: `~/.iflow/settings.json`
- Windows: `%USERPROFILE%\.iflow\settings.json`

示例：

```json
{
  "apiKey": "YOUR_API_KEY",
  "default_model": "Qwen3-Coder",
  "memory": true,
  "allowed_tools": ["file", "terminal", "shell"],
  "disallowed_tools": ["network"],
  "timeout": 1200,
  "project_context": {
    "include_dirs": ["src/", "include/"],
    "exclude_dirs": ["node_modules/", "build/"]
  }
}
```

## 2. 环境变量（可覆盖全局配置）

|变量名|功能|
|---|---|
|IFLOW_API_KEY|API Key|
|IFLOW_MODEL|默认模型|
|IFLOW_MEMORY|上下文记忆开关|
|IFLOW_TIMEOUT|超时时间（秒）|

示例（macOS / Linux）：

```bash
export IFLOW_API_KEY="your_api_key"
export IFLOW_MODEL="Qwen3-Coder"
export IFLOW_MEMORY="true"
export IFLOW_TIMEOUT=1800
```

示例（Windows PowerShell）：

```powershell
setx IFLOW_API_KEY "your_api_key"
setx IFLOW_MODEL "Qwen3-Coder"
setx IFLOW_MEMORY "true"
setx IFLOW_TIMEOUT "1800"
```

## 3. 命令行参数（临时覆盖）

```bash
iflow -p "生成 main.c 的单元测试" --model "Qwen3-Coder" --timeout 600 --memory off
```

## 4. 配置优先级

从高到低：

1. 命令行参数
2. 环境变量
3. 项目级配置文件 `.iflow/config.json`
4. 全局配置文件 `~/.iflow/settings.json`

# 四、常用命令

|命令|功能|
|---|---|
|`iflow`|启动交互式 REPL|
|`iflow "query"`|带初始提示启动交互式会话|
|`iflow -p "query"`|非交互模式执行查询|
|`iflow -c` / `--continue`|继续上次会话|
|`iflow -r <session-id> "query"`|恢复指定会话|
|`/model <model-name>`|切换当前模型|
|`/memory on/off`|启用/禁用会话记忆|
|`/save`|保存当前会话|
|`/load`|加载已保存会话|
|`/export`|导出会话到文件|
|`/init`|初始化工程，生成 `.iflow` 配置|
|`/config`|查看或修改会话配置|
|`/status`|查看会话状态|
|`/doctor`|检查安装环境|
|`/cost`|查看 token 使用情况|

# 五、工程化开发流程

## 1. 初始化工程

```bash
iflow init
```

生成 `.iflow` 配置文件，用于项目上下文管理。

## 2. 添加文件或目录

```bash
iflow add main.c
iflow add include/utils.h
iflow add src/
```

## 3. 上下文内操作

- 生成单元测试：

```bash
iflow "为 main.c 生成单元测试"
```

- 代码重构：

```bash
iflow "优化 utils.h 的线程安全性"
```

- 文档生成：

```bash
iflow "根据项目文件生成 README.md"
```

## 4. 会话持久化

- 保存：

```bash
iflow --save dev-session.json
```

- 加载：

```bash
iflow --load dev-session.json
```

# 六、自动化集成

可结合 GitHub Actions 实现自动化分析：

```yaml
name: iFlow 自动化分析

on:
  push:
    branches:
      - main

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run iFlow CLI
        uses: iflow-ai/iflow-cli-action@v1
        with:
          prompt: "分析代码库并提出优化建议"
          api_key: ${{ secrets.IFLOW_API_KEY }}
          model: "Qwen3-Coder"
          timeout: 1800
```

# 七、总结

iFlow CLI 是一款面向开发者的终端 AI 工具，优势在于：

- **上下文工程**：项目级别理解和操作
- **多模型支持**：灵活切换不同 AI 模型
- **自动化集成**：支持 CI/CD、脚本和自动化任务
- **跨平台**：支持 Windows、macOS、Linux

合理配置和使用 iFlow CLI，可以实现从代码生成、重构到文档输出的闭环开发，显著提升开发效率和质量。