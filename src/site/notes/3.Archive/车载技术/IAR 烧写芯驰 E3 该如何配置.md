---
{"dg-publish":true,"dg-path":"车载技术/IAR 烧写芯驰 E3 该如何配置.md","permalink":"/车载技术/IAR 烧写芯驰 E3 该如何配置/","created":"2025-02-08T13:46:37.618+08:00","updated":"2025-02-08T14:24:01.250+08:00"}
---

#Innolight

# 链接文件

通过链接文件可以指定程序的代码和数据在内存空间的位置。

![Pasted image 20250208134854.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250208134854.png)

```
define symbol intvec_start__ = 0x404000;

define symbol STACK_SZ = 0x14000;
define symbol HEAP_SZ = 0x4000;
define symbol DMA_BLOCK_SZ = 0x20000;
define symbol __ICFEDIT_region_SFS_start__ = 0x10000000;

define memory mem with size = 4G;

define region TCM = mem:[from 0x40 to 0xffff];
define region FLASH = mem:[from 0x100c1000 to 0x107fffff];
define region IRAM = mem:[from 0x404000 to 0x5fffff];

do not initialize  { section .noinit };
do not initialize  { section .zeroinit };
do not initialize  { section .bss };
do not initialize  { section .iram_bss };
do not initialize  { section .tcm_bss };
do not initialize  { section .mcal_bss.* };
do not initialize  { section .dma_buffer };
initialize manually { readwrite };
initialize manually { section .data};
initialize manually { section .mcal_data.* };
initialize manually { section .iram_data };
initialize manually { section .tcm_data };
initialize manually { section .tcm_func, section .mcal_text.fast.* };
initialize manually { section .iram_func };

define block VECTOR_TBL with alignment = 32        { readonly section .vector };

define block TEST_SECTION    with alignment = 32    { readonly section TEST_SECTION};
define block shell_cmd       with alignment = 32    { readonly section shell_cmd};

define block CBSS            with alignment = 32   { section .bss};
define block MCALBSS         with alignment = 32   { section .mcal_bss.* };
define block CDATA           with alignment = 32   { section .data };
define block MCALDATA        with alignment = 32   { section .mcal_data.* };
define block MCALCONST_CFG   with alignment = 32   { readonly section .mcal_const_cfg.* };
define block MCALCONST       with alignment = 32   { readonly section .mcal_const.* };
define block MCALTEXT        with alignment = 32   { section .mcal_text.* };
define block IRAMFUNC        with alignment = 32   { section .iram_func };
define block TCMFUNC         with alignment = 32   { section .tcm_func, section .mcal_text.fast.* };
define block IRAMDATA        with alignment = 32   { section .iram_data };
define block TCMDATA         with alignment = 32   { section .tcm_data };
define block IRAMBSS         with alignment = 32   { section .iram_bss};
define block TCMBSS          with alignment = 32   { section .tcm_bss};
define block TEXT            with alignment = 32   { section .text};
define block RODATA          with alignment = 32   { section .rodata};

define block CDATA_init      with alignment = 32   { section .data_init };
define block MCALDATA_init   with alignment = 32   { section .mcal_data.*_init };
define block IRAMFUNC_init   with alignment = 32   { section .iram_func_init };
define block TCMFUNC_init    with alignment = 32   { section .tcm_func_init, section .mcal_text.fast.*_init };
define block IRAMDATA_init   with alignment = 32   { section .iram_data_init };
define block TCMDATA_init    with alignment = 32   { section .tcm_data_init };

define block DMABUFFER       with alignment = 128k, size       = DMA_BLOCK_SZ { readwrite section .dma_buffer, section .mcal_bss.*.nocache };

define block CSTACK          with alignment = 32, size         = STACK_SZ     { };
define block HEAP            with alignment = 32, minimum size = HEAP_SZ, expanding size { };

place in IRAM  { readwrite };
place in IRAM  { block CBSS };
place in IRAM  { block MCALBSS };
place in IRAM  { block CDATA };
place in IRAM  { block MCALDATA };
place in IRAM  { block HEAP, block CSTACK };

place in TCM   { block TCMBSS };
place in TCM   { block TCMDATA };
place in TCM   { block TCMFUNC };

place in IRAM  { readonly, block RODATA, block TEXT, block TEST_SECTION, block shell_cmd};
place in IRAM  { block CDATA_init };
place in IRAM  { block MCALDATA_init };
place in IRAM  { block MCALCONST_CFG };
place in IRAM  { block MCALCONST };
place in IRAM  { block MCALTEXT };
place in IRAM  { block TCMFUNC_init };
place in IRAM  { block TCMDATA_init };
place in IRAM  { block IRAMFUNC_init };
place in IRAM  { block IRAMDATA_init };

place in IRAM { block IRAMBSS };
place in IRAM { block IRAMDATA };
place in IRAM { block IRAMFUNC };
place in IRAM { block DMABUFFER};

place at address mem:intvec_start__ { block VECTOR_TBL };
place at address mem:__ICFEDIT_region_SFS_start__  { section SFS_BIN };

export symbol intvec_start__;
```

# 自定义命令

通过 Build Actions 可以设置编译时的自定义命令，这里设置了编译后对镜像的签名动作。

![Pasted image 20250208135127.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250208135127.png)

# 镜像下载

通过 Flash loader(s) 可以设置固件下载的地址，工程的 Debug 模式下，程序默认直接下载到 IRAM 执行。工程的 Release 模式下，程序根据 Flash loader(s) 指定的地址，将程序下载到 Flash 在 MCU 中对应的地址空间下，这样程序会烧录到 Flash 上。

![Pasted image 20250208135552.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250208135552.png)

# 烧录总结

这几个选项包括了程序从编译到烧录的相关地址的设置。首先编译器根据链接文件将代码和数据链接到 0x404000 到 0x7FFFFF 的 IRAM 空间（虚拟地址空间），即程序的逻辑运行地址（VMA，Virtual Memory Address）。然后烧录时，根据 Flash loader(s) 的 Relocate 设置，IAR 将虚拟地址范围 0x404000-0x7FFFFF 中的数据映射到 Flash 的地址空间 0x100C1000 位置，即程序的加载地址（LMA，Load Memory Address）。

