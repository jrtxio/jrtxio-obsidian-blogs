---
{"dg-publish":true,"permalink":"/2.Process/OB 自动推送公众号插件实现分析/","created":"2025-03-06T09:17:16.875+08:00","updated":"2025-03-09T21:22:41.224+08:00"}
---

#Innolight

# 实现方案分析

1. 实现微信发布公众号文章有两个路径，一个是通过后台登陆，另一个是通过公众号 API 。
2. 后台登陆的问题在于通过浏览器获取用户登陆信息比较困难，至于文章的推送可以通过 HTTP 直接将文章推送上去，难度不是很大。
3. 公众号 API 实现的方式比较符合预期，但是微信需要在后台添加的 IP 白名单内才能推送文章上去。这种就需要考虑搭建云服务器来充当中间代理的形式来实现整个链路。增加了开销及技术实现难度。

# 最终实现方案

根据微信的思路，后台 API 只是提供给开发者调试用，后期可能会产生变动，从而导致整个方案失效，同时后台白名单的限制让整个方案复杂很多，需要通过服务器代理的方式来实现，这中间存在安全信任问题，用户可能无法完全信任。这个可以作为一个备选方案，用来作为后期付费的一个功能。目前主要考虑实现的方案如下：

OB 本身其实就是个浏览器，根据 [obsidian-weread-plugin](https://github.com/zhaohongxuan/obsidian-weread-plugin) 的思路，通过让用户扫描二维码的方式登陆，然后借鉴 [Wechatsync](https://github.com/wechatsync/Wechatsync) 的同步方式将文章推送上去即可。这种方式是一个接近完美方案。

- [ ] 学习创建一个自己的 OB 插件
- [ ] 学习 TypeScript 的基本语法
- [ ] 学习 obsidian-weread-plugin 插件的扫码登陆实现
- [ ] 学习 Wechatsync 插件的文章同步原理
- [ ] 基于 obsidian-wechat-public-platform 进行修改达成初步的目标
- [ ] 学习 obsidian-digital-garden 的界面设计，将 obsdian-wechat-pulic-platform 改造成类似的样式