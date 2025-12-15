---
{"dg-publish":true,"dg-path":"03 编程语言与理论/Racket Package 创建与发布指南.md","permalink":"/03 编程语言与理论/Racket Package 创建与发布指南/","created":"2025-08-22T08:31:50.000+08:00","updated":"2025-11-25T15:36:54.000+08:00"}
---

#Innolight #Lisp #Racket 


本指南将带你从零开始创建一个 Racket 包并将其发布到官方包目录，适合没有包发布经验的新手。

# 前期准备

## 环境要求

确保你已安装：

- Racket 8.0 或更高版本
- Git 版本控制工具
- 文本编辑器（推荐 DrRacket、VS Code 或 Emacs）

## 验证环境

```bash
# 检查 Racket 版本
racket --version

# 检查包管理工具
raco --version

# 检查 Git
git --version
```

# 包结构设计

## 标准目录结构

创建一个新目录作为你的包根目录：

```
your-package-name/
├── main.rkt          # 主要实现文件
├── info.rkt          # 包元信息配置
├── your-package.scrbl # Scribble 文档
├── README.md         # 项目说明
├── LICENSE           # 开源协议
├── .gitignore        # Git 忽略文件
└── tests/            # 测试文件目录（可选）
    └── test-main.rkt
```

## 命名规范

- **包名**：使用小写字母和连字符，如 `my-awesome-lib`
- **文件名**：主文件可以命名为 `main.rkt` 或与包名相同
- **模块名**：保持与包名一致

# 核心代码实现

## 1. 创建主实现文件（main.rkt）

```racket
#|
Package Name: my-math-utils

Description: A collection of mathematical utility functions

Author: Your Name <your.email@example.com>
License: MIT
|#

#lang racket/base

;; 导入需要的模块
(require racket/math
         racket/contract)

;; 导出公共接口
(provide square
         cube
         factorial
         (contract-out
          [prime? (-> exact-positive-integer? boolean?)]))

;; 测试模块
(module+ test
  (require rackunit))

;; 实现函数
(define (square x)
  (* x x))

(define (cube x)
  (* x x x))

(define (factorial n)
  (if (<= n 1)
      1
      (* n (factorial (- n 1)))))

(define (prime? n)
  (cond
    [(<= n 1) #f]
    [(<= n 3) #t]
    [(or (= 0 (modulo n 2)) (= 0 (modulo n 3))) #f]
    [else
     (let loop ([i 5])
       (cond
         [(> (* i i) n) #t]
         [(or (= 0 (modulo n i)) (= 0 (modulo n (+ i 2)))) #f]
         [else (loop (+ i 6))]))]))

;; 单元测试
(module+ test
  (test-case "square function"
    (check-equal? (square 0) 0)
    (check-equal? (square 3) 9)
    (check-equal? (square -4) 16))
  
  (test-case "cube function"
    (check-equal? (cube 0) 0)
    (check-equal? (cube 3) 27)
    (check-equal? (cube -2) -8))
  
  (test-case "factorial function"
    (check-equal? (factorial 0) 1)
    (check-equal? (factorial 1) 1)
    (check-equal? (factorial 5) 120))
  
  (test-case "prime? function"
    (check-false (prime? 1))
    (check-true (prime? 2))
    (check-true (prime? 17))
    (check-false (prime? 15))))
```

## 2. 代码组织最佳实践

- **使用合约**：为公共函数添加类型合约
- **模块化测试**：使用 `(module+ test ...)` 内联测试
- **文档字符串**：为复杂函数添加说明
- **错误处理**：适当处理边界情况和错误

# 包信息配置

## 创建 info.rkt

```racket
#lang info

;; 包的基本信息
(define collection "my-math-utils")
(define pkg-desc "A collection of mathematical utility functions")
(define version "1.0.0")
(define pkg-authors '("Your Name"))

;; 依赖管理
(define deps '("base"))  ; 运行时依赖
(define build-deps '("scribble-lib" "racket-doc" "rackunit-lib"))  ; 构建时依赖

;; 文档配置
(define scribblings '(("my-math-utils.scrbl" ())))

;; 许可证
(define license 'MIT)

;; 包的分类标签
(define tags '("math" "utilities" "library"))

;; 编译器设置
(define compile-omit-paths '("tests"))
```

