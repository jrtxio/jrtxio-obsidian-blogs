---
{"dg-publish":true,"dg-path":"01 车载技术/深入解读 SOMEIP 协议.md","permalink":"/01 车载技术/深入解读 SOMEIP 协议/"}
---

#someip

![Pasted image 20230718174405.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230718174405.png)

SOME/IP 是一种用于控制消息的汽车中间件解决方案。它从一开始就被设计为完美适配不同尺寸和不同操作系统的设备，包括像摄像头、AUTOSAR 设备、头部单元或遥测设备等小型设备。同时，确保 SOME/IP 支持信息娱乐领域以及车辆中的其他领域的功能，使得 SOME/IP 可以用于 MOST 替代方案以及更传统的 CAN 方案。

SOME/IP 支持的中间件功能：

- 序列化 - 将数据转换成网络表示形式和从网络表示形式转换回来。
- 远程过程调用（RPC）和消息传递 - 实现远程调用功能以及其他消息传递。
- 服务发现（SD）- 动态查找和配置其需要访问的功能。
- 发布/订阅（Pub/Sub）- 动态配置需要哪些数据发送到客户端。
- UDP 消息分段 - 允许在不需要分段的情况下通过 UDP 传输大型 SOME/IP 消息。

下面就来看一下这些功能解决了哪些问题：

- 序列化：在底层的通信中，都是基于原始的字节流。都是上层的通信过程中，我们传输的都是结构化的数据。这种结构化的数据传输需要转换成字节流的形式便于传输，这就是所谓的序列化。
- 远程过程调用（RPC）：如果将基于以太网的通信退化到基于信号编码，我们的整个开发就会类似传统的 CAN 编码的设计方式，虽然信噪比提升了，但是开发的效率大大降低，也不利于项目后期的升级。SOME/IP 提供的 RPC 的机制其实和 SOA 有很大的关系。SOA 希望我们将软件模块化，基于接口进行开发。所谓的模块化，在结构化编程中的体现就是函数，在面向对象编程中就是对象。为了在分布式开发中充分利用这种优势，我们需要让远程的过程调用就像是本地的过程调用一样。
- 服务发现（SD）：如果没有服务发现，我们需要在所有的节点中配置静态的通信链路，这样就失去了整个系统灵活地动态变更的优势，完全退化到了 CAN 通信的样子，整车的架构的架构将很难灵活的调整，功能的冗余也无法灵活的实现。
- 发布/订阅（Pub/Sub）：从传统的汽车的 CAN 通信中我们可以发现，很多的信号是需要持续同步的。这种情况下如果全部基于 RPC 机制去请求，是非常浪费带宽资源的。通过发布/订阅的方式，可以省去每次请求的过程。
- UDP 消息分段：TCP 协议本身便支持消息分段的机制，但是传输的延时较大，所以当传输的数据长度超过 1400 字节的同时还希望传输延时较小，这就得考虑在 UDP 协议的基础上加上一些分段的机制了。这个分段机制也会提供一些可靠性机制，以保证消息的可靠性和完整性。其实在 IP 层，如果报文的大小超过了 MTU 的限制，本身也会分包，但是如果利用这种分包的机制，每次丢包都需要上层重传全部的报文，所以最好的方法是在上层设计自己的消息分段机制，这也是 TCP 重新设计消息分段机制的原因。

## 服务化中间件


![Pasted image 20231120175043.png|450](/img/user/0.Asset/resource/Pasted%20image%2020231120175043.png)

SOME/IP 是一种面向服务（SOA）的中间件实现方案。面向服务是一个组件化的模型，它将应用程序的不同功能单元（服务）通过良好的接口和契约联系起来。其中，服务（Service）是一个粗颗粒度的、可发现的软件实体，以一个单独的实例存在，通过一组耦合和基于消息的模型与其他应用或服务交互。接口是采用中立的方式进行定义的，独立于实现服务的硬件平台、操作系统和编程语言，使得构建在这样的系统中的服务可以以一种统一和通用的方式进行交互。

