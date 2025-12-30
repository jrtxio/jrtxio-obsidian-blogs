---
{"dg-publish":true,"dg-path":"01 车载技术/AUTOSAR 入门教程（3）Watchdog Services.md","permalink":"/01 车载技术/AUTOSAR 入门教程（3）Watchdog Services/"}
---

#Innolight

🚨 **AUTOSAR 看门狗服务是保障车载系统可靠性的关键机制** 💪，它能有效监控软件执行时序和逻辑正确性，避免因软件故障导致系统异常运行。在功能安全要求严格的汽车电子系统中，看门狗服务是防止系统失效的最后一道防线 🔒。

## 🧠 1. Watchdog Services 核心概念

💡 **Watchdog Services** 是 AUTOSAR 分层架构中的一组模块，包含：
- 🔹 **Watchdog Manager**（服务层）
- 🔹 **Watchdog Interface**（ECU 抽象层） 
- 🔹 **Watchdog Driver**（MCAL 层）

这些模块共同监控应用程序和基础软件中**被监督实体（Supervised Entity）**的执行状态。被监督实体可以是任意函数或 **runnable**（可独立执行的指令集合）📌。

![Pasted image 20250805102147.png](/img/user/0.Asset/resource/Pasted%20image%2020250805102147.png)

## 🔍 2. 三种监控类型及工作原理

### 2.1 ⏱️ Alive Supervision（存活监控）
- 用途：监控周期性执行实体的执行频率
- 实现：通过检查点（Checkpoints）记录执行次数
- 示例：1ms 任务每 10ms 检查一次，计数器应在 10±误差范围内更新

### 2.2 ⏳ Deadline Supervision（时限监控）  
- 用途：监控实体在规定时间内的执行完成情况
- 实现：记录开始和结束检查点的时间戳差值
- 示例：10ms 内必须完成的任务，超时即触发监控 ⚠️

### 2.3 🧩 Logical Supervision（逻辑监控）
- 用途：监控程序执行流程的正确性
- 实现：在条件分支放置检查点验证执行路径
- 示例：验证程序是否按预期执行了正确分支 ✅

## 🏗️ 3. 状态机与故障处理机制

📊 Watchdog Manager（WdgM）通过两级状态进行监控：

| Global Supervision Status WdgM | Local Supervision Status of Supervised Entities |
| ------------------------------ | ----------------------------------------------- |
| WDGM_GLOBAL_STATUS_OK          | WDGM_LOCAL_STATUS_OK                            |
| WDGM_GLOBAL_STATUS_FAILED      | WDGM_LOCAL_STATUS_FAILED                        |
| WDGM_GLOBAL_STATUS_EXPIRED     | WDGM_LOCAL_STATUS_EXPIRED                       |
| WDGM_GLOBAL_STATUS_STOPPED     |                                                 |
| WDGM_GLOBAL_STATUS_DEACTIVATED | WDGM_LOCAL_STATUS_DEACTIVATED                   |

🔄 故障处理流程：
1️⃣ 监控周期内评估被监督实体  
2️⃣ 更新本地状态和失败计数器  
3️⃣ 达到阈值后更新全局状态  
4️⃣ 全局失败计数器超限时触发系统复位 🔄

## 🤝 4. 模块协作与复位机制

- **WdgIf**：在多驱动环境下路由 WdgM 请求 🚦
- **Wdg Driver**：负责底层硬件操作，包括：
  - 驱动初始化 ⚙️
  - 管理操作模式（关闭/快速/慢速模式） 🔄
  - 设置看门狗触发条件 ⚠️

正常运行时，WdgM 通过 `WdgM_SetTriggerCondition` 提供非零值避免复位；故障时提供 0 值触发硬件复位 💥。

## 🏆 5. 实施建议与最佳实践

🔧 对于安全关键系统，建议结合 AUTOSAR 功能安全扩展（FuSa）进行完整的安全机制设计：
- ✅ **检查点设计**：合理设置检查点密度，平衡监控精度和系统开销
- ✅ **阈值配置**：根据功能安全等级确定适当的失败阈值
- ✅ **模式管理**：正确配置 WdgM 的工作模式和状态转换条件
- ✅ **测试验证**：通过故障注入测试验证看门狗机制的有效性

💡 确保看门狗服务能满足 ASIL 等级要求，为车载系统提供可靠的安全保障 🛡️。