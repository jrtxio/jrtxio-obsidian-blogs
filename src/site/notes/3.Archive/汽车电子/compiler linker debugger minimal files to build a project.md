---
{"dg-publish":true,"dg-path":"汽车电子/compiler linker debugger minimal files to build a project.md","permalink":"/汽车电子/compiler linker debugger minimal files to build a project/","created":"2023-02-16T19:10:11.000+08:00","updated":"2024-11-15T13:53:44.510+08:00"}
---

#Technomous 

1. Main: a file with the application main entry point(main()).
2. Startup code: this gets executed out of reset, intializes the system, memory, library and jumps to main().
3. System: In a CMSIS environment, the startup code calls a system initialization callback (SystemInit() to set clocks, configure watchdog, ...).In addition it provides header files for the memory mapped device registers and perihperals like I2C,SPI...
4. Linker File: this defines the memory mapping plus how the application shall be linked together