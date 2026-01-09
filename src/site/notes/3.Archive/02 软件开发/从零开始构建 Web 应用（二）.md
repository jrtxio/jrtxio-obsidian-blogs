---
{"dg-publish":true,"dg-path":"02 软件开发/从零开始构建 Web 应用（二）.md","permalink":"/02 软件开发/从零开始构建 Web 应用（二）/"}
---

#Innolight #Web

这是我的从零开始构建 Web 应用系列的第二篇文章。如果你还没读过，[[3.Archive/02 软件开发/从零开始构建 Web 应用（一）\|第一部分]]可以在这里找到。你需要先读那篇。

在这一部分，我们将涵盖对 `Request` 数据结构的改进，添加 `Response` 和 `Server` 抽象，并使服务器能够处理并发请求。

## 请求

我们上次编写的 `Request` 类能够存储请求 `method` 、其 `path` 和其 `headers` 。让我们首先通过使其能够为单个头部存储多个值来改进它。为此，我们将定义一个名为 `Headers` 的类，它充当不区分大小写的头部名称到头部值列表的映射。

```
from collections import defaultdict


class Headers:
    def __init__(self) -> None:
        self._headers = defaultdict(list)

    def add(self, name: str, value: str) -> None:
        self._headers[name.lower()].append(value)

    def get_all(self, name: str) -> typing.List[str]:
        return self._headers[name.lower()]

    def get(self, name: str, default: typing.Optional[str] = None) -> typing.Optional[str]:
        try:
            return self.get_all(name)[-1]
        except IndexError:
            return default
```

相当直接：类的每个实例都有一个底层的 dict，其键是不区分大小写的头部名称，其值是头部值列表。如果我们现在将 `Headers` 插入到我们的 `Request` 类中，它应该看起来像这样：

```
class Request(typing.NamedTuple):
    method: str
    path: str
    headers: Headers

    @classmethod
    def from_socket(cls, sock: socket.socket) -> "Request":
        """Read and parse the request from a socket object.

        Raises:
          ValueError: When the request cannot be parsed.
        """
        lines = iter_lines(sock)

        try:
            request_line = next(lines).decode("ascii")
        except StopIteration:
            raise ValueError("Request line missing.")

        try:
            method, path, _ = request_line.split(" ")
        except ValueError:
            raise ValueError(f"Malformed request line {request_line!r}.")

        headers = Headers()
        for line in lines:
            try:
                name, _, value = line.decode("ascii").partition(":")
                headers.add(name, value.lstrip())
            except ValueError:
                raise ValueError(f"Malformed header line {line!r}.")

        return cls(method=method.upper(), path=path, headers=headers)
```

接下来，让我们使我们的请求类能够读取请求体。由于每次请求都读取完整请求体可能是浪费的（并且是一个攻击向量！），我们将定义一个 `BodyReader` 类，它将表现得像一个只读文件对象，以便 `Request` 类的用户可以决定何时以及读取多少数据来自请求体。

```
class BodyReader(io.IOBase):
    def __init__(self, sock: socket.socket, *, buff: bytes = b"", bufsize: int = 16_384) -> None:
        self._sock = sock
        self._buff = buff
        self._bufsize = bufsize

    def readable(self) -> bool:
        return True

    def read(self, n: int) -> bytes:
        """Read up to n number of bytes from the request body.
        """
        while len(self._buff) < n:
            data = self._sock.recv(self._bufsize)
            if not data:
                break

            self._buff += data

        res, self._buff = self._buff[:n], self._buff[n:]
        return res
```

`BodyReader` 包装了一个套接字，并将数据以 `bufsize` 的块读入内存缓冲区。要理解为什么它的缓冲区可以预填充（构造函数中的 `buff` 参数），让我们再看看上次定义的 `iter_lines` 函数：

```
def iter_lines(sock: socket.socket, bufsize: int = 16_384) -> typing.Generator[bytes, None, bytes]:
    """Given a socket, read all the individual CRLF-separated lines
    and yield each one until an empty one is found.  Returns the
    remainder after the empty line.
    """
    buff = b""
    while True:
        data = sock.recv(bufsize)
        if not data:
            return b""

        buff += data
        while True:
            try:
                i = buff.index(b"\r\n")
                line, buff = buff[:i], buff[i + 2:]
                if not line:
                    return buff

                yield line
            except IndexError:
                break
```

