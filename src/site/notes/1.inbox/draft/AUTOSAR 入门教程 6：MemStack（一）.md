---
{"dg-publish":true,"permalink":"/1.inbox/draft/AUTOSAR 入门教程 6：MemStack（一）/","dg-note-properties":{"slug":"autosar-memory-stack-1","author":"吉人","created":"2025-04-13","source":null}}
---

> 理解 NvM 模块的服务模式（同步/异步）、Block 配置模型（Native/Redundant/Dataset）和多块请求流程，建立 MemStack 的核心认知。

车载 ECU 需要持久化存储各种数据：里程表读数、故障码、用户偏好设置、校准参数。这些数据在掉电后不能丢失，在运行时需要快速访问。[[3.wiki/AUTOSAR\|AUTOSAR]] 的存储栈（MemStack）就是为这个需求设计的。NvM（NVRAM Manager）模块位于存储栈的顶层，为应用提供统一的数据读写接口，屏蔽底层 Flash 和 EEPROM 的硬件差异。

## 存储栈架构

存储栈遵循[[3.wiki/分层架构\|分层架构]]跨越 BSW 的三个层次。服务层是 NvM，提供非易失性数据的统一管理。ECU 抽象层包含 MemIf（内存接口）、Fee（Flash EEPROM 仿真）和 Ea（EEPROM 抽象）。MCAL 层是 Fls（Flash 驱动）和 Eep（EEPROM 驱动）。

上层模块通过标准化接口访问底层驱动，实现硬件无关的内存操作。应用层调用 NvM 的 API 读写数据，NvM 通过 MemIf 访问 Fee 或 Ea，Fee/Ea 再调用 Fls/Eep 操作硬件。整个调用链中每一层都不需要知道下一层的具体实现。

![memory-stack-module-position.png\|Memory Stack 各模块在 AUTOSAR 分层架构中的位置\|350](/img/user/0.asset/media/memory-stack-module-position.png)

## NvM 服务模式

NvM 提供两种服务模式：同步和异步。同步服务在调用后阻塞等待操作完成，适合简单的单次读写。异步服务采用非阻塞调用，通过回调函数通知完成状态，适合耗时的批量操作。

常用的服务函数包括 `NvM_ReadBlock()` 读取单个 Block、`NvM_WriteBlock()` 写入单个 Block、`NvM_SetDataIndex()` 设置数据集索引。每个函数都有同步和异步两个版本，开发者根据场景选择。

这里有一个关键点：Flash 的写入速度比 RAM 慢几个数量级，而且擦除操作是整扇区进行的。所以在实际项目中，大部分 NvM 操作都使用异步模式，避免阻塞高优先级任务。

## Block 配置模型

NvM 的核心配置单元是 Block。每个 Block 对应一段应用数据，由四种内存对象组成。NV block 是非易失性存储中的数据区，包含 block header、实际数据和可选的 CRC 校验。RAM block 是内存中的高速缓存，应用直接读写 RAM block，NvM 负责同步到 NV block。ROM block 存储默认值，当 NV block 数据损坏时用于恢复。Administrative block 记录状态标记和数据长度等管理信息。

NvM 支持三种 Block 类型，适用于不同的可靠性需求。Native 类型最简单，一个 NV block 加一个 RAM block，用于常规参数存储。Redundant 类型配置两个 NV block 共享一个 RAM block，写入时两个 NV block 都更新，读取时通过 CRC 校验选择有效的那份，适合里程表、故障码等安全关键数据。Dataset 类型支持 1-255 个 NV block 共享一个 RAM block，通过 `NvM_SetDataIndex()` 切换当前活跃的数据集，用于多车型配置参数。

## 请求处理流程

单块请求是最常见的场景：应用调用 `NvM_ReadBlock()` 读取数据时，NvM 先检查 RAM block 是否有效，有效则直接返回 RAM 数据，无效则从 NV block 加载到 RAM 再返回。写入流程类似，数据先写 RAM block，再异步同步到 NV block。

![nvm-single-block-flow.png\|NvM 单块读写请求处理流程\|450](/img/user/0.asset/media/nvm-single-block-flow.png)

多块请求是系统级操作，在 ECU 启动和关闭时触发。启动时调用 `NvM_ReadAll` 把所有 NV block 的数据恢复到 RAM block，关闭时调用 `NvM_WriteAll` 把所有 RAM block 数据写入 NV block。这两个操作由 EcuM（教程 13 会详细介绍）触发，是系统初始化和正常关机的必要步骤。

## 实践建议

- 异步回调函数的执行时间控制在 1ms 以内，避免在中断上下文中做耗时操作
- 安全相关数据启用 CRC 校验，读取时自动验证数据完整性
- Block 大小按 Flash 页对齐（通常是 4KB 的倍数），避免跨页写入带来的性能损耗
- 实现 `NvM_JobErrorNotification` 回调记录错误信息，生产环境中用于追踪存储异常
- 开发阶段启用 `NvM_SetBlockProtection` 防止误写关键 Block

下一篇教程将深入 Fee 模块——它如何在"只能整扇区擦除"的 Flash 上模拟 EEPROM 的随机写入能力，以及双扇区换位机制如何实现磨损均衡。