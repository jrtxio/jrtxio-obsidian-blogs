---
{"dg-publish":true,"dg-path":"01 车载技术/AUTOSAR 入门教程之 MemStack（一）.md","permalink":"/01 车载技术/AUTOSAR 入门教程之 MemStack（一）/"}
---

#Innolight

在 AUTOSAR 分层架构中，Memory Stack 是由一组模块组成的内存管理体系，为上层应用和基础软件提供基础的内存操作服务。主要模块包括非易失性内存管理器（NvM，服务层）、内存接口（MemIf，ECU 抽象层）、Flash EEPROM 仿真（Fee，ECU 抽象层）、EEPROM 抽象（Ea，ECU 抽象层）、Flash 驱动（Fls，MCAL 层）以及 EEPROM 驱动（Eep，MCAL 层）。

![Pasted image 20250909184349.png|350](/img/user/0.Asset/resource/Pasted%20image%2020250909184349.png)

## NvM 模块服务

NvM 模块为应用或基础软件提供基本的同步和异步读/写/比对服务：

* **同步服务**：阻塞式调用，程序会轮询服务完成状态，只有在服务完成后才返回。
* **异步服务**：非阻塞式调用，服务请求被放入队列，完成后通过回调函数通知上层，回调函数在块配置阶段设置。

## NvM Blocks 类型与组成

NvM blocks 可以根据必需或可选的内存对象（NV block、RAM block、ROM block 和 Administrative block）进行配置。根据不同的存储需求，NvM blocks 主要分为三类：Native Blocks、Redundant Blocks 和 Dataset Blocks。

* **NV block** 是基本对象，包含 block header、必需的数据占位符以及可选的 CRC 字段。
* **RAM block**（可选）用于非易失性内存数据的读写副本。
* **ROM block**（可选）用于在故障情况下恢复 NV block 的默认值。
* **Administrative block** 至少包含 NV block 的状态和数据长度，可包含其他字段。其中状态字段用于指示 NV block 中的数据是否有效，长度字段表示 NV block 中数据的实际长度。

为了更直观地展示不同类型 NvM blocks 的组成，可使用如下表格：

| Block 类型         | NV block（必需） | RAM block（必需） | ROM block（可选） | Administrative block（必需） |
| ---------------- | ------------ | ------------- | ------------- | ------------------------ |
| Native Blocks    | 1            | 1             | 1（可选）         | 1                        |
| Redundant Blocks | 2            | 1             | 1（可选）         | 1                        |
| Dataset Blocks   | 1–255        | 1             | 1–n（可选，配置可变）  | 1                        |

## 应用发起请求的基本流程

NvM 支持单块和多块操作，具体流程如下：

### 单块请求

单块请求针对单个 NvM block 的读或写操作，是系统运行中最常用的服务，典型函数包括 `NvM_ReadBlock` 和 `NvM_WriteBlock`。

当应用软件组件或基础软件模块发起单块请求时，流程如下：

1. NvM 接收请求，并将数据引用和块 ID（写操作）或块引用和块 ID（读操作）转发给 MemIf。
2. MemIf 根据设备标识，将请求转发到 Fee 或 Ea。
3. Fee 再将请求转发给 Fls 驱动，而 Ea 则转发给 Eep 驱动以完成操作。

### 多块请求

多块请求一次性对多个 NvM blocks 进行读写操作，用于系统启动或关闭时的数据恢复和保存。典型函数包括 `NvM_ReadAll` 和 `NvM_WriteAll`。

多块调用流程如下：

1. 由 ECU 状态管理器（EcuM）在系统启动或关闭时发起。
2. 所有配置为多块操作的 NvM blocks 被依次读写。
3. MemIf、Fee、Ea、Fls 和 Eep 等模块根据块所在的存储类型被依次触发，以完成数据传输。

多块请求主要用于系统启动时将 NvM 中的上次写入数据恢复到 RAM，或在系统关闭时将 RAM 数据保存回 NvM。