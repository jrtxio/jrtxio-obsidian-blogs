---
{"dg-publish":true,"permalink":"/1.inbox/draft/AUTOSAR 入门教程 19：SecOC/","dg-note-properties":{"slug":"autosar-tutorial-secoc","author":"吉人","created":"2025-04-12","source":null}}
---

> 理解 SecOC 如何为车载消息添加认证保护，掌握 MAC 计算流程和 Freshness 防重放机制，以及与 Crypto 栈的协作关系。

CAN 总线没有加密、没有认证、没有防重放。任何接入总线的设备都能伪造报文——一条伪造的刹车信号可以让正常行驶的车辆突然减速。传统 CAN 设计于 1980 年代，当时车载网络是物理隔离的，安全不在设计考虑之内。随着车联网和远程接入的普及，总线不再是封闭系统。[[3.wiki/AUTOSAR\|AUTOSAR]] 的 SecOC（Secure Onboard Communication）就是为这个威胁建模的：它不加密数据内容，而是为每条关键消息附加认证信息，让接收方验证"这条消息确实来自合法发送者，且没有被篡改或重放"。

## SecOC 的定位

SecOC 位于 PduRouter 旁边，拦截需要安全保护的 PDU，在发送时添加认证信息，在接收时验证认证信息。它不替代现有的通信协议——CAN 报文格式不变，只是多了几个字节的认证数据。

