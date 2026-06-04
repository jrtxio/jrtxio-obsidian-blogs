---
{"dg-publish":true,"permalink":"/1.inbox/draft/AUTOSAR 入门教程 3：AUTOSAR OS/","dg-note-properties":{"slug":"autosar-tutorial-os","author":"吉人","created":"2025-04-12","source":null}}
---

> 掌握 AUTOSAR OS 的七个核心对象、四个可伸缩性等级和调度机制，理解所有 BSW 模块赖以运行的底层调度基础。

前两篇教程拆解了 [[3.wiki/AUTOSAR\|AUTOSAR]] 的 [[3.wiki/分层架构\|分层架构]]和 BSW 内部的模块化组织。但有一个问题被刻意跳过了：这些模块到底是谁在调度？WdgM 的主函数在哪个 Task 里跑？NvM 的异步操作由谁触发？答案指向同一个模块——AUTOSAR OS。它不是可选组件，而是整个 BSW 的调度骨架。不理解 OS，后面每一篇教程中提到的 “周期性 Task”、“事件触发”、“资源保护” 都只是空中楼阁。

## 七个核心对象

AUTOSAR OS 基于 OSEK/VDX 规范，定义了七个核心对象。每个对象解决一个具体的调度问题。

**Task（任务）** 是基本执行单元，分 Basic 和 Extended 两类。Basic Task 只能被激活和终止，执行完就结束；Extended Task 额外支持 `WaitEvent()` 进入等待状态，直到事件到来才恢复执行。大部分 BSW 模块的主函数跑在 Basic Task 中——它们不需要等待事件，被周期性激活就够了。

**ISR（中断服务例程）** 分 Category 1 和 Category 2。Cat.1 不经过 OS 直接响应硬件中断，延迟最低但不受 OS 保护；Cat.2 由 OS 管理，支持中断屏蔽和优先级控制，是 AUTOSAR 推荐的方式。CanDrv 收到报文后触发的接收回调就是典型的 Cat.2 ISR。

**Event（事件）** 是 Task 间同步的信号机制，仅 Extended Task 支持。一个 Task 调用 `SetEvent()` 通知另一个 Task，后者在 `WaitEvent()` 处被唤醒。Event 的典型用途是通知型场景：NvM 完成异步写入后通过 Event 通知上层 Task 数据已就绪。

**Resource（资源）** 采用优先级天花板协议（PCP）防止优先级反转。获取资源时，OS 将 Task 优先级提升到天花板值；释放时恢复原优先级。PCP 天然防止死锁，可预先分析最坏情况阻塞时间。但 PCP 与优先级继承（PI）不能混用——混用后优先级反转分析会失效。

**Counter（计数器）** 驱动 Alarm 和 Schedule Table 的时基。通常映射到硬件定时器，每次 tick 递增。Counter 本身不执行任何动作，它只是为后续两个对象提供时间刻度。

**Alarm（报警器）** 基于 Counter 触发动作——激活 Task、设置 Event 或调用回调函数。支持单次触发和周期触发。周期性激活 WdgM_MainFunction 就是通过 Alarm 实现的：Counter 每 1ms tick 一次，Alarm 配置为每 10ms 触发一次 Task。

**Schedule Table（调度表）** 是 AUTOSAR 在 OSEK 基础上的关键扩展。OSEK 原生不含此功能。它的核心价值是精确控制多个 Task 在同一时间窗口内的激活顺序。一条 Schedule Table 定义了一组按时间偏移排列的 Action，每个 Action 在指定 Counter 满足偏移值时触发。多个 Schedule Table 可通过硬件信号同步运行。

为什么 Schedule Table 如此重要？发动机缸内循环控制是典型场景：曲轴转一圈 720 度，喷油、点火、排放检测必须在精确的曲轴角度触发，误差不能超过几度。如果用独立的 Alarm 分别调度这些 Task，各 Alarm 的启动时间漂移会累积，无法保证相对时序。Schedule Table 把所有 Action 绑定在同一个时间轴上，消除了漂移问题。

