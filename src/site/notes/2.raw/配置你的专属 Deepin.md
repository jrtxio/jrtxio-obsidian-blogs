---
{"dg-publish":true,"dg-path":"配置你的专属 Deepin.md","permalink":"/配置你的专属 Deepin/","dg-note-properties":{"slug":"customize-your-deepin","author":"吉人","created":"2017-04-20","source":null}}
---

> 实体机安装 Deepin 的完整配置流程：从代理到桌面美化。

实体机安装 Linux 差不多已经一年了，中间尝试过许多 Linux 发行版，按照喜好尝试了各种配置，在踩了无数的坑之后形成了一套自己的风格。今天刚好重装了一下 Deepin 系统，所以把配置的过程写下来分享给大家。

## 科学上网

- 首先将从 Github 上下载 python 版本的 shadowsocksr，然后将 shadowsocksr 放到 /opt 目录下面。
- 接着就是将 shadowsocksr 的配置文件放到 /etc 目录下面

![deepin-customization-fig01.png\|650](/img/user/0.asset/media/deepin-customization-fig01.png)

* 让 shadowsocksr 以后台运行的方式启动

![deepin-customization-fig02.png\|650](/img/user/0.asset/media/deepin-customization-fig02.png)

![command-explanation.png\|解释一下上面的命令：\|650](/img/user/0.asset/media/command-explanation.png)

- -c 后面是你 shadowsocksr 配置文件所在的路径
- -d 表示 shadowsocksr 是以后台运行的方式启动，这样就可以保证你关闭终端的时候 shadowsocksr 依然在后台运行

**设置系统或浏览器的代理：**

   - 打开 Deepin 的网络设置，配置系统代理。（PS: 这里说明一下，1080 是 shadowsocksr 配置文件里面的本地代理端口，即 server_port=1080，你需要根据自己的配置文件进行设置）
   - 应用到整个系统。我一般是直接设置系统代理，当然你也可以设置浏览器的代理。

>
> 设置代理的作用就是让系统的数据都转发到本地的 1080 端口，然后一直在 1080 端口监听的 shadowsocksr 对数据进行处理转发

![deepin-customization-fig03.png\|650](/img/user/0.asset/media/deepin-customization-fig03.png)

![deepin-customization-fig04.png\|650](/img/user/0.asset/media/deepin-customization-fig04.png)

我科学上网使用的是 [shadowsocksr](https://shadowsocks.be/9.html) 一键搭建脚本（注：shadowsocksr 兼容 shadowsocks），由于开发 shadowsocks 的 GUI 在 Linux 上太麻烦，所以还是建议大家用 Python 版本，作者比较容易维护，更新也比较快。关于 Python 版本的 shadowsocksr 客户端可以到我 Github 上的 [Python-Shadowsocksr](https://github.com/jirentianxiang/Python-ShadowsocksR.git) 下载。科学上网的一些其他问题，可以参考我的另一篇博客[[2.raw/定制 OS-X 风格的 Gnome\|定制 OS-X 风格的 Gnome]]，上面详细讲解了关于科学上网的一些其他配置问题。

## Infinality

Linux 系统默认对字体渲染比较差，不过可以庆幸的是我们可以通过 [Infinality](https://www.linuxdashen.com/debian8%E5%AE%89%E8%A3%85infinality%E6%94%B9%E5%96%84%E5%AD%97%E4%BD%93%E6%B8%B2%E6%9F%93%EF%BC%8C%E5%AE%89%E8%A3%85ubuntu%E5%AD%97%E4%BD%93) 解决这个问题。

## Chrome 插件

-  Adblocks plus 一个可以过滤广告的 chrome 插件
- Vimum 让你象使用 vim 一样操作浏览器
    - F 键快速对页面上的所有链接标序，输入对应的数字就可以跳转到对应的链接
    - D 键可以向下滚动半屏
    - U 键可以向上滚动半屏
    - T 键快速新建一个 Tab
* OneTab 在关闭浏览器之前将所有当前页面保存起来，下次打开浏览器的时候可以恢复

![deepin-customization-fig05.png\|650](/img/user/0.asset/media/deepin-customization-fig05.png)

![deepin-customization-fig06.png\|650](/img/user/0.asset/media/deepin-customization-fig06.png)

## Guake

这是具有下拉风格的终端，按下热键后下拉的内容会在屏幕的顶端显示。一般需要快速简便使用终端的时候会用到。用完就隐藏，完全不占用屏幕空间。当然这款神器的功能还有很多，你可以自己去查阅文档。

![deepin-customization-fig07.png\|650](/img/user/0.asset/media/deepin-customization-fig07.png)

>
> 经过 Deepin 操作系统联合创始人 ManateeLazyCat 的提醒，其实 Deepin 自带这种下拉风格——快捷键是 Alt+Fn+F2。所以如果你只是像我一样用到下拉这种方式，那么你完全可以省略这一步了，因为 Guake 的反应可能会稍微慢一点。如果你觉得这个快捷键十分难按，可以到快捷键设置里面进行修改。这个快捷键对我而言特别常用，所以我会选择一个比较容易按到的快捷键。你们可以根据自己的习惯修改。
## Tmux

这是一个可以最大效率利用你终端的工具，想知道为什么吗？那就去百度一下吧 :)，Tmux 的默认操作方式可能没有那么的方便，你可以到 Github 或者其他地方找一些 Tmux 的配置文件。下面的图片就是我的配置样式，如果想要查看我的 Tmux 配置，可以参考我的另一篇博客[[2.raw/定制 OS-X 风格的 Gnome\|定制 OS-X 风格的 Gnome]]。

![deepin-customization-fig08.png\|650](/img/user/0.asset/media/deepin-customization-fig08.png)

## Curl、Git、[Oh-my-zsh](https://github.com/robbyrussell/oh-my-zsh)

在终端输入以下安装命令

```text
sudo apt-get install curl
sudo apt-get install git
sudo apt-get install zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
```

安装详情可到 Github 查看相关文档。

## fluxgui（护眼软件）

为了保护眼睛，每次都会安装这个软件，还是很有效果的，安装之后屏幕看着十分舒服。具体安装方式参考 Github 上的 [xflux-gui](https://github.com/xflux-gui/xflux-gui)。

## 定制快捷键

这一步对我而言很重要，因为我平时快捷键用的比较多。我十分讨厌鼠标键盘来回切换，这样会让效率十分低下。

![deepin-customization-fig09.png\|650](/img/user/0.asset/media/deepin-customization-fig09.png)

![deepin-customization-fig10.png\|650](/img/user/0.asset/media/deepin-customization-fig10.png)

![keyboard-shortcut-customization.png\|你可以根据自己的习惯定制关闭、移动、最大化窗口等快捷键，这样会让你节省很大一部分键盘和鼠标来回切换的时间。\|650](/img/user/0.asset/media/keyboard-shortcut-customization.png)

## VMware Workstation

如果 Windows 有什么东西实在绕不开，可以在虚拟机里面安装 Windows 系统，但是既然你选择了 Linux，尽量还是按照 Linux 的方式来思考，因为 Windows 可以解决的问题，Linux 同样可以解决，而且可以做得更好。我一般会在虚拟机里安装一个 XP 或者 Win7。不建议安装 Win10，因为 Win10 在虚拟机里面实在是卡的要死。
