---
{"dg-publish":true,"dg-path":"01 车载技术/深入解读 DoIP 协议.md","permalink":"/01 车载技术/深入解读 DoIP 协议/"}
---

#Technomous #DoIP

## 协议简介

协议功能：

* 诊断和 ECU 的升级
* 车辆接入协议

协议优势：

* 高速的车辆访问
* 基于成熟的以太网和 TCP/IP 协议栈
* 通过路由功能实现 ECU 的并行刷新

## 网络架构

![Pasted image 20230418151154.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230418151154.png)

车辆网络分为车内网（Vehicle network）和车外网（External network），车内网和车外网之间，有两组重要的线束，其中一组是用于数据传输的以太网线，另一组是用于诊断功能激活的激活线。以太网线就是常见的四线制 TX 标准网线。而激活线的设计，是用于车内诊断功能激活。出于能耗和电磁干扰的考虑，要求非诊断通信期间，与诊断相关的功能处于关闭状态，这样一方面可以降低能耗，另一方面减少对网络带宽的消耗，从而降低电磁干扰。

- Client 通常为 OBD 诊断仪或者是其它诊断客户端。对于外部测试设备来说，它们必须只能和 DoIP Edge Node gateway 直接连接并通信，与车载网络中其他 ECU 的通信必须由 DoIP Edge Node gatway 路由。
- DoIP Edge Node gateway 首先是一个 gateway，作为一个网关它的子网挂载着若干 ECU，与 DoIP gateway 一样。能够实现以太网到其他网络总线（如 CAN、LIN）的报文路由，这样便实现了 DoIP 诊断和传统网路总线的兼容。多种网络总线汇聚到 DoIP 网关，这大大降低了布线的复杂性，并且提高了总线网络中 ECU 的诊断效率。该角色可以同时支持 Server 端和 Client 端，作为 Server 端时，测试设备可以诊断网关下的某个 ECU 节点。那么 Client 端是怎么回事呢？想象一下，如果 DoIP edge node gateway 作为入口，那么怎样和内部其它子网的 DoIP ECU 进行交互呢？当然是由 DoIP edge node gateway 进行转发。这只是其中一个应用场景，当进行转发的时候会进行身份切换，即由 Server 端切换到 Client 端。另外一个场景是 OTA 升级，DoIP edge node gateway 的应用层可以跑一个 OTA 客户端程序，进行对内网 ECU 的诊断刷写，此时就是一个 Client 身份。
- DoIP gateway 与 DoIP edge node gateway 区别不是很大。实际的应用场景通常会让 MCU 充当这个角色，而 MPU 充当 DoIP edge node gateway 的角色，也有反过来的情况，那么该角色通常单单的跑 Server 端程序。
- DoIP node 同时支持以太网和 DoIP 协议的 ECU 认为是 DoIP node。该角色通常单单的跑 Server 端程序。
- Network node 不具备 DoIP 诊断功能，与 DoIP 节点共享网络资源。

## 交互流程

![Pasted image 20230425133735.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230425133735.png)

交互流程涉及到 Actor、Client DoIP entity、Server DoIP entity 和 Vehicle non DoIP ECU 四个角色，它们之间的交互涉及到以下流程：

- 车辆发现：用于检测车辆是否在线，具体来说就是诊断仪首先发送一个广播的车辆发现报文，网络中所有接收到这条报文的 ECU 都将发送自己的身份信息。通过各个 ECU 发回的身份信息，诊断仪可以准确地获知有哪些 ECU 在线，并且可以根据这些信息对 ECU 进行归类，比如各自属于哪一台汽车。
- 路由激活：DoIP 协议中的"路由"指的是诊断仪和被诊断节点之间的报文传输。外部测试仪与 DoIP 节点之间的通信连接建立后，应发送路由激活请求，路由激活请求被 DoIP 节点验证合法后，诊断仪才能对 ECU 进行诊断。路由激活包含了 DoIP 节点对外部诊断仪的安全认证过程，ECU 开发人员可以自定义安全认证的算法，用于屏蔽非法诊断仪对 ECU 进行的诊断。
- 诊断仪在线监测：与传统 CAN 总线不同，DoIP 诊断需要预先与 ECU 建立通信连接，也就是 TCP socket。由于 socket 的建立会消耗内存资源，因此不能无限制创建连接。ECU 在设计阶段，会定义最多能支持并行连接的诊断仪数量，并行连接的诊断仪数量达到上限之后，将无法建立新的诊断通信连接。因此这些诊断连接通道属于稀缺的资源，为了避免通道被无效占用，因此设计了诊断仪在线监测机制。DoIP 节点会向现在有的诊断连接通道上，发送诊断仪在线监测请求，若有的连接上无法收到诊断仪回复的响应报文，则会将此连接复位，以待新的诊断仪接入。
- 节点信息：节点信息包含了节点属性，例如最大支持的并行诊断仪连接数量，最大可接受的诊断仪报文长度，以及当前节点的电源状态，即是否所有部件都完成上电。节点信息作为诊断通信前的诊断条件检查，以确保后续诊断通信不受外部因素干扰。
- 诊断通信：作为 DoIP 的核心功能，此功能负责诊断报文的传输。诊断报文中包含三个信息，即诊断报文发送方的逻辑地址（SA），诊断报文接收方的逻辑地址（DA），以及诊断数据。在 CAN 总线网络中，通过 CANID 来寻址要诊断的 ECU，而在 DoIP 网络中，DA 的作用相当于 CANID，用于寻址要诊断的目的 ECU。
- 通信协议：DoIP 协议属于应用层协议，基于 UDP/TCP 的传输层协议进行实现。

