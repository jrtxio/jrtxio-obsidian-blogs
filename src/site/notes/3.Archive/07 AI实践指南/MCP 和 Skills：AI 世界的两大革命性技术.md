---
{"dg-publish":true,"dg-path":"07 AI实践指南/MCP 和 Skills：AI 世界的两大革命性技术.md","permalink":"/07 AI实践指南/MCP 和 Skills：AI 世界的两大革命性技术/"}
---

#ai

> 本文深入解析 MCP（Model Context Protocol）和 Skills 两大核心技术，阐述它们如何让 AI 从"聊天工具"进化为"数字员工"，通过统一协议连接外部世界，通过模块化技能封装专业知识，为 AI 应用开发带来革命性突破。

## 引言：AI 的进化时刻

想象一下，如果你想让一个超级智能的助手帮你完成一项工作——比如从数据库查询数据、生成报告、发送邮件给团队成员。在传统方式下，这需要：

1. 为每个数据库编写专门的接口代码
2. 为每个邮件服务开发集成功能
3. 编写复杂的提示词引导 AI 完成任务
4. 重复这个过程，因为每个 AI 平台都不同

这就像每次要使用不同的充电器，每换一个设备就要重新连接。这正是 AI 世界面临的"M×N 集成噩梦"——M 个 AI 模型，N 个外部系统，需要为每一对组合开发专用连接方案。

2024 年底，Anthropic 推出了 **MCP（Model Context Protocol）**，一个开源的标准化协议，被誉为"AI 的 USB-C 接口"。几乎同时，**Skills（技能）** 概念开始普及，让 AI 能够像掌握专业技能一样执行复杂任务。

这两项技术正在彻底改变 AI 应用的开发方式。本文将从"是什么、为什么、怎么用"三个维度，带您全面了解这两大革命性技术。

## 第一部分：MCP——AI 世界的万能连接器

### 什么是 MCP？

**MCP（Model Context Protocol）** 是一个开放的标准协议，用于连接大语言模型与外部数据源和工具。它由 Anthropic 于 2024 年底发布，旨在解决 AI 模型无法直接访问外部世界的根本问题。

**核心定义：** MCP 是基于 JSON-RPC 2.0 的开放协议，定义了 AI 客户端、AI 模型和 MCP 服务器之间的通信方式。它提供了三种核心原语：

1. **Tools（工具）**：AI 可以调用的函数，如"查询数据库"、"发送邮件"
2. **Resources（资源）**：AI 可以访问的数据，如"本地文件"、"知识库"
3. **Prompts（提示模板）**：预定义的提示词模式，优化特定任务的执行

**技术架构：**

```
AI 客户端（如 Claude Desktop）
    │
    └─ MCP Client（协议层）
           │
           ├─ MCP Server A（连接 GitHub）
           ├─ MCP Server B（连接 PostgreSQL）
           ├─ MCP Server C（连接本地文件系统）
           └─ MCP Server N（连接自定义服务）
```

**传输方式：**
- **Stdio**：本地进程通信，适合本地部署的服务器
- **SSE（Server-Sent Events）**：流式传输，支持实时数据推送
- **HTTP**：传统 HTTP 请求，适合远程服务调用

### 为什么需要 MCP？

**解决的核心痛点：**

1. **碎片化集成问题**
   - 传统方法需要为每个 AI 模型和每个数据源开发专用集成
   - M 个模型 × N 个数据源 = M×N 个集成任务
   - 开发成本高、维护困难、难以扩展

2. **缺乏标准化**
   - 不同 AI 平台的接口各不相同
   - 开发者需要学习多套 API
   - 难以在不同平台间迁移应用

3. **安全性挑战**
   - 直接开放数据库或 API 给 AI 模型存在安全风险
   - 缺乏统一的权限控制和审计机制
   - 难以实现细粒度的访问控制

**MCP 带来的价值：**

