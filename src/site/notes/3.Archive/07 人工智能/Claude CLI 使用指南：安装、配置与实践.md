---
{"dg-publish":true,"dg-path":"07 人工智能/Claude CLI 使用指南：安装、配置与实践.md","permalink":"/07 人工智能/Claude CLI 使用指南：安装、配置与实践/","created":"2025-09-11T10:10:55.000+08:00","updated":"2025-09-17T20:40:18.702+08:00"}
---

#Innolight

# 前言

Claude CLI 是 Anthropic 推出的命令行工具，可以在终端中直接与 Claude 模型交互，执行代码分析、生成、重构等任务。支持上下文管理和会话持久化，方便工程化开发。

# 安装

确保 Node.js ≥ 18 和 npm 已安装，然后运行：

```
npm install -g @anthropic-ai/claude-code
```

验证安装：

```
claude --version
```

# 登录与配置

Claude CLI 支持多种登录方式：

1. **使用 Claude.ai 账号登录**

```
claude
```

会打开浏览器进行授权，适合个人用户。

2. **使用 Anthropic Console 登录**

```
claude
```

适合团队或企业用户，可进行项目和成员管理。

3. **使用 API Key 登录**

在 [Anthropic Console](https://console.anthropic.com/) 获取 API Key：

```
claude config set api_key your_api_key
```

适合脚本、CI/CD 或长期项目。

配置文件通常在：

```
~/.config/claude/config.json
```

示例：

```
{
  "default_model": "claude-3-5-sonnet",
  "api_key": "your_api_key"
}
```

可以用命令修改：

```
claude config set default_model claude-3-5-sonnet
claude config set api_key your_api_key
```

# 常用命令

```
claude：启动交互式会话（REPL）
claude "query"：执行一次性查询
claude -p "query"：非交互模式，适合脚本
claude -c 或 claude --continue：继续上次会话
claude -r <session-id> "query"：恢复指定会话
claude models：列出可用模型
claude --add-dir <path>：添加工作目录
claude --allowedTools <tools>：允许使用的工具
claude --disallowedTools <tools>：禁止使用的工具
claude update：更新 CLI
```

交互模式命令：

```
/help：显示可用命令
/clear：清空会话历史
/reset：重置会话状态
/exit：退出会话
/model <model-name>：切换模型
/memory on / /memory off：启用/禁用会话记忆
/save：保存会话
/load：加载会话
/export：导出会话
/init：初始化项目，生成 CLAUDE.md
/config：查看或修改配置
/status：查看会话状态
/doctor：诊断安装问题
/cost：查看 token 使用情况
```

# 工作流示例

1. 初始化工程：

```
claude init
```

2. 添加文件上下文：

```
claude add main.c
claude add include/utils.h
# 或添加整个目录
claude add src/
```

3. 代码生成：

```
claude "为 main.c 生成单元测试"
```

4. 重构代码：

```
claude "优化 utils.h 的线程安全性"
```

5. 文档生成：

```
claude "根据项目文件生成 README.md"
```

6. 会话持久化：

```
claude --save dev-session.json
claude --load dev-session.json
```


# 总结

Claude CLI 提供了多种登录方式和简单命令行操作，支持上下文管理和会话持久化。适合个人用户、团队开发以及脚本自动化场景，可高效辅助开发流程。