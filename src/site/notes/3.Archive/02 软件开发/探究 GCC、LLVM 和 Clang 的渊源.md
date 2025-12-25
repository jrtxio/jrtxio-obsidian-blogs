---
{"dg-publish":true,"dg-path":"02 软件开发/探究 GCC、LLVM 和 Clang 的渊源.md","permalink":"/02 软件开发/探究 GCC、LLVM 和 Clang 的渊源/"}
---

#Technomous

传统的编译器通常分为三个部分，前端（frontEnd），优化器（Optimizer）和后端（backEnd）。在编译过程中，前端主要负责词法和语法分析，将源代码转化为抽象语法树；优化器则是在前端的基础上，对得到的中间代码进行优化，使代码更加高效；后端则是将已经优化的中间代码转换为针对各自平台的机器代码。

GCC（GNU Compiler Collection，GNU 编译器套装），是一套由 GNU 开发的编程语言编译器。GCC 原名为 GNU C 语言编译器，因为它原本只能处理 C 语言。GCC 快速演进，变得可处理 C++、Fortran、Pascal、Objective-C、Java 以及 Ada 等其他语言。

早期苹果打算直接使用 GCC 进行修改来满足自己的需求，但是后期发现整个工程越来越难以管理和社区的目标越走越远。而且 GCC 的代码耦合度太高，很难独立，而且越是后期的版本，代码质量越差。所以苹果打算从头写自己的编译器。前期先将 GCC 作为前端，重新写了个后端 LLVM（Low Level Virtual Machine，底层虚拟机）来提供程序语言的编译器优化、链接优化、在线编译优化、代码生成，即 GCC/LLVM 组合。后期苹果又从零开始写 C、C++、Objective-C 语言的前端 Clang，至此便用 Clang/LLVM 组合完全替代掉了 GCC。所以苹果在编译器的演变上其实经历了三个阶段：GCC -> GCC/LLVM -> Clang/LLVM。