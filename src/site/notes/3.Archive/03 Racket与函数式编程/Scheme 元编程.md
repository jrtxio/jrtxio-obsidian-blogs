---
{"dg-publish":true,"dg-path":"03 Racket与函数式编程/Scheme 元编程.md","permalink":"/03 Racket与函数式编程/Scheme 元编程/"}
---

#Innolight #Lisp 

# 同相性概述

同相性（homoiconicity）指的是，程序和程序所操作的数据采用统一的编码格式。在 Lisp 语言中，S 表达式实现了这一特性。例如：

```scheme
(fn x)
```

既可以被看作是代码，表示调用函数 `fn`，传入参数 `x`；也可以看作是数据，一个由符号 `fn` 和 `x` 组成的列表。

这一特性使我们能够像操作数据一样操作代码，从而方便地实现代码转换。例如：

- `(fn x)` 可被转换为 `(begin (display x) (fn x))`，然后再执行。
- 定义变量时，可以将 `(define-with-display (f a) (g a))` 转换为：

```scheme
(define (f a) 
  (display a)
  (g a))
```

这种在代码层面上的转换被称为**宏**（macro）。

# 定义宏的基本方法

Scheme 是 Lisp 的一个精简方言，使用 `define-syntax` 来定义宏。本质上，宏是一个特殊的标识符，与一个转换器函数相关联。 

在 Scheme 的表达式求值过程中，分为三个阶段：

1. **读取期**：读取并解析代码。
2. **宏展开期**：在遇到宏调用时，调用相关联的转换器，生成新的代码。
3. **运行期**：对宏展开后的代码求值。

在解释器中，宏展开和表达式求值可能交替进行；而在编译器中，它们通常是独立的阶段。

## 示例：定义一个宏 `or`

以下代码定义了一个宏 `or`，用于对 `(or ...)` 表达式进行转换：

```scheme
(define-syntax or
  (syntax-rules ()
    [(_) #f]
    [(_ e) e]
    [(_ e1 e2 e3 ...)
     (let ([t e1])
       (if t t (or e2 e3 ...)))]))
```

转换规则：

- `(or)` 转换为 `#f`。
- `(or a)` 转换为 `a`。
- `(or a b)` 转换为 `(let ([t a]) (if t t (or b)))`。

宏展开支持递归调用，例如 `(or a b c)` 会被逐步展开。

# 模式匹配

`syntax-rules` 使用模式匹配来定义转换器。每条规则的格式为 `[模式 模板]`，当某个模式匹配成功时，按模板进行转换。例如：

```scheme
[(_ e) e]
```

- 模式：`(_ e)`，其中 `_` 是通配符。
- 模板：`e`。

这一规则可以将 `(or a)` 转换为 `a`。

模式中的省略号 `...` 表示重复匹配。例如：

```scheme
(_ e1 e2 e3 ...)
```

匹配 `(or a b c)` 后，`e1` 对应 `a`，`e2` 对应 `b`，`e3` 对应 `c`，模板中的 `...` 会填充匹配的值。

# 转换器函数

另一种定义宏的方法是显式指定转换器函数。例如：

```scheme
(define-syntax r
  (lambda (x)
    (display x)
    (display "\n")
    #t))
```

在 REPL 中，执行 `r` 会显示：

```
#<syntax r>
#t
```

# 使用 `syntax-case` 进行复杂转换

`syntax-case` 是 Scheme 中用于处理语法对象的特殊形式。以下是用 `syntax-case` 定义宏 `or` 的示例：

```scheme
(define-syntax or
  (lambda (x)
    (syntax-case x ()
      [(_) #'#f]
      [(_ e) #'e]
      [(_ e1 e2 e3 ...)
       #'(let ([t e1]) (if t t (or e2 e3 ...)))])))
```

- `#'` 是 `(syntax ...)` 的简写，用于生成语法对象。

# 语法对象与作用域

语法对象（syntax object）封装了标识符的作用域信息，用以保证 Scheme 宏的卫生性（hygiene）。  

语法对象在读取阶段由 `(syntax ...)` 创建，其简写为 `#'`，例如：

```scheme
#'e
```

它会在读取阶段展开为 `(syntax e)`。

# 定义宏的宏

`syntax-rules` 本身也是一个宏，它最终被展开为 `syntax-case`。例如：

```scheme
(define-syntax syntax-rules
  (lambda (x)
    (syntax-case x ()
      [(_ (i ...) ((keyword . pattern) template) ...)
       #'(lambda (x)
           (syntax-case x (i ...)
             [(_ . pattern) #'template] ...))])))
```

# 结语

Lisp 的宏强大而灵活，虽然宏仅仅是对代码的转换工具，却极大地简化了复杂逻辑的实现。  