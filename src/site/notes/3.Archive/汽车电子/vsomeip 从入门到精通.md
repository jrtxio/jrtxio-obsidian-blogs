---
{"dg-publish":true,"dg-path":"汽车电子/vsomeip 从入门到精通.md","permalink":"/汽车电子/vsomeip 从入门到精通/","created":"2023-08-28T16:22:57.000+08:00","updated":"2024-02-29T10:33:09.000+08:00"}
---

#Technomous #SOMEIP

# 知识体系

![Pasted image 20240202151229.png|300](/img/user/0.Asset/resource/Pasted%20image%2020240202151229.png)

剖析之前我们先大概分析一下学习 vsomeip 需要掌握哪些知识点。首先 vsomeip 作为 SOME/IP 协议的一种实现，对协议规范的了解自然是必不可少的。其次 vsomeip 使用 C++ 语言实现，需要对 C++ 编程有一定的了解。vsomeip 是基于 boost 库进行实现的，涉及到其中的 asio 网络编程和 log 日志功能。如果想要对整个架构设计有一个全面的把握，我们还需要一些面向对象和设计模式的基础。为了解析通信的网络报文，还需要能够简单使用 wireshark 等网络分析工具。 

## 异步网络编程

ASIO，即异步 IO（Asynchronous Input/Output），本是一个独立的 C++ 网络程序库，似乎并不为人所知。后来因为被 Boost 相中，才声名鹊起。如何理解异步 IO？简单来说，就是你发起一个 IO 操作，却不用等它结束，你可以继续做其他事情，当它结束时，你会得到通知。

``` cpp
#include <iostream>
#include <boost/asio.hpp>
#include <chrono>

void print(boost::system::error_code ec) {
  std::cout << "Hello, world!" << std::endl;
}

int main() {
  boost::asio::io_context ioc;
  boost::asio::steady_timer timer(ioc, std::chrono::seconds(3));
  timer.async_wait(&print);
  ioc.run();
  return 0;
}

/* g++ boostasio.cpp -o boostasio -I/usr/include/boost -lboost_system -pthread */
```

- 每个 asio 程序都至少有一个 io_context 对象，它代表了操作系统的 I/O 服务（io_context 在 Boost 1.66 之前一直叫 io_service），把你的程序和这些服务链接起来。ioc.run 是一个阻塞（blocking）调用，姑且把它想象成一个 loop（事件循环），直到所有异步操作完成后，loop 才结束，run 才返回。
- 根据 I/O 操作的不同，asio 提供了不同 I/O 对象，比如 timer（定时器），socket 等。Timer 是最简单的一种 I/O 对象，可以用来实现异步调用的超时机制。上面代码先创建了一个 steady_timer，指定时间 3 秒，然后异步等待这个 timer，3 秒后，timer 超时结束，print 被调用。
- async_wait 初始化了一个异步操作，但是这个异步操作的执行，要等到 ioc.run 时才开始。

编译执行结果：

![Pasted image 20240202135059.png|550](/img/user/0.Asset/resource/Pasted%20image%2020240202135059.png)
## 多态应用场景

![Pasted image 20240115135229.png|350](/img/user/0.Asset/resource/Pasted%20image%2020240115135229.png)

vsomeip 本身采用的是面向对象编程范式来实现的。上图展示了面向对象的全貌和发展过程，我们可以据此来探索 vsomeip 的开发过程。此处不展开论述，仅讲述面向对象三大特性（封装、继承和多态）中的多态。下面是一个多态代码示例：

``` cpp
#include <iostream>

class Animal {
public:
    virtual void makeSound() const {
        std::cout << "Animal make a sound." << std::endl;
    }
};

class Dog : public Animal {
public:
    void makeSound() const override {
        std::cout << "Dog barks." << std::endl;
    } 
};

class Cat : public Animal {
public:
    void makeSound() const override {
        std::cout << "Cat meows." << std::endl;
    }
};

int main() {
    Animal animal;
    Dog dog;
    Cat cat;

    Animal* animalPtr = &dog;
    animalPtr -> makeSound();

    animalPtr = &cat;
    animalPtr -> makeSound();

    return 0;
}

/* compile command: g++ polymorphics.cpp -o polymorhics */
```

编译执行结果：

![Pasted image 20240115105700.png|550](/img/user/0.Asset/resource/Pasted%20image%2020240115105700.png)

在 vsomeip 中多态的应用十分广泛，这是因为多态可以极大提升架构的扩展性。你可能无法知道许多未来的扩展需求，利用多态你可以将核心的逻辑提取出来，未来扩展的应用代码将不会影响核心的代码逻辑，也无需大面积的改动已有的代码。

# 项目简介

vsomeip 是 GENIVI 实现的开源 SOME/IP 库，由 C++ 编写，目前主要实现了 SOME/IP 的通信和服务发现功能，并在此基础上增加了少许安全机制。

