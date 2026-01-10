---
{"dg-publish":true,"dg-path":"03 Racket与函数式编程/Racket 语法指南：还在为函数式编程缺乏状态而困扰？用 Racket 闭包实现对象模拟.md","permalink":"/03 Racket与函数式编程/Racket 语法指南：还在为函数式编程缺乏状态而困扰？用 Racket 闭包实现对象模拟/"}
---

#lisp #racket 

在学习函数式编程（尤其是 Racket、Scheme、JavaScript 等语言）时，你一定会遇到一个关键概念——**闭包（Closure）**。这篇文章将带你从零理解什么是闭包、为什么它重要，以及它如何让函数拥有类似“对象”的能力。

# 什么是词法闭包？

在计算机科学中，**闭包（Closure）**，又称词法闭包（Lexical Closure）或函数闭包（Function Closure），指的是：

> **一个引用了外部自由变量的函数，并且这些被引用的变量会与函数共存，即使函数已经离开了它原本的创建环境。**

换句话说：

- 函数内部使用了外部变量
- 函数被创建时会“记住”这些变量
- 即使函数之后被返回到别的地方执行，这些变量依然可用

这种“函数 + 环境变量一并打包”的机制，就是闭包。

# 为什么自由变量通常无法再访问？

来看一个简单事实：

> 一个变量离开了它的作用域，就无法继续访问。

正常情况下，离开一个 `let`、一个函数体、一个 block 的变量都会被销毁。但闭包改变了这一点 —— 它让某些变量 **在原本作用域结束后仍能存活**。

这种能力非常关键，是函数式语言能模拟“类”和“对象”的核心原因。

# 闭包是如何扩展变量作用域的？

关键机制在于**匿名函数捕获外部变量**。

来看一个简单示例（Racket 风格伪码）：

```racket
(let ([count 0])
  (lambda ()
    (set! count (+ count 1))
    count))
```

这里的匿名函数引用了外部的 `count`，于是：

- `count` 不会随着 `let` 结束而消失
- 这个匿名函数随身携带了一份“专属状态”
- 每次调用都会累加自己的 `count`

闭包因此扩展了变量的生命周期与作用域。

# 闭包 = 函数 + 状态（对象的原型雏形）

当我们把一个函数连同内部变量一起“打包”后，这份包就和 OOP（面向对象）中的“对象实例”非常像：

- **不同实例有不同的状态**
- **外界不能直接访问内部变量（封装）**
- **只能通过公开接口访问内部数据（方法）**

例如，一个“计数器工厂”：

```racket
(define (make-counter)
  (let ([count 0])
    (lambda (msg . args)
      (cond
        [(eq? msg 'inc)
         (set! count (add1 count))
         count]
        [(eq? msg 'get)
         count]
        [else
         (error "Unknown message" msg)]))))
```

创建两个实例：

```racket
(define c1 (make-counter))
(define c2 (make-counter))

(send c1 'inc) ; => 1
(send c1 'inc) ; => 2

(send c2 'get) ; => 0
(send c2 'inc) ; => 1
```

> 其中我们约定用 `(send obj 'method ...)` 来发送消息（见下面的 `send` 帮助函数）。

不同闭包实例拥有不同的 `count`。这就是“对象的行为”，但完全无需类（class）语法。

# 闭包为何重要？

闭包是函数式编程中最强大的概念之一，它的作用包括：

- 扩展变量的生命周期（让变量持久存在）
- 实现封装（外界无法直接访问内部状态）
- 实现类和对象的特性（不同实例有不同状态）
- 构建私有数据、提供接口
- 替代全局变量，让代码更安全可控

从简单的计数器，到模块系统、回调、状态机，都离不开闭包。

# 用闭包实现一个迷你类系统（Racket 示例）

下面我们展示如何用闭包做一个**极简却实用**的“类系统”——用来说明思想而不是替代语言自带的类/对象系统。这个迷你系统包含：

- 对象由构造器（constructor）创建，返回一个**消息分发函数**（dispatch function）
- 使用 `send` 辅助函数来发送消息（方法名用符号）
- 支持**私有字段**（闭包变量）和**封装**（外界无法直接访问字段）
- 通过**委托（delegation）** 实现简单的继承/扩展（把未处理的方法转发给“父对象”）

> 所有示例均为纯 Racket，可直接在 DrRacket 或 `racket` REPL 中运行。

## send 辅助函数

```racket
;; 发送消息给对象（对象是一个 proc：(obj msg . args)）
(define (send obj msg . args)
  (apply obj msg args))
```

## 例 1：计数器类（最小化实现）

