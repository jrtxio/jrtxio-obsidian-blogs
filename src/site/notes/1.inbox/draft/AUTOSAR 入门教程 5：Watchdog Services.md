---
{"dg-publish":true,"permalink":"/1.inbox/draft/AUTOSAR 入门教程 5：Watchdog Services/","dg-note-properties":{"slug":"autosar-watchdog-services","author":"吉人","created":"2025-04-13","source":null}}
---

> 掌握 WdgM 的三种监控机制（Alive/Deadline/Logical）和状态机驱动的故障处理流程，理解看门狗栈如何作为系统安全的最后防线。

车载 ECU 运行环境恶劣：电压抖动、电磁干扰、软件缺陷都可能导致程序跑飞。功能安全标准（ISO 26262）要求系统必须能检测并从这些故障中恢复。[[3.wiki/AUTOSAR\|AUTOSAR]] 的看门狗栈（WdgM Stack）就是这个安全机制的核心实现——它不防止故障发生，而是确保故障发生时系统能及时复位到安全状态。

## 看门狗栈的三层架构

看门狗栈遵循[[3.wiki/分层架构\|分层架构]]跨越 BSW 的三个层次。服务层是 WdgM（Watchdog Manager），负责监控逻辑和状态管理。ECU 抽象层是 WdgIf（Watchdog Interface），在多驱动环境下路由 WdgM 的请求。MCAL 层是 Wdg Driver，直接操作硬件看门狗定时器。

被监控的对象叫做被监督实体（Supervised Entity），可以是任意函数或 Runnable。WdgM 不关心实体的具体功能，只关心它"有没有按时执行"和"有没有按正确的顺序执行"。

![autosar-watchdog-layer-position.png\|看门狗服务三个模块在 AUTOSAR 分层架构中的位置\|450](/img/user/0.asset/media/autosar-watchdog-layer-position.png)

## 三种监控机制

WdgM 提供三种互补的监控方式，分别覆盖不同的故障模式。实际项目中通常组合使用，形成完整的监控网络。

### Alive Supervision（存活监控）

存活监控检测周期性执行实体的频率是否正常。原理很直观：在实体的每次执行路径上放置检查点（Checkpoint），WdgM 在固定的监控周期内统计检查点被触发的次数。如果计数落在配置的容忍范围之外，就判定为故障。

一个 1ms 周期的任务，每 10ms 检查一次，检查点应该在 10 次左右。低于下限说明任务被阻塞了，高于上限说明任务被异常重复触发。

### Deadline Supervision（时限监控）

时限监控检测非周期性实体在规定时间内是否完成。它在实体的起始和结束各放一个检查点，记录两个检查点之间的时间差。如果差值超出配置的时间窗口，判定为超时故障。典型的应用场景是异步数据处理任务：数据到达后必须在 50ms 内处理完毕，Deadline 监控就能捕获处理超时的情况。

### Logical Supervision（逻辑监控）

逻辑监控检测程序的执行路径是否正确。它在条件分支处放置检查点，验证程序是否走了预期的路径。可以把逻辑监控想象成一条流水线：每个工位必须按顺序经过，跳过或乱序都会触发告警。

三种监控的关系可以这样理解：Alive 监控"跑得快不快"，Deadline 监控"跑得完跑不完"，Logical 监控"跑的路线对不对"。

## 状态机与故障处理

WdgM 通过两级状态机管理监控结果：每个被监督实体有自己的本地状态（Local Status），所有实体的状态汇总为全局状态（Global Status）。

- WDGM_LOCAL_STATUS_OK / WDGM_GLOBAL_STATUS_OK：监控正常
- WDGM_LOCAL_STATUS_FAILED / WDGM_GLOBAL_STATUS_FAILED：检测到异常，但尚未达到复位阈值
- WDGM_LOCAL_STATUS_EXPIRED / WDGM_GLOBAL_STATUS_EXPIRED：失败次数超过阈值，触发复位
- WDGM_LOCAL_STATUS_DEACTIVATED / WDGM_GLOBAL_STATUS_DEACTIVATED：监控已禁用

故障处理的完整流程：每个监控周期内评估所有被监督实体的检查点，更新本地状态和失败计数器；本地失败计数器达到阈值后升级本地状态为 EXPIRED；任何一个实体进入 EXPIRED，全局状态也跟着升级；全局状态进入 EXPIRED 后，WdgM 停止喂狗，硬件看门狗定时器溢出触发 ECU 复位。

正常运行时，WdgM 在每个主函数循环中调用 `WdgM_SetTriggerCondition` 传入非零值来"喂狗"。故障发生时传入 0 值，让看门狗定时器自然溢出并复位系统。这是一种"被动触发"的复位策略——WdgM 不主动拉复位引脚，而是停止喂狗让硬件自行复位。

## 功能安全全局视角

WdgM 不是孤立的模块，它是 AUTOSAR 功能安全体系的一环。SafeWDG 在 WdgM 基础上增加分层监控和全局看门狗状态机，支持多个独立的监控域。E2E（端到端）保护通过 CRC 和存活计数器确保通信路径上的数据完整性——发送方在数据中附加 CRC 和递增计数器，接收方验证两者，检测数据在传输过程中是否被篡改或丢失。WdgM 监控的是本地执行正确性，E2E 保护监控的是通信路径完整性，两者互补。

## 实践建议

- 检查点密度要平衡监控精度和系统开销，过于密集会拖慢任务调度，过于稀疏会漏检故障
- 失败阈值的设置要与功能安全等级匹配，ASIL-D 等级通常要求更低的容忍次数
- 开发阶段启用 WdgM 的详细日志输出，方便定位哪个实体的检查点触发异常
- 通过故障注入测试验证看门狗机制的有效性——故意让某个实体停止调用检查点，确认 WdgM 能正确触发复位
- WdgM 通常由 EcuM 在启动阶段完成初始化，教程 13 会详细展开这个启动流程

下一篇教程将深入存储栈（MemStack）——NvM 模块如何管理 ECU 的持久化数据。WdgM 的监控结果和失败计数器也可以存储在 NvM Block 中，实现跨启动周期的故障追踪。