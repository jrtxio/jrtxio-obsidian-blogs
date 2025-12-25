---
{"dg-publish":true,"dg-path":"03 编程语言与理论/如何部署 Racket Web 应用.md","permalink":"/03 编程语言与理论/如何部署 Racket Web 应用/"}
---

#Innolight #Lisp #Racket 

最近有人在 Racket Slack 上询问如何部署 Racket Web 应用。最常见的答案有

1. 在目标机器上安装 Racket，然后将你的代码传送到那里或
2. 使用 Docker（基本上是选项 1 的一个“可移植”变体）。

我想花几分钟时间今天来写一下我部署 Racket 应用的首选方式：将应用程序代码、库和资源嵌入到一个可执行文件中，然后分发这个文件。我偏爱这种做法，因为它意味着我不必担心在目标机器上安装特定版本的 Racket 来运行我的代码。事实上，使用这种方法，我可以为每个应用拥有不同版本，每个版本都使用不同版本的 Racket 构建，并且可以轻松地在它们之间切换。

`raco exe` 将 Racket 模块以及运行时嵌入到平台的原生可执行文件中。以这个程序为例：

```
#lang racket/base

(require racket/async-channel
         web-server/http
         web-server/servlet-dispatch
         web-server/web-server)

(define ch (make-async-channel))
(define stop
  (serve
   #:dispatch (dispatch/servlet
               (lambda (_req)
                 (response/xexpr
                  '(h1 "Hello!"))))
   #:port 8000
   #:listen-ip "127.0.0.1"
   #:confirmation-channel ch))

(define ready-or-exn (sync ch))
(when (exn:fail? ready-or-exn)
  (raise ready-or-exn))

(with-handlers ([exn:break?
                 (lambda (_)
                   (stop))])
  (sync/enable-break never-evt))
```

如果我将它保存为名为 `app.rkt` 的文件，然后调用 `raco exe -o app app.rkt` ，我会在当前目录中得到一个自包含的可执行文件，名为 `app` 。

```
$ file app
app: Mach-O 64-bit executable x86_64
```

生成的可执行文件可能仍然引用仅在当前机器上可用的动态库，所以在这个阶段它还不太适合分发。这时 [raco distribute](https://docs.racket-lang.org/raco/exe-dist.html) 就派上用场了。它接受 `raco exe` 创建的独立可执行文件，并生成一个包含可执行文件、它引用的动态库以及应用引用的任何运行时文件（稍后会有更多关于这方面的内容）的包。然后可以将这个包复制到运行相同操作系统的其他机器上。

运行 `raco distribute dist app` 会生成一个包含以下内容的目录：

```
$ raco distribute dist app
$ tree dist/
dist/
├── bin
│   └── app
└── lib
    ├── Racket.framework
    │   └── Versions
    │       └── 7.7.0.9_CS
    │           ├── Racket
    │           └── boot
    │               ├── petite.boot
    │               ├── racket.boot
    │               └── scheme.boot
    └── plt
        └── app
            └── exts
                └── ert
                    ├── r0
                    │   └── error.css
                    ├── r1
                    │   ├── libcrypto.1.1.dylib
                    │   └── libssl.1.1.dylib
                    └── r2
                        └── bundles
                            ├── es
                            │   └── srfi-19
                            └── srfi-19

15 directories, 10 files
```

我可以将这个目录压缩打包，然后发送到任何运行与我相同版本 macOS 的机器上，它无需修改即可运行。如果在 Linux 机器上构建代码，然后将其发送到其他 Linux 机器上运行，情况也是如此。这就是我分发我的 Web 应用时所做的事情。每个项目都有一个 CI 任务，用于构建和测试代码，然后生成分发版本，并将其复制到目标服务器。

此时你可能会想“这很好，但运行时应用程序需要哪些文件呢？”让我们修改应用程序，使其从磁盘读取文件，然后按需提供其内容：

```
#lang racket/base

(require racket/async-channel
         racket/port
         web-server/http
         web-server/servlet-dispatch
         web-server/web-server)

(define text
  (call-with-input-file "example.txt" port->string))

(define ch (make-async-channel))
(define stop
  (serve
   #:dispatch (dispatch/servlet
               (lambda (_req)
                 (response/xexpr
                  `(h1 ,text))))
   #:port 8000
   #:listen-ip "127.0.0.1"
   #:confirmation-channel ch))

