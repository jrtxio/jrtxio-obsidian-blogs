---
{"dg-publish":true,"permalink":"/1.inbox/draft/AUTOSAR 入门教程 11：CanSM/","dg-note-properties":{"slug":"autosar-tutorial-cansm","author":"吉人","created":"2025-04-12","source":null}}
---

> 理解 CanSM 如何管理 CAN 控制器的状态转换，掌握三种通信模式的切换机制和 Bus-Off 恢复流程。

CAN 控制器不只是收发器，它有自己的状态：正常通信、只收不发、完全离线。这些状态的切换不能由应用层直接操作硬件寄存器来完成——需要经过标准化的状态管理流程，确保通信栈各模块协同切换。[[3.wiki/AUTOSAR\|AUTOSAR]] 的 CanSM（CAN State Manager）就是这个管理者：它接收 ComM 的通信模式请求，驱动 CanIf 执行硬件状态切换，同时监控 Bus-Off 等异常状态并自动恢复。

## CanSM 的角色定位

CanSM 位于通信栈的服务层，是 ComM 与 CanIf 之间的桥梁。ComM 是通信请求的统一入口——应用层通过 RTE 告诉 ComM"我需要通信"或"我要静默"，ComM 把这个请求翻译成总线特定的模式切换指令下发给 CanSM。CanSM 根据指令驱动 CanIf 配置 CAN 控制器的硬件状态。

这种分层设计的逻辑很清晰：ComM 管"要不要通信"（业务决策），CanSM 管"怎么切换 CAN 状态"（协议流程），CanIf 管"操作哪个寄存器"（硬件抽象）。

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 340" width="CanSM 控制流，展示 ComM → CanSM → CanIf → CanDrv 的层级关系">  <defs>    <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">      <path d="M0,0 L8,3 L0,6" fill="#4a4a4a"/>    </marker>    <marker id="arrow-orange" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">      <path d="M0,0 L8,3 L0,6" fill="#d97757"/>    </marker>  </defs>  <!-- Background -->  <rect width="900" height="340" fill="#f8f6f3" rx="12"/>  <!-- Title -->  <text x="450" y="32" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="13" font-weight="600" fill="#1a1a1a" text-anchor="middle">CanSM 控制流：ComM → CanSM → CanIf → CanDrv</text>  <!-- Row 1: Application / ComM -->  <rect x="80" y="60" width="180" height="60" fill="#a8c5e6" rx="8" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="170" y="86" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="11" font-weight="600" fill="#1a1a1a" text-anchor="middle">应用层 / RTE</text>  <text x="170" y="104" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#6a6a6a" text-anchor="middle">"我需要通信" / "我要静默"</text>  <rect x="340" y="60" width="180" height="60" fill="#e8e6e3" rx="8" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="430" y="86" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="11" font-weight="600" fill="#1a1a1a" text-anchor="middle">ComM</text>  <text x="430" y="104" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#6a6a6a" text-anchor="middle">通信管理 · 模式请求翻译</text>  <!-- Arrow: App → ComM -->  <line x1="262" y1="90" x2="338" y2="90" stroke="#4a4a4a" stroke-width="1.5" marker-end="url(#arrow)"/>  <text x="300" y="82" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="7" fill="#6a6a6a" text-anchor="middle">模式请求</text>  <!-- Arrow: ComM → CanSM -->  <line x1="522" y1="90" x2="598" y2="90" stroke="#4a4a4a" stroke-width="1.5" marker-end="url(#arrow)"/>  <text x="560" y="82" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="7" fill="#6a6a6a" text-anchor="middle">总线模式指令</text>  <rect x="600" y="60" width="220" height="60" fill="#d97757" rx="8" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="710" y="86" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="11" font-weight="600" fill="#ffffff" text-anchor="middle">CanSM（CAN 状态管理）</text>  <text x="710" y="104" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#ffffff" text-anchor="middle">Full / Silent / No Communication</text>  <!-- Row 2: CanIf → CanDrv → Hardware -->  <rect x="340" y="170" width="180" height="55" fill="#9dd4c7" rx="8" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="430" y="194" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="11" font-weight="600" fill="#1a1a1a" text-anchor="middle">CanIf</text>  <text x="430" y="212" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#6a6a6a" text-anchor="middle">配置控制器状态</text>  <rect x="600" y="170" width="220" height="55" fill="#f4e4c1" rx="8" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="710" y="194" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="11" font-weight="600" fill="#1a1a1a" text-anchor="middle">CanDrv</text>  <text x="710" y="212" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#6a6a6a" text-anchor="middle">CAN 控制器寄存器操作</text>  <!-- Arrow: CanSM → CanIf -->  <path d="M710,122 L710,150 L430,150 L430,168" fill="none" stroke="#d97757" stroke-width="2" marker-end="url(#arrow-orange)"/>  <text x="570" y="145" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="7" fill="#d97757" text-anchor="middle">驱动状态切换</text>  <!-- Arrow: CanIf → CanDrv -->  <line x1="522" y1="198" x2="598" y2="198" stroke="#4a4a4a" stroke-width="1.5" marker-end="url(#arrow)"/>  <!-- Arrow: CanDrv → Hardware -->  <line x1="822" y1="198" x2="860" y2="198" stroke="#4a4a4a" stroke-width="1.5" marker-end="url(#arrow)"/>  <text x="870" y="188" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#6a6a6a">CAN</text>  <text x="870" y="200" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#6a6a6a">HW</text>  <!-- Row 3: Bus-Off feedback -->  <rect x="80" y="170" width="180" height="55" fill="#e8e6e3" rx="8" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="170" y="194" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="11" font-weight="600" fill="#1a1a1a" text-anchor="middle">Bus-Off 恢复</text>  <text x="170" y="212" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#6a6a6a" text-anchor="middle">自动重试 · 指数退避</text>  <!-- Arrow: CanDrv → CanSM (Bus-Off notification) -->  <path d="M810,227 L810,270 L710,270 L710,248" fill="none" stroke="#d97757" stroke-width="1.5" stroke-dasharray="6,4" marker-end="url(#arrow)"/>  <!-- But CanSM is at y=60-120, need to go up -->  <path d="M810,227 L810,280 L780,280 L780,248 L710,248" fill="none" stroke="#d97757" stroke-width="1" stroke-dasharray="6,4"/>  <!-- Legend -->  <rect x="80" y="270" width="740" height="50" fill="none" rx="8"/>  <line x1="100" y1="295" x2="140" y2="295" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="148" y="298" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#6a6a6a">正常控制流</text>  <line x1="260" y1="295" x2="300" y2="295" stroke="#d97757" stroke-width="2"/>  <text x="308" y="298" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#6a6a6a">CanSM 驱动</text>  <line x1="420" y1="295" x2="460" y2="295" stroke="#d97757" stroke-width="1" stroke-dasharray="6,4"/>  <text x="468" y="298" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#6a6a6a">Bus-Off 反馈</text></svg>