GENIVI 是一个联盟组织，由 BMW 倡导，是汽车信息娱乐领域系统软件标准倡导者，创建基于 Linux 系统的 IVI 软件平台和操作系统。GENIVI 倡导了许多开源软件项目，比如 DLT、CommonAPI C++、vsomeip。

# 架构概述

![Pasted image 20230628144010.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230628144010.png)

vsomeip 不仅涵盖了设备之间的 SOME/IP 通信（外部通信），还涵盖了内部进程间通信。两个设备通过 communication endpoints（通信端点）进行通信，endpoints 确定传输使用的格式（TCP 或 UDP）及端口号或其他参数。所有这些参数都是可以在 vsomeip 配置文件中设置的（配置文件是 json 格式）。内部通信是通过本地 endpoints 完成的，这些 endpoints 由 unix 域套接字使用 Boost.Asio 库实现。由于这种内部通信不是通过中心组建（例如 D-Bus 守护进程）路由的，所有它非常快。

中央 vsomeip 路由管理器（routing manager）只接收必须发送到外部设备的消息，并分发来自外部的消息。每个设备只有一个路由管理器，如果没有配置，那么第一个运行的 vsomeip 应用程序也会启动路由管理器。

# 软件架构

![Pasted image 20231207092604.png|300](/img/user/0.Asset/resource/Pasted%20image%2020231207092604.png)

vsomeip 的主体模块包含 service discovery、endpoint、routing、configuration、runtime、message 和 logging 模块。

- runtime：应用程序运行时管理
- message：报文功能的实现
- logging：日志记录功能的实现
- endpoint：通信功能的实现
- routing：路由功能的实现
- configuration：配置功能的实现
- service discovery：服务发现功能的实现

## message 模块分析

在分析 message 模块的设计之前，我们看一下 SOME/IP 报文结构。因为报文头的结构是共用的，可以抽象出 message_base 作为基类，这样所有的报文都可以通过继承重用这部分代码。为了让 sd 报文可以复用 message_base 基类，所有单独提取除了 message 接口文件。

![Pasted image 20230901132646.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230901132646.png)

![Pasted image 20240116131755.png|650](/img/user/0.Asset/resource/Pasted%20image%2020240116131755.png)

## service discovery 模块分析

在分析 service discovery 类图之前，我们先看一下 sd 报文的结构，报文头部分和 message 部分是相同的，所以继承相同的 message_base_impl 基类便可以实现复用。

![Pasted image 20230831162258.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230831162258.png)

我们可以再看一下 service entry 和 eventgroup entry 的报文结构，除了最后 4 个字节不一样，前面都是相同的，所以自然就可以设计出其中的继承结构。

![Pasted image 20230831171317.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230831171317.png)

![Pasted image 20230831172223.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230831172223.png)

我们再来看一下 ipv4、ipv6 等 option 的结构，前面的字段也是相同的。自然也可以提取出类似的继承关系。

![Pasted image 20230831180917.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230831180917.png)

根据上面的报文结构分析，我们再来看一下 service discovery 报文的类图就很容易理解了。

![Pasted image 20240116143058.png|650](/img/user/0.Asset/resource/Pasted%20image%2020240116143058.png)

## endpoint 交互模块分析

![Pasted image 20240116150913.png|650](/img/user/0.Asset/resource/Pasted%20image%2020240116150913.png)

vsomeip 应用通过 endpoint 通信，endpoint 包含三种类型 local endpoint、tcp endpoint 和 udp endpoint。同一个设备的进程之间通过 local endpoint 进行 IPC 通信。不同设备之间需要通过 tcp/udp endpoint 进行通信。

- local endpoint 包装了 boost::asio::local::stream_protocol
- tcp endpoint 包装了 boost::asio::ip::tcp
- udp endpoint 包装了 boost::asio::ip::udp

# 文档资源

vsomeip 仓库中包含以下文档：

- vsomeipUserGuide
- vsomeipProtocol
- doxygen.in
- multicast.txt
- vsomeip.eap

vsomeipUserGuide 文件是 vsomeip 用户使用指南，vsomeipProtocol 文件是 vsomeip 命令。doxygen.in 是 Doxygen 的配置文件，用来生成源码的注释文档。multicast.txt 文档描述了 Linux 系统下使用 IP 多播需要执行的指令。vsomeip.eap 文件需要通过 Enterprise Architect 打开，里面包含了 vsomeip 的架构设计及模块的 UML 设计图。
# 编译安装

## vsomeip 概述

vsomeip 协议栈实现了 SOME/IP 协议，协议栈包含：

