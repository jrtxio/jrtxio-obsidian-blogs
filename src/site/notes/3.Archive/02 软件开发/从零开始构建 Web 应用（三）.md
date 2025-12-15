---
{"dg-publish":true,"dg-path":"02 软件开发/从零开始构建 Web 应用（三）.md","permalink":"/02 软件开发/从零开始构建 Web 应用（三）/","created":"2025-10-21T14:19:34.000+08:00","updated":"2025-10-21T14:35:28.000+08:00"}
---

#Innolight

这是我的从零开始构建 Web 应用系列的第三篇文章。如果你还没读过它们，[[3.Archive/02 软件开发/从零开始构建 Web 应用（一）\|第一部分]]在这里，[[[从零开始构建 Web 应用（二）\|第二部分]]在这里。你需要先读它们。

这一部分会简短而精炼。我们将涵盖请求处理器和中间件。这是第二部分的源代码，你可以跟着一起学习。让我们开始吧！

# Handlers

上次我们将所有请求处理逻辑都实现了在 `HTTPWorker` 类中。但这并不是应用程序逻辑应该存放的地方，因此我们需要更新那段代码，让它能够运行它所不知道的任意应用程序代码。为此，我们将引入请求处理的概念。在我们的情况下，请求处理将是一个函数，它接收一个 `Request` 对象并返回一个 `Response` 对象。用类型表示的话，看起来是这样的：

```
HandlerT = Callable[[Request], Response]
```

让我们修改我们的 `HTTPServer` ，让它存储一组请求处理程序，每个处理程序分配给特定的路径前缀，这样我们就可以在不同的路径上托管不同的应用程序。在 `HTTPServer` 的构造函数中，让我们将一个空列表分配给 `handlers` 实例变量。

```
class HTTPServer:
    def __init__(self, host="127.0.0.1", port=9000, worker_count=16) -> None:
        self.handlers = []
        ...
```

接下来，让我们添加一个方法，用来向处理程序列表中添加处理程序。将其命名为 `mount` 。

```
    def mount(self, path_prefix: str, handler: HandlerT) -> None:
        """Mount a request handler at a particular path.  Handler
        prefixes are tested in the order that they are added so the
        first match "wins".
        """
        self.handlers.append((path_prefix, handler))
```

现在我们需要更新 `HTTPWorker` 类，以利用这些处理程序。我们需要让工作者的构造函数将处理程序列表作为参数。

```
class HTTPWorker(Thread):
    def __init__(self, connection_queue: Queue, handlers: List[Tuple[str, HandlerT]]) -> None:
        super().__init__(daemon=True)

        self.connection_queue = connection_queue
        self.handlers = handlers
        self.running = False
```

然后我们需要更新 `handle_client` 方法，将请求处理委托给处理函数。如果没有任何处理函数匹配当前路径，我们将返回 404 状态码；如果某个处理函数抛出异常，我们将向客户端返回 500 错误。

```
    def handle_client(self, client_sock: socket.socket, client_addr: typing.Tuple[str, int]) -> None:
        with client_sock:
            try:
                request = Request.from_socket(client_sock)
            except Exception:
                LOGGER.warning("Failed to parse request.", exc_info=True)
                response = Response(status="400 Bad Request", content="Bad Request")
                response.send(client_sock)
                return

            # Force clients to send their request bodies on every
            # request rather than making the handlers deal with this.
            if "100-continue" in request.headers.get("expect", ""):
                response = Response(status="100 Continue")
                response.send(client_sock)

            for path_prefix, handler in self.handlers:
                if request.path.startswith(path_prefix):
                    try:
                        request = request._replace(path=request.path[len(path_prefix):])
                        response = handler(request)
                        response.send(client_sock)
                    except Exception as e:
                        LOGGER.exception("Unexpected error from handler %r.", handler)
                        response = Response(status="500 Internal Server Error", content="Internal Error")
                        response.send(client_sock)
                    finally:
                        break
            else:
                response = Response(status="404 Not Found", content="Not Found")
                response.send(client_sock)
```

最后，我们必须确保在 `serve_forever` 实例化 `HTTPWorker` 时，将处理函数列表传递给它们。

```
    def serve_forever(self) -> None:
        workers = []
        for _ in range(self.worker_count):
            worker = HTTPWorker(self.connection_queue, self.handlers)
            worker.start()
            workers.append(worker)

        ...
```

现在，每当一个 `HTTPWorker` 接收到新的连接时，它会解析请求并尝试找到一个请求处理器来处理它。在请求被传递给请求处理器之前，我们会从其路径属性中移除前缀，这样请求处理器就不必知道它们运行在什么前缀下。当我们在编写一个用于提供静态文件的处理器时，这一点会很有用。

由于我们还没有挂载任何请求处理器，我们的服务器会对任何传入的请求回复 404。

```
~> curl -v 127.0.0.1:9000
* Rebuilt URL to: 127.0.0.1:9000/
*   Trying 127.0.0.1...
* TCP_NODELAY set
* Connected to 127.0.0.1 (127.0.0.1) port 9000 (#0)
> GET / HTTP/1.1
> Host: 127.0.0.1:9000
> User-Agent: curl/7.54.0
> Accept: */*
>
< HTTP/1.1 404 Not Found
< content-length: 9
<
* Connection #0 to host 127.0.0.1 left intact
Not Found
```

让我们挂载一个始终返回相同响应的请求处理器。

```
def app(request: Request) -> Response:
  return Response(status="200 OK", content="Hello!")


server = HTTPServer()
server.mount("", app)
server.serve_forever()
```

无论我们现在访问哪个路径，都会得到相同的 `Hello!` 响应。让我们再挂载一个处理器来从本地文件夹提供静态文件。为此，我们将更新我们旧的 `serve_file` 函数，并将其转变为一个函数，该函数接受磁盘上某个文件夹的路径，并返回一个可以从该文件夹提供文件的请求处理器。

```
def serve_static(server_root: str) -> HandlerT:
    """Generate a request handler that serves file off of disk
    relative to server_root.
    """

    def handler(request: Request) -> Response:
        path = request.path
        if request.path == "/":
            path = "/index.html"

        abspath = os.path.normpath(os.path.join(server_root, path.lstrip("/")))
        if not abspath.startswith(server_root):
            return Response(status="404 Not Found", content="Not Found")

        try:
            content_type, encoding = mimetypes.guess_type(abspath)
            if content_type is None:
                content_type = "application/octet-stream"

            if encoding is not None:
                content_type += f"; charset={encoding}"

            body_file = open(abspath, "rb")
            response = Response(status="200 OK", body=body_file)
            response.headers.add("content-type", content_type)
            return response
        except FileNotFoundError:
            return Response(status="404 Not Found", content="Not Found")

    return handler
```

最后，我们将调用 serve static 并在挂载应用程序处理程序之前将结果挂载到 "/static" 下。

```
server = HTTPServer()
server.mount("/static", serve_static("www")),
server.mount("", app)
server.serve_forever()
```

所有以 `"/static"` 开头的请求现在将由生成的静态文件处理器处理，其他所有请求将由应用处理器处理。

# 中间件

鉴于我们的请求处理器是普通的函数，它们接收一个请求并返回一个响应，编写中间件——即可以在每个请求之前或之后运行的任意功能——是非常直接的：任何接收请求处理器作为输入并自身生成请求处理器的函数都是中间件。

这里是如何编写一个中间件来确保所有传入请求都有有效的 `Authorization` 头：

```
def wrap_auth(handler: HandlerT) -> HandlerT:
    def auth_handler(request: Request) -> Response:
        authorization = request.headers.get("authorization", "")
        if authorization.startswith("Bearer ") and authorization[len("Bearer "):] == "opensesame":
            return handler(request)
        return Response(status="403 Forbidden", content="Forbidden!")
    return auth_handler
```

要使用它，我们只需将其传递给应用处理器，并挂载结果。

```
server = HTTPServer()
server.mount("/static", serve_static("www")),
server.mount("", wrap_auth(app))
server.serve_forever()
```

现在所有对根处理程序的请求都必须包含一个授权头，其中包含我们硬编码的超级机密值，否则它们将收到一个 403 响应。

# 收尾

第三部分就到这里。在第四部分，我们将涵盖提取 `Application` 抽象和实现请求路由。如果你想查看完整源代码并跟随学习，可以在[这里](https://github.com/Bogdanp/web-app-from-scratch/tree/part-03)找到。

下次见！