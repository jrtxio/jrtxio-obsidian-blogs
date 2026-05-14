---
{"dg-publish":true,"dg-path":"Linux 上使用 Androidstudio 时启动模拟器报错.md","permalink":"/Linux 上使用 Androidstudio 时启动模拟器报错/","dg-note-properties":{"author":"吉人","created":"2016-04-06","source":null}}
---

> 两个方案解决 Linux 上 Android Studio 模拟器启动报错。

今天在 Deepin 上安装 Androidstudio 之后创建模拟器却一直无法启动，报错的问题大致如下所示

> **Cannot launch AVD in emulator. Output: libGL error: unable to load driver: i965_dri.so**

这个简单来说就是驱动问题，具体的原因我就不深究了，提供两种解决的办法。

- 方法一、在 AVD 设置里面把 Graphics 的选项改为 "Software"

![Pasted image 20250926160534.png\|650](/img/user/0.asset/media/Pasted%20image%2020250926160534.png)
![Pasted image 20250926160540.png\|650](/img/user/0.asset/media/Pasted%20image%2020250926160540.png)

- 方法二

```text
  1. 从终端进入到sdk目录的tools/lib64/libstdc++目录下
  2. 输入以下两条指令
    mv libstdc++.so.6 libstdc++.so.6.bak
    ln -s /usr/lib64/libstdc++.so.6
```

![Pasted image 20250926160632.png\|650](/img/user/0.asset/media/Pasted%20image%2020250926160632.png)