## 四个可伸缩性等级

AUTOSAR OS 定义了四个可伸缩性等级，从无保护基础调度到 ASIL-D 全功能保护。

| 等级 | 能力 | 应用场景 |
|------|------|----------|
| SC1 | 基础调度 + Schedule Table | 无安全等级要求的普通 ECU |
| SC2 | SC1 + 时间保护 | 防止 Task 超时占用 CPU |
| SC3 | SC1 + 内存保护 | OS-Application 间内存隔离 |
| SC4 | 时间保护 + 内存保护 | 安全关键 ECU，ASIL-D 必需 |

SC2 的时间保护依赖高精度看门狗定时器监控每个 Task 的执行时间，核心参数是 Execution Budget（单次执行最大时间预算）、Time Frame（两次激活最小间隔）和 Lock Budget（持锁最长时间）。如果某个 Task 的 WCET（最坏情况执行时间）超标，OS 通过 ProtectionHook 介入处理。

SC3/SC4 的内存保护基于 MPU（Memory Protection Unit）实现。OS-Application 是保护单元，一个 OS-Application 包含多个 Task、ISR、Counter、Alarm。OS 为每个 OS-Application 配置独立的 MPU 区域，访问越界立即触发 ProtectionHook。ProtectionHook 可终止单个 OS-Application 或重启整个 OS——这种粒度的故障隔离是 ASIL-D 认证的基础。

一个容易忽视的细节：AUTOSAR OS 的优先级语义是数字越大优先级越高（0 为最低），与 FreeRTOS 等很多 RTOS 相反。等优先级 Task 按 FIFO 排队。在 SC2/SC4 叠加时间保护后，优先级映射的正确性需要经过严格的调度分析验证。

## 工程实现

AUTOSAR OS 的开源实现以 ERIKA Enterprise v3 和 Trampoline 为代表，两者都选择裸机路线直接实现 OSEK/VDX 规范，不依赖第三方 RTOS，更符合 AUTOSAR OS 的静态配置哲学，认证更容易。ERIKA 支持 Arm、PPC、TriCore 等多架构，由 Evidence Srl 维护；Trampoline 支持 Arm、x86、AVR 等，由开源社区维护。

量产 ECU 采用商业实现的根本原因是 ISO 26262 认证。Vector MICROSAR、EB tresos 等商业实现都持有 ASIL-D 认证。“可以用”和“获得认证可以量产” 是两回事——没有 TÜV、SGS 等机构的流程审查，没有完整的 FMEA/FTA 文档和工具资质证明，依然进不了 SOP。

AUTOSAR OS 的工程现实是高度配置驱动。一套完整的 ECU 软件包含数千个 OS 配置参数，通过 DaVinci Configurator 或 EB tresos Studio 生成 C 代码。配置过程本身就是一项核心开发活动——Task 优先级分配、Alarm 周期设定、Schedule Table 的 Action 编排，这些决策直接影响系统的实时性和可靠性。

## 实践建议

- Task 优先级分配先用 Rate Monotonic 策略（周期越短优先级越高）作为初始方案，再用工具做可调度性分析验证
- Schedule Table 的 Action 偏移量要留出足够的时间裕量，避免 Task 执行时间波动导致 Action 漏触发
- SC3/SC4 的 MPU 区域划分要和 OS-Application 的功能边界对齐，不要把不同 ASIL 等级的 Task 混在同一个 OS-Application 里
- 开发阶段启用 ProtectionHook 的详细日志，记录每次违规的 Task ID 和违规类型，比事后分析效率高得多
- 所有 Task 的 WCET 必须通过静态分析工具或实测手段获取，凭经验估计的 WCET 是定时炸弹

下一篇教程将介绍 [[3.wiki/AUTOSAR\|AUTOSAR]] 应用层的核心设计模型——SWC 与 RTE。OS 负责调度 Task，而 Task 里跑的 Runnable Entity 来自 SWC，两者通过 RTE 连接。理解了 OS 的调度机制，再学 SWC/RTE 就有了落脚点。
