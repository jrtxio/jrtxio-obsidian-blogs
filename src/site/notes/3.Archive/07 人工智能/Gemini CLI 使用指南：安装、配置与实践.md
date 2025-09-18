---
{"dg-publish":true,"dg-path":"07 人工智能/Gemini CLI 使用指南：安装、配置与实践.md","permalink":"/07 人工智能/Gemini CLI 使用指南：安装、配置与实践/","created":"2025-09-17T19:39:01.000+08:00","updated":"2025-09-17T20:45:08.000+08:00"}
---

#Innolight

# 前言

Gemini CLI 是 Google 提供的命令行工具，可以在终端中直接调用 Gemini 模型，完成文本生成、代码生成、文档处理等任务，同时支持会话上下文和持久化。

# 安装

确保 Node.js ≥ 18 和 npm 已安装，然后运行：

```
npm install -g @google/gemini-cli
```

验证安装：

```
gemini --version
```


# 登录与配置

Gemini CLI 支持多种登录方式：

1. **交互式登录**

```
gemini login
```

会打开浏览器进行授权，适合个人用户。

2. **API Key 登录**

在 [Google AI Studio](https://aistudio.google.com/) 获取 API Key：

```
gemini config set api_key your_api_key
```

3. **环境变量方式**

macOS / Linux：

```
export GEMINI_API_KEY="your_api_key"
source ~/.zshrc
```

Windows (PowerShell)：

```
setx GEMINI_API_KEY "your_api_key"
```

配置文件通常在：

```
~/.config/gemini/config.json
```

示例：

```
{
  "default_model": "gemini-1.5-flash",
  "api_key": "your_api_key"
}
```

可以用命令修改：

```
gemini config set default_model gemini-1.5-flash
gemini config set api_key your_api_key
```

# 常用命令

```
gemini：启动交互式会话（REPL）
gemini "query"：执行一次性查询
gemini -p "query"：非交互模式，适合脚本
gemini models：列出可用模型
gemini config set <key> <value>：修改配置
gemini config list：查看配置
gemini update：更新 CLI
```


交互模式命令：

```
/help：显示可用命令
/clear：清空会话历史
/exit：退出会话
/model <model-name>：切换模型
/save：保存会话
/load：加载会话
/export：导出会话
/config：查看或修改配置
/status：查看会话状态
/cost：查看 token 使用情况
```

# 工作流示例

1. 启动交互模式：

```
gemini chat
```

2. 生成代码：

```
gemini "写一个 Python 脚本读取 JSON 并打印内容"
```

3. 文本处理：

```
gemini "将 'Hello, how are you?' 翻译成中文"
```

4. 文档生成：

```
gemini "根据以下代码生成 README.md"
```

5. 会话持久化：

```
gemini --save session.json
gemini --load session.json
```

# 总结

Gemini CLI 提供了多种登录方式和简单命令行操作，使开发者可以轻松访问 Gemini 模型。支持上下文管理和会话持久化，适合快速开发、脚本自动化和文档处理。