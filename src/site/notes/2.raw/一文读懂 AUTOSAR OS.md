---
{"dg-publish":true,"dg-path":"一文读懂 AUTOSAR OS.md","permalink":"/一文读懂 AUTOSAR OS/","dg-note-properties":{"author":"吉人","created":"2026-05-12","source":"https://mp.weixin.qq.com/s/2IL0gfdsw_S0XQs0xtJh6A"}}
---

> AUTOSAR OS 基于 OSEK/VDX 规范，定义了七个核心对象和四个可伸缩性等级，覆盖从无保护基础调度到 ASIL-D 全功能保护。

AUTOSAR Classic Platform（CP）诞生于 2003 年，以 OSEK/VDX 为内核，向上叠加 BSW、RTE 和 SWC 三层架构，配合 ARXML 配置文件和代码生成工具链，形成了一套高度规范化的车控软件框架。AUTOSAR OS 是 CP 的实时操作系统层，基于 OSEK OS 规范扩展而来。CP 的工程代价也很明显：强绑定供应商工具链（Vector、EB、ETAS），授权成本高；面向单核 MCU 设计，多核扩展靠打补丁；静态配置生成代码，灵活性低；CP 与 AP 协同仍有大量工程摩擦。

## 七个核心对象

AUTOSAR OS 规范（基于 OSEK OS）定义了 7 个核心对象：

| 对象 | 说明 | 典型 API |
|------|------|----------|
| Task（任务） | 基本执行单元，分 Basic / Extended 两类 | `ActivateTask()`、`TerminateTask()` |
| ISR（中断） | 一类 / 二类中断，Cat.2 可被 OS 管理 | `EnableInterruptSource()`、`DisableInterruptSource()` |
| Event（事件） | 仅 Extended Task 支持，用于同步等待 | `SetEvent()`、`WaitEvent()`、`ClearEvent()` |
| Resource（资源） | 优先级天花板协议（PCP），防止优先级反转 | `GetResource()`、`ReleaseResource()` |
| Counter（计数器） | 驱动 Alarm 和 Schedule Table 的时基 | 硬件定时器映射 |
| Alarm（报警器） | 基于 Counter 触发任务或回调，支持周期 / 单次 | `SetRelAlarm()`、`SetAbsAlarm()`、`CancelAlarm()` |
| Schedule Table（调度表） | 一组按时间偏移排列的 Action，精准控制多任务激活时序 | `StartScheduleTable()`、`NextScheduleTable()`、`SyncScheduleTable()` |

Task 分 Basic 和 Extended 两类。Basic Task 只能被激活和终止；Extended Task 额外支持 `WaitEvent()` 进入等待状态，直到事件到来才恢复执行。Resource 采用优先级天花板协议（PCP）而非优先级继承（PI）——获取资源时将任务优先级提升到天花板值，释放时恢复。PCP 天然防止死锁，可预先分析最坏情况阻塞时间，但混用 PCP 与 PI 会导致优先级反转分析失效。

Schedule Table 是 AUTOSAR OS 在 SC1 即已引入的关键扩展（OSEK OS 原生不含此功能），用于精确控制一组任务在同一时间窗口内的激活顺序，在发动机缸内循环控制等对时序极为敏感的场景中不可或缺。它本质上是一个时间驱动的 Action 序列：在 Counter 滴答偏移处激活指定 Task 或触发 Alarm，多个 Schedule Table 可通过硬件信号同步运行。实现完整的 Schedule Table 需要 Counter 层、调度执行引擎和多 Counter 同步机制，是一个工程量至少数千行代码且需严格时序验证的子系统。

## 四个可伸缩性等级

| 等级 | 能力 | 应用场景 |
|------|------|----------|
| SC1 | 基础调度 + Schedule Table | 无保护要求 |
| SC2 | SC1 + 时间保护 | 防止任务超时占用 CPU |
| SC3 | SC1 + 内存保护 | OS-Application 间内存隔离 |
| SC4 | 时间保护 + 内存保护 | 安全关键 ECU，ASIL-D 必需 |

SC3/SC4 要求对每个 OS-Application 配置独立的 MPU 区域，访问越界立即触发 ProtectionHook。ProtectionHook 可终止单个 OS-Application 或重启整个 OS——这种粒度的故障隔离是 ASIL-D 认证的基础。OS-Application 是 AUTOSAR OS 的保护单元，一个 OS-Application 可包含多个 Task、ISR、Counter、Alarm。

SC2 的时间保护依赖高精度看门狗定时器监控每个任务的执行时间，核心参数是 Execution Budget（单次执行最大时间预算）、Time Frame（两次激活最小间隔）和 Lock Budget（持锁最长时间）。

AUTOSAR OS 的优先级语义为数字越大优先级越高（0 为最低），与许多 RTOS 相反。等优先级任务按 FIFO 排队。在 SC2/SC4 中叠加时间保护后，优先级映射的正确性需要经过严格的调度分析验证。

## 开源实现与工程现实

ERIKA Enterprise v3 和 Trampoline 是目前最成熟的开源 AUTOSAR OS 实现，两者都选择裸机路线直接实现 OSEK/VDX 规范，不依赖第三方 RTOS，更符合 AUTOSAR OS 的静态配置哲学，认证更容易。ERIKA 支持 ARM、PPC、TriCore 等多架构，由 Evidence Srl 维护；Trampoline 支持 ARM、x86、AVR 等，由开源社区维护。

量产 ECU 采用 AUTOSAR CP 的根本原因之一，是 AUTOSAR OS 已有成熟的 ISO 26262 认证方案——Vector MICROSAR、EB tresos 等商业实现都持有 ASIL-D 认证。"可以用"和"获得认证可以量产"是两回事，没有经过 TÜV、SGS 等机构的流程审查，没有完整的 FMEA/FTA 文档和工具资质证明，依然进不了 SOP。AUTOSAR CP 的开发流程高度依赖 ARXML 配置生成代码，一套完整的 ECU 软件包含数千个配置参数，通过 DaVinci Configurator 或 EB tresos Studio 生成 C 代码——这既是优势也是门槛。
