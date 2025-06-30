---
{"dg-publish":true,"dg-path":"软件工程/Lisp Operating System（Lisp 操作系统）.md","permalink":"/软件工程/Lisp Operating System（Lisp 操作系统）/","created":"2025-04-24T10:57:26.000+08:00","updated":"2025-06-11T10:51:23.000+08:00"}
---

#Innolight #Lisp 

A Lisp Operating System (LispOS for short) is not just another operating system that happens to be written in Lisp (although that would be a good thing in itself). A LispOS is also an operating system that uses the Lisp interactive environment as an inspiration for the interface between the user and the system, and between applications and the system.

Lisp 操作系统（简称 LispOS）不仅仅是一个碰巧用 Lisp 编写的操作系统（尽管这本身就是一个很好的事情）。LispOS 也是一种操作系统，它以 Lisp 交互式环境为灵感，设计用户与系统之间以及应用程序与系统之间的接口。

Below, we give some ideas on what a LispOS might contain, how it would be different from existing operating systems, and how such a system might be created.

在下面的内容中，我们将探讨 LispOS 可能包含的内容、它与现有操作系统有何不同，以及如何创建这样一个系统。

# The problem with existing systems（现有系统的问题）

## The concept of a process（进程的概念）

Most popular existing operating systems are derived from Unix which was written in the 1970s. The computers for which Unix was intended have a very small address space; too small for most usable end-user applications. To solve this problem, the creators of Unix used the concept of a process. A large application was written so that it consisted of several smaller programs, each of which ran in its own address space. These smaller programs would communicate by having one application write text to its output stream for another application to read. This method of communication was called a pipe and a sequence of small applications was called a pipeline. As a typical example of a chain of applications, consider the pipeline for producing a typeset document (one of the main applications for which Unix was designed). This chain had a program for creating tables (called tbl), a program for generating pictures (called pic), a program for generating equations (called eqn), and of course the typesetting program itself (called troff).

大多数流行的现有操作系统都源自于 20 世纪 70 年代编写的 Unix。Unix 所针对的计算机具有非常小的地址空间，小到不足以容纳大多数可用的终端用户应用程序。为了解决这个问题，Unix 的创造者引入了进程的概念。一个大型应用程序被编写成由几个较小的程序组成，每个程序都在自己的地址空间中运行。这些较小的程序通过一个程序将其输出流中的文本写入，供另一个程序读取来进行通信。这种通信方式被称为管道，而这一系列小型应用程序则被称为管道线。以生成排版文档的管道链为例（这是 Unix 设计的主要应用之一）。这个链包括一个用于创建表格的程序（称为 tbl）、一个用于生成图片的程序（称为 pic）、一个用于生成公式的程序（称为 eqn），当然还有一个排版程序本身（称为 troff）。

Using pipes to communicate between different components of an application has several disadvantages:

使用管道在应用程序的不同组件之间进行通信有以下几个缺点：

- To communicate complex data structures (such as trees or graphs), they must be converted to a stream of bytes by the creating component, and it must be analyzed and parsed into an equivalent data structure by the using component. Not only is this unparsing/parsing inefficient in terms of computing resources, but it is also problematic from a software-engineering point of view, because the external format must be specified and maintained as a separate aspect of each component.

- 要通信复杂的数据结构（如或图），创建组件必须将其转换为字节流，而使用组件必须分析并解析成等效的数据结构。这种反解析/解析不仅在计算资源方面效率低下，而且从软件工程的角度来看也是有问题的，因为外部格式必须作为每个组件的一个单独方面来指定和维护。

- An artificial order between the different components is imposed, so that components can not work as libraries that other components can use in any order. Sometimes (as in the example of the troff chain) the end result of a computation depends in subtle ways on the order between the components of the chain. Introducing a new component may require other components to be modified.

- 在不同组件之间强加了一种人为的顺序，使得组件不能像库一样被其他组件以任意顺序使用。有时（如在 troff 链的例子中），计算的结果在微妙的方面依赖于链中组件的顺序。引入一个新组件可能需要修改其他组件。

It is an interesting observation that in most text books on operating systems, the concept of a process is presented as playing a central role in operating-system design, whereas it ought to be presented as an unfortunate necessity due to the limited address space of existing minicomputers in the 1970s. It is also presented as the method for obtaining some kind of security, preventing one application from intentionally or accidentally modifying the data of some other application. In reality, there are several ways of obtaining such security, and separate address spaces should be considered to be a method with too many disadvantages.

