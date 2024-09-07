---
{"dg-publish":true,"dg-path":"汽车电子/EB Classic AUTOSAR 使用指南.md","permalink":"/汽车电子/EB Classic AUTOSAR 使用指南/","created":"2024-08-07T16:37:54.000+08:00","updated":"2024-08-13T10:27:46.000+08:00"}
---

#CyberUnit #AUTOSAR 

# 代码结构

EB AUTOSAR 安装包集成了 MCAL 和 BSW 模块，其中 MCAL 部分单独放在 EB/tresos/plugins/McalExt_xx 目录下，BSW 各个模块分别放在 EB/tresos/plugins 目录下。

# 工程构建

工程的构建思路可以参考 EB 安装路径下的 demos 或者 templates 目录下的示例工程，工程的 util 目录下放置了官方构建好的编译脚本，通过 launch_cfg 来指定编译工具链和编译器的路径。以下为参考内容：

``` shell
IF "%TARGET%"=="" SET TARGET=CORTEXM
IF "%DERIVATE%"=="" SET DERIVATE=S32G27X
IF "%SUBDERIVATE%"=="" SET SUBDERIVATE=S32G274
IF "%TOOLCHAIN%"=="" SET TOOLCHAIN=gnu
IF [%TOOLPATH_COMPILER%]==[] SET TOOLPATH_COMPILER=C:/Tool_S32G3_V2.0/gcc-9.2-arm32-eabi

IF [%TRESOS_BASE%]==[] SET TRESOS_BASE=C:/EB/tresos
IF [%PLUGINS_BASE%]==[] SET PLUGINS_BASE=%TRESOS_BASE%/plugins
```

如果你的示例工程所指定的编译器和你本地的编译器是一致的，即可跳过这一步。如果不一致，那么你需要在修改目录下的 mak 文件来重新指定与你编译器匹配的编译标志。

![Pasted image 20240807165446.png|650](/img/user/0.Asset/resource/Pasted%20image%2020240807165446.png)

之后通过运行 launch 文件即可看到如下信息，执行 make 命令即可开始编译。

![Pasted image 20240807165215.png|650](/img/user/0.Asset/resource/Pasted%20image%2020240807165215.png)

稍微总结一下 EB 工程的 makefile 设计思路。总体上来看可以分为四个部分：

1. 各个模块的静态代码中已经写好了相应的 makefile 文件，这部分无需用户修改
2. EB 配置工程中生成的配置文件会自动生成相应的 makefile 文件，这部分无需用户修改
3. 工程中添加的应用代码，这部分代码属于外部代码 EB 无法感知，所以需要自己编写相应的 mak 文件
4. util 目录下工具链相关的信息需要用户根据实际需求进行更改