---
{"dg-publish":true,"dg-path":"文章/UDS 诊断 0x19 服务实现分析.md","permalink":"/文章/UDS 诊断 0x19 服务实现分析/","dgEnableSearch":"true","created":"2020-04-10T15:56:23.000+08:00","updated":"2023-11-17T15:56:23.000+08:00"}
---

#BDStar #UDS 

1. 首先弄清楚故障产生后是如何存储 DTC？
2. 搞清楚存储的 DTC 是如何读取的？

每一个 DTC 都有一个字节的状态位（DTC Status Byte），字节的每一个 bit 位都有各自的含义。如下表所示：

| Bit   | Indication |
| ----- | ---------- |
| Bit 0  | testFailed |
| Bit 1 |   testFailedThisMonitoringCycle         |
| Bit 2 |  pendingDTC          |
| Bit 3 |  confirmedDTC          |
| Bit 4 |    testNotCompletedSinceLastClear        |
| Bit 5 |    testFailedSinceLastClear        |
| Bit 6 | testNotCompletedThisMonitoringCycle           |
| Bit 7      | warningIndicatorRequested           |
 
- Bit0 testFailed
通常来说，ECU 内部以循环的方式不断地针对预先定义好的错误路径进行测试，如果在最近的一次测试中，在某个错误路径中发现了故障，则相应 DTC 的这一个状态位就要被置1，表示出错。此时 DTC 的 testFailed 位被置1，但是它不一定被 ECU 存储到 non-volatile memory 中，只有当 pendingDTC 或 confirmedDTC 被置1时 DTC 才会被存储。而 pendingDTC 或 confirmedDTC 被置1的条件应该是检测到错误出现的次数或时间满足某个预定的阈值。当错误小时或者诊断仪执行了清除 DTC 指令时，testFailed 会再次被置为0。

- Bit2 pendingDTC
根据规范的解释，pendingDTC = 1表示某个 DTC 在当前或者上一个 operation cycle 中是否出现过。pendingDTC 位其实是位于 testFailed 和 confirmedDTC 之间的一个状态，有的 DTC 被确认的判定条件比较严苛，需要在多个 operation cycle 中出现才可以被判定为 confirmed 的状态，此时就需要借助于 pendingDTC 位了。pendingDTC = 1的时候，DTC 就要被存储下来了，如果接下来的两个 operation cycle 中这个 DTC 都还存在，那么 confirmedDTC 就要置1了。如果当前 operation cycle 中，故障发生，pendingDTC = 1，但是在下一个 operation cycle 中，故障就没有了，pendingDTC 仍然为1，再下一个 operation cycle 中，故障仍然不存在，那么 pendingDTC 就可以置0了。

- Bit3 confirmed DTC 
当 confirmedDTC = 1时，则说明某个 DTC 已经被存储到 ECU 的 non-volatile memory 中，说明这个 DTC 曾经满足了被 confirmed 的条件。但是请注意，confirmedDTC = 1时，并不意味着当前这个 DTC 仍然出错，如果 confirmedDTC = 1，但 testFailed = 0，则说明这个 DTC 表示的故障目前已经消失了。将 confirmedDTC 重新置0的方法只有删除 DTC，UDS 用0x14服务，OBD 用0x04服务。
DTC 功能列表

**源码中的 DTCStatus 和 SupportedDTC 位置一定要对应。**