交互的服务大致由三个实体组成：服务请求者、服务提供者和服务注册表。其中实体间的操作包括：服务发布、服务发现、服务绑定和调用。

面向服务的架构是众多软件架构中的一种。因面向服务架构风格具有基于标准、松散耦合、共享服务和粗粒度等优势，表现出易于集成现有系统、具有标准化的架构、提高开发效率、降低开发维护复杂度等特征，更符合智能网联化时代车载系统对软件架构的要求，所以被汽车行业引入和采用。

## 协议交互流程

![Pasted image 20230831160926.png|500](/img/user/0.Asset/resource/Pasted%20image%2020230831160926.png)

下面我们从两个方面来理解 SOME/IP 协议的内容，通信方式和报文格式。SOME/IP-SD 协议其实是 SOME/IP 的子协议，它与 SOME/IP 协议共用了报文头的格式。所以当我们提到 SOME/IP 协议的时候其实也包含了 SOME/IP-SD 协议部分。

SOME/IP 协议的交互流程包含两个重要的部分：

- 基本的通信模式：publish/subscribe 和 request/response
- 传输层的协议绑定（UDP 和 TCP）

SOME/IP 的协议交互流程包含两个阶段，首先是 SOME/IP-SD 模块、然后才是 SOME/IP 模块。SOME/IP-SD 模块的交互包含发布/订阅（publish/subscribe）过程，SOME/IP 模块的交互包含请求/响应（request/response）和通知（Notification）过程。发布是实现服务发现的必要过程，而订阅是为了实现 SOME/IP 模块的通知过程。正如上图所示，首先是 Server 端通过 SOME/IP-SD 模块发布了服务，即 OfferService，然后 Client 端通过 SOME/IP-SD 模块订阅了服务，即 SubscribeEventGroup。后面进入到了 SOME/IP 模块的交互，即 Request 和 Response，还有 Event。值得注意的是为什么 Event 并没有交互过程，仅仅是 Server 端主动发送给 Client 端呢？这是是因为前面的 SubscribeEventGroup 过程已经实现 Event 的订阅，后面 Server 一直周期发送给 Client 即可，这个对应了传统信号交互方式下的周期报文。

SOME/IP 协议可以使用 TCP/UDP 作为传输层协议。从上图的交互过程中可以看到在 SOME/IP-SD 阶段提供服务之后，会有 TCP 协议的握手交互。在 SOME/IP 阶段的交互中会有 UDP 和 TCP 协议的初始化过程。 

SOME/IP 通信阶段可以基于延时要求选择使用 TCP 协议或者 UDP 协议。需要注意的是一个 UDP 包的大小不能超过（1400 字节）。使用 UDP 协议传输小型报文的时候，为了提高效率会将多个报文会放在一个 UDP 包里。使用 UDP 协议传输大型报文的时候，就需要使用 UDP 协议的 SOME/IP-TP 协议。

## 协议服务接口


SOA 理念中服务之间是通过接口的方式进行交互的，SOME/IP 作为一种 SOA 中间件，也有自己的服务接口，分别是 Method、Event、Field 三种类型。三种接口类型在协议交互过程中的应用如下图所示。

- Method：远程过程调用接口，根据有响应和无响应分为 RR Method 和 FF Method。
	![Pasted image 20230628142209.png|300](/img/user/0.Asset/resource/Pasted%20image%2020230628142209.png)
- Event：周期性或更改时发送的数据传输接口。
	![Pasted image 20230628142128.png|300](/img/user/0.Asset/resource/Pasted%20image%2020230628142128.png)
- Field：通过 Event 和 Method 组合产生的语法糖，Method 称为 Getter/Setter，Event 称为 Notifier。
	![Pasted image 20230628142154.png|450](/img/user/0.Asset/resource/Pasted%20image%2020230628142154.png)


## 协议报文格式

![Pasted image 20230628144134.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230628144134.png)

如上图所示，SOME/IP 消息包含两个部分：Header 和 Payload。

