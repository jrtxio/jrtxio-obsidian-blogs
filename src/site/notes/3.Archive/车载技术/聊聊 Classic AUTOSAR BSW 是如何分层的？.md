---
{"dg-publish":true,"dg-path":"automotive/聊聊 Classic AUTOSAR BSW 是如何分层的？.md","permalink":"/automotive/聊聊 Classic AUTOSAR BSW 是如何分层的？/","created":"2022-08-06T15:40:00.000+08:00","updated":"2025-04-02T15:04:58.280+08:00"}
---

#Ofilm #AutoSAR

基础软件层（Basic Software Layer，BSW）又可分为四层，即服务层（Services Layer）、ECU 抽象层（ECU Abstraction Layer）、微控制器抽象层（Microcontroller Abstraction Layer，MCAL）和复杂驱动（Complex Drivers）。

![Pasted image 20230309154715.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230309154715.png)

上述各层又由一系列基础软件组件构成，包括系统服务（System Services）、存储器服务（Memory Services）、通信服务（Communication Services）等。它们主要用于提供基础软件服务，包括标准化的系统功能和功能接口。

![Pasted image 20230309154735.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230309154735.png)
## 服务层

服务层（Services Layer）提供了汽车嵌入式系统软件常用的一些服务，其可分为系统服务（System Services）、存储服务（Memory Services）以及通信服务（Communication Services）三大部分。提供包括网络通信管理、存储管理、ECU 模式管理和实时操作系统（Real Operating System，RTOS）等服务。除了操作系统外，服务层的软件模块都是与 ECU 平台无关的。

## ECU 抽象层

ECU抽象层（ECU Abstraction Layer）包括板载设备抽象（Onboard Devices Abstraction）、存储器硬件抽象（Memory Hardware Abstraction）、通信硬件抽象（Communication Hardware Abstraction）和I/O硬件抽象（Input/Output Hardware Abstraction）。该层将ECU结构进行了抽象，负责提供统一的访问接口，实现对通信、存储器或者I/O的访问，从而不需要考虑这些资源是由微控制器片内提供的，还是由微控制器片外设备提供的。该层与ECU平台相关，但与微控制器无关，这种无关性正是由微控制器抽象层来实现的。

## 微控制器抽象层

微控制器抽象层（Microcontroller Abstraction Layer，MCAL）是实现不同硬件接口统一化的特殊层。通过微控制器抽象层可将硬件封装起来，避免上层软件直接对微控制器的寄存器记性操作。微控制器抽象层包括微控制器驱动（Microcontroller Drivers）、存储器驱动（Memory Drivers）、通信驱动（Communication Drivers）以及I/O驱动（I/O Drivers）。

![Pasted image 20230309154849.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230309154849.png)

## 复杂驱动层

由于对复杂传感器和执行器进行操作的模块涉及严格的时序问题，难以抽象。所以在 AUTOSAR 规范中这部分没有被标准化，统称为复杂驱动（Complex Drivers）。