---
{"dg-publish":true,"dg-path":"01 车载技术/剖析 UDS 诊断帧.md","permalink":"/01 车载技术/剖析 UDS 诊断帧/"}
---

#autosar #uds 

UDS 诊断服务通常是通过 CAN 总线实现。对于 CAN 诊断帧有两种不同的分类方式，按照寻址方式可以分为物理寻址、功能寻址，按照帧类别可以分为单帧、首帧、流控帧、连续帧。

## 寻址方式

在总线上往往连着众多 ECU 设备(如下图所示)，作为诊断设备既可以单独与某一 ECU 进行通信，也可以同时与所有总线上的 ECU 设备通信。

![Pasted image 20250520112939.png](/img/user/0.Asset/resource/Pasted%20image%2020250520112939.png)
### 物理寻址

物理寻址是指总线上始终只有一个 ECU 响应诊断设备发出的诊断命令，实现点对点通信，例如上图中总线上仅 MMI 响应诊断设备的诊断命令。

### 功能寻址

功能寻址是指总线上的所有 ECU 对可以同时响应诊断设备发出的诊断命令，实现一对多的通信方式，例如上 图中 IPK、MMI、AC、BCM、EPS、ESCL、 SAS、ACU、EMS、ABS/ESC、TCU 可以同时响应诊断设备的诊断命令。

## 帧类别

对于帧的类型，通过需要发送的数据长度来确定。在正常寻址模式下，当数据长度小于等于 7 byte，则用单帧的形式发送。如下图所示：

![[Single Frame.drawio]]

![Pasted image 20250520150838.png](/img/user/0.Asset/resource/Pasted%20image%2020250520150838.png)

当数据长度大于 7 byte，数据需要分多帧才能发送完成，则需要使用到首帧、流控帧、连续帧。多帧的机制如下图所示。

![Pasted image 20250520113627.png](/img/user/0.Asset/resource/Pasted%20image%2020250520113627.png)

对于不同的帧，通过 CAN 数据场的中的 PCI （Protocol control information）来进行区分。

![[UDS Message PCI.xlsx]]

![Pasted image 20250521155503.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250521155503.png)

以下是对 PCI 段的详细解释。

![Pasted image 20250520113138.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250520113138.png)

### 单帧

单帧的缩写为 SF，数据域的第一个字节高 4 bit 值为 0000，标识这是一个帧 SingleFrame，低 4bit 是SF_DL，即 DataLength，描述后面有几个字节有效的数据长度。后面没有使用的字节通常会用 0xAA 来进行填充。

### 多帧

如果一帧 CAN 报文无法承载一条诊断报文，则需要按照上面的机制分包发送。

#### 首帧

首先发送端会以一个 FirstFrame 开启通信，告诉接收端还有后续的内容要发，FirstFrame 使用前两个字节作为 PCI 信息，第一个字节高 4 bit 为 0001，标识这是一个 FirstFrame，低 4 bit 加上第二个字节用于描述总共发送的数据长度是多少（包括在 FirstFrame 中和后续在 ConsecutiveFrame 中的所有数据）。

> [!WARNING]
> 该数据长度不包含 ConsecutiveFrame 的 PCI 部分。

#### 流控帧

之后接收端发送 FlowControl，告诉发送端能以什么样的速度来发送数据，FlowControl 第一字节的高 4 bit 为 0011，低 4 bit 为 FS，即 FlowStatus，第二个字节为 BS（BlockSize），第三个字节为 STmin（SeperateTime）。FlowControl 有0，1，2 三种状态，分别命名为 ContinueToSend（CTS），Wait（WT），Overflow（OVFLW）。如果允许发送端继续发送 ConsecutiveFrame，则 FlowStatus=0；若要求发送端等一会再发送 ConsecutiveFrame，则 FlowStatus=1，允许发送端发送 ConsecutiveFrame 时，接收端再发一个 FlowStatus=0 的 FlowControl。如果接收端因为资源问题无法接收发送端发送的数据，则发送一个 FlowStatus=2 的 FlowControl。

BS 指示发送端一次可以发送多少个 ConsecutiveFrame，当发送 ConsecutiveFrame 数量达到 BS 时，需要接收端再次以一个 FlowControl 开启下一波的 ConsecutiveFrame 发送。

接收端根据自身的接收和处理能力使用 STmin 指示发送端在发送 ConsecutiveFrame 时最小的时间间隔是多少，从而实现流控制。


> [!WARNING]
> 需要提一下的是，BS 和 STmin 等于 0 时，表示接收端可以以最快的速度来接收数据，发送端可以一次发送的 ConsecutiveFrame 数量不受限制。

#### 连续帧

ConsecutiveFrame 就是承载 FirstFrame 无法完全承载的剩余数据了，它使用第一个字节用作 PCI，高 4 bit 为 0010，低 4 bit 用于标识 ConsecutiveFrame 的序列号（SN），从 1 开始，每发送一次 ConsecutiveFrame 增加 1 。

## 报文举例

![Pasted image 20201030114571.png|650](/img/user/0.Asset/resource/Pasted%20image%2020201030114571.png)

上图为实际开发中的 $22 诊断的 F1 87 的读取与响应，可结合上面的首帧、流控帧、连续帧进行对应分析。