### SOME/IP Header

![Pasted image 20230901132646.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230901132646.png)

Header 的长度为 16 字节，Payload 的长度是可变的。Header 部分由分为前 8 个字节（粉色部分）和后 8 个字节（绿色部分）。在 CP 架构中，绿色部分是由 SomeIpXf 模块封装或解析的，粉色部分由 SoAd 封装或解析。下面分别对 Header 的各个字段进行详细讲解。

- Message ID
	Message ID 有点像是 CAN ID，CAN ID 用来唯一标识一个报文内容，而 Message ID 用来唯一标识一个具体服务接口（例如某一个 Method，或者某一个 Field 中的 Setter 等，必须是整车内唯一的）。Message ID 可以分为 3 个部分：Service ID、Bit Flag 和 Method/Event ID。

	![Pasted image 20230901132820.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230901132820.png)
	Bit Flag 用来标识后面跟的是 Method 还是 Event 的 ID，Bit Flag 为 0 的时候，是 Method，为 1 的时候是 Event。为啥这里没有 Field 呢？因为在具体的实现中 Field 是由 Method 和 Event 组合形成的。

	以空调服务为例，假如空调服务的 Service ID 为 0x1234，其中打开/关闭空调的 Method 的编号为 1，那么 Message ID 就是 0x12340001，周期发送环境温度的编号也为 1 ，那么 Message ID 就是 0x12348001。

	上述的 Event 其实是 EventGroup，一个 EventGroup 可以包含很多功能相近的 Event，避免每次都要订阅一堆 Event 才能生效。

- Length
	这个字段由 4 字节组成，Length 的值就是从 Length 下面开始的 Request ID 到 Payload 结束的总长度。

- Request ID

	![Pasted image 20230901133029.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230901133029.png)

	Request ID 是请求者的信息，包含 Client ID 和 Session ID。用来区分使用同一个服务的多个客户端，可以执行不同的处理，或者就是单纯的区分开回复。对于同一个服务的不同的 Client 的 Request ID 必须是不同的，Request ID 的区分主要是通过 Client ID 实现，有两种方式实现这种区分，一种是对于请求同一个服务的不同 Client 的 Client ID 必须是不同的。另一种是 Client ID 全局唯一（不管是不是请求同一个 Server），这种方式的 Client ID 一般可以进一步分割为 Client ID Prefix（前缀）和 Client ID。这个前缀就可以用来初步的指代 Server，从而达到对车里的每一个 Client 都分配一个 Client ID 的目的。

	Session ID 是一个计数器，同样类型的报文每发送一次，Session ID 就加 1，对端可以通过判断 Session ID 的变化来感知是否有丢包或者顺序错乱之类的情况出现。还有很重要的一点是可以通过 Session ID 结合 SD 报文判断对端是否重启了。Session ID 也可以不开启，那么就一直发送 0，如果开启了，就会在 1 和 0xffff 中反复循环。

	在请求响应的场景里（RR Method、Getter），服务端收到了客户端的请求报文后，应该回复与请求报文相同的 Request ID。因为 Client ID 是由 Client 发起请求所携带的 ID 。Event 是由 Server 端主动发起的通信，其并不知道 Client ID 是多少，所以 Event 的 Client ID 设置为 0。

- Protocol Version
	这里指的是 SOME/IP 格式头的版本，如果 SOME/IP 组织对 SOME/IP 格式头进行了与旧版本不兼容的升级后，这个版本就会增加，当前版本号默认是 1。

- Interface Version
	接口版本号指的是 Payload 里的数据最后反序列化形成的接口的版本。服务接口是由用户设计并定义的，如果改动了某些接口导致不能与旧版本接口兼容，就要修改接口版本号。

- Message Type
	报文类型指代了本条 SOME/IP 报文执行了什么功能（包含 SOME/IP-TP 类型）。

	![Pasted image 20230831155431.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230831155431.png)
	- REQUEST 和 RESPONSE 用于 RR Method、Getter 和 Setter。
	- REQUEST_NO_RETURN 用于 FF Method。
	- NOTIFICATION 用于 Event 和 Notifier。

