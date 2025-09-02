---
{"dg-publish":true,"dg-path":"automotive/芯驰 E3 PWM 配置指南.md","permalink":"/automotive/芯驰 E3 PWM 配置指南/","created":"2025-05-27T17:21:33.836+08:00","updated":"2025-06-27T14:40:24.370+08:00"}
---

#Innolight

本文主要是为了讲述 PWM 配置的大致流程，详细教程可参考[AUTOSAR MCAL for SemiDrive E3 功能模块使用介绍：PWM&ICU - 大大通(简体站)](https://www.wpgdadatong.com.cn/blog/detail/71676)文章。

# 使能 EPWM 和 XTRG 模块时钟

首先在 MCU 模块中使能 EPWM 和 XTRG 模块的时钟。

![Pasted image 20250527172801.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250527172801.png)

# 添加 PWM 控制器和通道

先添加 PwmController 和 PwmChannel。

![Pasted image 20250527184517.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250527184517.png)

![Pasted image 20250527184600.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250527184600.png)
# 配置引脚复用功能

首先将相应引脚的复用功能配置为 xTRG_IO。

![Pasted image 20250527172517.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250527172517.png)
# 将 PWM 输出至 xTRG

在 Xtrg 模块中配置将 EPWM 输出至 xTRG 引脚。

![Pasted image 20250527184814.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250527184814.png)