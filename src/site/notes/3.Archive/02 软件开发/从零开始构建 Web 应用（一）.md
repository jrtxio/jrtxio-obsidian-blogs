---
{"dg-publish":true,"dg-path":"02 软件开发/从零开始构建 Web 应用（一）.md","permalink":"/02 软件开发/从零开始构建 Web 应用（一）/"}
---

#Innolight #Web

这是系列文章的第一篇，我将介绍如何使用 Python 从零开始构建一个 Web 应用程序（及其 Web 服务器）。在本系列中，我们将仅依赖 Python 标准库，并忽略 WSGI 标准。

话不多说，让我们开始吧。

## Web 服务器

首先，我们将编写一个 HTTP 服务器来驱动我们的 Web 应用。但在此之前，我们需要花点时间研究一下 HTTP 协议是如何工作的。

### HTTP 的工作原理

简单来说，HTTP 客户端通过网络连接到 HTTP 服务器，并发送代表请求的数据字符串。服务器随后解释该请求，并向客户端发送响应。整个协议以及这些请求和响应的格式在 RFC2616 中都有描述，但我将在此非正式地描述它们，以免你需要阅读整个文档。

#### 请求格式

请求由一系列以 `\r\n` 分隔的行表示，其中第一行称为"请求行"。请求行由 HTTP 方法、空格、被请求的文件路径、另一个空格、客户端使用的 HTTP 协议版本，最后以回车符（ `\r` ）和换行符（ `\n` ）结束：

```
GET /some-path HTTP/1.1\r\n
```

请求行之后是零个或多个头部行。每个头部行由头部名称、冒号、可选值，以及 `\r\n` :组成：

```
Host: example.com\r\n
Accept: text/html\r\n
```

头部部分的结束由一个空行表示：

```
\r\n
```

最后，请求可能包含一个"body"——即随请求发送给服务器的任意负载。

将所有内容整合在一起，这是一个简单的 `GET` 请求：

```
GET / HTTP/1.1\r\n
Host: example.com\r\n
Accept: text/html\r\n
\r\n
```

这是一个带有 body 的简单 `POST` 请求：

```
POST / HTTP/1.1\r\n
Host: example.com\r\n
Accept: application/json\r\n
Content-type: application/json\r\n
Content-length: 2\r\n
\r\n
{}
```

#### 响应格式

响应与请求类似，都是由一系列以 `\r\n` 分隔的行组成。响应的第一行称为"状态行"，它由 HTTP 协议版本、一个空格、响应状态码、另一个空格、状态码原因，然后以 `\r\n` 结尾：

```
HTTP/1.1 200 OK\r\n
```

状态行之后是响应头，接着是一个空行，然后是可选的响应体：

```
HTTP/1.1 200 OK\r\n
Content-type: text/html\r\n
Content-length: 15\r\n
\r\n
<h1>Hello!</h1>
```

### 一个简单的服务器

根据我们目前对协议的了解，让我们编写一个服务器，无论接收到的请求如何，都发送相同的响应。

首先，我们需要创建一个套接字，将其绑定到地址，然后开始监听连接。

```
import socket

HOST = "127.0.0.1"
PORT = 9000

# By default, socket.socket creates TCP sockets.
with socket.socket() as server_sock:
    # This tells the kernel to reuse sockets that are in `TIME_WAIT` state.
    server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    # This tells the socket what address to bind to.
    server_sock.bind((HOST, PORT))

    # 0 is the number of pending connections the socket may have before
    # new connections are refused.  Since this server is going to process
    # one connection at a time, we want to refuse any additional connections.
    server_sock.listen(0)
    print(f"Listening on {HOST}:{PORT}...")
```

如果你现在尝试运行这段代码，它会打印到标准输出，说明它在监听 `127.0.0.1:9000` ，然后退出。为了实际处理传入的连接，我们需要在套接字上调用 `accept` 方法。这样做将使进程阻塞，直到客户端连接到我们的服务器。

```
with socket.socket() as server_sock:
    server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_sock.bind((HOST, PORT))
    server_sock.listen(0)
    print(f"Listening on {HOST}:{PORT}...")

    client_sock, client_addr = server_sock.accept()
    print(f"New connection from {client_addr}.")
```

一旦我们与客户端建立了套接字连接，我们就可以开始与其通信。使用 `sendall` 方法，让我们向连接的客户端发送一个示例响应：

```
RESPONSE = b"""\
HTTP/1.1 200 OK
Content-type: text/html
Content-length: 15

<h1>Hello!</h1>""".replace(b"\n", b"\r\n")

with socket.socket() as server_sock:
    server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_sock.bind((HOST, PORT))
    server_sock.listen(0)
    print(f"Listening on {HOST}:{PORT}...")

    client_sock, client_addr = server_sock.accept()
    print(f"New connection from {client_addr}.")
    with client_sock:
        client_sock.sendall(RESPONSE)
```

