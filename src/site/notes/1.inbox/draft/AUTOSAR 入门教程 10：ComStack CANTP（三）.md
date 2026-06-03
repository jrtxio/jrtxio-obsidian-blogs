---
{"dg-publish":true,"permalink":"/1.inbox/draft/AUTOSAR 入门教程 10：ComStack CANTP（三）/","dg-note-properties":{"slug":"autosar-communication-stack-cantp","author":"吉人","created":"2025-04-17","source":null}}
---

> 理解 CanTp 如何在 8 字节的 CAN 帧上传输上百字节的诊断报文，以及流控机制如何防止数据丢失。

CAN 单帧最多承载 8 字节有效数据，但一条 UDS 诊断请求可能超过 100 字节。这个矛盾靠 CanTp（CAN Transport Protocol）解决——它把长报文拆成多个 CAN 帧逐个发送，接收端拼回原始数据。CanTp 实现的是 ISO 15765-2 定义的 ISO-TP 协议，是 [[3.wiki/车载网络\|车载网络]] 中诊断通信的传输层基础。

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 520" width="CanTp 在 AUTOSAR CAN 通信栈中的位置，位于服务层 CanIf 之上、PduR 之下">  <defs>    <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">      <path d="M0,0 L8,3 L0,6" fill="#4a4a4a"/>    </marker>  </defs>  <!-- Background -->  <rect width="880" height="520" fill="#f8f6f3" rx="12"/>  <!-- Title -->  <text x="440" y="32" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="13" font-weight="600" fill="#1a1a1a" text-anchor="middle">CanTp 在 CAN 通信栈中的位置</text>  <!-- Layer backgrounds -->  <rect x="50" y="60" width="780" height="70" fill="#e8e6e3" rx="8" stroke="#4a4a4a" stroke-width="0.5" stroke-dasharray="4,4"/>  <rect x="50" y="145" width="780" height="70" fill="#e8e6e3" rx="8" stroke="#4a4a4a" stroke-width="0.5" stroke-dasharray="4,4"/>  <rect x="50" y="230" width="780" height="240" fill="#e8e6e3" rx="8" stroke="#4a4a4a" stroke-width="0.5" stroke-dasharray="4,4"/>  <!-- Layer labels -->  <text x="26" y="100" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="9" fill="#6a6a6a" text-anchor="middle" transform="rotate(-90,26,100)">MCAL</text>  <text x="26" y="185" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="9" fill="#6a6a6a" text-anchor="middle" transform="rotate(-90,26,185)">ECU 抽象</text>  <text x="26" y="355" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="9" fill="#6a6a6a" text-anchor="middle" transform="rotate(-90,26,355)">服务层</text>  <!-- MCAL: CanDrv -->  <rect x="330" y="72" width="220" height="46" fill="#f4e4c1" rx="8" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="440" y="100" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="11" font-weight="600" fill="#1a1a1a" text-anchor="middle">CanDrv（CAN 驱动）</text>  <!-- ECU Abstraction: CanIf -->  <rect x="330" y="157" width="220" height="46" fill="#9dd4c7" rx="8" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="440" y="185" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="11" font-weight="600" fill="#1a1a1a" text-anchor="middle">CanIf（CAN 接口）</text>  <!-- Service layer: CanTp (HIGHLIGHTED) -->  <rect x="240" y="250" width="200" height="56" fill="#d97757" rx="8" stroke="#4a4a4a" stroke-width="2"/>  <text x="340" y="274" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="12" font-weight="600" fill="#ffffff" text-anchor="middle">CanTp</text>  <text x="340" y="294" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#ffffff" text-anchor="middle">传输协议 · ISO 15765-2</text>  <!-- PduR -->  <rect x="500" y="250" width="160" height="56" fill="#9dd4c7" rx="8" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="580" y="274" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="11" font-weight="600" fill="#1a1a1a" text-anchor="middle">PduR</text>  <text x="580" y="294" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#6a6a6a" text-anchor="middle">PDU 路由</text>  <!-- DCM -->  <rect x="240" y="340" width="140" height="46" fill="#9dd4c7" rx="8" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="310" y="368" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="11" font-weight="600" fill="#1a1a1a" text-anchor="middle">DCM（诊断）</text>  <!-- CanNm -->  <rect x="500" y="340" width="160" height="46" fill="#9dd4c7" rx="8" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="580" y="368" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="11" font-weight="600" fill="#1a1a1a" text-anchor="middle">CanNm（网络管理）</text>  <!-- COM -->  <rect x="240" y="410" width="420" height="46" fill="#9dd4c7" rx="8" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="450" y="438" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="11" font-weight="600" fill="#1a1a1a" text-anchor="middle">COM（信号管理）</text>  <!-- Data flow arrows -->  <!-- CanIf → CanTp -->  <line x1="400" y1="203" x2="340" y2="248" stroke="#4a4a4a" stroke-width="1.5" marker-end="url(#arrow)"/>  <!-- CanTp → PduR -->  <line x1="440" y1="278" x2="498" y2="278" stroke="#4a4a4a" stroke-width="1.5" marker-end="url(#arrow)"/>  <!-- PduR → DCM -->  <line x1="540" y1="306" x2="340" y2="338" stroke="#4a4a4a" stroke-width="1" stroke-opacity="0.6" stroke-dasharray="4,3" marker-end="url(#arrow)"/>  <!-- CanNm → CanIf (direct) -->  <line x1="580" y1="340" x2="480" y2="203" stroke="#4a4a4a" stroke-width="1" stroke-opacity="0.6" stroke-dasharray="4,3"/>  <!-- CanIf → CanDrv -->  <line x1="440" y1="157" x2="440" y2="120" stroke="#4a4a4a" stroke-width="1.5" marker-end="url(#arrow)"/>  <!-- Label: diagnostic path -->  <text x="100" y="310" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#d97757" text-anchor="middle">诊断通道</text>  <path d="M130,300 L230,270" stroke="#d97757" stroke-width="1" stroke-dasharray="4,3" marker-end="url(#arrow)"/>  <!-- Label: NM path -->  <text x="740" y="270" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#6a6a6a" text-anchor="middle">NM 通道</text>  <path d="M710,280 L662,280" stroke="#4a4a4a" stroke-width="1" stroke-dasharray="4,3" marker-end="url(#arrow)"/>  <!-- CAN Bus -->  <rect x="240" y="488" width="420" height="5" fill="#d97757" rx="2"/>  <text x="700" y="494" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#6a6a6a">CAN Bus</text></svg>

