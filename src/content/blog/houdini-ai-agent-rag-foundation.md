---
title: "Houdini AI Agent 开发尝试：用 RAG 补充 Houdini 知识"
date: 2026-07-24
summary: "测试本地小模型生成 Houdini 节点网络的能力，并使用 uv、Sentence Transformers 与 ChromaDB 搭建最小 RAG 检索流程。"
tags: ["Houdini", "AI Agent", "RAG", "ChromaDB", "uv", "Local LLM"]
draft: false
---

在[上一篇](/blog/houdini-ai-agent-python-pipeline)中，我已经跑通了从 Shelf Tool 到本地模型、再到 Houdini 节点生成的完整链路。但第一次测试也出现了 `setPos` API 不存在的问题：模型理解任务的大致方向，却不一定掌握准确的 Houdini Python 用法。

因此，这一阶段的目标从“让模型生成代码”转向了“让模型获得更可靠的 Houdini 上下文”。在搭建 RAG 之前，我先通过一组逐渐增加难度的任务，观察本地小模型在哪些地方开始失效。

## 测试 Qwen2.5-Coder-7B 的能力边界

我为 Qwen2.5-Coder-7B 设计了几个由简单到复杂的 Houdini 任务：

1. 创建一个 Box SOP。
2. 创建多个节点并建立连接。
3. 设置节点参数。
4. 使用 Box、Grid、Scatter 和 Copy to Points 搭建完整 SOP 网络。

前三类任务相对简单；到了第四个 Copy to Points 实验，模型开始频繁生成错误的连接方式或不准确的 API。为了得到正确结果，我对同一个 Prompt 进行了多轮修改，把容易出错的部分逐步改成明确约束。

![项目中的 Houdini Prompt 实验与 RAG 目录结构](/assets/blog-houdini-agent-rag-prompts.png)

最终版本不再只描述目标，而是直接限定节点类型、输入顺序、显示节点和布局要求。例如，Copy to Points 的两个输入必须明确指定：

```text
scatter.setInput(0, grid)
copytopoints.setInput(0, box)
copytopoints.setInput(1, scatter)
```

这次实验说明，小模型能够完成有限范围内的 Houdini 任务，但 Prompt 必须非常具体。对于连接顺序、方法名称和参数位置，仅仅告诉模型“创建一个 Copy to Points 网络”还不够。

## 比较不同模型的返回

我也在 Qwen3-8B 上测试了相同的 Prompt。尽管模型规模接近，但它不是专门的 Coder 模型，这次返回了更多解释性文字，没有像 Qwen2.5-Coder 那样稳定地遵守“只输出代码”的要求。

API 响应中的 `usage` 可以帮助记录每次实验的 Token 消耗：

```json
{
  "completion_tokens": 237,
  "prompt_tokens": 133,
  "total_tokens": 370,
  "prompt_tokens_details": {
    "cached_tokens": 132
  }
}
```

不过，Token 数只能量化输入和输出长度，不能单独代表代码质量。现阶段更重要的评估指标仍然是：代码能否执行、节点连接是否正确，以及输出中是否混入解释或 Markdown 标记。

## 为什么开始搭建 RAG？

持续把所有规则写进 Prompt 会让提示词越来越长，而且仍然无法覆盖大量 Houdini API。相比要求 7B 模型凭记忆生成代码，我希望在请求前先检索经过验证的 Houdini 示例，再把最相关的内容附加到 Prompt 中。

计划中的流程是：

```text
Houdini
  ↓
houdini_run_llm.py
  ↓ HTTP
Local AI Service
  ├─ RAG Retrieval
  ├─ Embedding Model
  ├─ ChromaDB
  └─ Qwen2.5-Coder
  ↓
Generated Python Code
  ↓
Houdini Execute
```

RAG 不会直接修改模型权重。它的作用是在生成代码前，从本地知识库中找出与当前任务最相关的可靠示例，为模型提供额外上下文。

## 使用 uv 管理 Python 环境

RAG 会引入 Sentence Transformers 和 ChromaDB 等依赖。为了让实验环境更容易复现，我为现有项目加入了 `uv`：

```bash
uv init --bare
uv venv
source .venv/bin/activate
```

可以通过下面的命令确认当前 Python 来自项目虚拟环境：

```bash
which python
```

安装当前阶段需要的依赖：

```bash
uv add requests
uv add sentence-transformers chromadb
```

之后使用 `uv run` 执行命令时，uv 会自动使用项目环境，不必每次手动激活 `.venv`：

```bash
uv run python -m rag.test_prompt
```

## RAG 最小项目结构

