---
{"dg-publish":true,"dg-path":"07 AI工程实践/Clawdbot 安装和使用指南.md","permalink":"/07 AI工程实践/Clawdbot 安装和使用指南/"}
---

## 🦞 1. 什么是 Clawd.bot / Clawdbot

**Clawdbot** 是一个开源的 **个人 AI 助理框架**，运行在你自己的电脑或服务器上，并能通过你常用的聊天应用（如 WhatsApp、Telegram、Discord、Slack、Signal、iMessage 等）与它对话，让它完成任务、管理日程、执行自动化、访问文件等。它支持与多个大语言模型（如 Claude、OpenAI/GPT、以及本地模型）集成，并支持插件/技能扩展。

特点总结：  
✔️ 私有运行，数据在你自己设备上  
✔️ 持久记忆与上下文理解  
✔️ 自定义技能、插件与自动化任务  
✔️ 集成消息平台与工具链  
✔️ 浏览器控制、文件与脚本执行等能力  
✔️ 多 Agent 支持（可运行多个 AI 实例）

## ⚙️ 2. 安装前准备

确保你的系统满足以下**基本要求**：

- 操作系统：macOS / Linux / Windows (建议通过 WSL2)
- Node.js **22+**（安装器会尝试自动安装）
- 网络环境可访问外部模型/API（如 Anthropic / OpenAI API）
- 聊天平台帐号/凭据（例如 Telegram Bot Token 或 WhatsApp Web 登录二维码）

## 🛠 3. 安装 Clawdbot（推荐方法）

### 📌 一键安装脚本（最简单）

**macOS / Linux**

```bash
curl -fsSL https://clawd.bot/install.sh | bash
```

**Windows PowerShell**

```powershell
iwr -useb https://clawd.bot/install.ps1 | iex
```

（也可以使用 CMD 变体）

该安装器会：

- 安装 Node.js（如果未检测到）
- 通过 npm 安装 `clawdbot` 命令行工具
- 运行 onboarding 向导（可配置基本设置）

## 💡 4. 初次配置

### 🚀 4.1 初始化向导

安装完成后，运行：

```bash
clawdbot onboard
```

这个向导会引导你：

- 创建本地配置目录（如 `~/.clawdbot/`）
- 配置聊天平台认证（Bot Token / WhatsApp Web 等）
- 设定默认 AI 模型与 API Key  
    （如 Anthropic / OpenAI）

## 📡 5. 连接聊天平台

Clawdbot 支持多种消息入口，常见示例如下：

### 🔹 Telegram
1. 在 BotFather 创建 Bot，获取 **Bot Token**
2. 把 Token 填入 Clawdbot 配置
3. 允许必要权限

示例配置：

```json
{
  "telegram": {
    "token": "123456:ABC-DEF..."
  }
}
```

然后启动：

```bash
clawdbot run
```

### 🔹 WhatsApp

Clawdbot 使用 WhatsApp Web 技术栈（Baileys）进行连接：

1. 运行登录流程：
```bash
clawdbot login
```
2. 扫描二维码（使用助手的 WhatsApp 账号）
3. 创建 config 配置允许来源号码：

```json
{
  "whatsapp": {
    "allowFrom": ["+15555550123"]
  }
}
```

注意：应避免公开暴露账号，**只允许来源限制的号码**。

## 🧠 6. 运行与基本使用

### 📍 启动服务

在终端运行：

```bash
clawdbot run
```

这会启动 Clawdbot 的 Gateway（本地服务），通常默认在：

```
http://127.0.1:18789/
```

你可以访问它来监控 agent 状态与日志。

### 💬 在聊天应用中对话

一旦连接到聊天平台（比如 Telegram）：

- 向 Bot 发送消息，它会根据上下文回应
- 它可以主动作业，如提醒、日程、提醒重复任务
- 响应会记住上下文（持久记忆），可随时回溯

## 🧩 7. 进阶操作

### ✨ 添加/管理技能

Clawdbot 支持插件/技能扩展。你可以：

- 安装现有社区技能
- 自己编写技能（Javascript /配置）

技能可以让 AI 完成自动化工作，比如：

- 定期抓取网站数据
- 自动发送报告
- 与第三方服务集成

## 🔁 8. 更新与维护

由于 Clawdbot 仍在快速迭代，建议定期更新：

```bash
curl -fsSL https://clawd.bot/install.sh | bash
```

或者使用 CLI：

```bash
clawdbot update
```

更新后检查配置、重启服务。

## 🔐 9. 安全与最佳实践

Clawdbot 具有强大的权限，可能：

- 访问本地文件
- 执行系统命令
- 发送外部消息

因此：

✅ 将它运行在隔离环境（虚拟机 / VPS /独立主机）  
✅ 不要向公众暴露开放端口  
✅ 对聊天入口设置来源限制  
✅ 定期备份配置与 workspace

## 🧱 10. 常见问题

**Q1:** 它能脱离 API Key 使用本地模型吗？  
A: 支持本地模型（如通过 Ollama / MiniMax 等），但初期推荐先绑定 API 服务。

**Q2:** 我需要一直开着电脑吗？  
A: 若想 24/7 服务，需要持续运行于服务器或 VPS，否则无法响应消息。

**Q3:** 适合新手吗？  
A: 有一定终端与配置基础会更顺利，不过安装向导会降低难度。

## 📌 总结

Clawdbot 是一个极具潜力的 **自托管 AI 助理系统**，通过一个统一 CLI 实现聊天入口、自动化任务、模型集成和技能扩展。你可以：

🧩 在本地或云上运行  
🔑 接入多个聊天应用  
💡 构建自己的智能助理工作流  
🔌 自由扩展技能与集成服务

如需更深入阅读官方文档与示例，建议访问其文档站点或 GitHub 仓库。