---
{"dg-publish":true,"dg-path":"汽车电子/DTC 故障码分类说明.md","permalink":"/汽车电子/DTC 故障码分类说明/","created":"2020-04-24T15:55:54.000+08:00","updated":"2025-06-17T10:23:48.426+08:00"}
---

#BDStar #AUTOSAR #UDS 

故障码包括四个大类，分别是 PCBU。

-   P 是 Powertrain 动力系统
-   C 是 Chasis 底盘
-   B 是 Body 车身
-   U 是 Network 通信系统

一个 DTC 信息占用 4 个字节，最后一个字节是 DTC 的状态，前两个字节是我们熟知的类似 P0047 的故障码