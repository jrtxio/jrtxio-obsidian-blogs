---
{"dg-publish":true,"dg-path":"汽车电子/CAN 控制器概述.md","permalink":"/汽车电子/CAN 控制器概述/","created":"2020-01-17T17:26:33.000+08:00","updated":"2025-04-02T14:30:16.557+08:00"}
---

#BDStar #AUTOSAR 

![Pasted image 20241119113910.png|650](/img/user/0.Asset/resource/Pasted%20image%2020241119113910.png)

Controller Area Network is a serial bus standard Used to connect Controllers.  
控制器局域网是用于连接控制器的串行总线标准。

CAN Controller will be Part of the microcontroller which host CAN Node.  
CAN 控制器是微控制器的一部分，用于控制 CAN 节点。

![Pasted image 20230306173844.png|250](/img/user/0.Asset/resource/Pasted%20image%2020230306173844.png)

It has two major functions  
它包含两个主要功能：

- Receiving Message:  
CAN Controller receives message from Tran-receiver one bit at a time(as the CAN bus is a serial bus)and Buffers all these bits until entire message is received. once message is received an interrupt will be triggered and it will be sent to higher layers for processing.
- 接收消息：  
CAN 控制器每次从收发器接收一个 bit 的数据（因为 CAN 总线是串行总线）并且将这些 bits 的数据缓存下来直到接收完整个消息。一旦消息被接收，就会触发中断通知上层处理。

- Sending Message:  
CAN Controller gets entire message from higher layers and transmits bit by bit whenever Bus is free.
- 发送消息：  
CAN 控制器从上层获取到整个消息，并在总线空闲时逐位传输。

It act as a Data Link Layer when compared to OSI Model.  
它相当于 OSI 模型中的数据链路层。