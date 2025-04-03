---
{"dg-publish":true,"dg-path":"汽车电子/芯驰 E3 国产 Flash 替换指南.md","permalink":"/汽车电子/芯驰 E3 国产 Flash 替换指南/","created":"2025-03-31T14:42:01.357+08:00","updated":"2025-04-03T09:12:30.364+08:00"}
---

#Innolight

# 支持的型号

目前芯驰官方支持的 Flash 类型如下：

![Pasted image 20250321092646.png.jpg|650](/img/user/0.Asset/resource/Pasted%20image%2020250321092646.png.jpg)
# 启动与存储

MCU 的在启动时分为内置 Flash 和外置 Flash。一般内置 Flash 的初始化都固定在 MCU 的 BootROM 部分，用户无需关心。外置 Flash 则需要用户考虑完整的初始化过程。芯驰 E3 则是属于外置 Flash 的类型。

# 如何替换配置

首先需要考虑与 Flash 配置相关的 SFS 文件本身，芯驰 E3 的 Flash 配置主要是在 SFS 镜像中进行配置的，具体参数可以参考 [[3.Archive/汽车电子/芯驰 E3 启动及刷写分析\|芯驰 E3 启动及刷写分析]] 的 SFS 部分。关于 SFS 如何选择可以参考 Flash 类型对应的 SFS 文件表：

| 序号  | 文件名称                        | 使用说明                              | 备注         |
| --- | --------------------------- | --------------------------------- | ---------- |
| 1   | sfs_is25-1-1-4.img          | 适用于所有 spi flash、is25 系列、gd25 系列   | 4 线模式      |
| 2   | sfs_mt35_ospi_fast_read.img | 适用于 e3_gateway mt35 系列 ospi flash | 8 线模式，速率较快 |
| 3   | sfs_mt35-1-1-1.img          | 适用于所有 nor flash                   | 1 线模式，速率较慢 |
| 4   | sfs_s26h-hyperflash.img     | 适用于所有 hyperflash                  | 默认选项       |

其次，因为 Hyper Flash 和 Nor Flash 在 Sector 大小上的差异，所以各个部分的内存中的分布是不同的，这就需要考虑跟内存相关部分的配置了。我们下面来分析一下哪些配置涉及到内存：

![Pasted image 20241021092646.png|550](/img/user/0.Asset/resource/Pasted%20image%2020241021092646.png)

1. icf：这里面定义了程序的运行地址，与 Flash 本身无关

```
define region TCM = mem:[from 0x40 to 0xffff];
define region FLASH = mem:[from 0x100c1000 to 0x107fffff];
define region IRAM = mem:[from 0x404000 to 0x5fffff];
```

2. flashloader：这个配置定义了如何将编译后的代码烧录到 Flash 存储器中，和 flash 有很大的关系，需要修改。以下深入讲解以下这部分的配置：

``` board
<?xml version="1.0" encoding="UTF-8"?>
<flash_board>
    <pass>
        <loader>sfs.flash</loader>
        <range>CODE 0x10000000 0x10000080</range>
        <abs_offset>0x10000000</abs_offset>
        <args>
            255
            0
        </args>
    </pass>
    <pass>
        <loader>sf.flash</loader>
        <range>CODE 0x404000 0x7fffff</range>
        <abs_offset>0x100c1000</abs_offset>
        <args>
            0
            1
            0x404000
        </args>
    </pass>
</flash_board>
```

这个 board 文件定义了 Flash 烧录过程，包含两个 pass，分别指定了 sfs 和 sf 地址相关信息以及一些 flash 配置项参数。下面我们再来看一下 sfs 和 sf 文件的内容：

``` sfs
<?xml version="1.0" encoding="UTF-8"?>

<flash_device>
  <exe>../../flashloader_hyperflash.out</exe>
  <macro>../../iar_flashmacro.mac</macro>
  <page>512</page>
  <block>1 0x40000</block>
  <flash_base>0x10000000</flash_base>
  <aggregate>1</aggregate>
</flash_device>
```

- exe(flashloader)：这是一个 Flash 烧录程序，负责将数据写入 Flash
- macro：定义了 Flash 操作的宏定义，擦除、写入、校验等
- page：表示 Flash 以 512 字节为单位进行操作
- block：表示 Flash 以 0x40000(256 KB)为单位分块
- flash_base：表明 sfs.flash 存储在 Flash 起始地址
- aggregate：表明多个 Flash 设备可以聚合操作

系统上电后，ROM 代码会读取 SFS 结构，以便初始化 Flash 并找到 Boot Package。

``` sf
<?xml version="1.0" encoding="UTF-8"?>

<flash_device>
  <exe>../../flashloader_hyperflash.out</exe>
  <macro>../../iar_flashmacro.mac</macro>
  <page>512</page>
  <block>9 0x40000</block>
  <flash_base>0x100C1000</flash_base>
  <aggregate>1</aggregate>
</flash_device>
```

这个文件 sfs.flash 结构类似但有以下不同：

- block：表明主程序存储区域包含 9 个 Flash 块
- flash_base：表明 sfs.flash 存放在外部 Flash 的 0x100c1000 位置
- page：表明 Flash 以 512 字节为单位进行操作

# 实际操作步骤

1. 在 IAR 的 Options->Linker->Extra Options 中的 sfs.img 替换成对应类型的镜像

```
--manual_dynamic_initialization
--image_input $PROJ_DIR$\..\sfs\sfs_is25-1-1-4.img,SFS_BIN,SFS_BIN,8
--keep SFS_BIN
```

2. 在 IAR 的 Options->Debugger->Download 中的 board 部分替换为对应类型的配置

```
$PROJ_DIR$\Config\ddf\3420\flashloader\iram\norflash\iar_flashboardcfg_sf_iram.board
```