---
{"dg-publish":true,"dg-path":"automotive/AUTOSAR 入门教程之基础篇一.md","permalink":"/automotive/AUTOSAR 入门教程之基础篇一/","created":"2025-07-12T23:07:25.222+08:00","updated":"2025-07-13T14:06:52.047+08:00"}
---

#Innolight #AutoSAR 

AUTOSAR（AUTomotive Open System Architecture）是一个开源的分层软件开发标准，适用于汽车电子控制单元（ECU）等，但不仅限于此。AUTOSAR 为软件提供了分层的自上而下的结构，并定义了软件组件之间的关系。

![Pasted image 20250712230833.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250712230833.png)

AUTOSAR 的分层架构可以分为基础软件（BSW）、运行时环境（RTE）和应用/软件组件层（SWC）。

基础软件层可以进一步细分为微控制器抽象层（MCAL）、ECU 抽象层、服务层和复杂设备驱动（CDD）层。

微控制器抽象层（MCAL）是分层 AUTOSAR 架构中的最低层，它直接与硬件通信。其基本职责是使上层独立于硬件。它包含微控制器的低级驱动程序。

![Pasted image 20250712230958.png](/img/user/0.Asset/resource/Pasted%20image%2020250712230958.png)

ECU 抽象层位于 MCAL 层之上，它包含 ECU 上微控制器外部的硬件组件的接口组件和驱动程序。其基本职责是使上层独立于 ECU 上可用的硬件。其下层接口依赖于硬件，而上层接口是硬件无关的。

![Pasted image 20250712231019.png](/img/user/0.Asset/resource/Pasted%20image%2020250712231019.png)

服务层位于 ECU 抽象层之上，基本上独立于硬件，负责向应用程序提供基础的 BSW 功能。

![Pasted image 20250712232807.png](/img/user/0.Asset/resource/Pasted%20image%2020250712232807.png)

运行时环境是分隔基础软件和应用软件的层。它上面的软件架构变成了组件级别，而不是基础软件中的分层架构。RTE 是虚拟功能总线（VFB）在 ECU 层面的实例化。RTE 是特定于 ECU 的。没有 BSW 的应用软件组件通过虚拟功能总线（VFB）相互通信。

![Pasted image 20250712232828.png](/img/user/0.Asset/resource/Pasted%20image%2020250712232828.png)

复杂设备驱动（CDD）是一个层，应用程序软件组件可以通过运行时环境（RTE）直接访问硬件，而无需通过 AUTOSAR 的各个层。这个层被那些具有高时间限制的应用程序和 AUTOSAR 未描述的需求所使用。这个层是微控制器和 ECU 硬件相关的。

![Pasted image 20250712232855.png](/img/user/0.Asset/resource/Pasted%20image%2020250712232855.png)