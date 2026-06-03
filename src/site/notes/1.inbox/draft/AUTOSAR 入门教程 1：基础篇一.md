---
{"dg-publish":true,"permalink":"/1.inbox/draft/AUTOSAR 入门教程 1：基础篇一/","dg-note-properties":{"slug":"autosar-basics-1","author":"吉人","created":"2025-04-12","source":null}}
---

> 理解 [[3.wiki/AUTOSAR\|AUTOSAR]] 分层架构的四层设计和每一层的职责，建立 ECU 软件开发的认知框架。

传统 ECU 软件开发有一个绕不开的痛点：换一颗芯片，整套代码几乎要重写。Infineon 的 CAN 寄存器和 NXP 的完全不同，驱动层以上的逻辑却大同小异。AUTOSAR 的分层架构就是为了解决这个问题而生。它把软件拆成若干层，每层只关心自己的事，底层硬件的变化不会波及上层应用。

## 分层架构总览

[[3.wiki/AUTOSAR\|AUTOSAR]]（汽车开放系统架构）是汽车电子控制单元（ECU）的开放式软件架构标准。它的核心思路是"统一标准、分散实现、集中配置"——统一标准为厂商提供开放平台，分散实现要求软件高度模块化以降低耦合，集中配置将各模块的配置信息以 ARXML 格式统一管理。

AUTOSAR 将软件重用从零部件级别提升到产业链级别。车厂通过工具链设计整车功能，分解到不同 ECU，再以通用文件格式交付供应商。供应商实现的 SWC 只要在 AUTOSAR 框架内，就能在不同车厂、不同 ECU 间复用。

Classic AUTOSAR（CP）面向传统嵌入式 ECU，采用 OSEK 操作系统，支持硬实时（微秒级），安全等级可达 ASIL-D，通信以 CAN/LIN 信号为主。Adaptive AUTOSAR（AP）面向高性能平台（ADAS、智能座舱），采用 C++14 与 POSIX 系统，通信基于以太网面向服务（SOME/IP）。本系列聚焦 Classic AUTOSAR。

从上到下分为四层：应用层（SWC 软件组件）、运行时环境（RTE）、基础软件层（BSW）和微控制器硬件。BSW 内部又分为三层：MCAL（微控制器抽象层）、ECU 抽象层和服务层。每一层只依赖下一层的标准化接口，不跨层调用。

![autosar-layered-architecture-stack.png\|AUTOSAR 分层架构总览，从底层硬件到顶层应用软件的完整堆栈\|650](/img/user/0.asset/media/autosar-layered-architecture-stack.png)

## BSW 三层解析

### MCAL：寄存器的标准化门卫

MCAL（Microcontroller Abstraction Layer）是最底层，直接操作寄存器控制硬件外设。同为 CAN 驱动，Infineon AURIX 和 NXP S32K 的寄存器完全不同，但 MCAL 对上层提供统一的 API。包含 CAN、PWM、ADC、DIO 等基础驱动，每个驱动的接口由 AUTOSAR 标准定义，实现则由芯片厂商提供。MCAL 分为四组模块：通信驱动（CAN、SPI、LIN）、I/O 驱动（ADC、PWM、DIO）、存储驱动（Flash、EEPROM）和 MCU 驱动（时钟、GPT、Watchdog、PORT）。

![mcal-hardware-driver-modules.png\|MCAL 层结构示意，展示各硬件驱动模块与上层接口的关系\|650](/img/user/0.asset/media/mcal-hardware-driver-modules.png)

### ECU 抽象层：硬件无关的分水岭

ECU 抽象层把 MCAL 提供的芯片级接口进一步包装成 ECU 级接口。MCAL 提供的是"读写 Flash 地址 `0x1000`"这种芯片操作，ECU 抽象层提供的是"读取 ECU 配置参数"这种业务语义。这一层实现了[[3.wiki/分层架构\|分层架构]]中最关键的分水岭——从这一层往上，代码不再依赖具体的芯片型号。

![ecu-abstraction-mcal-interface.png\|ECU 抽象层与 MCAL 的接口关系\|450](/img/user/0.asset/media/ecu-abstraction-mcal-interface.png)

### 服务层：跨 ECU 的通用能力

服务层提供运行时系统服务，包括诊断（UDS/OBD）、网络管理、加密服务、操作系统（OS）等。它是 BSW 中功能最丰富的一层，也是配置工作量最大的一层。后续教程将逐层展开，通信栈、存储栈和看门狗栈都位于这一层。

![autosar-service-layer-modules.png\|服务层各功能模块的组织结构\|650](/img/user/0.asset/media/autosar-service-layer-modules.png)

## RTE 与 CDD

RTE（Runtime Environment）是连接应用层和 BSW 的中间层。它是虚拟功能总线（VFB）在 ECU 级的实例化，通过端口接口实现 SWC 之间的通信，同时承担 Runnable 到 OS Task 的映射调度。可以把 RTE 理解为 ECU 内部的"快递网络"——它不关心包裹里装的是什么，只负责按地址准时送达。

![rte-autosar-layer-interaction.png\|RTE 在 AUTOSAR 架构中的位置及其与上下层的交互关系\|450](/img/user/0.asset/media/rte-autosar-layer-interaction.png)

CDD（Complex Device Driver）是一个特殊的旁路通道，用于绕过标准 BSW 层直接访问硬件。典型场景包括电机控制（需要微秒级 PWM 响应）和雷达信号处理（依赖硬件加速器）。CDD 的代价是牺牲可移植性——直接操作硬件意味着换芯片时必须重写，所以只在确实有严格时序需求时才使用。

![cdd-bypass-bsw-direct-hardware.png\|CDD 在分层架构中旁路 BSW 直连硬件的路径\|450](/img/user/0.asset/media/cdd-bypass-bsw-direct-hardware.png)

## 实践建议

- 新项目从 MCAL 配置开始，用芯片厂商提供的配置工具生成基础驱动，再逐层向上构建
- RTE 接口定义应先用 ARXML 建模确认，再生成代码，避免后期反复修改组件端口
- CDD 只在高实时性场景使用，每引入一个 CDD 都要评估移植成本
- 服务层模块的版本要与 AUTOSAR 规范版本对齐，不同版本间接口可能不兼容

下一篇教程将拆解 BSW 内部的模块化组织——按功能划分的三大堆栈、模块间通信的接口规范，以及运行时配置的三种机制。