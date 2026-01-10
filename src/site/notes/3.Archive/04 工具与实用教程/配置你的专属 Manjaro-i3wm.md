---
{"dg-publish":true,"dg-path":"04 工具与实用教程/配置你的专属 Manjaro-i3wm.md","permalink":"/04 工具与实用教程/配置你的专属 Manjaro-i3wm/"}
---

 #linux 

用了近一个月 Manjaro-i3wm，觉得是时候写篇简单的教程了。用一句话来概括自己的感受，就是刚安装的时候很折腾，后面使用起来很顺手。折腾是因为 i3wm 是一个平铺式桌面管理器（如果你不太了解 i3wm 和你正在使用的桌面的区别，请自行百度），后面很顺手是因为 i3wm 所有的配置都可以由自己的心意来修改。Manjaro-i3wm 完全可以达到开箱即用，再加上 Manjaro 是基于Arch，跟新的速度要稍慢于 Arch，但是稳定性方面要比 Arch 好很多。

![Pasted image 20250926144433.png](/img/user/0.Asset/resource/Pasted%20image%2020250926144433.png)

![Pasted image 20250926144440.png](/img/user/0.Asset/resource/Pasted%20image%2020250926144440.png)

## 一、搜狗输入法

- 安装搜狗输入法

```sudo pacman -S fcitx-sougoupinyin
sudo pacman -S fcitx-im # 全部安装
sudo pacman -S fcitx-configtool # 图形化配置工具
```

- 在~/.xprofile文件里面添加下面三行

```
export GTK_IM_MODULE=fcitx
export QT_IM_MODULE=fcitx
export XMODIFIERS="@im=fcitx"
```

## 二、URxvt的配置

```
!!$HOME/.Xresources
URxvt.preeditType:Root

! default input method
URxvt.inputMethod:fcitx

! color setup
URxvt.depth:32

URxvt.inheritPixmap:true
URxvt.background:#282A36
URxvt.foreground:#F8F8F2
URxvt.colorBD:Gray95
URxvt.colorUL:Green
URxvt.color1:Red2
URxvt.color4:RoyalBlue
URxvt.color5:Magenta2
URxvt.color8:Gray50
URxvt.color10:Green2
URxvt.color12:DodgerBlue
URxvt.color14:Cyan2
URxvt.color15:Gray95

! default web brower
URxvt.urlLauncher:/usr/bin/google-chrome-stable
URxvt.matcher.button:1
Urxvt.perl-ext-common:matcher

! scroll bar setting
URxvt.scrollBar:False
URxvt.scrollBar_floating:False
URxvt.scrollstyle:plain

! scroll screen setting
URxvt.mouseWheelScrollPage:True
URxvt.scrollTtyOutput:False
URxvt.scrollWithBuffer:True
URxvt.scrollTtyKeypress:True

! cursor splash
URxvt.cursorBlink:True
URxvt.saveLines:3000

! border setting
URxvt.borderLess:False

! font setting 这里的字体系统中一定要已经安装
URxvt.font:xft:Droid\ Sans\ Mono\ For\ Powerline:regular:size=10,xft:WenQuanYi Micro Hei Mono:regular:size=13:minispace=true
```

![Pasted image 20250926144644.png](/img/user/0.Asset/resource/Pasted%20image%2020250926144644.png)

## 三、让软件自动归类到 Workspace 下

所谓自动归类，拿 Terminal 举例，不管你在哪一个工作区按下了打开终端的快捷键，Terminal 都会在你指定的工作区内打开。这样做的好处是，你可以把多个终端集中到一个 workspace 里面。那么这功能到底如何实现呢？

首先你得知晓一点，关于 i3wm 所有的配置都是在 `~/.i3/config` 文件里面。打开配置文件之后，你会发现里面有很多预定的配置，实现上面的功能你需要做以下的几步：

- 为 workspace 绑定快捷键 mod+1，并定义变量名 ws1

> bindsym $mod+1 workspace $ws1


* 在特定的 workspace 里面打开应用，这里我使用的终端是 URxvt

> assign [class="URxvt"] $ws1

我的 `~/.i3/config` 配置文件自定义部分如下：