- Return Code
	![Pasted image 20230831153238.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230831153238.png)
	对于 REQUEST，REQUEST_NO_RETURN 和 NOTIFICATION 报文来讲，其自带的 Return Code 永远都是 0x00（E_OK）。**只有 RESPONSE 和 ERROR 才可能携带含有有效值的 Return Code**，其中 0x00 是返回正确，0x01 到 0x1A 是 SOME/IP 官方设置的错误码，0x0B 到 0x1F 是官方保留的错误码，而 0x20 到 0x5E 是用户能使用的错误码（用户可以传入自定义的错误码 0x01，但是 SOME/IP 会自动加上 0x1F，变成 0x20 传出，在对端解析的时候，又会减去 0x1F，变成 0x01 给应用层）。
	
	![Pasted image 20230831155601.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230831155601.png)
值得注意的是 SOME/IP 的报文头中，并没有定义额外的标志符（Instance ID）来区分各个实例，所以传输层的**端口号**会用来区分实例。因此不同的实例不可以在相同的端口上提供。
### SOME/IP Payload

Payload 就是上层业务需要传输的有效数据。很多时候还需要做一些功能安全的通信，需要用到 E2E 保护，那么 E2E 的格式头也是在 Payload 里面，如下图所示。

![Pasted image 20230901140609.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230901140609.png)

- 序列化

	![Pasted image 20230831155941.png|350](/img/user/0.Asset/resource/Pasted%20image%2020230831155941.png)

	- 大小端：大端是网络中常见的通信方式（例如 TCP/IP），所以 SOME/IP 格式头也使用大端模式。由于 Payload 部分是用户自定义的内容，所以用户可以自己决定大小端。
	- 字节流：由于网络传输都是字节流，所以数据必须进行序列化和反序列化。以下为目前 CP 协议中 SOME/IP 支持的所有序列化数据类型。

	![Pasted image 20230628101043.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230628101043.png)

### SOME/IP-SD

![Pasted image 20230831162258.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230831162258.png)

SOME/IP-SD 报文也是一种 SOME/IP 报文，是在 SOME/IP 报文的基础上进行了扩展，增加了 Entry、Option 等字段，Entries 用于同步服务实例的状态和发布/订阅的管理，Options 用于传输 Entries 的附加信息。
#### SOME/IP-SD Header

- Message ID
	**Message ID 必须是 0xFFFF8100**。之前我们分析过 Message ID 由 Service ID + Bit Flag + Method/Event ID 组成，SOME/IP-SD 报文的 Service ID 规定为 0xFFFF。而 SOME/IP-SD 报文是 Event 类型的通知报文，所以 Bit Flag 为 1，而 SOME/IP-SD 报文的 Event ID 也被限定必须是 0x0100。与 Bit Flag 结合在一起就是 0x8100 。
- Length
	Length 的值也是从 Request ID 到本条 SOME/IP 结束的长度。
- Request ID
	**Request ID 中的 Client ID 被限定必须是 0x0000**，然后 Session id 可以从 1 开始递增，到 0xFFFF 就绕回 1，但是对于 SOME/IP-SD 报文的组播和单播需要分别计数。
- Protocol Version
	和普通 SOME/IP 一样要求为 0x01 。
- Interface Version
	要求对当前版本 SOME/IP-SD 报文限定为 0x01 。
- Message Type
	由于是 Event 报文，所以这里的类型是 Notification，也就是 0x02 。
- Return Code
	默认没有错误码，统一限定为 0x00 。

#### SOME/IP-SD Payload