## info.rkt 字段说明

- `collection`：集合名称，通常与包名相同
- `deps`：运行时依赖包列表
- `build-deps`：文档构建和测试所需的依赖
- `scribblings`：文档文件配置
- `compile-omit-paths`：编译时忽略的路径

# 编写文档

## 创建 Scribble 文档（my-math-utils.scrbl）

```racket
#lang scribble/manual

@require[@for-label[my-math-utils
                    racket/base
                    racket/contract]]

@title{My Math Utils}
@author{Your Name}

@defmodule[my-math-utils]

This package provides a collection of mathematical utility functions
for common operations.

@section{Basic Operations}

@defproc[(square [x number?]) number?]{
  Returns the square of @racket[x].
  
  @examples[#:eval (make-base-eval)
    (require my-math-utils)
    (square 5)
    (square -3)
    (square 2.5)
  ]
}

@defproc[(cube [x number?]) number?]{
  Returns the cube of @racket[x].
  
  @examples[#:eval (make-base-eval)
    (require my-math-utils)
    (cube 3)
    (cube -2)
  ]
}

@defproc[(factorial [n exact-nonnegative-integer?]) exact-nonnegative-integer?]{
  Computes the factorial of @racket[n].
  
  @examples[#:eval (make-base-eval)
    (require my-math-utils)
    (factorial 5)
    (factorial 0)
  ]
}

@section{Number Theory}

@defproc[(prime? [n exact-positive-integer?]) boolean?]{
  Returns @racket[#t] if @racket[n] is prime, @racket[#f] otherwise.
  
  @examples[#:eval (make-base-eval)
    (require my-math-utils)
    (prime? 17)
    (prime? 15)
    (prime? 2)
  ]
}

@section{Installation}

@codeblock|{
raco pkg install my-math-utils
}|

@section{License}

This package is distributed under the MIT License.
```

## 创建 README.md

````markdown
# My Math Utils

A Racket package providing mathematical utility functions.

## Installation

```bash
raco pkg install my-math-utils
````

## Usage

```racket
#lang racket
(require my-math-utils)

(square 5)      ; => 25
(cube 3)        ; => 27
(factorial 5)   ; => 120
(prime? 17)     ; => #t
```

## API

- `square` - Compute the square of a number
- `cube` - Compute the cube of a number
- `factorial` - Compute factorial
- `prime?` - Test if a number is prime

## Documentation

Full documentation is available at: https://docs.racket-lang.org/my-math-utils/

## Testing

```bash
raco test main.rkt
```

## License

MIT License

````

## 测试与验证

### 运行测试

```bash
# 运行内联测试
raco test main.rkt

# 运行所有测试
raco test .

# 详细输出
raco test -v main.rkt
````

## 本地安装测试

```bash
# 以链接方式安装（开发期间）
raco pkg install --link .

# 测试导入
racket -e "(require my-math-utils) (square 5)"

# 构建文档
raco setup --doc-index my-math-utils

# 卸载本地包
raco pkg remove my-math-utils
```

## 验证清单

- [ ] 所有测试通过
- [ ] 包可以正常安装和卸载
- [ ] 文档可以正常生成
- [ ] 所有导出的函数都有文档
- [ ] README 信息完整
- [ ] 许可证文件存在

# 版本控制设置

## 创建 .gitignore

```gitignore
# Racket 编译文件
compiled/
*.zo

# 文档构建产物
doc/

# 编辑器临时文件
*~
.#*
\#*#
.DS_Store

# 平台相关文件
Thumbs.db
ehthumbs.db
```

## Git 初始化和提交

```bash
# 初始化仓库
git init

# 添加文件
git add .

# 首次提交
git commit -m "Initial commit: Add my-math-utils package"

# 创建 GitHub 仓库后
git remote add origin https://github.com/yourusername/my-math-utils.git
git branch -M main
git push -u origin main

# 创建版本标签
git tag v1.0.0
git push origin v1.0.0
```

# 发布到包目录

