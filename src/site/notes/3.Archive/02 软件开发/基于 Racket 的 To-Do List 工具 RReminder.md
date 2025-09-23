---
{"dg-publish":true,"dg-path":"02 软件开发/基于 Racket 的 To-Do List 工具 RReminder.md","permalink":"/02 软件开发/基于 Racket 的 To-Do List 工具 RReminder/","created":"2025-04-03T16:32:09.000+08:00","updated":"2025-09-23T11:39:33.853+08:00"}
---

#Innolight #Racket 

![Pasted image 20250814110841.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250814110841.png)

![[RReminder.excalidraw]]
# 需求背景

目前市面上的 To-Do List 工具的数据都是保存在云端的，违背了我对数据安全的一些准则。大多工具都是极其复杂，而我只是想要一个最简单的代办任务功能，作为一个极简主义者，完全不能忍受，所以打算基于 Racket 开发一个 To-Do List 工具。经过对多个工具的调研，决定参考 macOS 的 Reminder 的交互逻辑来实现。为了实现数据的灵活管理，参考了 Obsidian 的仓库的管理逻辑。

![Pasted image 20250807233035.png|450](/img/user/0.Asset/resource/Pasted%20image%2020250807233035.png)

![Pasted image 20250923112325.png|450](/img/user/0.Asset/resource/Pasted%20image%2020250923112325.png)

# 技术选型

这个 To-Do List 工具打算全部采用 Racket 进行实现，这样可以很容易就达到跨平台的效果。其中 GUI 界面采用 racket/gui 库来实现，后端的数据使用 json 格式保存。如果想要多端同步的效果，通过第三方云盘同步后台的 json 数据即可。

# 界面布局

## 左侧菜单栏（侧边栏）

- **「搜索」框**（筛选功能）：显示搜索的关键字相关的任务
- **「今天」按钮**（筛选功能）：显示当天的待办事项。
- **「计划」按钮**（筛选功能）：显示所有包含日期的任务，并按照日期远近进行排序。
- **「全部」按钮**（筛选功能）：显示所有任务，按照列表来显示。
- **「完成」按钮**（筛选功能）：显示已完成的事项。
- **「我的列表」部分**：
    - 展示多个任务列表，如「工作」「生活」。
    - 允许选择不同的列表，切换查看任务内容。
    - 需要提供 **添加新列表** 的功能（底部的「添加列表」按钮）。
    - 右击可以重命名或删除列表名
## 任务展示区域

- 标题栏显示当前选中的任务列表（如 **「工作」**）。
- 点击任务展示区空白处或底部新提醒事项可以创建新任务
- 每个任务项包含：
    - 复选框（✔ 用于标记完成）。
    - 任务文本描述（如「写一本 Racket 书籍」）。
    - 任务截止日期（如 **2025-04-02**）。
- 任务之间有分割线，提升可读性。

## 底部操作

- **「+ 新提醒事项」** 按钮：用于添加新的任务。
- **「+ 添加列表」** 按钮：用于创建新的任务分类。

# 任务分解

- [ ] 任务管理（添加、删除、标记完成）
- [ ] 任务分类管理（工作/生活等）
- [ ] 任务持久化（存储到本地）
- [ ] 优化界面布局和用户体验：拖拽排列，快捷键支持、任务搜索

# 重构版本

Racket GUI 的原生控件非常少，为了提升软件的美观度，所以打算基于 Electron + Racket 架构对软件重新实现。技术方案如下：

- **前端**: Electron + HTML5 + CSS3 + JavaScript
- **后端**: Racket (可选数据处理服务)
- **数据存储**: JSON 文件 + 文件系统
- **通信**: Electron IPC + 事件驱动
## 代码结构

```
frontend/
├── main.js          # Electron 主进程
├── index.html       # 主界面 HTML
├── app.js          # 应用逻辑
├── styles.css      # 样式文件
├── preload.js      # 预加载脚本
├── data-manager.js # 数据管理
└── components/     # 组件目录
    ├── TaskItem.js
    ├── ListItem.js
    ├── Modal.js
    └── ...
backend/
├── server.rkt      # Racket 服务器
├── data-models.rkt # 数据模型
├── list-manager.rkt# 列表管理
└── task-manager.rkt# 任务管理
```