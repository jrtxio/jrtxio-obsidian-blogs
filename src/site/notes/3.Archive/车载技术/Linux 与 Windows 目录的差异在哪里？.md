---
{"dg-publish":true,"dg-path":"车载技术/Linux 与 Windows 目录的差异在哪里？.md","permalink":"/车载技术/Linux 与 Windows 目录的差异在哪里？/","created":"2023-05-13T22:25:55.000+08:00","updated":"2025-07-08T11:13:21.313+08:00"}
---

#Technomous #Linux 

Linux 和 Windows 最大的差别在于目录。Windows 中每一个分区都对应一个盘符，盘符下面可以存放目录与文件，某个文件的绝对路径以盘符开始。而在 Linux 中，以树状结构表示文件夹和目录，没有盘符的概念。比如：/abc/def/hello.txt，这表示在根目录下有 abc 子目录，而 abc 下又有 def 目录； def 中有 hello.txt 文件。从名字 "/abc/def/hello.txt" 中你无法知道 hello.txt 文件位于磁盘哪一个分区。如果你想查看某个分区挂载哪一个目录下，可以执行命令 `df -h` 来查看。对于普通用户，在 Ubuntu 下不再关心分区、盘符。需要关心的是哪个目录存什么。

Ubuntu 中的目录遵循 FHS 标准（Filesystem Hierarchy Standard，文件系统层次标准）。它定义了文件系统中目录、文件分类存放的原则、定义了系统运行所需的最小文件、目录的集合，并列举了不遵循这些原则的例外情况及其原因。FHS 并不是一个强制标准，但是大多的 Linux、Unix 发行版本遵循 FHS。这些目录的简单介绍如下图：

![Pasted image 20250307142704.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250307142704.png)


