---
{"dg-publish":true,"dg-path":"车载技术/NvM 模块架构指南.md","permalink":"/车载技术/NvM 模块架构指南/","created":"2024-02-29T10:33:35.000+08:00","updated":"2025-04-02T15:27:04.772+08:00"}
---

#Technomous #AUTOSAR 

NVM 在 AUTOSAR 中的架构层次架构如下所示。

![Pasted image 20240229103924.png|650](/img/user/0.Asset/resource/Pasted%20image%2020240229103924.png)

分别是 Memory Service（NvM）、Memory Hardware Abstraction（Memory If 和 Fee/Fa）和 Memory Driver（Fls/Eep 驱动），单独拎出来就是这样的。

![Pasted image 20240229104354.png|350](/img/user/0.Asset/resource/Pasted%20image%2020240229104354.png)

其中 FEE （Flash EEPROM Emulation），即 Flash 模拟 EEPROM，属于片内存储。EA（EEPROM Abstraction），即 EEPROM，属于片外存储。片内存储是用芯片内部的 DFLASH 进行数据存储，外部存储是通过外部 EEPROM 进行存储，一般会调用 SPI、IIC 等通信方式外挂 EEPROM 芯片。

![Pasted image 20240229150017.png|350](/img/user/0.Asset/resource/Pasted%20image%2020240229150017.png)
