---
{"dg-publish":true,"dg-path":"07 人工智能/如何提升 AI 开发效率：Claude Code 使用准则.md","permalink":"/07 人工智能/如何提升 AI 开发效率：Claude Code 使用准则/","created":"2025-09-18T10:55:41.211+08:00","updated":"2025-09-18T15:56:01.001+08:00"}
---

#Innolight

**YC 心流编程指南**
# 规划流程

- **制定全面计划**：首先与人工智能合作，在 markdown 文件中编写详细的实施计划
- **审查和完善**：删除不必要的内容，如果功能过于复杂则标记为不做
- **保持范围控制**：为后续的想法单独保留一个部分，以保持专注
- **增量实施**：逐节进行工作，而不是试图一次性构建所有内容
- **跟踪进度**：在成功实施后，让人工智能将各部分标记为已完成
- **定期提交**：在进入下一部分之前，确保每个工作部分都提交到 Git

# 版本控制策略

- **严格使用 Git**：不要仅仅依赖人工智能工具的还原功能
- **从干净的状态开始**：为每个新功能从干净的 Git 状态开始
- **遇到问题时重置**：如果人工智能陷入“愿景探索”，使用 git reset --hard HEAD
- **避免累积问题**：多次失败的尝试会产生层层糟糕的代码
- **干净的实施**：当你最终找到解决方案时，重置并干净地实施它

# 测试框架

- **优先考虑高级测试**：专注于端到端集成测试而非单元测试
- **模拟用户行为**：通过模拟有人点击网站/应用来测试功能
- **捕捉回归问题**：大型语言模型（LLMs）经常对不相关的逻辑进行不必要的更改
- **继续前测试**：在进入下一个功能之前，确保测试通过
- **将测试用作护栏**：一些创始人建议从测试用例开始，以提供清晰的边界

# 有效的错误修复

- **利用错误信息**：只需复制粘贴错误信息，通常对人工智能来说就足够了
- **编码前分析**：让人工智能考虑多种可能的原因
- **失败后重置**：在每次修复尝试不成功后，从干净的状态开始
- **实施日志记录**：添加策略性日志记录，以更好地了解发生了什么
- **切换模型**：当一个模型陷入困境时，尝试不同的人工智能模型
- **干净的实施**：一旦你确定了修复方法，重置并在干净的代码库上实施它

# 人工智能工具优化

- **创建指令文件**：在适当的文件（cursor.rules、windsurf.rules、claude.md）中为你的人工智能编写详细指令
- **本地文档**：将 API 文档下载到你的项目文件夹以确保准确性
- **使用多种工具**：一些创始人在同一个项目上同时运行 Cursor 和 Windsurf
- **工具专业化**：Cursor 在前端工作方面速度稍快，而 Windsurf 思考速度较慢
- **比较输出**：生成多个解决方案并选择最佳方案

# 复杂功能开发

- **创建独立原型**：首先在干净的代码库中构建复杂功能
- **使用参考实现**：将人工智能指向可遵循的工作示例
- **清晰的边界**：在允许内部更改的同时，保持一致的外部 API
- **模块化架构**：具有清晰边界的基于服务的架构比单体代码库（monorepos）工作得更好

# 技术栈考虑因素

- **成熟的框架表现出色**：Ruby on Rails 由于 20 年一致的约定而运行良好
- **训练数据很重要**：像 Rust 或 Elixir 这样的较新语言可能有较少的训练数据
- **模块化是关键**：小的、模块化的文件对人类和人工智能来说都更容易处理
- **避免大文件**：不要有数千行长的文件

# 编码之外

- **开发运维（DevOps）自动化**：使用人工智能配置服务器、DNS 和托管
- **设计辅助**：生成网站图标和其他设计元素
- **内容创作**：起草文档和营销材料
- **教育工具**：让人工智能逐行解释实现
- **使用截图**：直观地分享用户界面（UI）错误或设计灵感
- **语音输入**：像 Aqua 这样的工具支持每分钟 140 字的输入

