---
{"dg-publish":true,"dg-path":"车载技术/从零开始 AUTOSAR 软件架构.md","permalink":"/车载技术/从零开始 AUTOSAR 软件架构/","created":"2025-06-04T14:56:22.720+08:00","updated":"2025-06-19T10:38:24.415+08:00"}
---

#Innolight #AutoSAR 

在 AUTOSAR 架构中可以分为两个不同分支，分别是 CP 和 AP，CP 表示 Classic Platform 经典平台，AP 代表 Adaptive Platform 自适应平台。从名称上来看，AP 平台更加高大上，CP 听起来老旧。没错，从字面上，AP 更加现代，面向于高性能平台，更符合现代的车联网以及自动驾驶领域使用。而 CP 平台适用于传统的嵌入式系统，特别是对实时性要求高的场景。

由于笔者多年来一直在做实时应用，所以对 AP 平台是一窍不通；对 CP 平台算是稍微了解一些。本系列的后续工作都将围绕 CP 平台进行展开。

# 经典平台的 AUTOSAR 架构

AUTOSAR 架构是一种分层的软件架构，宏观上由三层组成：

- 应用层
- 运行环境层（Runtime Environment）
- 基础软件（Basic Software）

![Pasted image 20250604145751.png|350](/img/user/0.Asset/resource/Pasted%20image%2020250604145751.png)

在了解每层的划分含义之前，先区分两个特有名词：

- SWC（Software Component）软件组件
- BSW（Basic Software）基础软件 

所有的设计出来具有独立功能的软件都可称为软件组件，在 C 语言中，可以理解为一个个的 .c 文件都是软件组件。基础软件是所有底层和通用组件的集合。

## 运行环境层

RTE 是 AUTOSAR 中的中间层，它提供了一个接口并实现了基础软件（BSW）与应用层之间的通信。RTE 将应用层与 BSW 分离，并支持 ECU 间（不理解可以跳过）和 ECU 内部的通信。RTE 基于虚拟总线通信（VFB），该机制连接了所有这些组件（SWC、BSW），并使它们能够进行通信。

## 基础软件层

BSW 基础软件在 AUTOSAR 架构下分为三个部分：

- 服务层
- 抽象层，也称ECU抽象层
- 微控制器抽象层（具体硬件驱动）

## 应用软件

应用层位于最上层，包含了称为软件组件（Software Component, SWC）的应用软件。在这个层次上，SWC并不知道用于交换数据的具体硬件以及通信协议或接口。这意味着应用软件的开发是完全独立于硬件的，它只专注于最终输出（例如速度、时间或任何计算结果）和数据处理逻辑。

# 通信中关于 PDU 的内容

## PCI、PDU 和 SDU

在实际动手之前，先了解几个名词缩写，这对于开发通信部分组件很有必要，在 AUTOSAR 思想中，通信数据在不同层次组件之前遵循 PDU 和 SDU 的转换：

- PDU：Protocol Data Unit，协议数据单元，为一种特定协议格式的数据
- SDU：Service Data Unit，服务数据单元，为协议中携带的数据信息
- PCI（Protocol Control Information）控制协议信息，一般用于多帧消息的传输控制，当然也可以自定义 PCI 来实现自定义的功能。
- MetaData：元数据，广义上讲，元数据指描述数据的数据，可以是通俗的明文描述，例如字符，也可以是普通数据。

由顶层到底层，由上而下，当前层级的 PDU 为下一层级的 SDU，当前层级的 SDU 为上一层级的PDU；如何理解？

- 在应用架构中，越靠近面向用户或者业务逻辑的层级一般为上层；对应的，下层更靠近机器或者设备硬件。
- 当前的 PDU 属于下层 SDU 的一部分，同时携带了上层需要的 SDU。

![Pasted image 20250604150207.png|550](/img/user/0.Asset/resource/Pasted%20image%2020250604150207.png)

在图中，PCI 是协议控制信息，当然，有时候上下层是直接透传的，这时可以不需要 PCI，PCI 是上层不太关心的数据。

为什么要做 PDU 和 SDU 区分？如果一句话概括，就是解包和封包，我给别人发快递，包装发货；别人取东西，手撕快递。数据也是一样的逻辑。

