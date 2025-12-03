---
{"dg-publish":true,"dg-path":"03 编程语言与理论/Racket Web 服务器中的延续.md","permalink":"/03 编程语言与理论/Racket Web 服务器中的延续/","created":"2025-12-03T15:57:46.345+08:00","updated":"2025-12-03T17:17:18.213+08:00"}
---

#Innolight

在之前那篇[[3.Archive/03 编程语言与理论/Racket Web 服务器缺失的指南\|Racket Web 服务器缺失的指南]]里，我曾说 `dispatch/servlet` 相当于：

```
(lambda (start)
  (lambda (conn req)
    (output-response conn (start req))))
```

但这其实是个过度简化的说法。确实，`dispatch/servlet` 会把它的 `start` 参数应用到收到的请求上，也会负责把响应写回到正确的连接上 —— 但它还有一个同样重要的任务：处理从 continuations 返回 (returned from continuations) 的响应，以及把进入的新请求分派 (dispatch) 给被捕获 (captured) 的 continuations。

省略不少细节的话，`dispatch/servlet` 的核心 (essence) 实际上大致如下：

```scheme
(define servlet-prompt
  (make-continuation-prompt 'servlet))

(define (dispatch/servlet start)
  (define servlet (make-servlet start))
  (lambda (conn req)
    (output-response conn (call-with-continuation-barrier
                           (lambda ()
                             (call-with-continuation-prompt
                               (lambda ()
                                 ((servlet-handler servlet) req))
                               servlet-prompt))))))
```

首先，它创建了一个 `servlet` 值 —— 它会把传入的请求处理函数 (request-handling function) “包裹” 起来 (wrap it)。这个 servlet 内部维护了一些状态 (internal state)，它把请求 URI 映射 (map) 到被捕获 (captured) 的 continuations。servlet 的 `handler` 字段 (field) 决定了当收到请求时究竟运行哪段代码：如果请求 URI 匹配到某个已知的 continuation，就恢复 (resume) 那个 continuation；否则，就把传入的 `start` 函数应用到请求上。

创建好 servlet 后，`dispatch/servlet` 返回一个 dispatcher：它接收连接 (connection) 和请求 (request)，调用 servlet 的 handler，然后把得到的响应写回连接。写响应之前，它会建立一个 continuation barrier —— 这样，servlet 中捕获 (captured) 的 continuations 就 **不能** 从请求–响应周期 (request-response cycle) 之外被恢复 (resume)，保证只有当客户端准备好接收响应时，continuation 才会被恢复 (resume)。接着，它安装一个 continuation prompt，以便各种 “web 交互 (web interaction)” 函数 (functions) 能安全地中断 (abort) 到这个 prompt。

举个最简单的例子，`send/back` 这个 web-interaction 函数 (function) 大致是这样实现的：

```scheme
(define (send/back resp)
  (abort-current-continuation servlet-prompt (lambda () resp)))
```

考虑下面这个请求处理器 (request handler)：

```scheme
(define (hello req)
  (send/back (response/xexpr "sent"))
  (response/xexpr "ignored"))
```

当执行到 `send/back` 那一行， 它就会 “跳 (abort)” 回到最近 (nearest) 的 `servlet-prompt` handler — 也就是 `dispatch/servlet` 用 `call-with-continuation-prompt` 安装的那个。这样，请求处理器的执行就被 “短路 (short-circuited)” 了 (中断了)，而传给 `send/back` 的响应会立刻 (immediately) 被发送给客户端。后面那行 `response/xexpr "ignored"` 就 **不会** 被执行了。

> 如果你想知道是否可以安装自己的中介 `servlet-prompt` 处理器，答案是肯定的！

另一方面，`send/suspend` 的行为大致如下:

> 为了清晰起见，我再次省略了若干实现细节。

```scheme
(define (send/suspend f)
  (call-with-composable-continuation
    (lambda (k)
      (define k-url (store-continuation! k))
      (send/back (f k-url)))
    servlet-prompt))
```

与 `send/back` 立即响应不同，`send/suspend` 会捕获当前 continuation，把它和一个 URL 关联 (associate it with a URL)，然后把这个 URL 传给函数 `f`，由它生成一个响应 (response)，再把这个响应发回给客户端。也就是说，它不会立即恢复 continuation，而是把 continuation 存起来，客户端如果以后访问那个 URL，就可以触发恢复 (resume) —— 这就是所谓 “延迟 / 可恢复 (suspend / resume)” 模式 (pattern)。

例如，下面是一个 “可恢复 (resumable)” 的请求处理器：

```scheme
(define (resumable req)
  (define req-2
    (send/suspend
      (lambda (k-url)
        (response/xexpr
         `(a ([href ,k-url]) "Resume")))))
  (response/xexpr "done")
```

当初次请求 (initial request) 到来时，它会生成第一个响应 (response)，并返回给客户端 (通常是一个包含 “Resume” 链接 (anchor) 的页面)。当客户端点击这个链接 (访问那个 k-url)，请求就会恢复 (resume) — continuation 从上次中断的地方继续执行，这时 `req-2` 就会绑定到新请求上，你可以继续处理请求，就像中断之前从没停止过一样。