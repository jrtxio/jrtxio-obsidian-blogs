---
{"dg-publish":true,"dg-path":"04 工具与实用教程/Rime 输入法入门教程.md","permalink":"/04 工具与实用教程/Rime 输入法入门教程/","created":"2025-12-10T10:40:00.966+08:00","updated":"2025-12-10T13:50:53.149+08:00"}
---

#Innolight

Rime（中州韵）是一款开源、可高度自定义的输入法框架，支持 Windows、macOS、Linux 和移动端。它最大的特点是灵活、可扩展，并支持多种拼音方案和自定义词库。

如果你是第一次使用 Rime，这篇教程将帮你快速上手。

# 一、Rime 输入法安装

## 1. Windows

1. 下载 **Weasel（小狼毫）**，这是 Rime 在 Windows 的官方发行版：
    - 官网：[https://rime.im](https://rime.im/)
2. 安装完成后，打开输入法设置即可使用。
## 2. macOS

1. 下载 **Squirrel（鼠须管）**，Rime 在 macOS 的官方版本：
    - 官网：[https://rime.im](https://rime.im/)
2. 安装完成后，将 Squirrel 添加到系统输入法列表。
## 3. Linux

1. 在 Linux 下常用的有 **fcitx5-rime** 或 **ibus-rime**：

```bash
sudo apt install fcitx5-rime  # Ubuntu / Debian
```

2. 启动 fcitx5，并在输入法列表中添加 Rime。

# 二、基础使用

Rime 是一个**拼音输入法**，输入汉字的基本流程如下：

1. 切换到 Rime 输入法。
2. 输入拼音，例如 `nihao`。
3. 屏幕上会显示候选词列表，使用数字键或方向键选择：
```
1. 你好
2. 妮好
3. 尼豪
```
4. 按回车键确认选中词语。

# 三、Rime 配置文件结构

Rime 的强大之处在于其**高度可定制化**。核心配置文件通常在：

- **Windows**: `C:\Users\<用户名>\AppData\Roaming\Rime`
- **macOS**: `~/Library/Rime`
- **Linux**: `~/.config/fcitx5/rime` 或 `~/.config/ibus/rime`

主要文件类型：

| 文件                    | 作用                  |
| --------------------- | ------------------- |
| `default.custom.yaml` | 用户自定义配置，例如键盘布局、简繁切换 |
| `schema.yaml`         | 输入方案配置，如拼音方案、五笔方案   |
| `custom_phrase.txt`   | 自定义短语和词组            |
| `*.dict.yaml`         | 词库文件，可以添加新词         |

> **注意**：修改配置文件后，需要重新部署输入法才能生效。

# 四、常用配置示例

## 1. 切换简体/繁体

在 `default.custom.yaml` 中添加：

```yaml
patch:
  schema_list:
    - schema: luna_pinyin_simp  # 简体拼音
    - schema: luna_pinyin  # 繁体拼音
```

## 2. 自定义短语

在 `custom_phrase.txt` 中添加：

```
abc 测试短语
```

输入 `abc` 就可以快速输出“测试短语”。

## 3. 调整候选词个数

在 `default.custom.yaml` 中：

```yaml
patch:
  menu:
    page_size: 9  # 每页显示9个候选词
```

# 五、高级功能简介

1. **多拼方案**：Rime 支持多种拼音方案，例如双拼、小鹤双拼等。可以在 `schema.yaml` 中修改。
2. **自定义短语联想**：Rime 可以学习你的输入习惯，把常用词提前显示。
3. **符号和表情输入**：通过特定键可以输入常用符号和 Emoji。

# 六、初学者常见问题

1. **输入法没反应**
    - 检查 Rime 是否已经在系统输入法列表中启用。
    - 在 Linux 下，确保 fcitx/ibus 已经运行并且 Rime 已被添加。
2. **自定义配置无效**
    - 修改配置文件后，必须执行 “重新部署”（Deploy）操作。
        - Windows/Squirrel：右键菜单 → 部署
        - Linux：`fcitx5-remote -r` 或重启输入法
3. **拼音输入错误**
    - 确认使用的拼音方案是否正确，例如简体/繁体或双拼。

# 七、总结

Rime 输入法的核心优势是：

- 灵活的自定义能力
- 支持多平台
- 丰富的输入方案和词库

初学者可以先用默认拼音方案熟悉输入流程，再逐步尝试自定义短语、双拼方案或符号输入。掌握了配置文件的基本修改方法，你就能打造一个完全适合自己的输入法环境。