你可以看到，一旦它找到请求头结束的标记（ `if not line:` ），就会返回它可能读取的任何额外数据。举一个具体的例子，假设一个请求包含 4KiB 的头部数据和 100KiB 的正文数据，由于 `iter_lines` 默认以 16KiB 的块读取数据，它可能在一个调用中读取所有头部数据加上额外的 12KiB 正文数据。这 4KiB 的头部数据将被分割成行并由生成器输出，而请求头之后读取的额外数据将从生成器返回。我们将使用返回的数据来预填充 `RequestReader` 的内部缓冲区。

我们将需要更改我们的头部解析逻辑，使用 while 循环代替 for 循环，以便能够捕获生成器的返回值。一旦我们有了返回值，我们就可以构建一个 body reader，并将其传递给 `Request` 构造函数。

```
class Request(typing.NamedTuple):
    method: str
    path: str
    headers: Headers
    body: BodyReader

    @classmethod
    def from_socket(cls, sock: socket.socket) -> "Request":
        """Read and parse the request from a socket object.

        Raises:
          ValueError: When the request cannot be parsed.
        """
        lines = iter_lines(sock)

        try:
            request_line = next(lines).decode("ascii")
        except StopIteration:
            raise ValueError("Request line missing.")

        try:
            method, path, _ = request_line.split(" ")
        except ValueError:
            raise ValueError(f"Malformed request line {request_line!r}.")

        headers = Headers()
        buff = b""
        while True:
            try:
                line = next(lines)
            except StopIteration as e:
                # StopIteration.value contains the return value of the generator.
                buff = e.value
                break

            try:
                name, _, value = line.decode("ascii").partition(":")
                headers.add(name, value.lstrip())
            except ValueError:
                raise ValueError(f"Malformed header line {line!r}.")

        body = BodyReader(sock, buff=buff)
        return cls(method=method.upper(), path=path, headers=headers, body=body)
```

现在我们有了主体读取器，我们可以更新我们的主服务器循环来读取并打印出传入的请求体：

```
    while True:
        client_sock, client_addr = server_sock.accept()
        print(f"Received connection from {client_addr}...")
        with client_sock:
            try:
                request = Request.from_socket(client_sock)
                try:
                    content_length = int(request.headers.get("content-length", "0"))
                except ValueError:
                    content_length = 0

                if content_length:
                    body = request.body.read(content_length)
                    print("Request body", body)

                if request.method != "GET":
                    client_sock.sendall(METHOD_NOT_ALLOWED_RESPONSE)
                    continue

                serve_file(client_sock, request.path)
            except Exception as e:
                print(f"Failed to parse request: {e}")
                client_sock.sendall(BAD_REQUEST_RESPONSE)
```

如果你现在向服务器发送一些主体数据，你应该会看到它将整个内容打印到标准输出。酷！

我们暂时完成了 `Request` 数据结构。当我们添加查询字符串参数解析时，我们会再回到它，但现在，让我们把 `BodyReader` 和 `iter_lines` 移动到一个名为 `request.py` 的模块中。我们还将 `Headers` 移动到它自己的名为 `headers.py` 的模块中，因为 `Response` 类也将使用 `Headers` 数据结构。

`headers.py`:

```
import typing

from collections import defaultdict


class Headers:
    def __init__(self) -> None:
        self._headers = defaultdict(list)

    def add(self, name: str, value: str) -> None:
        self._headers[name.lower()].append(value)

    def get_all(self, name: str) -> typing.List[str]:
        return self._headers[name.lower()]

    def get(self, name: str, default: typing.Optional[str] = None) -> typing.Optional[str]:
        try:
            return self.get_all(name)[-1]
        except IndexError:
            return default
```

`request.py`:

