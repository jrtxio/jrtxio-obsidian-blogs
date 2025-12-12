---
{"dg-publish":true,"dg-path":"04 工具与实用教程/Rime 输入法入门教程.md","permalink":"/04 工具与实用教程/Rime 输入法入门教程/","created":"2025-12-10T10:40:00.966+08:00","updated":"2025-12-12T09:03:08.102+08:00"}
---

#Innolight

Rime（中州韵）是一款开源、可高度自定义的输入法引擎框架，支持 Windows、macOS、Linux，并有第三方移动端实现。它最大的特点是灵活、可扩展，支持拼音、双拼、五笔、注音等多种输入方案和自定义词库。

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

1. 在 Linux 下常用的官方发行版有 **ibus-rime（中州韵）** 和 **fcitx5-rime**：

```bash
sudo apt install ibus-rime        # Ubuntu / Debian (使用 ibus)
sudo apt install fcitx5-rime      # Ubuntu / Debian (使用 fcitx5)
```

2. 启动相应的输入法框架（ibus 或 fcitx5），并在输入法列表中添加 Rime。

## 4. 移动端

移动端有第三方开发者基于 Rime 引擎的实现：

- **Android**：同文输入法（Trime）、fcitx5-android
- **iOS**：iRime、仓输入法（Hamster）

可在应用商店或 GitHub 搜索下载。

# 二、基础使用

Rime 支持多种输入方案，以**拼音输入**为例，基本流程如下：

1. 切换到 Rime 输入法。
2. 输入拼音，例如 `nihao`。
3. 屏幕上会显示候选词列表，使用数字键或方向键选择：

```
1. 你好
2. 妮好
3. 尼豪
```

4. 按回车键或空格键确认选中词语。

> **提示**：Rime 还支持五笔、双拼、注音等多种输入方案，可以在配置中切换。

# 三、Rime 配置文件结构

Rime 的强大之处在于其**高度可定制化**。核心配置文件通常在：

- **Windows**: `C:\Users\<用户名>\AppData\Roaming\Rime`
- **macOS**: `~/Library/Rime`
- **Linux**:
    - ibus-rime: `~/.config/ibus/rime`
    - fcitx5-rime: `~/.config/fcitx/rime` 或 `~/.local/share/fcitx5/rime`

主要文件类型：

|文件|作用|
|---|---|
|`default.custom.yaml`|用户自定义配置，例如键盘布局、简繁切换、输入方案选择|
|`*.schema.yaml`|输入方案配置，如拼音方案、五笔方案的具体设置|
|`custom_phrase.txt`|自定义短语和词组|
|`*.dict.yaml`|词库文件，可以添加新词|

> **注意**：修改配置文件后，需要重新部署输入法才能生效。

# 四、常用配置示例

## 1. 切换输入方案（简体/繁体拼音、双拼等）

在 `default.custom.yaml` 中添加：

```yaml
patch:
  schema_list:
    - schema: luna_pinyin_simp    # 朙月拼音·简化字（简体）
    - schema: luna_pinyin          # 朙月拼音（繁体）
    - schema: double_pinyin_flypy  # 小鹤双拼
    - schema: wubi86               # 五笔86
```

使用 `Ctrl+~` 或 `F4` 可以在不同方案间快速切换。

## 2. 自定义短语

在 `custom_phrase.txt` 中添加：

```
测试短语	abc
你的邮箱@example.com	yx
```

输入 `abc` 就可以快速输出"测试短语"。

## 3. 调整候选词个数

在 `default.custom.yaml` 中：

```yaml
patch:
  menu:
    page_size: 9  # 每页显示9个候选词
```

# 五、重新部署输入法

修改配置文件后，必须执行"重新部署"操作才能生效：

- **Windows（小狼毫）**：右键任务栏图标 → 重新部署
- **macOS（鼠须管）**：右键菜单栏图标 → 重新部署
- **Linux（ibus-rime）**：右键输入法图标 → 部署，或在终端执行 `ibus-daemon -drx`
- **Linux（fcitx5-rime）**：右键输入法图标 → 部署，或重启 fcitx5

# 六、高级功能简介

1. **多种输入方案**：Rime 支持拼音、双拼（自然码、小鹤、搜狗等）、五笔、仓颉、注音等多种方案，可以在 `schema.yaml` 中配置或直接切换。
2. **自定义词库**：可以导入扩展词库，如专业术语、网络流行语等，放在 `.dict.yaml` 文件中。
3. **智能学习**：Rime 可以学习你的输入习惯，把常用词提前显示。
4. **符号和表情输入**：通过特定键（如 `/` 开头）可以输入常用符号和 Emoji。

# 七、初学者常见问题

1. **输入法没反应**
    - 检查 Rime 是否已经在系统输入法列表中启用。
    - 在 Linux 下，确保 ibus 或 fcitx5 已经运行并且 Rime 已被添加。
2. **自定义配置无效**
    - 修改配置文件后，必须执行"重新部署"（Deploy）操作。
    - 注意 YAML 文件格式，缩进必须使用空格，不能用 Tab。
3. **找不到配置文件夹**
    - Windows：在文件资源管理器地址栏输入 `%APPDATA%\Rime`
    - macOS：在 Finder 中按 `Cmd+Shift+G`，输入 `~/Library/Rime`
    - Linux：直接在终端用 `cd` 命令进入配置目录
4. **输入方案切换**
    - 使用快捷键 `Ctrl+~`（Windows/Linux）或 `Ctrl+``（macOS）或` F4` 可以快速切换输入方案。

# 八、总结

Rime 输入法的核心优势是：

- 开源自由，尊重用户隐私
- 灵活的自定义能力
- 支持多平台
- 丰富的输入方案和词库
- 高度可扩展的架构

初学者可以先用默认的朙月拼音方案熟悉输入流程，再逐步尝试自定义短语、切换双拼方案或导入专业词库。掌握了配置文件的基本修改方法和重新部署的操作，你就能打造一个完全适合自己的输入法环境。

更多高级配置和详细文档，可以访问 Rime 官方网站：[https://rime.im](https://rime.im/) 和官方帮助文档。