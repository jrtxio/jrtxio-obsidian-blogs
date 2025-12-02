---
{"dg-publish":true,"dg-path":"03 编程语言与理论/如何运行 ActivityLog2 项目.md","permalink":"/03 编程语言与理论/如何运行 ActivityLog2 项目/","created":"2025-07-14T18:52:09.298+08:00","updated":"2025-11-25T15:43:24.770+08:00"}
---

#Innolight #Lisp #Racket 

[ActivityLog2](https://github.com/alex-hhh/ActivityLog2) 是一个基于 Racket 的开源原生桌面 GUI 开发工程，本文将详细讲解整个工程环境的搭建。

# 构建和运行

ActivityLog2 依赖一些额外的包。官方版本会将这些包放在 `pkgs` 子目录下并纳入版本控制，在构建或运行应用程序前需要先安装这些包。安装后，这些包将对所有 Racket 程序可用（Racket 不支持包的虚拟环境）。

你不必按照如下方式安装依赖项。你也可以直接从 Racket 的包目录安装这些包：`tzinfo`、`tzgeolookup`、`data-frame`、`plot-container`、`gui-widget-mixins`、`map-widget` 以及测试所需的 `al2-test-runner`。

不过，使用这种方式可能无法获得 ActivityLog2 使用的确切版本，可能会出现兼容性问题。

## 更新子模块

克隆此仓库后，请运行以下命令并递归更新子模块：

```
git submodule update --init --recursive
```

## 设置包目录

接下来将 `pkgs/` 子目录加入 Racket 的包目录，使用以下命令（Windows 上也可以使用 `git` 提供的 `bash`）：

```
bash etc/scripts/setup-catalog.sh pkgs/
```

## 安装依赖项

设置好包目录后，安装依赖项：

```
raco pkg install --auto al2-dependencies
```

## 构建或运行应用程序

设置好依赖后，你可以运行程序：

```
racket run.rkt
```

你也可以在 DrRacket 中打开 `run.rkt` 文件并点击“运行”。

... 或者使用以下命令构建可执行文件和安装器。

```
racket build.rkt
```

该命令将在 `dist` 文件夹中生成一个独立应用，即使没有安装 Racket 也可以运行。如果你在 Windows 上安装了 Inno Setup，该命令还会创建一个安装程序。

