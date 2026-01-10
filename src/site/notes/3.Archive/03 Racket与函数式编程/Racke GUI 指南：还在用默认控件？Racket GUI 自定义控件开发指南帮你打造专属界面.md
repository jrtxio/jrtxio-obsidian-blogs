---
{"dg-publish":true,"dg-path":"03 Racket与函数式编程/Racke GUI 指南：还在用默认控件？Racket GUI 自定义控件开发指南帮你打造专属界面.md","permalink":"/03 Racket与函数式编程/Racke GUI 指南：还在用默认控件？Racket GUI 自定义控件开发指南帮你打造专属界面/"}
---

#lisp #racket 

在 Racket 中，`racket/gui` 提供了一套完整的 GUI 框架，包括窗口、按钮、文本框、列表等控件。但是，有时内置控件无法满足你的需求，比如你想实现一个特殊的进度条、图形化的开关按钮或者复杂的自定义绘图控件。这时，就需要掌握如何**自定义控件**。 本文将从基础概念出发，逐步讲解如何在 Racket 中创建自定义控件，并提供一些实用技巧。

## 1. 自定义控件的核心概念

在 `racket/gui` 中，每个控件都是从基础类派生的对象。自定义控件的关键在于：

1. **继承已有控件**：通过类继承，重写绘制方法或事件处理方法。
2. **重写绘制方法**：核心是 `on-paint` 方法，用来定义控件如何显示。
3. **处理事件**：如鼠标点击、键盘输入，需要重写事件处理方法，例如 `on-event`。
4. **状态管理**：自定义控件通常需要保存自己的状态，并根据状态更新显示。

在 Racket 中，GUI 控件通常是 **面向对象（class）** 的形式，因此自定义控件也需要用 `class` 定义。

## 2. 基础示例：自定义颜色方块控件

我们先做一个简单的示例：创建一个控件，显示一个可以点击切换颜色的方块。

```racket
#lang racket/gui

(define my-window (new frame% [label "自定义控件示例"] [width 300] [height 200]))

;; 定义自定义控件类
(define my-color-box%
  (class canvas%
    (super-new)
    (define color "red") ; 初始颜色

    ;; 绘制方法
    (define/override (on-paint)
      (let ([dc (send this get-dc)])
        (send dc set-brush (new brush% [color color]))
        (send dc set-pen (new pen% [color "black"] [width 2]))
        (send dc draw-rectangle 50 50 100 100)))

    ;; 鼠标点击事件
    (define/override (on-event event)
      (when (send event button-down? 'left)
        (set! color (if (string=? color "red") "green" "red"))
        (send this refresh)))))

;; 创建控件实例并加入窗口
(define color-box (new my-color-box% [parent my-window]))

(send my-window show #t)
```

**讲解：**

- `canvas%` 是一个可以自定义绘制内容的控件基类。
- `on-paint` 方法在控件需要重绘时调用，通过 `get-dc` 获取绘图上下文。这里我们用 `draw-rectangle` 绘制一个方块。
- `on-event` 方法处理事件，这里判断鼠标左键点击并切换颜色。
- `send this refresh` 告诉控件重新绘制。

运行后，你会看到一个方块，点击可以在红色和绿色之间切换。

## 3. 添加更多交互：自定义按钮控件

接下来，我们创建一个自定义按钮控件，可以显示文本，并在点击时触发回调函数。

```racket
(define my-button%
  (class canvas%
    (init-field label callback) ; 初始化字段
    (super-new)
    (define pressed? #f) ; 按下状态

    ;; 绘制按钮
    (define/override (on-paint)
      (let ([dc (send this get-dc)]
            [w (send this get-width)]
            [h (send this get-height)])
        ;; 绘制背景
        (send dc set-brush (new brush% [color (if pressed? "darkgray" "lightgray")]))
        (send dc set-pen (new pen% [color "black"] [width 1]))
        (send dc draw-rectangle 0 0 w h)
        ;; 绘制文本
        (send dc draw-text label 10 10)))

    ;; 鼠标点击事件
    (define/override (on-event event)
      (cond [(send event button-down? 'left)
             (set! pressed? #t)
             (send this refresh)]
            [(send event button-up? 'left)
             (set! pressed? #f)
             (send this refresh)
             (when callback (callback))]))))

;; 使用示例
(define my-window2 (new frame% [label "自定义按钮"] [width 200] [height 100]))

(define button
  (new my-button%
       [parent my-window2]
       [label "点我"]
       [callback (lambda () (displayln "按钮被点击！"))]))

(send my-window2 show #t)
```

