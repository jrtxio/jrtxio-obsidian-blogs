---
{"dg-publish":true,"dg-path":"02 软件开发/基于 Racket 的 To-Do List 工具 RReminder.md","permalink":"/02 软件开发/基于 Racket 的 To-Do List 工具 RReminder/","created":"2025-04-03T16:32:09.000+08:00","updated":"2025-09-23T14:51:29.366+08:00"}
---

#Innolight #Racket 

![Pasted image 20250814110841.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250814110841.png)

![[RReminder.excalidraw]]
# 需求背景

目前市面上的 To-Do List 工具的数据都是保存在云端的，违背了我对数据安全的一些准则。大多工具都是极其复杂，而我只是想要一个最简单的代办任务功能，作为一个极简主义者，完全不能忍受，所以打算基于 Racket 开发一个 To-Do List 工具。经过对多个工具的调研，决定参考 macOS 的 Reminder 的交互逻辑来实现。为了实现数据的灵活管理，参考了 Obsidian 的仓库的管理逻辑。

![Pasted image 20250807233035.png|450](/img/user/0.Asset/resource/Pasted%20image%2020250807233035.png)

![Pasted image 20250923112325.png|450](/img/user/0.Asset/resource/Pasted%20image%2020250923112325.png)

# 技术选型

这个 To-Do List 工具采用 Electron + Racket 架构实现，达到跨平台效果：

- **前端**: Electron + HTML5 + CSS3 + JavaScript
- **后端**: Racket Web 服务
- **数据存储**: JSON 文件 + 文件系统
- **通信**: Electron IPC + 事件驱动

如果想要多端同步的效果，通过第三方云盘同步后台的 json 数据即可。

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

# 数据模型设计

## List（任务列表）

```json
{
  "id": "string",           // 唯一标识符
  "name": "string",         // 列表名称
  "createdAt": "ISODateString", // 创建时间
  "updatedAt": "ISODateString"  // 更新时间
}
```

## Task（任务）

```json
{
  "id": "string",           // 唯一标识符
  "title": "string",        // 任务标题
  "notes": "string",        // 备注信息
  "completed": "boolean",   // 完成状态
  "listId": "string",       // 所属列表ID
  "priority": "none|low|medium|high", // 优先级
  "dueDate": "ISODateString|null",    // 截止日期
  "dueTime": "HH:mm|null",           // 截止时间
  "reminder": "boolean",             // 是否设置提醒
  "reminderTime": "ISODateString|null", // 提醒时间
  "createdAt": "ISODateString",      // 创建时间
  "updatedAt": "ISODateString",      // 更新时间
  "completedAt": "ISODateString|null" // 完成时间
}
```

## Config（配置）

```json
{
  "dataPath": "string",     // 数据文件路径
  "defaultListId": "string|null", // 默认列表
  "theme": "light|dark",    // 主题
  "notifications": {
    "enabled": "boolean",   // 通知开关
    "sound": "boolean"      // 声音提醒
  }
}
```

# 功能实现细节

## 数据存储机制

- 首次启动时检测数据文件是否存在
- 不存在则弹出数据存储位置选择界面
- 用户选择目录后创建数据文件并保存配置
- 后续启动直接加载现有数据
- 用户删除数据文件后重新进入配置流程

## 任务提醒机制

- 前端定时检查（每分钟检查一次）
- 检查任务的提醒时间是否到达
- 通过系统原生通知提醒用户
- 应用关闭时无法提醒（简化实现）

## 搜索功能

- 实时过滤搜索
- 搜索任务标题和备注内容
- 实时显示匹配数量
- 不保存搜索历史记录

## 任务排序逻辑

- **今天列表**：今天到期的任务 + 无日期但未完成的任务，按优先级排序
- **计划列表**：有日期的任务按日期升序排列
- **全部列表**：自定义列表内的任务按创建时间倒序（最新在前）
- **已完成列表**：按完成时间倒序排列
- 相同优先级按创建时间排序

## 交互细节

- 任务编辑：点击直接在列表中编辑，不需要弹出详情面板
- 快速添加任务：点击任务展示区空白处或底部新建任务控件
- 完成任务：完成后立即隐藏，移动到已完成列表
- 左侧导航栏严格按照设计原型图排序，不允许自定义更改

## 视觉反馈

- 成功操作：绿色Toast提示
- 失败操作：红色Toast提示
- 加载状态：按钮显示spinner动画
- 按钮点击：微弱的按下效果
- 任务完成：淡出动画后移至已完成列表
- 列表切换：左侧导航项高亮变化
- 任务提醒：系统原生通知弹窗
- 颜色主题：沿用macOS蓝色主题（#007AFF）

# API 接口设计

## 列表管理

- `GET /api/lists` - 获取所有列表
- `POST /api/lists` - 创建新列表 { "name": "工作" }
- `PUT /api/lists/:id` - 更新列表名称 { "name": "新项目" }
- `DELETE /api/lists/:id` - 删除列表（级联删除任务）

## 任务管理

- `GET /api/tasks` - 获取所有任务
- `GET /api/tasks?listId=xxx` - 获取指定列表任务
- `GET /api/tasks?dueDate=2024-01-15` - 按日期筛选任务
- `POST /api/tasks` - 创建任务
- `PUT /api/tasks/:id` - 更新任务（部分更新）
- `DELETE /api/tasks/:id` - 删除任务

## 配置管理

- `GET /api/config` - 获取配置
- `PUT /api/config` - 更新配置
- `POST /api/reset-data` - 重置所有数据

## 搜索功能

- `GET /api/search?q=关键词` - 全局搜索任务
# 代码结构

## 前端架构

```
frontend/
├── main.js          # Electron 主进程
├── index.html       # 主界面 HTML
├── app.js           # 应用主逻辑和UI管理
├── styles.css       # 样式文件
├── preload.js       # 安全的IPC桥接
├── config.js        # 配置管理
├── data-manager.js  # 数据操作封装
├── notification.js  # 通知系统
├── search.js        # 搜索功能
└── utils/           # 工具函数
    ├── date-utils.js
    └── task-utils.js
```

## 后端架构

```
backend/
├── server.rkt       # HTTP服务器和路由
├── logic.rkt        # 业务逻辑和数据持久化
├── config.rkt       # 配置管理
├── backup.rkt       # 数据备份机制
└── utils.rkt        # 通用工具函数
```

# 开发计划和里程碑

## 阶段一：基础设施搭建（2-3天）

- [ ] 搭建 Electron 开发环境
- [ ] 配置 Racket Web 服务器基础框架
- [ ] 实现前后端 IPC 通信机制
- [ ] 设计数据存储和配置管理模块

## 阶段二：核心功能实现（5-7天）

- [ ] 实现列表管理功能（增删改查）
- [ ] 实现任务基本管理功能（创建、删除、标记完成）
- [ ] 实现数据持久化和加载
- [ ] 实现基础的UI界面和交互

## 阶段三：高级功能开发（4-5天）

- [ ] 实现任务详细编辑功能（日期、优先级、备注）
- [ ] 实现搜索和筛选功能
- [ ] 实现任务提醒机制
- [ ] 实现数据备份和恢复功能

## 阶段四：用户体验优化（3-4天）

- [ ] 优化界面布局和视觉设计
- [ ] 实现快捷键支持
- [ ] 添加动画效果和视觉反馈
- [ ] 完善错误处理和用户提示

## 阶段五：测试和发布（2-3天）

- [ ] 完整功能测试
- [ ] 性能优化
- [ ] 打包发布准备
- [ ] 文档完善