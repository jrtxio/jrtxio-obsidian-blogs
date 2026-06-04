---
{"dg-publish":true,"dg-path":"ASPICE 核心逻辑：V 模型、追溯性与过程评估.md","permalink":"/ASPICE 核心逻辑：V 模型、追溯性与过程评估/","dg-note-properties":{"slug":"aspice-v-model-traceability","author":"吉人","created":"2026-06-04","source":null}}
---

> ASPICE 的底层逻辑用一句话概括：V 模型左侧需求逐层分解，右侧验证逐层收敛，中间靠追溯性串联。抓住这条主线，22 个过程域就不再是散落的表格。

ASPICE（Automotive SPICE）是基于 ISO/IEC 15504 的车载嵌入式软件过程评估模型，由奥迪、宝马、奔驰、大众、福特、保时捷、沃尔沃等主机厂联合推动。它的本质是一套评估供应商软件过程能力的标准。当前版本 V3.1，发布于 2017 年。

很多工程师接触 ASPICE 后的第一反应是：过程域、基本实践、工作产品、能力级别……信息量爆炸，像在背说明书。培训时觉得都懂了，回到项目不知道从哪下手。

根本原因是把 ASPICE 当成了"要填的表"。实际上 ASPICE 的 22 个过程域围绕一个 **V 模型** 组织，每个过程内部遵循相同的结构模式，过程之间靠追溯性和一致性串联。理解这三条主线，所有过程域的要求自然就通了。