**讲解：**

- `init-field` 可以让你在创建控件时传入参数。
- 通过回调函数机制，你可以让自定义控件与其他逻辑交互。
- 绘制文本和矩形时可以使用控件的宽高动态计算位置。
- 增加了按下状态，让按钮有视觉反馈。

## 4. 进阶：可组合的控件

自定义控件不仅仅是单个画布，还可以嵌套其他控件，从而创建复杂组件。例如，实现一个带标签的滑块控件。

```racket
(define labeled-slider%
  (class vertical-panel%
    (init-field label-text min-val max-val)
    (super-new)

    ;; 创建标签
    (define lbl
      (new message%
           [parent this]
           [label (format "~a: ~a" label-text min-val)]))

    ;; 创建滑块
    (define slider
      (new slider%
           [parent this]
           [label #f]
           [min-value min-val]
           [max-value max-val]
           [init-value min-val]
           [callback (lambda (s e)
                      (let ([val (send s get-value)])
                        (send lbl set-label (format "~a: ~a" label-text val))))]))

    ;; 提供获取值的方法
    (define/public (get-value)
      (send slider get-value))))

(define win3 (new frame% [label "滑块示例"] [width 300] [height 150]))

(new labeled-slider%
     [parent win3]
     [label-text "音量"]
     [min-val 0]
     [max-val 100])

(send win3 show #t)
```

**讲解：**

- 继承 `vertical-panel%` 可以容纳多个子控件并垂直排列。
- 自定义控件可以组合已有控件，实现功能复用。
- 滑块的回调函数接收两个参数（滑块对象和事件），通过 `get-value` 方法获取当前值。
- 提供 `get-value` 公共方法，让外部可以访问控件状态。

## 5. 高级技巧

1. **自定义绘制优化**
    - 使用 `refresh` 触发重绘，Racket 会自动合并多个刷新请求，优化绘制性能。
    - 避免在 `on-paint` 中做耗时操作，只绘制图形。
2. **支持键盘事件**
    - 重写 `on-char` 方法处理键盘输入。
    - 结合状态，可以做自定义文本编辑器或游戏控件。
3. **状态管理与属性**
    - 使用 `init-field`、`define` 和 `define/public` 管理控件状态。
    - 支持外部访问控件属性，例如读取当前值或设置颜色。
4. **动画与刷新**
    - 使用 `timer%` 定时更新状态并调用 `refresh`。
    - 可以实现动画控件，比如进度条、闪烁提示等。

```racket
;; 动画进度条示例
(define progress-bar%
  (class canvas%
    (super-new)
    (define progress 0)

    (define/override (on-paint)
      (let ([dc (send this get-dc)]
            [w (send this get-width)]
            [h (send this get-height)])
        (send dc set-brush (new brush% [color "white"]))
        (send dc draw-rectangle 0 0 w h)
        (send dc set-brush (new brush% [color "blue"]))
        (send dc draw-rectangle 2 2 (* (- w 4) (/ progress 100)) (- h 4))))

    (define/public (set-progress val)
      (set! progress (max 0 (min 100 val)))
      (send this refresh))))

;; 使用 timer% 实现动画
(define win4 (new frame% [label "进度条"] [width 250] [height 80]))

(define pbar (new progress-bar% [parent win4]))

(define counter 0)

(define tmr
  (new timer%
       [notify-callback (lambda ()
                         (set! counter (+ counter 1))
                         (send pbar set-progress counter)
                         (when (>= counter 100)
                           (send tmr stop)))]
       [interval 50]))

(send win4 show #t)
(send tmr start 50)
```

## 6. 总结

自定义控件是 Racket GUI 编程的重要技巧，核心步骤是：

1. 继承适当的控件类（`canvas%` 或 `panel%`）。
2. 重写 `on-paint` 方法进行自定义绘制，使用 `get-dc` 获取绘图上下文。
3. 重写 `on-event`、`on-char` 等方法处理交互。
4. 管理控件状态，必要时提供外部访问接口。
5. 可组合已有控件，构建更复杂的 UI 组件。

掌握这些方法后，你就能在 Racket 中实现几乎任何形式的自定义控件，从简单的按钮到复杂的交互面板，都可以灵活实现。