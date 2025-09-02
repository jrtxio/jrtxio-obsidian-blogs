---
{"dg-publish":true,"dg-path":"automotive/Classic AutoSAR SecOC 配置指南.md","permalink":"/automotive/Classic AutoSAR SecOC 配置指南/","created":"2024-02-29T09:46:12.000+08:00","updated":"2024-11-19T13:49:57.348+08:00"}
---

#Technomous #AutoSAR

# 模块介绍

在车载网络中，CAN 总线作为常用的通讯总线之一，其大部分数据是以明文方式广播且无认证接收。这种方案具有低成本、高性能的优势，但随着汽车网联化，智能化的业务需要，数据安全性被大家越来越重视。传统的针对报文添加 RollingCounter 和 Checksum 的信息，实现的安全性十分有限。

在 AUTOSAR 架构中对于网络安全的机制，有 E2E（End to End）保护，另外还有 SecOC（Secure Onboard Communication），主要实现对车内敏感信息进行认证。

SecOC 是在 AUTOSAR 软件包中添加的信息安全组件，该特性增加了加解密运算，密钥管理，新鲜值管理和分发等一系列功能和新要求。SecOC 模块在 PDU 级别上为关键数据提供有效可行的身份验证机制。该规范主要使用带有消息认证码（MAC-Message Authentication Code）的对称认证方法。与不对称方法对比，他们使用更小的密钥实现了相同级别的安全性，并且可以在软件和硬件中紧凑高效地实现。但是，规范提供了两种必要的抽象级别，因此对称和非对称身份验证方法都可使用。由于非对称加密计算量大，目前主要都是采用对称加密。

![Pasted image 20240229101014.png|350](/img/user/0.Asset/resource/Pasted%20image%2020240229101014.png)

目前 iECU3.1 项目的方案如上所示。其中 VSS 和 FVM 是上汽购买的三方库，属于通过软件加解密。当然也可以采用 HSM 实现硬件加解密，当然也是需要付费的。其他模块都是属于 VECTOR 的标准模块。第三方加解密库的头文件是 vssapi.h。

# 配置流程

SecOC 目前是随着导入通信矩阵的 arxml 文件一起生成的。在 arxml 的通信矩阵中，会将需要安全通信的报文添加一些额外的安全配置。

![Pasted image 20240229100236.png|650](/img/user/0.Asset/resource/Pasted%20image%2020240229100236.png)

如下所示，导入之后 DaVinci CFG 中会自动生成 SecOC 的相关内容。不过 SecOC 相关的模块 CSM、CryIf 等依然是需要自己手动配置的。

![Pasted image 20240229102359.png|350](/img/user/0.Asset/resource/Pasted%20image%2020240229102359.png)

可以看到导入通信矩阵的 arxml 之后大多数模块都自动生成出来了。
