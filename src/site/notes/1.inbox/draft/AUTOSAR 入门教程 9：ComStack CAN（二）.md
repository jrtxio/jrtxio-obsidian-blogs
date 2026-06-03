---
{"dg-publish":true,"permalink":"/1.inbox/draft/AUTOSAR 入门教程 9：ComStack CAN（二）/","dg-note-properties":{"slug":"autosar-communication-stack-can","author":"吉人","created":"2025-04-16","source":null}}
---

> 搞清 CAN 通信栈的分层结构，以及 CanIf 和 CanDrv 各自的职责边界。

在教程 8 中我们介绍了 [[3.wiki/AUTOSAR\|AUTOSAR]] 通信栈的通用架构：信号、PDU 和路由三要素。从这篇开始，我们聚焦 CAN 总线——车载 [[3.wiki/车载网络\|车载网络]] 中使用最广泛的通信协议。CAN 单帧最多 8 字节，但诊断报文动辄上百字节，这之间的矛盾由传输协议（CanTp）和网络管理（CanNm）解决，控制器状态由 CanSM 管理。本篇先拆解 CAN 通信栈的分层结构和两个核心模块：CanIf 与 CanDrv。

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 520" width="CAN 通信栈分层架构，展示 CanDrv → CanIf → PduR → COM 的层级关系及 CanSM、CanNm、CanTp 位置">  <defs>    <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">      <path d="M0,0 L8,3 L0,6" fill="#4a4a4a"/>    </marker>  </defs>  <!-- Background -->  <rect width="880" height="520" fill="#f8f6f3" rx="12"/>  <!-- Title -->  <text x="440" y="32" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="13" font-weight="600" fill="#1a1a1a" text-anchor="middle">CAN 通信栈分层架构</text>  <!-- Layer labels (left side) -->  <text x="28" y="108" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="9" fill="#6a6a6a" text-anchor="middle" transform="rotate(-90,28,108)">MCAL</text>  <text x="28" y="208" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="9" fill="#6a6a6a" text-anchor="middle" transform="rotate(-90,28,208)">ECU 抽象层</text>  <text x="28" y="340" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="9" fill="#6a6a6a" text-anchor="middle" transform="rotate(-90,28,340)">服务层</text>  <text x="28" y="460" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="9" fill="#6a6a6a" text-anchor="middle" transform="rotate(-90,28,460)">应用层</text>  <!-- Layer backgrounds -->  <rect x="50" y="60" width="800" height="90" fill="#e8e6e3" rx="8" stroke="#4a4a4a" stroke-width="0.5" stroke-dasharray="4,4"/>  <rect x="50" y="160" width="800" height="90" fill="#e8e6e3" rx="8" stroke="#4a4a4a" stroke-width="0.5" stroke-dasharray="4,4"/>  <rect x="50" y="260" width="800" height="150" fill="#e8e6e3" rx="8" stroke="#4a4a4a" stroke-width="0.5" stroke-dasharray="4,4"/>  <rect x="50" y="422" width="800" height="70" fill="#a8c5e6" rx="8" stroke="#4a4a4a" stroke-width="0.5" stroke-dasharray="4,4"/>  <!-- MCAL Layer -->  <rect x="310" y="80" width="260" height="50" fill="#f4e4c1" rx="8" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="440" y="102" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="11" font-weight="600" fill="#1a1a1a" text-anchor="middle">CanDrv</text>  <text x="440" y="118" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#6a6a6a" text-anchor="middle">CAN 驱动 · 操作控制器寄存器</text>  <!-- ECU Abstraction Layer -->  <rect x="310" y="180" width="260" height="50" fill="#9dd4c7" rx="8" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="440" y="202" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="11" font-weight="600" fill="#1a1a1a" text-anchor="middle">CanIf</text>  <text x="440" y="218" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#6a6a6a" text-anchor="middle">CAN 接口 · PDU 收发抽象</text>  <!-- Service Layer modules -->  <rect x="100" y="282" width="140" height="48" fill="#9dd4c7" rx="8" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="170" y="303" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="11" font-weight="600" fill="#1a1a1a" text-anchor="middle">CanTp</text>  <text x="170" y="319" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#6a6a6a" text-anchor="middle">传输协议</text>  <rect x="260" y="282" width="140" height="48" fill="#9dd4c7" rx="8" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="330" y="303" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="11" font-weight="600" fill="#1a1a1a" text-anchor="middle">PduR</text>  <text x="330" y="319" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#6a6a6a" text-anchor="middle">PDU 路由</text>  <rect x="420" y="282" width="140" height="48" fill="#9dd4c7" rx="8" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="490" y="303" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="11" font-weight="600" fill="#1a1a1a" text-anchor="middle">COM</text>  <text x="490" y="319" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#6a6a6a" text-anchor="middle">信号管理</text>  <rect x="580" y="282" width="130" height="48" fill="#9dd4c7" rx="8" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="645" y="303" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="11" font-weight="600" fill="#1a1a1a" text-anchor="middle">CanNm</text>  <text x="645" y="319" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#6a6a6a" text-anchor="middle">网络管理</text>  <!-- CanSM (highlighted with orange) -->  <rect x="100" y="350" width="140" height="48" fill="#d97757" rx="8" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="170" y="371" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="11" font-weight="600" fill="#ffffff" text-anchor="middle">CanSM</text>  <text x="170" y="387" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#ffffff" text-anchor="middle">状态管理</text>  <!-- ComM -->  <rect x="260" y="350" width="140" height="48" fill="#e8e6e3" rx="8" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="330" y="371" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="11" font-weight="600" fill="#1a1a1a" text-anchor="middle">ComM</text>  <text x="330" y="387" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#6a6a6a" text-anchor="middle">通信管理</text>  <!-- DCM -->  <rect x="420" y="350" width="140" height="48" fill="#e8e6e3" rx="8" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="490" y="371" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="11" font-weight="600" fill="#1a1a1a" text-anchor="middle">DCM</text>  <text x="490" y="387" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#6a6a6a" text-anchor="middle">诊断通信</text>  <!-- Application Layer -->  <rect x="260" y="436" width="320" height="44" fill="#a8c5e6" rx="8" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="420" y="463" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="11" font-weight="600" fill="#1a1a1a" text-anchor="middle">RTE / SWC（应用层）</text>  <!-- Vertical arrows -->  <line x1="440" y1="130" x2="440" y2="178" stroke="#4a4a4a" stroke-width="1.5" marker-end="url(#arrow)"/>  <line x1="440" y1="230" x2="440" y2="282" stroke="#4a4a4a" stroke-width="1.5" stroke-opacity="0.6" marker-end="url(#arrow)"/>  <!-- Connections: Service layer to CanIf -->  <line x1="170" y1="282" x2="370" y2="230" stroke="#4a4a4a" stroke-width="1" stroke-opacity="0.6" stroke-dasharray="4,3"/>  <line x1="645" y1="282" x2="510" y2="230" stroke="#4a4a4a" stroke-width="1" stroke-opacity="0.6" stroke-dasharray="4,3"/>  <!-- CanSM to CanIf -->  <line x1="170" y1="350" x2="370" y2="230" stroke="#d97757" stroke-width="1.5" stroke-dasharray="6,4" marker-end="url(#arrow)"/>  <!-- Application to COM -->  <line x1="420" y1="436" x2="490" y2="330" stroke="#4a4a4a" stroke-width="1" stroke-opacity="0.6" stroke-dasharray="4,3" marker-end="url(#arrow)"/>  <!-- CAN Bus bar at bottom -->  <rect x="100" y="496" width="610" height="6" fill="#d97757" rx="3"/>  <text x="760" y="502" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#6a6a6a" text-anchor="middle">CAN Bus</text></svg>