```
import io
import socket
import typing

from collections import defaultdict
from headers import Headers


class BodyReader(io.IOBase):
    def __init__(self, sock: socket.socket, *, buff: bytes = b"", bufsize: int = 16_384) -> None:
        self._sock = sock
        self._buff = buff
        self._bufsize = bufsize

    def readable(self) -> bool:
        return True

    def read(self, n: int) -> bytes:
        """Read up to n number of bytes from the request body.
        """
        while len(self._buff) < n:
            data = self._sock.recv(self._bufsize)
            if not data:
                break

            self._buff += data

        res, self._buff = self._buff[:n], self._buff[n:]
        return res


class Request(typing.NamedTuple):
    method: str
    path: str
    headers: Headers
    body: BodyReader

    @classmethod
    def from_socket(cls, sock: socket.socket) -> "Request":
        """Read and parse the request from a socket object.

        Raises:
          ValueError: When the request cannot be parsed.
        """
        lines = iter_lines(sock)

        try:
            request_line = next(lines).decode("ascii")
        except StopIteration:
            raise ValueError("Request line missing.")

        try:
            method, path, _ = request_line.split(" ")
        except ValueError:
            raise ValueError(f"Malformed request line {request_line!r}.")

        headers = Headers()
        buff = b""
        while True:
            try:
                line = next(lines)
            except StopIteration as e:
                buff = e.value
                break

            try:
                name, _, value = line.decode("ascii").partition(":")
                headers.add(name, value.lstrip())
            except ValueError:
                raise ValueError(f"Malformed header line {line!r}.")

        body = BodyReader(sock, buff=buff)
        return cls(method=method.upper(), path=path, headers=headers, body=body)


def iter_lines(sock: socket.socket, bufsize: int = 16_384) -> typing.Generator[bytes, None, bytes]:
    """Given a socket, read all the individual CRLF-separated lines
    and yield each one until an empty one is found.  Returns the
    remainder after the empty line.
    """
    buff = b""
    while True:
        data = sock.recv(bufsize)
        if not data:
            return b""

        buff += data
        while True:
            try:
                i = buff.index(b"\r\n")
                line, buff = buff[:i], buff[i + 2:]
                if not line:
                    return buff

                yield line
            except IndexError:
                break
```

### 100 Continue

如果你使用 cURL 向服务器发送超过 1KiB 的数据，你可能会注意到它在读取所有数据前会挂起大约一秒钟。这是因为 cURL 使用 `100 Continue` 状态码来确定何时以及是否应该将大型请求体发送给服务器。

当你使用 cURL 发送超过 1KiB 的有效负载时，它会自动向服务器发送 `Expect: 100-continue` 头部，并等待直到

1. 它从服务器收到 `HTTP/1.1 100 Continue` 响应状态行，此时它会将请求体发送给服务器，或者
2. 它从服务器收到其他响应状态行，在这种情况下，它根本不会将请求体发送给服务器，或者
3. 它的1秒超时时间已到，因为服务器尚未向它发送任何数据，此时它将请求体发送给服务器。

这种机制允许客户端暂停请求，直到服务器决定是否要处理它。我们的服务器目前将接受所有请求，因此我们只需让它每次收到这种 `Expect` 头时都向客户端发送 `100 Continue` 状态即可：

```
    while True:
        client_sock, client_addr = server_sock.accept()
        print(f"Received connection from {client_addr}...")
        with client_sock:
            try:
                request = Request.from_socket(client_sock)
                if "100-continue" in request.headers.get("expect", ""):
                    client_sock.sendall(b"HTTP/1.1 100 Continue\r\n\r\n")

                try:
                    content_length = int(request.headers.get("content-length", "0"))
                except ValueError:
                    content_length = 0

                if content_length:
                    body = request.body.read(content_length)
                    print("Request body", body)

                if request.method != "GET":
                    client_sock.sendall(METHOD_NOT_ALLOWED_RESPONSE)
                    continue

                serve_file(client_sock, request.path)
            except Exception as e:
                print(f"Failed to parse request: {e}")
                client_sock.sendall(BAD_REQUEST_RESPONSE)
```

现在使用 cURL 向服务器发送超过 1KiB 的数据。它应该比之前快得多。

## 响应

到目前为止，我们返回的所有响应都是"手写"的。是时候我们写一个 `Response` 抽象来让这方面的事情稍微容易管理一些。

在 `server.py` 中，让我们定义我们的 `Response` 类：

