---
{"dg-publish":true,"dg-path":"LISP指南/Racket 命名约定对照表 (Cheat Sheet).md","permalink":"/LISP指南/Racket 命名约定对照表 (Cheat Sheet)/","created":"2025-07-09T14:42:19.672+08:00","updated":"2025-07-09T14:48:06.873+08:00"}
---

#Innolight

# 📌 基础命名约定

| 形式/后缀            | 示例                                 | 含义 / 用途                      |
| ---------------- | ---------------------------------- | ---------------------------- |
| `xxx%`           | `frame%`, `editor%`                | **类**（class）                 |
| `xxx<%>`         | `editor<%>`, `canvas<%>`           | **接口协议**（interface/protocol） |
| `xxx-mixin`      | `editor-mixin`, `text-mixin`       | **类混入**（mixin）               |
| `xxx?`           | `string?`, `number?`               | **谓词函数**（判断返回布尔值）            |
| `xxx!`           | `set!`, `vector-set!`              | **副作用函数**（修改状态）              |
| `xxx->yyy`       | `symbol->string`                   | **类型转换函数**                   |
| `make-xxx`       | `make-hash`, `make-parameter`      | **构造函数**                     |
| `define/xxx`     | `define/public`, `define/contract` | **带修饰器的定义（类、模块中）**           |
| `with-xxx`       | `with-output-to-string`            | **作用域控制函数**（自动管理资源）          |
| `call-with-xxx`  | `call-with-input-file`             | **资源操作 + 回调**                |
| `send` / `send*` | `(send obj method ...)`            | **对象方法调用**（类系统）              |
| `parameterize`   | —                                  | **临时参数绑定上下文**                |

# 🔤 命名风格

- **小写 + 连字符（kebab-case）**
  - ✅ `string-append`
  - ✅ `file-or-directory-modify-seconds`
  - ❌ 不用 camelCase（除非自己定义）

# 📦 模块/目录命名

| 命名             | 说明                          |
|------------------|-------------------------------|
| `private/`       | 私有模块，不建议直接 require |
| `main.rkt`       | 包或库的默认入口点            |
| `lang/`          | 自定义语言定义路径            |
| `info.rkt`       | 包元信息（依赖、版本等）      |

# 🧰 常见工具函数命名（标准库）

| 函数名                     | 说明           |
| ----------------------- | ------------ |
| `for/list`              | 生成列表的 for 循环 |
| `define-values`         | 同时定义多个值      |
| `syntax-case`           | 宏展开的基本构件     |
| `hash-ref`, `hash-set!` | 哈希表访问/修改     |

# 🧪 命名直觉对照速查

| 看到名字               | 大概率表示           |
| ------------------ | --------------- |
| 结尾是 `%`            | 类（class）        |
| 包含 `<%>`           | 接口（interface）   |
| 结尾是 `?`            | 判断函数（predicate） |
| 结尾是 `!`            | 有副作用的操作         |
| 包含 `->`            | 类型转换            |
| 开头是 `with-`        | 控制作用域、临时绑定      |
| 开头是 `call-with-`   | 使用资源 + 自动清理     |
| 开头是 `make-`        | 构造函数            |
| 使用 `define/public` | 类中公开方法          |

# 📚 推荐参考资料

- [Racket 官方风格指南（非正式）](https://docs.racket-lang.org/style/)

