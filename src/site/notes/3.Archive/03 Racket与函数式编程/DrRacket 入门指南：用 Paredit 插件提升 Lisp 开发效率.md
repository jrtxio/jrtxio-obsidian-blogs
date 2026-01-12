---
{"dg-publish":true,"dg-path":"03 Racket与函数式编程/DrRacket 入门指南：用 Paredit 插件提升 Lisp 开发效率.md","permalink":"/03 Racket与函数式编程/DrRacket 入门指南：用 Paredit 插件提升 Lisp 开发效率/"}
---

#lisp #racket 

## 结构化编辑

通过在 DrRacket 中安装 [drracket-paredit](https://github.com/yjqww6/drracket-paredit) 插件，可以帮助我们在操作 S 表达式（S-expression ）时保持代码的结构性，从而避免在手动调整括号时引入问题。插件主要包含的功能如下：

- 保持括号平衡：在插入或删除括号时，自动保证括号是成对出现的，避免语法错误。例如，当你输入 ( 时插件会自动补全一个 ) 。
- 结构化导航： 提供快捷键，以 S 表达式为单位进行导航，而不是逐字符或逐词移动。例如，可以快速跳到下一个或上一个完整的表达式。
- 结构化编辑：支持对代码块（S 表达式）进行剪切、复制、粘贴等操作，而不仅仅是文本操作。例如，调整表达式的嵌套层次、合并括号或分解括号。
- 安全删除：删除操作会自动避免破坏代码结构。例如，删除一个括号时，会同时删除匹配的括号。
- 高级括号操作：支持括号的"吞吐"（slurping & barfing）操作，即调整括号范围，使表达式更容易读或更符合语义。

> [!WARNING] 
> 在使用快捷键之前，必须先进入 **Edit → Preferences → Editing**，取消勾选「Enable keybindings in menus (overrides Emacs keybinds)」，否则所有 paredit 快捷键都不会生效。修改后需要重启 DrRacket。

## 快捷键介绍

drracket-paredit 包含的快捷键如下：

Movement:

- `("c:m:f")` paredit-forward-sexp
- `("c:m:b")` paredit-backward-sexp
- `("c:m:d")` down-sexp ;rebind to `"c:m:d"`
- `("m:right")` forward-atom ;this is not paredit shortcuts, but alternative for forward-word
- `("m:left")` backward-atom ;ditto

Depth-Changing:

- `("m:s")` paredit-splice-sexp
- `("m:(")` paredit-wrap-round
- `("m:up")` paredit-splice-sexp-killing-backward
- `("m:down")` paredit-splice-sexp-killing-forward
- `("m:r")` paredit-raise-sexp
- `("m:?")` paredit-convolute-sexp

Slurpage & barfage

- `("c:right" "c:)" "c:]")` paredit-slurp-forward
- `("c:m:left" "c:(" "c:[")` paredit-slurp-backward
- `("c:left" "c:}")` paredit-barf-forward
- `("c:m:right" "c:{")` paredit-barf-backward

下面介绍一下各个快捷键的使用场景

> [!NOTE]
> 如果不了解快捷键的含义，可以参考这篇文章 [[3.Archive/03 Racket与函数式编程/DrRacket 入门指南：快捷键完全指南\|DrRacket 入门指南：快捷键完全指南]]

### 移动（Movement）

这些快捷键让你能够快速地在代码中以 S 表达式为单位导航，而不是逐字符或逐词移动。

- `"c:m:f"` (paredit-forward-sexp)

场景：跳转到下一个 S 表达式的末尾 示例：

```racket
(define (square x) (* x |x))
; 光标在 | 处，按 c:m:f 跳到 x 后面
(define (square x) (* x x|))
```

- `c:m:b` (paredit-backward-sexp)

场景：跳到当前或上一个 S 表达式的开头 示例：

```racket
(define (square x) (* x x|))
; 光标在 | 处，按 c:m:b 跳到当前 x 的开头
(define (square x) (* x |x))
```

- `c:m:d` (down-sexp)

场景：进入当前 S 表达式的下一层 示例：

```racket
(define |(square x) (* x x))
; 光标在 | 处，按 c:m:d 进入子表达式
(define (|square x) (* x x))
```

- `m:right` (forward-atom)

场景：跳到下一个符号或原子（类似 `forward-word`） 示例：

```racket
(define |square x)
; 从 | 处按 m:right 跳到下一个原子的末尾
(define square| x)
```

- `m:left` (backward-atom)

场景：与 `m:right` 相反，跳到上一个符号或原子 示例：

```racket
(define square |x)
; 从 | 处按 m:left 跳到前一个原子
(define |square x)
```

### 深度变化（Depth-Changing）

这些快捷键用于修改表达式的结构（如合并、提取或包装）。

- `m:s` (paredit-splice-sexp)

场景：移除当前表达式的外围括号，保持内部结构 示例：

```racket
(foo (bar |(+ 1 2)) baz)
; 光标在 | 处，按 m:s 移除 (bar ...) 的括号
(foo bar (+ 1 2) baz)
```

- `m:(` (paredit-wrap-round)

场景：用一对括号包裹当前表达式。 示例：

```racket
(foo |bar baz)
; 光标在 | 处，按 m:( 包裹 bar
(foo (bar) baz)
```

- `m:up` (paredit-splice-sexp-killing-backward)

场景：移除外围括号，并删除光标前面的所有内容 示例：

```racket
(foo (bar |(+ 1 2)) baz)
; 光标在 | 处，按 m:up，删除光标前面的内容
(foo (+ 1 2) baz)
```

- `m:down` (paredit-splice-sexp-killing-forward)

场景：移除外围括号，并删除光标位置及其后面的所有内容 示例：

```racket
(foo (|bar (+ 1 2)) baz)
; 光标在 | 处，按 m:down，删除光标及其后面的内容
(foo baz)
```

- `m:r` (paredit-raise-sexp)

场景：将光标所在的 S 表达式提升，替换其父表达式 示例：

```racket
(* 10 (+ |(- 5 2) 3))
; 光标在 | 处，按 m:r，(- 5 2) 替换整个 (+ ...) 表达式
(* 10 (- 5 2))
```

- `m:?` (paredit-convolute-sexp)

场景：重新排列嵌套结构，将光标所在表达式与外层表达式互换位置 示例：

```racket
(let ([x 3]) (+ |(* 2 x) 1))
; 光标在 | 处，按 m:?，(* 2 x) 提升与 + 互换
(+ (let ([x 3]) (* 2 x)) 1)
```

### 吞吐与吐出（Slurpage & Barfage）

这些快捷键是操作括号范围的神器，可以让括号快速"吞"或"吐"邻近的表达式。

- `c:right` / `c:)` / `c:]` (paredit-slurp-forward)

场景：将光标所在括号**右边紧邻**的表达式"吞"进括号内（扩大括号范围） 示例：

```racket
(foo (bar |baz) qux)
; 光标在括号内任意位置，按 c:right
(foo (bar baz qux))
; qux 被吞入括号内，右括号向右移动
```

- `c:m:left` / `c:(` / `c:[` (paredit-slurp-backward)

场景：将光标所在括号**左边紧邻**的表达式"吞"进括号内（扩大括号范围） 示例：

```racket
(foo bar (|baz qux))
; 光标在括号内任意位置，按 c:m:left
(foo (bar baz qux))
; bar 被吞入括号内，左括号向左移动
```

- `c:left` / `c:}` (paredit-barf-forward)

场景：将光标所在括号内**最右侧**的表达式"吐"出括号外（缩小括号范围） 示例：

```racket
(foo (bar baz |qux))
; 光标在括号内任意位置，按 c:left
(foo (bar baz) qux)
; qux 被吐出括号外，右括号向左移动
```

- `c:m:right` / `c:{` (paredit-barf-backward)

场景：将光标所在括号内**最左侧**的表达式"吐"出括号外（缩小括号范围） 示例：

```racket
(foo (bar |baz qux))
; 光标在括号内任意位置，按 c:m:right
(foo bar (baz qux))
; bar 被吐出括号外，左括号向右移动
```

## 总结

- 移动快捷键：快速定位到需要操作的 S 表达式。
- 深度操作快捷键：修改 S 表达式的嵌套结构。
- 括号操作快捷键：高效调整括号范围

这些快捷键配合使用，可以显著提升编辑代码的效率，同时保证代码的正确性，非常适合 Lisp 和 Racket 的开发者。