SecOC 保护的对象是 I-PDU（交互层 PDU），不是底层的 CAN 帧。一个 I-PDU 可能包含多个信号，SecOC 对整个 I-PDU 做认证。这意味着即使攻击者截获了 CAN 帧，无法伪造正确的认证信息就无法通过验证。

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 400" width="SecOC 认证流程，展示发送端添加认证和接收端验证的完整数据流">  <defs>    <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">      <path d="M0,0 L8,3 L0,6" fill="#4a4a4a"/>    </marker>    <marker id="arrow-r" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">      <path d="M0,0 L8,3 L0,6" fill="#d97757"/>    </marker>  </defs>  <!-- Background -->  <rect width="920" height="400" fill="#f8f6f3" rx="12"/>  <!-- Title -->  <text x="460" y="30" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="13" font-weight="600" fill="#1a1a1a" text-anchor="middle">SecOC 认证流程：发送端与接收端</text>  <!-- ===== SENDER (Top Row) ===== -->  <text x="460" y="62" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="10" font-weight="600" fill="#d97757" text-anchor="middle">发送端（Sender）</text>  <!-- Original I-PDU -->  <rect x="60" y="78" width="140" height="50" fill="#a8c5e6" rx="8" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="130" y="100" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="10" font-weight="600" fill="#1a1a1a" text-anchor="middle">Authentic I-PDU</text>  <text x="130" y="116" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#6a6a6a" text-anchor="middle">原始数据</text>  <!-- Arrow -->  <line x1="202" y1="103" x2="248" y2="103" stroke="#4a4a4a" stroke-width="1.5" marker-end="url(#arrow)"/>  <!-- SecOC Sender -->  <rect x="250" y="72" width="240" height="62" fill="#d97757" rx="8" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="370" y="94" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="11" font-weight="600" fill="#ffffff" text-anchor="middle">SecOC（发送端）</text>  <text x="370" y="112" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#ffffff" text-anchor="middle">拼接 Data ID + I-PDU + FV</text>  <text x="370" y="124" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#ffffff" text-anchor="middle">调用 Crypto 计算 CMAC</text>  <!-- Arrow -->  <line x1="492" y1="103" x2="538" y2="103" stroke="#4a4a4a" stroke-width="1.5" marker-end="url(#arrow)"/>  <!-- Secured I-PDU -->  <rect x="540" y="78" width="180" height="50" fill="#9dd4c7" rx="8" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="630" y="96" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="10" font-weight="600" fill="#1a1a1a" text-anchor="middle">Secured I-PDU</text>  <text x="630" y="112" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#6a6a6a" text-anchor="middle">I-PDU + MAC + FV</text>  <!-- Arrow to bus -->  <line x1="722" y1="103" x2="788" y2="103" stroke="#4a4a4a" stroke-width="1.5" marker-end="url(#arrow)"/>  <!-- CAN Bus (center bar) -->  <rect x="60" y="165" width="800" height="28" fill="#f4e4c1" rx="6" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="460" y="184" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="10" font-weight="600" fill="#1a1a1a" text-anchor="middle">CAN Bus / Ethernet</text>  <!-- Down arrow from sender to bus -->  <line x1="800" y1="130" x2="800" y2="163" stroke="#4a4a4a" stroke-width="1.5" marker-end="url(#arrow)"/>  <!-- ===== RECEIVER (Bottom Row) ===== -->  <text x="460" y="225" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="10" font-weight="600" fill="#d97757" text-anchor="middle">接收端（Receiver）</text>  <!-- Up arrow from bus to receiver -->  <line x1="120" y1="195" x2="120" y2="238" stroke="#4a4a4a" stroke-width="1.5" marker-end="url(#arrow)"/>  <!-- Secured I-PDU received -->  <rect x="60" y="242" width="180" height="50" fill="#9dd4c7" rx="8" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="150" y="260" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="10" font-weight="600" fill="#1a1a1a" text-anchor="middle">Secured I-PDU</text>  <text x="150" y="278" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#6a6a6a" text-anchor="middle">I-PDU + MAC + FV</text>  <!-- Arrow -->  <line x1="242" y1="267" x2="288" y2="267" stroke="#4a4a4a" stroke-width="1.5" marker-end="url(#arrow)"/>  <!-- SecOC Receiver -->  <rect x="290" y="236" width="260" height="62" fill="#d97757" rx="8" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="420" y="258" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="11" font-weight="600" fill="#ffffff" text-anchor="middle">SecOC（接收端）</text>  <text x="420" y="274" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#ffffff" text-anchor="middle">验证 MAC：用本地密钥重算 CMAC</text>  <text x="420" y="288" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#ffffff" text-anchor="middle">验证 FV：检查 Freshness Value 递增</text>  <!-- Two outcome arrows -->  <!-- Pass -->  <line x1="552" y1="255" x2="628" y2="255" stroke="#4a4a4a" stroke-width="1.5" marker-end="url(#arrow)"/>  <text x="590" y="248" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="7" fill="#6a6a6a" text-anchor="middle">通过</text>  <rect x="630" y="234" width="140" height="42" fill="#a8c5e6" rx="8" stroke="#4a4a4a" stroke-width="1.5"/>  <text x="700" y="254" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="10" font-weight="600" fill="#1a1a1a" text-anchor="middle">Authentic I-PDU</text>  <text x="700" y="268" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#6a6a6a" text-anchor="middle">→ 上层处理</text>  <!-- Fail -->  <line x1="552" y1="282" x2="628" y2="282" stroke="#d97757" stroke-width="1.5" stroke-dasharray="6,4" marker-end="url(#arrow-r)"/>  <text x="590" y="276" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="7" fill="#d97757" text-anchor="middle">失败</text>  <rect x="630" y="266" width="140" height="32" fill="#e8e6e3" rx="8" stroke="#4a4a4a" stroke-width="1"/>  <text x="700" y="286" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="9" fill="#6a6a6a" text-anchor="middle">丢弃 + 通知上层</text>  <!-- Crypto Stack (side note) -->  <rect x="290" y="320" width="260" height="55" fill="#e8e6e3" rx="8" stroke="#4a4a4a" stroke-width="1" stroke-dasharray="4,3"/>  <text x="420" y="342" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="9" font-weight="600" fill="#1a1a1a" text-anchor="middle">Crypto 栈（CSM → CryIf → HSM）</text>  <text x="420" y="358" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#6a6a6a" text-anchor="middle">密钥管理 + CMAC 计算</text>  <!-- Dashed connection from SecOC to Crypto -->  <line x1="420" y1="300" x2="420" y2="318" stroke="#4a4a4a" stroke-width="1" stroke-dasharray="4,3" marker-end="url(#arrow)"/>  <!-- PduR label -->  <text x="60" y="150" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="8" fill="#6a6a6a">← PduR →</text></svg>

## 发送端：添加认证

发送端的流程分三步。

**第一步，拼接待认证数据**。SecOC 将三个字段拼接在一起：Data ID（消息标识符，唯一标识这条通信关系）、完整的 Authentic I-PDU（原始数据）、Freshness Value（新鲜度值）。拼接结果就是待认证的输入。

