---
{"dg-publish":true,"dg-path":"automotive/UDS 协议零基础入门指南.md","permalink":"/automotive/UDS 协议零基础入门指南/","created":"2019-11-28T17:08:38.000+08:00","updated":"2025-03-07T14:04:26.389+08:00"}
---

#BDStar #AutoSAR #UDS 

UDS 本质上是一系列服务的集合。UDS 的服务包含 6 大类，共 26 种。每种服务都有自己独立的 ID，即 SID。SID：Service Identifier，诊断服务 ID。

# UDS 诊断的本质是什么

UDS 本质上是一种定向的通信，是一种交互协议（Request/Response），即诊断方（Tester）给 ECU 发送指定的请求数据（Request），这条数据中需要包含 SID，且 SID 处于该应用层数据的第一个字节。

# 肯定响应和否定响应

如果是肯定响应（Positive Response），首字节回复【SID+0x40】，举例子就是请求 0x10，响应 0x50；请求 0x22，响应 0x62。如果是否定的响应（Negative Response），首字节回复 0x7F，第二字节回复刚才询问的 SID。比如 Tester 请求 0x10 服务，我想进入编程模式，ECU 给出否定响应，首字节 0x7F，第二个字节回复 0x10，代表我否定你的 0x10 服务请求，第三字节是 NRC（否定响应码），代表我否定你的依据。

# UDS 寻址

通常在 CAN 总线中，Addressing information 寻址信息会在 CAN 的帧 ID 中体现出来。所谓的寻址信息包含了源地址（Source Address）和目标地址（Target Address），就是这条信息是由谁发给谁的，类似于收件人和发件人。当然，ECU 回信给 Tester 时，ECU 就变成源地址了。因此源地址和目标地址在 UDS 中并不是一成不变的。

# 寻址模式

UDS 的寻址模式分为两种，一种是物理寻址（点对点、一对一、），根据物理地址的不同进行访问，但只能访问单个 ECU 节点，Tester 为 SA 源地址，ECU 作为 TA 目标地址；对应的，另一种是功能寻址（广播、一对多），根据功能的不同进行访问，它能访问多个 ECU 节点，对于标准帧来说，通常是 0x7DF。每个 ECU 都有 2 个 CAN 的诊断帧 ID，分别对应物理寻址的收与发。通常由主机厂来确定不同 ECU 的这两个特定的诊断 ID。比如 0x701 对应接收 Tester 的消息，0x709 对应发给 Tester 的消息。

# UDS 服务分类

UDS 的服务分为 6 大类，但常用的服务是加背景色的 15 种。这 15 种服务可粗略的划分为权限控制、读取数据/信息、写入数据/信息、通信控制、功能控制这几类。

| 功能单元    | SID  | 服务          | Service                            | 支持子服务 |
| ------- | ---- | ----------- | ---------------------------------- | ----- |
| 诊断和通信管理 | 0x10 | 诊断会话控制      | Diagnostics Session Control        | 支持    |
|         | 0x11 | ECU 复位      | ECU Reset                          | 支持    |
|         | 0x27 | 安全访问        | Security Access                    | 支持    |
|         | 0x28 | 通讯控制        | Communication Control              | 支持    |
|         | 0x3E | 待机握手        | Tester Present                     | 支持    |
|         | 0x83 | 访问时间参数      | Access Timing Parameter            | 支持    |
|         | 0x84 | 安全数据传输      | Secured Data Transmission          | -     |
|         | 0x85 | 诊断故障码设置控制   | Control DTC Setting                | 支持    |
|         | 0x86 | 事件响应        | Response On Event                  | 支持    |
|         | 0x87 | 链路控制        | Link Control                       | 支持    |
| 数据传输    | 0x22 | 通过 ID 读数据   | Read Data By Identifier            | -     |
|         | 0x23 | 通过地址读数据     | Read Memory By Address             | -     |
|         | 0x24 | 通过 ID 读比例数据 | Read Scaling Data By Identifier    | -     |
|         | 0x2A | 通过周期 ID 读数据 | Read Data By Periodic Identifier   | -     |
|         | 0x2C | 动态定义标识符     | Dynamically Define Data Identifier | 支持    |
|         | 0x2E | 通过 ID 写数据   | Write Data By Identifier           | -     |
|         | 0x3D | 通过地址写内存     | Write Memory By Address            | -     |
| 存储数据传输  | 0x14 | 清除诊断信息      | Clear Diagnostic Information       | -     |
|         | 0x19 | 读取故障码信息     | Read DTC Information               | 支持    |
| 输入输出控制  | 0x2F | 通过标识符控制输入输出 | Input Output Control By Identifier | -     |
| 例行程序    | 0x31 | 例行程序控制      | Routine Control                    | 支持    |
| 上传下载    | 0x34 | 请求下载        | Request Download                   | -     |
|         | 0x35 | 请求上传        | Request Upload                     | -     |
|         | 0x36 | 数据传输        | Transfer Data                      | -     |
|         | 0x37 | 请求退出传输      | Request Transfer Exit              | -     |
|         | 0x38 | 请求文件传输      | Request File Transfer              | -     |

# UDS 的请求命令的构成方式

UDS 的请求命令有 4 种构成方式，即 SID，SID+SF（Sub-function），SID+DID（Data Identifier）（读写用），SID+SF+DID。

# 否定响应码

NRC：Negative Response Code（否定响应码）。如果 ECU 拒绝了一个请求，做出否定响应（Negative Response），它会在第三个字节回复一个 NRC。不同的 NRC 有不同的含义。