第一版 RAG 保持尽可能简单：Markdown 文件作为知识来源，Sentence Transformers 生成向量，ChromaDB 在本地持久化并执行相似度检索。

```text
MasterProject/
├─ knowledge/
│  └─ staircase.md
├─ rag/
│  ├─ __init__.py
│  ├─ config.py
│  ├─ ingest.py
│  ├─ retrieve.py
│  ├─ prompt_builder.py
│  └─ test_prompt.py
├─ chroma_db/
├─ pyproject.toml
└─ uv.lock
```

各部分的职责如下：

- `knowledge/`：保存经过验证的 Houdini API 说明和节点网络示例。
- `config.py`：集中管理知识目录、数据库路径、Collection 名称和 Embedding 模型。
- `ingest.py`：读取 Markdown、生成 Embedding，并写入 ChromaDB。
- `retrieve.py`：将用户问题向量化，返回最相关的知识文档。
- `prompt_builder.py`：组合固定规则、检索内容和用户原始任务。
- `test_prompt.py`：在接入 Houdini 之前独立检查检索和最终 Prompt。

## 从知识文档到向量数据库

配置中使用了多语言 Embedding 模型：

```python
EMBEDDING_MODEL_NAME = (
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
)
```

这样做是因为用户可能使用中文输入“创建一个程序化楼梯”，而知识文档主要使用英文。多语言 Embedding 可以让不同语言的相近语义进入同一个检索空间。

`ingest.py` 的完整实现不在这里展开，它主要完成四个步骤：

```text
读取 knowledge/*.md
  ↓
生成标准化 Embedding
  ↓
写入 ChromaDB Collection
  ↓
保存文档来源 Metadata
```

第一版选择每次完整重建 Collection。这种方式还不适合大型知识库，但在实验阶段可以避免旧数据、重复数据和修改后的文档同时存在。

每次添加或更新知识文档后运行：

```bash
uv run python -m rag.ingest
```

## 检索与 Prompt 组合

`retrieve.py` 接收用户问题，使用相同的 Embedding 模型生成 Query Vector，再从 ChromaDB 中获取距离最近的文档。返回结果保留三个基本字段：

```python
@dataclass
class RetrievedDocument:
    content: str
    source: str
    distance: float | None
```

保留 `source` 和 `distance` 有助于调试：不仅能看到检索到了什么，还能追踪内容来自哪个文件，并比较不同查询的相关程度。

检索结果随后交给 `prompt_builder.py`，按照以下顺序组成最终 Prompt：

```text
固定的 Houdini 代码生成规则
  +
RAG 检索到的验证资料
  +
用户当前任务
```

固定规则仍然要求模型只返回可执行 Houdini Python、使用明确的节点变量和 `setInput()`、设置最终节点的 Display/Render Flag。RAG 内容只作为参考，用户当前请求仍然拥有更高优先级，避免知识示例中的参数覆盖实际任务。

## 最小检索测试

在重新接入 Houdini 之前，我先用一个程序化楼梯请求测试独立流程：

```text
Create a procedural staircase with 12 steps.
```

测试脚本只做三件事：检索一个相关文档、构建最终 Prompt、将结果打印出来。运行方式为：

```bash
uv run python -m rag.test_prompt
```

这一步已经能够从 `knowledge/staircase.md` 检索到楼梯相关资料，并将它放入最终 Prompt。虽然它还没有证明生成代码一定正确，但说明最小 RAG 数据链已经可以工作。

## 当前限制

目前的版本仍然只是验证概念：

- 每个 Markdown 暂时作为一个完整文档，没有进行 Chunking。
- 知识库只有少量手工整理的示例，覆盖范围非常有限。
- 相似度检索只能说明语义接近，不能保证示例中的 API 一定适用于当前任务。
- Houdini 仍然不应该直接加载 Torch、Sentence Transformers 和 ChromaDB 等较重依赖。
- RAG 可以减少模型幻觉，但不能替代执行前验证和错误反馈。

## 总结与下一步

这一阶段完成了两件事。首先，通过四组逐渐增加难度的任务，我确认了 Qwen2.5-Coder-7B 在 Houdini 节点连接和 API 准确性上的能力边界；其次，我搭建了一个可以导入知识、执行向量检索并组合 Prompt 的最小 RAG 流程。

下一步会把 RAG 包装成独立的本地 AI Service，由 Houdini 只通过 HTTP 提交任务。这样，Houdini 环境不需要安装机器学习和向量数据库依赖，同时也能把检索、代码生成、验证与未来的错误修复循环集中到服务端管理。
