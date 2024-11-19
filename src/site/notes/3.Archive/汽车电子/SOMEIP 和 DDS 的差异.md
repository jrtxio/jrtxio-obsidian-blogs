---
{"dg-publish":true,"dg-path":"汽车电子/SOMEIP 和 DDS 的差异.md","permalink":"/汽车电子/SOMEIP 和 DDS 的差异/","created":"2022-07-18T23:08:07.000+08:00","updated":"2024-11-19T11:22:54.225+08:00"}
---

#Ofilm #SOMEIP 

![Pasted image 20230309154031.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230309154031.png)

SOMEIP 和 DDS 都是自动驾驶上用的最多两类通信中间件。两者的共同点主要有：都是面向服务的通信协议；都采用了"以数据为中心"的发布和订阅模式。

从应用场景角度来看，SOMEIP 比较偏向于车载网络，且只能在基于网络层为 IP 类型的网络环境中使用，而 DDS 在传输方式上没有特别的限制，对基于非 IP 类型的网络，如共享内存、跨核通讯、PCI-e 等网络类型都可以支持。而且，DDS 也有完备的车辆网解决方案，其独有的 DDS Security，DDS Web 功能可为用户提供车-云-移动端一站式的解决方案。