```
class Response:
    """An HTTP response.

    Parameters:
      status: The resposne status line (eg. "200 OK").
      headers: The response headers.
      body: A file containing the response body.
      content: A string representing the response body.  If this is
        provided, then body is ignored.
      encoding: An encoding for the content, if provided.
    """

    def __init__(
            self,
            status: str,
            headers: typing.Optional[Headers] = None,
            body: typing.Optional[typing.IO] = None,
            content: typing.Optional[str] = None,
            encoding: str = "utf-8"
    ) -> None:

        self.status = status.encode()
        self.headers = headers or Headers()

        if content is not None:
            self.body = io.BytesIO(content.encode(encoding))
        elif body is None:
            self.body = io.BytesIO()
        else:
            self.body = body

    def send(self, sock: socket.socket) -> None:
        """Write this response to a socket.
        """
        raise NotImplementedError
```

现在我们保持相对简单：一个响应就是一个包含响应 `status` 、 `headers` 以及代表响应体的文件的类。除此之外，它还知道如何写入到套接字（更准确地说，它将知道，因为我们还没有实现那部分）。我们可以用这个来重写 `serve_file` 和我们的主循环。

```
def serve_file(sock: socket.socket, path: str) -> None:
    """Given a socket and the relative path to a file (relative to
    SERVER_ROOT), send that file to the socket if it exists.  If the
    file doesn't exist, send a "404 Not Found" response.
    """
    if path == "/":
        path = "/index.html"

    abspath = os.path.normpath(os.path.join(SERVER_ROOT, path.lstrip("/")))
    if not abspath.startswith(SERVER_ROOT):
        response = Response(status="404 Not Found", content="Not Found")
        response.send(sock)
        return

    try:
        with open(abspath, "rb") as f:
            content_type, encoding = mimetypes.guess_type(abspath)
            if content_type is None:
                content_type = "application/octet-stream"

            if encoding is not None:
                content_type += f"; charset={encoding}"

            response = Response(status="200 OK", body=f)
            response.headers.add("content-type", content_type)
            response.send(sock)
            return
    except FileNotFoundError:
        response = Response(status="404 Not Found", content="Not Found")
        response.send(sock)
        return


with socket.socket() as server_sock:
    server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_sock.bind((HOST, PORT))
    server_sock.listen(0)
    print(f"Listening on {HOST}:{PORT}...")

    while True:
        client_sock, client_addr = server_sock.accept()
        print(f"Received connection from {client_addr}...")
        with client_sock:
            try:
                request = Request.from_socket(client_sock)
                if "100-continue" in request.headers.get("expect", ""):
                    response = Response(status="100 Continue")
                    response.send(client_sock)

                try:
                    content_length = int(request.headers.get("content-length", "0"))
                except ValueError:
                    content_length = 0

                if content_length:
                    body = request.body.read(content_length)
                    print("Request body", body)

                if request.method != "GET":
                    response = Response(status="405 Method Not Allowed", content="Method Not Allowed")
                    response.send(client_sock)
                    continue

                serve_file(client_sock, request.path)
            except Exception as e:
                print(f"Failed to parse request: {e}")
                response = Response(status="400 Bad Request", content="Bad Request")
                response.send(client_sock)
```

在实现 `Response.send` 之前，我们需要在 `Headers` 中添加一个方法，以便让我们能够遍历所有头部信息。

```
HeadersDict = typing.Dict[str, typing.List[str]]
HeadersGenerator = typing.Generator[typing.Tuple[str, str], None, None]


class Headers:
    def __init__(self) -> None:
        self._headers = defaultdict(list)

    def add(self, name: str, value: str) -> None:
        self._headers[name.lower()].append(value)

    def get_all(self, name: str) -> typing.List[str]:
        return self._headers[name.lower()]

    def get(self, name: str, default: typing.Optional[str] = None) -> typing.Optional[str]:
        try:
            return self.get_all(name)[-1]
        except IndexError:
            return default

    def __iter__(self) -> HeadersGenerator:
        for name, values in self._headers.items():
            for value in values:
                yield name, value
```

这样，我们现在可以编写 `Response.send` ：

