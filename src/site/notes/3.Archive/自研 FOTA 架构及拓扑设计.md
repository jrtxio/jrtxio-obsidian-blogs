---
{"dg-publish":true,"dg-enable-search":"true","dg-path":"文章/自研 FOTA 架构及拓扑设计.md","permalink":"/文章/自研 FOTA 架构及拓扑设计/","dgEnableSearch":"true","dgPassFrontmatter":true,"created":"2023-07-14T18:48:23.000+08:00","updated":"2023-11-19T14:57:31.000+08:00"}
---


![Platform_Architecture_and_Topology.jpg|650](/img/user/0.Asset/resource/Platform_Architecture_and_Topology.jpg)

自研的 FOTA 拓扑图如上所示，IMX6ULL_PRO 开发板作为 FOTA 核心上位机，对两个 ST 的开发板进行升级，分别通过两种不同的总线进行刷新升级，即 CAN 和 ETH。其中 STM32F103Cx 开发板裸机运行 HAtuosar 协议栈。FBL 通过 CAN 的 UDS 协议栈实现。STM32F407VET6 通过 FreeRTOS 运行 AUTOSAR 协议栈。FBL 通过 CAN 和 UDS 协议栈实现，并同时支持 ETH 和 FNET + DoIP + UDS 协议栈。IMX6ULL_PRO 开发板与外部的 Ubuntu Server 通过 HTTP 和 SOME/IP 协议来实现升级流程的控制。