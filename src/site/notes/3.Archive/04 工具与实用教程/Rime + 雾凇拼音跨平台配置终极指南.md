---
{"dg-publish":true,"dg-path":"04 工具与实用教程/Rime + 雾凇拼音跨平台配置终极指南.md","permalink":"/04 工具与实用教程/Rime + 雾凇拼音跨平台配置终极指南/"}
---

## 💡 核心概念

- **Rime（中州韵）**：输入法引擎核心，本身不带词库和界面，需要配合"前端"使用。
- **前端**：
    - Windows：**小狼毫（Weasel）**
    - Linux（Ubuntu）：**IBus-Rime** 或 **Fcitx5-Rime**（本教程以 IBus 为例）
    - macOS：**鼠须管（Squirrel）**
- **雾凇拼音（rime-ice）**：一套优秀的**配置文件包**。它提供了现代化的词库、自动纠错、双拼方案和简洁的配置逻辑。**安装 Rime 后，必须部署雾凇配置才能获得最佳体验。**

## 🪟 Windows 篇：小狼毫（Weasel）配置

### 第一步：安装小狼毫

1. 访问 [小狼毫 GitHub Release 页面](https://github.com/rime/weasel/releases)。
2. 下载最新的安装包（例如 `weasel-0.16.x-installer.exe`）。
3. **关键步骤**：运行安装程序时，在"用户文件夹"设置界面：
    - 选择"我来指定位置"**。
    - 建议创建一个简单路径，如 `C:\RimeConfig`（方便后续查找）。
    - 完成安装。

### 第二步：部署雾凇拼音（推荐两种方法）

#### 方法 A：使用 Plum 自动安装（推荐，类似 Linux）

如果你已安装 Git：

1. 打开 PowerShell 或 CMD（管理员）。
2. 运行以下命令安装 Plum 并拉取雾凇：

```powershell
bash <(curl -fsSL https://raw.githubusercontent.com/rime/plum/master/rime-install) iDvel/rime-ice:others/recipes/full
```

注意：Windows 可能需要先安装 Git for Windows 才能使用 `bash` 和 `curl`。

#### 方法 B：手动复制文件（最简单，无需 Git）

1. **下载雾凇配置**：
    - 访问 [雾凇拼音 GitHub](https://github.com/iDvel/rime-ice)。
    - 点击 **Code** -> **Download ZIP** 下载压缩包。
2. **清空配置目录**：
    - 打开你在安装时指定的用户文件夹（如 `C:\RimeConfig`）。
    - **删除**该文件夹内的所有文件（建议先备份 `*.userdb` 文件，这是你的个人词库）。
3. **复制文件**：
    - 将下载的 ZIP 包解压。
    - 将解压后的**所有文件和文件夹**复制到 `C:\RimeConfig` 中。
    - 确保 `default.yaml`、`rime_ice.schema.yaml` 等文件直接在 `C:\RimeConfig` 根目录下，不要多套一层文件夹。

### 第三步：重新部署

1. 在任务栏右下角找到小狼毫图标（通常是一个"中"字或键盘图标）。
2. **右键点击**图标，选择**"重新部署"（Deploy）**。
3. 等待几秒，图标停止闪烁后即生效。
4. 按 `Ctrl+Space` 切换输入法，按 `Shift` 切换中英文模式，尝试输入，此时应为简体拼音模式。

## 🐧 Ubuntu/Linux 篇：IBus-Rime 配置

### 第一步：安装基础环境

打开终端，执行以下命令：

```bash
sudo apt update
sudo apt install ibus-rime git curl wget fonts-noto-cjk
```

_注：`fonts-noto-cjk` 用于防止候选框出现乱码方框。_

### 第二步：添加输入法

1. **重启 IBus** 或**注销/重启电脑**（必须步骤，否则新引擎不加载）。
2. 打开**设置（Settings）** -> **键盘（Keyboard）** -> **输入源（Input Sources）**。
3. 点击 `+` -> **中文（Chinese）** -> 选择 **Chinese (Rime)** / **智能中州韵**。
4. 切换到 Rime 输入法一次（按 `Super+Space`），触发系统自动生成配置目录 `~/.config/ibus/rime/`。

### 第三步：使用 Plum 部署雾凇拼音

这是最标准且易于更新的安装方式。

1. **安装 Plum（东风破）**：

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/rime/plum/master/rime-install)
```

如果报错 `git: command not found`，请先执行 `sudo apt install git`。

2. **拉取雾凇配置**：进入 plum 目录并执行安装命令：

```bash
cd ~/plum
./rime-install iDvel/rime-ice:others/recipes/full
```

脚本会自动下载配置、编译词典并合并到 `~/.config/ibus/rime/`。

3. **重启 IBus**：

```bash
ibus restart
```

如果切换后未生效，请尝试注销并重新登录系统。

### 第四步：验证

1. 切换到 Rime 输入法。
2. 按 `F4` 键呼出菜单，确认方案列表中包含**"朙月拼音·简化字"**或**"雾凇拼音"**相关选项。
3. 输入测试，确认为简体字。

## 🔄 通用操作：重新部署与更新

### 什么时候需要"重新部署"？

每当你修改了 `.yaml` 配置文件，或者安装了新的词库/方案后，都必须**重新部署**才能生效。

- **Windows**：右键托盘图标 -> **重新部署**。
- **Linux**：按 `F4` 呼出菜单 -> 选择**重新部署**；或运行 `ibus restart`。
- **macOS**：右键菜单栏图标 -> **重新部署**。

### 如何更新雾凇词库？

雾凇拼音会不定期更新词库和修复 Bug。

**Linux/Mac（使用 Plum）**：

```bash
cd ~/plum
./rime-install iDvel/rime-ice:others/recipes/full
# 然后重新部署
```

**Windows（手动）**：重新下载最新的 ZIP 包，覆盖配置目录中的文件（保留 `.userdb` 个人词库文件），然后右键重新部署。

**Windows（使用 Plum）**：如果在 Windows 上安装了 Git 和 Plum，命令与 Linux 相同。

## ❓ 常见问题排查（FAQ）

### Q1：候选框显示方框（□□□）怎么办？

**原因**：系统缺少中文字体。

**解决**：

- **Ubuntu**：`sudo apt install fonts-noto-cjk fonts-wqy-zenhei`
- **Windows**：通常自带字体，若缺失可安装"思源黑体"。
- **配置**：在 `weasel.custom.yaml`（Windows）或 `squirrel.custom.yaml`（macOS）中指定字体：

```yaml
patch:
  style/font_face: "Noto Sans CJK SC"
```

### Q2：还是繁体字怎么办？

**原因**：默认方案可能是繁体，或者未成功加载雾凇配置。

**解决**：

1. 按 `F4`（Linux/Mac）或 `` Ctrl+` ``（Windows）呼出方案菜单。
2. 选择"朙月拼音·简化字"（luna_pinyin_simp）**。
3. 如果菜单里没有简化字，说明雾凇配置未成功部署，请检查文件是否复制到了正确的目录，并执行"重新部署"。

### Q3：如何自定义短语（如输入"sjh"出"手机号"）？

在所有平台上，只需在配置目录（`C:\RimeConfig` 或 `~/.config/ibus/rime/`）下创建或编辑 `custom_phrase.txt`：

```text
# 格式：短语<Tab>编码<Tab>权重
手机号	sjh	1
邮箱	yx	1
```

保存后**重新部署**即可生效。

### Q4：想要双拼（如小鹤双拼）怎么改？

雾凇拼音内置了多种双拼。

1. 按 `F4` 呼出菜单。
2. 直接选择"小鹤双拼"**或其他双拼方案即可立即切换。
3. 若想设为默认，编辑 `default.custom.yaml`，修改 `schema_list` 顺序，将双拼方案放在第一位。