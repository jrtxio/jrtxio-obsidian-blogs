---
{"dg-publish":true,"dg-path":"02 软件开发/如何给博客添加 Google Adsense.md","permalink":"/02 软件开发/如何给博客添加 Google Adsense/","created":"2025-09-01T14:29:33.138+08:00","updated":"2025-09-01T17:10:03.168+08:00"}
---

#Innolight

添加 Google AdSense 并展示广告，分为四个主要步骤：申请账号、验证网站、创建广告单元、配置 ads.txt。

# 1. 申请 Google AdSense 账号

1. 登录 [Google AdSense](https://www.google.com/adsense/)
2. 点击**开始使用**并填写网站信息
3. 等待 Google 审核网站内容与设置
4. 审核通过后可访问 AdSense 后台

# 2. 验证网站所有权

Google 需要确认你对博客拥有控制权。

**步骤：**
1. 登录 [Google Search Console](https://search.google.com/search-console/)
2. 添加网站并选择 **HTML 标签验证**
3. 系统生成 `<meta>` 标签，例如：
```html
<meta name="google-site-verification" content="你的验证码" />
```
4. 将 `<meta>` 标签加入博客 `<head>` 中并部署
5. 回到 Search Console 点击**验证**

![Pasted image 20250901145159.png](/img/user/0.Asset/resource/Pasted%20image%2020250901145159.png)

# 3. 创建广告单元并嵌入博客

**步骤：**
1. 在 AdSense 后台点击**广告 → 广告单元 → 新增广告单元**
2. 选择广告类型（展示广告、文章内广告等）
3. 生成广告代码，例如：
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-xxxxxxxxxxxxxxxx"
     data-ad-slot="xxxxxxxxxx"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```
4. 将广告代码嵌入博客页面或模板中适当位置（文章页、侧边栏或页脚）

# 4. 配置 ads.txt

ads.txt 防止广告欺诈。有人可能冒充你的网站去卖广告位，骗取广告费。

这个文件相当于声明："我只授权这些公司在我网站上卖广告"。

**步骤：**

1. 在博客根目录创建 `ads.txt` 文件，内容如下：
```
google.com, pub-你的发布商ID, DIRECT, f08c47fec0942fa0
```

参数含义：
- `google.com`：授权 Google 卖你的广告  
- `pub-你的发布商ID`：你在 AdSense 的唯一标识
- `DIRECT`：直接合作，不通过中间商
- `f08c47fec0942fa0`：Google 的认证 ID

2. 部署后，访问 `https://你的博客域名/ads.txt` 检查是否生效

没有 ads.txt，广告主不确定广告投放的真实性，会影响收益。

![Pasted image 20250901144817.png](/img/user/0.Asset/resource/Pasted%20image%2020250901144817.png)

# 5. 检查广告展示

1. 确认博客已成功部署
2. 打开博客文章页，刷新页面查看广告是否显示
3. 如未显示：
    - 确认 AdSense 审核通过
    - 检查广告代码位置
    - 清理浏览器缓存或尝试隐身模式

# 常见问题

**申请被拒？**  
大概率是内容太少。Google 要看到你确实在认真做网站，不是随便搭个空壳骗广告费。至少写 20 篇像样的文章再申请。

**广告不显示？**  
代码放错位置了。广告代码必须放在 `<body>` 里，不是 `<head>`。另外新广告单元生效需要几小时。

# 小结

整个流程：申请 AdSense 账号 → 验证网站所有权 → 创建广告单元并嵌入博客 → 配置 ads.txt → 检查广告展示。

完成以上步骤后，你的博客即可合法显示 Google AdSense 广告并开始获取收入。