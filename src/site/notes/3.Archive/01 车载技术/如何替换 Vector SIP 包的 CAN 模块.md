---
{"dg-publish":true,"dg-path":"01 车载技术/如何替换 Vector SIP 包的 CAN 模块.md","permalink":"/01 车载技术/如何替换 Vector SIP 包的 CAN 模块/"}
---

#AUTOSAR

![Pasted image 20240730132932.png|650](/img/user/0.Asset/resource/Pasted%20image%2020240730132932.png)

Vector SIP 包中包含了 MCAL 层的 CAN 模块，所以如果是和芯片完全匹配的 SIP 包，就可以直接在 DaVinci Configurator 中完成所有 CAN 相关的配置。

有时候我们想用同系列的芯片来复用 SIP 包，但是 CAN 模块不完全兼容，或者像 S32G 芯片中通过 LLCE 的 CAN 来收发的时候，就可以通过开发自己的 CDD 模块来实现 CAN 模块的替换，通过调用 CanIf 层的相应接口就可以实现整个数据流的回调。但是在 DaVinci Configurator 的配置过程我们依然需要将 CAN 配置起来，因为 CanIf 层有很多配置项需要引用 CAN 模块 HOH 等相关信息，除此以外 BswM，OS 模块等也会依赖其中的信息。

如果抛开 SIP 包授权的角度，除了与硬件耦合的 OS 模块，SIP 包的其他模块皆可复用。