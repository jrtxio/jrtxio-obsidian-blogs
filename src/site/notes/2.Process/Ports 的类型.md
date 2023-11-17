---
{"dg-publish":true,"dg-enable-search":"true","dg-path":"文章/Ports 的类型.md","permalink":"/文章/Ports 的类型/","dgEnableSearch":"true","dgPassFrontmatter":true,"created":"2022-07-19T15:42:01.000+08:00","updated":"2023-11-17T15:42:01.000+08:00"}
---

#Ofilm 
1. 作用
Ports 是 SWC 和 SWC 做接口（Interface）通信使用，或者 SWC 通过 RTE 和 BSW 做接口（Interface）通信使用。

2. 分类
![400](/img/user/0.Asset/resource/20230309154122.png)

![500](/img/user/0.Asset/resource/20230309154158.png)

可以分类为 R-Ports、P-Ports 和 PR-Ports。也可以用 Send/Receiver（S/R）接口和 Client/Server（C/S）接口来进行分类。其中 S/R 接口是用来传输数据的；C/S 接口是用来执行操作的。

S/R 接口
S/R 接口用来传输数据，通过 RTE 传输数据，并且通过 RTE 管理数据的传输，避免数据出问题（例如同时调用同一数据时可能出错）。一个接口可以包含多个数据，类似于通过结构体传输。可以传输基础数据类型（int，float 等）和复杂数据类型（record，array 等）。

Rte_Read_<Port>_<Data>()

//这里的 xx 是指的传输的数据内容，比如 DoorOpen 就是：
SWC_DoorOpen = Rte_Read_Door_DoorOpen();
  
C/S 接口
C/S 接口的作用是提供操作。就是 Server 提供函数供 Client 调用。可以**同步**和**异步**，同步就是直接调用，相当于函数直接插入上下文运行；异步的话需要等待，相当于让函数在另一个线程中运行，运行完了再返回，原上下文依然运行。一个接口可以提供多个操作，就是一个接口可以包含很多函数。ECU 内部和跨 ECU 都可以调用，跨 ECU 也是通过外部总线。

Rte_Call_<Port>_<Function>()

//这里的xx是指的调用的函数，比如调用State()就是：

Rte_Call_Door_State();