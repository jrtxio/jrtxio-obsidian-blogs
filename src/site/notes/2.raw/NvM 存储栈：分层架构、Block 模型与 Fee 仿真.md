---
{"dg-publish":true,"dg-path":"NvM 存储栈：分层架构、Block 模型与 Fee 仿真.md","permalink":"/NvM 存储栈：分层架构、Block 模型与 Fee 仿真/","dg-note-properties":{"author":"吉人","created":"2026-04-14","source":null}}
---

> 读懂 AUTOSAR NvM 存储栈的三层架构，掌握 Block 配置、请求处理流程与 Flash EEPROM 仿真原理。

NvM 在 AUTOSAR 中的架构层次如下所示。

![Pasted image 20240229103924.png\|650](/img/user/0.asset/media/Pasted%20image%2020240229103924.png)

分别是 Memory Service（NvM）、Memory Hardware Abstraction（MemIf 和 Fee/Ea）和 Memory Driver（Fls/Eep 驱动），单独拎出来就是这样的。

![Pasted image 20240229104354.png\|350](/img/user/0.asset/media/Pasted%20image%2020240229104354.png)

## 片内与片外存储

Fee（Flash EEPROM Emulation）通常用于片内 Flash 仿真 EEPROM。Ea（EEPROM Abstraction）用于 EEPROM 设备抽象（常见为片外 EEPROM，但也可以是片内 EEPROM）。两者存储特性有本质区别：

| 类型 | 写入 | 擦除 |
| - | - | - |
| EEPROM | 字节级 | 隐式（写即擦） |
| Flash | 按页写入 | 按扇区擦除（通常 KB 级） |

![NvM-Memory-Stack.png](/img/user/0.asset/media/NvM-Memory-Stack.png)

## NvM Block 配置

每个 NvM Block 由四种内存对象组成：

- **NV block**：非易失性存储，包含 block header + 数据区 + 可选 CRC
- **RAM block**：数据读写的高速缓存
- **ROM block**（可选）：故障恢复的默认值
- **Administrative block**：状态标记与数据长度

三种 Block 类型：

| 类型 | NV blocks | RAM block | ROM block | 适用场景 |
| - | - | - | - | - |
| Native | 1 | 1 | 1（可选） | 常规参数 |
| Redundant | 2 | 1 | 1（可选） | 安全关键数据（里程、故障码） |
| Dataset | 多个 | 1 | 多个 | 多配置参数集 |

其中 Redundant Block 不是简单的镜像备份——两个 NV block 各自携带 header（状态标记 + CRC），NvM 通过 CRC 和 valid flag 判断哪个是最新有效数据，实现主备切换。

## 请求处理流程

### 异步队列驱动

NvM 最核心的特征是**异步 + 队列驱动**：所有请求进入 NvM Job Queue，由 `NvM_MainFunction()` 周期调度执行，下层 `MemIf_MainFunction()` 同理。这不是同步调用链——应用发起请求后通过回调或轮询获知结果。

### 单块读写

应用调用 `NvM_ReadBlock()` 或 `NvM_WriteBlock()` 后，请求入队，经 MainFunction 调度后沿 NvM → MemIf 分发：

- 片内路径：MemIf → Fee → Fls
- 片外路径：MemIf → Ea → Eep

### 多块批量操作

- **启动时**：`NvM_ReadAll` 将 NV 数据恢复到 RAM block
- **关闭时**：`NvM_WriteAll` 将 RAM 数据写入 NV block
- 由 EcuM 状态机在 Startup / Shutdown 阶段触发

## Flash EEPROM 仿真

Fee 模块通过仿真技术在 Flash 上实现类似 EEPROM 的按记录读写，本质是 **log-structured（日志式存储）**：每次写入不是覆盖旧数据，而是追加新 instance 并将旧地址标记无效。

核心机制需要至少两个扇区交替使用：

1. 数据持续写入活动扇区，同一 Block 更新时追加到新地址，原地址标记无效
2. 活动扇区空闲空间低于阈值时触发 GC（垃圾回收），有效数据搬运到已擦除的备用扇区
3. 原活动扇区擦除，角色互换

Fee 对上层提供逻辑块地址映射（Block ID 级别），虚拟页是 Fee 内部的最小管理单元，块大小需为虚拟页大小的整数倍。

## 错误恢复

- CRC 校验失败时，NvM 尝试从 ROM block 恢复默认值
- Redundant Block 在主块失效时自动切换到备用块
- 可配置 Retry 机制重试失败的读写操作

## 最佳实践

- 异步回调执行时间尽量短（工程经验建议 < 1ms，非标准要求）
- 安全相关数据启用 CRC 校验并使用 Redundant Block
- Flash 块大小按 4KB 倍数对齐，EEPROM 块不超过页大小
- 实现 `NvM_JobErrorNotification` 错误回调，记录最后成功操作
- 开发阶段启用 `NvM_SetBlockProtection` 防止误写

## 小结

NvM 作为上层应用的统一接口，屏蔽了底层存储硬件的差异：应用只需调用 NvM 的标准 API，无需关心数据最终存储在片内 Flash 还是片外 EEPROM。这种分层设计使得存储方案可以在不同硬件平台之间灵活切换，而不需要修改上层应用逻辑。