**第二步，计算 MAC**。SecOC 将待认证数据连同密钥一起交给 Crypto 栈（CSM 模块），由底层加密引擎计算 CMAC（Cipher-based MAC）。CMAC 是基于对称密钥的消息认证码——发送方和接收方共享同一个密钥，用相同的算法计算，得到相同的结果。

**第三步，组装 Secured I-PDU**。将原始 I-PDU、截断后的 MAC（通常取前 5-7 字节，不是完整的 MAC 值）和 Freshness Value 组装成 Secured I-PDU，交给 PduRouter 发送到总线。

MAC 截断是出于效率考虑。完整 CMAC 通常是 16 字节，但 CAN 帧总共才 8 字节有效载荷。截断到 5-7 字节，在安全强度和带宽开销之间取平衡。截断意味着理论上碰撞概率增加，但对于车载场景（短消息、受限于物理接触范围），5-7 字节的 MAC 已经提供了足够的安全裕量。

## 接收端：验证认证

接收端执行对称的验证流程。

SecOC 从收到的 Secured I-PDU 中提取出 Authentic I-PDU、MAC 和 Freshness Value。然后用本地存储的密钥和相同的算法重新计算 CMAC，将计算结果与收到的 MAC 比对。同时验证 Freshness Value 是否大于上次收到的值——如果小于或等于，说明这是一条重放报文，直接丢弃。

两个检查都通过后，SecOC 将验证通过的 Authentic I-PDU 交给 PduRouter 向上层传递。任何一个检查失败，这条消息被丢弃，SecOC 通过回调通知上层验证失败。

## Freshness 防重放机制

MAC 只能验证"消息没有被篡改"，但不能防止重放攻击——攻击者可以截获一条合法报文，原封不动地重发。Freshness Value 就是防重放的利器。

Freshness Value 是一个单调递增的计数器。每次发送新消息时，Freshness Value 加 1（或基于时间戳递增）。接收方维护每个通信关系的最新 Freshness Value，只接受比上次更大的值。

Freshness Value 的同步是一个工程难点。ECU 掉电重启后，Freshness Value 从 0 开始，但总线上其他 ECU 期望的值可能已经是几千了。SecOC 支持 Freshness Value 的同步机制：在启动阶段通过特定的同步报文交换当前值，或者在认证失败时触发同步流程。同步本身也需要安全保护——攻击者不能伪造同步报文把 Freshness Value 重置为 0。

## 与 Crypto 栈的协作

SecOC 定义协议和流程，但不直接执行加密运算。所有的 CMAC 计算、密钥访问都委托给 Crypto 栈（教程 20 会详细展开）。协作关系很清晰：SecOC 告诉 CSM"用密钥 K 对这段数据计算 CMAC"，CSM 调用底层 HSM 硬件完成计算并返回结果。

这种分离的好处是 SecOC 不需要关心密钥存在哪里、算法如何实现。密钥可以存在 MCU 内置的 HSM 中，也可以存在外部安全芯片里——SecOC 只通过密钥 ID 引用，密钥材料永远不暴露给 CPU。

## 实践建议

- MAC 长度选择需要和安全团队对齐：5 字节适合一般控制信号，7 字节适合安全关键信号（如制动、转向），全量 16 字节在 CAN 上不现实
- Freshness Value 的同步策略要覆盖所有异常场景：ECU 冷启动、唤醒后首次通信、长时间离线后恢复
- 不是所有消息都需要 SecOC 保护。根据安全分析确定哪些信号需要认证（如制动请求），哪些不需要（如环境温度），避免不必要的带宽和计算开销
- 认证失败的降级策略要预定义：连续失败 N 次后是否进入安全模式、是否点亮故障灯、是否抑制相关功能
- SecOC 的性能开销主要在 CMAC 计算，硬件 HSM 可以在微秒级完成，纯软件实现可能需要毫秒级——在实时性要求高的通道上必须用硬件加速

下一篇教程将深入 Crypto 栈的三层架构——SecOC 只是 Crypto 最大的使用场景之一，加密栈还支撑安全启动、密钥管理、固件签名验证等完整的信息安全能力。