## CAN 通信栈分层结构

CAN 通信栈严格遵循[[3.wiki/分层架构\|分层架构]]原则，从下到上分为三层：

- **MCAL 层**：CAN 驱动（CanDrv）直接操作 CAN 控制器硬件，提供初始化、收发和状态管理接口
- **ECU 抽象层**：CAN 接口（CanIf）屏蔽底层硬件差异，为上层提供统一的 PDU 收发服务
- **服务层**：包括 COM、PDU Router、CanTp、CanSm、CanNm 等模块，分别负责信号管理、路由、多帧传输、状态管理和网络管理

这种分层设计意味着更换 MCU 或 CAN 控制器时，只需修改 CanDrv，上层模块完全不受影响。CanIf 是唯一允许直接访问 CanDrv 的上层模块，这种访问控制保证了层次间的依赖方向单一。

诊断报文和 NM 报文也在这条栈上传输，但走不同的通道：诊断报文经 CanTp 到 PDU Router 再到 DCM，NM 报文直接从 CanIf 到 CanNm。

## CAN 接口（CanIf）

CanIf 是 ECU 抽象层的核心模块，它把 CanDrv 的硬件操作封装成标准化的 PDU 服务。CanIf 提供五类关键接口：传输请求、传输确认、接收指示、控制器模式控制和 PDU 模式控制。上层模块只需要调用这些接口，完全不关心底层用的是哪款 CAN 控制器。

### 硬件对象句柄

CanIf 通过硬件对象句柄（HOH）管理 CAN 报文的收发。HOH 分为两类：HTH（Hardware Transmit Handle）是发送句柄，`Can_Write()` 通过 HTH 将发送请求传递给驱动层；HRH（Hardware Receive Handle）是接收句柄，用于软件过滤，通过 CanID 识别并过滤本节点需要的报文。

HOH 是对 CAN 硬件对象结构的抽象引用，包含 CanId、DLC 和数据等参数。CanIf 通过 HOH 调用驱动接口，保持了硬件独立性。

### PDU 收发流程

PDU 传输的流程分四步：将 HTH 映射到硬件对象，确定目标 CAN 驱动，调用 `Can_Write` API，最后通知上层传输状态。接收流程则相反：CanIf 先对收到的 PDU 做软件过滤和 DLC 检查，缓冲接收数据后向上层传递接收指示。大部分 CanIf 功能可通过配置灵活启用或禁用，开发者按需裁剪即可。

## CAN 驱动（CanDrv）

CanDrv 位于 MCAL 层，直接操作 CAN 控制器寄存器。它提供三个核心能力：硬件访问抽象接口、接收回调通知机制和控制器状态管理。CanDrv 负责处理中断、管理硬件邮箱，但不管 PDU 的语义——那是 CanIf 的事。

这种分工的逻辑很清晰：CanDrv 管"怎么把字节发到总线上"，CanIf 管"发什么、发给谁"。一旦 CAN 控制器型号变了，只改 CanDrv；一旦收发逻辑变了，只改 CanIf。

## 实践建议

- 配置 CanIf 时先明确 HRH/HTH 的数量和映射关系，这块出错会导致报文收不到或发不出去
- BasicCAN 和 FullCAN 可以在同一配置中共存：FullCAN 用于高优先级报文（如安全气囊），BasicCAN 用于普通周期信号
- CanIf 的软件过滤功能是调试利器，开发阶段可以临时放宽过滤条件排查通信问题
- CAN 通信栈的后续内容——多帧传输、状态管理和网络管理——分别对应教程 10（CanTp）、教程 11（CanSM）和教程 12（CanNm）