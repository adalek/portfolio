---
title: "Houdini AI Agent"
year: 2026
category: "Technical Art"
summary: "正在进行的硕士毕业设计，探索使用本地与云端大语言模型、RAG 和可审查界面辅助 Houdini 程序化建模。"
role: ["Researcher", "Technical Artist", "Developer"]
tools: ["Houdini", "Python", "PySide6", "llama.cpp", "Qwen2.5-Coder", "DeepSeek", "RAG", "FastAPI", "ChromaDB"]
cover: "/assets/blog-houdini-agent-gui-retrieved-knowledge.png"
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

这是我的硕士毕业设计，研究如何使用大语言模型辅助 Houdini 程序化建模。当前目标不是把系统描述成已经完成的通用 Agent，而是逐步验证一条可控的工作流：用户输入自然语言，系统根据设置检索 Houdini 知识并调用本地或云端模型，生成的 Python 先交给用户检查，再决定是否在 Houdini 中执行。

## 当前工作流

```text
Houdini PySide6 GUI
  ↓ Prompt、模型与 RAG 设置
FastAPI AI Service
  ↓
可选的 RAG 检索与 Prompt 构建
  ↓
llama.cpp / Qwen2.5-Coder-7B 或 DeepSeek
  ↓
生成并清理 Houdini Python
  ↓
代码预览与人工确认
  ↓
Houdini 执行代码并生成节点网络
```

为了避免 Houdini 的 Python 环境直接加载 Sentence Transformers 与 ChromaDB，我使用 FastAPI 将 RAG 包装成本地 HTTP 服务。Houdini 端通过 PySide6 界面提交 Prompt、选择模型和 RAG，并显示召回资料、Distance 与生成代码。代码不会自动执行，用户需要检查后主动点击 Execute。

## 已完成的阶段

- 使用 llama.cpp 在本地运行 Qwen2.5-Coder-7B，并通过 OpenAI-compatible API 调用模型。
- 从 Python 向模型发送 Houdini 任务，清理返回代码，并通过 Shelf Tool 在 Houdini 中执行。
- 建立 Prompt 文件与基础 Benchmark，测试节点创建、连接、参数设置和 Copy to Points 等任务。
- 使用 Markdown 知识文档、Sentence Transformers 与 ChromaDB 搭建最小 RAG 流程。
- 将 RAG 封装为 FastAPI 服务，隔离 Houdini 与机器学习依赖。
- 对 Copy to Points 和程序化楼梯任务进行有无 RAG 的初步对照测试。
- 整理基础、螺旋与参数化楼梯案例，比较资料格式、查询语义、Chunking、`top_k` 和 `max_tokens` 对检索与生成的影响。
- 对比本地 Qwen2.5-Coder-7B 与云端 DeepSeek 在楼梯任务中的代码执行和几何结果。
- 使用 PySide6 完成最小 GUI，整合 Prompt、模型选择、RAG 开关、检索结果、代码预览和人工执行确认。

![使用 RAG 后生成的 Copy to Points 节点网络与视口结果。](/assets/blog-houdini-agent-service-copy-rag.png)

## RAG 评估与 Chunking

直线与螺旋楼梯实验显示，单一案例可以帮助模型复现相近的节点结构和修改明确参数，但不会自动变成可泛化的 Houdini 技能。模型可能生成语法正确却形状错误的几何，也可能理解整体结构却因一个 VEX 常量或 API 细节而无法执行。

将 RAG 资料统一为包含用途、相关请求、知识类型、核心 Pattern 和代码的结构后，螺旋楼梯资料的检索排名得到改善。进一步把完整案例拆成核心台阶、扶手和栏杆三个 Chunk 后，精简查询能够分别召回相关部分；测试也确认，代码生成规则如果混入检索查询，会干扰 Retrieval Distance。

![本地 Qwen 根据检索资料生成的参数化楼梯结果。](/assets/blog-houdini-agent-chunking-local-parameterized.png)

## 当前 MVP

当前 GUI 已经能够选择本地 Qwen 或 DeepSeek、决定是否使用 RAG、查看检索来源和 Distance、预览生成代码，并由用户确认后在 Houdini 中执行。这让检索和生成过程从 Shelf Tool 与 Python Shell 中移到一个可操作的界面，同时保留人工审核环节。

项目仍处于研究和验证阶段。当前知识库只有少量楼梯案例，现有结果不能代表一般任务的成功率；`top_k`、Context 长度、输出限制、模型差异和语料质量都会影响结果。后续仍需要扩充经过验证的知识、建立自动化评测，并研究生成失败后的验证与修复流程。

## 开发记录

- [环境搭建：本地运行 Qwen](/blog/houdini-ai-agent-environment-setup)
- [跑通 Python 到 Houdini](/blog/houdini-ai-agent-python-pipeline)
- [建立最小 RAG 流程](/blog/houdini-ai-agent-rag-foundation)
- [把 RAG 包装成本地服务](/blog/houdini-ai-agent-rag-service)
- [测试 RAG 的泛化边界](/blog/houdini-ai-agent-rag-evaluation)
- [RAG 命中率与 Chunking](/blog/houdini-ai-agent-rag-retrieval-chunking)
- [封装 GUI，完成最小 MVP](/blog/houdini-ai-agent-gui-mvp)

后续研究与实现会继续记录在 Blog 中。