```
    def send(self, sock: socket.socket) -> None:
        """Write this response to a socket.
        """
        content_length = self.headers.get("content-length")
        if content_length is None:
            try:
                body_stat = os.fstat(self.body.fileno())
                content_length = body_stat.st_size
            except OSError:
                self.body.seek(0, os.SEEK_END)
                content_length = self.body.tell()
                self.body.seek(0, os.SEEK_SET)

            if content_length > 0:
                self.headers.add("content-length", content_length)

        headers = b"HTTP/1.1 " + self.status + b"\r\n"
        for header_name, header_value in self.headers:
            headers += f"{header_name}: {header_value}\r\n".encode()

        sock.sendall(headers + b"\r\n")
        if content_length > 0:
            sock.sendfile(self.body)
```

`send` 试图确定请求正文的尺寸，然后将状态行与头部信息连接起来，并通过套接字发送。最后，如果正文中至少有一个字节，它将正文文件写入套接字。

Python 的 `socket.sendfile` 具有一个很好的特性，它能够判断其参数是否只是一个普通文件。如果是，它就使用高性能的 `sendfile` 系统调用将文件写入套接字；如果不是，它就回退到常规的 `send` 调用

我们暂时完成了 `Response` ，把它移入一个名为 `response.py` 的独立模块吧。

# 服务器

此时， `server.py` 中的服务器循环非常简洁：

```
with socket.socket() as server_sock:
    server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_sock.bind((HOST, PORT))
    server_sock.listen(0)
    print(f"Listening on {HOST}:{PORT}...")

    while True:
        client_sock, client_addr = server_sock.accept()
        print(f"Received connection from {client_addr}...")
        with client_sock:
            try:
                request = Request.from_socket(client_sock)
                if "100-continue" in request.headers.get("expect", ""):
                    response = Response(status="100 Continue")
                    response.send(client_sock)

                try:
                    content_length = int(request.headers.get("content-length", "0"))
                except ValueError:
                    content_length = 0

                if content_length:
                    body = request.body.read(content_length)
                    print("Request body", body)

                if request.method != "GET":
                    response = Response(status="405 Method Not Allowed", content="Method Not Allowed")
                    response.send(client_sock)
                    continue

                serve_file(client_sock, request.path)
            except Exception as e:
                print(f"Failed to parse request: {e}")
                response = Response(status="400 Bad Request", content="Bad Request")
                response.send(client_sock)
```

让我们将其封装在一个名为 `HTTPServer` 的类中：

```
class HTTPServer:
    def __init__(self, host="127.0.0.1", port=9000) -> None:
        self.host = host
        self.port = port

    def serve_forever(self) -> None:
        with socket.socket() as server_sock:
            server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            server_sock.bind((self.host, self.port))
            server_sock.listen(0)
            print(f"Listening on {self.host}:{self.port}...")

            while True:
                client_sock, client_addr = server_sock.accept()
                self.handle_client(client_sock, client_addr)

    def handle_client(self, client_sock: socket.socket, client_addr: typing.Tuple[str, int]) -> None:
        with client_sock:
            try:
                request = Request.from_socket(client_sock)
                if "100-continue" in request.headers.get("expect", ""):
                    response = Response(status="100 Continue")
                    response.send(client_sock)

                try:
                    content_length = int(request.headers.get("content-length", "0"))
                except ValueError:
                    content_length = 0

                if content_length:
                    body = request.body.read(content_length)
                    print("Request body", body)

                if request.method != "GET":
                    response = Response(status="405 Method Not Allowed", content="Method Not Allowed")
                    response.send(client_sock)
                    return

                serve_file(client_sock, request.path)
            except Exception as e:
                print(f"Failed to parse request: {e}")
                response = Response(status="400 Bad Request", content="Bad Request")
                response.send(client_sock)


server = HTTPServer()
server.serve_forever()
```

这仍然是完全相同的逻辑，但现在稍微更具可重用性。 `serve_forever` 设置服务器套接字并在循环中接受新连接，然后将这些连接发送到 `handle_client` ，`handle_client` 处理请求并通过套接字发送响应。

接下来，让我们通过定义一个 `HTTPWorker` 类，为混合中添加一些并发。