## CanTp 的定位与职责

CanTp 位于 [[3.wiki/AUTOSAR\|AUTOSAR]] 服务层，夹在 PDU Router 和 CanIf 之间。在教程 9 中我们介绍了 CanIf 的 PDU 收发能力，CanTp 就是在 CanIf 之上增加了分段和重组的功能。CanTp 的核心职责有四个：报文分段与重组、流控管理、多帧传输状态机维护、诊断通信支持。CanTp 与其他模块的交互关系很清晰：向上通过 PDU Router 收发 N-PDU，向下通过 CanIf 访问 CAN 控制器，同级与 DCM 配合处理诊断请求。

### 帧类型与多帧传输

ISO-TP 定义了四种帧类型，用 PCI（Protocol Control Information）的首字节高 4 位标识：单帧（SF，`0x0`）数据不超过 7 字节时一帧搞定；首帧（FF，`0x1`）标记多帧传输开始，携带总长度信息；连续帧（CF，`0x2`）传输后续数据块，按序编号；流控帧（FC，`0x3`）接收方用来调节发送速率。

以传输 20 字节诊断报文为例：发送方先发 FF 声明总长度 20 字节，接收方回 FC 确认可以接收，发送方再逐个发 CF 直到数据传完。

## 流控机制

流控是 CanTp 最精巧的设计。CAN 总线没有硬件流控，如果发送方一股脑把所有 CF 帧发出去，接收方可能来不及处理就丢数据了。流控通过两个参数解决这个问题：BS（Block Size）允许连续发送的 CF 帧数量，发完 BS 个 CF 帧后必须停下来等 FC；STmin（Separation Time）两个 CF 帧之间的最小时间间隔，给接收方留处理时间。

BS 和 STmin 的组合就像水管上的阀门：BS 控制一次放多少水，STmin 控制水流速度。FC 帧还支持三种状态：继续发送（`0x0`）、等待（`0x1`）、溢出中止（`0x2`）。当接收方缓冲区满了就发"等待"，让发送方暂停。

### 关键配置参数

CanTp 的配置项不少，核心参数包括：

```c
/* CanTp 通道配置示例 */
CanTpChannelConfig {
  CanTpNsa = TRUE;   /* 使用网络层地址 */
  CanTpSTmin = 20;   /* 默认帧间隔(ms) */
  CanTpBs = 8;       /* 块大小 */
  CanTpNar = 0x7DF;  /* 目标地址 */
}
```

几个参数的范围需要注意：BS 取值 0-255，0 表示无流控限制；STmin 取值 0-127ms，超过 127ms 需要特殊编码；N-PDU 总长度不超过 4095 字节，这是 ISO-TP 标准的限制。

## 诊断报文实战

理解了帧类型和流控，看一段实际的 UDS 诊断报文：

```python
# 读取故障码请求（CAN ID 0x1901）
[0x1901] 02 19 01 AA AA AA AA

# 多帧响应
[0x1901] 10 14 59 01 FF 00 00   # 首帧，总长度 20 字节
[0x1901] 21 01 02 03 04 05 06   # 连续帧 1
[0x1901] 22 07 08 09 0A 0B 0C   # 连续帧 2
```

请求只有 3 字节有效数据，用单帧（SF）就够了。响应 20 字节，走多帧传输：FF 声明长度后逐个 CF 发送。这是 [[3.wiki/车载诊断\|车载诊断]] 中最常见的通信模式。

## 实践建议

- 接收超时问题先查 STmin 和硬件时钟同步，时钟偏移会导致时序判断错误
- 数据丢失优先验证 BS 参数和缓冲区大小，BS 设太大接收端来不及处理
- 地址不匹配是最常见的低级错误，确认 N_TA/N_SA（目标地址/源地址）配置一致
- 用 CANoe 或 CANalyzer 抓包分析帧序列时序，比看日志直观得多
- CanTp 的流控参数需要和通信对端协商一致，单方面修改会导致通信中断

下一篇教程将介绍 CanSM——CAN 控制器状态管理模块。CanTp 只管数据传输，而 CanSM 管理的是 CAN 控制器本身的硬件状态：什么时候开启收发、什么时候进入静默、Bus-Off 后怎么恢复。