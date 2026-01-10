---
{"dg-publish":true,"dg-path":"01 车载技术/AUTOSAR 入门教程（6）ComStack（一）.md","permalink":"/01 车载技术/AUTOSAR 入门教程（6）ComStack（一）/"}
---

🚀 **AUTOSAR 通信栈** 是车载 ECU 之间高效通信的核心框架，但复杂的模块分层和协议转换常常让开发者头疼。本文将带你深入理解 **ComStack** 的架构设计和关键模块，掌握 PDU 路由和信号处理的精髓！  

![Pasted image 20251230105546.png](/img/user/0.Asset/resource/Pasted%20image%2020251230105546.png)  
🖼️ 图：AUTOSAR 通用通信栈架构（注：部分模块后续单独讲解）

## 📚 核心术语解析  

### 💡 什么是 PDU？  
**协议数据单元（Protocol Data Unit）** 是通信栈中的数据传输载体，包含：  
- 🔹 **服务数据单元（SDU）**：上层待传输的实际数据  
- 🔹 **协议控制信息（PCI）**：源/目的地址等控制元数据  

![Pasted image 20251230105609.png](/img/user/0.Asset/resource/Pasted%20image%2020251230105609.png)  
⚙️ 数据传输流程：  
1️⃣ 发送方：**COM 模块**打包 SDU+PCI → 逐层添加 PCI  
2️⃣ 接收方：逐层解包 PDU → 提取 SDU 向上传递  

### 📌 信号处理三要素  
- 🚦 **信号（Signal）**：最小消息单元（如车速值）  
- 🧩 **信号组（Signal Group）**：需同步传输的信号集合  
- 🔗 **组信号（Group Signal）**：信号组中的单个成员  

## 🛠️ 核心模块功能  

### 🔧 COM 模块（RTE ↔ PDU Router 桥梁）  
- ✅ **接口转换**：信号级 ↔ PDU 级协议无关访问  
- ✅ **数据封装**：发送打包信号 → PDU / 接收解包 PDU → 信号  
- ⚠️ **高级功能**：  
  - 信号过滤、字节序转换  
  - 符号扩展、跨总线网关  

### 🚦 PDU Router 模块（智能路由中枢）  
- 📌 **核心职责**：将 PDU 路由到目标总线（如 CAN/LIN）  
- 💡 **关键特性**：  
  - 上层 PDU 协议无关  
  - 下层自动匹配协议特定模块（CanIf/LinIf）  
  - 支持跨控制器 PDU 转发  

🔍 缩写说明：  
- **TP**：传输协议（Transport Protocol）  
- **NM**：网络管理器（Network Manager）  
- **Trcv**：收发器（Transceiver）  
- **Ext.**：外部（External）  
- **Asic**：专用集成电路（Application Specific Integrated Circuit）