- Flags
	这里 SD 格式头指的是 Flags + Reserved 部分。Flags 按 Bit 有划分出两个 Flag，分别为 Reboot Flag 和 Unicast Flag。

	![Pasted image 20230703153531.png|300](/img/user/0.Asset/resource/Pasted%20image%2020230703153531.png)
	Reboot Flag：Reboot Flag 的作用和上面讲解的 Session ID 联合起来判断对端是否重启。Reboot Flag 在服务发现初始化的时候默认置 1，在 Session ID 发生溢出绕回 1 的时候，Reboot Flag 会被清零。基于这个逻辑就可以得出判断对端重启的两个条件：
	
	``` c
	/* 如果已经发生过回绕，那么上一次的 reboot 为 0， 但是下一次来的 reboot 被设置为 1 后，说明对端重启了 */
	if ((old.reboot == 0) && (new.reboot == 1))
	
	/* 如果还没有发生过回绕，那么 reboot 都是 1，就要用 session id 的大小判断了
	因为 session id 再未发生回绕前是不断增加的，所以一旦当前收到的 session id 小于上一次收到的 session id，也说明对端重启了 */
	if ((old.reboot == 1) && (new.reboot == 1) && (old.sessionId >= new.sessionId))
	```
	
	Unicat Flag：单播标识并不是说这条 SD 报文是单播还是组播，那是更底层协议干的事情，这里用来标识当前的服务发现管理器支持发送单播的能力，默认为 1 即可。

- SOME/IP-SD Entry & Option

	Entry 分为 Service Entry 和 EventGroup Entry 两种，其中 Service Entry 主要用于 Find/Offer/Stop Offer 三种操作，EventGroup Entry 用于 Subscribe/Stop Subscribe 和 Subscribe Ack/Subscribe Nack 来订阅特定的服务事件。

	Option 包含 Endpoint Option、Configuration Option 和 Load Balancing Option 三种。其中 Endpoint 包含 IPv4 Endpoint Option、IPv6 Endpoint Option、IPv4 Multicast Option、IPv6 Multicast Option、IPv4 SD Endpoint Option 和 IPv6 SD Endpoint Option 共 6 种。

	Entry 和 Option 是 SOME/IP-SD 报文最重要的内容，是服务发现功能的承载。SOME/IP-SD 的 Payload 除了前面 4 个字节的标志位，都是 Entry 和 Option 的内容。可以分为 2 个大部分： Length of Entries Array + Entry 1~n 为一个部分，是用来描述 Entry 的。Length of Options Array + Option 1~m 为一个部分，是用来描述 Option 的。

	![Pasted image 20230703154432.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230703154432.png)

	- Length of Entries Array：表示下面的 Entry 1~n 总共占用了多少 bytes
	- Entry 1~n：至少要有一个 Entry。每个 Entry 代表了一个服务发现的功能，比如服务发布、订阅或者订阅成功等
	- Length of Options Array：表示下面的 Option 1~m 总共占用了多少 bytes
	- Option 1~m 可以有零个或多个 Option。每一个 Option 的内容是协助 Entry 完成其任务，一般用来存放 Server 端的 IP 和 Port，供 Client 端请求数据时才知道地址。但是为啥不直接放在 Entry 里面呢？**因为可能有几个 Entry 共用一个 Option，所以单独提取出来减少报文长度**。每一条 Option 的长度可能是不同的，甚至还可以放一些用户自定义的参数进去。

	![Pasted image 20230831164730.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230831164730.png)

	这里需要着重讲解一下 Entry 对 Option 的引用方式，一条 SOME/IP-SD 报文中的 Entry 的个数可以是 1~n，而 Option 的个数可以是 0~m，那么 Entry 和 Option 就不是一一对应的，而一条 Entry 通常用 0~5 个 Option，那么这些 Entry 怎么知道哪些 Option 是自己需要的呢？答案就在 Entry 的内容里面，有 3 个 bytes 的数据用于索引哪些 Option 是自己需要的。这个 3 个 bytes 分为两组，Index 1st options 和 num of opt 1 为一组（用绿字表示），Index 2nd Options 和 num of opt 2 为一组（用蓝字表示）。

	Index 表示当前 Entry 所用到的 Option 位于 Option Array 中的哪个位置，即第几个 Option
	（从 0 开始计算）。比如下图中的 Index 1st options = 0，那么就去找位于 0 位的 Option，也就是 Option1 。num 表示从 Index 找到 Option 的位置后，后面多少个 Option 都是该 Entry 需要的。比如上图中 Num of opt 1 = 2，表示从 Option1 开始的两个 Option 都是这个 Entry 要使用的，分别为 Option1 和 Option2。

	我们再看看 Index 2nd options = m -1，那么从 Option m 开始寻找，由于 num of opt 2 = 1，那么就只需要 Option m 这一个。

	从上面的例子可以看到，每一个 Entry 设计了两组 Index 和 Num 来索引 Option，为啥要两组呢？按道理一组不是也可以吗？当然，如果没有功能 Option 的话，一组也是可以的。设计成两组的目的是：将公共 Option 和独立 Option 分开索引。假如 Option m 是一个公共的 Option 同时还被别的 Entry 也索引了，而 Entry 1 需要用到 Option1，2 和 m 三个 Option，用一组 
	Index + Num 就无法完成，因而设计了两组。