如果你现在运行代码，然后在你最喜欢的浏览器中访问 `http://127.0.0.1:9000`，它应该会渲染字符串"Hello!"。不幸的是，服务器在发送响应后会退出，所以刷新页面会失败。让我们来修复这个问题：

```
RESPONSE = b"""\
HTTP/1.1 200 OK
Content-type: text/html
Content-length: 15

<h1>Hello!</h1>""".replace(b"\n", b"\r\n")

with socket.socket() as server_sock:
    server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_sock.bind((HOST, PORT))
    server_sock.listen(0)
    print(f"Listening on {HOST}:{PORT}...")

    while True:
        client_sock, client_addr = server_sock.accept()
        print(f"New connection from {client_addr}.")
        with client_sock:
            client_sock.sendall(RESPONSE)
```

此时，我们已经有了一个能够对每个请求都返回一个简单 HTML 页面的 Web 服务器，全部代码大约 25 行。这还不错！

### 一个文件服务器

让我们扩展 HTTP 服务器，使其能够从磁盘提供文件。

#### 请求抽象

在这样做之前，我们必须能够从客户端读取和解析传入的请求数据。由于我们知道请求数据是由一系列以 `\r\n` 字符分隔的行组成的，让我们编写一个生成器函数，该函数从套接字读取数据并生成每一行：

```
import typing


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

这可能看起来有点令人望而生畏，但它本质上做的事情是尽可能多地从套接字中读取数据（以 `bufsize` 块的形式），将这些数据连接到一个缓冲区（ `buff` ）中，并不断地将缓冲区分割成单独的行，一次生成一行。一旦它找到一个空行，它就会返回它读取的额外数据。

使用 `iter_lines` ，我们可以开始打印我们从客户端收到的请求：

```
with socket.socket() as server_sock:
    server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_sock.bind((HOST, PORT))
    server_sock.listen(0)
    print(f"Listening on {HOST}:{PORT}...")

    while True:
        client_sock, client_addr = server_sock.accept()
        print(f"New connection from {client_addr}.")
        with client_sock:
            for request_line in iter_lines(client_sock):
                print(request_line)

            client_sock.sendall(RESPONSE)
```

如果你现在运行服务器并访问 `http://127.0.0.1:9000`，你应该会在控制台看到类似这样的内容：

```
Received connection from ('127.0.0.1', 62086)...
b'GET / HTTP/1.1'
b'Host: localhost:9000'
b'Connection: keep-alive'
b'Cache-Control: max-age=0'
b'Upgrade-Insecure-Requests: 1'
b'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.167 Safari/537.36'
b'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
b'Accept-Encoding: gzip, deflate, br'
b'Accept-Language: en-US,en;q=0.9,ro;q=0.8'
```

真不错！让我们通过定义一个 `Request` 类来抽象这些数据：

```
import typing


class Request(typing.NamedTuple):
    method: str
    path: str
    headers: typing.Mapping[str, str]
```

目前，请求类只关心方法、路径和请求头。我们将解析查询字符串参数和读取请求体的工作留到以后。

为了封装构建请求所需的逻辑，我们将在 `Request` 中添加一个类方法 `from_socket` ：

```
class Request(typing.NamedTuple):
    method: str
    path: str
    headers: typing.Mapping[str, str]

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

        headers = {}
        for line in lines:
            try:
                name, _, value = line.decode("ascii").partition(":")
                headers[name.lower()] = value.lstrip()
            except ValueError:
                raise ValueError(f"Malformed header line {line!r}.")

        return cls(method=method.upper(), path=path, headers=headers)
```

它使用我们之前定义的 `iter_lines` 函数来读取请求行。在那里它获取 `method` 和 `path` ，然后读取每一行单独的头部信息并解析这些信息。最后，它构建 `Request` 对象并返回。如果我们把这个集成到我们的服务器循环中，它应该看起来像这样：

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
            request = Request.from_socket(client_sock)
            print(request)
            client_sock.sendall(RESPONSE)
```

如果你现在连接到服务器，你应该会看到类似下面这行的输出：

```
Request(method='GET', path='/', headers={'host': 'localhost:9000', 'user-agent': 'curl/7.54.0', 'accept': '*/*'})
```

因为 `from_socket` 在某些情况下可能会引发异常，如果现在给服务器发送一个无效请求，服务器可能会崩溃。为了模拟这种情况，你可以使用 telnet 连接到服务器并发送一些虚假数据：

```
~> telnet 127.0.0.1 9000
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
hello
Connection closed by foreign host.
```

果然，服务器崩溃了：

```
Received connection from ('127.0.0.1', 62404)...
Traceback (most recent call last):
  File "server.py", line 53, in parse
    request_line = next(lines).decode("ascii")
ValueError: not enough values to unpack (expected 3, got 1)

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "server.py", line 82, in <module>
    with client_sock:
  File "server.py", line 55, in parse
    raise ValueError("Request line missing.")
