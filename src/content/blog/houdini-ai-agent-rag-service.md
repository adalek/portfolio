---
title: "Houdini AI Agent 开发尝试：把 RAG 包装成本地服务"
date: 2026-07-31
summary: "重构代码并用 FastAPI 隔离 Houdini 与 RAG 的 Python 环境，通过 Copy to Points 和程序化楼梯实验比较有无 RAG 的生成效果。"
tags: ["Houdini", "AI Agent", "RAG", "FastAPI", "Python", "Local LLM"]
draft: false
---

在[上一篇](/blog/houdini-ai-agent-rag-foundation)中，我搭建了一个最小 RAG 流程：读取 Houdini 知识文档、写入 ChromaDB、检索相关内容，再把结果组合进模型 Prompt。下一步的问题是，如何把这套流程真正接回 Houdini。

直接在 Houdini 中导入 RAG 模块并不理想。Houdini 使用自己的 Python 3.11 环境，而 Sentence Transformers、ChromaDB 等依赖安装在项目的 uv 虚拟环境中。为了隔离两个 Python 环境，我将 RAG 包装成一个本地 HTTP 服务：Houdini 只负责发送 Prompt、接收代码和执行结果。

## 先重构代码职责

此前，模型请求和代码清理分别散落在测试脚本与 Houdini 入口中。随着 RAG 加入，继续把逻辑堆在同一个文件里会越来越难测试。因此，我先按职责重新组织项目：

```text
MasterProject/
├─ src/
│  ├─ ask_model.py
│  ├─ clean_code.py
│  ├─ generate.py
│  ├─ generate_with_rag.py
│  ├─ rag_server.py
│  └─ houdini_run_llm.py
├─ rag/
│  ├─ config.py
│  ├─ ingest.py
│  ├─ retrieve.py
│  └─ prompt_builder.py
├─ knowledge/
├─ prompts/
├─ benchmark/
├─ scripts/
└─ tests/
```

新的分层可以概括为：

- **Utility**：`ask_model.py` 和 `clean_code.py` 只提供单一功能。
- **Service**：`generate.py` 与 `generate_with_rag.py` 组合请求、检索和清理流程。
- **Entry Point**：命令行、HTTP Server 和 Houdini Shelf Tool 调用 Service。

模块统一采用 Package Import，例如：

```python
from src.ask_model import ask_model
from src.clean_code import clean_code
from rag.retrieve import retrieve
from rag.prompt_builder import build_prompt
```

这样可以用相同 Prompt 分别运行普通生成器与 RAG 生成器，为之后的对照测试保留清晰入口：

```bash
uv run python -m src.generate
uv run python -m src.generate_with_rag
```

## 两个 Python 环境的问题

如果 Houdini 直接调用普通的 `generate()`，只要代码没有依赖第三方库，就可以成功生成节点。改为 `generate_with_rag()` 后，Houdini 的 Python 环境却无法找到 `chromadb` 等安装在 `.venv` 中的模块。

理论上可以继续修改 `sys.path`，甚至把依赖装进 Houdini，但这会让 DCC 环境和机器学习环境紧密耦合，也更难复现和维护。

因此我选择了更清晰的进程边界：

```text
Houdini / Python 3.11 / hou
  ↓ HTTP + JSON
FastAPI + Uvicorn / uv .venv
  ├─ Sentence Transformers
  ├─ ChromaDB
  ├─ Prompt Builder
  └─ Model Client
  ↓ OpenAI-compatible API
llama.cpp / Qwen2.5-Coder-7B
```

Houdini 不再导入项目中的 RAG Package；它只需要 Python 标准库和 `hou`。

## 用 FastAPI 建立本地 RAG Server

首先在项目环境中加入服务依赖：

```bash
uv add fastapi uvicorn
```

服务只暴露两个接口：

- `GET /health`：确认 RAG Server 是否运行。
- `POST /generate`：接收 `prompt` 与 `top_k`，返回清理后的 Houdini Python。

