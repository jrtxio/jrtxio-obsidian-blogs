---
{"dg-publish":true,"permalink":"/1.inbox/draft/SOC OTA 差分软件技术方案/","dg-note-properties":{"slug":"soc-ota-diff-update","author":"吉人","created":"2023-08-13","source":null}}
---

## 升级原理

OTA 升级有基于文件和基于块两种方式。典型的基于文件的升级方式是 Linux 桌面版或服务器版的包管理器更新方式（例如，sudo apt upgrade）。基于块的升级方式在嵌入式 Linux 中更为常见，指的是通过直接写入块设备一次性更新整个分区。

![soc-ota-diff-update-fig01.png\|350](/img/user/0.asset/media/soc-ota-diff-update-fig01.png)

MCU 上很少包含文件系统，所以都是基于块的升级方式。Linux 的升级方式有一些差异。Linux 升级内容可以简单认为是 OS + APP，OS 的升级和 MCU 类似，都是基于块的升级方式，升级的内容一般包含 uboot、kernel 和 rootfs 三部分。APP 的升级方式支持文件和块升级两种方式。升级过程中将相应的文件进行替换即可。基于块的升级方式就很容易理解了，对整个分区内容进行整体的替换。

## 方案设计
### 升级流程

升级过程中主要涉及两个主要的角色：

- 云端
- 车端

其中云端需要根据旧版本与新版本生成差分包，然后下发差分包给车端。车端收到差分包后，与旧版本软件一起生成新版本的差分包，然后将新版本软件进行替换升级。

### 升级包

升级包的制作过程需要完整考虑差分升级和全量升级的情况。首先供应商按照 upe_descriptor.xml 的模板文件填写软件的相关信息，包括：软件版本号，镜像文件信息，分区信息等。然后 OEM 通过制包工具生成全量或差分包，同时按照 manifest_cmpt.xml 模板生成全量或差分升级包的相应信息。

**全量升级包**

![soc-ota-diff-update-fig02.png\|650](/img/user/0.asset/media/soc-ota-diff-update-fig02.png)

制作步骤：
- ECU 供应商按照 upe_descriptor.xml 模板填写好升级包信息。
- 将它打包进 ECU 的原始升级包，原始升级包为 zip 格式。
- 使用制包工具生成全量包（生成 SHA256，包大小等 XML 描述信息），输出的全量包为 zip 格式。

**差分升级包**

![soc-ota-diff-update-fig03.png\|650](/img/user/0.asset/media/soc-ota-diff-update-fig03.png)

制作步骤：
- ECU 供应商按照 upe_descriptor.xml 模板填写好升级包信息。
- 将它分别打包进两个 ECU 的原始升级包，一个作为差分的 old 包，一个作为差分的 new 包，old 包和 new 包都为 zip 格式。
- 使用制包工具生成差分包（生成 SHA256，包大小等 XML 描述信息），输出的差分格式为 zip 格式。

**升级模板**

upe_descriptor.xml 模板文件：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<UPDATABLEElement>
	<COMPONENT_NAME type="type">MPU</COMPONENT_NAME>
	<VERSION type="string">2.0</VERSION>
	<PARTITIONS>
		<PARTITION>
			<DELTABLE type="bool">true</DELTABLE><!--差分升级-->
			<FILE-NAME type="string">app.patch</FILE-NAME><!--升级包文件名-->
			<PARTITION-NAME type="string">app</PARTITION-NAME><!--分区名-->
			<FILESYSTEM type="string">PT_RAW</FILESYSTEM><!--文件系统-->
		</PARTITION>

		<PARTITION>
			<DELTABLE type="bool">false</DELTABLE><!--全量升级-->
			<FILE-NAME type="string">A_1_6_gos0-fs_targetfs.img</FILE-NAME><!--升级包文件名-->
			<PARTITION-NAME type="string">driveos-targetfs</PARTITION-NAME><!--分区名-->
			<FILESYSTEM type="string">PT_RAW</FILESYSTEM><!--Filesystem-->
		</PARTITION>
	<PARTITIONS>
</UPDATABLEElement>
```

manifest_cmpt.xml 模板文件：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<UPDATABLEElement>
	<COMPONENT_NAME type="type">MPU</COMPONENT_NAME>
	<SOURCE-VERSION type="string">1.0</SOURCE-VERSION>
	<TARGET-VERSION type="string">2.0</TARGET-VERSION>
	<PARTITIONS>
		<PARTITION>
			<DELTABLE type="bool">true</DELTABLE><!--差分升级-->
			<FILE-NAME type="string">app.img</FILE-NAME><!--升级包文件名-->
			<PARTITION-NAME type="string">app</PARTITION-NAME><!--分区名-->
			<FILESYSTEM type="string">RAW</FILESYSTEM><!--文件系统-->
			<FILESIZE>1186816</FILESIZE>
			<SHA256>818671bd403950e2965ec8f53d7f26997e7dac1d27848a9f2957e4d50c051836</SHA256>
			<BASE-FILE-SIZE>4294967296</BASE-FILE-SIZE>
			<BASESHA256>fd5bd893285206c46f127886f1bafc4907a7ccfeb733484e4afba8367ec8b025</BASESHA256>
			<TARGET-FILE-SIZE>4294967296</TARGET-FILE-SIZE>
			<TARGETSHA256>32218a650a667137ebb8716580dad5239eaa8829f60293fd26bb29d41473a769</TARGETSHA256>
		</PARTITION>

		<PARTITION>
			<DELTABLE type="bool">false</DELTABLE><!--全量升级-->
			<FILE-NAME type="string">A_1_6_gos0-fs_targetfs.patch</FILE-NAME><!--升级包文件名-->
			<PARTITION-NAME type="string">driveos-targetfs</PARTITION-NAME><!--分区名-->
			<Filesystem type="string">RAW</Filesytem><!--Filesystem-->
			<FILESIZE>1186816</FILESIZE>
			<SHA256>818671bd403950e2965ec8f53d7f26997e7dac1d27848a9f2957e4d50c051836</SHA256>
		</PARTITION>
	<PARTITIONS>
</UPDATABLEElement>
```
### 差分还原

升级过程中，将差分文件推送到车端。将包解压之后，先进行 SHA256 和包大小的校验，和旧包一起进行差分还原，对还原后的文件进行 SHA256 和 包大小的校验，然后进行替换升级。

## 差分工具

### HDiffPatch

- 差分命令：

```shell
./hdiffz -s-1m old new patch
```

- 还原命令：

```shell
./hdiffz old patch new
```
## 问题记录

- 当前 51 包文件结构

![soc-ota-diff-update-fig04.png\|650](/img/user/0.asset/media/soc-ota-diff-update-fig04.png)

- DriveOS 的升级文件是多个文件夹。解决的方式有两种，一、差分工具本身支持对文件夹差分，二、深入了解 DriveOS 的分区格式，然后自己完成对 DriveOS 各个分区的差分。方案二有一定的风险，DriveOS  本身的升级机制对公司来说是个黑盒，可能导致升级失效。
- 基于文件夹的差分方式大部分差分工具不支持。HDiffPatch 基于文件夹的差分方式无法生成差分包，待继续研究。
- 基于压缩包的差分方式效果很差。如果将 DriveOS 升级文件打包成压缩包后进行差分，生成的差分文件非常大。
- 差分还原过程需要保留上一版的源文件，会占用大量的存储空间。
