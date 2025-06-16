---
{"dg-publish":true,"dg-path":"汽车电子/NXP S32G 以太网加速模块（PFE）简介.md","permalink":"/汽车电子/NXP S32G 以太网加速模块（PFE）简介/","created":"2024-06-26T10:30:51.000+08:00","updated":"2025-04-02T14:31:08.000+08:00"}
---


#CyberUnit

> 随着汽车电子的飞速发展，ADAS 系统、5G 技术和越来越多的 ECU 被集成到汽车电子系统中。这些系统需要的通讯带宽正与日俱增，传统车用通信技术逐渐无法满足需求。在此背景下，车载以太网技术正逐渐成为下一代车用通信技术的主要方案。

车载以太网相对传统以太网在安全性、实时性及可靠性上有更高的要求，同时需要与传统汽车通信技术间有一定的互操作性。NXP 根据下一代汽车通信系统的特性推出的 S32G 系列 SOC 针对车载通讯技术进行优化，并集成了以太网与传统汽车通信加速模块。

本文将简要介绍 S32G 以太网加速模块的功能和典型应用，后续连载文章将演示在 SEED-S32G 开发套件上对 PFE 各功能进行配置和测试。同时，SEED-S32G 开发套件在接口上与 NXP S32G-VNP-RDB2 兼容。

![Pasted image 20240626103149.png|450](/img/user/0.Asset/resource/Pasted%20image%2020240626103149.png)

# S32G 传统汽车通讯加速模块 - LLCE

**LLCE：LOW LATENCY COMMUNICATIONS ENGINE**

- 16x CAN（CAN2.0/CAN-FD）
- 4x LIN
- 1x FlexRay
- 4x SPI
- 4x Cortex-M0（运行NXP固件）
- CAN to CAN 路由
- CAN to 以太网路由
- 直接与硬件安全模块互相传输数据

![Pasted image 20240626103513.png|450](/img/user/0.Asset/resource/Pasted%20image%2020240626103513.png)

# S32G 以太网接口和加速模块

- **S32G支持4个以太网MAC**
	- 3 个接口集成在 PFE
	- 1 个标准以太网接口（GMAC）
- **S32G274A IO复用支持**
	- 4 个 MAC 可同时使用
	- 最多 3 个 RGMII/RMII/MII 接口（可以选择复用到任何 MAC）
	- 最多 4 个 SGMII 接口，支持 1 Gbps 和 100 Mbps （PFE_MAC0 可支持 2.5 Gbps）

S32G 集成 PFE（Packet Forwarding Engine）模块支持以太网包的转发、修改、分类等功能，它基于已在 NXP Layerscape 系列处理器上验证的解决方案，仅需使用 CPU 转发 33% 的功耗，就可从主机 CPU 完全 offload 网络转发相关负载。

![Pasted image 20240626104118.png|450](/img/user/0.Asset/resource/Pasted%20image%2020240626104118.png)

PFE 拥有 4 个主机接口（HIF）和 3 个 MAC 接口，多个不同的主机或虚拟机可同时通过不同 HIF 使用 PFE 的网络连接。它还可与其他模块配合实现更多高级功能，例如与 LLCE 模块配合可在没有主机参与的情况下实现以太网和传统车载通信技术间的包路由与包转发，与 HSE 模块配合可无需主机参与实现数据包加解密。

![Pasted image 20240626104419.png|450](/img/user/0.Asset/resource/Pasted%20image%2020240626104419.png)

# PFE 典型应用

- **Pv4/IPv6路由**
PFE_MAC1 与 PFE_MAC2 间与配置的路由表匹配的流量将由 PFE 直接转发（快速路径），其他流量被转发到主机 CPU（慢速路径）。

![Pasted image 20240626104601.png|450](/img/user/0.Asset/resource/Pasted%20image%2020240626104601.png)

- **数据路径端点**
	- 3 个主机可通过各自的逻辑接口访问 PFE_MAC
	- CPU1 运行主驱动，其他 CPU 运行从驱动
	- 可配置从端点 1、2、3 接收到的流量转发到哪个 HIF
	- 可配置端点 4、5、6 的流量转发到哪个 MAC

![Pasted image 20240626104728.png|450](/img/user/0.Asset/resource/Pasted%20image%2020240626104728.png)

- **VLAN交换机**
主机仅可访问自身所在 VLAN，不同 VLAN 间通过加入了两个 VLAN 的主机路由。

![Pasted image 20240626104803.png|450](/img/user/0.Asset/resource/Pasted%20image%2020240626104803.png)

- **PFE IPsec**
PFE_MAC0 和 PFE_MAC1 间的流量将自动通过 HSE 加解密后由 PFE 转发。

![Pasted image 20240626104901.png|450](/img/user/0.Asset/resource/Pasted%20image%2020240626104901.png)

NXP 官方参考文档：

![[TP-TD-AUT236.pdf]]