| 优势维度 | 具体价值 |
|---------|---------|
| **标准化连接** | 一次开发，多平台通用，类似"AI 的 USB-C 接口" |
| **安全性提升** | 通过协议隔离，避免敏感数据直接暴露；支持参数校验、权限控制 |
| **开发效率** | 模块化开发，像搭积木一样组合不同 MCP 服务；缩短 PoC 周期 |
| **生态繁荣** | 超过 12 万个 MCP 服务器资源，覆盖娱乐、监控、自动化、金融、教育等领域 |
| **跨平台兼容** | Claude Desktop、Cursor、VS Code、ChatGPT 等主流平台均已支持 |

### 怎么使用 MCP？

**使用场景举例：**

**场景 1：智能出行规划（高德地图 MCP）**

传统方式：
1. 打开高德地图，查看两地位置
2. 在中间地带搜索咖啡馆
3. 查看不同路线和评价

MCP 实现：
```
用户："在望京和中关村中间，帮我找一家咖啡馆。"
```

执行过程：
1. AI 自动调用高德地图 MCP 服务
2. 计算两地中点位置
3. 搜索并推荐合适的咖啡馆
4. 返回结果给用户

**一句话完成原本需要多个步骤的任务。**

**场景 2：数据库精准查询**

对比测试：学生管理系统数据库（学生信息表、成绩表、教师表等）

| 查询问题 | 传统 RAG 方式 | MCP + 数据库 |
|---------|-------------|--------------|
| 身高 180-190cm 之间的女生有哪些？ | 精度不足，匹配模糊 | 精准返回符合条件的学生列表 |
| 张老师的联系方式 | 可能不准确 | 通过关联查询，精准返回教师联系方式 |
| 哪些同学期末考试比平时成绩好？ | 回答不完整或错误 | 分课程统计，列出具体学生和成绩对比 |

**优势：** MCP 支持直接执行类 SQL 操作，避免向量匹配的模糊性；支持多表关联和复杂查询。

**快速入门：**

1. **安装支持 MCP 的客户端**
   - Claude Desktop
   - Cursor（Agent 模式全面支持）
   - VS Code（v1.99 版本原生支持）

2. **配置 MCP 服务器**
   ```json
   // Claude Desktop 配置示例
   {
     "mcpServers": {
       "github": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-github"]
       },
       "filesystem": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/directory"]
       }
     }
   }
   ```

3. **开始使用**
   - 在对话中直接提出需求
   - AI 自动判断并调用相应的 MCP 工具
   - 无需编写任何代码

**开发自己的 MCP Server：**

```python
# 使用 FastMCP 框架快速开发
from fastmcp import FastMCP

mcp = FastMCP("my-custom-server")

@mcp.tool()
def query_user_database(user_id: str):
    """查询用户数据库，返回用户信息"""
    # 连接数据库并查询
    user = db.query(f"SELECT * FROM users WHERE id = {user_id}")
    return user

if __name__ == "__main__":
    mcp.run(transport="stdio")
```

## 第二部分：Skills——AI 的专业技能书

### 什么是 Skills？

**Skills（技能）** 是将特定任务的方法论、执行逻辑与资源封装成模块化单元，使 AI 能够按照预设流程执行复杂任务的技术范式。它类似于传统软件开发中的"函数"，但专门为 AI 应用设计，本质上是 AI 的"岗位 SOP"（Standard Operating Procedure，标准作业程序）。

**核心定义：** Skills 就像是将特定的业务场景和 AI 能力封装成一个标准化的"技能包"，包含配置说明、服务实现和集成规范，能将一个通用 AI 变为精准执行特定任务的专家。

**技术本质：** Skills 采用"渐进式披露"（Progressive Disclosure）机制，通过分层加载信息，确保 AI 在需要时获取所需知识，同时最大化利用上下文效率。

### 为什么需要 Skills？

**解决的核心痛点：**

1. **提示词工程繁琐**
   - 复杂任务需要长篇大论的提示词
   - 每次对话都要重复输入相同指令
   - 难以维护和团队共享

2. **AI 执行不稳定**
   - 同样的任务，AI 每次执行结果不一致
   - 缺乏标准化的工作流程
   - 难以保证输出质量