## 三种通信模式

CanSM 管理三种 CAN 通信模式，对应 ECU 不同的工作状态。

**Full Communication（全通信模式）**：CAN 控制器正常运行，收发都开启。ECU 正常工作时处于此模式，所有周期信号和事件报文正常收发。

**Silent Communication（静默通信模式）**：CAN 控制器只接收不发送，俗称"只听模式"。典型应用是网关 ECU 在唤醒初期监听总线活动——确认总线可用后再切到全通信模式，避免在总线异常时发送报文导致错误风暴。

**No Communication（无通信模式）**：CAN 控制器关闭，不收不发。ECU 进入休眠状态时，CanSM 将所有 CAN 通道切换到无通信模式，配合 CanNm 的网络管理实现整车低功耗。

### 模式切换流程

从无通信切到全通信的典型流程：ComM 收到应用层的通信请求 → ComM 调用 CanSM 的 `ComM_UserRequest()` → CanSM 驱动 CanIf 将 CAN 控制器从 STOP 状态切换到 START 状态 → CanIf 调用 CanDrv 初始化硬件 → 控制器就绪后 CanSM 通知 ComM 模式切换完成。这个流程确保了通信栈各层按正确顺序初始化，不会出现"上层开始发数据但底层还没准备好"的情况。

反向流程类似但顺序相反：ComM 请求无通信 → CanSM 先通知上层停止发送 → 驱动 CanIf 停止控制器 → 确认无数据传输后切换到 STOP 状态。

## Bus-Off 恢复机制

Bus-Off 是 CAN 通信中最严重的故障状态。当 CAN 控制器发送错误过多（TEC 计数器超过 255），硬件自动进入 Bus-Off——控制器完全脱离总线，不收不发。如果不处理，这个 ECU 就永远"哑"了。

CanSM 的 Bus-Off 恢复流程分两个阶段。**快速恢复**：CanSM 检测到 Bus-Off 后，等待一个恢复时间（通常几百毫秒），尝试重新初始化 CAN 控制器并恢复通信。如果快速恢复成功，ECU 立即恢复正常工作。**慢速恢复**：如果快速恢复失败（重复 Bus-Off），CanSM 进入指数退避模式，逐渐延长重试间隔，避免在总线故障未排除时反复冲击总线。

恢复参数包括 `CanSmBusOffRecoveryTime`（两次恢复尝试的最小间隔）和 `CanSmMaxBusOffRecoveryAttempts`（最大恢复尝试次数）。超过最大次数后 CanSM 通知上层通信不可用，由应用层决定后续动作（如点亮故障灯）。

## 与 CanNm 的关系

CanSM 和 CanNm 都管 CAN 的"开"和"关"，但管的是不同层面。CanSM 管 CAN 控制器的硬件状态——控制器处于 START 还是 STOP，能不能收发报文。CanNm 管网络层的逻辑状态——这条总线上所有 ECU 是否都准备好通信，是否可以集体进入睡眠。

实际操作中两者配合：CanNm 判定网络需要唤醒时，通过 ComM 请求全通信模式，ComM 调用 CanSM 执行硬件切换。CanNm 判定网络可以睡眠时，同样通过 ComM 请求无通信模式。CanSM 是执行者，CanNm 是决策者。

## 实践建议

- Bus-Off 恢复参数需要和整车通信矩阵协调。恢复太快会在总线故障时产生大量无效重试，恢复太慢影响功能可用性
- 多通道 CAN（如 CAN0 和 CAN1）的 CanSM 配置要独立，避免一个通道的 Bus-Off 影响另一个通道的正常工作
- 静默模式主要用于调试和唤醒确认阶段，正常运行时不应该长时间停留在静默模式
- CanSM 的状态回调函数是诊断故障定位的关键——Bus-Off 事件必须记录到 DEM，便于售后排查通信异常
- 开发阶段用 CANoe 监控 CanSM 的模式切换时序，确认切换延迟是否满足应用层的时间要求

下一篇教程将深入 CAN 网络管理（CanNm）——它决定整车 ECU 什么时候该醒、什么时候该睡，是功耗管理的核心模块。CanSM 是 CanNm 的下游执行者，理解了两者的分工，CAN 通信栈的完整链路就闭环了。