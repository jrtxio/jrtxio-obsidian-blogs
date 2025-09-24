---
{"dg-publish":true,"dg-path":"07 人工智能/MCP 入门指南：让 AI 接上“超级网线”.md","permalink":"/07 人工智能/MCP 入门指南：让 AI 接上“超级网线”/","created":"2025-09-24T14:52:59.705+08:00","updated":"2025-09-24T15:01:56.911+08:00"}
---

#Innolight

# MCP 是什么？

MCP 全称 **模型上下文协议（Model Context Protocol）**，由 Anthropic 在 2024 年 11 月推出，是个开源通信标准。简单说，它给 AI 装了个“超级网线”，让 AI 能跟外部工具、数据、系统无缝对接。

- **比喻**：AI 是个聪明但宅家的书呆子，MCP 就是它的“外卖员”，能帮它拿数据、干活儿。
- **目标**：让 AI 不只聊天，还能真动手，比如查数据库、发邮件、写代码。

![Pasted image 20250924145320.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250924145320.png)

# MCP 能干什么？

MCP 客户端是 AI 的“操作台”，以下是几个热门选择：

- **Claude Desktop**
    - **简介**：Claude 桌面版，普通人也能用。
    - **功能**：官方客户端，连接各种MCP服务器，例如连 Blender MCP，用自然语言建 3D 模型。
    - **链接**：[Anthropic 官网](https://docs.anthropic.com/)
    - **截图**：
	    ![Pasted image 20250924145355.png](/img/user/0.Asset/resource/Pasted%20image%2020250924145355.png)
	- **Tips**：不写代码也能玩，新手友好。

- **Cursor**
	- **简介**：代码编辑器，装上 MCP 变“全能选手”。
	- **功能**：写代码、发 Slack、生成图片。
	- **链接**：[官网](https://cursor.sh/)
	- **截图**：
		![Pasted image 20250924145531.png](/img/user/0.Asset/resource/Pasted%20image%2020250924145531.png)
	- **Tips**：程序员必备，试试连 GitHub MCP。

# MCP 服务器

- [MCP.so](https://mcp.so/) 收录了近 8000 MCP Servers
![Pasted image 20250924145743.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250924145743.png)
- [awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers)
- [web目录](https://glama.ai/mcp/servers)。
- [MCP.ing](https://mcp.ing/) 一个资源丰富的 MCP Server库
![Pasted image 20250924145754.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250924145754.png)

# MCP Server 开发

## 1. 使用 LLM 构建 MCP 服务器

我们可以用像 Claude 这样的大语言模型（LLM）来加速 MCP 开发！

如何使用 LLM 来构建自定义的模型上下文协议（MCP）服务器和客户端？以 Claude 为例，其他大模型（GPT、Gemini、Grok、Qwen、DeepSeek）都适用。

**准备文档资料**

在开始之前，请收集必要的文档资料，以帮助 Claude 理解 MCP：

1. 访问 [https://modelcontextprotocol.io/llms-full.txt](https://modelcontextprotocol.io/llms-full.txt) 并复制完整的文档文本。
2. 前往 [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) 或 [Python SDK](https://github.com/modelcontextprotocol/python-sdk) 的代码仓库。
3. 复制 README 文件和其他相关文档。
4. 将这些文档粘贴到你与 Claude 的对话中。

**描述你的服务器需求**

提供文档后，清晰地向 Claude 描述你想要构建什么样的服务器。请具体说明：

- 你的服务器将**开放哪些资源**
- 它将**提供哪些工具**
- 它应该**提供哪些提示（Prompts）**
- 它需要与**哪些外部系统交互**

例如：

```
构建一个 MCP 服务器，要求：
- 连接到我公司的 PostgreSQL 数据库
- 将表结构作为资源开放出来
- 提供运行只读 SQL 查询的工具
- 包含用于常见数据分析任务的提示（Prompts）
```

## 2. 更多MCP编程资源

- [Model Context Protocol(MCP) 编程极速入门](http://github.com/liaokongVFX/MCP-Chinese-Getting-Started-Guide)