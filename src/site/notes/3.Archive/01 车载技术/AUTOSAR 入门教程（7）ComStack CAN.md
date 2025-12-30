---
{"dg-publish":true,"dg-path":"01 车载技术/AUTOSAR 入门教程（7）ComStack CAN.md","permalink":"/01 车载技术/AUTOSAR 入门教程（7）ComStack CAN/"}
---

#Innolight

🚗 **CAN 通信** 是汽车电子系统的核心神经，而 AUTOSAR 中的 **ComStack CAN** 架构则是实现高效可靠通信的关键！本文将深入解析 CAN 接口(CanIf)和 CAN 驱动(CanDrv)模块的设计原理与实现细节。

![Pasted image 20251230110031.png](/img/user/0.Asset/resource/Pasted%20image%2020251230110031.png)

## 🧩 CAN 通信栈架构

AUTOSAR 中与 CAN 协议相关的通信栈采用分层设计：

- 🏗 **服务层**：
  - **AUTOSAR COM**
  - **PDU 路由器**
  - CAN 状态管理器
  - CAN 网络管理器
  - CAN 传输协议

- 🖥 **ECU 抽象层**：
  - **CAN 接口(CanIf)**
  - 外部 CAN 驱动

- ⚙️ **MCAL 层**：
  - **CAN 驱动(CanDrv)**

💡 诊断相关模块、PDU 多路复用和 CAN 收发器也是完整通信栈的重要组成部分。

## 🛠️ CAN 接口(CanIf)详解

CanIf 是 ECU 抽象层中的核心模块，提供五大关键服务：
- 📤 传输请求
- ✅ 传输确认
- 📥 接收指示
- 🔄 控制器模式控制
- 🧩 PDU 模式控制

### 💾 核心概念解析

#### 🔖 硬件对象句柄(HOH)
- **HOH** 包含传输句柄(**HTH**)和接收句柄(**HRH**)
- 是对 CAN 硬件对象结构的抽象引用
- 包含 CanId、DLC 和数据等关键参数
- 🛡️ 保持硬件独立性：CanIf 通过抽象引用调用驱动接口

#### 🔄 BasicCAN vs FullCAN
| 类型 | 特点 | 应用场景 |
|------|------|----------|
| 🟢 **FullCAN** | 单 CanId 传输/接收 | 确定性要求高的场景 |
| 🔵 **BasicCAN** | 支持 CanId 范围 | 灵活配置需求 |

💡 两者可在同一配置中共存，实现软件接收过滤的灵活配置

## ⚙️ 工作流程解析

### 📤 PDU 传输流程
1️⃣ 映射 HTH 到硬件对象  
2️⃣ 确定目标 CAN 驱动  
3️⃣ 调用 **Can_Write** API  
4️⃣ 通知上层传输状态  

### 📥 PDU 接收流程
1️⃣ 软件过滤 PDU  
2️⃣ 执行 DLC 检查  
3️⃣ 缓冲接收数据  
4️⃣ 向上层传递接收指示  

🔧 注意：大部分 CanIf 功能可通过配置灵活启用/禁用

## ⚡ CAN 驱动(CanDrv)核心功能

作为 MCAL 层的关键模块，**CanDrv** 提供：
- 🖥️ 硬件访问抽象接口
- 🔔 接收回调通知机制
- 🎛️ 控制器状态管理

🚨 重要限制：CanIf 是唯一允许访问 CanDrv 的上层模块