---
{"dg-publish":true,"dg-path":"Classic AUTOSAR CAN 通信栈源码解析.md","permalink":"/Classic AUTOSAR CAN 通信栈源码解析/","dg-note-properties":{"author":"吉人","created":"2026-05-18","source":null}}
---

> 从 CAN Driver 到 COM、从 PDU 封包到多帧分段、从诊断服务到网络管理状态机，逐层拆解 Classic AUTOSAR CAN 通信栈的设计原理。

Classic AUTOSAR 的 CAN 通信栈是一个严格的分层架构，从硬件驱动到应用接口一共五层，每一层只关心自己的职责，通过标准化的接口和上下层交互。这种设计让硬件更换不影响上层逻辑，让应用开发者不需要关心底层协议细节。

![autosar-can-stack-architecture.png\|650](/img/user/0.asset/media/autosar-can-stack-architecture.png)

## 五层协议栈的数据流

AUTOSAR CAN 通信栈分为五层，每一层只关心自己的职责，通过标准接口和上下层交互。理解数据如何在这些层之间流转，是读懂整个协议栈的钥匙。

### CAN Driver：离硬件最近的一层

CAN Driver 直接操作 CAN 控制器硬件，管理消息对象（Hardware Object）的收发。它向上层暴露的只有 `Can_Write()` 和中断回调，向下直接读写寄存器。

核心数据结构是 `Can_PduType`，它把一条 CAN 报文抽象为四个字段：

```c
typedef struct
{
    PduIdType   swPduHandle;  /* 逻辑句柄 */
    uint8       length;       /* DLC */
    Can_IdType  id;           /* CAN ID */
    uint8*      sdu;          /* 数据指针 */
} Can_PduType;
```

接收方向上，CAN 硬件产生 Rx 中断，中断服务程序从消息缓冲区中提取 ID、DLC 和数据，构造 `Can_PduType` 后调用 `CanIf_RxIndication()` 上报。发送方向上，上层调用 `Can_Write()`，驱动将 PDU 写入硬件发送缓冲区，等待硬件完成发送后通过中断确认。

这一层还管理硬件过滤器的配置。通过 `CanFilterMaskRef` 字段，可以在硬件层面过滤不需要的 CAN ID，只有匹配的消息才会触发接收中断，减少 CPU 负担。

### CAN Interface：硬件抽象与 PDU 映射

CanIf 是 Driver 和上层之间的桥梁，它的核心工作是把硬件相关的 PDU 映射为逻辑 PDU，让上层不需要知道物理细节。

发送路径中，CanIf 收到上层的 `CanIf_Transmit()` 调用后，根据配置表将逻辑 PDU ID 映射到硬件发送句柄（HTH），解析 CAN ID 类型（标准帧或扩展帧），然后调用 `Can_Write()` 完成实际发送。

接收路径中，`CanIf_RxIndication()` 对收到的消息做软件过滤和 DLC 校验，然后根据 CAN ID 查配置表找到对应的上层回调函数，把数据往上抛。这个回调机制是整个协议栈实现层间解耦的关键——上层模块在初始化时注册回调，CanIf 不需要知道上层是谁。

### PDU Router：三路分发器

PDUR 是协议栈中的交通警察。CAN 网络上同时跑着三种报文：应用报文、网络管理报文和诊断报文。PDUR 根据配置好的路由表，把收到的 PDU 分发到不同目的地。

从源码中可以看到，PDUR 的实现非常直接——它本质上是一组转发函数：

```c
BufReq_ReturnType PduR_CanTpStartOfReception(PduIdType id,
    PduLengthType TpSduLength, PduLengthType* bufferSizePtr)
{
    return Dcm_StartOfReception(id, TpSduLength, bufferSizePtr);
}

Std_ReturnType PduR_DcmTransmit(PduIdType DcmTxPduId,
    PduInfoType* PduInfoPtr)
{
    return CanTp_Transmit(DcmTxPduId, PduInfoPtr);
}
```

