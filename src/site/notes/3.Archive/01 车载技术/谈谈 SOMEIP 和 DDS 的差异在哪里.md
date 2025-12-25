---
{"dg-publish":true,"dg-path":"01 车载技术/谈谈 SOMEIP 和 DDS 的差异在哪里.md","permalink":"/01 车载技术/谈谈 SOMEIP 和 DDS 的差异在哪里/"}
---

#Ofilm #SOMEIP 

SOMEIP 和 DDS 都是自动驾驶上用的最多两类通信中间件。两者的共同点主要有：都是面向服务的通信协议；都采用了"以数据为中心"的发布和订阅模式。

从应用场景角度来看，SOMEIP 比较偏向于车载网络，且只能在基于网络层为 IP 类型的网络环境中使用，而 DDS 在传输方式上没有特别的限制，对基于非 IP 类型的网络，如共享内存、跨核通讯、PCI-e 等网络类型都可以支持。而且，DDS 也有完备的车辆网解决方案，其独有的 DDS Security，DDS Web 功能可为用户提供车-云-移动端一站式的解决方案。

下表针对 SOME/IP 和 DDS 的主要差别进行了汇总：

|                       | SOME/IP                   | DDS                                     |
| --------------------- | ------------------------- | --------------------------------------- |
| Communication Pattern | SOA                       | 面向数据的发布订阅                               |
| API                   | 规范本身不定义 API，通过 AUTOSAR 规范 | 有多种编程语言的 API 规范，C++/Java 等              |
| Network Transports    | UDP/TCP                   | UDP/TCP/Shared Memory 支持自定义物理通道，比如 PCIe |
| Approach to Security  | 规范本身没有定义，可以架于 TLS/DTLS 之上 | DDS Security 规范，支持细粒度的安全规则              |
| QoS                   | 依赖于 UDP/TCP               | 丰富的 QoS 策略，不依赖于底层通信媒介                   |
| 应用场景                  | 汽车行业                      | 工业，航空，汽车等                               |