有趣的是，在大多数操作系统教科书中，进程的概念被呈现为操作系统设计的核心要素，而它应该被呈现为由于 20 世纪 70 年代现有小型计算机地址空间有限而产生的不幸的必要性。它还被呈现为获得某种安全性的唯一方法，防止一个应用程序故意或意外地修改另一个应用程序的数据。实际上，获得这种安全性的方法有多种，而单独的地址空间应该被视为一种缺点过多的方法。

Nowadays, computers have addresses that are 64 bit wide, making it possible to address almost 20 exabytes of data. To get an idea of the order of magnitude of such a number, consider a fairly large disc that can hold a terabyte of data. Then 20 million such discs can be directly addressed by the processor. We can thus consider the problem of too small an address space to be solved.

如今，计算机的地址宽度为 64 位，这使得可以寻址近 20 艾字节的数据。为了了解这样一个数字的量级，考虑一个可以容纳 1 太字节的数据的相当大的磁盘。那么 2000 万个这样的磁盘可以直接被处理器寻址。因此，我们可以认为地址空间过小的问题已经得到解决。
## Hierarchical file systems（层次化文件系统）

Existing operating system come with a hierarchical file system. There are two significant problems, namely hierarchical and file.

现有的操作系统都带有层次化文件系统。有两个显著的问题，分别是层次化和文件。