##### SOME/IP-SD Entry

Entry 的类型包含下表 7 种类型。

![Pasted image 20230703172618.png|550](/img/user/0.Asset/resource/Pasted%20image%2020230703172618.png)

Entry 按照类型的格式可以分为两种：Entry Type 1：服务类型（Service Entry Type）和 Entry Type 2：事件组类型（EventGroup Entry Type）。对于服务发布而言，一般仅需要 Offer/Stop Offer 就足够了，按时为了快速激活服务，还可以使用 Find 去主动寻找。对于事件订阅而言，需要使用 Subscribe/Stop Subscribe 和 Subscribe Ack/Nack。

- Service Entry Type

	![Pasted image 20230831171317.png|550](/img/user/0.Asset/resource/Pasted%20image%2020230831171317.png)
	
	1. 首先是 Type，对应上面表格里的 0x00 和 0x01 两种。
	2. 然后是 Index 和 Num，前面已经讲过，这里不再赘述。
	3. Service ID 就是本条 Entry 所管理的服务编号，对应业务报文里的 Message ID 里面的 Service ID。
	4. Instance ID 表示对应服务的哪一个实例。如果设置为 0xFFFF，代表所有的实例都有效。
	5. Major Version 指当前服务的大版本号，用于区分当前服务的版本。如果设置为 0xFF，代表所有版本都可以兼容，否则需要校验自己的版本号与对端发送过来的是否一致。
	6. TTL 是指本条服务发现报文的有效时间。如果设置为 0xFFFFFF，那么代表 TTL 时间为无穷大。
	7. Minor Version 是指当前服务的小版本号，用于区分当前服务的版本。如果设置为 0xFFFFFFFF，代表所有版本都可以兼容，否则需要校验自己的版本与对端发送的是否一致。

- EventGroup Entry Type

	![Pasted image 20230831172223.png|550](/img/user/0.Asset/resource/Pasted%20image%2020230831172223.png)
	
	1. 前 12 个字节与 Service Entry Type 一致。
	2. Reserved 保留 12 bit 的数据。
	3. Counter 是指如果一个事件组被一个 Client 端的多个消费者订阅，而这几个事件消费者得有所区别，不然无法响应到对应的那个消费者上去，所以这里用 Counter 来做区分。
	4. EventGroup ID 指事件组的编号。

#### SOME/IP-SD Option


