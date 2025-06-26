---
{"dg-publish":true,"dg-path":"1 - 汽车电子/S32G CAN_43_LLCE 调试经验总结.md","permalink":"/1 - 汽车电子/S32G CAN_43_LLCE 调试经验总结/","created":"2024-09-02T14:33:57.000+08:00","updated":"2024-09-02T14:51:35.000+08:00"}
---

#CyberUnit

![Pasted image 20240902143611.png|400](/img/user/0.Asset/resource/Pasted%20image%2020240902143611.png)

1. 固件加载

CAN_43_LLCE 是通过单独的 CM0 核进行实现的，所以需要先加载相应的驱动，对应接口为 Llce_Firmware_Load() 函数。

2. 共享内存

![Pasted image 20240902143545.png|650](/img/user/0.Asset/resource/Pasted%20image%2020240902143545.png)

Host 和 LLCE 之间是通过共享内存通信的，固件的加载状态，发送的命令等都是通过共享内存进行交互的，分别对应 Llce_Mgr_Status 和 Can_SharedMemory。这两个变量通过链接文件的指定其对应的内存空间。G2 和 G3 的内存空间是有差异的。以下为 G2 版本的链接文件指定方式：

```
MEMORY
{
	LLCE_CAN_SHAREDMEMORY   : ORIGIN = 0x43800000 , LENGTH = 0x3C800
	LLCE_BOOT_END           : ORIGIN = 0x4383C8A0 , LENGTH = 0x50
	LLCE_MEAS_SHAREDMEMORY  : ORIGIN = 0x4384FFDF LENGTH = 0x20
}

SECTIONS
{
    .llce_boot_end                             ALIGN(4)       : > LLCE_BOOT_END 
    .can_43_llce_sharedmemory                  ALIGN(4)       : > LLCE_CAN_SHAREDMEMORY
    .llce_meas_sharedmemory                    ALIGN(4)       : > LLCE_MEAS_SHAREDMEMORY
}
```

除了链接文件，还要注意将这两个变量放到对应的内存段。Llce_Mgr_Status 在提供的静态代码中已经指定：

``` c
/* This variable contains information about fw boot end */

__attribute__((section(".llce_boot_end"))) volatile Llce_Mgr_StatusType Llce_Mgr_Status;
```

Can_SharedMemory 变量的指定需要注意以下，如果按照标准的开发流程，应该是通过相应模块的 memap 进行配置，我这里直接修改了相应的静态代码来指向对应的内存段：

``` c
#define CAN_43_LLCE_START_SEC_SHAREDMEMORY
#include "Can_43_LLCE_MemMap.h"
#pragma ghs section bss=".can_43_llce_sharedmemory"
static volatile Llce_Can_SharedMemoryType Can_SharedMemory;
#pragma ghs section
#define CAN_43_LLCE_STOP_SEC_SHAREDMEMORY
#include "Can_43_LLCE_MemMap.h"
```
