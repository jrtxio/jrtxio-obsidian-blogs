---
{"dg-publish":true,"dg-path":"文章/SOC OTA 差分软件技术方案.md","permalink":"/文章/SOC OTA 差分软件技术方案/","dgEnableSearch":"true","created":"2023-11-13T11:27:44.120+08:00","updated":"2023-11-20T14:00:48.814+08:00"}
---

#Technomous 

# 升级原理

OTA 升级有基于文件和基于块两种方式。典型的基于文件的升级方式是 Linux 桌面版或服务器版的包管理器更新方式（例如，sudo apt upgrade）。基于块的升级方式在嵌入式 Linux 中更为常见，指的是通过直接写入块设备一次性更新整个分区。

![20231115164908.png|350](/img/user/0.Asset/resource/20231115164908.png)

MCU 上很少包含文件系统，所以都是基于块的升级方式。Linux 的升级方式有一些差异。Linux 升级内容可以简单认为是 OS + APP，OS 的升级和 MCU 类似，都是基于块的升级方式，升级的内容一般包含 uboot、kernel 和 rootfs 三部分。APP 的升级方式支持文件和块升级两种方式。升级过程中将相应的文件进行替换即可。基于块的升级方式就很容易理解了，对整个分区内容进行整体的替换。

# 升级流程
升级过程中主要涉及两个主要的角色：

- 云端
- 车端

其中云端需要根据旧版本与新版本生成差分包，然后下发差分包给车端。车端收到差分包后，与旧版本软件一起生成新版本的差分包，然后将新版本软件进行替换升级。

# 升级的包
在差分升级的流程中，还需要考虑到全量升级的情况。所以升级过程中我们需要设计相应的描述文件来区分全量升级和差分升级。同时差分包是基于特定的包制作的差分，一个差分包只能对一个特定的版本进行升级，描述文件还应该包含软件版本号，镜像文件信息，镜像文件分区信息，分区文件系统。以下是一个用 XML 设计的配置文件模板：

``` xml
<?xml version="1.0" encoding="UTF-8"?>
<updatableElement>
	<ECU_NAME type="string">IECU31</ECU_NAME>
	<version type="string">2.0</version> 
	<Partitions>
		<Partition>
			<deltable type="bool">true</deltable> <!--差分升级-->
			<fileName type="string">app.img </fileName><!--image 文件名-->
			<PartitionName type="string">eMMC_App</PartitionName> <!--分区名-->
			<Filesystem type="string">RAW</Filesystem> <!--Filesystem-->
		</Partition>
		<Partition>
			<deltable type="bool">false</deltable><!--全量升级-->
			<fileName type="string">ab.patch</fileName>
			<PartitionName type="string">eMMC_root</PartitionName>
			<Filesystem type="string">RAW</Filesystem> 
		</Partition>
	</Partitions>
</updatableElement>
```

## 全量升级包
![20231116162344.png|650](/img/user/0.Asset/resource/20231116162344.png)

制作步骤：
- ECU 供应商填写好 up_descriptor.xml 信息
- 将它打包进 ECU 的原始升级包
- 使用制包工具生成全量包

## 差分升级包

![20231116162609.png|650](/img/user/0.Asset/resource/20231116162609.png)

制作步骤：
- ECU 供应商填好 upe_descriptor.xml
- 将它分别打包进两个 ECU 的原始升级包，一个作为差分的 old 包，一个作为差分的 new 包
- 使用制包工具生成差分包
## 差分还原
升级过程中，将差分文件推送到车端。在车端将旧版固件与差分文件还原为新版固件，然后进行替换升级。

# 问题记录

- 版本管理
APP 和 DriveOS 的版本是分开管理的吗，差分的时候是直接对整包进行差分吗？

- 文档差分
是否可以对文件夹进行差分？

