---
{"dg-publish":true,"dg-path":"03 - 工具教程/如何开启 Ubuntu RDP 远程桌面.md","permalink":"/03 - 工具教程/如何开启 Ubuntu RDP 远程桌面/","created":"2023-12-05T09:35:25.000+08:00","updated":"2024-02-28T13:24:42.000+08:00"}
---

#Technomous #Linux 

Ubuntu 22.04 之后可以开启内置的微软的远程桌面 RDP 协议。本教程将详细介绍如何开启 RDP 远程桌面功能以及锁屏后的连接方案。

# 开启远程桌面

通过 Ubuntu 的 Settings -> Sharing 打开 Remote Desktop 和 Remote Control 功能，同时设置好 User Name 和 Password 即可。之后便可通过 Windows 自带的 Remote Desktop Connection 工具远程连接到 Ubuntu 了。

![Pasted image 20231205094935.png|650](/img/user/0.Asset/resource/Pasted%20image%2020231205094935.png)

# 锁屏连接方案

Ubuntu 为了安全考虑，在 Ubuntu 锁屏之后会将远程连接强制断开。为了解决这个问题，我们通过 extension manger 安装 allow locked remoted desktop 插件。注意安装过程中关闭代理功能，否则搜索的时候 extension manager 会闪退。

- 安装 extension manager

``` shell
sudo apt install gnome-shell-extensions
```

- 安装 allow locked remoted desktop

![Pasted image 20231205100418.png|650](/img/user/0.Asset/resource/Pasted%20image%2020231205100418.png)

# 其他远程方案

以上即为 Ubuntu 开启 [RDP](https://learn.microsoft.com/zh-cn/troubleshoot/windows-server/remote/understanding-remote-desktop-protocol) 远程桌面的详细教程。远程桌面协议不止 RDP 一种，还有 VNC 等其他方案。VNC 方案可以通过 VNC Server 和 VNC Client 相互配合实现。