(define ready-or-exn (sync ch))
(when (exn:fail? ready-or-exn)
  (raise ready-or-exn))

(with-handlers ([exn:break?
                 (lambda (_)
                   (stop))])
  (sync/enable-break never-evt))
```

如果我只是拿这个应用，构建一个可执行文件，然后制作一个发行版，再尝试运行它，我会遇到一个问题：

```
$ raco exe -o app app.rkt
$ raco distribute dist app
$ cd dist
$ ./bin/app
open-input-file: cannot open input file
  path: /Users/jrtxio/tmp/dist/example.txt
  system error: No such file or directory; errno=2
  context...:
   raise-filesystem-error
   open-input-file
   call-with-input-file
   proc
   call-in-empty-metacontinuation-frame
   call-with-module-prompt
   body of '#%mzc:s
   temp35_0
   run-module-instance!
   perform-require!
   call-in-empty-metacontinuation-frame
   eval-one-top
   eval-compiled-parts
   embedded-load
   proc
   call-in-empty-metacontinuation-frame
```

如果我没有 `cd` 进入到 `dist` 目录，这本来是可以工作的，因为 `example.txt` 将会在应用程序运行的工作目录中。问题在于我们传递给 `call-with-input-file` 的路径在编译时 Racket 一无所知。

为了将 `example.txt` 文件与应用程序一起发布，我们需要使用 [define-runtime-path](https://docs.racket-lang.org/reference/Filesystem.html#%28form._%28%28lib._racket%2Fruntime-path..rkt%29._define-runtime-path%29%29) 来告诉 Racket 它应该在分发中嵌入该文件，并更新代码以便它引用嵌入文件最终的路径。

```
#lang racket/base

 (require racket/async-channel
          racket/port
+         racket/runtime-path
          web-server/http
          web-server/servlet-dispatch
          web-server/web-server)
+
+(define-runtime-path example-path "example.txt")

 (define text
-  (call-with-input-file "example.txt" port->string))
+  (call-with-input-file example-path port->string))

 (define ch (make-async-channel))
 (define stop
   (serve
    #:dispatch (dispatch/servlet
                (lambda (_req)
                  (response/xexpr
                   `(h1 ,text))))
    #:port 8000
    #:listen-ip "127.0.0.1"
    #:confirmation-channel ch))

 (define ready-or-exn (sync ch))
 (when (exn:fail? ready-or-exn)
   (raise ready-or-exn))

 (with-handlers ([exn:break?
                  (lambda (_)
                    (stop))])
   (sync/enable-break never-evt))
```

上述代码中使用 `define-runtime-path` 告诉 `raco distribute` 将 `example.txt` 复制到分发目录中，并确保 `example-path` 绑定指向该文件最终所在的路径。

如果我现在构建一个发行版并检查其内容，我可以看到 `example.txt` 被复制进去了：

```
$ raco exe -o app app.rkt
$ raco distribute dist app
$ tree dist
dist/
├── bin
│   └── app
└── lib
    ├── Racket.framework
    │   └── Versions
    │       └── 7.7.0.9_CS
    │           ├── Racket
    │           └── boot
    │               ├── petite.boot
    │               ├── racket.boot
    │               └── scheme.boot
    └── plt
        └── app
            └── exts
                └── ert
                    ├── r0
                    │   └── example.txt
                    ├── r1
                    │   └── error.css
                    ├── r2
                    │   ├── libcrypto.1.1.dylib
                    │   └── libssl.1.1.dylib
                    └── r3
                        └── bundles
                            ├── es
                            │   └── srfi-19
                            └── srfi-19

16 directories, 11 files
```

如果你想知道更多关于这一切是如何运作的，我提供的关于 [raco exe](https://docs.racket-lang.org/raco/exe.html)、[raco distribute](https://docs.racket-lang.org/raco/exe-dist.html) 和 [define-runtime-path](https://docs.racket-lang.org/reference/Filesystem.html#%28form._%28%28lib._racket%2Fruntime-path..rkt%29._define-runtime-path%29%29) 的链接应该能帮到你！

备注：翻译自 [Deploying Racket Web Apps — defn.io](https://defn.io/2020/06/28/racket-deployment/)