## V 模型：左侧分解，右侧收敛

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 465" font-family="PingFang SC, Microsoft YaHei, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" width="650">  <!-- Background -->  <rect width="980" height="465" fill="#f8f6f3" rx="12"/>  <!-- Defs -->  <defs>    <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">      <path d="M 0 0 L 10 5 L 0 10 z" fill="#4a4a4a"/>    </marker>    <marker id="arr-o" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">      <path d="M 0 0 L 10 5 L 0 10 z" fill="#d97757"/>    </marker>  </defs>  <!-- Side labels -->  <text x="10" y="240" text-anchor="middle" font-size="11" font-weight="600" fill="#d97757" transform="rotate(-90 10 240)">需求分解</text>  <text x="970" y="240" text-anchor="middle" font-size="11" font-weight="600" fill="#9dd4c7" transform="rotate(90 970 240)">验证收敛</text>  <!-- ==================== Left Side (Blue) ==================== -->  <!-- SYS.1 需求挖掘 -->  <rect x="22" y="36" width="146" height="40" rx="8" fill="#a8c5e6" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="95" y="52" text-anchor="middle" font-size="8" fill="#6a6a6a">SYS.1</text>  <text x="95" y="66" text-anchor="middle" font-size="9" font-weight="600" fill="#1a1a1a">需求挖掘</text>  <!-- SYS.2 系统需求分析 -->  <rect x="62" y="106" width="146" height="40" rx="8" fill="#a8c5e6" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="135" y="122" text-anchor="middle" font-size="8" fill="#6a6a6a">SYS.2</text>  <text x="135" y="136" text-anchor="middle" font-size="9" font-weight="600" fill="#1a1a1a">系统需求分析</text>  <!-- SYS.3 系统架构设计 -->  <rect x="102" y="176" width="146" height="40" rx="8" fill="#a8c5e6" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="175" y="192" text-anchor="middle" font-size="8" fill="#6a6a6a">SYS.3</text>  <text x="175" y="206" text-anchor="middle" font-size="9" font-weight="600" fill="#1a1a1a">系统架构设计</text>  <!-- SWE.1 软件需求分析 -->  <rect x="142" y="246" width="146" height="40" rx="8" fill="#a8c5e6" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="215" y="262" text-anchor="middle" font-size="8" fill="#6a6a6a">SWE.1</text>  <text x="215" y="276" text-anchor="middle" font-size="9" font-weight="600" fill="#1a1a1a">软件需求分析</text>  <!-- SWE.2 软件架构设计 -->  <rect x="182" y="316" width="146" height="40" rx="8" fill="#a8c5e6" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="255" y="332" text-anchor="middle" font-size="8" fill="#6a6a6a">SWE.2</text>  <text x="255" y="346" text-anchor="middle" font-size="9" font-weight="600" fill="#1a1a1a">软件架构设计</text>  <!-- SWE.3 软件详细设计和单元构建 -->  <rect x="222" y="386" width="146" height="40" rx="8" fill="#a8c5e6" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="295" y="402" text-anchor="middle" font-size="8" fill="#6a6a6a">SWE.3</text>  <text x="295" y="416" text-anchor="middle" font-size="8.5" font-weight="600" fill="#1a1a1a">软件详设与单元构建</text>  <!-- ==================== Right Side (Green) ==================== -->  <!-- SWE.4 软件单元验证 -->  <rect x="558" y="386" width="146" height="40" rx="8" fill="#9dd4c7" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="631" y="402" text-anchor="middle" font-size="8" fill="#6a6a6a">SWE.4</text>  <text x="631" y="416" text-anchor="middle" font-size="9" font-weight="600" fill="#1a1a1a">软件单元验证</text>  <!-- SWE.5 软件集成和集成测试 -->  <rect x="598" y="316" width="146" height="40" rx="8" fill="#9dd4c7" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="671" y="332" text-anchor="middle" font-size="8" fill="#6a6a6a">SWE.5</text>  <text x="671" y="346" text-anchor="middle" font-size="8.5" font-weight="600" fill="#1a1a1a">软件集成与集成测试</text>  <!-- SWE.6 软件合格性测试 -->  <rect x="638" y="246" width="146" height="40" rx="8" fill="#9dd4c7" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="711" y="262" text-anchor="middle" font-size="8" fill="#6a6a6a">SWE.6</text>  <text x="711" y="276" text-anchor="middle" font-size="9" font-weight="600" fill="#1a1a1a">软件合格性测试</text>  <!-- SYS.4 系统集成和集成测试 -->  <rect x="678" y="176" width="146" height="40" rx="8" fill="#9dd4c7" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="751" y="192" text-anchor="middle" font-size="8" fill="#6a6a6a">SYS.4</text>  <text x="751" y="206" text-anchor="middle" font-size="8.5" font-weight="600" fill="#1a1a1a">系统集成与集成测试</text>  <!-- SYS.5 系统合格性测试 -->  <rect x="718" y="106" width="146" height="40" rx="8" fill="#9dd4c7" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="791" y="122" text-anchor="middle" font-size="8" fill="#6a6a6a">SYS.5</text>  <text x="791" y="136" text-anchor="middle" font-size="9" font-weight="600" fill="#1a1a1a">系统合格性测试</text>  <!-- ==================== Left Side Arrows (going down) ==================== -->  <line x1="95" y1="76" x2="135" y2="106" stroke="#4a4a4a" stroke-width="1.5" marker-end="url(#arr)"/>  <line x1="135" y1="146" x2="175" y2="176" stroke="#4a4a4a" stroke-width="1.5" marker-end="url(#arr)"/>  <line x1="175" y1="216" x2="215" y2="246" stroke="#4a4a4a" stroke-width="1.5" marker-end="url(#arr)"/>  <line x1="215" y1="286" x2="255" y2="316" stroke="#4a4a4a" stroke-width="1.5" marker-end="url(#arr)"/>  <line x1="255" y1="356" x2="295" y2="386" stroke="#4a4a4a" stroke-width="1.5" marker-end="url(#arr)"/>  <!-- ==================== Right Side Arrows (going up) ==================== -->  <line x1="631" y1="386" x2="671" y2="356" stroke="#4a4a4a" stroke-width="1.5" marker-end="url(#arr)"/>  <line x1="671" y1="316" x2="711" y2="286" stroke="#4a4a4a" stroke-width="1.5" marker-end="url(#arr)"/>  <line x1="711" y1="246" x2="751" y2="216" stroke="#4a4a4a" stroke-width="1.5" marker-end="url(#arr)"/>  <line x1="751" y1="176" x2="791" y2="146" stroke="#4a4a4a" stroke-width="1.5" marker-end="url(#arr)"/>  <!-- ==================== Horizontal Correspondence (dashed, orange) ==================== -->  <line x1="208" y1="126" x2="718" y2="126" stroke="#d97757" stroke-width="1.2" stroke-dasharray="6,4" marker-end="url(#arr-o)"/>  <line x1="248" y1="196" x2="678" y2="196" stroke="#d97757" stroke-width="1.2" stroke-dasharray="6,4" marker-end="url(#arr-o)"/>  <line x1="288" y1="266" x2="638" y2="266" stroke="#d97757" stroke-width="1.2" stroke-dasharray="6,4" marker-end="url(#arr-o)"/>  <line x1="328" y1="336" x2="598" y2="336" stroke="#d97757" stroke-width="1.2" stroke-dasharray="6,4" marker-end="url(#arr-o)"/>  <line x1="368" y1="406" x2="558" y2="406" stroke="#d97757" stroke-width="1.2" stroke-dasharray="6,4" marker-end="url(#arr-o)"/>  <!-- ==================== Region Labels ==================== -->  <!-- System layer label -->  <text x="100" y="18" font-size="9" fill="#6a6a6a">系统过程组 SYS</text>  <!-- Software layer label -->  <text x="160" y="238" font-size="9" fill="#6a6a6a">软件工程组 SWE</text>  <!-- ==================== Correspondence Labels (midpoint of dashed lines) ==================== -->  <text x="463" y="120" text-anchor="middle" font-size="7.5" fill="#d97757">系统需求 → 系统合格性测试</text>  <text x="463" y="190" text-anchor="middle" font-size="7.5" fill="#d97757">系统架构 → 系统集成测试</text>  <text x="463" y="260" text-anchor="middle" font-size="7.5" fill="#d97757">软件需求 → 软件合格性测试</text>  <text x="463" y="330" text-anchor="middle" font-size="7.5" fill="#d97757">软件架构 → 软件集成测试</text>  <text x="463" y="400" text-anchor="middle" font-size="7.5" fill="#d97757">软件详设 → 软件单元验证</text></svg>

