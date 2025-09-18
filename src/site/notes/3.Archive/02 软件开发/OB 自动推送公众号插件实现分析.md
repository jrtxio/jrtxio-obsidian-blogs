---
{"dg-publish":true,"dg-path":"02 软件开发/OB 自动推送公众号插件实现分析.md","permalink":"/02 软件开发/OB 自动推送公众号插件实现分析/","created":"2025-03-06T09:17:16.875+08:00","updated":"2025-04-02T14:40:18.390+08:00"}
---

#Innolight

# 实现方案分析

1. 实现微信发布公众号文章有两个路径，一个是通过后台登陆，另一个是通过订阅号 API 
2. 后台登陆的问题在于通过浏览器获取用户登陆信息比较困难，至于文章的推送可以通过 HTTP 直接将文章推送上去
3. 订阅号 API 实现的方式比较符合预期，但是微信需要在后台添加的 IP 白名单内才能推送文章上去。这种就需要考虑搭建云服e务器来充当中间代理的形式来实现整个链路。增加了开销及技术实现难度

# 难点解决方案

-  扫码登陆方案
OB 本身其实就是个浏览器，根据 [obsidian-weread-plugin](https://github.com/zhaohongxuan/obsidian-weread-plugin) 的思路，通过让用户扫描二维码的方式登陆，然后借鉴 [Wechatsync](https://github.com/wechatsync/Wechatsync) 的同步方式将文章推送上去即可。这种方式是一个接近完美方案。

- 官方 API 方案
通过官方 API 方案去实现更加简单优雅，可以通过代理服务器的方式为用户提供付费功能，是一个可持续的方案。但是缺点是微信的思路只是为开发者提供的接口，后期可能会产生变化使整个方案失效，同时后台的白名单限制让整个技术实现更加复杂，需要中间搭建一个代理服务器。作为付费方案，存在一定的风险，用户无法完全信任第三方服务。

# 技术目标分解

- [ ] 学习创建一个自己的 OB 插件
- [ ] 学习 TypeScript 的基本语法
- [ ] 学习 obsidian-weread-plugin 插件的扫码登陆实现
- [ ] 学习 Wechatsync 插件的文章同步原理
- [ ] 基于 obsidian-wechat-public-platform 进行修改达成初步的目标
- [ ] 学习 obsidian-digital-garden 的界面设计，将 obsdian-wechat-pulic-platform 改造成类似的样式

# 技术细节梳理

![[obsidian-wechat-publication-center.xmind]]

obsidian-digital-garden 的 Ribbon 按钮是用来获取所有文章的发布状态的，我这个插件打算用来当作推送文章的按钮。所有标记了 wp-publish 的 formatter 文章，都可以无限次推送，只要当前草稿箱内没有当前文章。

我仅打算将笔记的文字和图片内容推送到公众号的草稿箱，然后由自己简单的修改后再手动发布。插件的主要目标是解决文章的推送和排版问题，而非直接发布文章。