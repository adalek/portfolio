---
title: "Houdini AI Agent 开发尝试：测试 RAG 的泛化边界"
date: 2026-08-05
summary: "用直线与螺旋楼梯任务测试单一 RAG 语料的泛化能力，对比云端与本地模型，并重新思考 Houdini AI 工具的评估标准。"
tags: ["Houdini", "AI Agent", "RAG", "Evaluation", "PCG", "Local LLM"]
draft: false
---

在[上一篇](/blog/houdini-ai-agent-rag-service)中，我把 RAG 包装成了独立的本地 HTTP 服务，并用程序化楼梯验证了有无 RAG 的差异。那次实验中，知识库只有一篇 `staircase.md`，而测试任务与案例非常接近，因此成功并不意外。

这次我想继续追问：同一份楼梯知识能支持多大的任务变化？模型可以修改台阶数量，但它能否从直线楼梯推广到螺旋楼梯？当 Prompt 中加入更明确的数学和 VEX 规则后，结果又会如何？

## 用一份语料测试不同楼梯任务

当前知识库仍然只有一篇经过 Houdini 验证的直线楼梯案例。我依次测试了三个不同层级的 Prompt。

### Exp 05：改变直线楼梯的级数

第一个任务只把案例中的台阶数改为 12：

```text
Create a 12 step procedural staircase in Houdini
using repeated geometry.
```

模型成功复用了知识文档中的 Box、Attribute Wrangle 和 Copy to Points 结构，并把参数改成了 12 级。

![RAG 根据直线楼梯知识生成十二级楼梯](/assets/blog-houdini-agent-eval-straight-staircase.png)

这个结果说明，模型可以在案例结构不变时替换明确参数。但这更接近“基于案例修改”，还不能证明它理解了楼梯生成的一般规则。

### Exp 06：只要求生成螺旋楼梯

第二个 Prompt 非常简短：

```text
Create a spiral staircase.
```

模型尝试把台阶分布到圆周上，但生成的 VEX 把圆周率常量写成了小写 `pi`，导致编译失败。修正这一处细节后，能够得到螺旋结构：

![修正圆周率常量后生成的螺旋楼梯](/assets/blog-houdini-agent-eval-spiral-corrected.png)

模型抓住了“沿角度旋转并抬高”的基本思路，却在 VEX 语言细节上失败。这与之前的 Houdini Python API 幻觉相似：高层结构可能正确，真正阻断执行的往往是一个方法名、常量或参数类型。

### Exp 08：在 Prompt 中补充径向分布规则

第三个任务把空间分布和四元数规则直接写入 Prompt。要求创建 20 个圆周点，按点编号计算角度与高度，并用 `orient` 控制每一级台阶的切线朝向。

其中最关键的约束是：

```text
Use radians(), sin(), cos() and quaternion().
Do not use pi or PI constants.

quaternion() returns vector4, not vector.
Use quaternion(angle_in_radians, rotation_axis).
Store orientation as a point attribute named orient.
```

没有 RAG 时，这个任务直接失败；加入 RAG 和详细规则后，模型能够建立节点网络并生成沿曲线分布的台阶：

![加入径向分布与 Quaternion 规则后的楼梯实验](/assets/blog-houdini-agent-eval-spiral-guided.png)

不过，结果距离稳定可用的螺旋楼梯仍有差距。几何出现不连续和局部方向异常，说明“代码能够执行”与“形状符合设计意图”是两个不同的评估层级。

## 单一案例的能力边界

这组三个实验给出了一个更准确的阶段性结论：

- 单一直线楼梯案例足以帮助模型复现相同节点结构，并修改台阶数量。
- 当任务变化为螺旋结构时，案例中的 Copy to Points Pattern 仍然有用，但缺少径向分布和方向控制知识。
- Prompt 可以临时补充缺失的 VEX 规则，却会变长，也容易把开发者重新带回“手工编写解决方案”的状态。
- 更高层的泛化需要在知识库中补充参数引用、圆周分布、Quaternion 和可验证的螺旋楼梯 Pattern。

