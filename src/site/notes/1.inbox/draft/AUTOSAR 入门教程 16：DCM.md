---
{"dg-publish":true,"permalink":"/1.inbox/draft/AUTOSAR 入门教程 16：DCM/","dg-note-properties":{"slug":"autosar-dcm","author":"吉人","created":"2025-04-21","source":null}}
---

> 理解 DCM 三大子模块 DSL/DSD/DSP 的分工与协作，掌握诊断请求从接收到响应的完整数据流。

当诊断仪向 ECU 发送一条 UDS 请求，背后发生了什么？在 [[3.wiki/AUTOSAR\|AUTOSAR]] 分层架构中，[[3.wiki/车载诊断\|车载诊断]] 栈的 DCM（Diagnostic Communication Manager）模块负责接收、校验、处理并返回诊断响应。上一篇教程介绍了诊断框架的整体架构，这篇聚焦 DCM 内部——它不是一个单块模块，而是由三个子模块协同工作的管线。

## DSL：会话与定时管理

DSL（Diagnostic Session Layer）是 DCM 的"前台调度"，管理诊断会话的完整生命周期。它不处理具体的诊断服务内容，而是维持所有请求响应赖以运行的上下文环境。

DSL 维护三个核心状态：**诊断会话类型**（默认会话、编程会话、扩展会话等）、**安全级别**（锁定、Level 1、Level 2 等）以及 **S3 定时器**。S3 定时器决定了诊断仪的在线超时——如果 ECU 在 S3 时间内没收到任何诊断请求，DSL 会自动将会话切回默认状态、安全级别重置为锁定。这就像银行 ATM 的超时退卡机制：长时间无操作就回到初始状态，防止未授权访问。

DSL 与 PDU Router 交互管理数据流。当 PDU Router 通过 `PduR_DcmStartOfReception` 通知有新数据到达时，DSL 负责接收并缓存。响应发送时，DSL 通过 `PduR_DcmTransmit` 将数据交给 PDU Router，再由底层通信栈发出。DSL 还控制着 **P2 定时器**（诊断仪等待响应的最大时间）和 **P2` 定时器**（发送了 NRC `0x78` 响应后允许的额外等待时间），这两个定时器直接影响诊断仪的等待行为。

## DSD 与 DSP：校验分发与处理执行

### DSD：请求校验与分发

DSD（Diagnostic Service Dispatcher）充当"质检员"。每收到一个诊断请求，DSD 按以下顺序进行校验：协议校验（检查 SID 是否在当前协议支持范围内）、会话校验（检查该 SID 在当前会话中是否被支持）、安全校验（检查该 SID 需要的安全级别是否已解锁）、长度校验（检查报文长度是否符合服务定义）。任一校验失败，DSD 直接构造否定响应码（NRC）返回，不会转发给 DSP。这层过滤机制确保了无效请求不会浪费处理资源。校验通过后，DSD 将请求转发给对应的 DSP 处理函数，等待处理结果，再组装响应报文。

### DSP：服务处理与数据交互

DSP（Diagnostic Service Processor）是 DCM 中真正"干活"的部分，负责执行具体的诊断服务逻辑。每个 UDS 服务在 DSP 中都有对应的处理函数，通过配置表（`DcmDspService` 容器）静态映射。

以 `0x22`（ReadDataByIdentifier）服务为例，DSP 的工作流程：解析请求中的 DID（Data Identifier），查找配置表中对应的处理函数；通过 RTE 调用 SWC 或 BSW 模块提供的 `DataIdentifier` 回调接口获取数据；将数据按 UDS 格式组装到响应报文中。

DSP 与应用层的交互通过 RTE 接口实现。SWC 通过 RTE 提供 `Dcm_DataCallout` 类型的回调函数，DSP 在处理服务时通过 RTE 调用这些函数。这意味着应用代码无需关心 UDS 协议细节，只需实现数据读写的业务逻辑。DCM 配置工具会根据诊断数据库自动生成这些接口映射。

DEM 模块通过 `Dem_GetDTCByStatusMask` 等接口向 DSP 提供故障码数据。当诊断仪发送 `0x19`（ReadDTCInformation）服务时，DSP 调用 DEM 的接口获取 DTC 列表、状态快照等信息。DCM 和 DEM 的协作机制在下一篇教程中会详细展开。

## 实践建议

- **配置优先于编码**：DCM 的大部分行为通过 ARXML 配置决定——会话类型、安全级别、SID 支持矩阵、定时器参数。先理解配置结构，再去看源码，效率更高
- **安全访问是高频坑点**：`0x27`（SecurityAccess）服务的种子密钥算法需要与诊断工具严格对齐。密钥算法通常由 OEM 提供，供应商只需集成调用接口，但 Seed/Key 的计算时序容易出问题
- **NRC 优先级要理清**：当多个校验同时失败时，NRC 有固定的优先级顺序（如 `0x12` > `0x13` > `0x22`）。优先级顺序在 ISO 14229-1 标准中有明确定义，调试时对照标准排查