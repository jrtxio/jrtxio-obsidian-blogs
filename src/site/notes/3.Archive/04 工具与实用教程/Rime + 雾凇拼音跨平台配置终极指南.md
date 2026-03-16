---
{"dg-publish":true,"dg-path":"04 工具与实用教程/Rime + 雾凇拼音跨平台配置终极指南.md","permalink":"/04 工具与实用教程/Rime + 雾凇拼音跨平台配置终极指南/"}
---

## 💡 核心概念

- **Rime（中州韵）**：输入法引擎核心，本身不带词库和界面，需要配合"前端"使用。
- **前端**：
    - Windows：**小狼毫（Weasel）**
    - Linux（Ubuntu）：**IBus-Rime**
    - macOS：**鼠须管（Squirrel）**
- **雾凇拼音（rime-ice）**：一套优秀的**配置文件包**，提供现代化词库、自动纠错和双拼方案。**安装 Rime 前端后，必须部署雾凇配置才能获得最佳体验。**

> 三平台部署雾凇拼音的方式完全一致：用 Git 将仓库 clone 到本地，再将文件复制到 Rime 的用户配置目录，最后执行重新部署。

## 📁 各平台配置目录

|平台|配置目录|
|---|---|
|Windows|`C:\RimeConfig`（安装时自行指定）|
|Linux|`~/.config/ibus/rime/`|
|macOS|`~/Library/Rime/`|

后文统称此目录为**配置目录**。

## 第一步：安装 Rime 前端

### Windows（小狼毫）

1. 访问 [小狼毫 GitHub Release 页面](https://github.com/rime/weasel/releases)，下载最新安装包（如 `weasel-0.16.x-installer.exe`）。
2. 运行安装程序时，在"用户文件夹"设置界面选择**"我来指定位置"**，建议填写 `C:\RimeConfig`（路径简短，方便后续操作）。

### Linux（IBus-Rime）

```bash
sudo apt update
sudo apt install ibus-rime git fonts-noto-cjk
```

安装完成后，**注销并重新登录**，然后进入**设置 → 键盘 → 输入源**，点击 `+` → **中文（Chinese）** → 选择 **Chinese (Rime)**。

切换到 Rime 输入法一次（按 `Super+Space`），触发系统自动生成配置目录 `~/.config/ibus/rime/`。

### macOS（鼠须管）

1. 访问 [鼠须管 GitHub Release 页面](https://github.com/rime/squirrel/releases)，下载最新的 `.pkg` 安装包。
2. 运行安装包，按提示完成安装，**注销并重新登录**后在系统输入法列表中添加**鼠须管**。

## 第二步：拉取雾凇拼音配置

三个平台操作完全相同，确保已安装 Git，在终端（Windows 使用 PowerShell 或 Git Bash）执行：

```bash
git clone https://github.com/iDvel/rime-ice.git
```

如需指定位置，可加上路径参数，例如：

```bash
git clone https://github.com/iDvel/rime-ice.git ~/rime-ice
```

## 第三步：将配置文件复制到配置目录

将 `rime-ice` 文件夹内的**所有文件和文件夹**复制到各平台的配置目录下。

> ⚠️ 注意：**先备份**配置目录中现有的 `*.userdb` 文件（这是你的个人词库），再清空目录，最后复制新文件。复制后 `default.yaml`、`rime_ice.schema.yaml` 等文件应**直接位于配置目录根目录**，不要多套一层文件夹。

**Linux / macOS**：

```bash
# 备份个人词库（如有）
cp ~/.config/ibus/rime/*.userdb ~/rime-userdb-backup 2>/dev/null

# 复制雾凇配置（macOS 将路径替换为 ~/Library/Rime/）
cp -r ~/rime-ice/* ~/.config/ibus/rime/
```

**Windows（PowerShell）**：

```powershell
# 复制至配置目录（根据实际路径调整）
Copy-Item -Path "C:\path\to\rime-ice\*" -Destination "C:\RimeConfig\" -Recurse -Force
```

## 第四步：重新部署

- **Windows**：右键任务栏小狼毫图标 → **重新部署**。
- **Linux**：按 `F4` 呼出菜单 → **重新部署**；或在终端运行 `ibus restart`。
- **macOS**：右键菜单栏鼠须管图标 → **重新部署**。

等待几秒，部署完成后即可使用。按 `F4`（Linux/macOS）或 `` Ctrl+` ``（Windows）呼出方案菜单，确认列表中包含**雾凇拼音**相关选项，输入测试，默认应为简体拼音模式。

## 🔄 更新雾凇词库

雾凇拼音会不定期更新词库和修复 Bug。由于使用 Git 管理，更新非常简便，三平台操作完全一致：

```bash
cd ~/rime-ice
git pull
```

拉取完成后，重新将文件复制到配置目录（同第三步），再执行**重新部署**即可。

## ❓ 常见问题排查（FAQ）

### Q1：候选框显示方框（□□□）怎么办？

**原因**：系统缺少中文字体。

**解决**：

- **Ubuntu**：`sudo apt install fonts-noto-cjk fonts-wqy-zenhei`
- **Windows**：通常自带字体，若缺失可安装"思源黑体"。

也可在配置目录下创建或编辑 `weasel.custom.yaml`（Windows）或 `squirrel.custom.yaml`（macOS）指定字体：

```yaml
patch:
  style/font_face: "Noto Sans CJK SC"
```

### Q2：还是繁体字怎么办？

1. 按 `F4`（Linux/macOS）或 `` Ctrl+` ``（Windows）呼出方案菜单。
2. 选择**"朙月拼音·简化字"**（luna_pinyin_simp）。
3. 若菜单中没有简化字选项，说明雾凇配置未成功部署，请检查文件是否复制到了正确的配置目录，并重新执行部署。

### Q3：如何自定义短语（如输入"sjh"出"手机号"）？

在配置目录下创建或编辑 `custom_phrase.txt`：

```text
# 格式：短语<Tab>编码<Tab>权重
手机号	sjh	1
邮箱	yx	1
```

保存后**重新部署**即可生效。

### Q4：想要双拼（如小鹤双拼）怎么改？

雾凇拼音内置了多种双拼方案。

1. 按 `F4` 呼出菜单，直接选择"小鹤双拼"或其他双拼方案即可立即切换。
2. 若想设为默认，编辑 `default.custom.yaml`，将双拼方案在 `schema_list` 中移至第一位。