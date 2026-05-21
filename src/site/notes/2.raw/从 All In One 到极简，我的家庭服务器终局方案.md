---
{"dg-publish":true,"dg-path":"从 All In One 到极简，我的家庭服务器终局方案.md","permalink":"/从 All In One 到极简，我的家庭服务器终局方案/","dg-note-properties":{"author":"吉人","created":"2019-05-09","source":null}}
---

## All In One 的代价

折腾家庭服务器这几年，学到最贵的一课：**把网络、NAS、软路由全塞进一台机器里，宕机一次，所有服务同时消失**。

2020 年组装了第一台服务器，ASRock Rack E3C232D2I 主板，机柜里塞了光猫、软路由、交换机、华硕路由器当 AP、UPS 和树莓派。目标是 All In One——一台机器解决一切。

## 折腾的代价

底层选了 ESXi，上面跑 Ubuntu Server、Win 10（体验太差又换 XP）、Hexo 博客。NAS 用 FreeNAS，阵列卡选型第一个坑就来了。买了 LSI 9260-8i，发现不支持直通，问淘宝店家，答曰不会。退掉换 LSI 9205-8i，又发现直通后没存储池装系统，最后把固态挪到主板 SATA 口才解决。

NAS 系统也反复横跳：FreeNAS 太复杂，换 OMV，换回直通卡后又装回 FreeNAS。软路由试过 iKuai 加 LEDE，多拨测试不稳定，放弃。内网穿透用过华硕 DDNS、阿里云 DDNS、树莓派跑 FRP 三种方案并行。

ESXi 上同时跑着 Ubuntu、XP、OMV、LEDE，路由、DNS、科学上网、NAS 全在一台机器上。听起来很美，实际上——服务器死机时外网访问断、科学上网断、DNS 断，连排查问题都要先物理接触机器。

## 减法

推翻重来。**网络归网络，存储归存储，彻底分离。**

硬路由接管拨号和 DHCP，科学上网的需求独立出去。NAS 只干存储和服务的活，系统换成 Unraid。Unraid 不追求性能极致，但对家庭场景足够用：磁盘可以不同容量混搭、单盘故障不影响其他数据、Docker 部署方便。

![home-network-architecture.png\|650](/img/user/0.asset/media/home-network-architecture.png)

外网访问方案也简化了。之前写过一篇 Unraid 部署 DNSPod DDNS 的教程，现在换成了 ddns-go，同样是 Docker 容器，配置更直观。硬路由做端口映射到 Nginx，Nginx 反代到各服务，部分服务用域名加端口直接访问。

## 最终只留了这些

在 Unraid 上对 Docker 服务非常克制，目前跑了这些：

- ddns-go：自动更新域名解析，替代了之前树莓派上跑的脚本
- nginx：导航页托管，外网/内网双视图切换，反代到各个服务
- plex-media-server：影音播放
- transmission：BT 下载
- resilio-sync：多端文件同步，在家里和公司的电脑之间自动同步
- filebrowser：文件管理，偶尔传文件用
- mt-photos + mt-photos-ai + mt-photos-insightface：照片管理三件套，AI 负责人脸识别和分类
- memos：随手记，替代了之前的笔记方案
- excalidraw：白板，画流程图用
- baidunetdisk：百度网盘
- rustdeskserver-aio：远程桌面，备用

看着有十几个服务，但都是「设完即忘」类型。除了 Transmission 偶尔清理做种任务，其他服务两年没打开过管理页面。

## 六年后的结论

这套方案跑了快六年，几乎零维护，电费每月 15 元左右。

折腾服务器最大的教训：**复杂系统不是能力的体现，是维护成本的预支。**

每次想加新服务，先问自己三个问题：它宕机了会影响其他服务吗？我愿意花时间维护它吗？现有服务能不能替代？三个问题过一遍，能加进来的寥寥无几。

All In One 听起来省事，实际是把所有风险集中在一台机器上。网络和应用彻底分开之后，哪怕 NAS 挂了，家里网络照常运转，手机 WiFi 正常，只是外网访问不了服务而已。这才是家庭服务器该有的样子。
