---
{"dg-publish":true,"dg-path":"03 Racket与函数式编程/【GUI】入门 Noise（八）：DSL 快速入门指南 - 定义记录、枚举与 RPC.md","permalink":"/03 Racket与函数式编程/【GUI】入门 Noise（八）：DSL 快速入门指南 - 定义记录、枚举与 RPC/"}
---

#lisp/racket #gui/noise 

## 1. Racket 端定义

在 Racket 中，你通常会在一个专门的协议文件中使用 `noise/serde` 和 `noise/backend`。

### 1.1 定义记录

用于定义结构化数据。

```
(define-record User
  [id : UInt32]
  [name : String #:contract string?]
  [(age 18) : Varint] ; 支持默认值
  [metadata : (Optional (HashTable String String))])
```

- **语法**: `[字段名 : 类型]`
- **默认值**: `[(字段名 默认值) : 类型]`
- **契约**: `#:contract` 用于 Racket 端的运行期校验。
- **生成的 Swift**: 对应一个 `public struct`，包含构造函数和 `Readable/Writable` 实现。

### 1.2 定义枚举

用于定义代数数据类型（Sum Types）。

``` racket
(define-enum Status
  [active]
  [pending]
  [error {message : String} {code : Int32}])
```

- **语法**: `[成员名]` 或 `[成员名 {字段 : 类型} ...]`
- **生成的 Swift**: 对应一个 `public enum`，带有关联值（Associated Values）。

### 1.3 定义远程调用 (RPC)

定义 Swift 可以调用的函数。

``` racket
(define-rpc (get-user [user-id : UInt32]) : (Optional User)
  (unless (is-valid? user-id)
    (error "Invalid user ID"))
  (fetch-user-from-db user-id))
```

- **语法**: `(define-rpc (函数名 [参数名 : 类型] ...) : 返回类型 身体...)`
- **返回类型**: 如果省略，默认为 `Void`。
- **生成的 Swift**: `Backend` 类中的一个异步方法。

## 2. 数据类型映射

| Racket 类型         | Swift 类型       | 说明                     |
| ----------------- | -------------- | ---------------------- |
| `Bool`            | `Bool`         |                        |
| `Int16/32`        | `Int16/32`     | 固定长度整数                 |
| `UInt16/32`       | `UInt16/32`    | 固定长度无符号整数              |
| `Varint`          | `Int64`        | 变长整数 (压缩空间)            |
| `UVarint`         | `UInt64`       | 变长无符号整数                |
| `Float32/64`      | `Float/Double` |                        |
| `String`          | `String`       | UTF-8 编码               |
| `Bytes`           | `Data`         | 原始字节流                  |
| `Symbol`          | `String`       | Racket 符号映射为 Swift 字符串 |
| `(Listof T)`      | `[T]`          | 列表映射为数组                |
| `(Optional T)`    | `T?`           | 可选值                    |
| `(HashTable K V)` | `[K: V]`       | 哈希表映射为字典               |

## 3. Swift 端使用

生成代码后，你可以在 Swift 中这样调用：

### 3.1 初始化 Backend

``` swift
let backend = Backend(
    withZo: bundle.url(forResource: "mods", withExtension: "zo")!,
    andMod: "main",
    andProc: "serve"
)
```

### 3.2 异步调用 (Async/Await)

这是最推荐的调用方式。

``` swift
do {
    let user = try await backend.getUser(userId: 42)
    if let user = user {
        print("Fetched: \(user.name)")
    }
} catch {
    print("RPC Error: \(error)")
}
```
### 3.3 Future 调用

如果你在不支持 Swift Concurrency 的环境，可以使用 `Future` 模式：

``` swift
backend.getUser(userId: 42).onComplete { result in
    switch result {
    case .success(let user):
        // 处理成功
    case .failure(let error):
        // 处理失败
    }
}
```

## 4. 最佳实践建议

1. **契约保护**: 在 Racket 端尽量使用 `#:contract`，它能帮你快速定位数据越界或非法输入问题。
2. **变长整数**: 除非有明确的位宽需求，否则优先使用 `Varint/UVarint`，它们在网络传输和持久化中更省空间。
3. **模块解耦**: 建议专门建立一个 `protocol.rkt` 文件定义数据结构和 RPC，然后由另一个文件实现具体的业务逻辑，最后用一个 `main.rkt` 来 `serve`。

通过这套语法，Noise 成功地将 Racket 的表达能力带到了 iOS 和 macOS 的原生开发中。