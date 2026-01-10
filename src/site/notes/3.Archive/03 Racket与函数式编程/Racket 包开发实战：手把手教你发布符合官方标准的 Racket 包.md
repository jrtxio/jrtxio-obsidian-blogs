---
{"dg-publish":true,"dg-path":"03 Racket与函数式编程/Racket 包开发实战：手把手教你发布符合官方标准的 Racket 包.md","permalink":"/03 Racket与函数式编程/Racket 包开发实战：手把手教你发布符合官方标准的 Racket 包/"}
---

#lisp #racket 

发布 Racket 包并不复杂，但第一次发布时，很多人会卡在两个极端：

- 要么写成“Hello World”式的玩具包
- 要么在发布前就被工程细节拖住

本文的目标只有一个：

> **让你第一次发布的 Racket 包，符合官方生态的基本预期，并成功进入官方包目录。**

## 一、什么是“合格的官方包”？

一个可以发布到 `pkgs.racket-lang.org` 的包，至少需要：

- 一个可被 `require` 的模块
- 一个完整的 `info.rkt`
- README 与 LICENSE
- 可访问的 Git 仓库
- 测试与文档在构建时不报错

后文的所有步骤，都是围绕这些最低要求展开的。

## 二、创建包的基本结构

```
my-first-pkg/
├── main.rkt
├── info.rkt
├── my-first-pkg.scrbl
├── README.md
├── LICENSE
└── tests/
    └── test-main.rkt
```

这是 Racket 官方生态中**最常见、最稳妥**的结构，新手不建议自行变形。

## 三、实现一个真实可发布的模块

```racket
#lang racket/base

(provide add1-safe
         (contract-out
          [even? (-> exact-integer? boolean?)]))

(define (add1-safe x)
  (+ x 1))
```

这个示例刻意保持简单，但具备官方包的基本特征：

- 使用 `racket/base`
- 明确 `provide`
- 至少一个公共 API
- 至少一个带合约的导出函数

## 四、编写 info.rkt（发布的关键）

```racket
#lang info

(define collection "my-first-pkg")
(define pkg-desc "My first Racket package")
(define version "0.1.0")
(define pkg-authors '("Your Name"))

(define deps '("base"))
(define build-deps '("scribble-lib" "racket-doc" "rackunit-lib"))

(define scribblings '(("my-first-pkg.scrbl" ())))

(define license 'MIT)
```

`info.rkt` 决定了包能否被官方目录正确识别，没有它就无法发布。

## 五、准备最小但合格的文档

官方包**可以很简单，但不能没有文档**。

```racket
#lang scribble/manual

@require[@for-label[my-first-pkg racket/base]]

@title{My First Package}
@author{Your Name}

@defmodule[my-first-pkg]

@section{API}

@defproc[(add1-safe [x integer?]) integer?]{
Adds 1 to @racket[x].
}
```

要求只有三点：

- 有 `@defmodule`
- 每个导出函数有说明
- 文档可以成功构建

## 六、添加基础测试（用于构建验证）

```racket
#lang racket/base

(require rackunit
         my-first-pkg)

(check-equal? (add1-safe 1) 2)
(check-true (even? 2))
```

测试的目的不是覆盖率，而是确保包在官方构建环境中不会失败。

```bash
raco test .
```

## 七、README 与 LICENSE

README 至少应包含安装方式：

```bash
raco pkg install my-first-pkg
```

LICENSE 建议选择常见协议（MIT / BSD / Apache-2.0）。

## 八、发布到官方包目录

1. 将代码推送到 Git 仓库
2. 打开 [https://pkgs.racket-lang.org/](https://pkgs.racket-lang.org/)
3. 选择 **Add Your Own Package**
4. 填写包名与仓库地址并提交

系统会自动执行构建、测试和文档生成。

发布成功后，你的包即可通过：

```bash
raco pkg install my-first-pkg
```

进行安装。

## 九、关于版本与维护（了解即可）

- 第一次发布使用 `0.1.0` 即可
- 后续更新递增版本号
- 破坏性修改再考虑主版本升级

这些属于下一阶段内容，不影响第一次发布。

## 十、总结

第一次发布 Racket 包，不需要做到“完美工程”，但必须做到：

- 结构正确
- 信息完整
- 能通过官方构建

做到这些，你发布的就不是玩具包，而是一个**正式进入 Racket 生态的官方包**。