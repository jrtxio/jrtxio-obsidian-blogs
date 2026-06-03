---
{"dg-publish":true,"permalink":"/1.inbox/draft/AUTOSAR 入门教程 2：基础篇二/","dg-note-properties":{"slug":"autosar-basics-2","author":"吉人","created":"2025-04-12","source":null}}
---

> 掌握 BSW 三大堆栈的功能划分、三种接口类型的适用场景和三种配置机制的选型策略。

上一篇教程解析了 [[3.wiki/AUTOSAR\|AUTOSAR]] 的[[3.wiki/分层架构\|分层架构]]，从 MCAL 到服务层逐层拆解了 BSW 的职责。本篇聚焦 BSW 内部的模块化组织——按功能划分的三大堆栈、模块间通信的接口规范，以及运行时配置的机制。

## BSW 三大堆栈

BSW 按服务类型划分为三大核心堆栈，每个堆栈内部同样遵循[[3.wiki/分层架构\|分层架构]]的原则：驱动层在底部，抽象层在中间，服务层在顶部。

通信堆栈（ComStack）负责 ECU 间的数据交换，从底部的 CAN/LIN 驱动往上经过接口层、路由层，最终到达 COM 模块提供信号级服务。存储堆栈（MemStack）管理非易失性数据的读写，NvM 模块在最上层提供统一接口，MemIf 在中间做 Flash/EEPROM 抽象，Fls/Eep 驱动在最底层操作硬件。I/O 堆栈（IO Stack）处理模拟/数字信号的输入输出，ADC/DIO/PWM 等驱动在底部，IoHwAb 抽象层在顶部，将物理通道映射为逻辑信号使 SWC 与具体硬件配置解耦。

![bsw-three-stacks-structure.png\|BSW 按功能划分的三大堆栈结构\|650](/img/user/0.asset/media/bsw-three-stacks-structure.png)

三大堆栈的模块数量差异很大：ComStack 模块最多（CAN 驱动、CanIf、PDU Router、COM、CanTp、CanNm、CanSM 等），MemStack 最精简（NvM、MemIf、Fee/Ea、Fls/Eep），IO Stack 居中。本系列重点展开 ComStack 和 MemStack，IO Stack 涉及的 ADC/DIO/PWM 等驱动属于 MCAL 配置范畴，需参考具体芯片的手册。

除了三大堆栈，服务层还有一组独立的服务模块：看门狗管理（WdgM）、诊断（DCM/DEM）、ECU 状态管理（EcuM）、模式管理（BswM）等。这些模块不隶属于某个堆栈，但与堆栈模块紧密协作——比如 EcuM 在启动时触发 `NvM_ReadAll`，BswM 根据模式控制通信栈的开关。

还有两个横切模块值得关注。**ComM（Communication Manager）** 是通信请求的统一入口。应用层通过 RTE 告诉 ComM"我需要通信"或"我要静默"，ComM 将请求翻译成总线特定的模式切换指令下发给 CanSM 或 LinSM。ComM 让应用层不需要关心底层是 CAN 还是 LIN。**DET（Development Error Tracer）** 是开发阶段的错误追踪器，各 BSW 模块检测到参数越界、状态非法等开发错误时通过 DET 记录，帮助集成测试阶段快速定位问题。

## 模块间的接口规范

AUTOSAR 定义了三种接口类型，适用于不同的通信场景。

**AUTOSAR 接口**是语言无关的抽象接口，用于 SWC 与 BSW 之间的数据交换，通过端口（Port）机制实现组件连接。**标准化接口**基于 C 语言，用于同一 ECU 内部模块间的直接调用，比如 EcuM 与 BswM 之间的调度接口。**标准化 AUTOSAR 接口**由 AUTOSAR 标准严格规定语法和语义，DCM 提供的诊断服务就是典型例子。

三种接口的核心区别在于约束范围：AUTOSAR 接口约束的是通信方式（端口和 VFB），标准化接口约束的是 API 签名（函数原型），标准化 AUTOSAR 接口两者都约束。

## 配置机制

AUTOSAR 模块的参数不是写死在代码里的，而是通过配置文件在编译的不同阶段注入。三种配置机制对应不同的灵活性需求。

**预编译（Pre-compile）** 配置通过宏定义实现条件编译，配置写死在 `*_Cfg.c/h` 文件中，编译后不可修改。优势是零运行时开销，适合实时性要求高的模块。**链接时（Link time）** 配置通过外部常量传递参数，在链接阶段完成最终配置，典型应用是内存分区布局。**构建后（Post-build）** 配置是最灵活的方式，支持两种模式：可加载式允许动态修改配置结构成员，可选式从预定义的配置集中选择。同一 ECU 适配不同车型时，构建后配置是唯一选择。

## 实践建议

- 优先使用标准化 AUTOSAR 接口保证跨平台兼容性，只有确实需要自定义时才用 AUTOSAR 接口
- 对实时性要求高的模块（如 CanIf、Fls）采用预编译配置，消除运行时查表开销
- 多车型共线生产时用构建后可选式配置，通过索引切换不同的参数集
- 定位模块配置项时直接找对应的 `*_Cfg.h` 文件，AUTOSAR 的命名规范使得配置项一目了然

下一篇教程将介绍 [[3.wiki/AUTOSAR\|AUTOSAR]] OS——所有 BSW 模块赖以运行的调度基础。在进入具体的堆栈和服务模块之前，先理解 Task、ISR、Event、Schedule Table 这些核心对象，后续教程中反复出现的"周期性 Task"和"事件触发"就有了明确的含义。