3. **知识难以沉淀**
   - 专家经验难以转化为可复用的资产
   - 团队成员之间难以共享最佳实践
   - 知识无法积累和迭代

**Skills 带来的价值：**

| 优势维度 | 具体价值 |
|---------|---------|
| **模块化** | 将专业知识、操作流程、工具调用方式及最佳实践全部封装 |
| **可复用** | 一次编写，可在多次对话中重复使用，"教一次，永久使用" |
| **可组合** | 多个 Skills 可以像积木一样堆叠使用，形成复杂工作流 |
| **Token 效率** | 渐进式加载机制，节省 70-90% 的 Token 消耗 |
| **知识沉淀** | 将专家经验固化为组织资产，支持知识传承和复用 |

### Skills 的工作机制

**渐进式披露：** Skills 的核心技术，通过三层加载方式平衡信息丰富度和 Token 效率。

| 层级 | 内容 | 加载时机 | Token 消耗 | 作用 |
|------|------|----------|-----------|------|
| **L1（元数据）** | YAML frontmatter 中的 `name` 和 `description` | 系统启动时加载 | 约 100 tokens | 帮助 AI 快速判断何时使用该技能 |
| **L2（主指令）** | SKILL.md 文件的正文内容 | 当技能被触发时加载 | 建议 < 500 行 | 提供技能的主要操作逻辑 |
| **L3+（附属资源）** | scripts、references、assets 等 | 按需加载 | 大小不限 | 存储细节、模板、资源等 |

**标准 Skill 目录结构：**

```
your-skill-name/
├── SKILL.md              # 必须 - 主技能文件
├── scripts/              # 可选 - 可执行代码
├── references/           # 可选 - 参考文档
└── assets/               # 可选 - 模板资源
```

**SKILL.md 示例：**

```markdown
---
name: code-review
description: Perform thorough code review with focus on security, performance, and best practices. Do NOT use for generating new code.
author: Your Company
version: 1.0.0
---

# 代码审查技能

## 使用场景
- Pull Request 代码审查
- 代码质量检查
- 安全漏洞识别

## 审查步骤
1. 检查代码风格和命名规范
2. 识别潜在安全漏洞（SQL 注入、XSS 等）
3. 分析性能问题和优化建议
4. 检查错误处理和边界条件
5. 提供符合项目规范的改进建议

## 输出要求
- 优先标注严重问题
- 提供具体的修复建议
- 引用相关文档或最佳实践
```

### 怎么使用 Skills？

**场景举例：**

**场景 1：季度业务评审报告生成**

传统方式：
1. 手动收集各部门数据
2. 使用 Excel 计算指标
3. 使用 PowerPoint 制作报告
4. 多次修改调整格式

使用 Skills：
```
用户："生成 Q4 季度业务评审报告"
```

执行过程：
1. AI 自动触发"季度报告生成"技能
2. 从数据库查询相关数据
3. 按照预设模板生成报告
4. 应用企业品牌风格
5. 输出可编辑的文档

**场景 2：代码审查**

```
用户："审查一下这个 PR"
```

执行过程：
1. AI 自动触发"代码审查"技能
2. 从 GitHub 获取 PR 代码
3. 按照审查流程检查代码
4. 生成审查意见和改进建议
5. 可以选择将评论发布到 GitHub

**创建 Skills 的方法：**

**方法一：对话式创建（适合非技术人员）**

```
你：我想创建一个用于分析客户反馈的技能

Claude：好的！让我先了解一些细节。你能描述一下通常包含哪些分析维度吗？

你：主要包括情感分析、问题分类、优先级排序

Claude：明白了。你有现成的模板或格式吗？

你：[上传模板]

Claude：很好。什么样的输出才算优秀？

...
```

Claude 会根据对话自动构建技能文件。

**方法二：手动创建（适合技术人员）**

