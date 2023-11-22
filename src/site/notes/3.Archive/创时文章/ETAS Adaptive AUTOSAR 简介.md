---
{"dg-publish":true,"dg-path":"文章/创时文章/ETAS Adaptive AUTOSAR 简介.md","permalink":"/文章/创时文章/ETAS Adaptive AUTOSAR 简介/","dgEnableSearch":"true","created":"2023-04-06T10:17:11.000+08:00","updated":"2023-11-14T13:31:29.000+08:00"}
---

#Technomous #SILK 

# 为什么需要 Adaptive AUTOSAR

## 目前存在的一些问题

![20230406102729.png|650](/img/user/0.Asset/resource/20230406102729.png)

Adaptive AUTOSAR 的出现是为了解决 Classic AUTOSAR 和信息娱乐系统的一些问题。从中我们可以大致总结出 Adaptive AUTOSAR 平台的一些特点：
* Soft real-time：Deadlines in ms range
* Some safety requirements: ASIL-B
* High resources: Micro-processor、Dynamic OS
* SW Update：Planned Dynamics

## Classic AUTOSAR vs Adaptive AUTOSAR

![20230406111409.png|650](/img/user/0.Asset/resource/20230406111409.png)

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

# ETAS AP 安装和使用

* RTA VRTE 安装
RTA VRTE 通过虚拟机的方式进行分发，提供 Virtualbox 镜像。也可以通过 WSL 的方式自行安装。目前仅包含试用版开发环境。

* RTA VRTE 使用
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