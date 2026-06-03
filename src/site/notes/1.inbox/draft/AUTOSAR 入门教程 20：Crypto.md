---
{"dg-publish":true,"permalink":"/1.inbox/draft/AUTOSAR 入门教程 20：Crypto/","dg-note-properties":{"slug":"autosar-crypto","author":"吉人","created":"2025-04-26","source":null}}
---

> 理解加密栈三层架构的职责划分，掌握 CSM 的 Job 配置流程和 CryIf 的原语映射机制，了解密钥管理的关键概念。

车载通信安全不是"加上 HTTPS 就够了"。CAN 总线上的每一帧报文都可能被截获和伪造，诊断通道的固件刷写需要防篡改验证，密钥材料的安全存储需要硬件隔离。在 [[3.wiki/AUTOSAR\|AUTOSAR]] 的信息安全框架中，加密栈（Crypto Stack）提供了从密钥管理到加密运算的完整服务链。它与 SecOC（教程 19 已详细介绍）紧密配合——SecOC 负责为消息添加认证信息，加密栈负责底层的加密计算。

![autosar-crypto-stack-layers.png\|AUTOSAR 加密堆栈分层架构\|650](/img/user/0.asset/media/autosar-crypto-stack-layers.png)

## 三层架构与职责划分

加密栈分为三层，每层有明确的职责边界：CSM（Crypto Service Manager）位于服务层，面向应用提供标准化的加密 API，应用通过 Job 概念访问加密服务；CryIf（Crypto Interface）位于 ECU 抽象层，管理加密原语到具体驱动的映射，屏蔽软件加密库和硬件 HSM 的差异；CryDrv（Crypto Driver）位于 MCAL 层，执行实际的加密运算，可以是纯软件实现也可以是硬件驱动。

### CSM 的 Job 配置流程

应用使用加密服务的入口是 Job。一个 Job 的配置流程：在 CryIf 中定义 Crypto Primitive（指定算法类型和模式），创建 CryIf Channel（将 Primitive 绑定到驱动通道），配置 CSM Job（关联 Channel 并设置执行模式和优先级），最后应用通过 Job ID 调用 CSM API。

CSM 为每个加密服务定义了三种操作阶段：**START** 初始化新操作，设定算法参数和密钥；**UPDATE** 输入待处理的数据，可多次调用处理大数据流；**FINISH** 结束操作，获取最终结果。这种三阶段设计支持流式处理——对于大文件哈希，不必一次性将全部数据加载到内存。

以哈希计算为例，完整的调用流程：

```c
/* 阶段 1：启动哈希操作 */
Csm_SignEncrypt(JobId, CRYPTO_OPERATIONMODE_START, NULL, 0, NULL, NULL);

/* 阶段 2：分块输入数据 */
Csm_SignEncrypt(JobId, CRYPTO_OPERATIONMODE_UPDATE, data_chunk_1, len_1, NULL, NULL);
Csm_SignEncrypt(JobId, CRYPTO_OPERATIONMODE_UPDATE, data_chunk_2, len_2, NULL, NULL);

/* 阶段 3：完成并获取哈希结果 */
Csm_SignEncrypt(JobId, CRYPTO_OPERATIONMODE_FINISH, NULL, 0, result_ptr, &result_len);
```

### CryIf 的原语映射机制

CryIf 的核心职责是将 CSM 下发的 Job 转换为底层驱动能理解的调用。CSM 的 Job 描述的是"我要什么服务"（如签名、哈希、加密），底层驱动提供的是具体的加密算法实现。CryIf 维护一张映射表，将 CSM 的服务类型和算法标识翻译成底层驱动的 API 调用和参数。

CryIf 还负责密钥管理的中间层工作。CSM 通过 Job 引用密钥 ID，CryIf 将密钥 ID 映射到具体驱动的密钥槽位（Key Slot）。应用代码不直接接触密钥材料——应用只知道"使用密钥 `#3`"，不知道密钥 `#3` 存在 HSM 的哪个槽位、实际值是什么。

## HSM 与密钥管理

### HSM 硬件安全模块

HSM（Hardware Security Module）是加密栈的硬件信任锚。它提供隔离的密钥存储、安全启动和加密加速三方面能力。Bosch HSM 是车载 ECU 中最广泛使用的架构，内置于 MCU 中，与主 CPU 物理隔离。HSM 的密钥槽位数量有限（常见 16-64 个），每个槽位有独立的访问权限配置。密钥材料永远不离开 HSM——主 CPU 只能通过 Job ID 请求加密操作，HSM 内部完成计算后只返回结果。

HSM 还支持安全启动（Secure Boot）：在 ECU 启动时，HSM 通过信任链验证固件完整性。Bootloader 阶段先用 CorTst 验证处理器核心（教程 22 会介绍），再用 HSM 验证固件签名——两个模块配合，构成了 ECU 启动阶段的安全基线。

### 密钥生命周期

密钥管理是加密栈中最敏感的部分。一个密钥从生成到销毁经历以下阶段：密钥生成由 HSM 内部随机数生成器产生，密钥材料永远不应离开安全域；密钥导入/导出通过加密传输协议完成，导出时只能以加密形式传输明文密钥；密钥使用时应用通过 CSM Job 引用密钥 ID，HSM 内部完成运算，密钥明文不暴露给 CPU；密钥销毁时 HSM 安全擦除对应槽位，防止通过残余信号恢复。

### 支持的加密服务

CSM 通过统一的 API 接口提供以下加密服务：哈希（SHA-256/384/512）用于数据完整性验证；消息认证码（HMAC/CMAC）用于 SecOC 的消息认证；对称加密/解密（AES-128/256）用于数据机密性保护；非对称签名与验证（RSA/ECDSA）用于固件签名验证和安全启动；随机数生成（TRNG/PRNG）用于密钥生成和 nonce；AEAD 认证加密（AES-GCM）在以太网通信中应用广泛。

## 实践建议

- 密钥槽位规划要前置：HSM 的密钥槽位数量有限，在项目初期就要规划好密钥分配方案。SecOC 的认证密钥、安全启动的验证密钥、TLS 会话密钥各占几个槽位，避免后期不够用时返工
- 同步与异步的选择：硬件 HSM 的加密运算通常较快（AES 加密一个 block 微秒级），同步调用即可。但如果使用 SW Crypto 或运算量大的非对称算法（RSA-2048 签名可能需要数百毫秒），应使用异步模式避免阻塞调用任务
- 安全启动优先集成：加密栈最直接的产出是安全启动。在 Bootloader 阶段用 CorTst 验证处理器核心，用加密栈验证固件签名——两个模块配合，构成了 ECU 启动阶段的安全基线

下一篇教程将进入功能安全测试领域——RamTst 模块如何检测 RAM 硬件故障，以及不同测试算法在覆盖率和执行时间之间的权衡。