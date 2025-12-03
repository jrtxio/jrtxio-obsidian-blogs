---
{"dg-publish":true,"dg-path":"03 编程语言与理论/Racket GUI 实战：50 行代码做一个 SVG 图标查看器.md","permalink":"/03 编程语言与理论/Racket GUI 实战：50 行代码做一个 SVG 图标查看器/","created":"2025-12-02T14:56:47.244+08:00","updated":"2025-12-02T19:00:26.957+08:00"}
---

#Innolight #Lisp #Racket 

昨天，我买了一个图标包 — 里面有 3000 多个 (!) SVG 文件 — 然后当我试图在 macOS 上搜索这个未解压的文件夹时，系统彻底崩溃了。

![Pasted image 20251202145801.png|650](/img/user/0.Asset/resource/Pasted%20image%2020251202145801.png)

于是，我做了一个每个“真正的 Racketeer”都会做的事情 —— 我以这个为借口，玩弄了一下 Racket 自带的 GUI 库！

![Pasted image 20251202145821.png|650](/img/user/0.Asset/resource/Pasted%20image%2020251202145821.png)

# 开始探索

Racket 的 GUI 工具包采用的是一种 “retained-mode” 风格的 API，用于构建用户界面。这意味着你通过实例化对象来表示应该画到屏幕上的内容，由系统负责实际绘制。当你希望对用户的交互作出自定义响应时，就给这些对象注册回调函数 (callbacks)，以便在某些事件发生时触发行为。

比如，要在屏幕上渲染一个窗口 (window)，你只需写：

```
#lang racket/gui

(require racket/class)

(define window
  (new frame%
       [label "Hello World!"]))

(send window show #t)
```

上面这段代码实例化了一个新的 frame 对象 —— 它的标题 (label) 是 “Hello World!” —— 然后告诉它自己显示出来。就这么简单！

## `racket/class` 快速入门

这个 GUI 库是基于 Racket 的类系统 (class system) 构建的。在这个上下文里，你只需知道：

- 类名一般以 `%` 结尾，
- 接口 (interface) 名称一般以 `<%>` 结尾，
- 用 `new` 宏 (macro) 来实例化一个类 (即创建一个对象)，后面跟零个或多个字段 (field) 值，
- 用 `send` 宏发送消息 (message) 给对象 (也就是调用方法)。

## 布局 (layout)

有了上面的基础，我们可以继续构建界面 (UI)：

```racket
#lang racket/gui

(require racket/class)

(define window
  (new frame%
       [label "Icon Viewer"]
       [width 800]
       [height 600]))

(define panel
  (new vertical-panel%
       [parent window]))

(define search-box
  (new text-field%
       [parent panel]
       [label #f]))

(define list-box
  (new list-box%
       [parent panel]
       [choices empty]
       [label #f]))

(define canvas
  (new canvas%
       [parent panel]))

(send window show #t)
```

给一个 widget (控件) 指定 `parent`，就意味着它会在该父对象里渲染。所以，上面这段代码构建了如下层次结构：

```
window
└── panel
    ├── search-box
    ├── list-box
    └── canvas
```

这个 `panel` 会把它的子控件垂直 (一列) 排列。具体来说：

- `search-box` 会用来输入搜索过滤 (filter) 字符串，
- `list-box` 会列出符合过滤条件 (filtering) 的文件名，
- `canvas` 用来绘制 (render) 被选中的文件 (例如 SVG 图标)。 ([Defn](https://defn.io/2019/06/17/racket-gui-saves/ "racket/gui saves the day — defn.io"))

运行上述代码的话，你就能得到与文章开头所展示 UI “几乎相同”的界面 (layout + 空控件，但还没加交互行为)。

# 添加行为 (behavior)

尽管界面与截图类似，但上述代码还没有实现最终产品 (final product) 的行为。所以接下来我们要加功能 —— 比如文件列出 (listing)、过滤 (filtering) 以及点击后显示 SVG 图标 (rendering SVG)。

首先，我们注意到 `list-box%` 类有一个 `choices` 字段。我们可以将当前目录 (current directory) 下所有 SVG 文件的文件名 (filenames) 收集到一个列表 (list) 里，然后在创建 `list-box%` 的时候把它作为 `choices` 传进去。示例代码：

```racket
(define folder-path
  (current-directory))

(define filenames
  (for/list ([filename (directory-list folder-path)]
             #:when (equal? (path-get-extension filename) #".svg"))
    (path->string filename)))
```

这样，当你在一个包含 SVG 文件的文件夹里运行这个程序，就会看到这些文件名被列出来。然后，我们把这个 `filenames` 传给 `list-box%`：

```racket
(define list-box
  (new list-box%
       [parent panel]
       [choices filenames]
       [label #f]))
```

这么一来，UI 上就会列出这些 SVG 文件的名字了。

接下来，是过滤 (filtering) 功能。当用户在 `search-box` 中输入文字时，我们希望只显示包含该文字 (substring) 的文件名。实现方式是给 `search-box` 注册一个 callback，当内容改变时 (content change)，清空 `list-box`，然后只把符合过滤条件的文件名重新加进去：

```racket
(define search-box
  (new text-field%
       [parent panel]
       [label #f]
       [callback (lambda (sb e)
                   (define text (send sb get-value))

                   (send list-box clear)
                   (for ([filename filenames]
                         #:when (string-contains? filename text))
                     (send list-box append filename)))]))
```

这个 callback 的作用是：获取当前 search-box 的值 (text)，清空 list-box，然后把所有文件名中 **包含** text 的那些添加回来。这样就实现了过滤。

最后，我们加入 SVG 显示功能。当用户点击 (选择) list-box 中某个项目 (filename) 时，我们读取对应的 SVG 文件并把它画到 canvas 上。为此，需要用到 `rsvg` 库。文章中提到：

- 首先要安装 `rsvg`，因为它依赖 `librsvg`。在 macOS 上，可以用 `brew install librsvg`。
- 然后 require 它，并给 `list-box` 添加 callback，当 item 被选中 (selection) 时读取文件、加载 SVG、清除画布再画图。类似这样的代码：

```racket
(require rsvg)
;; ...

(define list-box
  (new list-box%
       [parent panel]
       [label #f]
       [choices filenames]
       [callback (lambda (tb e)
                   (define selection (send tb get-string-selection))
                   (define filename (and selection (build-path folder-path selection)))
                   (when filename
                     (define svg (load-svg-from-file filename 3))
                     (define dc (send canvas get-dc))
                     (send dc clear)
                     (send dc draw-bitmap svg 0 0)))]))
```

有了这些，就完成了一个基本但功能完整的图标查看器 (icon viewer) —— 列出文件、过滤、点击查看 SVG。大约只用了 50 行代码。

你可以在这里找到[最终版本](https://defn.io/code/icon-viewer.rkt)的代码。