### 协议要求

* 每个 DoIP 实体应支持 n + 1 个 TCP socket，其中 n 是相应 DoIP 实体支持的并发 TCP 数据连接数
* 每个 DoIP 实体应支持 k + 1 个 TLS socket，其中 k 是相应 DoIP 实体支持的并发 TLS 数据连接数
* 支持 TCP/DoIP 实体监听端口号 **13400**（unsecured）
* 支持 TCP/DoIP 实体监听端口 3496（secured）
* 支持 UDP/DoIP 实体监听端口号 **13400**

### 报文格式

![Pasted image 20230418151906.png|600](/img/user/0.Asset/resource/Pasted%20image%2020230418151906.png)

#### 协议版本号

| 版本号         | 含义                        |
| ----------- | ------------------------- |
| 0x00        | 预留                        |
| 0x01        | DoIP ISO/IDS 13400-2:2010 |
| 0x02        | DoIP ISO 13400-2:2012     |
| 0x03        | DoIP ISO 13400-2:2019     |
| 0x04...0xFE | 预留                        |
| 0xFF        | 车辆识别请求报文默认值               |

#### 版本号取反

对协议版本进行校验，确保正确的 DoIP 格式。如：协议版本 0x03，则此值为 0xFC。

#### 负载类型

负载类型包含：节点管理类、诊断类、节点状态类和预留。

| 负载分类   | 负载类型值    |
| ---------- | ------------- |
| 节点管理类 | 0x0000-0x0008 |
| 诊断类     | 0x8001-0x8003 |
| 节点状态类 | 0x4001-0x4004 |
| 预留       | 其他          |

##### 节点管理类报文

| 负载类型值 | 负载类型名称                  | 支持情况 | 协议    |
| ---------- | ----------------------------- | -------- | ------- |
| 0x0000     | DoIP 首部否定响应              | 强制     | UDP/TCP |
| 0x0001     | 车辆识别请求报文              | 强制     | UDP     |
| 0x0002     | 带 EID 的车辆识别请求报文       | 可选     | UDP     |
| 0x0003     | 带 VIN 的车辆识别请求报文       | 强制     | UDP     |
| 0x0004     | 车辆声明报文/车辆识别响应报文 | 强制     | UDP     |
| 0x0005     | 路由激活请求报文              | 强制     | TCP     |
| 0x0006     | 路由激活响应报文              | 强制     | TCP     |
| 0x0007     | 在线检查请求报文              | 强制     | TCP     |
| 0x0008     | 在线检查响应报文              | 强制     | TCP     |

##### 诊断类报文

| 负载类型值 | 负载类型名称     | 支持情况 | 协议 |
| ---------- | ---------------- | -------- | ---- |
| 0x8001     | 诊断报文         | 强制     | TCP  |
| 0x8002     | 诊断报文肯定应答 | 强制     | TCP  |
| 0x8003     | 诊断报文否定应答 | 强制     | TCP  |

##### 节点状态类

| 负载类型值 | 负载类型名称         | 支持情况 | 协议 |
| ---------- | -------------------- | -------- | ---- |
| 0x4001     | DoIP 实体状态请求报文 | 可选     | UDP  |
| 0x4002     | DoIP 实体状态响应报文 | 可选     | UDP  |
| 0x4003     | 诊断电源模式请求报文 | 强制     | UDP  |
| 0x4004     | 诊断电源模式响应报文 | 强制     | UDP  |

#### 负载长度

DoIP 的数据部分长度。

## 模块功能

### Socket Adapter

SoAd 层作为协议适配层，主要实现以下功能：

* 不同平台 API 的封装与实现
* 端口的连接状态和通知机制
* 状态管理接口
* 数据发送和接收功能

### DoIP Server

Server 端作为协议响应端，主要实现以下功能：

* 车辆识别和广播
* 路由激活
* 节点信息
* 保活机制

### DoIP Client

Client 作为协议请求端，主要实现以下功能：

* 实例创建与连接
* 发送和回调机制
* 获取节点信息
* 保活机制

### DoIP Gateway

Gateway 的功能需要从两个方面去分析：

* DoIP Gateway to Classical Bus Systems

![Pasted image 20230421150529.png|500](/img/user/0.Asset/resource/Pasted%20image%2020230421150529.png)

在传统的总线系统下，对 ECU 的寻址是通过逻辑 DoIP 地址，此时 Gateway 需要保存地址映射表并转发 UDS 报文。

由于以太网的高带宽，需要支持 ECU 的并行刷新。

* Diagnostics of In-Vehicle Ethernet ECUs

![Pasted image 20230421152337.png|500](/img/user/0.Asset/resource/Pasted%20image%2020230421152337.png)

目前 ISO 13400 并没有明确指定但是目前有两种实现模式：

1. Transparent switch
	诊断仪直接连接到车内的以太网 ECUs进行通信。

2. Locked switch(e.g. via VLAN encapsulation)
	这种场景下诊断仪是没有权限直接连接到车内的以太网 ECUs，诊断仪的通信需要通过中央网关模拟诊断仪进行中间转发。此时的转发也可以根据实际需求对相应的流程进行精简，不同的策略转发效率也各不相同。

<iframe src="/img/user/0.Asset/resource/Fast_Vehicle_Diagnostics_with_DoIP.pdf" width="100%" height="900px" title="Fast_Vehicle_Diagnostics_with_DoIP.pdf" style="border:1px solid #ccc;"></iframe>