PDUR 只做转发，**不修改 PDU 内容**。诊断报文走 CanTp → PDUR → Dcm 通道，应用报文走 CanIf → Com 通道，NM 报文走 CanIf → CanNm 通道。这种设计让协议栈的扩展变得简单——新增一种报文类型只需要在 PDUR 的路由表里加一条映射。

### CAN Transport Protocol：多帧的分与合

CAN 单帧最多传 8 字节数据，但诊断报文经常超过这个长度。CanTp 负责把长消息拆成多帧发送，在接收端重新拼起来。

CanTp 定义了四种帧类型：

- **单帧（SF）**：数据 ≤ 7 字节，一帧搞定，PCI 只占第一个字节的高 4 位（`0x0n`）
- **首帧（FF）**：多帧的开始，前两个字节是 PCI（`0x1n` + 长度低字节），后 6 字节是数据
- **连续帧（CF）**：后续数据帧，PCI 为 `0x2n`，n 是序号（0x01–0x0F 循环），每帧带 7 字节数据
- **流控帧（FC）**：接收方用来控制发送节奏，包含三种状态：继续发送（CTS）、等待、溢出

以诊断请求 `04 2F 67 00 03 01 FF FF` 为例，第一个字节 `04` 是网络层的 PCI，表示单帧、长度 4。从第二个字节开始是应用层内容：`2F` 是 SID（Input/Output Control），`67 00` 是 DID，`03 01` 是子功能。

接收状态机由 `CanTp_RxStateType` 管理，`ChannelState` 追踪当前处于 Idle / WaitFF / WaitCF 等阶段，`ExpectedSN` 校验连续帧序号的连续性，`BlockSize` 和 `STMin` 实现流控参数协商。

### COM：信号级的收发管理

Com 层是通信栈中离应用最近的一层。它不直接操作 PDU，而是把 PDU 中的数据进一步拆解为**信号**（Signal），提供信号级的读写接口。

信号的定义非常精巧。以一个接收消息为例：

```c
typedef struct MsgBCM_BCAN_1_msgTypeTag
{
    uint8 BCM_KeySt         : 2;
    uint8 unused0           : 6;
    uint8 BCM_ParkingLampSt : 1;
    uint8 unused3           : 1;
    uint8 BCM_ReverseSwitchSt : 1;
    uint8 unused4           : 5;
    /* ... */
} MsgBCM_BCAN_1_msgType;

typedef union MsgBCM_BCAN_1_bufTag
{
    MsgBCM_BCAN_1_msgType MsgBCM_BCAN_1;
    uint8 _c[8];
} MsgBCM_BCAN_1_buf;
```

位域结构体精确描述了每个信号在 8 字节 CAN 数据中的位位置。`union` 让同一块内存既可以按信号名访问，也可以按字节数组访问。应用层拿到数据后，通过宏直接读取信号值：

```c
#define COM_ReceiveSigBCM_KeySt  (RxMsgBCM_BCAN_1.MsgBCM_BCAN_1.BCM_KeySt)
```

发送方向上，应用设置信号值后，Com 层根据消息的传输属性（周期发送、事件触发、混合模式）决定何时将整个消息组装好并通过 `CanIf_Transmit()` 发出。

接收方向上，Com 层负责超时监控。如果某条周期消息在规定时间内没收到，Com 会调用超时回调通知应用，应用据此判断发送节点是否离线。

## PDU 与 SDU：封包的本质

理解协议栈中数据封装的关键是 PDU 和 SDU 的关系。对于第 n 层而言，上层（n+1）传下来的数据就是 SDU（Service Data Unit），第 n 层给它加上自己的控制信息（PCI），封装成 PDU（Protocol Data Unit），然后传给下一层。

拿 DCM 层的诊断数据举例：DCM 接收到的完整 Service Message 称为 I-PDU，保存到 Buffer 后交给 PDUR 层转发。数据到达 CanTp 层后称为 N-SDU，加上 PCI 变成 N-PDU。超过 7 字节时拆成多个 N-SDU，每个加 PCI 变成独立的 N-PDU。

