---
{"dg-publish":true,"dg-path":"汽车电子/嵌入式的 GDB 调试原理.md","permalink":"/汽车电子/嵌入式的 GDB 调试原理/","created":"2022-04-27T22:57:24.000+08:00","updated":"2024-11-19T11:14:34.697+08:00"}
---

#Ofilm #Debug

![Pasted image 20230713135755.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230713135755.png)

1. 芯片与调试器直接的接口协议为 JTAG 或 SWD，通过调试器将协议转换为 USB 接口协议。电脑端运行 GDB Server 或 Telnet Server 端，分别基于 TCP 或 Telnet 通信，使得任意工具链下的 GDB 可以与 GDB Server 通信，或者使用 Telnet 进行通信。
2. OpenOCD 或 J-Link 均实现了 GDB Server 端的功能。
3. 当用 Keil 进行调试时，此时使用的是 ARM 定制的 RDI 协议，此时并非使用了 GDB Server。

![Pasted image 20230713135733.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230713135733.png)

