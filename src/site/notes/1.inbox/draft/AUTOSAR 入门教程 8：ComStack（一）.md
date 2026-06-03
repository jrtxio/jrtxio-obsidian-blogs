---
{"dg-publish":true,"permalink":"/1.inbox/draft/AUTOSAR 入门教程 8：ComStack（一）/","dg-note-properties":{"slug":"autosar-communication-stack-1","author":"吉人","created":"2025-04-15","source":null}}
---

> 掌握 ComStack 的分层架构、PDU 的封装解包机制和信号处理三要素，理解数据从应用到总线的完整流转路径。

ECU 之间的通信是汽车电子系统的命脉。车速信号从轮速传感器 ECU 发出，经过网关转发，最终到达仪表盘 ECU 显示。这条路径上涉及信号打包、协议转换、总线传输、信号解包等多个环节。[[3.wiki/AUTOSAR\|AUTOSAR]] 的通信栈（ComStack）就是管理这些环节的完整框架。

![autosar-com-stack-architecture.png\|AUTOSAR 通用通信栈架构，展示了从应用到总线的完整模块层级\|650](/img/user/0.asset/media/autosar-com-stack-architecture.png)

## PDU 与信号处理

### PDU：通信栈的基本货币

PDU（Protocol Data Unit，协议数据单元）是通信栈中数据传输的基本载体。每个 PDU 由两部分组成：SDU（Service Data Unit）是上层待传输的实际数据，PCI（Protocol Control Information）是源地址、目的地址等控制元数据。

数据在通信栈中逐层传递时，每一层都把上层的整个 PDU 当作自己的 SDU，添加本层的 PCI 后封装成新的 PDU 传递给下一层。接收方则逐层解包，每层剥离本层的 PCI，把剩余的 SDU 向上传递。这种逐层封装解包机制是[[3.wiki/分层架构\|分层架构]]在通信栈中的典型体现。

![pdu-encapsulation-decapsulation.png\|PDU 的封装与解封过程\|450](/img/user/0.asset/media/pdu-encapsulation-decapsulation.png)

### 信号处理三要素

信号（Signal）是最小的消息单元，比如一个车速值或一个开关状态。信号组（Signal Group）是需要同步传输的信号集合——比如发动机转速和负荷率必须来自同一时刻的采样，不能拆开分别传输。组信号（Group Signal）是信号组中的单个成员。

COM 模块在发送时把信号打包成 PDU，在接收时把 PDU 解包成信号。RTE 调用 COM 的信号级接口读写数据，COM 再通过 PDU Router 把组装好的 PDU 路由到目标总线。

## 核心模块

### ComM：通信请求的统一入口

ComM（Communication Manager）是应用层与通信栈之间的适配器。应用层通过 RTE 告诉 ComM"我需要通信"或"我要静默"，ComM 将请求翻译成总线特定的模式切换指令，下发给 CanSM、LinSM 等总线状态管理模块。

ComM 管理三种通信模式：全通信（Full Communication，正常收发）、静默通信（Silent Communication，只收不发）、无通信（No Communication，关闭通信）。这些模式与教程 11 中 CanSM 管理的 CAN 控制器状态一一对应。ComM 的价值在于让应用层不需要关心底层是 CAN 还是 LIN，统一通过 ComM 控制通信行为。

### COM 模块

COM 是 RTE 与 PDU Router 之间的桥梁。它的核心职责是接口转换：向上为 RTE 提供信号级的读写接口，向下以 PDU 为单位与 PDU Router 交互。发送时 COM 把信号打包成 PDU，接收时把 PDU 解包成信号。除了基本的封装解包，COM 还提供信号过滤（只转发满足条件的信号）、字节序转换（大端小端适配）、符号扩展（处理不同位宽的信号）和跨总线网关转发等高级功能。

### PDU Router

PDU Router 是通信栈的路由中枢。它的核心职责是根据配置的路由表，把 PDU 转发到目标总线对应的接口模块（如 CanIf、LinIf）。上层模块不需要知道 PDU 最终走哪条总线，PDU Router 自动匹配。

PDU Router 的路由是协议无关的——它只看 PDU ID，不管 PDU 里装的是什么内容。这种设计使得上层模块的代码与具体总线类型完全解耦。当系统从 CAN 迁移到 CAN FD 时，上层模块的代码不需要任何修改。

通信栈中的缩写在阅读 AUTOSAR 规范时频繁出现：TP 是传输协议（Transport Protocol），NM 是网络管理器（Network Manager），Trcv 是收发器（Transceiver），Ext. 是外部（External），Asic 是专用集成电路（Application Specific Integrated Circuit）。

## 实践建议

- PDU ID 的分配要有规律，建议按总线类型和方向分段编号，方便在路由表中快速定位
- 信号过滤功能可以显著减少不必要的总线负载，只在确实需要时才转发信号
- 跨总线网关场景下，COM 的网关转发比 PDU Router 的 PDU 网关更灵活，优先使用 COM 级网关
- 调试通信问题时从 PDU Router 的路由表入手，确认 PDU 是否被正确路由到目标接口模块

教程 9、10、11 将分别深入 CAN 通信栈、CAN 传输协议（CanTp）和 CAN 状态管理（CanSM），逐层拆解 ComStack 中最常用的总线实现。