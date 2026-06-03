---
{"dg-publish":true,"permalink":"/1.inbox/draft/AUTOSAR 入门教程 17：DEM/","dg-note-properties":{"slug":"autosar-dem","author":"吉人","created":"2025-04-22","source":null}}
---

> 掌握 DEM 的事件去抖动机制、DTC 生命周期管理和冻结帧记录，理解故障从检测到确认的完整链路。

一个传感器信号偶发跳变，算不算故障？在 [[3.wiki/车载诊断\|车载诊断]] 系统中，DEM（Diagnostic Event Manager）的核心职责就是回答这个问题。它通过去抖动过滤瞬态抖动，通过确认机制锁定永久故障，最终生成 DTC（Diagnostic Trouble Code）供诊断仪读取。上一篇教程介绍了 DCM 如何处理诊断请求，这篇聚焦 DEM——当 DCM 收到 `0x19` 服务读取 DTC 时，背后提供数据的正是 DEM。

## 事件去抖动与状态判定

### 去抖动机制

DEM 收到的每一次事件报告（`Dem_ReportEventStatus` 或 `Dem_SetEventStatus`）并不是立即生效的。就像体温计不会因为一个喷嚏就判定发烧，DEM 通过去抖动计数器过滤掉短暂的、偶然的异常。

AUTOSAR 定义了两种去抖动策略：**基于计数器的去抖动**通过配置 `DemDebCounterFailedThreshold` 和 `DemDebCounterPassedThreshold` 两个阈值实现，收到 `pre-failed` 报告时计数器加步进值，收到 `pre-passed` 报告时减步进值，达到失败阈值时事件被确认；**基于时间的去抖动**在事件持续失败一段时间后才触发确认，适用于需要观察持续时间的场景（如温度超温需持续 500ms）。

以计数器去抖动为例，一个典型配置：失败阈值 `= 5`，通过阈值 `= -5`，步进值 `= 1`。监控函数连续 5 次报告 `pre-failed` 后，计数器从 0 递增到 5，事件状态变为 confirmed。如果在第 3 次时收到一次 `pre-passed`，计数器回退到 2，不会误触发。这种机制有效过滤了偶发抖动。

### 确认与 DTC 生命周期

一个事件从被检测到最终成为 DTC，经历以下状态流转：待处理（pending）去抖动计数器尚未达到阈值；已确认（confirmed）计数器达到失败阈值，DEM 将事件写入事件内存生成 DTC；老化（aging）在连续 N 个驾驶循环（Operation Cycle）中事件未再次确认，DEM 自动清除该 DTC。

DTC 状态字节用 8 个 bit 记录故障的完整生命周期状态：bit 0（testFailed）表示当前测试是否失败，bit 1（testFailedThisOperationCycle）表示本次驾驶循环是否出现过失败，bit 2（pendingDTC）表示待确认，bit 3（confirmedDTC）表示已确认。诊断仪通过 `0x19` 服务读取的 DTC 状态掩码就是与这个字节做按位与运算。

### 冻结帧与扩展数据

当事件被确认时，DEM 会同时记录一组冻结帧（Freeze Frame）数据。冻结帧的作用类似飞机的黑匣子——在故障发生的瞬间捕获当时的运行环境，典型记录内容包括发动机转速、车速、冷却液温度等。一个事件可以配置多组冻结帧。

扩展数据记录（Extended Data Record）提供比冻结帧更灵活的附加信息，可以记录故障发生次数（occurrence counter）、老化计数器（aging counter）、故障持续时间等统计信息。诊断仪通过 `0x19` 服务的子功能按 record number 逐条读取。

## 数据存储与模块协作

DEM 将 DTC 信息存储在事件内存中，通过 NvM 模块实现持久化。事件内存分为三类：主内存（Primary Memory）存储所有已确认的 DTC，用户内存（User Memory）由 OEM 自定义用途，镜像内存（Mirror Memory）用于存储来自其他 ECU 的 DTC。每类内存有独立的大小限制。

DEM 与 DCM 的协作通过标准化接口实现。当 DCM 收到 `0x19` 服务请求时，DSP 调用 `Dem_GetDTCByStatusMask` 获取符合条件的 DTC 列表，调用 `Dem_GetFreezeFrameDataByDTC` 获取冻结帧。DEM 只负责管理数据，DCM 负责包装成 UDS 响应报文。

DEM 还通过回调机制通知其他模块状态变化。当事件确认或解除时，DEM 调用 `Dem_TriggerOnEventStatus` 通知 FiM。FiM 根据事件状态控制功能的启用与抑制——例如车速传感器故障确认后，FiM 会抑制定速巡航功能的执行。这种"故障检测到功能降级"的链路，是 [[3.wiki/AUTOSAR\|AUTOSAR]] 功能安全在软件层面的直接体现。

## 实践建议

- **去抖动参数是调试关键**：计数器步进值和阈值直接影响故障检测的灵敏度。阈值太小容易误报，太大又可能漏检。建议先用故障注入工具模拟不同频率的异常，观察计数器变化，再确定最终参数
- **冻结帧数据要精打细算**：NvM Block 大小有限，冻结帧数据量直接影响存储容量。只记录与故障诊断真正相关的环境数据
- **驾驶循环定义要清晰**：老化机制依赖驾驶循环（Operation Cycle）的起止定义。通常由 EcuM 管理，但 DEM 的 `DemOperationCycle` 配置必须与 EcuM 保持一致，否则老化计数会出现偏差