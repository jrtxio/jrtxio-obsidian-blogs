---
{"dg-publish":true,"dg-enable-search":"true","dg-path":"文章/2022-09-20 GCC、LLVM 和 Clang 的关系.md","permalink":"/文章/2022-09-20 GCC、LLVM 和 Clang 的关系/","dgEnableSearch":"true","dgPassFrontmatter":true,"created":"2023-02-07T14:32:43.000+08:00","updated":"2023-11-14T13:32:27.000+08:00"}
---

#Technomous #工具教程

传统的编译器通常分为三个部分，前端（frontEnd），优化器（Optimizer）和后端（backEnd）。在编译过程中，前端主要负责词法和语法分析，将源代码转化为抽象语法树；优化器则是在前端的基础上，对得到的中间代码进行优化，使代码更加高效；后端则是将已经优化的中间代码转换为针对各自平台的机器代码。

GCC(GNU Compiler Collection，GNU 编译器套装)，是一套由 GNU 开发的编程语言编译器。GCC 原名为 GNU C 语言编译器，因为它原本只能处理 C 语言。GCC 快速演进，变得可处理 C++、Fortran、Pascal、Objective-C、Java 以及 Ada 等其他语言。

LLVM（Low Level Virtual Machine，底层虚拟机）提供了编译器相关的支持，能够进行程序语言的编译器优化、链接优化、在线编译优化、代码生成。简而言之，可以作为多种编译器的后台来使用。

因为 GCC 的代码耦合度太高，很难独立，而且越是后期的版本，代码质量越差。所以苹果从零开始写 C、C++、Objective-C 语言的前端 Clang，完全替代掉 GCC。

所以苹果在编译器上其实经历了两个阶段：LLVM-GCC -> Clang/LLVM。