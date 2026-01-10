---
{"dg-publish":true,"dg-path":"01 车载技术/通信中间件 SOMEIP 与 DDS 部署方案.md","permalink":"/01 车载技术/通信中间件 SOMEIP 与 DDS 部署方案/"}
---

#someip #dds

目前自动驾驶通信中间件主要为 SOME/IP 和 DDS。下面我们来简单看一下如何在 MCU 和 SOC 上分别部署这两种通信中间件。

## SOME/IP

![Pasted image 20240130224135.png|650](/img/user/0.Asset/resource/Pasted%20image%2020240130224135.png)

SH 端 SOME/IP 方案是基于 Classic AUTOSAR 本身的模块实现。PH 端可以基于开源的 vsomeip 协议栈进行部署。

## DDS

![Pasted image 20240129170504.png|650](/img/user/0.Asset/resource/Pasted%20image%2020240129170504.png)

DDS 的部署方案可选择 Micro XRCE-DDS + Fast DDS 的组合实现。MCU 端部署 Micro XRCE-DDS client，用作数据的订阅和发布。SOC 端部署 Micro XRCE-DDS Agent，用于与 client 交互，通过代理服务参与 DDS 通信，同时 SOC 端部署 Fast DDS。

目前 AP 已经集成了 DDS 协议，CP 从 R22-11 开始也引入了 DDS 内容。所以后面部署的方案将会有更多的选择。

