---
title: "Houdini AI Agent 开发尝试：封装 GUI，完成最小 MVP"
date: 2026-08-14
summary: "使用 PySide6 为 Houdini AI Agent 添加最小 GUI，将 Prompt、模型选择、RAG 检索结果、代码预览和执行整合到同一工作流。"
tags: ["Houdini", "AI Agent", "PySide6", "GUI", "RAG", "MVP"]
draft: false
---

在[上一篇](/blog/houdini-ai-agent-rag-retrieval-chunking)中，我完成了不同 RAG 案例、Chunking、`top_k` 和模型的测试。当前后端流程已经可以根据 Prompt 选择是否使用 RAG，并调用本地 Qwen 或 DeepSeek 生成 Houdini Python。

这次的目标是为现有流程封装一个最小 GUI，把生成与执行从 Shelf Tool 和 Python Shell 中移到一个可操作的界面，完成项目的最小 MVP。

## 使用 PySide6 创建 UI

我使用 PySide6 的 Qt Widgets 创建最小 GUI，并将界面代码放在 `src/ui.py` 中。

PySide6 UI 必须从 Houdini 主线程执行。Houdini 官方 Qt Cookbook 特别说明不要从 Python Shell 运行 Qt UI，否则界面可能无法工作，甚至导致 Houdini 崩溃。

因此，我新建了一个 Shelf Tool 作为 UI 入口：

```python
import importlib
import sys

PROJECT_ROOT = "/home/s5803453/Desktop/MasterProject"

if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import src.ui

importlib.reload(src.ui)
src.ui.show_window()
```

开发阶段需要频繁修改 UI 脚本，因此在打开窗口前加入 `importlib.reload()`，让 Shelf Tool 重新加载最新代码。

## 最小 MVP 功能

之前的实验出现过生成代码无法执行，甚至导致 Houdini 崩溃的情况。因此，这次没有让模型返回的代码自动执行，而是先把代码显示给用户，再由用户决定是否点击 **Execute**。

第一版 GUI 包含：

- Prompt 输入框
- 模型选择
- RAG 开关
- Generate 按钮
- Generated Code 预览
- Execute 按钮
- 执行状态

![Houdini AI Agent 的第一版最小 GUI](/assets/blog-houdini-agent-gui-basic-mvp.png)

这时用户已经可以输入 Prompt、选择模型、决定是否使用 RAG、生成代码并预览结果，再执行代码并在 Houdini 中创建节点。

## 显示 Retrieved Knowledge

后续版本增加了 **Retrieved Knowledge** 区域。它会显示 RAG 实际召回的资料名称和 Distance，让 RAG 从后台逻辑变成 GUI 中可见的功能，也方便开发过程中测试检索是否正确。

环境配置也开始从 GUI 获取，例如 Provider 可以选择 Local Qwen 或 DeepSeek；只有 GUI 无法提供配置时，才读取 `.env` 中的设置。

![加入 Retrieved Knowledge 后的 GUI 与楼梯生成结果](/assets/blog-houdini-agent-gui-retrieved-knowledge.png)

目前核心功能已经完成。用户可以：

1. 输入 Prompt。
2. 选择不同模型。
3. 勾选是否使用 RAG。
4. 查看召回的知识资料。
5. 生成并预览代码。
6. 决定是否执行代码。
7. 在 Houdini 中查看生成的节点网络。

## 当前架构关系

```text
Houdini
┌──────────────────────────────┐
│ PySide GUI                   │
│                              │
│ Prompt                       │
│ Model Selector               │
│ RAG Toggle                   │
│ Retrieved Knowledge          │
│ Generated Code               │
│ Generate / Execute           │
└──────────────┬───────────────┘
               │ HTTP POST /generate
               │ JSON
               ▼
┌──────────────────────────────┐
│ FastAPI RAG Server           │
│ src/rag_server.py            │
│                              │
│ RAG ON / OFF                 │
│ Local / DeepSeek             │
└──────────┬─────────┬─────────┘
           │         │
       RAG ON     RAG OFF
           │         │
           ▼         ▼
generate_with_rag()  generate()
           │         │
      retrieve()     │
           │         │
    build_prompt()   │
           └────┬────┘
                ▼
           ask_model()
             ↙     ↘
     Local Qwen     DeepSeek
      llama.cpp     Cloud API
             ↘     ↙
               code
                │
                ▼
        FastAPI Response
                │
                ▼
          Houdini GUI
          Code Preview
          [ Execute ]
                │
                ▼
        exec(code, ...)
                │
                ▼
      Houdini SOP Network
```

## 下一步

未来计划增加 Settings 面板，把 API Key、Server URL、`top_k` 等参数暴露出来，方便用户调节。

目前对生成结果的判断仍然完全依靠人工。下一步还需要开发自动化评测管线，并继续收集和整理符合规范的 RAG 语料。