```racket
#lang racket

(define (make-counter)
  (let ([count 0])
    ;; dispatcher
    (lambda (msg . args)
      (cond
        [(eq? msg 'inc)
         (set! count (add1 count))
         count]
        [(eq? msg 'get)
         count]
        [(eq? msg 'reset)
         (set! count 0)
         count]
        [else
         (error "Unknown method" msg)]))))
```

使用：

```racket
(define c (make-counter))
(send c 'get) ; => 0
(send c 'inc) ; => 1
(send c 'inc) ; => 2
(send c 'reset) ; => 0
```

说明：`count` 是私有的，外界只能通过 `'inc`、`'get`、`'reset` 操作它。

## 例 2：带私有字段和方法的 Person 类

```racket
(define (make-person name age)
  (let ([name (string->symbol name)] ; 保持为 symbol 只是示例
        [age age])
    (letrec ([greet
              (lambda ()
                (format "Hi, I'm ~a and I'm ~a years old." (symbol->string name) age))]

             [self
              (lambda (msg . args)
                (cond
                  [(eq? msg 'get-name) (symbol->string name)]
                  [(eq? msg 'set-name) (set! name (string->symbol (car args))) 'ok]
                  [(eq? msg 'get-age) age]
                  [(eq? msg 'have-birthday) (set! age (add1 age)) age]
                  [(eq? msg 'greet) (greet)]
                  [else (error "Unknown method" msg)]))])
      self)))
```

使用：

```racket
(define p (make-person "Alice" 30))
(send p 'greet)      ; => "Hi, I'm Alice and I'm 30 years old."
(send p 'have-birthday) ; => 31
(send p 'get-age)    ; => 31
(send p 'set-name "Alicia") ; => 'ok
(send p 'get-name)   ; => "Alicia"
```

说明：`name` 和 `age` 完全私有；`greet` 是一个闭包内部的辅助函数，也能访问私有字段。

## 例 3：通过委托实现“继承”或扩展（Student 基于 Person）

我们用委托（delegation）的方式扩展对象行为：构建一个 `Student`，它内部创建了一个 `Person` 对象用于处理共同的方法；`Student` 自己处理学生相关的方法，未处理的消息则委托给 `Person`。

```racket
(define (make-student name age school)
  (let ([person (make-person name age)]
        [school school])
    (letrec ([self
              (lambda (msg . args)
                (cond
                  ;; Student-specific methods
                  [(eq? msg 'get-school) school]
                  [(eq? msg 'set-school) (set! school (car args)) 'ok]
                  [(eq? msg 'study) (format "~a studies at ~a" (send person 'get-name) school)]
                  ;; Delegate other methods to person
                  [else (apply person msg args)]))])
      self)))
```

使用：

```racket
(define s (make-student "Bob" 20 "Racket Univ"))
(send s 'greet)       ; delegate -> "Hi, I'm Bob and I'm 20 years old."
(send s 'get-school)  ; => "Racket Univ"
(send s 'study)       ; => "Bob studies at Racket Univ"
```

说明：`make-student` 内部创建了一个 `Person` 对象并重用其方法，这是一种“组合 + 委托”的继承风格——也常见于原型面向对象（prototype-based OOP）。

## 例 4：轻量方法查找表（更结构化的实现）

上面每次都用 `cond` 处理消息；在方法多的时候，可以用查表的方式简化，实现一个小工具 `make-object` 来把方法表和闭包状态绑在一起：

```racket
(define (make-object method-table)
  ;; method-table 是一个 alist: '((msg . proc) ...)
  (lambda (msg . args)
    (let ([pair (assoc msg method-table)])
      (if pair
          (apply (cdr pair) args) ; 方法本身应当通过闭包捕获私有字段
          (error "Unknown method" msg)))))
```

示例：用它重写一个计数器（方法利用外部闭包字段）：

```racket
(define (make-counter-2)
  (let ([count 0])
    (make-object
     (list
      (cons 'inc (lambda ()
                   (set! count (add1 count))
                   count))
      (cons 'get (lambda ()
                   count))))))
```

使用方式仍是 `(send obj 'inc)`。这种模式把方法查找和方法实现分离，方法仍然可以访问 `count`（因为它们是在 `let` 内定义、并由 `make-object` 使用）。

# 为什么这是“迷你类系统”？

- **封装**：字段是 `let`/`letrec` 中的私有变量，外界无法直接访问。
- **实例化**：每次调用构造器都会创建一组新的私有变量（新的实例）。
- **方法**：通过消息分发（dispatch）实现方法调用。
- **继承/扩展**：通过委托（delegation）把未处理的消息转发给“父对象”，实现行为复用和扩展。

这套模式用闭包就能实现面向对象的大部分基本特性，适合用来理解面向对象的语义，或在不想引入类语法时做轻量对象抽象。