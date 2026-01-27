---
{"dg-publish":true,"dg-path":"07 AI工程实践/Gemini CLI 使用指南：安装、配置与实践.md","permalink":"/07 AI工程实践/Gemini CLI 使用指南：安装、配置与实践/"}
---

## 前言

Gemini CLI 是 Google 推出的开源 AI 代理命令行工具，可在终端中直接访问 Gemini 模型。它使用推理-行动（ReAct）循环，结合内置工具和 MCP 服务器来完成复杂任务，如修复 Bug、创建新功能和改进测试覆盖率。虽然在编程方面表现出色，但也是一个多用途的本地工具，可用于内容生成、问题解决、深度研究和任务管理。

## 安装

### 系统要求

- Node.js ≥ 18
- npm 或其他包管理器

### 安装方法

#### 方法 1：NPM 安装（推荐）

```bash
npm install -g @google/gemini-cli
```

#### 方法 2：通过 Google Cloud Shell

Gemini CLI 在 Cloud Shell 中无需额外设置即可使用。

#### 方法 3：系统包管理器安装

```bash
# macOS (Homebrew)
brew install gemini-cli

# Ubuntu/Debian
sudo apt install gemini-cli

# 其他 Linux 发行版
# 请参考官方文档获取具体安装方法
```

验证安装：

```bash
gemini --version
```

## 认证与配置

### 认证方式

#### 1. Google 账号认证（推荐）

```bash
gemini
```

首次运行会提示进行认证，使用个人 Google 账号登录。免费层级：每分钟 60 次请求，每天 1,000 次请求。

#### 2. API Key 方式

