---
{"dg-publish":true,"dg-path":"04 工具与实用教程/Batocera 技术解析：模拟器、BIOS 与加密机制.md","permalink":"/04 工具与实用教程/Batocera 技术解析：模拟器、BIOS 与加密机制/"}
---

#Innolight

Batocera 是一个基于 Linux 的 **游戏模拟发行版（Emulation-focused Linux distro）**。  
它的目标并不是“提供模拟器”，而是**构建一套统一的仿真运行时环境**，把不同年代、不同架构、不同厂商的游戏主机，通过一致的方式呈现出来。

对很多用户来说，Batocera 是“插上 U 盘就能玩”；  
但对技术人员来说，它其实是一个**高度模块化的系统集成工程**：

- Linux 内核
- SDL / DRM / ALSA / PulseAudio
- 各类模拟器内核（libretro / standalone）
- 固件、BIOS、加密 key、rom 映像
- 输入系统（evdev → SDL → RetroArch）

本文会从**技术视角**，完整拆解 Batocera 42 支持的模拟器体系，以及这些“神秘文件”到底在系统中扮演什么角色。
## 一、从“时代”理解 Batocera 支持的模拟器

与其记一长串主机名字，不如**按计算架构和历史阶段来理解**。

### 1️⃣ 8-bit / 16-bit 时代（纯软件模拟）

代表年代：1980s – 1990s 初  
技术特征：

- CPU 简单（6502 / Z80 / 68000）
- 无操作系统
- 几乎没有加密
- ROM = 程序 + 数据

Batocera 42 覆盖的典型平台：

- NES / Famicom
- SNES / Super Famicom
- Game Boy / Game Boy Color
- Game Boy Advance
- Sega Master System
- Mega Drive / Genesis
- PC Engine

**技术要点**：

- 模拟器只需实现 CPU + PPU/APU
- 大多数不需要 BIOS（或 BIOS 可选）
- ROM 文件本身就是完整软件映像

👉 这也是为什么这些平台“最容易模拟”。

### 2️⃣ 32-bit 主机时代（开始依赖 BIOS）

代表年代：1990s 中后期  
技术特征：

- 更复杂的 CPU（MIPS / SH-2 / PowerPC）
- 出现标准化 BIOS
- CD-ROM 成为主流介质

Batocera 42 支持的典型平台：

- PlayStation (PS1)
- Sega Saturn
- Nintendo 64
- Neo Geo
- Atari Jaguar

**关键变化：BIOS 出现**

> BIOS ≈ 主机启动时的 **最小系统软件**

技术上：

- 初始化硬件
- 提供系统调用接口
- 管理光盘启动流程

模拟器如果没有 BIOS：

- 要么使用 **HLE（High Level Emulation）**
- 要么直接拒绝启动

👉 这就是为什么 PS1 / Saturn **强烈依赖 BIOS 文件**。

### 3️⃣ 64-bit / 早期 3D 时代（GPU 成为核心）

代表年代：2000s 初  
技术特征：

- GPU 架构开始复杂
- 音频、DMA、缓存一致性问题明显
- 开始出现微码、协处理器

Batocera 42 覆盖：

- PlayStation 2
- Nintendo GameCube
- Wii
- Dreamcast
- PSP

**技术挑战**：

- CPU + GPU 强耦合
- 指令级 timing 很敏感
- 模拟精度 vs 性能权衡明显

**文件依赖开始分化**：

- BIOS：系统启动
- Firmware：外设/模块微程序
- NVRAM：配置与状态持久化

👉 从这个时代开始，模拟器本质已经是**一个完整 SoC 的软件实现**。

### 4️⃣ HD 主机时代（OS + 加密）

代表年代：2010s  
技术特征：

- 完整操作系统
- 强制加密
- 硬件安全模块

Batocera 42 涵盖：

- PlayStation 3（实验性）
- Xbox（部分）
- **Nintendo Switch**

这一代是**分水岭**。

## 二、为什么玩 Switch 特别“麻烦”？

Switch 并不是“更强一点的主机”，而是：

> **一台 ARM SoC + 安全启动链 + 加密内容分发的 Linux-like 系统**

这直接决定了你需要的文件种类。

## 三、BIOS / Firmware / Key：它们到底是什么？

很多教程只说“把文件放进去”，但不解释**为什么需要它们**。

下面用工程视角解释。

### 1️⃣ BIOS：启动固件（Boot ROM）

**本质**：

> 一段运行在最底层的只读程序

职责：

1. 初始化 CPU / 内存
2. 建立硬件抽象
3. 引导主程序（游戏 / OS）

在模拟器中：

- BIOS = 被加载并执行的第一段代码
- 它不是“配置文件”，而是 **被仿真的程序本身**

为什么不能随便带？

- BIOS 属于厂商版权代码
- 模拟器只能“调用”，不能分发

### 2️⃣ Firmware：设备微程序

Firmware 不负责“启动系统”，而是：

- GPU microcode
- 音频 DSP 程序
- 控制器协议栈
- 网络/无线模块逻辑

在技术上：

> Firmware ≈ 跑在“从处理器”上的程序

为什么有些平台需要、有些不需要？

- 早期主机：逻辑硬编码在芯片里
- 后期主机：逻辑通过可更新 firmware 实现

### 3️⃣ Key：加密系统的“钥匙”

这是很多新人最困惑的部分。

#### Switch 的游戏不是 ROM

它们是：

- 加密的内容包（NCA）
- 由系统 OS 解密加载

因此模拟器需要：

- **prod.keys / title.keys**
- 用于解密游戏内容
- 用于还原文件系统

**技术类比**：

- BIOS：启动代码
- Firmware：设备驱动
- Key：TLS 私钥 + 文件系统解密密钥

👉 没有 key，模拟器甚至**看不懂游戏内容是什么**。

## 四、Batocera 42 中这些文件是如何被使用的？

从系统角度看，Batocera 做了三件事：

1. **统一目录结构**
    - `/userdata/bios`
    - `/userdata/roms`
2. **启动前注入依赖**
    - 模拟器启动前加载 BIOS
    - 初始化 firmware
    - 提供 key 到模拟器内存空间
3. **模拟器只是“消费者”**
    - Batocera 不关心你玩什么
    - 它只保证：  
        **依赖齐全 → 环境一致 → 可复现**

## 五、为什么 Batocera 能“看起来这么简单”？

这是架构设计的结果。

从技术上看：

- Linux 提供硬件抽象
- SDL 提供输入/音视频抽象
- RetroArch 提供统一前端
- Standalone Emulator 处理复杂平台

你看到的是：

> “选择游戏 → 启动”

但系统内部发生的是：

1. 选择 emulator core
2. 加载 BIOS / firmware
3. 注入 key
4. 初始化虚拟硬件
5. 挂载游戏映像
6. 开始仿真主循环

## 六、总结：如何用“工程思维”理解 Batocera

你可以把 Batocera 看成：

> **一个为“历史计算平台”提供运行时环境的 Linux 发行版**

- 模拟器 ≈ CPU / SoC 模型
- BIOS / firmware / key ≈ 原始系统软件
- ROM / ISO / NCA ≈ 应用程序

当你理解了这些文件**在真实硬件中原本的角色**，  
你就不会再觉得：

- “为什么这个要 BIOS？”
- “为什么 Switch 这么复杂？”
- “为什么有的模拟器能跑，有的不能？”

因为这些限制，本来就存在于真实世界。