# 持续改进

- **定期重构**：一旦测试到位，就经常进行重构
- **识别机会**：让人工智能寻找可重构的候选对象
- **保持最新**：尝试每个新的模型版本
- **认识优势**：不同的模型在不同的任务上表现出色

---

**YC guide to vibe coding**

# Planning process

- **Create a comprehensive plan**: Start by working with the AI to write a detailed implementation plan in a markdown file
- **Review and refine**: Delete unnecessary items, mark features as won't do if too complex
- **Maintain scope control**: Keep a separate section for ideas for later to stay focused
- **Implement incrementally**: Work section by section rather than attempting to build everything at once
- **Track progress**: Have the AI mark sections as complete after successful implementation
- **Commit regularly**: Ensure each working section is committed to Git before moving to the next

# Version control strategies

- **Use Git religiously**: Don't rely solely on the AI tools' revert functionality
- **Start clean**: Begin each new feature with a clean Git slate
- **Reset when stuck**: Use git reset --hard HEAD if the AI goes on a vision quest
- **Avoid cumulative problems**: Multiple failed attempts create layers and layers of bad code
- **Clean implementation**: When you finally find a solution, reset and implement it cleanly

# Testing framework

- **Prioritize high-level tests**: Focus on end-to-end integration tests over unit tests
- **Simulate user behavior**: Test features by simulating someone clicking through the site/app
- **Catch regressions**: LLMs often make unnecessary changes to unrelated logic
- **Test before proceeding**: Ensure tests pass before moving to the next feature
- **Use tests as guardrails**: Some founders recommend starting with test cases to provide clear boundaries

# Effective bug fixing

- **Leverage error messages**: Simply copy-pasting error messages is often enough for the AI
- **Analyze before coding**: Ask the AI to consider multiple possible causes
- **Reset after failures**: Start with a clean slate after each unsuccessful fix attempt
- **Implement logging**: Add strategic logging to better understand what's happening
- **Switch models**: Try different AI models when one gets stuck
- **Clean implementation**: Once you identify the fix, reset and implement it on a clean codebase

# AI tool optimization

- **Create instruction files**: Write detailed instructions for your AI in appropriate files (cursor.rules, windsurf.rules, claude.md)
- **Local documentation**: Download API documentation to your project folder for accuracy
- **Use multiple tools**: Some founders run both Cursor and Windsurf simultaneously on the same project
- **Tool specialization**: Cursor is a bit faster for frontend work, while Windsurf think slower
- **Compare outputs**: Generate multiple solutions and pick the best one

# Complex feature development

- **Create standalone prototypes**: Build complex features in a clean codebase first
- **Use reference implementations**: Point the AI to working examples to follow
- **Clear boundaries**: Maintain consistent external APIs while allowing internal changes
- **Modular architecture**: Service-based architectures with clear boundaries work better than monorepos

# Tech stack considerations

- **Established frameworks excel**: Ruby on Rails works well due to 20 years of consistent conventions
- **Training data matters**: Newer languages like Rust or Elixir may have less training data
- **Modularity is key**: Small, modular files are easier for both humans and AIs to work with
- **Avoid large files**: Don't have files that are thousands of lines long

# Beyond coding

- **DevOps automation**: Use AI for configuring servers, DNS, and hosting
- **Design assistance**: Generate favicons and other design elements
- **Content creation**: Draft documentation and marketing materials
- **Educational tool**: Ask the AI to explain implementations line by line
- **Use screenshots**: Share UI bugs or design inspiration visually
- **Voice input**: Tools like Aqua enable 140 words per minute input

# Continuous improvement

- **Regular refactoring**: Once tests are in place, refactor frequently
- **Identify opportunities**: Ask the AI to find refactoring candidates
- **Stay current**: Try every new model release
- **Recognize strengths**: Different models excel at different tasks
