---
{"dg-publish":true,"dg-path":"车载技术/什么是 CAN Controller？.md","permalink":"/车载技术/什么是 CAN Controller？/","created":"2020-01-17T17:26:33.000+08:00","updated":"2025-06-19T10:21:36.000+08:00"}
---

#BDStar #AUTOSAR 

![Pasted image 20250619101959.png](/img/user/0.Asset/resource/Pasted%20image%2020250619101959.png)

控制器局域网是用于连接控制器的串行总线标准。CAN Controller 是 MCU 的一部分，用于控制 CAN 节点。

![Pasted image 20230306173844.png|250](/img/user/0.Asset/resource/Pasted%20image%2020230306173844.png)

它包含两个主要功能：

- 接收消息：  CAN 控制器每次从收发器接收一个 bit 的数据（因为 CAN 总线是串行总线）并且将这些 bits 的数据缓存下来直到接收完整个消息。一旦消息被接收，就会触发中断通知上层处理。
- 发送消息：CAN 控制器从上层获取到整个消息，并在总线空闲时逐位传输。

它相当于 OSI 模型中的数据链路层。