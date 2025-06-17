---
{"dg-publish":true,"dg-path":"工具教程/如何在 DrRacket 中高效地编辑.md","permalink":"/工具教程/如何在 DrRacket 中高效地编辑/","created":"2025-03-27T15:26:42.100+08:00","updated":"2025-05-15T14:35:18.311+08:00"}
---

#Innolight #Racket 

# 结构化编辑

通过在 DrRacket 中安装 [drracket-paredit](https://github.com/yjqww6/drracket-paredit) 插件，可以帮助我们在操作 S 表达式（S-expression ）时保持代码的结构性，从而避免在手动调整括号时引入问题。插件主要包含的功能如下：

- 保持括号平衡：在插入或删除括号时，自动保证括号是成对出现的，避免语法错误。例如，当你输入 ( 时插件会自动不全一个 ) 。
- 结构化导航： 提供快捷键，以 S 表达式为单位进行导航，而不是逐字符或逐词移动。例如，可以快速跳到下一个或上一个完整的表达式。
 - 结构化编辑：支持对代码块（S 表达式）进行剪切、复制、粘贴等操作，而不仅仅是文本操作。例如，调整表达式的嵌套层次、合并括号或分解括号。
 - 安全删除：删除操作会自动避免破坏代码结构。例如，删除一个括号时，会同时删除匹配的括号。
 - 高级括号操作：支持括号的“吞吐”（slurping & barfing）操作，即调整括号范围，使表达式更容易读或更符合语义。

# 快捷键介绍

[drracket-paredit](https://github.com/yjqww6/drracket-paredit) 包含的快捷键如下：

Movement:

- `("c:m:f")` paredit-forward-sexp
- `("c:m:b")` paredit-backward-sexp
- `("c:m:d")` down-sexp ;rebind to `"c:m:d"`
- `("m:right")` forward-atom ;this is not paredit shortcuts, but alternative for forward-word
- `("m:left")` backward-atom ;ditto

Depth-Changing:

- `("m:s")` paredit-splice-sexp
- `("m:(")` paredit-wrap-round
- `("m:up")` paredit-splice-sexp-killing-backward
- `("m:down")` paredit-splice-sexp-killing-forward
- `("m:r")` paredit-raise-sexp
- `("m:?")` paredit-convolute-sexp

Slurpage & barfage

- `("c:right" "c:)" "c:]")` paredit-slurp-forward
- `("c:m:left" "c:(" "c:[")` paredit-slurp-backward
- `("c:left" "c:}")` paredit-barf-forward
- `("c:m:right" "c:{")` paredit-barf-backward

> [!NOTE]
> All the key bindings involving meta key `"m:"` can also be accessed using the Escape key, by pressing and releasing it before proceeding with the remaining keys, just like in Emacs. This is equivalent to replacing `"m:"` with prepended `"esc;"`.
> 
> Moreover, `"m:"` can be accessed through `"?:a:"`(the Option Key) on MacOS.
> 
> You can see the up-to-date list of all the key bindings applied on your platform, by selecting from DrRacket's menu Edit, Keybindings, Show Active Keybindings, and filtering the list with "paredit."

下面介绍一下各个快捷键的使用场景
## 移动（Movement）

这些快捷键让你能够快速地在代码中以 S 表达式为单位导航，而不是逐字符或逐词移动。

- `"c:m:f"` (paredit-forward-sexp)

场景：跳转到下一个 S 表达式的末尾
示例：

``` racket
(define (square x)
  (* x x)) ; 光标在 `define` 时，按 `c:m:f` 跳到 `square`，再跳到 `(square x)` 的末尾。
```

- `c:m:b` (paredit-backward-sexp)

场景：跳到当前或上一个 S 表达式的开头
示例：

``` racket
(define (square x)
  (* x x)) ; 光标在 `x` 时，按 `c:m:b` 跳到 `(* x x)` 的开头。
```

- `c:m:d` (down-sexp)

场景：进入当前 S 表达式的下一层
示例：

```
(define (square x)
  (* x x)) ; 光标在 `(square x)`，按 `c:m:d` 进入 `(* x x)`。
```

- `m:right` (forward-atom)

场景：跳到下一个符号或原子（类似 `forward-word`）
示例：

```
(define square x) ; 从 `define` 跳到 `square`，再到 `x`。
```

- `m:left` (backward-atom)

场景：与 `m:right` 相反，跳到上一个符号或原子。

## 深度变化（Depth-Changing）

这些快捷键用于修改表达式的结构（如合并、提取或包装）。

- `m:s` (paredit-splice-sexp)

场景：移除当前表达式的外围括号，保持内部结构
示例：

```
((+ 1 2)) ; 按 `m:s` 后变成 `(+ 1 2)`。
```

- `m:(` (paredit-wrap-round)

场景：用一对括号包裹当前表达式。
示例：

``` racket
+ 1 2 ; 光标在 `+`，按 `m:(` 后变成 `(+ 1 2)`。
```

- `m:up` (paredit-splice-sexp-killing-backward)

场景：删除当前表达式开头的括号，并将其前面的部分删除
示例：

``` racket
(define (+ 1 2)) ; 光标在 `(define ...`，按 `m:up` 变成 `(+ 1 2)`。
```

- `m:down` (paredit-splice-sexp-killing-forward)

场景：与 m:up 类似，但删除当前表达式末尾的括号及其后面的部分

- `m:r` (paredit-raise-sexp)

场景：将当前 S 表达式替换为其子表达式
示例：

``` racket
(define (* (+ 1 2) 3)) ; 光标在 `(+ 1 2)`，按 `m:r` 后变成 `(* 1 2)`。
```

- `m:?` (paredit-convolute-sexp)

场景：重新排列嵌套的 S 表达式，将内部表达式提升到外层
示例：

``` racket
(define (+ (* 2 3) 4)) ; 光标在 `(* 2 3)`，按 `m:?` 后变成 `(* 2 (+ 3 4))`。
```

## 吞吐与吐出

这些快捷键是操作括号范围的神器，可以让括号快速“吞”或“吐”邻近的表达式。

- `c:right` / `c:)` / `c:]` (paredit-slurp-forward)

场景：将当前括号右边的一个表达式“吞”进括号中
示例：

``` racket
(define (+ 1) 2) ; 按 `c:right` 后变成 `(define (+ 1 2))`。
```

- `c:m:left` / `c:(` / `c:[` (paredit-slurp-backward)

场景：将当前括号左边的一个表达式“吞”进括号中
示例：

```
define (+ 1) ; 按 `c:m:left` 后变成 `(define (+ 1))`。
```

- `c:left` / `c:}` (paredit-barf-forward)

场景：将当前括号中右侧的一个表达式“吐”出括号
示例：

``` racket
(define (+ 1 2)) ; 按 `c:left` 后变成 `(define (+ 1)) 2`。
```

- `c:m:right` / `c:{` (paredit-barf-backward)

场景：将当前括号中右侧的一个表达式“吐”出括号
示例：

``` racket
(define (+ 1 2)) ; 按 `c:m:right` 后变成 `1 (define (+ 2))`。
```

# 总结

- 移动快捷键：快速定位到需要操作的 S 表达式。
- 深度操作快捷键：修改 S 表达式的嵌套结构。
- 括号操作快捷键：高效调整括号范围

这些快捷键配合使用，可以显著提升编辑代码的效率，同时保证代码的正确性，非常适合 Lisp 和 Racket 的开发者。