| 种类                    | 作用                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IPv4 Endpoint Option    | 本地业务的 IP 和 Port 信息，通过 SD 报文发送给对方，对方收到该信息后，才知道该往哪里传输（比如，Offer 中可以携带 Server 的 IP 和 Port，Client 收到 Offer 后，才知道往哪里发送 Request 报文，携带 IP 和 Port，也促使 Server 的动态部署能力）                                                                                                                                                                                                                                  |
| IPv6 Endpoint Option    | 同上                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| IPv4 Muticast Option    | 同上                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| IPv6 Multicast Option   | 同上                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| IPv4 SD Endpoint Option | SD Endpoint Option 与上面的 Option 最大的区别就是其携带的是 SD 的 IP 和 Port，而不是业务的 IP 和 Port。大家肯定会疑惑 SD 报文在 IP 层不是有 IP 和 Port 信息吗？为什么 SD 报文里还要再携带一次呢、那是因为有时候在网络拓扑上，发送服务发现组播报文的 ECU 和服务所在的 ECU 可能不是一个，从而导致发送订阅报文给了错误的 ECU（该场景很少出现，因此 SD Endpoint Option 也很少使用）。需要注意的一点是，如果使用了 SD Endpoint Option，那么协议要求其一定要放在所有 Option 首位。 |
| IPv6 SD Endpoint Option | 同上                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Configuration Option    | 一般来说就是自定义 Option，用户可以通过发送字符串的形式携带信息。                                                                                                                                                                                                                                                                                                                                                                                                            |
| Load Balancing Option   | 意义不大，AUTOSAR CP 里直接把这个 Option 删除了。                                                                                                                                                                                                                                                                                                                                                                                                                            |

Option 包含的种类如上图所示。Option 用来辅助 Entry 实现其功能，是 Entry 携带的附加信息。一般是用来告诉对端自己的业务的 IP 和 Port 信息，方便对端通过相应的 IP 和 Port 来发送报文。除了 SOME/IP-SD Endpoint Option 不与任何 Entry 关联，但是其他的 Option 一定是与某个 Entry 关联，否则就不会存在。各类 Entry 所能关联的 Option 也是有要求的，如下图所示。

![Pasted image 20230831180201.png|450](/img/user/0.Asset/resource/Pasted%20image%2020230831180201.png)

- Endpoint Option
	Enpoint Option 包含 IPv4 Endpoint Option，IPv6 Endpoint Option，IPv4 Multicast Option，IPv6 Multicast Option，IPv4 SD Endpoint Option 和 IPv6 SD Endpoint Option。它们都是由 Length + Type + Reserved1 + IP 地址 + Reserved2 + 协议类型 + Port 号组成。
	
	![Pasted image 20230831180917.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230831180917.png)
- Configuration Option
	![Pasted image 20230831181140.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230831181140.png)
	Configuration Option 主要用于用户自定义信息的传输。这些信息都是以 String 类型进行传输。这部分信息遵循规则：`([len] [name] [=] [value]) * n + [0]`，公式里的 n 代表，前面的部分可以重复多次，最后的以 `0` 结尾即可。
	
	![Pasted image 20230831181806.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230831181806.png)

	直接举个例子，我们想传输两个信息 abc = x，def = 123。按照前面的公式，第一个信息的字符长度为 0x05，即 a b c = x。第二个信息的长度为 0x07，即 d e f = 1 2 3 。最后以 ` 0`  结束这个字符串。值得注意的是，因为传输的时候都是以字符串表示的，所以用户还需自行转换成对应的值。

# 协议规范文档

![Pasted image 20230619113046.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230619113046.png)

SOME/IP 协议目标分为两个版本：GENIVI 和 AUTOSAR 两个部分。需要注意的是，AUTOSAR 中的专有功能并不是每个实现都会包含。具体信息可以到 [SOME/IP](http://some-ip.com/standards.shtml)官网查看。

AUTOSAR 的 SOME/IP 协议包含以下部分：

- AUTOSAR_PRS_SOME/IPProtocol
- AUTOSAR_PRS_SOME/IPServiceDiscovery Protocol
- AUTOSAR RS_SOME/IPProtocol
- AUTOSAR RS_SOME/IPServiceDiscovery Protocol
- AUTOSAR_SWS_ServiceDiscovery
- AUTOSAR_SWS_SOME/IPTransformer
- AUTOSAR_SWS_SOME/IPTransportProtocol

GENIVI 的 SOME/IP 协议包含以下部分：

- SOME/IP_Specification_Draft_ReRelease