```bash
# 1. 创建技能目录
mkdir -p ~/.claude/skills/my-skill

# 2. 编写 SKILL.md 文件
cat > ~/.claude/skills/my-skill/SKILL.md << 'EOF'
---
name: customer-feedback-analysis
description: Analyze customer feedback for sentiment, categorization, and prioritization
---

# 客户反馈分析技能

## 分析维度
- 情感分析（正面/负面/中性）
- 问题分类（产品/服务/体验）
- 优先级排序（紧急/重要/一般）

## 分析步骤
1. 读取反馈文本
2. 进行情感分析
3. 分类问题类型
4. 根据严重程度排序
5. 生成分析报告

## 输出格式
- 情感分布图表
- 问题分类统计
- 优先级清单
- 改进建议
EOF

# 3. 重启 Claude Desktop，技能自动加载
```

**最佳实践：**

1. **描述要具体（用英文写 description）**
   ```yaml
   # ❌ 不推荐：太模糊
   description: 帮我写代码

   # ✅ 推荐：具体明确
   description: Generate React components with TypeScript and Tailwind CSS following atomic design principles
   ```

2. **提供示例和模板**
   - 在 `examples/` 目录中提供典型输出示例
   - 上传已有的高质量模板作为参考

3. **明确质量标准**
   - 定义成功的指标和验收标准
   - 说明什么是"好"的输出结果

4. **多个 Skill 组合使用**
   - 将复杂任务分解为多个 Skills
   - 每个 Skill 专注一个特定功能

## 第三部分：MCP vs Skills——它们有什么区别？

### 一句话定位

- **MCP** 解决 **"连接"** 问题：让 AI 能访问外部系统（数据库、API、文件）
- **Skills** 解决 **"方法论"** 问题：教 AI 如何完成某类任务（代码审查、数据分析流程）

**比喻：**
- MCP 是 AI 的 **"手"**（能触碰外部世界）
- Skills 是 AI 的 **"技能书"**（知道怎么做某件事）

### 详细对比

| 维度 | MCP | Skills |
|------|-----|--------|
| **核心作用** | 连接外部系统、数据源 | 封装专业知识与工作流程 |
| **架构层级** | 集成层 | 提示/知识层 |
| **协议基础** | 基于 JSON-RPC 2.0 的开放协议 | 文件系统 + Markdown 文件 |
| **跨平台支持** | ✅ 是（Anthropic、OpenAI、Google、Microsoft 等） | ❌ 否（目前主要为 Anthropic 生态专属） |
| **触发方式** | 持久连接，工具随时可用 | 基于语义匹配自动触发 |
| **Token 消耗** | 较高（工具定义常驻上下文） | 较低（渐进式加载） |
| **外部访问能力** | 可直接调用外部 API、数据库 | 不能直接访问，需配合 MCP |
| **开发复杂度** | 较高（需实现 MCP Server） | 较低（编写 Markdown 文件即可） |
| **典型使用场景** | 查询数据库、调用 GitHub API | 代码审查、数据报告生成 |

### 结合使用的威力

**示例：Review PR #456 并按团队规范给出建议**

```
1. [MCP] 从 GitHub 获取 PR 数据
2. [Skills] 提供代码审查的方法论
3. [AI] 按 Skills 指引分析代码
4. [MCP] 将审查结果提交至 GitHub
```

**关系说明：**
- MCP 和 Skills 不是竞争关系，而是互补
- MCP 在集成层提供能力，让 AI 能访问数据
- Skills 在知识层提供指导，教 AI 如何处理数据
- 两者结合，可以实现强大的自动化工作流

## 第四部分：生态与应用现状

### MCP 生态

**支持平台：**
- Claude Desktop（Anthropic 官方）
- ChatGPT（OpenAI）
- VS Code / VS Code Insiders
- Cursor
- Windsurf、Zed、Cline

**主流 MCP Servers：**
- GitHub MCP Server（官方）
- Oracle Autonomous Database MCP Server
- Dify MCP Server（工作流插件）
- 40+ 个社区开发的 MCP Server

**开发工具：**
- FastMCP（Python 框架）
- MCP SDK（多语言支持）
- MCP Inspector（调试和监控工具）

