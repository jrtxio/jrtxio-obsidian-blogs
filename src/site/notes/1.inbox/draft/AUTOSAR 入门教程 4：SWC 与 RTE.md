---
{"dg-publish":true,"permalink":"/1.inbox/draft/AUTOSAR 入门教程 4：SWC 与 RTE/","dg-note-properties":{"slug":"autosar-swc-rte","author":"吉人","created":"2025-04-12","source":null}}
---

> 理解 SWC 的 Port 模型、S/R 和 C/S 两种通信接口、Runnable Entity 的触发机制，以及 RTE 如何将应用层与 BSW 连接为整体。

传统 ECU 软件开发中，应用层直接调用底层驱动函数——ADC 采集、算法处理、DO 输出，全在 `main()` 的循环里完成。这种写法直观，但换一颗芯片就得重写驱动调用代码。[[3.wiki/AUTOSAR\|AUTOSAR]] 的应用层设计模型用 SWC（Software Component）和 RTE（Runtime Environment）彻底改变了这个模式：应用逻辑封装在 SWC 中，通过标准化端口通信，不再直接触碰任何硬件接口。

## SWC：功能封装单元

SWC 是应用层的基本构建单元，封装了具体的汽车电子功能。一个 SWC 可以是发动机控制算法、座椅调节逻辑、或者仪表盘显示处理。SWC 的核心特征是**自治**——它通过端口与外部通信，但不依赖具体的 ECU 硬件或底层软件实现。

### Port 模型

SWC 通过 Port 与外部世界交互。Port 分为三种：PPort（Provide Port，供型端口）对外提供数据或服务；RPort（Require Port，需型端口）从外部获取数据或请求服务；PRPort（Provide and Require Port，供需端口）兼有两者。

可以把 Port 类比为 C 语言中的变量，而 Port 的"变量类型"就是 Port Interface。AUTOSAR 定义了两种核心接口类型。

**Sender-Receiver（S/R）接口**用于数据传递。一组引用 S/R 接口的端口构成一个数据通道：供型端口是发送者，需型端口是接收者。数据流是单向的，相当于 C 语言中的 `b = a`——发送者把数据推给接收者，不需要接收者做出响应。车速信号从轮速传感器 SWC 发送到仪表盘 SWC，就是典型的 S/R 模式。

**Client-Server（C/S）接口**用于函数调用。需型端口是客户端，发起调用；供型端口是服务器，执行操作并返回结果。相当于 C 语言中的 `b = func(a)`。诊断仪请求读取故障码时，DCM 的诊断服务接口就是 C/S 模式——SWC 发起请求，DCM 执行查询并返回结果。

### Runnable Entity

SWC 内部由 Runnable Entity 组成。Runnable 是 SWC 中最小的可执行单元，本质上是一个 C 函数。但 Runnable 不由开发者手动调用，而是由 RTE 事件触发。

触发 Runnable 的事件类型包括：定时事件（周期性触发，如每 10ms 执行一次控制算法）、数据接收事件（S/R 端口收到新数据时触发）、模式切换事件（BswM 切换模式时通知 SWC）、初始化事件（SWC 启动时触发一次）。

Runnable 到 OS Task 的映射由 RTE 配置决定。一个 Task 可以包含来自不同 SWC 的多个 Runnable，RTE 根据事件配置在正确的时机调用对应的 Runnable 函数。上一篇教程介绍的 Schedule Table，在应用层的体现就是精确调度这些 Runnable 的执行时序。

## RTE：应用与 BSW 的桥梁

RTE 是 SWC 与 BSW 之间的通信中枢，也是虚拟功能总线（VFB）在 ECU 级的实例化。它的核心职责有三项。

**Runnable-to-Task Mapping**：RTE 将所有 Runnable Entity 映射到 OS Task。开发者在 ARXML 中配置映射关系，RTE 生成代码负责在正确的 Task 中调用正确的 Runnable。应用开发者不需要知道自己的 Runnable 跑在哪个 Task 里，只需要声明触发条件。

**通信模式管理**：S/R 通信支持两种模式。Explicit 模式下，每次 `Rte_Read()` 或 `Rte_Write()` 都触发实际的数据传输，适合需要实时性的场景。Implicit 模式下，RTE 在 Runnable 执行前统一批量读取所有输入端口数据，执行后统一写入所有输出端口，减少通信开销。Implicit 模式是大部分周期性 Runnable 的默认选择。

C/S 通信支持同步和异步两种调用方式。同步调用阻塞等待服务器返回结果；异步调用通过 Future 机制在后续获取结果，适合耗时操作。C/S 的典型应用是 SWC 调用 BSW 的诊断或 NvM 服务。

**BSW 调度器（SchM）**：RTE 还负责调度 BSW 模块的主函数。SchM 是 BSW 模块统一的调度入口，各模块的主函数通过 SchM 注册到 OS Task 中。

### ECU 内通信与 ECU 间通信

SWC 之间的通信对开发者是透明的——RTE 自动处理路由。如果两个 SWC 在同一个 ECU 内，RTE 直接在内存中传递数据；如果在不同 ECU 上，RTE 委托给 ComStack 通过总线传输。应用代码不需要关心数据是走内存还是走 CAN，这就是 VFB 的价值。

## 实践建议

- SWC 的粒度按功能边界划分，一个 SWC 只做一件事。粒度太粗增加复用难度，太细增加配置复杂度
- S/R 接口优先用 Implicit 模式，减少 RTE 调用次数。只在需要精确控制读写时序的场景下用 Explicit 模式
- Port 命名遵循方向前缀惯例：`RP_` 表示需型端口，`PP_` 表示供型端口，接口名反映数据语义（如 `RP_VehicleSpeed`）
- SWC 描述先在 ARXML 中完成端口和接口定义，再生成代码骨架，避免手工编写 RTE 接口函数
- 传统手写代码迁移到 AUTOSAR 时，先把已有算法逻辑封装进 SWC，通过 S/R 端口暴露输入输出，不需要一步到位重写全部代码

下一篇教程将进入看门狗模块——[[3.wiki/AUTOSAR\|AUTOSAR]] 功能安全框架的第一道防线。WdgM 的三种监控机制（Alive/Deadline/Logical Supervision）都依赖 OS Task 的周期性调度，而 Task 中跑的正是本篇介绍的 Runnable Entity。