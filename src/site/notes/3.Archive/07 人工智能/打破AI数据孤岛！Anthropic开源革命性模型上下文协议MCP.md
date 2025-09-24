---
{"dg-publish":true,"dg-path":"07 人工智能/打破AI数据孤岛！Anthropic开源革命性模型上下文协议MCP.md","permalink":"/07 人工智能/打破AI数据孤岛！Anthropic开源革命性模型上下文协议MCP/","created":"2025-09-24T15:13:18.153+08:00","updated":"2025-09-24T15:22:28.565+08:00"}
---

#Innolight

今天，我们开源了[模型上下文协议](https://modelcontextprotocol.io/)（MCP），这是一个连接 AI 助手与数据所在系统的新标准，包括内容存储库、商业工具和开发环境。其目标是帮助前沿模型产生更好、更相关的响应。

随着 AI 助手获得主流采用，行业在模型能力方面投入了大量资金，在推理和质量方面取得了快速进展。然而，即使是最先进的模型也受到其与数据隔离的限制——被困在信息孤岛和传统系统之后。每个新的数据源都需要自己的定制实现，使得真正连接的系统难以扩展。

MCP 解决了这个挑战。它提供了一个连接 AI 系统与数据源的通用、开放标准，用单一协议替代了分散的集成。结果是为 AI 系统提供所需数据的更简单、更可靠的方式。

# 模型上下文协议

模型上下文协议是一个开放标准，使开发者能够在其数据源和 AI 驱动的工具之间建立安全的双向连接。架构很简单：开发者可以通过 MCP 服务器公开其数据，或构建连接到这些服务器的 AI 应用程序（MCP 客户端）。

今天，我们为开发者介绍模型上下文协议的三个主要组件：

- 模型上下文协议[规范和SDK](https://github.com/modelcontextprotocol)
- [Claude桌面应用程序](https://claude.ai/redirect/website.v1.a006e4c8-571d-4958-b034-febb17fe07b5/download)中的本地 MCP 服务器支持
- MCP 服务器的[开源存储库](https://github.com/modelcontextprotocol/servers)

Claude 3.5 Sonnet 擅长快速构建 MCP 服务器实现，使组织和个人能够快速将其最重要的数据集与一系列 AI 驱动的工具连接起来。为帮助开发者开始探索，我们分享了为流行企业系统预构建的 MCP 服务器，如 Google Drive、Slack、GitHub、Git、Postgres 和 Puppeteer。

Block 和 Apollo 等早期采用者已将 MCP 集成到他们的系统中，而 Zed、Replit、Codeium 和 Sourcegraph 等开发工具公司正在与 MCP 合作以增强其平台——使 AI 代理能够更好地检索相关信息，进一步理解编码任务的上下文，并以更少的尝试产生更细致和功能性的代码。

"在 Block，开源不仅仅是一种开发模式——它是我们工作的基础，也是创造推动有意义变革并作为所有人公共利益的技术的承诺，" Block 首席技术官 Dhanji R. Prasanna 说。"像模型上下文协议这样的开放技术是连接 AI 与现实世界应用的桥梁，确保创新是可访问的、透明的，并植根于协作。我们很高兴能参与这个协议并使用它来构建代理系统，这些系统消除了机械工作的负担，让人们能够专注于创造性工作。"

开发者现在可以针对标准协议构建，而不是为每个数据源维护单独的连接器。随着生态系统的成熟，AI系统将在不同工具和数据集之间移动时保持上下文，用更可持续的架构取代今天分散的集成。

# 开始使用

开发者今天就可以开始构建和测试 MCP 连接器。所有 [Claude.ai](http://claude.ai/redirect/website.v1.a006e4c8-571d-4958-b034-febb17fe07b5) 计划都支持将 MCP 服务器连接到 Claude 桌面应用程序。

Claude for Work 客户可以开始在本地测试 MCP 服务器，将 Claude 连接到内部系统和数据集。我们很快将提供用于部署远程生产 MCP 服务器的开发者工具包，这些服务器可以为您的整个 Claude for Work 组织提供服务。

开始构建：

- 通过[Claude桌面应用程序](https://claude.ai/redirect/website.v1.a006e4c8-571d-4958-b034-febb17fe07b5/download)安装预构建的 MCP 服务器
- 按照我们的[快速入门指南](https://modelcontextprotocol.io/quickstart)构建您的第一个 MCP 服务器
- 为我们的连接器和实现[开源存储库](https://github.com/modelcontextprotocol)做贡献

# 开放社区

我们致力于将 MCP 构建为一个协作的开源项目和生态系统，我们渴望听到您的反馈。无论您是 AI 工具开发者、寻求利用现有数据的企业，还是探索前沿的早期采用者，我们邀请您一起构建上下文感知AI的未来。