换句话说，RAG 并没有把一个案例自动转化成通用技能。它更像是把局部、可信的实现片段交给模型；能否组合成新结构，仍取决于模型能力和检索内容的覆盖范围。

## 云端模型与本地模型对比

我还使用相同的 RAG 流程和螺旋楼梯任务，对比了云端 DeepSeek-V4-Flash 与本地 Qwen2.5-Coder-7B Q4_K_M。

本地 Qwen 能够创建 Box、Attribute Wrangle 和 Copy to Points 网络，但 VEX 使用了错误常量，最终没有输出几何：

![本地 Qwen 生成节点网络但 VEX 编译失败](/assets/blog-houdini-agent-eval-qwen-error.png)

修正 VEX 细节后，可以检查模型生成的径向点位与参数：

![本地模型生成的螺旋分布 VEX 与错误节点状态](/assets/blog-houdini-agent-eval-qwen-vex.png)

两种模型的单次实验数据如下：

| 项目 | DeepSeek-V4-Flash | Qwen2.5-Coder-7B Q4_K_M |
| --- | --- | --- |
| 部署方式 | 云端 API | 本地 llama.cpp |
| 使用 RAG | 是 | 是 |
| Prompt Tokens | 1632 | 1547 |
| Completion Tokens | 6065 | 1027 |
| Reasoning Tokens | 5290 | 未提供 |
| Total Tokens | 7697 | 2574 |
| 生成时间 | 未记录 | 8.07 秒 |
| 推理速度 | 未记录 | 127.2 Tokens/s |
| 节点网络生成 | 成功 | 成功 |
| Houdini API | 正确 | 正确 |
| Python 语法 | 正确 | 正确 |
| VEX 编译 | 成功 | 失败：`pi` 常量 |
| 最终几何 | 已生成，但形状错误 | 未生成 |
| 主要问题 | 几何逻辑 | VEX 语法/API 细节 |
| 成本形式 | 云端 Token 计费 | 本地 GPU 推理 |

云端模型生成了更长的回答，也通过了语法与 VEX 编译，但最终形状仍然不正确。本地模型输出更短、速度可测，却因为一个 VEX 细节无法执行。

这说明模型大小和代码可执行性都不能单独代表任务成功。较强模型可能写出完全合法但几何逻辑错误的代码；较小模型可能理解结构，却在语言细节上失败。

而且这只是一次探索性对比，并非严格 Benchmark。后续需要固定 Prompt、RAG 内容、温度、随机种子和重复次数，才能比较模型的成功率、稳定性与成本。

## 对于做 AI 应用的疑问

实验进行到这里，我对开发 AI Agent 的功能和效率有很多未经验证的疑问。首先从项目的目的出发，AI 在工作流中究竟起到什么作用，能够优化传统 PCG 上下游的哪些工作？

我的想法是，大模型善于理解人的意图，开发者所做的是帮助模型更好地执行这些意图。比如想要做一个维多利亚风格的建筑，AI 可以理解该搭建哪些模块、设置什么样的参数、自动选用螺旋楼梯等。

另一个层面，AI 助手可以代替 GUI，省略人的学习成本。从前需要手动调整、反复测试 PCG 模型参数时，人需要记住参数的含义；但现在 AI 理解目的后可以自动测试，人作为审核，跟 Codex 的逻辑一致。

但这也只是一个美好的畅想。在实践过程中，稳定性、效率、成本都需要不断验证，才能达到真正有价值的 AI 应用。

我还有很多待验证的问题：Prompt、知识库、Skills 分别负责哪些部分？知识库的内容如何分类，怎样确保没有冗杂的语料，何时需要 Chunking？`top_k` 等参数配置需要和不同模型相配；更大的模型本身是否不需要额外的知识 Context？Repair Loop 如何让系统自主沉淀知识？以及在真正的生产中，Token、时间和试错成本应该如何量化测试？

下一步，我希望通过引入有更多细节的螺旋楼梯案例，让模型得到更好的效果。我还希望模型学会设置参数控制节点。