- 用于 SOME/IP 共享库（libvsomeip3.so）
- 用于 SOME/IP 配置模块的共享库 （libvsomeip3-cfg.so）
- 用于 SOME/IP 服务发现共享库（libvsomeip3-sd.so）
- 用于 SOME/IP E2E 保护模块共享库（libvsomeip3-e2e.so）

可选模块：

- 用于与 vsomeip v2 兼容的共享库（libsomeip.so）

## Linux 构建说明
### 依赖

- 需要启用 C++ 14 的编译器（对于 gcc >= v6.1，默认启用）。
- vsomeip 使用 CMake 作为构建系统。
- vsomeip 使用的 Boost >= 1.55.0。

对于测试，需要使用 Google 的测试框架 [gtest]([google/googletest: GoogleTest - Google Testing and Mocking Framework (github.com)](https://github.com/google/googletest))。

要构建文档需要安装 asciidoc，source-highlight，doxygen 和 graphviz：

``` shell
sudo apt-get install asciidoc source-highlight doxygen graphviz
```

### 编译

编译命令：

``` Shell
mkdir build
cd build
cmake ..
make
```

要指定安装目录（类似于使用 autotools 时的`--prefix=`），可以这样调用 cmake：

``` shell
cmake -DCMAKE_INSTALL_PREFIX:PATH=$YOUR_PATH ..
make
make install
```

#### 带有预定义单播和/或诊断地址的编译

要预定义单播地址，请这样调用 cmake：

``` Shell
cmake -DUNICAST_ADDRESS=<YOUR IP ADDRESS> ..
```

要预定义诊断地址，请这样调用 cmake：

``` Shell
cmake -DDIAGNOSIS_ADDRESS=<YOUR DIAGNOSIS ADDRESS> ..
```

诊断地址是一个单字节值。

#### 使用自定义默认配置文件夹的编译

要更改默认配置文件夹，请这样调用 cmake：

``` Shell
cmake -DDEFAULT_CONFIGURATION_FOLDER=<DEFAULT CONFIGURATION FOLDER> ..
```

默认配置文件夹为 /etc/vsomeip。

#### 使用自定义默认配置文件的编译

要更改默认配置文件，请这样调用 cmake：

``` Shell
cmake -DDEFAULT_CONFIGURATION_FILE=<DEFAULT CONFIGURATION FILE> ..
```

默认配置文件是 /etc/vsomeip.json。

#### 带有信号处理的编译

要使用启用信号处理（SIGINT/SIGTERM）编译 vsomeip，请这样调用 cmake：

``` Shell
cmake -DENABLE_SIGNAL_HANDLING=1 ..
```

在默认设置中，应用程序必须负责在接收到这些信号时关闭 vsomeip。

## Android 构建说明

### 依赖

- vsomeip 使用 Boost >= 1.55。boost 库（system, thread 和 log）必须包含在 Android 源码树中，并通过适当的 Android.bp 文件集成到构建过程中。

### 编译

一般来说，构建 Android 源码树的步骤与 Android 开源项目（ASOP）页面上找到的说明相同（https://source.android.com/setup/build/requirements）。

要将 vsomeip 库集成到构建过程中，需要将源代码与 Android.bp 文件插入到 Android 源代码树中（可以通过简单复制或使用自定义平台清单进行提取）。在构建 Android 源代码树时，构建系统会自动找到并考虑 Android.bp 文件。

为了确保 vsomeip 库也包含在 Android 映像中，必须将该库添加到设备/目标特定的一个 makefile 中的 PRODUCT_PACKAGES 变量中：

``` makefile
PRODUCT_PACKAGES += \
    libvsomeip \
    libvsomeip_cfg \
    libvsomeip_sd \
    libvsomeip_e2e \
```

## Windows 构建说明

### 依赖

- vsomeip 使用 Boost >= 1.55。使用的 boost 库模块包括 system, thread 和 log。

### 编译

打开 Visual Studio 2017 的 Developer Command Prompt for VS 2017 命令行工具，切换到 vsomeip/build 目录后执行以下命令，会自动生成 vsomeip 的 Visual Studio 工程文件和 cmake 的编译文件，然后通过 Visual Studio 2017 打开这个工程后，执行编译工程，即可生成 vsomeip 的库文件。

``` shell
cmake -DBOOST_INCLUDEDIR="C:\local\boost_1_65_0" -DBOOST_LIBRARYDIR="C:\local\boost_1_65_0\lib32-msvc-14.1" 
-DBOOST_USE_STATIC_LIBS=ON -DENABLE_SIGNAL_HANDLING=1 ..
```

程序执行脚本脚本

``` shell
@ECHO OFF
SETLOCAL

set PATH=%PATH%;D:\Work\3.Technomous\5.vSOMEIP\04.Software\Code\vsomeip\build\Debug;C:\local\boost_1_65_0\lib32-msvc-14.1
set VSOMEIP_CONFIGURATION=D:\Work\3.Technomous\5.vSOMEIP\04.Software\Code\vsomeip\examples\hello_world\helloworld-local.json
set VSOMEIP_APPLICATION_NAME=hello_world_service

hello_world_service.exe
```

> [!warning]
> 截止目前最新版本 3.3.8 在 Windows 平台编译后无法正常使用。

# 例程调试

vsomeip 工程中 examples 目录默认提供了一些例程，我们以 hello_world 为例，说明如何通过 vscode 进行调试工程。

``` shell
mkdir build
cmake -DCMAKE_BUILD_TYPE=Debug ..
make
```


> [!attention]
> 将编译类型设置为 Debug，如果需要同时调试 vsomeip 库，也需要在编译库是将编译类型设置为 Debug。

以下为 vscode 的 launch.json 参考配置文件，其中 LD_LIBRARY_PATH、VSOMEIP_CONFIGURATOIN 和 VSOMEIP_APPLICATION_NAME 的对应值要根据实际情况进行修改。

``` json
{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "name": "vsomeipclient-dbg",
            "type": "cppdbg",
            "request": "launch",
            "program": "${workspaceRoot}/examples/hello_world/build/hello_world_client",
            "args": [],
            "stopAtEntry": false,
            "cwd": "${workspaceFolder}",
            "environment": [
                {
                    "name": "LD_LIBRARY_PATH",
                    "value": "/home/user/codes/vsomeip/build",
                },
                {
                    "name": "VSOMEIP_CONFIGURATION",
                    "value": "/home/user/codes/vsomeip/examples/hello_world/helloworld-local.json"
                },
                {
                    "name": "VSOMEIP_APPLICATION_NAME",
                    "value": "hello_world_client"
                },
            ],
            "externalConsole": false,
            "logging": {
                "engineLogging": false
            },
            "MIMode": "gdb",
            "miDebuggerPath": "/usr/bin/gdb"
        },
        {
            "name": "vsomeipserver-dbg",
            "type": "cppdbg",
            "request": "launch",
            "program": "${workspaceRoot}/examples/hello_world/build/hello_world_service",
            "args": [],
            "stopAtEntry": false,
            "cwd": "${workspaceFolder}",
            "environment": [
                {
                    "name": "LD_LIBRARY_PATH",
                    "value": "/home/user/codes/vsomeip/build",
                },
                {
                    "name": "VSOMEIP_CONFIGURATION",
                    "value": "/home/user/codes/vsomeip/examples/hello_world/helloworld-local.json"
                },
                {
                    "name": "VSOMEIP_APPLICATION_NAME",
                    "value": "hello_world_service"
                },
            ],
            "externalConsole": false,
            "logging": {
                "engineLogging": false
            },
            "MIMode": "gdb",
            "miDebuggerPath": "/usr/bin/gdb"
        }
    ]
}
```

如果需要跨设备运行，需要将 helloworld-local.json 文件的配置同步修改，具体可以参考 vsomeip 工程的 config 文件夹下的模板进行更改。

``` json
{
    "unicast":"192.168.96.2",
    "logging":
    {
        "level":"debug",
        "console":"true"
    },

    "applications":
    [
        {
            "name":"hello_world_service",
            "id":"0x4444"
        },
        {
            "name":"hello_world_client",
            "id":"0x5555"
        }
    ],

    "services":
    [
        {
            "service" : "0x102a",
            "instance" : "0x0001",
            "unreliable": "30509"
        }
    ],

    "routing":"hello_world_service",

    "service-discovery":
    {
        "enable" : "true",
        "multicast": "239.127.3.1",
		"port": "30490",
		"protocol": "udp",
		"initial_delay_min": "10",
		"initial_delay_max": "50",
		"repetitions_base_delay": "50",
		"repetitions_max": "3",
		"ttl": "3",
		"cyclic_offer_delay": "1000",
		"request_response_delay": "30"
    }
}
```

代码中的 service_id、instance_id 和 service_method_id 等根据需要自行修改，保持与 helloworld-local.json 中的配置一致即可。
# 程序运行

vsomeip 是通过动态库的形式进行分发，暴露出接口文件供应用程序调用。分发的动态库可以安装到 vsomeip 指定路径，也可以自定义安装路径。程序执行过程需要动态加载相应的库。如果需要将开发的 vsomeip 程序移植到不同的设备上，通过 LD_LIBRARY_PATH 变量指定动态库的路径指定即可。需要注意的是，由于 vsomeip 本身是基于 boost 库开发的。除了 vsomeip 的库文件本身还需要将相应的 boost 动态库提取出来，通过 LD_LIBRARY_PATH 指定到程序的动态加载路径中。在开发 vsomeip 应用程序的时候，实际上使用的是动态库的隐式调用方法，而 vsomeip 本身的插件模块加载使用的是动态库的显式调用方法。