在 [Google AI Studio](https://aistudio.google.com/) 获取 API Key：

```bash
# 设置环境变量
export GEMINI_API_KEY="your_api_key"

# 或者在配置文件中设置
gemini config set api_key your_api_key
```

#### 3. 环境变量配置

macOS / Linux：

```bash
echo 'export GEMINI_API_KEY="your_api_key"' >> ~/.zshrc
source ~/.zshrc
```

Windows (PowerShell)：

```bash
setx GEMINI_API_KEY "your_api_key"
```

### 配置管理

配置文件位置：

```bash
~/.gemini/config.toml
```

常用配置命令：

```bash
# 查看配置
gemini config list

# 设置默认模型
gemini config set model gemini-2.5-pro

# 设置 API Key
gemini config set api_key your_api_key

# 设置输出格式
gemini config set output_format json
```

## 核心功能与命令

### 基础命令

```bash
gemini                    # 启动交互式会话
gemini "your prompt"      # 一次性查询
gemini --help            # 显示帮助信息
gemini --version         # 显示版本信息
```

### 交互模式内置命令

在交互模式中，可以使用以下命令：

```bash
/help                    # 显示可用命令
/memory                  # 管理对话记忆
/stats                   # 显示使用统计
/tools                   # 查看可用工具
/mcp                     # 管理 MCP 服务器
/ide                     # IDE 集成相关
/exit 或 /quit           # 退出会话
```

### 内置工具

Gemini CLI 包含多种内置工具：Google Search 接地、文件操作、shell 命令、网页抓取。

- **文件操作**：读取、写入、创建文件
- **终端命令**：执行 shell 命令
- **网络工具**：网页搜索、内容抓取
- **代码工具**：Git 操作、代码分析

## 工作流示例

### 1. 项目初始化与探索

```bash
# 在项目目录中启动 Gemini CLI
cd my-project
gemini

# 探索项目结构
> "Analyze this codebase and explain the architecture"

# 了解特定文件
> "Explain what this main.py file does and its key functions"
```

### 2. 代码开发工作流

```bash
# 创建新功能
> "Create a REST API endpoint for user authentication with JWT tokens"

# 代码审查
> "Review the changes in my git staging area and suggest improvements"

# 重构代码
> "Refactor this class to follow SOLID principles and add proper error handling"

# 生成测试
> "Generate comprehensive unit tests for the UserService class"
```

### 3. 调试与问题解决

```bash
# 分析错误日志
> "Help me debug this error: [paste error message]"

# 性能优化
> "Analyze this function's performance and suggest optimizations"

# 依赖管理
> "Check for outdated dependencies and security vulnerabilities"
```

### 4. 文档生成

```bash
# 生成项目文档
> "Generate a comprehensive README.md for this project"

# API 文档
> "Create API documentation for all endpoints in this Express.js app"

# 代码注释
> "Add detailed comments and docstrings to this Python module"
```

### 5. Git 工作流集成

```bash
# 提交前检查
> "Review my staged changes and suggest a good commit message"

# 分支管理
> "Create a new feature branch and implement user profile editing"

# 合并请求准备
> "Prepare this branch for a pull request with proper documentation"
```

### 6. 自定义命令

创建自定义命令文件：

```bash
# 全局命令（~/.gemini/commands/）
~/.gemini/commands/code_review.toml

# 项目特定命令（<project>/.gemini/commands/）
.gemini/commands/deploy.toml
```

示例命令配置：

```toml
[command]
name = "code_review"
description = "Perform comprehensive code review"
prompt = """
Please review the current git diff for:
1. Code quality and best practices
2. Security vulnerabilities
3. Performance issues
4. Documentation completeness
5. Test coverage
"""
```

### 7. IDE 集成工作流

```bash
# 设置 IDE 集成
> "/ide install"

# 启用 IDE 连接
> "/ide enable"

# 在编辑器中查看差异
> "Make changes to this function and show me the diff in my editor"
```

### 8. MCP 服务器集成

```bash
# 查看可用 MCP 服务器
> "/mcp list"

# 连接到外部服务
> "/mcp connect github-server"

# 使用扩展功能
> "Using the GitHub MCP server, create a new issue for this bug"
```

## 实际开发场景示例

### 场景 1：全栈应用开发

```bash
# 1. 项目规划
> "I want to build a todo app with React frontend and Node.js backend. Create the project structure and initial files."

# 2. 后端开发
> "Implement the backend API with Express.js, including CRUD operations for todos"

# 3. 前端开发
> "Create a React frontend that consumes the todo API with modern hooks"

# 4. 数据库集成
> "Add MongoDB integration with Mongoose for data persistence"

# 5. 测试实现
> "Generate comprehensive tests for both frontend and backend"
```

### 场景 2：现有项目维护

```bash
# 1. 代码审计
> "Audit this codebase for security issues, performance bottlenecks, and code smell"

# 2. 依赖更新
> "Update all dependencies to their latest secure versions and fix any breaking changes"

# 3. 功能增强
> "Add real-time notifications to this chat application using WebSocket"

# 4. 文档更新
> "Update all documentation to reflect the recent changes and new features"
```

### 场景 3：Bug 修复工作流

```bash
# 1. 问题诊断
> "Users report that login is failing intermittently. Help me investigate this issue."

# 2. 日志分析
> "Analyze these error logs and identify the root cause: [paste logs]"

# 3. 修复实现
> "Implement a fix for the race condition in the authentication middleware"

# 4. 测试验证
> "Create tests to ensure this bug doesn't happen again"
```

### 场景 4：DevOps 自动化

```bash
# 1. CI/CD 设置
> "Create a GitHub Actions workflow for testing and deployment"

# 2. Docker 配置
> "Generate Dockerfiles and docker-compose.yml for this microservices app"

# 3. 监控设置
> "Add health checks and monitoring endpoints to all services"

# 4. 部署脚本
> "Create deployment scripts for staging and production environments"
```

## 高级功能

### 沙盒环境

创建自定义沙盒环境：

```bash
# 在项目根目录创建
.gemini/sandbox.Dockerfile
```

示例 Dockerfile：

```dockerfile
FROM gemini-cli-sandbox

# 添加自定义依赖
RUN apt-get update && apt-get install -y python3-pip
RUN pip install pandas numpy

# 复制配置文件
COPY ./requirements.txt /app/requirements.txt
```

### Yolo 模式

Yolo 模式允许 Gemini CLI 直接执行操作而无需用户确认：

```bash
gemini --yolo "Fix all linting errors in this project"
```

### 批处理模式

```bash
# 处理多个文件
gemini --batch "Add TypeScript types to all JavaScript files in src/"

# 自动化工作流
gemini --script automation.txt
```

## 最佳实践

### 1. 项目组织

- 在项目根目录使用 `.gemini/` 文件夹存储配置
- 创建项目特定的自定义命令
- 使用 `.gemini/context.md` 文件提供项目上下文

### 2. 安全考虑

- 谨慎使用 Yolo 模式，特别是在生产环境
- 定期审查 Gemini CLI 执行的操作
- 使用沙盒环境进行实验性操作

### 3. 效率优化

- 利用内置工具而非手动操作
- 创建常用操作的自定义命令
- 使用记忆功能保持上下文连续性

### 4. 协作工作流

- 分享自定义命令配置
- 建立团队编码标准和审查流程
- 使用 MCP 服务器集成外部工具

## 配额和限制

根据不同的 Gemini Code Assist 订阅级别，您将获得不同的使用配额：

- **个人版**：每分钟 60 次请求，每天 1,000 次请求
- **标准版**：更高的请求配额
- **企业版**：企业级配额和支持

配额在 Gemini CLI 和 Gemini Code Assist 代理模式之间共享。

## 故障排除

### 常见问题

#### 认证问题

```bash
# 重新认证
gemini auth login

# 检查 API Key
echo $GEMINI_API_KEY
```

#### 工具权限问题

```bash
# 检查工具状态
> "/tools"

# 重置权限
gemini config reset permissions
```

#### 性能问题

```bash
# 查看使用统计
> "/stats"

# 清理缓存
gemini cache clear
```

## 总结

Google Gemini CLI 是一个强大的开源 AI 代理工具，它将 Gemini 的能力直接带入您的终端。通过丰富的内置工具、MCP 服务器支持和灵活的配置选项，它能够显著提升开发效率。无论是个人开发者还是企业团队，都能从其智能的代码生成、调试和项目管理功能中受益。

掌握 Gemini CLI 的核心功能和工作流模式，配合最佳实践，可以让您的开发过程更加高效和智能化。作为一个持续发展的开源项目，Gemini CLI 将继续扩展其功能，为开发者提供更好的 AI 辅助开发体验。