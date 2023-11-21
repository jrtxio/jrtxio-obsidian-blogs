---
{"dg-publish":true,"dg-path":"文章/vsomeip 的架构和使用说明.md","permalink":"/文章/vsomeip 的架构和使用说明/","dgEnableSearch":"true","created":"2023-08-28T16:22:57.000+08:00","updated":"2023-11-20T22:37:20.000+08:00"}
---

#Technomous #SOMEIP 

![20230628144010.png|650](/img/user/0.Asset/resource/20230628144010.png)

# 项目简介
vsomeip 是 GENIVI 实现的开源 SOME/IP 库，由 C++ 编写，目前主要实现了 SOME/IP 的通信和服务发现功能，并在此基础上增加了少许安全机制。

GENIVI 是一个联盟组织，由 BMW 倡导，是汽车信息娱乐领域系统软件标准倡导者，创建基于 Linux 系统的 IVI 软件平台和操作系统。GENIVI 倡导了许多开源软件项目，比如 DLT、CommonAPI C++、vsomeip。

# 架构概述
vsomeip 不仅涵盖了设备之间的 SOME/IP 通信（外部通信），还涵盖了内部进程间通信。两个设备通过 communication endpoints（通信端点）进行通信，endpoints 确定传输使用的格式（TCP 或 UDP）及端口号或其他参数。所有这些参数都是可以在 vsomeip 配置文件中设置的（配置文件是 json 格式）。内部通信是通过本地 endpoints 完成的，这些 endpoints 由 unix 域套接字使用 Boost.Asio 库实现。由于这种内部通信不是通过中心组建（例如 D-Bus 守护进程）路由的，所有它非常快。

中央 vsomeip 路由管理器（routing manager）只接收必须发送到外部设备的消息，并分发来自外部的消息。每个设备只有一个路由管理器，如果没有配置，那么第一个运行的 vsomeip 应用程序也会启动路由管理器。
# 文档资源
vsomeip 仓库中包含以下文档：
* vsomeipUserGuide
* vsomeipProtocol
* doxygen.in
* multicast.txt
* vsomeip.eap

vsomeipUserGuide 文件是 vsomeip 用户使用指南，vsomeipProtocol 文件是 vsomeip 命令。doxygen.in 是 Doxygen 的配置文件，用来生成源码的注释文档。multicast.txt 文档描述了 Linux 系统下使用 IP 多播需要执行的指令。vsomeip.eap 文件需要通过 Enterprise Architect 打开，里面包含了 vsomeip 的架构设计及模块的 UML 设计图。
# 编译安装
vsomeip 协议栈实现了 SOME/IP 协议，协议栈包含：
* 一个 SOME/IP 共享库（libvsomeip3.so）
* 一个 SOME/IP 配置共享库 （libvsomeip3-cfg.so）
* 一个 SOME/IP 服务发现共享库（libvsomeip3-sd.so）
* 一个 SOME/IP E2E 保护模块共享库（libvsomeip3-e2e.so）

可选模块：
* 一个与 vsomeip v2 兼容的共享库（libsomeip.so）

## Linux 平台的编译
### 依赖
vsomeip 依赖：
1. 一个支持 C++ 14 的编译器（默认 gcc >= v6.1）
2. vsomeip 使用 CMake 作为构建系统
3. vsomeip 使用的 Boost >= 1.55.0

如果需要构建文档需要安装 asciidoc，source-highlight，doxygen 和 graphviz：

``` Shell
sudo apt-get install asciidoc source-highlight doxygen graphviz
```

### 编译
vsomeip 的编译命令：

``` Shell
mkdir build
cd build
cmake ..
make
```

如果需要指定安装目录，使用以下命令：

``` Shell
cmake -DCMAKE_INSTALL_PREFIX:PATH=$YOUR_PATH ..
make
make install
```

编译时预定义单播地址，使用以下命令：

``` Shell
cmake -DUNICAST_ADDRESS=<YOUR IP ADDRESS> ..
```

编译时预定义诊断地址，使用以下命令：

``` Shell
cmake -DDIAGNOSIS_ADDRESS=<YOUR DIAGNOSIS ADDRESS> ..
```

编译时改变默认配置文件夹，使用以下命令：

``` Shell
cmake -DDEFAULT_CONFIGURATION_FOLDER=<DEFAULT CONFIGURATION FOLDER> ..
```

默认配置文件夹是 /etc/vsomeip。

编译时改变配置配置文件，使用以下命令：

``` Shell
cmake -DDEFAULT_CONFIGURATION_FILE=<DEFAULT CONFIGURATION FILE> ..
```

默认配置文件是 /etc/vsomeip.json。

编译时使能信号处理功能，使用以下命令：

``` Shell
cmake -DENABLE_SIGNAL_HANDLING=1 ..
```

默认情况下，当收到收到这些信号的时候，应用不得不小心关闭 vsomeip。

## Android 平台的编译

### 依赖
- vsomeip 使用 Boost >= 1.55 。boost 库（system, thread 和 log）必须包含在 Android 源码树中，并通过适当的 Android.bp 文件集成到构建过程中。

### 编译
一般来说，构建 Android 源代码树的指令可以在 Android 开源项目 [AOSP]([https://source.android.com/setup/build/requirements](https://source.android.com/setup/build/requirements))的页面上找到。

要将 vsomeip 库集成到构建过程中，需要将源代码与 Android.bp 文件插入到 Android 源代码树中（可以通过简单复制或使用平台清单进行提取）。在构建 Android 源代码树时，构建系统会自动找到并考虑 Android.bp 文件。

为了确保 vsomeip 库也包含在 Android 印象中，必须将该库添加到设备/目标特定的一个 makefile 中的 PRODUCT_PACKAGES 变量中：

``` makefile
PRODUCT_PACKAGES += \
    libvsomeip \
    libvsomeip_cfg \
    libvsomeip_sd \
    libvsomeip_e2e \
```


## Windows 平台编译

### 编译
打开 Visual Studio 2017 的 Developer Command Prompt for VS 2017 命令行工具，切换到 vsomeip/build 目录后执行以下命令，会自动生成 vsomeip 的 Visual Studio 工程文件和 cmake 的编译文件，然后通过 Visual Studio 2017 打开这个工程后，执行编译工程，即可生成 vsomeip 的库文件。

``` Shell
cmake -DBOOST_INCLUDEDIR="C:\local\boost_1_65_0" -DBOOST_LIBRARYDIR="C:\local\boost_1_65_0\lib32-msvc-14.1" 
-DBOOST_USE_STATIC_LIBS=ON -DENABLE_SIGNAL_HANDLING=1 ..
```



``` Shell
@ECHO OFF
SETLOCAL

set PATH=%PATH%;D:\Work\3.Technomous\5.vSOMEIP\04.Software\Code\vsomeip\build\Debug;C:\local\boost_1_65_0\lib32-msvc-14.1
set VSOMEIP_CONFIGURATION=D:\Work\3.Technomous\5.vSOMEIP\04.Software\Code\vsomeip\examples\hello_world\helloworld-local.json
set VSOMEIP_APPLICATION_NAME=hello_world_service

hello_world_service.exe

```

# 程序运行
vsomeip 本身默认是通过动态库的形式进行分发，
## 动态链接
vsomeip 本身是基于 boost 库开发的，所以如果想要基于 vsomeip 开发的应用可以移植到不同的设备上，可以将相应的 boost 动态库提取出来，在应用加载的时候通过 LD_LIBRARY_PATH 将提取的动态库路径引入到系统的环境中。





