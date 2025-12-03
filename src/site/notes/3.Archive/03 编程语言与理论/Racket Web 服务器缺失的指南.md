---
{"dg-publish":true,"dg-path":"03 编程语言与理论/Racket Web 服务器缺失的指南.md","permalink":"/03 编程语言与理论/Racket Web 服务器缺失的指南/","created":"2025-12-03T15:57:46.345+08:00","updated":"2025-12-03T17:17:15.858+08:00"}
---

#Innolight

Racket 自带的 [web-server](https://docs.racket-lang.org/web-server/index.html?q=web-server) 包很不错，但其中一些部分对初学者来说可能过于底层，容易造成困惑。在这篇文章里，我将通过提供一些定义和示例来澄清初学者可能会感到困惑的一些问题。

# Servlets

Servlet 是一个从 [request](https://docs.racket-lang.org/web-server/http.html?q=request#%28def._%28%28lib._web-server%2Fhttp%2Frequest-structs..rkt%29._request%29%29) 到 [response](https://docs.racket-lang.org/web-server/http.html?q=request#%28def._%28%28lib._web-server%2Fhttp%2Fresponse-structs..rkt%29._response%29%29) 的函数。它具有以下契约：

```
(-> request? can-be-response?)
```

这里有一个 servlet，无论请求看起来什么样，都会回复"Hello, world!":

```racket
#lang racket/base

(require web-server/http)

(define (hello req)
  (response/output
   (lambda (out)
     (displayln "Hello, world!" out))))
```

这里有一个 servlet，根据请求的查询参数动态构建响应:

```racket
#lang racket/base

(require racket/match
         web-server/http)

(define (age req)
  (define binds (request-bindings/raw req))
  (define message
    (match (list (bindings-assq #"name" binds)
                 (bindings-assq #"age" binds))
      [(list #f #f)
       "Anonymous is unknown years old."]
      [(list #f (binding:form _ age))
       (format "Anonymous is ~a years old." age)]
      [(list (binding:form _ name) #f)
       (format "~a is unknown years old." name)]
      [(list (binding:form _ name)
             (binding:form _ age))
       (format "~a is ~a years old." name age)]))
  (response/output
   (lambda (out)
     (displayln message out))))
```

`serve/servlet` 是一个便捷函数，用于配置服务器运行你给它的任何 servlet。

这里是如何使用 `serve/servlet` 运行 `age` servlet:

```racket
#lang racket/base

(define age ...)

(serve/servlet
  age
  #:listen-ip "127.0.0.1"
  #:port 8000
  #:command-line? #t
  #:servlet-path ""
  #:servlet-regexp #rx"")
```

虽然它对于快速操作非常方便，但会隐藏许多底层操作对调用者的信息。要实现相同结果的下层 [serve](https://docs.racket-lang.org/web-server-internal/web-server.html?q=serve#%28def._%28%28lib._web-server%2Fweb-server..rkt%29._serve%29%29) 函数调用将如下所示：

```racket
#lang racket/base

(require racket/match
         web-server/http
         web-server/servlet-dispatch
         web-server/web-server)

(define age ...)

(define stop
  (serve
    #:dispatch (dispatch/servlet age)
    #:listen-ip "127.0.0.1"
    #:port 8000))

(with-handlers ([exn:break? (lambda (e) (stop))])
  (sync/enable-break never-evt))
```

这会设置一个带有单个调度器的 Web 服务器，该调度器运行单个 servlet，并在后台线程中运行。 `serve` 函数的返回值是一个可以用来停止服务器的函数，由于服务器在后台线程中运行，我需要在主线程上做些事情来防止它终止。我选择等待一个永不终止的事件，并捕获中断（例如 `SIGINT` 和 `SIGTERM` 信号（前者是在运行进程时按下 Ctrl+C 时发送的））。当接收到这种中断时， `stop` 函数会被调用，服务器将优雅地终止。

# Dispatchers (调度器)

您可能已经注意到，与 `serve/servlet` 不同，我无法直接将我的 `age` Servlet 传递给 `serve` 。我必须通过调用 `dispatch/servlet` 将其转换为调度器。这是因为调度器，而不是 Servlet，位于每个服务器的根目录。

调度器是一个函数，它接受一个 [connection](https://docs.racket-lang.org/web-server-internal/connection-manager.html?q=connection%3F#%28def._%28%28lib._web-server%2Fprivate%2Fconnection-manager..rkt%29._connection~3f%29%29) 对象和一个 [request](https://docs.racket-lang.org/web-server/http.html?q=request#%28def._%28%28lib._web-server%2Fhttp%2Frequest-structs..rkt%29._request%29%29) ，要么处理该请求，要么调用 [next-dispatcher](https://docs.racket-lang.org/web-server-internal/dispatch.html?q=next-dispatcher#%28def._%28%28lib._web-server%2Fdispatchers%2Fdispatch..rkt%29._next-dispatcher%29%29) 。它的协议是：

```
(-> connection? request? any)
```

调度器的返回值被忽略。它们直接操作所提供的连接对象。如果我想创建自己的调度器来运行 `age` Servlet 而不是使用 `dispatch/servlet` ，它看起来会像这样：

`output-response` 接受一个 [connection](https://docs.racket-lang.org/web-server-internal/connection-manager.html?q=connection%3F#%28def._%28%28lib._web-server%2Fprivate%2Fconnection-manager..rkt%29._connection~3f%29%29) 和一个 [response](https://docs.racket-lang.org/web-server/http.html?q=request#%28def._%28%28lib._web-server%2Fhttp%2Fresponse-structs..rkt%29._response%29%29) ，并将响应序列化到客户端端的连接上。

这等同于：

> 我在这里为了本指南简化了内容。 dispatch/servlet 函数进行了一些额外的工作来支持 continuations。详情请参阅[[3.Archive/03 编程语言与理论/Racket Web 服务器中的延续\|Racket Web 服务器中的延续]]。

```
(define age-dispatcher (dispatch/servlet age))
```

在实际项目中，有许多内置的调度器可供使用。其中最重要的有

- [web-server/dispatchers/dispatch-sequencer](https://docs.racket-lang.org/web-server-internal/dispatch-sequencer.html?q=dispatchers%2Ffile)
- [web-server/dispatchers/dispatch-filter](https://docs.racket-lang.org/web-server-internal/dispatch-filter.html?q=dispatchers%2Ffile)
- [web-server/dispatchers/dispatch-files](https://docs.racket-lang.org/web-server-internal/dispatch-files.html?q=dispatchers%2Ffile)

## dispatch-sequencer

这个调度器接收一个调度器列表，并在每个请求上按顺序运行它们，直到到达第一个不调用 `next-dispatcher` 的调度器。

```
#lang racket/base

(require net/url
         racket/string
         web-server/dispatchers/dispatch
         (prefix-in sequencer: web-server/dispatchers/dispatch-sequencer)
         web-server/http
         web-server/http/response
         web-server/web-server)

(define (request-path-has-prefix? req p)
  (string-prefix? (path->string (url->path (request-uri req))) p))

(define (a-dispatcher conn req)
  (if (request-path-has-prefix? req "/a/")
      (output-response conn (response/output
                             (lambda (out)
                               (displayln "hello from a" out))))
      (next-dispatcher)))

(define (b-dispatcher conn req)
  (output-response conn
                   (response/output
                    (lambda (out)
                      (displayln "hello from b" out)))))

(define stop
  (serve
   #:dispatch (sequencer:make a-dispatcher
                              b-dispatcher)
   #:listen-ip "127.0.0.1"
   #:port 8000))

(with-handlers ([exn:break? (lambda (e)
                              (stop))])
  (sync/enable-break never-evt))
```

上述服务器在每个请求中都运行 `a-dispatcher` 。如果请求路径不以 `"/a/"` 开头，那么它将转到 `b-dispatcher` 。

## dispatch-filter

像我在上一个代码片段中那样过滤请求路径相当繁琐，因此 Web 服务器提供了过滤调度器来专门实现这个目的。上面的代码可以重写为：

```
#lang racket/base

(require (prefix-in filter: web-server/dispatchers/dispatch-filter)
         (prefix-in sequencer: web-server/dispatchers/dispatch-sequencer)
         web-server/http
         web-server/http/response
         web-server/web-server)

(define (a-dispatcher conn req)
  (output-response conn
                   (response/output
                    (lambda (out)
                      (displayln "hello from a" out)))))

(define (b-dispatcher conn req)
  (output-response conn
                   (response/output
                    (lambda (out)
                      (displayln "hello from b" out)))))

(define stop
  (serve
   #:dispatch (sequencer:make (filter:make #rx"^/a/" a-dispatcher)
                              b-dispatcher)
   #:listen-ip "127.0.0.1"
   #:port 8000))

(with-handlers ([exn:break? (lambda (e)
                              (stop))])
  (sync/enable-break never-evt))
```

## dispatch-files

这个调度器可以用来从文件系统中提供文件服务。你可以将它与其他调度器结合使用，生成一个既能从文件系统中提供文件服务，又能回退到 servlet 的服务器：

```
#lang racket/base

(require net/url
         (prefix-in files: web-server/dispatchers/dispatch-files)
         (prefix-in filter: web-server/dispatchers/dispatch-filter)
         (prefix-in sequencer: web-server/dispatchers/dispatch-sequencer)
         web-server/dispatchers/filesystem-map
         web-server/http
         web-server/servlet-dispatch
         web-server/web-server)

(define (homepage req)
  (response/xexpr
   '(html
     (head
      (link ([href "/static/screen.css"] [rel "stylesheet"])))
     (body
      (h1 "Hello!")))))

(define url->path/static
  (make-url->path "static"))

(define static-dispatcher
  (files:make #:url->path (lambda (u)
                            (url->path/static
                             (struct-copy url u [path (cdr (url-path u))])))))

(define stop
  (serve
   #:dispatch (sequencer:make
               (filter:make #rx"^/static/" static-dispatcher)
               (dispatch/servlet homepage))
   #:listen-ip "127.0.0.1"
   #:port 8000))

(with-handlers ([exn:break? (lambda (e)
                              (stop))])
  (sync/enable-break never-evt))
```

这个调度器需要知道如何将当前请求的 URL 映射到文件系统上的路径。

首先，我创建一个函数，将 URL 映射到 `static` 目录内的文件路径（相对于服务器运行位置（当前工作目录）的相对路径）。该函数会自动从其处理的路径中移除类似 `..` 的内容，确保没有请求路径能"逃逸"出静态目录。

然后，我将 `files:make` 传递一个函数，该函数将 URL 映射到文件路径。由于我要从以 `/static/` 开头的 URL 中提供所有静态文件，我需要在将其传递给 `url->path/static` 函数之前从 URL 中移除该前缀，因为 `url->path/static` 函数期望的是一个相对于 `static` 目录的文件路径。

最后，我将静态调度器与一个提供主页的 servlet 调度器串联起来，最终得到一个能够从目录提供静态文件并运行动态 Racket 代码的 Web 服务器！
# Routing (路由)

你可以通过将多个 `dispatch-filter` 调度器按顺序组合来路由请求，但这不会非常方便。Web 服务器提供了 [dispatch-rules](https://docs.racket-lang.org/web-server/dispatch.html?q=dispatch-rules#%28form._%28%28lib._web-server%2Fdispatch..rkt%29._dispatch-rules%29%29) 宏，作为声明 servlets（而不是调度器！）的一种便捷方式——这里的术语重载可能会有些令人困惑——它们根据请求方法和路径执行不同的操作。

```racket
#lang racket/base

(require net/url
         web-server/dispatch
         (prefix-in files: web-server/dispatchers/dispatch-files)
         (prefix-in filter: web-server/dispatchers/dispatch-filter)
         (prefix-in sequencer: web-server/dispatchers/dispatch-sequencer)
         web-server/dispatchers/filesystem-map
         web-server/http
         web-server/servlet-dispatch
         web-server/web-server)

(define (response/template . content)
  (response/xexpr
   `(html
     (head
      (link ([href "/static/screen.css"] [rel "stylesheet"])))
     (body
      ,@content))))

(define (homepage req)
  (response/template '(h1 "Home")))

(define (blog req)
  (response/template '(h1 "Blog")))

(define-values (app reverse-uri)
  (dispatch-rules
   [("") homepage]
   [("blog") blog]))

(define url->path/static (make-url->path "static"))

(define static-dispatcher
  (files:make #:url->path (lambda (u)
                            (url->path/static
                             (struct-copy url u [path (cdr (url-path u))])))))

(define stop
  (serve
   #:dispatch (sequencer:make
               (filter:make #rx"^/static/" static-dispatcher)
               (dispatch/servlet app))
   #:listen-ip "127.0.0.1"
   #:port 8000))

(with-handlers ([exn:break? (lambda (e)
                              (stop))])
  (sync/enable-break never-evt))
```

使用 `dispatch-rules` 如我在上文中所做的那样，会产生两个值：一个将发送到 `/` 的请求映射到 `homepage` servlet，将发送到 `/blog` 的请求映射到 `blog` servlet 的 servlet，以及一个函数，当给定这两个函数中的任意一个时，该函数可以生成反向 URI。

通过 `dispatch/servlet` 将其插入到主 servlet 序列中，可以得到一个可以从磁盘提供文件并动态将请求分派到多个 servlet 的服务器。

我们在这里可能还需要做的最后一个调整是在应用 servlet 之后将另一个 servlet 插入到序列中，以处理不存在的路径的请求：

```
#lang racket/base

(require net/url
         web-server/dispatch
         (prefix-in files: web-server/dispatchers/dispatch-files)
         (prefix-in filter: web-server/dispatchers/dispatch-filter)
         (prefix-in sequencer: web-server/dispatchers/dispatch-sequencer)
         web-server/dispatchers/filesystem-map
         web-server/http
         web-server/servlet-dispatch
         web-server/web-server)

(define (response/template . content)
  (response/xexpr
   `(html
     (head
      (link ([href "/static/screen.css"] [rel "stylesheet"])))
     (body
      ,@content))))

(define (homepage req)
  (response/template '(h1 "Home")))

(define (blog req)
  (response/template '(h1 "Blog")))

(define (not-found req)
  (response/template '(h1 "Not Found")))

(define-values (app reverse-uri)
  (dispatch-rules
   [("") homepage]
   [("blog") blog]))

(define url->path/static (make-url->path "static"))

(define static-dispatcher
  (files:make #:url->path (lambda (u)
                            (url->path/static
                             (struct-copy url u [path (cdr (url-path u))])))))

(define stop
  (serve
   #:dispatch (sequencer:make
               (filter:make #rx"^/static/" static-dispatcher)
               (dispatch/servlet app)
               (dispatch/servlet not-found))
   #:listen-ip "127.0.0.1"
   #:port 8000))

(with-handlers ([exn:break? (lambda (e)
                              (stop))])
  (sync/enable-break never-evt))
```

我在这里为了本指南简化了内容。 `dispatch/servlet` 函数进行了一些额外的工作来支持 continuations。详情请参阅 [[3.Archive/03 编程语言与理论/Racket Web 服务器中的延续\|Racket Web 服务器中的延续]]