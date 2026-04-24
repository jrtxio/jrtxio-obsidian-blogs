---
{"dg-publish":true,"dg-path":"AUTOSAR 入门教程（6）ComStack（一）.md","permalink":"/AUTOSAR 入门教程（6）ComStack（一）/","dg-note-properties":{"author":null,"created":"2025-04-15","source":"https://sandeeptiwari.com/ComStack1.html"}}
---

**AUTOSAR 通信栈**是车载 ECU 之间高效通信的核心框架，其模块分层和协议转换机制虽然复杂，但掌握后能够高效地实现跨总线通信。本文将深入解析 **ComStack** 的架构设计和关键模块，涵盖 PDU 路由和信号处理的核心机制。

![Pasted image 20251230105546.png](/img/user/0.asset/media/Pasted%20image%2020251230105546.png)
AUTOSAR 通用通信栈架构，展示了从应用到总线的完整模块层级（部分模块后续单独讲解）。

## 核心术语解析

### 什么是 PDU？

**协议数据单元（Protocol Data Unit，PDU）** 是通信栈中的数据传输载体，包含：

- **服务数据单元（SDU，Service Data Unit）**：上层待传输的实际数据
- **协议控制信息（PCI，Protocol Control Information）**：源/目的地址等控制元数据

![Pasted image 20251230105609.png](/img/user/0.asset/media/Pasted%20image%2020251230105609.png)
PDU 的封装与解封过程：发送方逐层添加 PCI，接收方逐层解包提取 SDU。

数据传输流程：

- 发送方：**COM 模块**打包 SDU+PCI，逐层添加 PCI
- 接收方：逐层解包 PDU，提取 SDU 向上传递

### 信号处理三要素

- **信号（Signal）**：最小消息单元（如车速值）
- **信号组（Signal Group）**：需同步传输的信号集合
- **组信号（Group Signal）**：信号组中的单个成员

## 核心模块功能

### COM 模块（RTE 与 PDU Router 的桥梁）

COM 模块的核心职责：

- **接口转换**：信号级到 PDU 级的协议无关访问
- **数据封装**：发送时打包信号到 PDU，接收时解包 PDU 到信号
- **高级功能**：
 - 信号过滤、字节序转换
 - 符号扩展、跨总线网关

### PDU Router 模块（智能路由中枢）

PDU Router 的关键特性：

- **核心职责**：将 PDU 路由到目标总线（如 CAN/LIN）
- **关键特性**：
 - 上层 PDU 协议无关
 - 下层自动匹配协议特定模块（CanIf/LinIf）
 - 支持跨控制器 PDU 转发

缩写说明：

- **TP**：传输协议（Transport Protocol）
- **NM**：网络管理器（Network Manager）
- **Trcv**：收发器（Transceiver）
- **Ext.**：外部（External）
- **Asic**：专用集成电路（Application Specific Integrated Circuit）
