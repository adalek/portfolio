---
title: "Houdini AI Agent"
year: 2026
category: "Technical Art"
summary: "正在进行的硕士毕业设计，探索使用本地大语言模型与 RAG 辅助 Houdini 程序化建模。"
role: ["Researcher", "Technical Artist", "Developer"]
tools: ["Houdini", "Python", "llama.cpp", "Qwen2.5-Coder", "RAG", "FastAPI", "ChromaDB"]
cover: "/assets/blog-houdini-agent-service-staircase-result.png"
featured: false
order: 12
links:
  - label: "返回 Tech Art 2026"
    url: "/work/cave-projects"
  - label: "GitHub Repository"
    url: "https://github.com/adalek/MasterProject"
media: []
---

## 项目状态

正在进行。

这是我的硕士毕业设计，研究如何使用大语言模型辅助 Houdini 程序化建模。当前目标不是把系统描述成已经完成的通用 Agent，而是逐步验证一条本地、可控的工作流：用户输入自然语言，本地代码模型生成 Houdini Python，再由 Houdini 执行并生成节点网络。

## 当前工作流

```text
自然语言任务
  ↓
本地 AI Service 与 RAG 检索
  ↓
llama.cpp / Qwen2.5-Coder-7B
  ↓
生成并清理 Houdini Python
  ↓
Houdini 执行代码
```

为了避免 Houdini 的 Python 环境直接加载 Sentence Transformers 与 ChromaDB，我使用 FastAPI 将 RAG 包装成本地 HTTP 服务。Houdini 端只负责提交 Prompt、接收代码、执行基础检查并运行结果。

## 已完成的阶段

- 使用 llama.cpp 在本地运行 Qwen2.5-Coder-7B，并通过 OpenAI-compatible API 调用模型。
- 从 Python 向模型发送 Houdini 任务，清理返回代码，并通过 Shelf Tool 在 Houdini 中执行。
- 建立 Prompt 文件与基础 Benchmark，测试节点创建、连接、参数设置和 Copy to Points 等任务。
- 使用 Markdown 知识文档、Sentence Transformers 与 ChromaDB 搭建最小 RAG 流程。
- 将 RAG 封装为 FastAPI 服务，隔离 Houdini 与机器学习依赖。
- 对 Copy to Points 和程序化楼梯任务进行有无 RAG 的初步对照测试。

![使用 RAG 后生成的 Copy to Points 节点网络与视口结果。](/assets/blog-houdini-agent-service-copy-rag.png)

## 当前观察

现有实验中，小模型能够完成范围有限、约束清晰的 Houdini 任务，但在节点类型、输入顺序、参数名称和显示节点上容易出错。加入经过验证的 Houdini 示例后，Copy to Points 与程序化楼梯测试获得了更可用的结果，同时也增加了 Prompt 长度与生成时间。

这些结果仍然只是小规模实验。当前知识库覆盖有限，检索到相关内容也不能保证代码正确；知识示例本身如果不适合 Houdini 的执行环境，错误同样会被生成结果继承。

## 开发记录

- [环境搭建：本地运行 Qwen](/blog/houdini-ai-agent-environment-setup)
- [跑通 Python 到 Houdini](/blog/houdini-ai-agent-python-pipeline)
- [建立最小 RAG 流程](/blog/houdini-ai-agent-rag-foundation)
- [把 RAG 包装成本地服务](/blog/houdini-ai-agent-rag-service)

后续研究与实现会继续记录在 Blog 中。
