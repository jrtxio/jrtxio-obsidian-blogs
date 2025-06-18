---
{"dg-publish":true,"dg-path":"00 - 汽车电子/简述 CAN 控制器功能.md","permalink":"/00 - 汽车电子/简述 CAN 控制器功能/","created":"2020-01-17T17:26:33.000+08:00","updated":"2025-06-17T10:34:50.321+08:00"}
---

#BDStar #AUTOSAR 

![Pasted image 20241119113910.png|650](/img/user/0.Asset/resource/Pasted%20image%2020241119113910.png)

控制器局域网是用于连接控制器的串行总线标准。CAN 控制器是微控制器的一部分，用于控制 CAN 节点。

![Pasted image 20230306173844.png|250](/img/user/0.Asset/resource/Pasted%20image%2020230306173844.png)

它包含两个主要功能：

- 接收消息：  CAN 控制器每次从收发器接收一个 bit 的数据（因为 CAN 总线是串行总线）并且将这些 bits 的数据缓存下来直到接收完整个消息。一旦消息被接收，就会触发中断通知上层处理。
- 发送消息：CAN 控制器从上层获取到整个消息，并在总线空闲时逐位传输。

它相当于 OSI 模型中的数据链路层。