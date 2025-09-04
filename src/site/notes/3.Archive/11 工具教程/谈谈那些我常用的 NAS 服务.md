---
{"dg-publish":true,"dg-path":"11 工具教程/谈谈那些我常用的 NAS 服务.md","permalink":"/11 工具教程/谈谈那些我常用的 NAS 服务/","created":"2023-09-08T16:17:04.000+08:00","updated":"2025-05-16T21:52:16.934+08:00"}
---

#BDStar

目前家里的 NAS 已经稳定运行将近一年了，上面搭建的服务已经深深融入到工作、娱乐中。今天就来给大家简要介绍一下这些服务。

# 导航页

![Pasted image 20230908161735.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230908161735.png)

导航页汇集了我平时常用的服务，只需要记住导航页的 URL 就可以轻松访问到这些服务。

# My Blog

![Pasted image 20230908161838.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230908161838.png)

博客搭建在群晖的 Web Station 上，用来记录一些教程，经验和感悟。

# Note Station

![Pasted image 20230908161920.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230908161920.png)

这是群晖自带的笔记应用，基本上可以当作印象笔记的替代品。平时会利用它的 Todo List 功能来做每日/周/月的工作计划，也会利用它的笔记本来写工作总结。令人兴奋的是它还支持像印象笔记一样的网页裁剪功能。

# Code Server

![Pasted image 20230908162003.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230908162003.png)

Docker 版的 Code Server，可以用来写一些简单的代码。利用它就可以在 iPad上愉快地写代码啦。

# File Browser

![Pasted image 20230908162044.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230908162044.png)

File Browser 当作 Unraid 的文件管理器来使用，可以在线播放视频，查看文档，生成分享链接等。

# FreeRSS

![Pasted image 20230908162122.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230908162122.png)

FreeRSS 是一款免费的 RSS 阅读器，平时关注的所有博客都会用它来集中管理。

# Unraid

![Pasted image 20230908162202.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230908162202.png)

我的主力 Nas 为 Unraid，基本上所有的服务都搭建在上面。

# Resilio Sync

![Pasted image 20230908162240.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230908162240.png)

文件同步及重要文件备份主要是靠 Resilio Sync。我分别在 Unraid、群晖、家里的台式机、公司的台式机、以及自己的笔记本上做多端同步，这样我就可以在多地无缝切换工作环境，同时也不用担心重要文件丢失问题。

# 群辉

![Pasted image 20230908162310.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230908162310.png)

群晖运行在猫盘上，用来搭建博客和 Resilio Sync 的文件同步等。

# OpenWRT

![Pasted image 20230908162340.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230908162340.png)

因为有时会需要特殊的网络环境来支撑这些服务，所以用软路由来做主路由器。

# MusicPlayer

![Pasted image 20230908162419.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230908162419.png)

MusicPlayer 是一个在线音乐播放器，可以在线搜索网易云、QQ、虾米、酷狗、百度音乐，也可以同步自己的网易云歌单。

# emby

![Pasted image 20230908162530.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230908162530.png)

emby 主要让好友可以在任何地方访问到共享影音库。

# Plex

![Pasted image 20230908162617.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230908162617.png)

Plex 用来满足自己的影音需求。它真正做到了跨平台，你可以在官网找到所有平台的客户端。相较于emby，体验更好。购买了 Plex 高级会员之后可以多端同步影视剧观看进度，更重要的是可以搭建自己的照片库。

# AriaNG

![Pasted image 20230908162701.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230908162701.png)

AriaNG 的一款优秀的 aria2 的 Web 客户端，可以用来下载一些影视资源。

# Transmission

![Pasted image 20230908162826.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230908162826.png)

一款优秀的 BitTorrent 客户端，支持多种链接格式。

# Download Station

![Pasted image 20230908162908.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230908162908.png)

群晖自带的一款下载工具，可以利用手机客户端 DS Mobile 进行操作。

# youtube-dl-server

![Pasted image 20230908162956.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230908162956.png)

youtube-dl 是一款非常好用的视频下载工具，不要被它的名字所迷惑，实际上它支持全世界几百个视频网站的下载。

以上介绍的所有服务，除了博客以及群晖自带的应用，均利用 Unraid 的 Docker 功能搭建。折腾家里 NAS的时候一定要结合自己的需求，不要盲目的折腾。因为有些服务后期可能面临无人维护的窘境，导致你所有的努力都白费。当一切搭建好之后，你会发现之前所做的努力都是值得的，因为这些服务会融入到你的工作、娱乐当中，让你生活更加的便利。