---
{"dg-publish":true,"dg-path":"软件工程/如何添加 Google Adsense 到 Digital Garden.md","permalink":"/软件工程/如何添加 Google Adsense 到 Digital Garden/","created":"2025-06-17T09:42:23.001+08:00","updated":"2025-07-01T10:24:25.518+08:00"}
---

#Innolight

![Pasted image 20250617095535.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250617095535.png)

为网站设置 Google Adsense 其实最主要的步骤就是在博客每个 html 页面的 header 里面都注入同一行 JavaScript 脚本，这个脚本是 Google Adsense 用来验证你对网站的所有权。

Digital Garden 的博客是先将 Markdown 文件和 JavaScript 脚本同时构建在一个 github 仓库中，然后通过 vercel 等平台部署的时候会执行其中的 JavaScript 脚本将 Markdown 文件转化为 html 文件。所以我们无法在 github 仓库中操作博客中所有的 html 文件，如果想要快速的在每个生成的 html 页面上添加 Google Adsense 的认证脚本，可以通过修改 layout 下的 index.njk 和 note.njk 模板文件，让生成 html 文件时能够自动添加 Google Adsense 认证脚本。修改方式非常简单，分别在两个模板文件的 header 标签里添加相应的认证方式的内容即可。Google Adsense 支持三种验证方式，如下图所示：


> [!NOTE]
> njk 文件是 Nunjucks 模板引擎的文件扩展名，通常用于开发动态生成的 HTML 文件或其他基于模板的文本内容。Nunjucks 是一个基于 JavaScript 的模板引擎，类似于 Jinja2（用于 Python）或 Twig（用于 PHP）。它常用于构建动态网站或预渲染内容。

![Pasted image 20250617095644.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250617095644.png)

我选择的是元标记的方式，分别在 index.njk 和 note.njk 里添加了如下的内容。

![Pasted image 20250617104954.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250617104954.png)

如果添加完成之后，Google Adsense 验证失败了该怎么办？此时就需要通过浏览器来对网页进行一定的调试，确认所有页面都正确添加了相应的内容。如下图红框中选中的内容所示，我的页面已经添加了认证内容。

> [!WARNING]
> 一定要保证网站的所有 html 页面都已经添加了认证脚本，我刚开始主页没有添加，导致了认证失败。
