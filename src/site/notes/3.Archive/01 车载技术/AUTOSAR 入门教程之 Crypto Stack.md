---
{"dg-publish":true,"dg-path":"01 车载技术/AUTOSAR 入门教程之 Crypto Stack.md","permalink":"/01 车载技术/AUTOSAR 入门教程之 Crypto Stack/","created":"2025-07-08T10:13:43.460+08:00","updated":"2025-07-08T10:19:23.718+08:00"}
---

#Innolight #AutoSAR 

在这篇文章中，我将讨论 AUTOSAR 中的 Crypto Stack，它负责向应用程序提供加密服务。Crypto Stack 由 CSM（加密服务管理器）、CryIf（加密抽象层）和软件/硬件加密驱动程序组成。

![Pasted image 20250708101427.png](/img/user/0.Asset/resource/Pasted%20image%2020250708101427.png)

加密服务管理器（CSM）是一个服务层模块，为应用程序提供标准接口，以访问软件/硬件加密驱动器提供的基本加密服务。这些服务可以通过同步方式（服务在函数返回时完成）或异步方式（服务完成后调用回调例程）被应用程序访问。

Crypto Interface（CryIf）是一个 ECU 抽象层模块，它将 CSM 提供的低级软件/硬件驱动服务进行抽象，以便 CSM 能够向应用程序提供标准化的接口。

Crypto Driver 是一个 MCAL 模块，它为加密服务提供了实现。它可以是一个软件模块，也可以是一个硬件模块。硬件也用于提供该功能，但通常通过 SPI Handler 来访问。

AUTOSAR 中的 Crypto Stack 可用于提供 HASH、MAC、加密/解密、带关联数据的认证加密、签名、安全计数器、随机数和密钥管理接口。

我将从服务层解释 HASH 服务的使用方式：配置 HASH 接口以使用 SHA256/SHA384/SHA512（还有许多其他 HASH 算法）是在 CSM 模块中通过将 crypto 原语（驱动中的 Crypto 对象）配置为 SHA256/SHA384/SHA512 来完成的，这个配置对象是指向原语的作业（配置对象）。然后，通过一个通用接口并使用作业 ID 作为参数来引用 CSM 层中的这个作业。作业的 CSM 密钥、通道、队列、优先级和作业类型（同步或异步）也都会被定义。

CSM 为加密服务定义了不同的操作。这些操作包括 START、UPDATE 和 FINISH。START 操作定义了一个具有新初始化参数的新操作。UPDATE 操作需要输入数据，并可以提供中间结果。FINISH 操作表示数据结束和操作完成。

当对数据块执行 HASH 算法时，操作被作为输入参数传递给 Csm_Hash 函数（START UPDATE FINISH）。如果数据不是一次性完整提供作为输入，Csm_Hash 可以多次调用，操作为 UPDATE，然后调用 FINISH 操作以获取最终结果。