例如从硬件端发出的数据都是原始的数据，我们称为 Raw Data，将 Raw Data 传递给上游时，上游是要区分是从哪个硬件端接收到的数据。我们可以给不同的硬件标记唯一 ID，然后在数据中携带 ID 信息传递给上游，这里被一起打包的数据就形成了 SDU。当然除了唯一 ID 外，甚至可以一起打包设备名称、制造日期等信息一起向上传递。ID 和设备信息等可以看成 PCI 数据或者 Meta Data。

上游拿到的打包数据之后，对于上游应用来说，它其实最重要的就是硬件 ID 和数据，它通过特定的格式协议解包拿到 PCI 和 SDU，设备的唯一 ID 在 PCI 或者 MetaData 中。

## I-PDU、L-PDU 和 N-PDU

关于这三者的解释，直接看图：

![Pasted image 20250604150410.png|450](/img/user/0.Asset/resource/Pasted%20image%2020250604150410.png)

L-PDU 是为数据链层级的 PDU；N-PDU 为网络层级的 PDU；I-PDU 为数据交互层 PDU；上图的下三层是一个经典的三层网络模型结构（学过机组或者 TCP 的会感觉好熟悉）；

- 物理层在 CAN 通信可以指 CAN 控制器，收发器，实际的 CAN 线
- 数据链路层，物理寻址，在这层，PCI 控制协议往往决定了实际的物理线路，所以 L-PDU 下发时，物理层驱动会找到对应物理线传输数据。在 CAN 通信中，与物理相关的可能是 CAN 的收发器 ID、发送通道、CANID 等
- 网络层，在上面这个模型中，网络层包含了传输层 TP，严格一点传输层是可以单独分层的；传输层的功能是拆包和打包。例如一大串数据传输时，往往是分批传输，网络层会按照特定协议等所有数据完整后再向上传递；相反的，上层的数据如果过大，网络层也会拆包分批向下传递。网络层的另一个作用是控制路由，例如，长消息需要先给传输层进行打包再传递，所以长消息是路由给TP的，短消息不需要打包，短消息可以直接跳过 TP 向上传递。

如果将上面的网络模型嵌套到 AUTOSAR 软件架构中，就会变成以下：

![Pasted image 20250604150541.png|450](/img/user/0.Asset/resource/Pasted%20image%2020250604150541.png)

# 从零开始切入点的选择

为了降低 AUTOSAR 理解难度，我们从整个架构中拆解出与 CAN 相关的 BSW，并维持其层次结构，开发设计与 CAN 相关的 SWC；

![Pasted image 20250604150643.png|550](/img/user/0.Asset/resource/Pasted%20image%2020250604150643.png)

进一步降低准入门槛，NM（Network Manager）网络管理与 SM（State Manager）部分也暂时剔除；在开始之前，先要理解 CAN Driver、CAN Interface、PDU Router、以及 CAN TP、和 AUTOSAR COM 组件之间的关系。

![Pasted image 20250604150720.png|450](/img/user/0.Asset/resource/Pasted%20image%2020250604150720.png)

CanIf 作为 CAN 的 ECU 抽象，它是 CAN 驱动与 PDU 路由之间的桥梁，PDU 路由（PduR）的作用是传递分发上下层的 I-PDU，如果考虑总线 ECU 总线数量一，类型单一，在前期可以剔除 PduR 组件。

在系列合集的前面章节，我们优先实现 CanIf 与 Com 组件，并跳过 PduR，直接实现 CanIf 与 Com的直接交互，然后基于 PC 平台仿真和实际的 MCU 硬件实现 Can Driver 并跑通 CAN 通信。

![Pasted image 20250604150827.png|450](/img/user/0.Asset/resource/Pasted%20image%2020250604150827.png)

# 总结

写本合集的目的，主要是想将自己对嵌入式和 AUTOSAR 的软件架构的理解整理，同时也想启发更多的嵌入式同行向架构师迈进。另外，笔者本身也是 AUTOSAR 废柴一个，并没有通读规范，有写的不到位的欢迎指导，并一起交流学习。学习交流请私信我。最后附一张组件全景图。

![Pasted image 20250604150928.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250604150928.png)