### Skills 生态

**平台支持：**
- Claude Skills（Anthropic 官方，2025 年 10 月推出）
- WorkBuddy Skills（腾讯，超过 20 种内置技能）
- Microsoft Azure OpenAI Skills Orchestrator
- GitHub Marketplace（1282+ 个 AI 相关 Actions）

**市场数据：**
- SkillsLLM 市场：1,436 个技能
- Awesome Agent Skills：精选列表
- Claude Marketplace：20+ 个官方 Skills

**热门 Skills：**

| 技能名称 | 安装量 | 功能描述 |
|---------|--------|---------|
| find-skills | 343.7K | 帮助发现和安装其他 Skills |
| vercel-react-best-practices | 173.3K | React 和 Next.js 性能优化指南 |
| n8n | 178K | 可视化工作流自动化平台 |
| gemini-cli | 97K | 将 Gemini AI 能力集成到终端 |

### 应用领域

**1. 开发者工具链**
- VS Code 原生支持 MCP 协议
- Cursor、Claude Code 等 IDE 集成
- 自动化代码审查、测试生成

**2. 数据库与数据分析**
- MySQL、MongoDB、Oracle 等数据库集成
- 精准查询替代传统 RAG 检索
- 支持多表关联和复杂查询

**3. 地图与位置服务**
- 高德地图 MCP：智能出行规划
- 实时交通、路线查询

**4. 内容创作与媒体**
- Notion MCP Server：页面编辑
- Figma MCP Server：设计生成
- 自媒体内容创作辅助

**5. 网页部署与开发**
- 腾讯 Pages MCP：一句话完成网页部署
- Firecrawl MCP Server：网页抓取
- GitHub MCP Server：自动化工作流

**6. 通信与协作**
- Slack、Email MCP：消息管理
- 钉钉、企业微信集成

**7. 金融服务**
- 股票查询、交易分析
- 风险控制、实时监控

**8. 教育与培训**
- 个性化学习路径推荐
- 智能批改和反馈
- 儿童趣味学习工具

**9. 医疗健康**
- 银发养生小贴士
- 健康数据分析
- 患者数据查询

## 第五部分：安全与最佳实践

### MCP 安全考虑

**已知风险：**
1. **提示注入攻击**：恶意提示注入可能导致私有代码库数据泄露
2. **工具投毒**：攻击者可在公共仓库中隐藏恶意指令

**防护策略：**
1. **最小权限原则**：API KEY 仅具备执行必要操作的最低权限
2. **环境隔离**：开发、测试与生产环境使用独立的 KEY
3. **动态权限控制**：限制 Agent 访问权限
4. **日志过滤**：过滤敏感字段输出
5. **环境变量存储**：从环境变量动态加载 KEY

```bash
# 推荐配置示例
export MCP_API_KEY="sk_abc123xyz..."
node server.js
```

### Skills 安全机制

1. **沙盒环境**：所有技能运行在安全的沙盒环境中
2. **权限控制**：`allowed-tools` 字段限制可用工具
3. **命名限制**：禁止名称以 "claude" 或 "anthropic" 开头

### 最佳实践总结

**对于 MCP：**
- 优先使用官方或可信的 MCP Server
- 定期更新 MCP SDK 和相关依赖
- 监控 MCP 连接的 Token 消耗
- 为企业环境配置专门的 MCP 服务器

**对于 Skills：**
- 用英文写 description，提高触发准确率
- 提供清晰的示例和模板
- 明确输出要求和质量标准
- 使用"反向排除"让 Skill 更精准
- 多个 Skill 组合使用，形成工作流

## 第六部分：未来展望

### 发展趋势

**MCP 方向：**
1. 协议标准化进一步完善
2. 更多 AI 框架和工具的原生支持
3. 安全机制的持续增强
4. 云原生部署能力的提升

**Skills 方向：**
1. 跨平台统一的技能标准
2. AI 辅助技能生成和优化
3. Skills as a Service（技能即服务）
4. 企业级技能市场的形成