ValueError: Malformed request line 'hello'.
```

为了更优雅地处理这类问题，让我们将 `from_socket` 的调用包裹在一个 try-except 块中，并在接收到格式错误的请求时向客户端发送"400 Bad Request"响应：

```
BAD_REQUEST_RESPONSE = b"""\
HTTP/1.1 400 Bad Request
Content-type: text/plain
Content-length: 11

Bad Request""".replace(b"\n", b"\r\n")

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
                print(request)
                client_sock.sendall(RESPONSE)
            except Exception as e:
                print(f"Failed to parse request: {e}")
                client_sock.sendall(BAD_REQUEST_RESPONSE)
```

如果我们现在尝试破坏它，客户端将收到一个响应，而服务器将保持运行：

```
~> telnet 127.0.0.1 9000
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
hello
HTTP/1.1 400 Bad Request
Content-type: text/plain
Content-length: 11

Bad RequestConnection closed by foreign host.
```

此时我们准备好开始实现文件服务部分，但首先让我们将默认响应设置为"404 Not Found"响应：

```
NOT_FOUND_RESPONSE = b"""\
HTTP/1.1 404 Not Found
Content-type: text/plain
Content-length: 9

Not Found""".replace(b"\n", b"\r\n")

#...

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
                print(request)
                client_sock.sendall(NOT_FOUND_RESPONSE)
            except Exception as e:
                print(f"Failed to parse request: {e}")
                client_sock.sendall(BAD_REQUEST_RESPONSE)
```

此外，让我们添加一个"405 Method Not Allowed"响应。当我们接收到非 `GET` 请求时，我们将需要它。

```
METHOD_NOT_ALLOWED_RESPONSE = b"""\
HTTP/1.1 405 Method Not Allowed
Content-type: text/plain
Content-length: 17

Method Not Allowed""".replace(b"\n", b"\r\n")
```

让我们定义一个 `SERVER_ROOT` 常量来表示服务器应从哪里提供文件，以及一个 `serve_file` 函数。

```
import mimetypes
import os
import socket
import typing

SERVER_ROOT = os.path.abspath("www")

FILE_RESPONSE_TEMPLATE = """\
HTTP/1.1 200 OK
Content-type: {content_type}
Content-length: {content_length}

""".replace("\n", "\r\n")


def serve_file(sock: socket.socket, path: str) -> None:
    """Given a socket and the relative path to a file (relative to
    SERVER_SOCK), send that file to the socket if it exists.  If the
    file doesn't exist, send a "404 Not Found" response.
    """
    if path == "/":
        path = "/index.html"

    abspath = os.path.normpath(os.path.join(SERVER_ROOT, path.lstrip("/")))
    if not abspath.startswith(SERVER_ROOT):
        sock.sendall(NOT_FOUND_RESPONSE)
        return

    try:
        with open(abspath, "rb") as f:
            stat = os.fstat(f.fileno())
            content_type, encoding = mimetypes.guess_type(abspath)
            if content_type is None:
                content_type = "application/octet-stream"

            if encoding is not None:
                content_type += f"; charset={encoding}"

            response_headers = FILE_RESPONSE_TEMPLATE.format(
                content_type=content_type,
                content_length=stat.st_size,
            ).encode("ascii")

            sock.sendall(response_headers)
            sock.sendfile(f)
    except FileNotFoundError:
        sock.sendall(NOT_FOUND_RESPONSE)
        return
```

`serve_file` 接收客户端套接字和文件路径。然后尝试解析该路径以在 `SERVER_ROOT` 中找到实际文件，如果文件解析在服务器根目录之外，则返回"未找到"响应。接着尝试打开文件并确定其 MIME 类型和大小（使用 `os.fstat` ），然后构建响应头并使用 `sendfile` 系统调用将文件写入套接字。如果磁盘上找不到文件，则发送"未找到"响应。

如果我们添加 `serve_file` ，我们的服务器循环现在应该看起来像这样：

```
如果我们添加 serve_file ，我们的服务器循环现在应该看起来像这样：

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
                if request.method != "GET":
                    client_sock.sendall(METHOD_NOT_ALLOWED_RESPONSE)
                    continue

                serve_file(client_sock, request.path)
            except Exception as e:
                print(f"Failed to parse request: {e}")
                client_sock.sendall(BAD_REQUEST_RESPONSE)
```

如果你在 `server.py` 文件旁边添加一个名为 `www/index.html` 的文件，并访问 `http://localhost:9000`，你应该能看到那个文件的内容。酷吧？

# 收尾

第一部分就到这里。在第二部分，我们将涵盖提取 `Server` 和 `Response` 抽象以及让服务器处理多个并发连接的内容。如果你想查看完整源代码并跟随学习，可以在[这里](https://github.com/Bogdanp/web-app-from-scratch/tree/part-01)找到。

下次再见！