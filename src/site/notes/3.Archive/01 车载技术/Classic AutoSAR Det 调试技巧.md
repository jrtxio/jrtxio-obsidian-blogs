---
{"dg-publish":true,"dg-path":"01 车载技术/Classic AutoSAR Det 调试技巧.md","permalink":"/01 车载技术/Classic AutoSAR Det 调试技巧/","created":"2024-08-12T19:00:40.000+08:00","updated":"2025-02-14T13:55:56.423+08:00"}
---

#CyberUnit #AutoSAR

# 配置 Det 模块

配置 Det 模块分为两个部分：

1. 添加 Det 模块本身
2. 各模块的 Det 检测开关

# 添加打桩函数

我们可以选择不使用 Dlt，直接通过串口打印错误信息。

在 det.c 中找到 Det_ReportError() 这个函数，该函数的 4 个参数 ModuleId，InstanceId，ApiId，ErrorId 是 DET 最重要的信息。在该函数中打桩，将错误信息通过串口传出去：

``` c
void Det_ReportError(uint16 ModuleId, uint8 InstanceId, uint8 ApiId, uint8 ErrorId)
{
	PrintStr("==ModuleId:%d InstanceId:%d ApiId:%d ErrorId:%d====\r\n", ModuleId, InstanceId, ApiId, ErrorId);
}
```

# 破译错误信息

![Pasted image 20241118112424.png|650](/img/user/0.Asset/resource/Pasted%20image%2020241118112424.png)

## ModuleId

在 AUTOSAR 架构里面，每个模块 ID 都是标准定义的，可以参考 AUTOSAR_TR_BSWModuleList.pdf 文件。根据下表可以知，ModuleId=51 对应模块就是 PDUR。

![[AUTOSAR_TR_BSWModuleList.pdf]]

## ErrorId

其实 ErrorId 也是标准定义的，也可以在各个模块的标准内找到定义，但我们也可以用更便捷的方法：

1. 打开 PUDR 模块的源码，找到 Det_ReportError 函数的所有调用，随便找到一个即可：

![Pasted image 20241118112904.png|650](/img/user/0.Asset/resource/Pasted%20image%2020241118112904.png)

2. 然后顺藤摸瓜，找到定义 PDUR_E_INVALID_REQUEST 的 .h 文件

![Pasted image 20241118113021.png|650](/img/user/0.Asset/resource/Pasted%20image%2020241118113021.png)

3. 我们是顺着 PDUR_E_INVALID_REQUEST 这个值点进来的，但是我们本例中的 ErrorId 是 2，是下面的 PDUR_E_PDU_ID_INVALID，这个宏定义和注释已经足够明确了，如果还不满足的话就在 PDUR 模块下搜索所有 PDUR_E_PDU_ID_INVALID。

![Pasted image 20241118113253.png](/img/user/0.Asset/resource/Pasted%20image%2020241118113253.png)

4. 搜索到 31个结果，这样显然是大海捞针，所以继续使用其他参数来进一步筛选。

## InstanceId

用上面同样的方法，找到 InstanceId = 50。

![Pasted image 20241118113420.png|650](/img/user/0.Asset/resource/Pasted%20image%2020241118113420.png)

找到 InstanceId = 50 且 ErrorId 是 2 的出处：

![Pasted image 20241118113751.png|650](/img/user/0.Asset/resource/Pasted%20image%2020241118113751.png)

很明显就是这句话了，这就是产生 DET 的报错信息的代码，结合函数上下文就能对故障分析个大概了。如果还不够，就借助劳特巴赫等调试工具来定位问题：

![Pasted image 20241118114018.png|650](/img/user/0.Asset/resource/Pasted%20image%2020241118114018.png)