The hierarchy is also a concept that dates back to the 1970s, and it was considered a vast improvement on flat file systems. However, as [this article](http://www.shirky.com/writings/ontologyoverrated.html) clearly explains, most things are not naturally hierarchical. A hierarchical organization imposes an artificial order between names. Whether a document is called Lisp/Programs/2013/stuff, Programs/Lisp/2013/stuff, 2013/Programs/Lisp/stuff, etc., is usually not important.

层次化这个概念也可以追溯到 20 世纪 70 年代，当时它被认为是平面文件系统的一个巨大改进。然而，正如[这篇文章](http://www.shirky.com/writings/ontologyoverrated.html)清楚地解释那样，大多数事物本质上并不是层次化的。层次化的组织强加了名称之间的认为顺序。一个文档被称为 Lisp/Programs/2013/stuff、Programs/Lisp/2013/stuff、2013/Programs/Lisp/stuff 等等，通常并不重要。

The problem with a file is that it is only a sequence of bytes with no structure. This lack of structure fits the Unix pipe model very well, because intermediate steps between individual software components can be saved to a file without changing the result. But it also means that in order for complex data structures to be stored in the file system, they have to be transformed into a sequence of bytes. And whenever such a structure needs to be modified by some application, it must again be parsed and transformed into an in-memory structure.

文件的问题在于它只是一个没有结构的字节序列。这种缺乏结构的特点非常适合 Unix 管道模型，因为单个软件组件之间的中间步骤可以保存到文件中而不改变结果。但这也意味着，为了将复杂的数据结构存储在文件系统中，它们必须被转换为字节序列。而且，每当某个应用程序需要修改这样的结构时，它必须再次被解析并转换为内存中的结构。
## Distinction between primary and secondary memory（主存储器和辅助存储器的区别）

Current system (at least for desktop computers) make a very clear distinction between primary and secondary memory. Not only are the two not the same, but they also have totally different semantics:

当前的系统（至少对于台式计算机来说）对主存储器和辅助存储器做出了非常明确的区别。不仅两者并不相同，而且它们的语义也完全不同：

- Primary memory is volatile. When power is turned off, whatever was in primary memory is lost.

- 主存储器是易失性的。当电源关闭时，主存储器中的内存会丢失。

- Secondary memory is permanent. Stored data will not disappear when power is turned off.

- 辅助存储器是永久性的。存储的数据在电源关闭后不会消失。

This distinction coupled with the semantics of the two memories creates a permanent conundrum for the user of most applications, in that if current application data is not saved, then it will be lost in case of power loss, and if it is saved, then previously saved data is forever lost.

这种区别以及两种存储器的语义，为大多数应用程序的用户带来了一个永久的困境：如果当前应用程序的数据没有保存，那么在电源丢失时它就会丢失；而如果已经保存，那么之前保存的数据将永远丢失。

Techniques were developed as early in the 1960s for presenting primary and secondary memory as a single abstraction to the user. For example, the Multics system had a single hierarchy of fixed-size byte arrays (called segments) that served as permanent storage, but that could also be treated as any in-memory array by applications. As operating systems derived from Unix became widespread, these techniques were largely forgotten.

早在 20 世纪 60 年代，就开发出了将主存储器和辅助存储器呈现为单一抽象的技术。例如，Multics 系统有一个单一的固定大小字节数组层次结构（称为段），它作为永久存储，但应用程序也可以将其视为任何内存数组。随着基于 Unix 的操作系统变得广泛流行，这些技术在很大程度上被遗忘了。

## The concept of a kernel（内核的概念）

The kernel of an operating system is a fairly large, monolithic program that is started when the computer is powered on. The kernel is not an ordinary program of the computer. It executes in a privileged state so that it has direct access to devices and to data structures that must be protected from direct use by user-level programs.

操作系统的内核是一个相当庞大、单一的程序，当计算机开机时启动。内核并不是计算机的普通程序。它以特权权限执行，因此可以直接访问设备以及必须受到保护、防止用户级程序直接使用的数据结构。

The very existence of a kernel is problematic because the computer needs to be restarted whenever the kernel is updated, and then all existing state is lost, including open files and data structures that reside in volatile memory. Some programs, such as web browsers, compensate somewhat for this problem by remembering the open windows and the links that were associated with each window.

内核的存在本身就是一个问题，因为每当内核更新时，计算机就需要重启，然后所有现有的状态都会丢失，包括打开的文件和存储在易失性内存中的数据结构。有些程序，比如网络浏览器，通过记住打开的窗口以及每个窗口相关联的链接，来一定程度上弥补这个问题。

The fact that the kernel is monolithic poses a problem because when code needs to be added to the kernel in the form of a kernel module, such code has full access to the entire computer system. This universal access represents a security risk, of course, but more commonly, it can be defective and then it will fail often by crashing the entire computer.

内核是单一的这一事实带来了问题，因为当需要以内核模式的形式向内核添加代码时，这样的代码可以完全访问整个计算机系统。这种普遍的访问权限当然代表了一种安全风险，但更常见的是，它可能会有缺陷，然后它通常会通过导致整个计算机崩溃而失败。

We have had solutions to this problem for many decades. The Multics system, for example, did not have a kernel at all. An interrupt or a system call was executed by the user-level process that issued the system call or that happened to be executing when the interrupt arrived. The code that executed then was not part of a monolithic kernel, but existed as independent programs that could be added or replaced without restarting the system. The system could still crash, of course, if some essential system-wide data structure was corrupted, but most of the time, only the user-level process that issued the request would crash.

我们已经拥有解决这个问题的方案几十年了。例如，Multics 系统根本就没有内核。中断或系统调用由发出系统调用的用户级进程或在中断到达时正在执行的进程来执行。当时执行的代码并不是单一内核的一部分，而是作为独立的程序存在，可以在不重启系统的情况下添加或替换。当然，如果某些关键的系统范围的数据结构被破坏，系统仍然可能会崩溃，但大多数情况下，只有发出请求的用户级进程会崩溃。
## Monolithic applications（单体应用程序）

Applications in current operating systems are written in low-level languages such as C or C++. An application is built using techniques from more than half a century ago where source code is compiled to object code and then linked to produce an executable file meant to run in its own dedicated address space.

当前操作系统中的应用程序是用低级语言（如 C 或 C++）编写的。应用程序的构建使用了半个多世界前的技术，其中源代码被编译成目标代码，然后链接以生成一个旨在其自己的专用地址空间中运行的可执行文件。

Aside from system calls, all code in an application is run in one single address space. Together with the fact that low-level languages are used, this organization makes the application vulnerable to viruses and other security-related attacks. A typical attack exploits the vulnerability to buffer overflow which is due to the fact that the programming language used to write the application does not insert boundary checks for arrays, requiring the programmer to do that with explicit code, which is therefore frequently not done.

除了系统调用之外，应用程序中所有代码都在一个单一的地址空间中运行。再加上使用了低级语言，这种组织方式使应用程序容易受到病毒和其他安全相关攻击的侵害。典型的攻击利用了对缓冲区溢出的漏洞，这是由于编写应用程序所用的编程语言没有为数组插入边界检查，需要程序员用显式代码来完成，因此通常没有做到。

A buffer overflow in such an application can be exploited in order to modify the execution of the program so that code that was not intended by the application writer is executed in place of the intended application code. Such modification is possible because the execution stack is part of the application address space, and the execution stack contains addresses of code to be executed later, so that the application has direct access to these code addresses.

在这样的应用程序中，缓冲区溢出可以被利用来修改程序的执行，以便用应用程序编写者未打算执行的代码替换原本的应用程序代码。这种修改是可能的，因为执行栈是应用程序地址空间的一部分，而执行栈包含了稍后要执行的代码的地址，因此应用程序可以直接访问这些代码地址。

In a Lisp operating system, the stack is not accessible to application code. It is therefore not possible to alter addresses on the stack representing code to be executed later. Furthermore, the programming language automatically checks boundaries of arrays, so that buffer overflows are not possible.

在 Lisp 操作系统中，栈对应用程序代码是不可访问的。因此，不可能改变栈上代表稍后要执行的代码的地址。此外，编程语言会自动检查数组的边界，因此不可能发生缓冲区溢出。

An application in a Lisp operating system is not built as a monolithic executable meant to execute in its own address space. Instead, an application consists of a large number of objects whose addresses are protected by the system and not directly accessible to application code. The most common techniques for security attacks are therefore not possible in such a system.

Lisp  操作系统中的应用程序并不是作为一个旨在其自己的地址空间中运行的单体可执行文件构建的。相反，应用程序由大量对象组成，这些对象的地址受到系统的保护，应用程序代码无法直接访问。因此，在这样的系统中，最常见的安全攻击技术是不可能实现的。

# Objectives for a Lisp operating system（Lisp 操作系统的目标）

The three main objectives of a Lisp operating system correspond to solutions to the two main problems with exiting systems as indicated in the previous section.

Lisp 操作系统的三个主要目标对应于上一节中提到的现有系统的两个主要问题的解决方案。
## Single address space（单一地址空间）

Instead of each application having its own address space, we propose that all applications share a single large address space. This way, applications can share data simply by passing pointers around, because a pointer is globally valid, unlike pointers in current operating systems.

我们建议，与其让每个应用程序都有自己的地址空间，不如让所有应用程序共享一个单一的大型地址空间。这样，应用程序可以通过传递指针来共享数据，因为指针是全局有效的，与当前操作系统中的指针不同。

Clearly, if there is a single address space shared by all applications, there needs to be a different mechanism to ensure protection between them so that one application can not intentionally or accidentally destroy the data of another application. Most high-level programming languages (in particular Lisp, but also Java, and many more) propose a solution to this problem by simply not allowing users to execute arbitrary machine code. Instead, they allow only code that has been produced from the high-level notation of the language and which excludes arbitrary pointer arithmetic so that the application can only address its own data. This technique is sometimes called "trusted compiler".

显然，如果所有应用程序共享一个单一的地址空间，就需要有一种不同的机制来确保它们之间的保护，以防止一个应用程序故意或意外地破坏另一个应用程序的数据。大多数高级编程语言（特别是 Lisp，但也有 Java 和许多其他语言）提出了一个解决方案，即简单地不允许用户执行任意及其代码。相反，它们只允许执行从语言的高级符号生成的代码，并且排除任意指针运算，以便应用程序只能访问自己的数据。这种技术有时被称为“可信编译器”。

It might sometimes be desirable to write an application in a low-level language like C or even assembler, or it might be necessary to run applications that have been written for other systems. Such applications could co-exist with the normal ones, but they would have to work in their own address space as with current operating systems, and with the same difficulties of communicating with other applications.

有时可能希望用低级语言（如 C 或甚至汇编语言）编写应用程序，或者可能需要运行为其他系统编写的应用程序。这样的应用程序可以与正常的应用程序共存，但它们必须像当前操作系统一样在自己的地址空间中工作，并且在与其他应用程序通信时也会遇到同样的困难。

## Object store based on tags（基于标签的对象存储）

Instead of a hierarchical file system, we propose an object store which can contain any objects. If a file (i.e. a sequence of bytes) is desired, it would be stored as an array of bytes.

我们建议用一个对象存储来代替层次化文件系统，它可以包含任何对象。如果需要文件（即字节序列），它将被存储为一个字节数组。

Instead of organizing the objects into a hierarchy, objects in the store can optionally be associated with an arbitrary number of tags. These tags are key/value pairs, such as for example the date of creation of the archive entry, the creator (a user) of the archive entry, and the access permissions for the entry. Notice that tags are not properties of the objects themselves, but only of the archive entry that allows an object to be accessed. Some tags might be derived from the contents of the object being stored such as the sender or the date of an email message. It should be possible to accomplish most searches of the store without accessing the objects themselves, but only the tags. Occasionally, contents must be accessed such as when a raw search of the contents of a text is wanted.

而不是将对象组织成层次结构，存储中的对象可以选择性地与任意数量的标签相关联。这些标签时键/值对，例如，存储条目的创建日期、存档条目的创建者（一个用户）以及条目的访问权限。请注意，标签不是对象本身的属性，而是允许访问对象的存档条目的属性。有些标签可能从存储对象的内容中派生而来，例如电子邮件消息的发件人或日期。应该可以在不访问对象本身的情况下，仅通过标签完成大多数对存储的搜索。偶尔需要访问内容，例如当需要对文本内容进行原始搜索时。

It is sometimes desirable to group related objects together as with directories of current operating systems. Should a user want such a group, it would simply be another object (say instances of the class directory) in the store. Users who can not adapt to a non-hierarchical organization can even store such directories as one of the objects inside another directory.

有时希望将相关对象组合在一起，就像当前操作系统的目录一样。如果用户想要这样的组合，它只是存储中的另一个对象（比如类目录的实例）。无法适应非层次化组织的用户甚至可以将这样的目录存储为另一个目录中对象。

Here are some examples of possible keyword/value pairs, how they might be used, and what kinds of values are permitted:

以下是一些可能的键/值对示例、它们的用途以及允许的值类型：

| Keyword                                                                                         | Possible values                                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **category**                                                                                    | The nature of the object such as **movie**, **music**, **article**, **book**, **user manual**, **dictionary**, **course**, **lecture**, **recipe**, **program**, **bank statement**, **email**. These would be chosen from an editable set that is defined per user.                                                                                                                                                 |
| **name**                                                                                        | A string that is displayed with the object, such as "A Dramatic Turn of Events", "Three seasons", "Alternative energy".                                                                                                                                                                                                                                                                                              |
| **author**                                                                                      | An object identifying a person, an organization, a company, etc.                                                                                                                                                                                                                                                                                                                                                     |
| **genre**. Can be used for movies, music albums, programs, articles, etc.                       | **progressive metal**, **science**, **algorithms**, **garbage collection**, **game**, **programming language implementation**, **operating system**. These would be chosen from an editable set that is defined per user.                                                                                                                                                                                            |
| **format**                                                                                      | This tag can be used to identify the file type of documents such as **PDF**, **ogg/vorbis**, **MPEG4** **PNG**, in which case the tag can be assigned automatically, but also to identify the source format of files in a directory containing things like articles or user manuals, for example **LaTeX**, **Texinfo**, **HTML**. These would be chosen from an editable set that is defined per user.              |
| **date of creation**                                                                            | A date interval.                                                                                                                                                                                                                                                                                                                                                                                                     |
| **composer**. Used for music.                                                                   | An object representing a person. On a compilation album there can be more than one tag of this kind.                                                                                                                                                                                                                                                                                                                 |
| **language**.                                                                                   | An object representing a natural language such as **English**, **Vietnamese**, or a programming languages such as **Lisp**, **Python**. These would be chosen from an editable set that is defined per user. If appropriate, a document can have several of these tags, for instance if some program uses multiple programming languages, or if a document is written using several languages, such as a dictionary. |
| **duration**. Can be used for things like movies or music albums.                               | An object representing a duration.                                                                                                                                                                                                                                                                                                                                                                                   |
| **source control**. Can be used for any documents that use source control such a programs, etc. | **GIT**, **SVN**, **CVS**, **darks**, etc. These would be chosen from an editable set that is defined per user.                                                                                                                                                                                                                                                                                                      |

| 键    | 可能的值                                                                                                                                                           |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 类别   | 对象的性质，如**电影**、**音乐**、**文章**、**书籍**、**用户手册**、**字典**、**课程**、**讲座**、**食谱**、**程序**、**银行对账单**、**电子邮件**。这些将从每个用户定义的可编辑集合中选择。                                         |
| 名称   | 与对象一起显示的字符串，如“A Dramatic Turn of Events”、“Three seasons”、“Alternative energy”。                                                                                 |
| 作者   | 识别一个人、一个组织、一个公司等的对象。                                                                                                                                           |
| 类型   | 可用于电影、音乐专辑、程序、文章等。**前卫金属**、**科学**、**算法**、**垃圾回收**、**游戏**、**编程语言实现**、**操作系统**。这些将从每个用户定义的可编辑集合中选择。                                                              |
| 格式   | 此标签可用于识别文档的文件类型，如**PDF**、**ogg/vorbis**、**MPEG4**、**PNG**，在这种情况下，标签可以自动分配，也可以用于识别目录中文件的源格式，例如包含文章或用户手册的目录中的**LaTeX**、**Texinfo**、**HTML**。这些将从每个用户定义的可编辑集合中选择。 |
| 创建日期 | 一个日期区间。                                                                                                                                                        |
| 作曲家  | 用于音乐。代表一个人的对象。在合辑专辑中可以有多个这种类型的标签。                                                                                                                              |
| 语言   | 代表自然语言（如**英语**、**越南语**）或编程语言（如**Lisp**、**Python**）的对象。这些将从每个用户定义的可编辑集合中选择。如果合适，文档可以有多个这样的标签，例如，如果某个程序使用多种编程语言，或者文档使用多种语言编写，如字典。                                |
| 时长   | 可用于电影或音乐专辑等。代表时长的对象。                                                                                                                                           |
| 版本控制 | 可用于使用版本控制的任何文档，如程序等。**GIT**、**SVN**、**CVS**、**darks**等。这些将从每个用户定义的可编辑集合中选择。                                                                                    |

When (a pointer to) an object is returned to a user as a result of a search of the object store, it is actually similar to what is called a "capability" in the operating-system literature. Such a capability is essentially only a pointer with a few bits indicating what access rights the user has to the objects. Each creator may interpret the contents of those bits as he or she likes, but typically they would be used to restrict access, so that for instance executing a reader method is allowed, but executing a writer method is not.

当（指向）一个对象作为对象存储搜索的结果返回给用户时，它实际上类似于操作系统文献中所说的“能力（capability）”。这种能力本质上只是一个带有几个位的指针，这些位表示用户对对象的访问权限。每个创建者可以根据自己的喜好解释这些位的内容，但通常它们会被用户来限制访问，例如，允许执行读取器方法，但不允许执行写入器方法。
## Single memory abstraction（单一存储器抽象）

Instead of two different memory abstractions (primary and secondary), the Lisp operating system would contain a single abstraction which looks like any interactive Lisp system, except that data is permanent.

与两种不同的存储器抽象（主存储器和辅助存储器）不同，Lisp 操作系统将包含一个单一的抽象，它看起来就像任何交互式的 Lisp 系统，只是数据是永久性的。

Since data is permanent, application writers are encouraged to provide a sophisticated undo facility.

由于数据是永久性的，应用程序编写者被鼓励提供一个复杂的撤销功能。

The physical main (semiconductor) memory of the computer simply acts as a cache for the disk(s), so that the address of an object uniquely determines where on the disk it is stored. The cache is managed as an ordinary virtual memory with existing algorithms.

计算机的物理主存储器（半导体存储器）仅仅作为磁盘的缓存，因此对象的地址唯一地决定了它在磁盘上的存储位置。缓存像普通的虚拟存储器一样管理，使用现有的算法。

## Other features（其他特性）

### Crash proof (maybe) 防崩溃（也许）

There is extensive work on crash-proof systems, be it operating systems or data base systems. In our opinion, this work is confusing in that the objective is not clearly stated.

在防崩溃系统方面有大量的工作，无论是操作系统还是数据库系统。在我们看来，这项工作令人困惑，因为没有明确说明。

Sometimes the objective is stated as the desire that no data be lost when power is lost. But the solution to that problem already exists in every laptop computer; it simply provides a battery that allow the system to continue to work, or to be shut down in a controlled way.

有时目标被表述为希望在电源丢失时不会丢失数据。但这个问题的解决方案已经存在于每台笔记本电脑中；它简单地提供了一个电池，允许系统继续工作，或者以受控的方式关机。

Other times, the objective is stated as a protection against defective software, so that data is stored at regular intervals (checkpointing) perhaps combined with a transaction log so that the state of the system immediately before a crash can always be recovered. But it is very hard to protect oneself against defective software. There can be defects in the checkpointing code or in the code for logging transactions, and there can be defects in the underlying file system. We believe that it is a better use of developer time to find and eliminate defects than to aim for a recovery as a result of existing defects.

其他时候，目标被表述为防止有缺陷的软件，以便数据可以定期存储（检查点）或许结合一个事务日志，以便在崩溃之前始终可以恢复系统的状态。但很难保护自己免受有缺陷的软件的侵害。检查点代码或事务日志代码可能存在缺陷，底层文件系统也可能存在缺陷。我们相信，开发人员的时间更好地用于查找和消除缺陷，而不是旨在因现有缺陷而恢复。

### Multiple simultaneous environments（多个同时环境）

To allow for a user to add methods to standard generic functions (such as print-object) without interfering with other users, we suggest that each user gets a different global environment. The environment maps names to objects such as functions, classes, types, packages, and more. Immutable objects (such as the common-lisp package) can exist in several different environments simultaneously, but objects (such as the generic function print-object would be different in different environments.

为了允许用户在不影响其他用户的情况下向标准通用函数（如 print-object）添加方法，我们建议每个用户获得一个不同的全局环境。环境将名称映射到对象，如函数、类、类型、包等。不可变对象（如 common-lisp 包）可以同时存在于多个不同的环境中，但对象（如通用函数 print-object）在不同的环境中会有所不同。

Multiple environments would also provide more safety for users in that if a user inadvertently removes some system feature, then it can be recovered from a default environment, and in the worst case a fresh default environment could be installed for a user who inadvertently destroyed large parts of his or her environment.

多个环境还可以为用户提供更多的安全性，因为如果用户不小心移除了一些系统功能，那么可以从默认环境中恢复，而在最坏的情况下，可以为不小心破坏了大部分环境的用户安装一个新的默认环境。

Finally, multiple environments would simplify experimentation with new features without running the risk of destroying the entire system. Different versions of a single package could exist in different environments.

最后，多个环境将简化对新功能的实验，而不会冒着破坏整个系统的风险。一个包的不同版本可以存在于不同的环境中。
# How to accomplish it（如何实现）

The most important aspect of a Lisp operating system is not that all the code be written in Lisp, but rather to present a Lisp-like interface between users and the system and between applications and the system. It is therefore legitimate to take advantage of some existing system (probably Linux or some BSD version) in order to provide services such as device drivers, network communication, thread scheduling, etc.

Lisp 操作系统最重要的方面不是所有代码都用 Lisp 编写，而是要在用户与系统之间以及应用程序与系统之间提供类似 Lisp 的接口。因此，利用现有的某些系统（可能是 Linux 或某种 BSD 版本）来提供诸如设备驱动程序、网络通信、线程调度等服务是合理的。
## Create a Lisp system to be used as basis（创建一个用作基础的 Lisp 系统）

The first step is to create a Common Lisp system that can be used as a basis for the Lisp operating system. It should already allow for multiple environments, and it should be available on 64-bit platforms. Preferably, this system should use as little C code as possible and interact directly with the system calls of the underlying kernel.

第一步是创建一个可以用作 Lisp 操作系统基础的 Common Lisp 系统。它应该已经允许有多个环境，并且应该在 64 位平台上可用。最好，这个系统尽可能少地使用 C 代码，并直接与底层内核的系统调用交互。
## Create a single-user system as a Unix process（创建一个作为 Unix 进程的单用户系统）

The next step is to transform the Common Lisp system into an operating system in the sense of the API for users and applications. This system would contain the object store, but perhaps not access control functionality.

下一步是将 Common Lisp 系统转变为一个从用户和应用程序的 API 来说的操作系统。这个系统将包含对象存储，但可能没有访问控制功能。

When this step is accomplished, it is possible to write or adapt applications such as text editors, inspectors, debuggers, GUI interface libraries, etc. for the system.

完成这一步后，就可以编写或改编诸如文本编辑器、检查器、调试器、图形用户界面库等应用程序用于该系统。
## Create device drivers（创建设备驱动程序）

The final step is to replace the temporary Unix kernel with native device drivers for the new system and to turn the system into a full multi-user operating system.

最后一步是用新系统的本地设备驱动程序替换临时的 Unix 内核，并将系统转变为一个完整的多用户操作系统。