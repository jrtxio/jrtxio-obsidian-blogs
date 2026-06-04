---
{"dg-publish":true,"dg-path":"你写的 main 能跑，全靠这段启动代码.md","permalink":"/你写的 main 能跑，全靠这段启动代码/","dg-note-properties":{"slug":"startup-code-explained","author":"吉人","created":"2026-04-10","source":null}}
---

> 读完这篇文章，你会理解从复位到 `main()` 之间，启动代码为什么要做那五件事。

你写完 `main()` 函数，烧录程序，按下复位键，LED 亮了。一切理所当然。但你有没有想过：`int x = 10;` 的初始值存在哪？未初始化的 `int count;` 为什么恰好是 0？函数调用依赖的栈，谁来设置？这些问题的答案，藏在一段大多数人从未读过的代码里——**启动代码**（Startup Code）。

## 复位之后，main 之前

启动代码由编译器或芯片厂商提供，通常是汇编文件（如 `startup_stm32f407xx.s`），在 `main()` 之前执行。它的任务只有一个：**为 C 语言准备运行环境**。

打个比方：启动代码像餐厅开门前的备菜工作。厨师走进厨房时，食材已备好、灶台已点着、账本已清零——他直接炒菜就行。`main()` 就是那个走进厨房的厨师，启动代码是之前那段沉默的准备工作，具体拆成五个步骤。

## 五个步骤

**第一步：读取异常向量表**

MCU 上电或复位后，CPU 做的第一件事是从 Flash 起始地址读异常向量表。这张表是一份地址清单：第一个条目是栈指针初始值，第二个是复位处理函数地址，后面依次是 NMI、HardFault 等异常入口。CPU 读完栈指针后跳转到复位处理函数，后续流程由此展开。

```c
__Vectors:
    DCD     __initial_sp       ; 初始栈指针
    DCD     Reset_Handler      ; 复位处理函数
    DCD     NMI_Handler
    DCD     HardFault_Handler
```

**第二步：拷贝 .data 段**

已初始化的全局变量和静态变量（如 `int x = 10;`）存放在 `.data` 段。RAM 掉电后数据丢失，初始值必须预先存在 Flash 里，启动时搬到 RAM。启动代码找到源地址和目标地址，逐字拷贝。

```c
extern unsigned long _sidata;  // Flash 起始地址
extern unsigned long _sdata;   // RAM 起始地址
extern unsigned long _edata;   // RAM 结束地址
unsigned long *src = &_sidata;
unsigned long *dst = &_sdata;
while (dst < &_edata) {
    *dst++ = *src++;
}
```

这步完成后，`int led_status = 1;` 才有正确的初始值。

**第三步：清零 .bss 段**

未初始化的全局变量和静态变量（如 `int count;`）被编译器放入 `.bss` 段。这个段不占 Flash 空间，编译器只记录大小，但运行时必须在 RAM 中分配并全部清零。跳过这步，变量值就是 RAM 中的随机残留，程序行为完全不可预测。

```c
extern unsigned long _sbss;
extern unsigned long _ebss;
unsigned long *dst = &_sbss;
while (dst < &_ebss) {
    *dst++ = 0;
}
```

**第四步：确认栈指针**

栈用于函数调用、局部变量存储和中断上下文保存，栈指针必须在任何函数调用前就位。ARM Cortex-M 上，CPU 复位后自动从向量表第一个字加载栈指针。RISC-V 等架构则需要启动代码手动设置。

**第五步：跳转到 main()**

所有准备完成后，启动代码把控制权交给你的代码。在简单裸机工程里，通常是直接跳转；而在 GCC + newlib 等更完整的工具链中，`Reset_Handler` 会先调用 `__libc_init_array()` 完成 C 运行时初始化（C++ 全局构造函数、标准库环境等），之后再进入 `main()`。

```c
bl main    ; 跳转到 main 函数
```

`main()` 通常不应返回。如果返回了，启动代码会进入 `while(1);` 死循环，防止程序 " 跑飞 "。

> 五步之间有严格依赖：向量表提供栈指针和入口地址 → .data 搬家恢复初始值 → .bss 清零保证默认值 → 栈指针确认就绪 → 最后才跳转。任何一步缺失，C 程序都可能以最诡异的方式崩溃。

## 看见隐形的基石

裸机开发者直接修改 `startup_*.s` 是常规操作。使用 FreeRTOS、RT-Thread 等 RTOS 的项目同样依赖启动代码——RTOS 接管的是 `main()` 之后的世界，之前的事它不管。Keil、IAR、GCC 等工具链会自动链接启动文件，所以很多人从没注意过它的存在。

下次遇到 " 程序无法启动 " 或 " 变量值异常 "，别急着查 `main()` 里的逻辑。先反汇编 `.elf` 文件，或直接打开 `startup_*.s` 源码，看看从复位到 `main()` 之间那段沉默的代码，到底做了什么。