**数据从应用层往下每经过一层，就多一层控制信息封装；从底层往上每经过一层，就剥掉一层控制信息。** 这就是 AUTOSAR 通信栈最核心的设计模式。

## 诊断栈：DCM 与 Dem

诊断功能是 AUTOSAR 协议栈中最复杂的部分之一。DCM（Diagnostic Communication Manager）负责处理 UDS 诊断请求，Dem（Diagnostic Event Manager）负责管理故障码（DTC）。

DCM 层维护两套诊断缓冲区，分别处理物理寻址和功能寻址的请求：

```c
uint8 gUDS_Physical_DiagBuffer[UDS_PHYS_BUFFER_SIZE];
uint8 gUDS_Functional_DiagBuffer[UDS_FUNC_BUFFER_SIZE];
```

当诊断请求到达 DCM 时，DCM 将每个字节解析出来，根据 SID 分发到对应的服务处理函数。以 0x2F 服务（IO 控制）为例，DCM 根据 DID 查表找到对应的控制回调，可能是请求节目源切换，也可能是调节媒体音量——具体动作由应用层实现。

当 ECU 检测到故障时，Dem 将故障信息以数字代码的形式记录下来。这些 DTC 存储在非易失性存储器中，诊断仪通过 0x19 服务读取。

## 网络管理：让节点知道彼此的存在

CAN 网络上的节点需要一种机制来协调睡眠和唤醒，这就是网络管理。协议栈实现了两种网络管理方案。

**直接网络管理（OsekNm）** 基于 OSEK/VDX NM 协议。每个节点有一条专属的网络管理报文，节点自动组成逻辑环，NM 报文按环的顺序依次发出。如果一个节点在规定时间内没收到上一个节点的报文，就认为对方离线。逻辑环的确定性让故障定位变得简单——没收到谁的报文，就是谁出了问题。

**AUTOSAR CAN NM（CanNm）** 是更现代的实现，基于状态机管理网络生命周期。定义了多种状态：Normal Operation（正常通信）、Repeat Message（节点检测）、Bus Sleep（低功耗休眠）、Limp Home（降级运行）。

`CanNm_TimerType` 管理一组定时器——消息周期、网络超时、重复消息、等待总线休眠——在 `CanNm_MainFunction()` 中周期检查。

间接网络管理则没有专用的 NM 报文，而是通过各节点发出的周期性应用报文来检测在线状态。如果某个节点的周期消息超时未到，就认为该节点已离线。COM 层的接收超时监控就是间接网络管理的一种实现。

## BusOff：最严重的总线故障

BusOff 是 CAN 通信中最严重的故障状态——控制器因为累计发送错误过多，被硬件自动从总线上断开。

BusOff 的处理流程分为检测和恢复两步。当硬件检测到 BusOff 状态时，触发中断，中断服务程序先将控制器切换到 STOP 状态，然后通过 `CanIf_ControllerBusOff()` 向上层通知：

```c
static void CAN_Controller_Busoff_handler(uint8 Controller)
{
    Can_SetControllerMode(Controller, CAN_T_STOP);
    CanIf_ControllerBusOff(Controller);
}
```

CanIf 收到通知后，向上传播到 CanNm 的 `CanNm_BusOff()` 回调。网络管理模块将 BusOff 计数器加 1，并设置故障标志位。当 BusOff 次数累计超过阈值，就会标记总线错误并设置 DTC 检测完成标志。

恢复过程：重新初始化 CAN 控制器，然后切换回 STARTED 模式。恢复策略通常采用递增延时——第一次恢复等待较短时间，后续每次失败等待时间加倍，避免在总线持续故障时频繁重连。

---

理解了这套分层架构，再去看任何 Classic AUTOSAR 的通信问题，都有了定位的锚点：数据在哪个方向（Tx 还是 Rx），经过了哪些层，每一层做了什么。这是读协议栈最有用的思维框架。
