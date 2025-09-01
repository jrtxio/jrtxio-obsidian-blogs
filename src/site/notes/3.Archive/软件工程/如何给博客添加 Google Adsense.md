---
{"dg-publish":true,"dg-path":"软件工程/如何给博客添加 Google Adsense.md","permalink":"/软件工程/如何给博客添加 Google Adsense/","created":"2025-09-01T14:29:33.138+08:00","updated":"2025-09-01T14:52:48.116+08:00"}
---

#Innolight

添加 Google AdSense 并展示广告，一般分为四个主要步骤：验证网站、申请账号、生成广告代码嵌入博客、配置 ads.txt。以下是详细流程：

# 1. 验证网站所有权

Google 需要确认你对博客拥有控制权。

**步骤：**

1. 登录 [Google Search Console](https://search.google.com/search-console/)。
2. 添加网站并选择 **HTML 标签验证**。
3. 系统生成 `<meta>` 标签，例如：

```html
<meta name="google-site-verification" content="你的验证码" />
```

4. 将 `<meta>` 标签加入博客 `<head>` 中并部署。
5. 回到 Search Console 点击 **验证**。

![Pasted image 20250617104954.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250617104954.png)

# 2. 申请 Google AdSense 账号

**步骤：**

1. 登录 [Google AdSense](https://www.google.com/adsense/)。
2. 点击 **注册** 并填写网站信息。
3. 等待 Google 审核网站内容与设置。
4. 审核通过后可访问 AdSense 后台。

![Pasted image 20250901145159.png](/img/user/0.Asset/resource/Pasted%20image%2020250901145159.png)

# 3. 创建广告单元并嵌入博客

**步骤：**

1. 在 AdSense 后台点击 **广告 → 广告单元 → 新增广告单元**。
2. 选择广告类型（展示广告、文章内广告等）。
3. 生成广告代码，例如：

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="pub-xxxxxxxxxxxxxxxx"
     data-ad-slot="xxxxxxxxxx"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

4. 将广告代码嵌入博客页面或模板中适当位置（文章页、侧边栏或页脚）。

# 4. 配置 ads.txt

ads.txt 可以保证广告收入合法合规。

**步骤：**

1. 在博客根目录创建 `ads.txt` 文件，内容如下：

```
google.com, pub-你的发布商ID, DIRECT, f08c47fec0942fa0
```

2. 部署后，可通过访问 `https://你的博客域名/ads.txt` 检查是否生效。

![Pasted image 20250901144817.png](/img/user/0.Asset/resource/Pasted%20image%2020250901144817.png)

# 5. 检查广告展示

1. 确认博客已成功部署。
2. 打开博客文章页，刷新页面查看广告是否显示。
3. 如未显示：
    - 确认 AdSense 审核通过。
    - 检查广告代码位置。
    - 清理浏览器缓存或尝试隐身模式。

# 小结

整个流程可总结为：

1. 验证网站所有权
2. 申请 AdSense 账号
3. 创建广告单元并嵌入博客
4. 配置 ads.txt
5. 检查广告展示

> 完成以上步骤后，你的博客即可合法显示 Google AdSense 广告并开始获取收入。
