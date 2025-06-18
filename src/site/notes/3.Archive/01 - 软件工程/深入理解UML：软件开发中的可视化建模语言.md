---
{"dg-publish":true,"dg-path":"01 - 软件工程/深入理解UML：软件开发中的可视化建模语言.md","permalink":"/01 - 软件工程/深入理解UML：软件开发中的可视化建模语言/","created":"2025-04-02T11:34:03.058+08:00","updated":"2025-06-04T11:20:20.887+08:00"}
---

#Innolight

作为程序猿都最好掌握的一门语言，那就是 UML（**Unified Modeling Language**），统一建模语言（UML）是软件工程领域中一种通用的开发建模语言，旨在提供一种可视化系统设计的标准方法。是开发人员、系统设计人员交流的有效工具。今天来分享一下 UML 的一些体会，如有错误请帮忙指正。

> [!NOTE]
> 注：UML 工具有很多，本文描述的基于Enterprise Architect。

# UML 前世今生

UML 时间进化线：

![Pasted image 20250402113600.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250402113600.png)

说到 UML 不得不提的三位大神，Grady Booch、Jacobson、James Rumbaugh，三位是 UML 的创始人，均为软件工程界的权威，除了著有多部软件工程方面的著作之外，在对象技术发展上也有诸多杰出贡献，其中包括 Booch 方法、对象建模技术（OMT）和 Objectory（OOSE）过程。三人被合称为“UML 三友”。

**面向对象编程方法以及描述符号进化历史：  

![Pasted image 20250402113639.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250402113639.png)

然后逐步发展到 UML2.5 标准。

UML 目前的官方组织是 https://www.uml.org

# 宏观看 UML

UML 用图去描述一个软件系统，从需求、设计、到部署的方方面面都已经覆盖。那么从总体上先来看看 UML 有哪些图呢？

从描述系统建模目的，UML 图可以分成下面 4 大类：

![Pasted image 20250402113731.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250402113731.png)

从建模的动态视角/静态视角，可以这样去分类：

![Pasted image 20250402113744.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250402113744.png)

# 微观看 UML

UML 由基本的组成可以从三大块去了解：**事物/关系/图**

## 事物（Things）

- 构件事物：UML 模型的静态部分，描述概念或物理元素
	- 类：具有相同属性相同操作 相同关系相同语义的对象的描述
	- 接口：描述元素的外部可见行为，即服务集合的定义说明
	- 协作：描述了事物间的相互作用的集合
	- 用例：代表一个系统或系统的一部分行为，是一组动作序列的集合
	- 构件：系统中物理存在，可替换的部件
	- 节点：运行时存在的物理元素
	- 另外，参与者、信号应用、文档库、页表等都是上述基本事物的变体
- 行为事物：UML 模型图的动态部分，描述跨越空间和时间的行为
	- 状态机：描述事物或交互在生命周期内响应事件所经历的状态序列
	- 交互：实现某功能的一组构件事物之间的消息的集合，涉及消息、动作序列、链接
- 分组事物：UML 模型图的组织部分，描述事物的组织结构
- 注释事物：UML 模型的解释部分，用来对模型中的元素进行说明，解释

## 关系（Relationship）

下面是 UML 的基础 4 大关系：

- 实现（realization）是类元之间的语义关系，其中的一个类元指定了由另一个类元保证执行的契约
- 泛化（generalization）是一种特殊/一般的关系。也可以看作是常说的继承关系
- 关联（association）是一种结构关系，它指明一个事物的对象与另一个事物的对象间的联系
- 依赖（dependency）是两个事物之间的语义关系，其中一个事物(独立事物)发生变化，会影响到另一个事物(依赖事物)的语义

更为详细的描述，看看下面这些表吧：

![Pasted image 20250402114018.png|500](/img/user/0.Asset/resource/Pasted%20image%2020250402114018.png)

![Pasted image 20250402114025.png|500](/img/user/0.Asset/resource/Pasted%20image%2020250402114025.png)

![Pasted image 20250402114034.png|500](/img/user/0.Asset/resource/Pasted%20image%2020250402114034.png)

![Pasted image 20250402114045.png|500](/img/user/0.Asset/resource/Pasted%20image%2020250402114045.png)

![Pasted image 20250402114053.png|500](/img/user/0.Asset/resource/Pasted%20image%2020250402114053.png)

## 图（Diagram）

