---
{"dg-publish":true,"dg-path":"04 工具教程/UNRAID 部署 DDNS 之 DNSPod.md","permalink":"/04 工具教程/UNRAID 部署 DDNS 之 DNSPod/","created":"2023-09-08T16:58:58.000+08:00","updated":"2024-02-28T13:21:07.000+08:00"}
---

#BDStar

当你在家里部署了 Unraid 之后，可能需要在外网访问搭建的一些服务。目前的解决方案无非就是内网穿透和 DDNS 两种。如果你满足了以下两个条件，就可以尝试在 Unraid 的容器下部署 DNSPod 的 DDNS：

- 动态的公网 IP
- 托管在 DNSPod 的域名

废话不多说，让我们进入正题。

# 新建容器

![Pasted image 20230908170026.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230908170026.png)

进入 Unraid 的 Docker 页面，点击 Add Container，新建一个容器。

# 参数设置

如果你不知道如何新建参数，建议先学习一下B站司波图的 [Docker速通教程](https://www.bilibili.com/video/BV1eE411i7qy/?spm_id_from=333.788.videocard.1)。

![Pasted image 20230908170147.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230908170147.png)

# 仓库信息

1. Name
这个参数随便写，我这里填 dnspod。
2. Repository
仓库地址一定要填写正确，我使用的 Docker 仓库名称是 [scofieldpeng/dnspod-ddns](https://hub.docker.com/r/scofieldpeng/dnspod-ddns)，详细信息可以到 dnspod-ddns 主页查看。
3. Network Type
网络类型根据自己的需要进行选择，这里我选择 Custom:br0 。因为我希望路由器能为它单独分配一个 IP，而不是和 Unraid 使用同一个。
4. Fixed IP address (optional)
这里填写想要被分配的 IP，也就是图中填写的 192.168.96.120。

# 运行参数

从 dnspod-ddns 介绍中，可以获取到该 docker 的启动命令：

``` docker
docer run --name=ddns --restart=always -d \
    -e DNSPOD_ID=${DNSPOD_ID} \
    -e DNSPOD_TOKEN=${DNSPOD_TOKEN} \
    -e DNSPOD_DOMAIN=${DNSPOD_DOMAIN} \
    -e DNSPOD_SUBDOMAIN=${DNSPOD_SUBDOMAIN} \
    -e DNSPOD_EMAIL=example@example.com \
    scofieldpeng/dnspod-ddns:1.0.0
```

新建五个与之对应的参数：

新建参数之前，还需要到 [DNSPod支持页面](https://docs.dnspod.cn/account/5f2d466de8320f1a740d9ff3 )获取 ID 和Token。

1. DNSPOD_ID
这个参数填写从 DNSPod 获取到的 ID。
2. DNSPOD_TOKEN
这个参数填写从 DNSPod 获取到的 Token。
3. DNSPOD_DOMAIN
这个参数填写在 DNSPod 托管的主域名。
4. DNSPOD_SUBDOMAIN
这个参数填写 @ ，表示直接解析主域名。直观来讲就是，比如上面填写的主域名是 jrtx.tech，那么后面就可以直接利用 jrtx.tech 加上端口号访问相应的服务了。
5. DNSPOD_EMAIL
这个参数填写你的邮箱。

![Pasted image 20230908170734.png|650](/img/user/0.Asset/resource/Pasted%20image%2020230908170734.png)

当你新建完以上五个参数之后，点击 Apply 按钮，就会开始下载 [dnspod-ddns](https://hub.docker.com/r/scofieldpeng/dnspod-ddns) 了。下载完成后，点击 Done 按钮，页面会跳转到 Unraid 的 Docker 主页面。至此，整个安装过程已结束。

# 问题排查

如果域名已经解析成功，可以从容器的 log 看到相应的提示信息。如果容器一直停止运行，那么很有可能是参数设置有问题或者填写的值不正确。