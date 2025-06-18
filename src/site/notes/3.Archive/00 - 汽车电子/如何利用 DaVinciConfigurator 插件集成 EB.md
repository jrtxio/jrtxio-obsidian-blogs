---
{"dg-publish":true,"dg-path":"00 - 汽车电子/如何利用 DaVinciConfigurator 插件集成 EB.md","permalink":"/00 - 汽车电子/如何利用 DaVinciConfigurator 插件集成 EB/","created":"2024-02-28T11:08:10.000+08:00","updated":"2024-11-18T10:59:53.565+08:00"}
---

#Technomous #AutoSAR

# 插件功能

DaVinciConfigurator 可以通过插件集成 EB 来实现 Configurator 中配置 MCAL。以下是插件的安装教程。

# 插件安装

插件是通过 SIP 包的形式提供的，所以进入到 SIP 包的 ThirdParty 的 McalIntegrationHelper 目下，双击安装 3rdPartyMcalIntegrationHelper.exe。之后会弹出如下界面，分别选择 MCAL Base Package、Tresos Tool 和 Complex Driver Package 的安装路径。

![Pasted image 20240228111548.png|650](/img/user/0.Asset/resource/Pasted%20image%2020240228111548.png)

选择 Next。

![Pasted image 20240228111802.png|650](/img/user/0.Asset/resource/Pasted%20image%2020240228111802.png)

选择 Start 。拷贝完成后点击 Next。

![Pasted image 20240228111934.png|650](/img/user/0.Asset/resource/Pasted%20image%2020240228111934.png)

选择 TC397 后，点击 Copy，拷贝完成后，点击 Finalize。

![Pasted image 20240228112058.png|650](/img/user/0.Asset/resource/Pasted%20image%2020240228112058.png)

点击 Start。

![Pasted image 20240228112207.png|650](/img/user/0.Asset/resource/Pasted%20image%2020240228112207.png)

点击 Exit 退出即可。

![Pasted image 20240228112244.png|650](/img/user/0.Asset/resource/Pasted%20image%2020240228112244.png)

# 插件原理

通过插件的安装流程可以发现其实插件的工作机制非常简单，就是通过将 MCAL 的静态代码和 EB 的工具链拷贝到 SIP 包的 ThirdParty 下的 Mcal_tc3xx 的 Supply 目录。

![Pasted image 20240228112631.png|650](/img/user/0.Asset/resource/Pasted%20image%2020240228112631.png)