V 的左侧是需求逐层分解：SYS.1 需求挖掘 → SYS.2 系统需求分析 → SYS.3 系统架构设计 → SWE.1 软件需求分析 → SWE.2 软件架构设计 → SWE.3 软件详细设计和单元构建。每一层把上一层的产出作为输入，分解出更细粒度的需求或设计。

V 的右侧是验证逐层收敛：SWE.4 软件单元验证 → SWE.5 软件集成和集成测试 → SWE.6 软件合格性测试 → SYS.4 系统集成和集成测试 → SYS.5 系统合格性测试。从最底层开始验证，逐层向上收口。

左侧每个过程做的事，右侧都有对应过程来验证。SYS.2 定义了系统需求，SYS.5 用合格性测试来验证；SWE.1 定义了软件需求，SWE.6 来验证。**V 模型的每一层都是一对"定义 - 验证"关系。**

V2.5 版本中所有工程过程用 ENG 统一编号，V3.1 按领域拆分为 SYS 和 SWE，并引入了"插件"概念——顶层是系统过程，具体工程领域（软件 SWE、硬件 HWE、机械 MEE）可以按需加入评估范围。

### 左侧：需求分解的六层

需求分解从利益相关方需求开始。SYS.2 把它转化成一组可验证、可追溯的系统需求，同时定义验证准则。SYS.3 建立系统架构，将系统需求分配给各系统要素，定义要素之间的接口和动态行为。

进入软件层后，SWE.1 从系统需求中提取软件相关的部分，转化为软件需求。SWE.2 建立软件架构，将软件需求分配到架构要素，定义资源消耗目标。SWE.3 进一步分解到软件单元，写出详细设计，生成可执行代码。

每一层做三件事：定义需求或设计 → 建立与上游的追溯性 → 沟通给下游。

### 右侧：验证收敛的五层

验证从代码级别开始。SWE.4 通过静态分析、代码评审和单元测试验证软件单元是否符合详细设计。SWE.5 将单元集成到完整的软件，测试架构层面的接口和交互。SWE.6 对完整的集成软件做合格性测试，验证是否符合软件需求。

然后进入系统层面：SYS.4 集成系统项并测试接口，SYS.5 对完整系统做合格性测试。

每一层做三件事：制订测试策略 → 执行测试并记录结果 → 建立测试与被验证对象之间的追溯性。

右侧有一个关键概念：符合架构设计。SWE.5 和 SYS.4 的集成测试不是测功能，而是证明组件之间的接口和交互满足架构设计定义的规范——数据流是否正确、时序依赖是否满足、资源消耗是否达标。

## 追溯性与一致性：贯穿全程的红线

V3.1 把追溯性和一致性从一个基础实践拆分为两个独立实践。追溯性是工作产品之间的引用或链接关系，支持覆盖率分析、影响分析和需求实现状态跟踪。一致性是所有追溯的引用可用（无缺失）且正确（未连错），通过评审来验证。

追溯性是评估中最容易被扣分的地方。左侧要求需求到设计的追溯，右侧要求需求到测试用例、测试用例到测试结果的追溯。V3.1 新增了两项追溯要求：测试用例与测试结果、变更请求与受影响工作产品之间的追溯。在实际项目中，追溯性通过 ALM 工具（Polarion、DOORS 等）实现，而不是手工维护表格。

## 每个过程的共同结构

ASPICE 的过程域虽然内容不同，但结构高度统一。每个过程包含：过程目的（一句话说明做什么）、过程成果（成功后的 4-8 条结果）、基本实践（具体活动）、输出工作产品（带编号的产出物列表，如 08-52 测试计划、13-22 追溯记录）。

