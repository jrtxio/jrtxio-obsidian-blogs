---
{"dg-publish":true,"dg-path":"汽车电子/AUTOSAR DET 调试实战.md","permalink":"/汽车电子/AUTOSAR DET 调试实战/","created":"2024-08-12T19:00:40.000+08:00","updated":"2024-11-18T11:40:48.309+08:00"}
---

#CyberUnit #AutoSAR

# 打开 DET 功能

配置 DET 模块分为两个部分：

1. 添加 DET 模块本身
2. 各模块的 DET 检测开关

# 添加打桩函数

我们可以选择不使用 DLT，直接通过串口打印错误信息。

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

| Module Name                                           | Module ID   |
| ----------------------------------------------------- | ----------- |
| ADC Driver (Adc)                                      | 123 (0x7B)  |
| BSW Mode Manager (BswM)                               | 42   (0x2A) |
| BSW Scheduler (SchM)                                  | 130 (0x82)  |
| CAN Driver (Can)                                      | 80   (0x50) |
| CAN Interface (CanIf)                                 | 60   (0x3C) |
| CAN Network Management (CanNM)                        | 31   (0x1F) |
| CAN State Manager (CanSM)                             | 140 (0x8C)  |
| CAN Transceiver Driver (CanTrcv)                      | 70   (0x46) |
| CAN Transport Layer (CanTp)                           | 35   (0x23) |
| Communication (Com)                                   | 50   (0x32) |
| COM Based Transformer (ComXf)                         | 175 (0xAF)  |
| COM Manager (ComM)                                    | 12   (0x0C) |
| Complex Device Driver (CDD)                           | 255 (0xFF)  |
| Core Test (CoreTst)                                   | 103 (0x67)  |
| Crypto Service Manager (CSM)                          | 110 (0x6E)  |
| Debugging (Dbg)                                       | 57   (0x39) |
| Development Error Tracer (DET)                        | 15   (0x0F) |
| Diagnostic Log and Trace (DLT)                        | 55   (0x37) |
| Diagnostic Over IP (DoIP)                             | 173 (0xAD)  |
| DIO Driver (Dio)                                      | 120 (0x78)  |
| E2E Transformer (E2EXf)                               | 176 (0xB0)  |
| ECU State Manager (EcuM)                              | 10   (0x0A) |
| EEPROM Abstraction (Ea)                               | 40   (0x23) |
| EEPROM Driver (Eep)                                   | 90   (0x5A) |
| Ethernet Driver (Eth)                                 | 88   (0x58) |
| Ethernet Interface (EthIf)                            | 65   (0x41) |
| Ethernet State Manager (EthSM)                        | 143 (0x8F)  |
| Ethernet Switch Driver (EthSwt)                       | 89   (0x59) |
| Ethernet Transceiver Driver (EthTrcv)                 | 73   (0x49) |
| Flash Driver (Fls)                                    | 92   (0x5C) |
| Flash EEPROM Emulation (Fee)                          | 21   (0x15) |
| Flash Test (FlsTst)                                   | 104 (0x68)  |
| FlexRay Autosar Transport Layer (FrArTp)              | 38   (0x26) |
| FlexRay Driver (Fr)                                   | 91  (0x51)  |
| FlexRay Interface (FrIf)                              | 61  (0x3D)  |
| FlexRay ISO Transport Layer (FrTp)                    | 36  (0x24)  |
| FlexRay Network Management (FrNm)                     | 32  (0x20)  |
| FlexRay State Manager (FrSM)                          | 142 (0x8E)  |
| FlexRay Transceiver Driver (FrTrcv)                   | 71   (0x47) |
| Function Inhibition Manager (FiM)                     | 11   (0x0B) |
| GPT Driver (Gpt)                                      | 100 (0x64)  |
| ICU Driver (Icu)                                      | 122 (0x7A)  |
| IO Hardware Abstraction (IOHwAbs)                     | 254 (0xFE)  |
| IPDU Multiplexer (IpduM)                              | 52   (0x34) |
| Large Data COM (LdCom)                                | 49   (0x31) |
| LIN Driver (Lin)                                      | 82   (0x52) |
| LIN Interface (LinIf)                                 | 62   (0x3E) |
| LIN Network Management (LinNm)                        | 63   (0x3F) |
| LIN State Manager (LinSM)                             | 141 (0x8D)  |
| LIN Transceiver Driver (LinTrcv)                      | 64   (0x40) |
| MCU Driver (Mcu)                                      | 101 (0x65)  |
| Memory Abstraction Interface (MemIf)                  | 22   (0x16) |
| Network Management (Nm)                               | 29   (0x1D) |
| NVRAM Manager (NvM)                                   | 20   (0x14) |
| OCU Driver (Ocu)                                      | 125 (0x7D)  |
| Operating System (Os)                                 | 1    (0x01) |
| PDU Router (PduR)                                     | 51   (0x33) |
| Port Driver (Port)                                    | 124 (0x7C)  |
| PWM Driver (Pwm)                                      | 121 (0x79)  |
| RAM Test (RamTst)                                     | 93   (0x5D) |
| Run Time Environment (RTE)                            | 2    (0x02) |
| SAE J1939 Diagnostic Communication Manager (J1939Dcm) | 58   (0x3A) |
| SAE J1939 Network Management (J1939Nm)                | 34   (0x22) |
| SAE J1939 Request Manager (J1939Rm)                   | 59   (0x3B) |
| SAE J1939 Transport Layer (J1939Tp)                   | 37   (0x25) |
| Secure Onboard Communication (SecOC)                  | 150 (0x96)  |
| Service Discovery (Sd)                                | 171 (0xAB)  |
| Socket Adaptor (SoAd)                                 | 56   (0x38) |
| SOME/IP Transformer (SomeIpXf)                        | 174 (0xAE)  |
| SPI Handler / Driver (Spi)                            | 83   (0x53) |
| Synchronized Time-Base Manager (StbM)                 | 160 (0xA0)  |
| TCP / IP Stack (TcpIp)                                | 170 (0xAA)  |
| Time Service (Tm)                                     | 14   (0x0E) |
| Time Sync Over CAN (CanTSyn)                          | 161 (0xA1)  |
| Time Sync Over Ethernet (EthTSyn)                     | 164 (0xA4)  |
| Time Sync Over FlexRay (FrTSyn)                       | 163 (0xA3)  |
| TTCAN Driver (TtCan)                                  | 84   (0x54) |
| TTCAN Interface (TtCanIf)                             | 66   (0x42) |
| UDP Network Management (UdpNm)                        | 33   (0x21) |
| Watchdog Driver (Wdg)                                 | 102 (0x66)  |
| Watchdog Interface (WdgIf)                            | 43   (0x2B) |
| Watchdog Manager (WdgM)                               | 13   (0x0D) |
| XCP (Xcp)                                             | 212 (0xD4)  |

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