```
# Workspace names
# to display names or symbols instead of plain workspace numbers you can use
# something like: set $ws1 1:mail
#                 set $ws2 2:
set $ws1 "Terminal "
set $ws2 "Chrome "
set $ws3 "Androidstudio "
set $ws4 "Video "
set $ws5 5
set $ws6 6
set $ws7 7
set $ws8 8

# switch to workspace
bindsym $mod+1 workspace $ws1
bindsym $mod+2 workspace $ws2
bindsym $mod+3 workspace $ws3
bindsym $mod+4 workspace $ws4
bindsym $mod+5 workspace $ws5
bindsym $mod+6 workspace $ws6
bindsym $mod+7 workspace $ws7
bindsym $mod+8 workspace $ws8

# Move focused container to workspace
bindsym $mod+Ctrl+1 move container to workspace $ws1
bindsym $mod+Ctrl+2 move container to workspace $ws2
bindsym $mod+Ctrl+3 move container to workspace $ws3
bindsym $mod+Ctrl+4 move container to workspace $ws4
bindsym $mod+Ctrl+5 move container to workspace $ws5
bindsym $mod+Ctrl+6 move container to workspace $ws6
bindsym $mod+Ctrl+7 move container to workspace $ws7
bindsym $mod+Ctrl+8 move container to workspace $ws8

# Move to workspace with focused container
bindsym $mod+Shift+1 move container to workspace $ws1; workspace $ws1
bindsym $mod+Shift+2 move container to workspace $ws2; workspace $ws2
bindsym $mod+Shift+3 move container to workspace $ws3; workspace $ws3
bindsym $mod+Shift+4 move container to workspace $ws4; workspace $ws4
bindsym $mod+Shift+5 move container to workspace $ws5; workspace $ws5
bindsym $mod+Shift+6 move container to workspace $ws6; workspace $ws6
bindsym $mod+Shift+7 move container to workspace $ws7; workspace $ws7
bindsym $mod+Shift+8 move container to workspace $ws8; workspace $ws8

# Open applications on specific workspaces
assign [class="URxvt"] $ws1
assign [class="Google-chrome"] $ws2
assign [class="jetbrains-studio"] $ws3
# assign [class="Skype"] $ws5

# autostart program
# exec xrandr --output HDMI2 --off --output HDMI1 --mode 1920x1080 --pos 0x0 --rotate normal --output DP1 --off --output eDP1 --off --output VIRTUAL1 --off
# exec_always urxvt
# exec_always fcitx
# exec_always fluxgui
```

## 四、科学上网

关于科学上网可以参考我的另一篇博客[[配置你的专属Deepin\|配置你的专属Deepin]]。在 i3wm 里面科学上网稍微有些不同的是，全局上网很麻烦，所以我一般都是在 Chrome 或者 Firefox 上面安装一个插件——Foxproxy，像下面那样配置一下就可以科学上网了，然后配合 shadowsocksr，就可以实现科学上网了。

![Pasted image 20250926144915.png](/img/user/0.Asset/resource/Pasted%20image%2020250926144915.png)

## 五、配置Rofi

安装完 Rofi 之后可能需要一下简单的配置，下面是我的配置。

* 绑定启动 rofi 的快捷键

> bindsym $mod+d exec rofi -show run

* 在 `~/.extend.Xresources` 里面加入 rofi 的颜色配置

```
! ------------------------------------------------------------------------------
! ROFI Color theme
! ------------------------------------------------------------------------------
rofi.color-enabled: true
rofi.color-window: #393939, #393939, #268bd2
rofi.color-normal: #393939, #ffffff, #393939, #268bd2, #ffffff
rofi.color-active: #393939, #268bd2, #393939, #268bd2, #205171
rofi.color-urgent: #393939, #f3843d, #393939, #268bd2, #ffc39c
```

![Pasted image 20250926144959.png](/img/user/0.Asset/resource/Pasted%20image%2020250926144959.png)

## 六、即时聊天工具—wechat

Github 上 [electronic-wechat](https://github.com/geeeeeeeeek/electronic-wechat)开源项目(据说比腾讯官方开发的要好^-^)

![Pasted image 20250926145024.png](/img/user/0.Asset/resource/Pasted%20image%2020250926145024.png)

## 七、虚拟机

如果你想要在 i3wm 上安装虚拟机的话，建议 kvm-qemu。因为 Virtualbox 和 VMware Workstation 在上面使用貌似都会有一些问题（这是血的教训）。用 virt-manager 来控制 qemu 模拟器。个人感觉 kvm-qemu 貌似更加流畅。下面是虚拟机的增强工具 spice-guest-tools。
[spice-guest-tools](https://pan.baidu.com/s/1qYHieLm)

![Pasted image 20250926145121.png](/img/user/0.Asset/resource/Pasted%20image%2020250926145121.png)

## 八、Androidstudio、Intellij IDEA Ultimate Editon、Pycharm、Genymotion

这些软件都可以一条指令安装，不过我在使用 Intellij IDEA Ultimate Edition 时发现输入中文会乱码，解决的办法就是把 [YaHei Consolas Hybrid](https://pan.baidu.com/s/1hrO9HKK) 设置为 Intellij IDEA Ultimate Edition 的默认字体。Genymotion 的安装需要一些其他相关的包，所以建议去找篇安装教程，如果你已经解决了科学上网问题，可以到 Youtube 上找安装教程。

## 九、总结

本篇文章只是浅尝辄止的讲解了一下配置过程，如果有什么错误，欢迎指正。使用 i3wm 的时候大部分时间都是靠快捷键。一个不熟悉的人拿到我的电脑连关机都没办法，更别谈操作了，但是常用的指令学会了之后，操作起来也没什么难度。再次重申，如果你一点都不爱折腾的话，不建议尝试。