```
class HTTPWorker(Thread):
    def __init__(self, connection_queue: Queue) -> None:
        super().__init__(daemon=True)

        self.connection_queue = connection_queue
        self.running = False

    def stop(self) -> None:
        self.running = False

    def run(self) -> None:
        self.running = True
        while self.running:
            try:
                client_sock, client_addr = self.connection_queue.get(timeout=1)
            except Empty:
                continue

            try:
                self.handle_client(client_sock, client_addr)
            except Exception:
                print(f"Unhandled error: {e}")
                continue
            finally:
                self.connection_queue.task_done()

    def handle_client(self, client_sock: socket.socket, client_addr: typing.Tuple[str, int]) -> None:
        with client_sock:
            try:
                request = Request.from_socket(client_sock)
                if "100-continue" in request.headers.get("expect", ""):
                    response = Response(status="100 Continue")
                    response.send(client_sock)

                try:
                    content_length = int(request.headers.get("content-length", "0"))
                except ValueError:
                    content_length = 0

                if content_length:
                    body = request.body.read(content_length)
                    print("Request body", body)

                if request.method != "GET":
                    response = Response(status="405 Method Not Allowed", content="Method Not Allowed")
                    response.send(client_sock)
                    return

                serve_file(client_sock, request.path)
            except Exception as e:
                print(f"Failed to parse request: {e}")
                response = Response(status="400 Bad Request", content="Bad Request")
                response.send(client_sock)
```

HTTP workers 是操作系统线程，它们等待新的连接出现在队列中，然后对它们进行处理。让我们将 workers 连接到 `HTTPServer` 。

```
class HTTPServer:
    def __init__(self, host="127.0.0.1", port=9000, worker_count=16) -> None:
        self.host = host
        self.port = port
        self.worker_count = worker_count
        self.worker_backlog = worker_count * 8
        self.connection_queue = Queue(self.worker_backlog)

    def serve_forever(self) -> None:
        workers = []
        for _ in range(self.worker_count):
            worker = HTTPWorker(self.connection_queue)
            worker.start()
            workers.append(worker)

        with socket.socket() as server_sock:
            server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            server_sock.bind((self.host, self.port))
            server_sock.listen(self.worker_backlog)
            print(f"Listening on {self.host}:{self.port}...")

            while True:
                try:
                    self.connection_queue.put(server_sock.accept())
                except KeyboardInterrupt:
                    break

        for worker in workers:
            worker.stop()

        for worker in workers:
            worker.join(timeout=30)
```

现在，HTTP 服务器类所做的一切就是启动若干工作线程，然后设置服务器套接字并开始接受新的连接。它将连接推送到共享连接队列中，以便工作线程可以取来进行处理。

为了好玩，这是我机器上运行 Apache Bench 在服务器上得到的结果：

```
$ ab -n 10000 -c 32 http://127.0.0.1:9000/
This is ApacheBench, Version 2.3 <$Revision: 1807734 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking 127.0.0.1 (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:
Server Hostname:        127.0.0.1
Server Port:            9000

Document Path:          /
Document Length:        15 bytes

Concurrency Level:      32
Time taken for tests:   3.320 seconds
Complete requests:      10000
Failed requests:        0
Total transferred:      790000 bytes
HTML transferred:       150000 bytes
Requests per second:    3011.73 [#/sec] (mean)
Time per request:       10.625 [ms] (mean)
Time per request:       0.332 [ms] (mean, across all concurrent requests)
Transfer rate:          232.35 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.1      0       2
Processing:     2   11   5.1     10      73
Waiting:        1    9   4.6      8      72
Total:          3   11   5.1     10      73

Percentage of the requests served within a certain time (ms)
  50%     10
  66%     11
  75%     11
  80%     11
  90%     12
  95%     12
  98%     14
  99%     17
 100%     73 (longest request)
```

每秒 3k 请求。考虑到这是一个用纯 Python 实现的线程式 Web 服务器，这已经很不错了！

## 收尾

哇！一篇帖子里要涵盖这么多内容，真是够多的。我以为你撑不下去，没想到你居然做到了！这就是第二部分的内容。在第三部分，我们将介绍请求处理器和中间件。如果你想查看完整的源代码并跟上进度，可以在这里找到。

下次见！