### 2025-2026 路线图重点

- **MCP**：Streamable HTTP 传输机制全面推广、UI 框架扩展、生态系统持续扩展
- **Skills**：开放标准的进一步完善、跨平台兼容性增强、智能化提升

### 对开发者的影响

**短期（2025 年）：**
- 学习 MCP 和 Skills 的基础概念
- 尝试使用现有的 MCP Servers 和 Skills
- 为自己的业务场景开发定制化的解决方案

**中期（2026 年）：**
- 参与 MCP 和 Skills 的开源社区
- 开发高质量的 MCP Server 和 Skills
- 构建企业级的 AI 工作流和自动化系统

**长期（2027 年及以后）：**
- MCP 成为 AI 集成的通用标准
- Skills 形成繁荣的生态系统
- AI 真正成为"数字员工"，承担复杂任务

## 结论

MCP 和 Skills 正在彻底改变 AI 应用的开发方式。它们分别解决了 AI 世界的两个根本问题：

- **MCP**：让 AI 能够连接外部世界，从"聊天工具"进化为"行动者"
- **Skills**：让 AI 能够掌握专业技能，从"通用助手"进化为"专家"

这两项技术不是孤立的，而是互补的。MCP 提供了连接外部系统的能力，Skills 提供了专业知识的封装。当两者结合，AI 就能够：

1. 访问各类数据源和服务（MCP）
2. 按照专业流程处理数据（Skills）
3. 执行多步骤的复杂任务（两者结合）

这标志着 AI 从"被动回答问题"到"主动完成任务"的质变。对于开发者来说，这意味着：
- 开发效率大幅提升
- 能够快速构建复杂的 AI 应用
- AI 真正成为生产力工具，而不仅仅是新奇的技术

**行动建议：**

- **如果你是开发者**：立即开始学习 MCP 和 Skills，尝试为你的业务场景开发定制化解决方案
- **如果你是企业决策者**：关注 MCP 和 Skills 的发展，考虑如何将它们应用于企业的数字化转型
- **如果你是技术爱好者**：加入开源社区，参与 MCP 和 Skills 的生态建设

AI 的时代已经到来，而 MCP 和 Skills 正是打开这扇大门的钥匙。让我们一起迎接 AI 的下一波浪潮！

## 参考资料

1. [MCP 官方文档 - Introduction](https://modelcontextprotocol.io/introduction)
2. [MCP 中文文档](https://mcp-docs.cn/introduction)
3. [Anthropic 发布 MCP 协议公告](https://www.anthropic.com/news/model-context-protocol)
4. [Claude Skills 官方文档](https://docs.anthropic.com/en/docs/build-with-skills/skills)
5. [Claude Code Docs - 使用 skills 扩展 Claude](https://code.claude.com/docs/zh-CN/skills)
6. [GitHub - anthropics/skills](https://github.com/anthropics/skills)
7. [SkillsLLM - AI Skills Marketplace](https://skillsllm.com/)
8. [Awesome Agent Skills](https://github.com/JackyST0/awesome-agent-skills)
9. [MCP 生态即将引爆：亲测三大案例](https://www.sohu.com/a/883996353_121956424)
10. [MCP + 数据库，一种比 RAG 检索效果更好的新方式](https://www.sohu.com/a/881949985_121124378)
11. [别搞混了！MCP 和 Agent Skill 到底有什么区别?](https://juejin.cn/post/7584057497205817387)
12. [AI开发必备：Claude Skills详解](https://blog.csdn.net/libaiup/article/details/156430043)
13. [Claude Skills 完全指南：让AI 精准适配你的工作流程](https://blog.csdn.net/musicml/article/details/155994106)
14. [国内最大的MCP中文社区来了，4000多个服务等你体验](https://blog.csdn.net/HUANGXIN9898/article/details/147988499)
15. [Oracle - MCP Server Use Cases](https://docs.oracle.com/en/cloud/paas/autonomous-database/serverless/adbsb/mcp-server-use-cases.html)