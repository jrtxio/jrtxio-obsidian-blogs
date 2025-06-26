---
{"dg-publish":true,"dg-path":"3 - 工具教程/Obsidian 的 Callout 使用场景.md","permalink":"/3 - 工具教程/Obsidian 的 Callout 使用场景/","created":"2025-02-14T14:03:51.156+08:00","updated":"2025-06-10T10:35:01.013+08:00"}
---

#Innolight

# 语法介绍

Obsidian 的 Callout 语法结构如下：

```
> [!NOTE] Title
> Content
```

分为四个部分：

- Callout 的开头 >
- Callout 的类型 NOTE
- Callout 的标题 Title
- Callout 的正文 Content

Obsidian 共提供了 13 种 Callout：

- note
- abstract, summary, tldr
- info
- todo
- tip, hint, important
- success, check, done
- warning, caution, attention
- failure, fail, missing
- danger, error
- bug
- example
- quote, cite

```
> [!NOTE] Note
> 用于普通提示或说明，适合提供附加信息或背景知识。
```

> [!NOTE] Note
> 用于普通提示或说明，适合提供附加信息或背景知识。


```
> [!TIP] Tip
> 强调操作建议或最佳实践，例如技巧或快捷方式。
```

> [!TIP] Tip
> 强调操作建议或最佳实践，例如技巧或快捷方式。


```
> [!INFO] Info
> 提供额外的信息或上下文，通常用于补充理解。
```

> [!INFO] Info
> 提供额外的信息或上下文，通常用于补充理解。


```
> [!ICAUTION] Caution
> 提醒注意事项，可能会导致问题但不至于严重。
```

> [!ICAUTION] Caution
> 提醒注意事项，可能会导致问题但不至于严重。


```
> [!WARNING] Warning
> 强烈警告，可能造成严重后果，例如数据丢失或错误操作。
```

> [!WARNING] Warning
> 强烈警告，可能造成严重后果，例如数据丢失或错误操作。


```
> [!EXAMPLE] Example
> 给出具体例子，通用用于展示用法或结果。
```

> [!EXAMPLE] Example
> 给出具体例子，通用用于展示用法或结果。


```
> [!QUOTE] Quote
> 引用名言或有启发的内容，适合用于哲理性或激励性的语句。
```

> [!QUOTE] Quote
> 引用名言或有启发的内容，适合用于哲理性或激励性的语句。


```
> [!ABSTRACT] Abstract
> 简述或概括长篇内容，常用于总结某段的要点。
```

> [!ABSTRACT] Abstract
> 简述或概括长篇内容，常用于总结某段的要点。

# 使用原则

## 明确目的

- 引导重点：根据信息的重要性选择合适的类型，例如提示用户注意事项时，优先使用 caution 或 warning
- 区分语气：友善建议使用 tip，而非强烈语气的 warning

## 视觉层次清晰

- 限制数量：同一页面中避免使用过多 Callout，控制在 1-3 种类型以内，以免视觉过载
- 配色一致：不同主题下 Callout 的配色可能不同，选择合适的颜色以保持一致性

## 内容简洁

- 控制长度：Callout 的文字应尽量简短，突出核心信息
- 分块展示：讲长文拆分成多个 Callout，每个块强调不同的方面
## 保持一致性

- 统一格式：团队协作时，统一约定各类型的使用场景。例如，note 用于背景知识，tip 用于最佳实践等
- 风格约定：例如所有 caution 都在段落开始使用，所有 info 在段落结束总结