## 1. 在 GitHub 上创建仓库

1. 访问 [GitHub](https://github.com/)
2. 创建新仓库，命名为 `my-math-utils`
3. 设置为公开仓库
4. 推送代码到仓库

## 2. 注册到 Racket 包目录

1. 访问 [Racket Package Catalog](https://pkgs.racket-lang.org/)
2. 点击右上角登录/注册
3. 登录后点击 "Add Your Own Package"
4. 填写表单：
    - **Package Name**: `my-math-utils`
    - **Source**: `https://github.com/yourusername/my-math-utils.git`
    - **Source Type**: `git`
    - **Description**: 包的简短描述

## 3. 提交审核

提交后，系统会自动：

- 克隆你的代码仓库
- 验证包结构和依赖
- 运行测试
- 构建文档
- 检查许可证信息

## 4. 处理审核反馈

如果有问题，修复后：

1. 在本地修复问题
2. 提交并推送到 GitHub
3. 包目录会自动重新检查

## 5. 发布成功

审核通过后，用户可以通过以下方式安装：

```bash
raco pkg install my-math-utils
```

# 维护与更新

## 版本更新流程

1. **修改代码**
2. **更新版本号**（在 `info.rkt` 中）
3. **更新文档**
4. **运行测试**
5. **提交更改**
6. **创建新标签**

```bash
# 更新版本
git add .
git commit -m "Version 1.1.0: Add new functions"
git tag v1.1.0
git push origin main
git push origin v1.1.0
```

## 语义化版本控制

遵循 [SemVer](https://semver.org/) 规范：

- **主版本号**（1.x.x）：不兼容的API变更
- **次版本号**（x.1.x）：向后兼容的功能增加
- **修订版本号**（x.x.1）：向后兼容的问题修复

## 处理问题反馈

1. **GitHub Issues**：鼓励用户报告问题
2. **快速响应**：及时回复和修复
3. **文档更新**：根据反馈改进文档
4. **兼容性**：谨慎处理破坏性变更

# 最佳实践

## 代码质量

1. **一致的代码风格**：使用统一的缩进和命名
2. **充分的测试覆盖**：确保所有功能都有测试
3. **清晰的错误消息**：提供有用的错误信息
4. **性能考虑**：合理使用内联和优化

## 文档完善

1. **示例丰富**：为每个函数提供使用示例
2. **边界情况说明**：明确函数的使用限制
3. **安装说明**：提供清晰的安装步骤
4. **更新日志**：维护版本变更记录

## 社区友好

1. **响应式维护**：及时回复问题和 PR
2. **贡献指南**：如果接受贡献，提供指南
3. **许可证明确**：选择合适的开源许可证
4. **感谢贡献者**：在 README 中感谢贡献者

## 依赖管理

1. **最少依赖原则**：只依赖必要的包
2. **版本兼容性**：测试不同版本的兼容性
3. **依赖更新**：定期检查依赖的安全更新
4. **可选依赖**：合理使用可选功能

# 常见问题解答

## Q: 如何选择包名？

A: 包名应该：

- 具有描述性
- 避免与现有包冲突
- 使用小写字母和连字符
- 不要过长或过于简单

## Q: 什么时候需要更新主版本号？

A: 当发生以下变化时：

- 删除或重命名公共函数
- 改变函数签名
- 修改函数行为（不向后兼容）
- 改变数据结构格式

## Q: 如何处理大型包？

A: 对于复杂项目：

- 拆分为多个子模块
- 使用 `provide` 精确控制导出
- 考虑拆分为多个相关包
- 提供不同层次的API

## Q: 测试失败怎么办？

A: 检查以下方面：

- 测试用例是否正确
- 依赖是否完整
- 路径配置是否正确
- Racket 版本兼容性

# 总结

创建和发布 Racket 包是一个系统性的过程，需要注意代码质量、测试完整性、文档清晰度和社区友好性。遵循本指南，你可以创建出专业、可靠的 Racket 包，为 Racket 生态系统做出贡献。

记住，好的包不仅仅是功能正确，更重要的是易用、可维护，并且有完善的文档支持。持续改进和响应用户反馈是成功开源项目的关键。