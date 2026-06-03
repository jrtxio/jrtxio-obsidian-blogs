---
{"dg-publish":true,"dg-path":"车载 gPTP 时间同步：从原理到实现.md","permalink":"/车载 gPTP 时间同步：从原理到实现/","dg-note-properties":{"slug":"automotive-gptp-time-sync","author":"吉人","created":"2023-04-06","source":null}}
---

> gPTP 的核心是用硬件时间戳消除网络传输的不确定性，让车内所有 ECU 共享微秒级时钟。

一辆时速 120 公里的车，1 毫秒驶过 3.3 厘米。激光雷达和摄像头的数据如果相差 1 毫秒，障碍物检测就会出现 3.3 厘米的空间错位——足以产生误判。

域控制器上跑着数十个 ECU 节点，每个节点用独立的晶振计时。晶振频率有微小偏差，几小时累积下来就是毫秒级漂移。要让多个传感器在同一时间基准下对齐，就需要一个机制把所有本地时钟校准到同一个源头。这就是 [[3.wiki/车载网络\|车载网络]] 中 gPTP 协议要做的事。

## 从 NTP 到 gPTP

时间同步领域有三个主流协议。NTP 通过 GPS 卫星接收时间，精度在毫秒级，通常在软件层实现，无法满足车载场景的需求。PTP（IEEE 1588）将时间戳处理下沉到硬件 MAC 层，精度提升到亚微秒级。gPTP（IEEE 802.1AS）是 PTP 针对车载和工业场景的裁剪，在三个方面更严格：

- 传输延时测量：仅支持 P2P 方式，每个桥接节点独立测量报文驻留时间并补偿，精度高于 E2E 方式
- 时间戳采样：仅在 MAC 层采样，避免操作系统调度引入的不确定性
- 时钟同步模式：仅支持双步模式（Sync + Follow_Up），降低对 MAC 硬件的要求

![automotive-gptp-time-sync-fig03.png\|650](/img/user/0.asset/media/automotive-gptp-time-sync-fig03.png)

> P2P 方式中桥接节点记录报文驻留时间并补偿；E2E 方式只测端到端总延时，对中间设备要求低但误差大。双步模式将 Sync 报文的时间戳拆到 Follow_Up 报文中携带。

[[3.wiki/AUTOSAR\|AUTOSAR]] 规范在 gPTP 基础上进一步裁剪。不支持 BMCA（最佳主时钟算法），因为车载网络是静态的，GrandMaster 通常固定为网关。不支持 Announce 和 Signaling 报文，减少不必要的网络开销。允许带 VLAN 信息的报文，前提是网关支持转发预留多播地址 `01:80:C2:00:00:0F`。

## gPTP 的三个核心机制

gPTP 网络按「域」划分，每个域有且仅有一个 GrandMaster（全局主时钟）。节点分两类：End Instance（端节点，可作主可作从）和 Relay Instance（交换节点，接收并转发时间信息）。

![automotive-gptp-time-sync-fig01.png\|650](/img/user/0.asset/media/automotive-gptp-time-sync-fig01.png)

从节点要完成三件事才能与主时钟同步：频率同步、延迟测量、偏差校正。下面依次拆解。

### 频率同步

每个节点的晶振频率有细微差异。100 秒内，A 节点可能计了 99.998 秒，B 节点计了 100.001 秒。频率同步的目标是让从节点算出自己与主节点的频率比率 R。

![vehicle-gptp-time-sync-fig02.png\|200](/img/user/0.asset/media/vehicle-gptp-time-sync-fig02.png)

Master 持续发送 Sync 报文，紧跟着发 Follow_Up 携带发送时间戳 T1。Slave 记录收到 Sync 的本地时间 T2。下一轮同理，Master 发送携带 T3 的 Follow_Up，Slave 记录 T4。有了 T1、T3（主时钟基准）和 T2、T4（从时钟基准），Slave 计算：

$$R = \frac{T3 - T1}{T4 - T2}$$

