---
{"dg-publish":true,"dg-path":"02 软件开发/从零开始构建 Web 应用（四）.md","permalink":"/02 软件开发/从零开始构建 Web 应用（四）/","created":"2025-10-21T14:27:19.934+08:00","updated":"2025-10-21T14:35:54.015+08:00"}
---

#Innolight

这是我的"从零开始构建 Web 应用"系列的第四篇文章。如果你还没读过前面的文章，建议先查看第一至第三部分！

在这一部分，我们将涵盖构建一个 `Application` 抽象。如果你在家跟着学习，可以在这里找到第三部分的源代码。让我们开始吧！

# 日常事务

## 类型检查

到目前为止，我们主要将类型注解用作文档，而没有担心代码的类型检查。在提交 6fa54c4 中，我将 mypy 作为开发依赖项引入，并开始使用它来检查代码的类型。我不会描述我在这里必须做的更改，因为整个过程主要是机械的：

1. 运行 `mypy server.py` ，
2. 进行必要的更改，
3. 重复。

## 单元测试

在提交 [4455e04](https://github.com/Bogdanp/web-app-from-scratch/commit/4455e04) 中，我将模块从仓库根目录移动到了一个名为 `scratch` 的包中，并在顶层添加了一个 `tests` 包。

# 应用程序

上次我们添加了对将请求处理器挂载到特定路径的支持，今天我们将在此基础上工作，编写一个可以包含多个请求处理器并根据请求路径将请求路由到它们的抽象。

在 `scratch/application.py` 添加以下内容：

```
from .request import Request
from .response import Response


class Application:
    def __call__(self, request: Request) -> Response:
        return Response("501 Not Implemented", content="Not Implemented")
```

如果你记得上次的内容，我们定义了请求处理器为接收一个 `Request` 并返回一个 `Response` 的函数。这意味着我们的 `Application` 本身也将是请求处理器。

让我们从 `scratch/server.py` 中移除旧的服务器实例化代码——删除从 `wrap_auth` 开始的所有内容——并在 `__main__.py` 中为我们的包创建一个新的 CLI 入口点：

```
import sys

from .application import Application
from .server import HTTPServer


def main() -> int:
    application = Application()

    server = HTTPServer()
    server.mount(application)
    server.serve_forever()
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

我们现在可以从仓库根目录使用 `python -m scratch` 来运行服务器，如果我们尝试访问 `http://127.0.0.1:9000` ，我们应该会收到一个 501 响应。

## The Router

每个应用程序都将包含一个 `Router` 的实例。路由器的职责将是将传入的请求方法、路径对，如 `POST /users` 或 `GET /users/{user_id}` 映射到请求处理器。它看起来是这样的（在 `scratch/application.py` 中）：

```
import re
from collections import OrderedDict, defaultdict
from functools import partial
from typing import Callable, Dict, Optional, Pattern, Set, Tuple

from .request import Request
from .response import Response
from .server import HandlerT

RouteT = Tuple[Pattern[str], HandlerT]
RoutesT = Dict[str, Dict[str, RouteT]]
RouteHandlerT = Callable[..., Response]


class Router:
    def __init__(self) -> None:
        self.routes_by_method: RoutesT = defaultdict(OrderedDict)
        self.route_names: Set[str] = set()

    def add_route(self, name: str, method: str, path: str, handler: RouteHandlerT) -> None:
        assert path.startswith("/"), "paths must start with '/'"
        if name in self.route_names:
            raise ValueError(f"A route named {name} already exists.")

        route_template = ""
        for segment in path.split("/")[1:]:
            if segment.startswith("{") and segment.endswith("}"):
                segment_name = segment[1:-1]
                route_template += f"/(?P<{segment_name}>[^/]+)"
            else:
                route_template += f"/{segment}"

        route_re = re.compile(f"^{route_template}$")
        self.routes_by_method[method][name] = route_re, handler
        self.route_names.add(name)

    def lookup(self, method: str, path: str) -> Optional[HandlerT]:
        for route_re, handler in self.routes_by_method[method].values():
            match = route_re.match(path)
            if match is not None:
                params = match.groupdict()
                return partial(handler, **params)
        return None
```

它的 `add_route` 方法会遍历所给路径的所有部分，并在过程中生成一个正则表达式，将所有动态路径段替换为正则表达式中的命名捕获组（ `"/users/{user_id}"` 变为 `"^/users/(?P<user_id>[^/]+)$"` ）。

当通过其 `lookup` 方法查找路径时，它会遍历该方法的全部可用路由，并将路径与正则表达式进行匹配检查。当找到匹配项时，它会将动态捕获组（如果有的话）部分应用于处理函数，然后返回该值。

将路由器集成到我们的应用类中非常直接。我们在应用初始化时实例化一个路由器，添加一个方法来代理添加路由，并更新我们的 `__call__` 方法，以便在收到请求时查找并执行处理器：

```
class Application:
    def __init__(self) -> None:
        self.router = Router()

    def add_route(self, method: str, path: str, handler: RouteHandlerT, name: Optional[str] = None) -> None:
        self.router.add_route(method, path, handler, name or handler.__name__)

    def __call__(self, request: Request) -> Response:
        handler = self.router.lookup(request.method, request.path)
        if handler is None:
            return Response("404 Not Found", content="Not Found")
        return handler(request)
```

作为额外的甜点，我们还将在这个 `Application` 类上定义一个 `route` 装饰器：

```
    def route(
            self,
            path: str,
            method: str = "GET",
            name: Optional[str] = None,
    ) -> Callable[[RouteHandlerT], RouteHandlerT]:
        def decorator(handler: RouteHandlerT) -> RouteHandlerT:
            self.add_route(method, path, handler, name)
            return handler
        return decorator
```

这样一来，我们就可以继续更新 `__main__` 中的代码，为各种路由注册处理程序。

```
import functools
import json
import sys
from typing import Callable, Tuple, Union

from .application import Application
from .request import Request
from .response import Response
from .server import HTTPServer

USERS = [
    {"id": 1, "name": "Jim"},
    {"id": 2, "name": "Bruce"},
    {"id": 3, "name": "Dick"},
]


def jsonresponse(handler: Callable[..., Union[dict, Tuple[str, dict]]]) -> Callable[..., Response]:
    @functools.wraps(handler)
    def wrapper(*args, **kwargs):
        result = handler(*args, **kwargs)
        if isinstance(result, tuple):
            status, result = result
        else:
            status, result = "200 OK", result

        response = Response(status=status)
        response.headers.add("content-type", "application/json")
        response.body.write(json.dumps(result).encode())
        return response
    return wrapper


app = Application()


@app.route("/users")
@jsonresponse
def get_users(request: Request) -> dict:
    return {"users": USERS}


@app.route("/users/{user_id}")
@jsonresponse
def get_user(request: Request, user_id: str) -> Union[dict, Tuple[str, dict]]:
    try:
        return {"user": USERS[int(user_id)]}
    except (IndexError, ValueError):
        return "404 Not Found", {"error": "Not found"}


def main() -> int:
    server = HTTPServer()
    server.mount("", app)
    server.serve_forever()
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

`jsonresponse` 是一个辅助装饰器，用于将处理器结果转换为 JSON 响应。除此之外，其他方面都很直接：我们创建一个应用程序实例，注册几个路由处理器，然后将该应用程序挂载到我们的服务器上。至此，我们便拥有了一个用于列出用户的简单 JSON API。

# 收尾

第四部分就到这里。下次我们将介绍扩展 `Request` 对象，使其能够解析查询字符串和 Cookie，同时还能根据每个请求存储用户定义的数据。如果你想查看完整的源代码并跟随学习，可以在[这里](https://github.com/Bogdanp/web-app-from-scratch/tree/part-04)找到。

下次见！