请求与响应保持最小结构：

```json
{
  "prompt": "Create a procedural staircase with 12 steps.",
  "top_k": 1
}
```

```json
{
  "code": "import hou\n..."
}
```

`/generate` 内部依次执行检索、Prompt 构建、模型请求与代码清理。如果生成结果为空或中间发生异常，Server 会返回明确的 HTTP 错误，而不是让 Houdini 静默失败。

启动服务：

```bash
uv run uvicorn src.rag_server:app \
  --host 127.0.0.1 \
  --port 8000
```

健康检查：

```bash
curl http://127.0.0.1:8000/health
# {"status":"ok"}
```

## Houdini 端只保留轻量客户端

`houdini_run_llm.py` 不再直接调用 `generate_with_rag()`，而是读取 Prompt 文件，并向 `http://127.0.0.1:8000/generate` 发送 JSON 请求。

客户端使用 Python 标准库 `urllib`，因此 Houdini 不需要额外安装 `requests`。收到结果后，它会确认 `code` 是非空字符串，并在执行前扫描一组暂时禁止的高风险关键词，例如：

```python
blocked_words = [
    "subprocess",
    "os.system",
    "shutil",
    "deleteItems",
]
```

这只是第一层非常粗略的保护，不能当作完整沙箱。它的意义是先建立明确的执行关口，为之后加入 AST 检查、节点操作白名单和人工确认预留位置。

Shelf Tool 仍然只负责读取并执行 Houdini 入口文件，不需要了解 RAG、Embedding 或模型请求的内部实现。

## 实验一：Copy to Points

我先重新测试之前容易失败的 Copy to Points Prompt，并分别运行普通生成版本和 RAG 版本。

### 没有 RAG

普通模型能够创建 Grid、Scatter、Box 和 Copy to Points 节点，网络连接也接近目标，但最终视口只显示了 Grid，说明显示节点或数据流仍然不正确。

![没有 RAG 时生成的 Copy to Points 节点网络](/assets/blog-houdini-agent-service-copy-no-rag.png)

### 使用 RAG

当时知识库中只有一篇程序化楼梯案例，但其中包含经过验证的 Copy to Points 连接模式。检索加入后，模型正确连接了节点，并在视口中生成了复制结果。

![使用 RAG 后成功生成的 Copy to Points 结果](/assets/blog-houdini-agent-service-copy-rag.png)

这个结果说明，即使检索文档与当前任务不是完全相同的成品，只要包含可复用的 Houdini 节点模式，也可能帮助小模型避免连接顺序和显示标记错误。

## 实验二：程序化楼梯

第二个实验直接对应知识库中的 `staircase.md`。Prompt 要求生成一个五级程序化楼梯，并允许之后调整台阶数量。

```text
Create a 5 step procedural staircase in Houdini
using repeated geometry.
```

### 第一次 RAG 测试仍然失败

第一次使用 RAG 时，模型返回了看似完整的代码，但 Houdini 没有生成节点。问题来自知识文档本身：它保留了 `__main__` 入口，而 Houdini 的 `exec()` 场景没有按预期触发这个入口。

这次失败很重要，因为它说明 RAG 的质量上限取决于知识库质量。检索到“相关代码”并不等于检索到“适合当前执行环境的代码”。

我删除了知识示例中的 `__main__` 入口，并重新导入数据库：

```bash
uv run python -m rag.ingest
```

再次测试后，模型成功生成了由 Box、Attribute Wrangle、Copy to Points、Grid 和 Merge 组成的节点网络：

![RAG 修正后生成的五级程序化楼梯节点网络](/assets/blog-houdini-agent-service-staircase-rag.png)

视口中的五级楼梯也符合 Prompt 要求，说明检索内容不仅帮助模型使用了正确节点，还保留了可调整的级数参数。

### 无 RAG 对照组

