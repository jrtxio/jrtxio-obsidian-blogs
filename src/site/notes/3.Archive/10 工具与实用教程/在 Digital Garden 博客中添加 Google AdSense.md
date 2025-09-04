---
{"dg-publish":true,"dg-path":"10 工具与实用教程/在 Digital Garden 博客中添加 Google AdSense.md","permalink":"/10 工具与实用教程/在 Digital Garden 博客中添加 Google AdSense/","created":"2025-06-17T09:42:23.001+08:00","updated":"2025-09-03T10:10:16.244+08:00"}
---

#Innolight

参考[[3.Archive/10 工具与实用教程/如何给博客添加 Google Adsense\|如何给博客添加 Google Adsense]]文章了解添加的整个流程，以下文章不再讲解这部分内容。仅专注于 Digital Garden 博客中添加的具体操作。

# 验证网站所有权

在 AdSense 中，所有权验证是第一步。Google 需要确认你拥有该域名，否则就可能出现冒用流量的情况。验证的方式有三种，我采用的是元标记方式进行验证。

在进行具体的操作之前，我们先来分析一下如何才能让 Digital Garden 的所有网页都能添加上元标记的内容。

博客生成是通过 Javascript 将 Markdwon 转换为 HTML，为了能够修改所有页面的 HTML 文件，我们需要在转换之前进行添加操作。所幸我们可以很容易通过修改 layout 下的 index.njk 和 note.njk 模板完成所有 HTML 文件的修改，这两个文件分别是的主页和笔记的模板。只需要在两个文件的 header 标签里添加相应的内容：

![Pasted image 20250617095644.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250617095644.png)

如果添加完成之后，Google Adsense 验证失败了该怎么办？此时就需要通过浏览器来对网页进行一定的调试，确认所有页面都正确添加了相应的内容。如下图红框中选中的内容所示，我的页面已经添加了认证内容。

![Pasted image 20250617104954.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250617104954.png)

> [!WARNING]
> 一定要保证网站的所有 HTML 页面都已经添加了认证脚本，我刚开始主页没有添加，导致了认证失败。

# 创建广告单元并嵌入博客

生成广告的方式有很多种，目前我只选择了自动展示广告。添加方式类似于验证网站所有权，将以下的代码放置在 note.njk 的 head 标记之间即可。

![Pasted image 20250902092035.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250902092035.png)

# 配置 ads.txt

![Pasted image 20250902091653.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250902091653.png)

配置 ads.txt 需要做两件事：

1. 在 site 目录下添加 ads.txt 文件
2. 设置 .eleventy.js，设置将 ads.txt 原样拷贝到输出目录

这样在打包的时候就能自动出现在网站根目录。成功后如下图所示：

![Pasted image 20250901144817.png](/img/user/0.Asset/resource/Pasted%20image%2020250901144817.png)