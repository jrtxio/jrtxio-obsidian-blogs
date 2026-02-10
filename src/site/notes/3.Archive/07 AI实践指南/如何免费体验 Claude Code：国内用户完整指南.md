---
{"dg-publish":true,"dg-path":"07 AI实践指南/如何免费体验 Claude Code：国内用户完整指南.md","permalink":"/07 AI实践指南/如何免费体验 Claude Code：国内用户完整指南/"}
---

#ai

## 前言

**Claude Code** 是一款强大的智能编程助手，能进行代码生成、重构、调试和逻辑推理，为开发者提供类结对编程体验。  

然而，国内用户目前无法直接访问 Anthropic 官方模型，这让很多人无法体验到完整功能。

> ⚠️ 前置条件：在开始之前，请确保你已经安装并配置好 Claude Code，安装过程可参考 [[3.Archive/07 AI实践指南/Claude Code 使用指南：安装、配置与实践\|Claude Code 使用指南：安装、配置与实践]]。

本文将介绍 **如何通过 Claude Code Router + 国内免费模型平台**，实现零成本、接近官方的使用体验。

## 为什么需要 Claude Code Router

Claude Code Router 并非模型，而是 **模型路由器**。  
它能将 IDE 内的请求分发到不同模型平台，从而实现：

- 访问国内外不同模型（OpenRouter、Moonshot、iflow、魔搭社区、智谱等）
- 根据任务类型自动选择最佳模型
- 保持统一的 Claude Code 交互体验

换句话说，Router 是 Claude Code 的“外壳”，里面跑的模型可以灵活替换。

## 国内可用的免费模型平台

目前国内用户可接入的免费模型平台主要有：

- **OpenRouter**：国际聚合平台，支持 Anthropic、OpenAI、Mistral 等，部分模型有免费额度。
- **Moonshot AI (Kimi)**：支持超长上下文（20w+ tokens），适合大项目代码分析。
- **心流 (iflow)**：国内团队打造的 vibe coding 模型，体验接近 Claude Code 官方。
- **魔搭社区 (ModelScope)**：开源平台，支持 Qwen、GLM 等多模型，免费推理额度充足。
- **智谱 AI (GLM-4.5)**：中文支持优秀，免费额度稳定。

通过这些平台组合，就能在日常编码、长上下文、复杂推理和联网问答等场景下实现完整体验。

## 完整配置示例

下面是可直接使用的 **Claude Code Router 配置文件**（只需替换 `"api_key": "key"` 为你自己的 API key）：

```json
{
  "LOG": true,
  "LOG_LEVEL": "debug",
  "CLAUDE_PATH": "",
  "HOST": "127.0.0.1",
  "PORT": 3456,
  "APIKEY": "",
  "API_TIMEOUT_MS": "600000",
  "PROXY_URL": "http://127.0.0.1:7897",
  "transformers": [],
  "Providers": [
    {
      "name": "openrouter",
      "api_base_url": "https://openrouter.ai/api/v1/chat/completions",
      "api_key": "key",
      "models": [
        "anthropic/claude-sonnet-4",
        "anthropic/claude-3.7-sonnet:thinking",
        "moonshotai/kimi-k2:free"
      ],
      "transformer": {
        "use": [
          "openrouter"
        ]
      }
    },
    {
      "name": "kimi",
      "api_base_url": "https://api.moonshot.cn/v1/chat/completions",
      "api_key": "key",
      "models": [
        "kimi-k2-0711-preview"
      ]
    },
    {
      "name": "iflow",
      "api_base_url": "https://apis.iflow.cn/v1/chat/completions",
      "api_key": "key",
      "models": [
        "kimi-k2",
        "qwen3-coder",
        "glm-4.5",
        "qwen3-235b-a22b-thinking-2507",
        "deepseek-v3.1"
      ],
      "transformer": {
        "qwen3-coder": {
          "use": [
            "enhancetool"
          ]
        },
        "deepseek-v3.1": {
          "use": [
            [
              "maxtoken",
              {
                "max_tokens": 8192
              }
            ]
          ]
        }
      }
    },
    {
      "name": "modelscope",
      "api_base_url": "https://api-inference.modelscope.cn/v1/chat/completions",
      "api_key": "key",
      "models": [
        "Qwen/Qwen3-Coder-480B-A35B-Instruct",
        "Qwen/Qwen3-235B-A22B-Thinking-2507",
        "ZhipuAI/GLM-4.5"
      ],
      "transformer": {
        "use": [
          [
            "maxtoken",
            {
              "max_tokens": 65536
            }
          ]
        ],
        "Qwen/Qwen3-Coder-480B-A35B-Instruct": {
          "use": [
            "enhancetool"
          ]
        },
        "Qwen/Qwen3-235B-A22B-Thinking-2507": {
          "use": [
            "reasoning"
          ]
        }
      }
    }
  ],
  "StatusLine": {
    "enabled": true,
    "currentStyle": "default",
    "default": {
      "modules": []
    },
    "powerline": {
      "modules": []
    }
  },
  "Router": {
    "default": "kimi,kimi-k2-0711-preview",
    "background": "openrouter,moonshotai/kimi-k2:free",
    "think": "modelscope,Qwen/Qwen3-235B-A22B-Thinking-2507",
    "longContext": "iflow,kimi-k2",
    "longContextThreshold": 60000,
    "webSearch": "modelscope,ZhipuAI/GLM-4.5",
    "image": "openrouter,anthropic/claude-sonnet-4"
  },
  "CUSTOM_ROUTER_PATH": ""
}
```


## 切换与体验

1. 确保 Claude Code 已经安装完成（可参考 [[3.Archive/07 AI实践指南/Claude Code 使用指南：安装、配置与实践\|Claude Code 使用指南：安装、配置与实践]]）
2. 安装 Claude Code Router：

```bash
npm install -g @musistudio/claude-code-router
```

3. 填写各平台 API key 并保存配置
4. 启动 Claude Code，在 IDE 内测试不同任务的模型调用
5. 根据任务类型，自动选择最佳模型：
    - 日常编程 → Kimi
    - 后台任务 → OpenRouter 免费模型
    - 推理任务 → Qwen3 Thinking
    - 长上下文 → Kimi / iflow
    - 网页搜索 → GLM-4.5

这样，你就能在国内环境中，**完全免费体验 Claude Code 的功能**。

## 总结与展望

通过 **Claude Code Router + 国内免费模型组合**，国内用户可以：

- 零成本体验 Claude Code
- 灵活调用不同模型，应对各种任务场景
- 保持接近官方 Claude Code 的使用体验

虽然免费方案在稳定性和部分模型效果上可能略有差异，但已经足够满足日常开发和大部分复杂任务需求。  

未来，随着国内模型生态不断完善，免费方案将更加强大，为开发者提供更多选择。