---
title: "Houdini AI Agent 开发尝试：RAG 命中率与 Chunking"
date: 2026-08-13
summary: "整理三份楼梯 RAG 语料，测试格式统一、查询语义与 Chunking 对检索 Distance 的影响，并比较本地与云端模型的生成结果。"
tags: ["Houdini", "AI Agent", "RAG", "Chunking", "Retrieval", "Local LLM"]
draft: false
---

在[上一篇](/blog/houdini-ai-agent-rag-evaluation)中，本地模型和云端模型都成功召回了 `staircase.md`，并生成了基础楼梯。但仅凭这一份不到 200 行的资料，两种模型都无法生成正确的其他楼梯结构。

为了测试 RAG 检索的准确性，并探索 RAG 资料的内容规范，我开始增加案例、比较检索 Distance，并尝试对较长的螺旋楼梯案例进行 Chunking。

## 收集三份不同的楼梯资料

这次选择了三个不同的楼梯案例。相比“一份楼梯、一份桥梁”这类区别明显的资料，三个相近案例对检索准确性更有挑战，也更容易暴露问题。

第一份是之前使用的基础楼梯案例 `staircase.md`。

第二份是螺旋楼梯资料。它来自一个 [YouTube Tutorial](https://youtu.be/VcAOqu7LYW8?si=agYKOQHJW3uCsVjz) 的 `.hip` 工程文件。我使用 [Houdini-Agent](https://github.com/Kazama-Suichiku/Houdini-Agent) 读取场景，整理节点名称后输出 Python 文档，再经过人工测试。之后让 AI 按 RAG 语料的用途生成描述，并与代码整合进同一个 Markdown 文件。

第三份是带参数控制的楼梯资料，根据 SideFX 官方教程 [Sci-Fi Stair Generator](https://www.sidefx.com/tutorials/sci-fi-stair-generator/) 简化得到。

资料长度可以通过注入 RAG 后的 `prompt_tokens` 查看，也可以使用 llama.cpp Tokenizer 计算对应的 Token 数量。

## 测试未经规范化的 RAG 资料

测试 Prompt 为：

```text
Generate only executable Houdini Python code.
Do not use markdown code fences.

Create a spiral staircase.

Do not output markdown.
```

当 `top_k = 1` 时，Retriever 召回了 `staircase.md`，没有召回预期的螺旋楼梯资料。

把 `top_k` 调整为 3 后，三份文档的 Distance 为：

```text
staircase.md                         0.4739
procedural_staircase_code_rag.md     0.5122
scifi_stairs_simple_rag.md           0.6261
```

虽然螺旋楼梯资料的排名不是第一，模型最终生成的却是 Sci-Fi 案例。我的推测有两个：一是这个案例更适合直接执行；二是它排在 Context 的最后，离用户请求最近，可能存在位置优势。由于这不是当时测试的重点，我没有继续验证。

我了解到可以尝试在 Prompt Builder 中加入了顺序说明，引导模型优先使用排名靠前的资料：

```text
The references below are ordered from most relevant
to least relevant.
Prefer earlier references when multiple references conflict.
```

这次实验让我了解到，Reranker 可以在 Embedding Retrieval 后进一步分析相关性并重新排序。

> Retriever 判断哪些资料在语义上相关，Generator 判断哪些资料最值得模仿。这两个判断并不是同一件事。

因此，评估 RAG 时需要拆成两层：**Retrieval Quality** 用来判断拿回来的资料是否正确；**Context Utilization / Generation Quality** 用来判断模型最终使用了哪份资料。这次第三名资料被大量模仿，属于后者的问题，不只是 Embedding 检索问题。

## 统一 RAG 资料格式

接下来，我为资料使用统一结构：

```text
# Title

## Purpose
一句话说明这个案例解决什么问题。

## Relevant user requests
- ...

## Knowledge type
Type: Example
Asset: Staircase
Variant: ...

## Recommended pattern
简短描述核心节点或算法 Pattern。

## Key concepts
- ...

## Features
- ...

## Python code
...
```

同时删除部分节点布局代码，缩小资料体积。再次测试后，排序出现明显变化：

```text
procedural_staircase_code_rag.md     0.4541
staircase.md                         0.5020
scifi_stairs_simple_rag.md           0.5353
```

螺旋楼梯资料现在排在第一位。

## 长 RAG 案例对本地模型的影响

本地模型召回完整的螺旋楼梯案例后，输入和输出规模都超过一万 Token：

```text
prompt_tokens       = 12015
completion_tokens   = 10522
generation time     ≈ 98 s
```

Houdini 在执行时因报错退出，同时机器出现黑屏，怀疑与 llama.cpp 导致 GPU 负载过大有关。为防止模型生成过长，我在 `ask_model.py` 中设置了 `max_tokens`。

可以使用下面的命令实时查看 GPU 状态：

```bash
nvidia-smi -l 1
```

当时 llama.cpp 使用的相关参数为：

```text
n_ctx = 32768    # Context Size
-ngl 999         # 将所有层放到 GPU
```

## 云端模型测试完整案例

为了判断问题主要来自完整案例的 Context 设计，还是本地模型的 Context Utilization 能力，我保持其他内容不变，只把模型切换为 DeepSeek。

测试成功，Server 返回 `200 OK`。主要数据如下：

```text
prompt_tokens       = 8592
completion_tokens   = 9566
reasoning_tokens    = 2115
total_tokens        = 18158
finish_reason       = stop
HTTP                = 200 OK
```

![DeepSeek 使用完整螺旋楼梯案例生成的节点网络和模型](/assets/blog-houdini-agent-chunking-cloud-full-example.png)

完整案例可以被云端模型使用，但输入和输出仍然很长，因此我继续测试 Chunking。

## 将螺旋楼梯案例切分为三个 Chunk

我把原来的螺旋楼梯案例拆分成三部分：

```text
spiral_core.md
spiral_railing.md
spiral_baluster.md
```

第一次使用之前的完整 Prompt 与 DeepSeek 测试时，系统仍然召回了 `staircase.md`，并生成了基础楼梯的螺旋结构，而不是预期的 `spiral_core.md`。

![Chunking 后召回基础楼梯资料生成的螺旋结构](/assets/blog-houdini-agent-chunking-wrong-retrieval.png)

我在 `rag.test_prompt` 中直接输出所有文档的 Distance，得到：

```text
staircase.md                   0.5020
spiral_baluster.md             0.5139
scifi_stairs_simple_rag.md     0.5353
spiral_railing.md              0.5426
spiral_core.md                 0.5663
```

通过测试脚本，我发现命中错误的原因是 Prompt 中的代码生成规则污染了用于检索的语义任务。当查询只保留下面一句时：

```text
Create a spiral staircase.
```

就得到了正确排序：

```text
spiral_core.md                 0.2631
spiral_railing.md              0.2866
spiral_baluster.md             0.3040
scifi_stairs_simple_rag.md     0.3244
staircase.md                   0.4466
```

## Chunking 后的完整生成测试

### DeepSeek：`top_k = 1`

任务仍然是：

```text
Create a spiral staircase.
```

这次正确召回 `spiral_core.md`，Distance 为 `0.2719`：

```text
prompt_tokens       = 2639
completion_tokens   = 2350
reasoning_tokens    = 296
total_tokens        = 4989
finish_reason       = stop
```

生成结果包含螺旋楼梯的核心台阶与中心柱：

![DeepSeek 只召回 spiral_core Chunk 后生成的楼梯核心结构](/assets/blog-houdini-agent-chunking-cloud-top1.png)

### DeepSeek：`top_k = 3`

将 `top_k` 调整为 3，并把 `max_tokens` 设置为 20000 后，三个 Chunk 都被召回：

```text
spiral/spiral_core.md          0.2719
spiral/spiral_railing.md       0.2932
spiral/spiral_baluster.md      0.3115
```

生成数据为：

```text
prompt_tokens       = 8580
completion_tokens   = 11018
reasoning_tokens    = 3669
total_tokens        = 19598
finish_reason       = stop
```

模型生成了包含台阶、扶手与栏杆的完整结果，效果与未切分的完整案例相同：

![DeepSeek 召回三个螺旋楼梯 Chunk 后生成的完整模型](/assets/blog-houdini-agent-chunking-cloud-top3.png)

### DeepSeek：参数化楼梯任务

另一个测试 Prompt 为：

```text
Create a 5 step parameterized staircase.
```

当 `max_tokens = 6000` 时，模型超过输出限制并失败，返回：

```text
prompt_tokens       = 4278
completion_tokens   = 6000
reasoning_tokens    = 5190
total_tokens        = 10278
finish_reason       = length
```

## 本地模型测试

### Qwen：螺旋楼梯

本地 Qwen2.5-Coder-7B 的数据为：

```text
prompt_tokens       = 2411
completion_tokens   = 1135
total_tokens        = 3546
generation time     = 9.07 s
generation speed    = 125.15 Tokens/s
```

![本地 Qwen 运行螺旋楼梯 Chunk 测试的结果](/assets/blog-houdini-agent-chunking-local-spiral.png)

### Qwen：参数化楼梯

任务为：

```text
Create a 5 step parameterized staircase.
```

系统召回 `scifi_stairs_simple_rag.md`，Distance 为 `0.2879`，模型正常结束：

```text
prompt_tokens       = 4069
completion_tokens   = 2613
total_tokens        = 6682
generation time     = 21.49 s
generation speed    = 121.57 Tokens/s
finish_reason       = stop
```

![本地 Qwen 根据 Sci-Fi 楼梯资料生成的参数化楼梯结果](/assets/blog-houdini-agent-chunking-local-parameterized.png)

## 当前结果

目前有三个 RAG 案例，其中两个可以由本地模型复现；另一个案例可以由云端模型使用，完整案例和三个 Chunk 都生成成功。

这次测试也确认了：查询中混入代码生成规则会影响 Retrieval Distance；切分后的 Chunk 可以分别命中核心、扶手和栏杆资料；`top_k` 与 `max_tokens` 会直接影响最终召回内容和生成是否完整。
