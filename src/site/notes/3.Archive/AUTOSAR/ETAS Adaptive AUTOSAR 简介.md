---
{"dg-publish":true,"dg-enable-search":"true","dg-path":"AUTOSAR/ETAS Adaptive AUTOSAR 简介.md","permalink":"/AUTOSAR/ETAS Adaptive AUTOSAR 简介/","dgEnableSearch":"true","dgPassFrontmatter":true}
---

#Technomous #SILK 

# 为什么需要 Adaptive AUTOSAR

![20230406102729.png|650](/img/user/0.Asset/resource/20230406102729.png)

Adaptive AUTOSAR 的出现是为了解决 Classic AUTOSAR 和信息娱乐系统的一些问题。从中我们可以大致总结出 Adaptive AUTOSAR 平台的一些特点：

* Soft real-time：Deadlines in ms range
* Some safety requirements: ASIL-B
* High resources: Micro-processor、Dynamic OS
* SW Update：Planned Dynamics

# Classic AUTOSAR vs Adaptive AUTOSAR

|              | CP                                                | AP                                                                               |
| ------------ | ------------------------------------------------- | -------------------------------------------------------------------------------- |
| 开发语言     | C                                                 | C++ 14 & STL                                                                     |
| 实时性       | 硬实时 us 级                                      | 软实时 ms 级                                                                     |
| 性能/算力    | 相对较弱，资源占用低                              | 相对较强，资源占用高；大数据并行处理，高性能运算                                 |
| 应用场景     | 传统 ECU                                          | 自动驾驶 ADAS、智能座舱、车联网                                                  |
| 主要通信方式 | 针对基于信号的通信（CAN、LIN）优化                | 基于以太网，面向服务通信 SOA，SOME/IP                                            |
| 安全等级     | ASIL D                                            | ASIL B（Vector up to ASIL D）                                                    |
| 操作系统     | OSEK                                              | POSIX PSE51 类 Unix 系统 QNX、Linux、PikeOS...                                   |
| 代码执行     | 直接从 ROM 执行代码                               | 应用从 NVM 载入 RAM 执行                                                         |
| 地址空间     | 所有应用共享同一地址空间（MPU 提供安全支持）      | 每个应用有独立的（虚拟）地址空间（需要 MMU 支持）                                |
| 任务调度     | 固定的任务配置                                    | 支持多种（动态）调度策略                                                         |
| 运行环境     | RTE:Runtime Environment                           | ARA:AUTOSAR Runtime for Adaptive Applications                                    |
| 功能         | 固定，所有应用程序链接为一个整体（一个 HEX 文件） | 应用作为独立的可执行文件，独立编译、上传（部署）；可灵活在线升级，应用可安装卸载 |
|              | Whole stack compiled and linked in one piece      | Services as POSIX process, separately installable                                |
| 模块         | 完全定义了所有模块                                | 更少的模块，只有 API 定义                                                        |
|              | All modules completely specified                  | Less modules, only API specification                                             |
| 配置         | 编译前配置，编入二进制文件                        | 运行时从 Manifests 文件动态载入配置                                              |
|              | Configuration compiled in                         | Configuration loaded from manifests                                              |

# Adaptive AUTOSAR 包含哪些模块

![20230406111919.png|650](/img/user/0.Asset/resource/20230406111919.png)

AP(AUTOSAR Adaptive Platform)是 ARA（AUTOSAR Runtime for Adaptive Applications）的实现。AP 提供了两种接口：Service 和 API，为 Adaptive Application 提供了运行时环境 ARA。

* API/Foundation（直接调用 API）
	* Execution Management(ara::exec)
	* Communication Management(ara::exec)
	* Diagnostics(ara::diag)
	* Persistency(ara::per)
	* Log & Trace(ara::log)

* Service（通过 ara::com 进程间通信）
	* Update & Configuration Management(ara::ucm)
	* State Management(ara::sm)
	* Network Management(ara::nm)

# ETAS-AP 的安装和使用

## RTA VRTE 安装

RTA VRTE 通过虚拟机的方式进行分发，提供 Virtualbox 镜像。也可以通过 WSL 的方式自行安装。目前仅包含试用版开发环境。

## RTA VRTE 使用

![20230406131326.png|650](/img/user/0.Asset/resource/20230406131326.png)

RTA VRTE 的开发配置通过 VRTE Adaptive Studio 进行，编译和部署都是通过 RTA VRTE 提供的脚本自动化进行。部署包含多种不同的平台，机器可以是真实的物理机器、完全虚拟化的容器、系统级虚拟化环境或其他任意虚拟环境。

![20230406110121.png|650](/img/user/0.Asset/resource/20230406110121.png)

上机演示操作过程

``` shell
rvbuild -sqc -d AraCM_Event 40; rvbuild -lqc -d AraCM_Event 41
```

build and deplopy command:
* Build the project (-d AraCM_Event), suppressing build output(-q), after cleaning output files (-c).
* Generate the ECUCFG configuration, in particular the ECUCFG configuration for Communication (COM_flatcfg.bin), Proxies and Skeletons, and JSON files.
* Deploy to virtual machine 40, which also forces Linux/aarch64 to be chosen as the target operating system and architecture for the build.
* Deploy standard library files and excutables from the Target SDK.
* Copy the files **MachineDesign_A_someip.json** from the project folder ** /\<user>/vrte/project/AraCM_Event/JSON ** to the folder ** /opt/vrte/rb-com/etc ** on the target and patch them with the correct IP address(-s option)
* Copy the ECUCFG configuration files for **SoftwareCluster_0**, e.g. **exm_SoftwareCluster_0_flatcfg.bin**, to the appropriate folders on the target(-s option)
* Run the virtual machine 40