相同任务在不使用 RAG 时执行失败。模型虚构了 `polybox` SOP，并错误设置了 Attribute Wrangle 参数、Copy to Points 输入和最终渲染节点。

![无 RAG 时楼梯任务因无效节点类型执行失败](/assets/blog-houdini-agent-service-staircase-error.png)

相比之下，RAG 版本生成并成功执行了完整楼梯：

![RAG 版本成功生成的程序化楼梯](/assets/blog-houdini-agent-service-staircase-result.png)

## 有无 RAG 的结果对比

这次实验记录的数据如下：

| 指标 | 无 RAG | 有 RAG |
| --- | --- | --- |
| 检索案例 | 无 | `staircase.md` |
| Prompt Tokens | 64 | 1551 |
| Completion Tokens | 418 | 985 |
| Total Tokens | 482 | 2536 |
| 生成时间 | 3.18 秒 | 7.82 秒 |
| 节点类型正确 | 否 | 是 |
| Wrangle 参数正确 | 否 | 是 |
| Copy to Points 输入正确 | 否 | 是 |
| 最终显示节点正确 | 否 | 是 |
| Houdini 执行成功 | 否 | 是 |

RAG 版本的 Prompt 约为无 RAG 的 24 倍，总生成耗时也从 3.18 秒增加到 7.82 秒。代价很明显，但在这个单次实验中，它把结果从“无法执行”提升到了“成功生成”。

这还不足以证明 RAG 在所有任务上都更好：当前知识库只有一个高度相关的案例，样本量也很小。但它验证了架构与实验方法，可以继续扩展为更系统的 Benchmark。

## 简化启动流程

现在系统包含 llama.cpp Server、RAG Server 和 Houdini 三部分。为了避免反复输入长命令，我增加了两个脚本：

```bash
./scripts/start_qwen.sh
./scripts/start_rag.sh
```

知识库更新时则运行：

```bash
./scripts/rebuild_rag.sh
```

脚本首次使用前需要添加执行权限：

```bash
chmod +x scripts/start_rag.sh scripts/rebuild_rag.sh
```

最终工作顺序变成：启动 Qwen、启动 RAG Server、打开 Houdini、点击 Shelf Tool。

## 修改后需要重启什么？

不同模块的更新范围现在更加清晰：

| 修改内容 | 重新 Ingest | 重启 RAG Server | 重启 Qwen Server |
| --- | --- | --- | --- |
| `knowledge/*.md` | 需要 | 一般不用 | 不用 |
| `rag/*.py` | 通常不用 | 需要 | 不用 |
| `generate_with_rag.py` / `rag_server.py` | 不用 | 需要 | 不用 |
| `prompts/*.md` | 不用 | 不用 | 不用 |
| `ask_model.py` | 不用 | 需要 | 不用 |
| 模型或 llama.cpp 参数 | 不用 | 不用 | 需要 |

这种分离让调试范围更容易判断，也为之后在不同机器或系统平台上配置项目暴露了两个仍需解决的问题：路径不应硬编码，Shell Script 和执行权限也需要跨平台处理。

## 总结与下一步

这一阶段将最小 RAG 从独立脚本推进成了 Houdini 可以实际调用的本地服务。FastAPI 隔离了 Houdini 与机器学习依赖，统一的生成入口让有无 RAG 的结果可以直接比较，程序化楼梯实验也第一次给出了量化对照。

更重要的发现是：RAG 并不会自动让代码可靠。第一版楼梯知识中的 `__main__` 问题被模型继承，说明知识文档本身必须经过执行环境验证，并记录适用范围。

下一步会扩充 Houdini 知识库，研究如何从 Houdini Code Explorer 等资料中整理可验证语料，并建立覆盖更多节点任务的 Benchmark。Houdini 端也计划加入简单 GUI，用于输入 Prompt、显示检索来源、预览代码，并在执行前让用户确认。
