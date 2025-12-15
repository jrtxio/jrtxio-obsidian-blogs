---
{"dg-publish":true,"dg-path":"07 人工智能/Claude Code 使用指南：安装、配置与实践.md","permalink":"/07 人工智能/Claude Code 使用指南：安装、配置与实践/","created":"2025-09-11T10:10:55.000+08:00","updated":"2025-09-23T13:38:50.000+08:00"}
---

#Innolight

# 前言

Claude Code 是 Anthropic 推出的命令行工具，可以在终端中直接与 Claude 模型交互，执行代码分析、生成、重构等任务。支持上下文管理和会话持久化，方便工程化开发。

# 安装

确保 Node.js ≥ 18 和 npm 已安装，然后运行：

```bash
npm install -g @anthropic-ai/claude-code
```

验证安装：

```bash
claude --version
```

# 登录与配置

Claude Code 支持多种登录方式：

1. **使用 Claude.ai 账号登录**

```bash
claude
```

会打开浏览器进行授权，适合个人用户。

2. **使用 Anthropic Console 登录**

```bash
claude
```

适合团队或企业用户，可进行项目和成员管理。

3. **使用 API Key 登录** 在 [Anthropic Console](https://console.anthropic.com/) 获取 API Key：

```bash
claude config set api_key your_api_key
```

适合脚本、CI/CD 或长期项目。

配置文件通常在：

```bash
~/.config/claude/config.json
```

示例：

```json
{
  "default_model": "claude-3-5-sonnet",
  "api_key": "your_api_key"
}
```

可以用命令修改：

```bash
claude config set default_model claude-3-5-sonnet
claude config set api_key your_api_key
```

# 常用命令

## 基础命令

```bash
claude                           # 启动交互式会话（REPL）
claude "query"                   # 启动 REPL 并执行初始查询
claude -p "query"                # 非交互模式，执行查询后退出
claude -c                        # 继续最近的会话
claude -r "<session-id>" "query" # 恢复指定会话
claude update                    # 更新到最新版本
claude mcp                       # 配置 Model Context Protocol 服务器
```

## 命令行标志

```bash
--add-dir <path>                 # 添加工作目录
--allowedTools <tools>           # 允许使用的工具列表
--disallowedTools <tools>        # 禁止使用的工具列表
--model <model-name>             # 指定使用的模型
--permission-mode <mode>         # 设置权限模式
--output-format <format>         # 输出格式（text/json/stream-json）
--max-turns <number>             # 最大对话轮数
--verbose                        # 详细日志输出
--continue                       # 继续上次会话
--resume <session-id>            # 恢复指定会话
```

# 工作流示例

## 1. 项目初始化与探索

```bash
# 启动 Claude Code 并探索项目
claude "explain this project structure"

# 添加额外的工作目录
claude --add-dir ../shared-lib --add-dir ../config
```

## 2. 代码分析与理解

```bash
# 分析特定文件
claude "explain how the authentication works in src/auth.js"

# 理解复杂的代码逻辑
claude "walk me through the data flow in this codebase"
```

## 3. 代码生成与开发

```bash
# 生成新功能
claude "create a REST API endpoint for user registration with validation"

# 生成测试文件
claude "create unit tests for the UserService class"

# 生成文档
claude "generate API documentation for all endpoints in this project"
```

## 4. 代码重构与优化

```bash
# 重构代码
claude "refactor the database connection logic to use connection pooling"

# 性能优化
claude "optimize this SQL query and add proper indexing suggestions"

# 代码清理
claude "remove unused imports and clean up the codebase"
```

## 5. 调试与问题解决

```bash
# 分析错误日志
cat error.log | claude -p "analyze these errors and suggest fixes"

# 调试特定问题
claude "why is this function returning undefined?"

# 安全审计
claude "review this code for security vulnerabilities"
```

## 6. Git 工作流集成

```bash
# 检查代码变更
claude "review my git diff before committing"

# 生成提交信息
claude "generate a commit message for these changes"

# 创建分支并执行任务
claude "checkout a new branch and implement user authentication"
```

## 7. 会话管理

```bash
# 继续之前的工作
claude -c "continue working on the user service refactoring"

# 保存重要会话（通过会话 ID）
claude -r "session-abc123" "finalize the API documentation"
```

## 8. 自动化脚本示例

```bash
# 一次性查询模式，适合脚本
claude -p "run linting and fix all auto-fixable issues"

# 使用 JSON 输出格式进行自动化处理
claude -p --output-format json "analyze code quality metrics"

# 管道操作
git log --oneline -10 | claude -p "summarize recent changes"
```

## 9. 权限和工具管理

```bash
# 允许特定工具无需确认
claude --allowedTools "Bash(git*)" "Bash(npm*)" "Read" "Edit"

# 禁止使用某些工具
claude --disallowedTools "Bash(rm*)" "Bash(sudo*)"

# 计划模式（预览操作）
claude --permission-mode plan "refactor the entire auth system"
```

## 10. 高级工作流

```bash
# 多目录项目开发
claude --add-dir ../frontend --add-dir ../backend --add-dir ../shared \
  "sync the API types between frontend and backend"

# 持续会话开发
claude -c "continue implementing the payment integration we discussed"

# 详细日志调试
claude --verbose --max-turns 5 "debug the memory leak in the worker process"
```

# 实际开发场景示例

## 场景 1：新功能开发

```bash
# 1. 分析需求
claude "I need to add email notifications. Analyze the current codebase and suggest the best approach"

# 2. 实现功能
claude "implement email notification service with templates and queue support"

# 3. 添加测试
claude "create comprehensive tests for the email service"

# 4. 更新文档
claude "update the README with email service configuration instructions"
```

## 场景 2：Bug 修复

```bash
# 1. 分析问题
claude "users report login failures. Help me investigate the auth flow"

# 2. 查看日志
tail -f app.log | claude -p "monitor for auth-related errors and explain what's happening"

# 3. 修复问题
claude "fix the session timeout issue in the auth middleware"

# 4. 验证修复
claude "create a test case to prevent this auth bug from recurring"
```

## 场景 3：代码审查

```bash
# 1. 审查变更
claude "review my staged changes for best practices and potential issues"

# 2. 性能检查
claude "analyze the performance impact of these database changes"

# 3. 安全检查
claude "check these API endpoints for security vulnerabilities"
```

# 最佳实践

1. **明确指定工作目录**：使用 `--add-dir` 确保 Claude 能访问所有相关文件
2. **合理使用权限控制**：通过 `--allowedTools` 和 `--disallowedTools` 控制工具使用
3. **利用会话持续性**：使用 `-c` 标志继续之前的工作上下文
4. **自动化重复任务**：使用 `-p` 模式和管道操作处理批量任务
5. **合理配置输出格式**：根据使用场景选择合适的 `--output-format`

# 总结

Claude Code 提供了丰富的命令行选项和灵活的工作流支持，从简单的代码查询到复杂的项目开发，都能通过自然语言命令高效完成。掌握这些工作流模式，可以显著提升开发效率和代码质量。