基本实践中，几乎每个过程都有三个固定项：建立双向可追溯性、确保一致性、沟通约定的结果。区别只在追溯的对象不同。理解了一个过程域的结构，就能快速读懂其他过程域——核心逻辑是相同的。

## 能力级别与评估

ASPICE 定义了 6 个能力级别：Level 1 已执行（有产出）、Level 2 已管理（过程被计划和监控，工作产品受控）、Level 3 已建立（过程被标准化定义并部署）、Level 4 可预测（过程被度量并控制）、Level 5 创新（过程持续改进）。

大多数供应商的目标是 Level 2。

评分使用四级尺度：N（0%-15%）、P（15%-50%）、L（50%-85%）、F（85%-100%）。Level 2 要求 PA 1.1（过程实施）达到 F，PA 2.1（实施管理）和 PA 2.2（工作产品管理）达到 L 或 F。

评分有约束：PA 2.1 和 PA 2.2 不能高于 PA 1.1——过程本身都没做好，管理和文档化做得再好也上不去。

### 评估实操

评估按独立性分 Type A/B/C/D 四种，Type A 最严格，评估组完全独立。评估类别（Class 1/2/3）决定每个过程需要几个项目实例——Class 1 至少 4 个，Class 3 只需 1 个。

评估组组长必须是 intacs 认证的 Principal 或 Competent Assessor，成员至少是 Provisional Assessor。典型 Type A、Class 3、VDA Scope Level 2 评估需要 5 天。

评估内容分两部分：将公司标准过程与 ASPICE 对标，以及评价具体项目的过程执行情况。过程完全缺失则不再进一步评估，部分缺失则按标准打分。

### 过程改进路径

准备评估不是临时抱佛脚。推荐路径：差距分析 → 过程定义 → 试点运行 → 推广 → 预评估。核心原则是渐进改进胜过激进改进——逐步适应，不影响商业目标。正式评估前 2-3 个月做一次预评估，把流程走一遍，不符合项及时纠正。

过程改进涉及三个维度：人、过程、技术，三者需要协同推进。目标可以从三个层面理解：缩短交付时间（过程透明、可度量、关注重用）、降低成本（一次成功，降低损失成本）、提高产品质量（产品质量由过程质量保证）。

## 支持过程：V 模型的基建

除了工程过程，支持过程为 [[3.wiki/AUTOSAR\|AUTOSAR]] 项目中 V 模型的运行提供基础设施。

- **SUP.1 质量保证**：独立且客观地检查工作产品和过程是否符合规定。关键要求是"独立性"——质量保证人员不能有利益冲突。V3.1 新增了管理层确保解决已升级不符合项的明确要求，建立了从发现到升级的完整闭环。
- **SUP.8 配置管理**：维护所有工作产品的完整性。V3.1 新增分支管理要求，适应并行开发场景。核心活动是识别配置项、建立基线、控制修改和发布。基线是经正式评审并达成一致的规范或产品，只有通过正式变更控制规程才能更改。
- **SUP.9 问题解决管理**：确保问题从识别到关闭的全生命周期管理。V3.1 强调趋势分析——不只是记录问题，还要从数据中识别趋势提前预警。
- **SUP.10 变更请求管理**：覆盖变更请求的审批、实施和追溯。关键实践是实施前审批、实施后评审，以及建立变更请求与受影响工作产品之间的双向追溯性。
- **MAN.3 项目管理**：将 V2.5 的 12 条基本实践精简为 10 条，核心变化是将可行性评估独立出来，强调项目目标在可用资源和约束条件下的可实现性。
- ACQ.4 供应商监控：要求约定联合过程和接口，定期评审供应商的技术进展和进度，适用于供应商为客户开发组件、提供现成组件或混合交付的场景。

## V2.5 到 V3.1 的关键变化

V3.1 的变化集中在三条主线：

- **结构重组**：工程过程从统一的 ENG 编号拆分为 SYS 和 SWE，引入插件概念。追溯性和一致性从一个实践拆分为两个。单元构建与验证从合并变为分离。
- **实践精简**：各支持过程的 BP 大幅精简——SUP.1 从 10 条变 6 条，SUP.10 从 13 条变 8 条，MAN.3 从 12 条变 10 条。核心思路是把"跟踪记录"和"报告"合并为"总结和沟通"，把"维护证据"融入执行过程的记录要求。
- **追溯性扩展**：右侧过程从"验证"改为"测试"，独立出"选择测试用例"步骤。新增测试用例到测试结果、变更请求到受影响工作产品的追溯要求，体现了对测试过程更完整的覆盖。

ASPICE 的标准文件和评估工具在不断演进，但核心逻辑从未改变：需求分解要完整，验证闭环要严密，追溯链条不能断。这三点做到了，评估只是走个流程。