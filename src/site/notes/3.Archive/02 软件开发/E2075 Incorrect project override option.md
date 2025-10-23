---
{"dg-publish":true,"dg-path":"02 软件开发/E2075 Incorrect project override option.md","permalink":"/02 软件开发/E2075 Incorrect project override option/","created":"2025-09-26T16:07:39.109+08:00","updated":"2025-10-23T19:05:18.385+08:00"}
---

#Innolight

最近遇到了一个 C++ Builder 6 编译错误：E2075 Incorrect project override option，以下是解决方案的记录。

# 错误提示

```
[C++ Error] E2075 Incorrect project override option: Files\Borland\CBuilder6\lib\vcl60.csm
[C++ Error] E2075 Incorrect project override option: Files\Borland\CBuilder6\lib\vcl60.csm
[C++ Error] Project1.cpp(28): E2451 Undefined symbol 'exception'
```

# 解决方法

打开 Project > Options > Compiler ，然后将 Pre-compiled headers 选项设置为 None，并且选择左下角的 Default 选项。

如下图所示：

![Pasted image 20250926160845.png](/img/user/0.Asset/resource/Pasted%20image%2020250926160845.png)


再次运行之后，没有任何 Warning 或者 Error。
