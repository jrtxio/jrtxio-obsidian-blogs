---
{"dg-publish":true,"dg-path":"文章/2022-08-08 SWC 的 Internal Behavior 的一些理解.md","permalink":"/文章/2022-08-08 SWC 的 Internal Behavior 的一些理解/"}
---

#Ofilm 

Internal Behavior 中包含了 Port Access，它的作用在于创建 Runnable，Runnable 的参数是从 PortPrototypes 引入的。也就是说 Port 的类型只是作为 Runnable 的一个参数引入的。

Events 可以是 Runnable 的事件类型，是初始化事件还是周期事件，或者从 PortPrototypes 引入数据接收事件。