---
{"dg-publish":true,"dg-path":"automotive/AUTOSAR 入门教程之 Watchdog Services.md","permalink":"/automotive/AUTOSAR 入门教程之 Watchdog Services/","created":"2025-08-05T10:18:09.626+08:00","updated":"2025-08-05T11:14:07.478+08:00"}
---

#Innolight

Watchdog Services 是 AUTOSAR 分层架构中的一组模块，其中如 Watchdog Manager（服务层）、Watchdog Interface（ECU 抽象层）和 Watchdog Driver（MCAL 层）等模块，为监控应用程序和基础软件中某个实体的执行时序与正确性提供服务。

它可以避免在应用或基础软件中没有连续发生故障的情况下，系统被复位。

![Pasted image 20250805102147.png](/img/user/0.Asset/resource/Pasted%20image%2020250805102147.png)

---

在应用程序或基础软件中被监控的实体称为被监督实体（Supervised Entity）。这些被监督实体可以是任意函数，或一个 runnable（指令集合，类似于函数，可以作为一个独立单元执行）。

这些实体通过在软件中放置一些点（称为检查点 Checkpoints）来进行监控。

**对实体的监控有三种类型：**

1. Alive Supervision（存活监控）
2. Deadline Supervision（时限监控）
3. Logical Supervision（逻辑监控）

**Alive Supervision（存活监控）：**

某些被监督的实体应当以特定频率执行，即周期性地执行。存活监控用于监控这些实体的执行频率。

示例：一个 1ms 的任务每 10ms 被监控一次。因此，在 10ms 后，监控这个 1ms 任务的计数器应该被更新为 10（正负误差范围内）。

这个监控计数器是否被更新为 10（±）就是在存活监控下进行监控的内容。

**Deadline Supervision（时限监控）：**

某些被监督的实体应当在规定的时间范围内执行完毕。时限监控用于监控被监督实体所花费的时间。

示例：一个被监督实体应当在 10ms 内执行完毕。在这个被监督实体中会放置两个检查点，并记录开始和结束检查点之间的时间戳。两个检查点之间的时间差将表示该实体的执行时间。

**Logical Supervision（逻辑监控）：**

在某些被监督实体中，执行流程必须被监控，以确保程序无误执行。逻辑监控用于监控程序中的执行流程。

示例：在被监督实体中，有两个条件路径 A 和 B，其中一个路径是正确的。检查点被放置在被监督实体中。通过监控这些检查点的执行情况来监控程序的执行流程。

---

WdgM 和被监督实体的状态可以通过全局监督状态（Global Supervision Status）和本地监督状态（Local Supervision Status）来监控。

- 全局监督状态是 WdgM 在激活模式下的状态
- 本地监督状态是每个被监督实体的状态
- 全局监督状态是基于各被监督实体的本地监督状态得出的

WdgM 和被监督实体的不同有效状态列在表中：

| Global Supervision Status WdgM | Local Supervision Status of Supervised Entities |
| ------------------------------ | ----------------------------------------------- |
| WDGM_GLOBAL_STATUS_OK          | WDGM_LOCAL_STATUS_OK                            |
| WDGM_GLOBAL_STATUS_FAILED      | WDGM_LOCAL_STATUS_FAILED                        |
| WDGM_GLOBAL_STATUS_EXPIRED     | WDGM_LOCAL_STATUS_EXPIRED                       |
| WDGM_GLOBAL_STATUS_STOPPED     |                                                 |
| WDGM_GLOBAL_STATUS_DEACTIVATED | WDGM_LOCAL_STATUS_DEACTIVATED                   |

从一个状态到另一个状态的转换依赖于 WdgM 模式、本地被监督实体状态以及配置被监督实体时设定的失败阈值。

在每一个监控周期中，当前 WdgM 模式下配置的被监督实体会被评估，并根据评估结果更新每个实体的本地状态。

基于本地状态的更新，WdgM 的全局状态也会被更新。

如果某个被监督实体发生故障，其失败计数器将被递增，直到达到预配置的阈值。

一旦达到阈值，该被监督实体的本地状态将被更新。

基于该本地状态，WdgM 的全局状态也会被更新。

如果由于被监督实体的故障，全局失败计数器超过了预设的全局阈值，WdgM 将向 Wdg 驱动发送复位命令，从而导致系统复位。

WdgIf 是一个模块，它在存在多个驱动时，将 WdgM 的请求映射到某个驱动。

Wdg 驱动负责驱动初始化、管理操作模式（关闭模式、快速模式、慢速模式）以及设置看门狗触发。

WdgM 会向 Wdg 驱动提供一个值（WdgM_SetTriggerCondition → WdgIf_SetTriggerCondition → Wdg_SetTriggerCondition）来服务驱动，并在没有故障的情况下避免系统复位。

在应用程序出现故障的情况下，WdgM 提供给 Wdg 驱动的值为 0。这将导致 Watchdog Driver 被复位。