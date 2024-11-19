---
{"dg-publish":true,"dg-path":"汽车电子/AUTOSAR EcuM 模块分析.md","permalink":"/汽车电子/AUTOSAR EcuM 模块分析/","created":"2022-07-04T15:44:14.000+08:00","updated":"2024-11-19T11:31:13.142+08:00"}
---

#Ofilm #AUTOSAR 

EcuM 模块负责初始化（Initialize）和反初始化（De-initialize）一些 BSW 模块。AUTOSAR ECU 模式管理分为 Fixed 和 Flexible 两种方式，Fixed 有如下确定的模式：

1. STARTUP
2. RUN
3. POST_RUN
4. SLEEP
5. WAKE_SLEEP
6. SHUTDOWN

Flexible 模式则允许其他的情况，如快速/分部（Fast/Partial）启动、多核管理（Multicore management）等。

另外，EcuM 模块还可以配置 ECU 睡眠模式（Sleep Modes）、下电原因（Shutdown Causes）、复位模式（Reset Modes），管理所有 ECU 唤醒源（Wakeup Sources）。