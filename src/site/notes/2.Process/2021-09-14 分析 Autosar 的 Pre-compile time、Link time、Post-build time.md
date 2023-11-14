---
{"dg-publish":true,"dg-path":"文章/2021-09-14 分析 Autosar 的 Pre-compile time、Link time、Post-build time.md","permalink":"/文章/2021-09-14 分析 Autosar 的 Pre-compile time、Link time、Post-build time/","dgEnableSearch":"true"}
---

#Ofilm 

![20230713135952.png|650](/img/user/0.Asset/resource/20230713135952.png)

Pre-compile 即已宏定义的方式来配置，这种方式是在预处理阶段之前进行的，所以需要暴露出源码。这里的宏可以用来屏蔽部分不需要的功能代码。

Link time 属于在链接时加入进来，不需要暴露出源码，模块也可以交由供应链中的不同角色去开发，适用于 DBC 这种经常变更的功能。这种功能类似 infineon 平台的 CodeLAB 模块生成的文件，在链接阶段将这些配置文件加入进来。

Post-build time 其中包含两种类型，分别是 Post-build Loadable 和 Post-build selectable，其中 Post-build Loadable 与 Link-time 的方式非常类似，不同点在于 Post-build Loadable 的数据位于允许重新加载的特定内存段，而 Post-build Selectable 时，提供了多个配置集，在运行时加载特定的配置集。

Link-time 与 Post-build time 的区别：
- 时间上的不同：Link-time 是链接时配置好，Post-build 是编译链接完成后，再需要修改参数。
- Link-time 完成后，不支持单独修改参数，要想修改参数需要重新编译链接，Post-build 支持单独修改参数（通过 flash 擦写工具，通过 UDS 服务，通过 Bootloader 修改参数）。