- 用例图/Use Case Diagram：用于描述系统的参与者与用例间的关系
- 类图/Class Diagram：类图以反映类的结构（属性、操作）以及类之间的关系为主要目的，描述了软件系统的逻辑结构，是一种静态建模方法
- 对象图/Object Diagram：描述系统类在某个时刻的具体实例化情况，类似系统某时刻对象角度的快照
- 序列图/Sequence Diagram：描述对象间动态行为在一段时间的行为序列
- 时序图/Timing Diagram：描述对象在时间维度的动态行为
- 通讯图/Communication Diagram：类似序列图，相对序列图强调时间维度，通讯着重描述协作的逻辑关系
- 相互作用概视图/Interaction Overview Diagram：系统高层级的交互描述，可以引用其他序列图、时序图、通讯图、以及交互概视图
- 复合结构图/Composite Structure Diagram：复合结构图反映了类，接口或组件（及其组件）的内部协作属性来描述一个功能
- 信息流图/Info Flow Diagram：描述信息在对象间、构件、包、参与者之间的流向
- 状态机图/State Machine Diagram：用于描述元素在不同状态间如何迁移的逻辑联系
- 活动图/Activity Diagram：常用于描述系统级行为的实现建模。需要考虑多种因素：逻辑条件、并发、中断、数据访问等等
- 封装图/包图/Package Diagram：包图描绘了将模型元素组织到包中以及它们之间的依赖关系（包括包导入和包扩展等）。它们还提供相应命名空间的可视化。
- 构件图/Component Diagram：用于高层级描述系统的组成构件，以及构件间的依赖关系
- 部署图/Deployment Diagram：描述系统的部署方式（如何部署、部署在什么环境、硬件环境、软件环境等等）
- .....

### 用例图

![Pasted image 20250402135349.png|500](/img/user/0.Asset/resource/Pasted%20image%2020250402135349.png)

- 参与者/Actor：图中的小人，表示系统的用户，如人/机器/内部的其他子系统/硬件等
- 用例/Use Case：图中的椭圆框及描述，描述参与者与系统交互所实现的工作内容经常会配合附加文本进行详细描述
- 边界/Boundary：方框，描述框里的都是属于建模对象里的东东，建模的时候可以方便识别与其他系统交互的接口

用例图在 UML 语言中处于至关重要的位置，所谓 4+1 架构设计，用例图用于描述系统需求，处于核心位置。属于 Use-case drivering 大法的心脏。  

![Pasted image 20250402135427.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250402135427.png)

### 类图/Class Diagram

![Pasted image 20250402135451.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250402135451.png)

这个类图描述一个图像管理系统。

### 对象图/Object Diagram

![Pasted image 20250402135508.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250402135508.png)

描述一个图书管理系统某时刻对象的快照。

### 序列图/Sequence Diagram

![Pasted image 20250402135519.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250402135519.png)

此图说明了在交互中满足视图历史用例所需的对象。对象之间的消息流为用户提供了事务历史信息。描述图书管理系统如何查阅历史的操作系列，反应了客户端与各对象间消息传递关系。

### 时序图/Timing Diagram

这个类似于芯片的时序图概念。下图描述用户在有卡/无卡对系统访问的时间线场景图：

![Pasted image 20250402135538.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250402135538.png)

### 通讯图/Communication Diagram

![Pasted image 20250402135559.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250402135559.png)

这是一个嵌入式系统的 UML 建模，该图描述一个压力控制系统两个主要用例的实现：

- 压力控制循环，上面的数字以及箭头表示消息传递流向
- 通过 HMI 设置压力

### 交互概视图/Interaction Overview

![Pasted image 20250402135629.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250402135629.png)

描述了一个图书管理系统如何从订单发起后的所有交互概要图，每个子图上面的 ref 表示引用了一个更详细的图，比如 Add to Shopping Basket 放入购物篮的具体动作：

![Pasted image 20250402135645.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250402135645.png)

### 复合结构图/Composite Structure

![Pasted image 20250402135700.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250402135700.png)

### 状态机图/State Machine Diagram

![Pasted image 20250402135712.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250402135712.png)

这是描述图书订购系统如何登录的状态机图

### 活动图/Activity Diagram

- 常见的活动图

![Pasted image 20250402135731.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250402135731.png)

- 带泳道活动图

![Pasted image 20250402135908.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250402135908.png)

将活动分组，明确该组活动负责的对象，对象负责该组的全部活动

#### 子活动图

![Pasted image 20250402135925.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250402135925.png)

活动图中，某几个活动可以组成一个内聚的子活动。

#### 可中断活动图

![Pasted image 20250402140000.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250402140000.png)

这里的中断并不严谨，本图中表示这个活动事物是可以取消的。

### 封装图/包图/Package Diagram

![Pasted image 20250402140024.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250402140024.png)

### 构件图/ Component Diagram

![Pasted image 20250402140038.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250402140038.png)

用以描述构件之间的相互关系。

### 部署图/Deployment Diagram

![Pasted image 20250402140054.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250402140054.png)

# 总结一下

本文走马观花的将 UML 大致梳理了一下，并结合EA的例图，将常见的 UML 图的作用大致描述一遍，供大家参考。对于软件开发人员而言，UML 还是很有必要学习掌握的。