R 就是主从频率比率。R = 1.00002 意味着 Slave 时钟比 Master 慢万分之零点二，后续所有计算都要乘以这个比率来修正。

### 延迟测量

知道频率比率还不够。报文在链路上传输需要时间，这个延迟也必须精确测出来。测量用 Pdelay_Req、PDelay_Resp、PDelay_Resp_Followup 三种报文完成：

![vehicle-gptp-time-sync-fig03.png\|300](/img/user/0.asset/media/vehicle-gptp-time-sync-fig03.png)

1. Slave 发送 PDelay_Req，在物理层记录发送时间戳 T1
2. Master 在物理层记录接收时间戳 T2
3. Master 回复 PDelay_Resp 携带 T2，在物理层记录发送时间戳 T3
4. Slave 记录收到 PDelay_Resp 的本地时间 T4
5. Master 发送 PDelay_Resp_Followup 携带 T3

Slave 收集齐四个时间戳后计算链路延迟：

$$delay = \frac{(T4 - T1) \cdot R - (T3 - T2)}{2}$$

这个公式假设链路是对称的——报文双向传输延迟相同。在车载短距离以太网中，这个假设基本成立。公式中乘以 R 是为了把 Slave 侧的时间差换算到 Master 的时钟基准下，才能与 Master 侧的时间差做减法。

### 偏差校正

有了频率比率 R 和链路延迟 delay，Slave 就能用 Sync/Follow_Up 报文持续校正自己的时钟。

![automotive-gptp-time-sync-fig02.png\|250](/img/user/0.asset/media/automotive-gptp-time-sync-fig02.png)

Slave 收到 Sync 报文时记录本地时间 Tb，从 Follow_Up 报文中读取 Master 的发送时间 T1。那么 Tb 时刻对应的主时钟时间为：

$$Ta = T_1 + delay + (Tb - T_2) \cdot R$$

这就是同步的最终目标：给定任意本地时刻 Tb，Slave 都能换算出对应的主时钟时刻 Ta。所有节点完成这个换算后，全车就共享同一个时间基准了。

## 两种实现方案

车载时间同步有两种主流实现，分别对应 [[3.wiki/AUTOSAR\|AUTOSAR]] 和 Linux 两个平台。

[[3.wiki/AUTOSAR\|AUTOSAR]] 方案中，Ethernet TimeSync 模块基于 IEEE 802.1AS 实现 gPTP 协议解析，Ethernet Driver 和 Ethernet Interface 模块负责报文收发。StbM（Synchronized Time Base Manager）负责时间基准的统一管理与分发，为应用层提供全局时间戳服务。整个链路遵循 [[3.wiki/分层架构\|分层架构]]，从 MCAL 驱动层到服务层逐层封装。

![vehicle-gptp-time-sync-fig01-1.png\|650](/img/user/0.asset/media/vehicle-gptp-time-sync-fig01-1.png)

Linux 平台使用 LinuxPTP，运行在用户态，通过内核 API 访问硬件时钟。核心包含两个组件：ptp4l 遵循 IEEE 1588 标准，实现边界时钟（BC）、普通时钟（OC）和透传时钟（TC）功能；phc2sys 负责将 PTP 硬件时钟（PHC）与系统时钟同步。

![vehicle-gptp-time-sync-fig01.png\|350](/img/user/0.asset/media/vehicle-gptp-time-sync-fig01.png)

两个方案在协议层面遵循同一套 gPTP 标准，可以互联互通。MCU 上跑 AUTOSAR 用 Ethernet TimeSync + StbM，SoC 上跑 Linux 用 LinuxPTP——同一个车载网络中两种方案通常共存。

域控制器从单域向跨域融合演进时，gPTP 的跨域级联精度如何保证？当 TSN 调度（802.1Qbv）和时间同步（802.1AS）同时部署在同一个车载以太网上，两者如何协同？这些问题正在成为下一代车载网络架构的核心挑战。