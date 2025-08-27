---
{"dg-publish":true,"dg-path":"软件工程/前端小白入门 Electron 系列（一）：如何搭建开发环境.md","permalink":"/软件工程/前端小白入门 Electron 系列（一）：如何搭建开发环境/","created":"2025-08-27T14:29:08.283+08:00","updated":"2025-08-27T14:38:43.487+08:00"}
---

#Innolight

# 什么是 Electron？

Electron 是一个让你可以用 Web 技术（HTML、CSS、JavaScript）来开发桌面应用的框架。简单来说，它把网页"包装"成桌面程序，让你的网页应用可以在 Windows、macOS、Linux 上运行。

**为什么需要 Electron？** 传统的桌面开发需要学习不同平台的专门语言（如 C++、C#），而 Electron 让前端开发者可以用熟悉的技术栈开发跨平台桌面应用。VSCode、Discord、Slack 都是用 Electron 开发的。

# 核心概念解释

## Node.js 是什么？

Node.js 是 JavaScript 的运行环境，让 JavaScript 可以在浏览器之外运行。原本 JavaScript 只能在浏览器里运行，Node.js 让它可以在服务器和本地计算机上运行。

**Node.js 的核心是什么？** Node.js 的核心是 V8 JavaScript 引擎，这是 Google 开发的开源引擎，同样被用在 Chrome 浏览器中。V8 负责将 JavaScript 代码编译成机器码执行。

**如何实现在浏览器外运行？** Node.js 在 V8 引擎基础上添加了丰富的运行时库：

- V8 本身只是一个 JavaScript 引擎，无法与外部世界通信，没有网络、文件系统等功能
- Node.js 为其添加了文件系统操作、网络通信、操作系统 API 等功能
- 这样 JavaScript 就能访问本地资源，执行系统级任务

**为什么 Electron 需要 Node.js？** Electron 的核心就是把 Chromium 浏览器和 Node.js 打包在一起，这样你的应用既能显示网页界面，又能访问操作系统功能（读写文件、发送通知等）。

**是否存在重复？** 你可能会疑惑：Chromium 和 Node.js 都包含 V8 引擎，这样不是重复了吗？实际上 Electron 做了优化：

- Electron 使用同一个 V8 引擎实例
- 但创建了不同的执行上下文：主进程（Node.js 环境）和渲染进程（浏览器环境）
- 这样既避免了重复，又实现了功能隔离

## npm 是什么？

npm 全称 Node Package Manager，是 Node.js 的包管理工具。它就像一个"应用商店"，里面有数百万个 JavaScript 库，你可以轻松下载和使用。

**为什么需要 npm？** 现代前端开发依赖大量第三方库，npm 帮你管理这些依赖关系，一条命令就能安装所需的所有库。

# 环境搭建步骤

## 第一步：安装 Node.js

1. 访问 [Node.js 官网](https://nodejs.org/)
2. 下载 LTS（长期支持）版本
3. 安装完成后，打开命令行工具验证：

```bash
node --version
npm --version
```

**注意：** npm 会随 Node.js 自动安装，无需单独下载。

**为什么选择 LTS 版本？** LTS 版本更稳定，适合生产环境使用。

## 第二步：创建项目目录

```bash
mkdir my-electron-app
cd my-electron-app
```

## 第三步：初始化 npm 项目

```bash
npm init -y
```

这会创建一个 `package.json` 文件，它是项目的"身份证"，记录项目信息和依赖关系。

## 第四步：安装 Electron

```bash
npm install electron --save-dev
```

**为什么用 `--save-dev`？** 这表示 Electron 是开发依赖，只在开发时需要，最终打包时会包含在应用中。

## 第五步：创建基本文件结构

创建以下文件：

**main.js（主进程文件）**

```javascript
const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  mainWindow.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
```

**index.html（界面文件）**

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>我的第一个 Electron 应用</title>
</head>
<body>
    <h1>Hello Electron!</h1>
    <p>这是我的第一个桌面应用</p>
</body>
</html>
```

## 第六步：配置启动脚本

在 `package.json` 中添加：

```json
{
  "main": "main.js",
  "scripts": {
    "start": "electron ."
  }
}
```

**为什么需要配置脚本？** 这样你就可以用 `npm start` 来启动应用，而不是输入复杂的命令。

## 第七步：运行应用

```bash
npm start
```

# Electron 的工作原理

让我们用图来理解 Node.js、Chromium 和 Electron 的关系：

```
         Electron 应用
    ┌─────────────────────────┐
    │                         │
    │    ┌─────────────────┐   │
    │    │    Chromium     │   │  ← 负责显示界面
    │    │   (渲染进程)     │   │    处理 UI 交互
    │    └─────────────────┘   │
    │                         │
    │    ┌─────────────────┐   │
    │    │     Node.js     │   │  ← 负责系统功能
    │    │    (主进程)      │   │    文件操作等
    │    └─────────────────┘   │
    │                         │
    └─────────────────────────┘
            桌面应用程序
```

Electron 应用有两个核心概念：

- **主进程（Main Process）**：基于 Node.js，控制应用生命周期，创建和管理窗口，处理系统级操作
- **渲染进程（Renderer Process）**：基于 Chromium，显示用户界面，处理用户交互，运行前端代码

# 常用开发工具推荐

1. **开发者工具**：按 F12 打开，就像在浏览器中调试网页一样
2. **热重载**：安装 `electron-reload` 实现代码修改后自动刷新
3. **打包工具**：使用 `electron-builder` 将应用打包成安装包

# 总结

搭建 Electron 开发环境的核心步骤：

1. 安装 Node.js（提供 JavaScript 运行环境）
2. 用 npm 管理项目依赖
3. 安装 Electron 框架
4. 创建主进程和渲染进程文件
5. 配置启动脚本

现在你已经有了一个基本的 Electron 应用！接下来可以学习如何添加更多功能，比如菜单栏、文件操作、系统通知等。


> [!NOTE]
> Electron 的本质就是把网页变成桌面应用，所以你的前端技能在这里完全适用。
