---
title: "Houdini AI Agent 开发尝试：跑通 Python 到 Houdini"
date: 2026-07-23
summary: "承接本地模型环境搭建，使用 Python 调用 llama.cpp API、清理模型返回的代码，并通过 Houdini Shelf Tool 完成首次节点生成。"
tags: ["Houdini", "AI Agent", "Python", "llama.cpp", "Local LLM"]
draft: false
---

在[上一篇](/blog/houdini-ai-agent-environment-setup)中，我使用 llama.cpp 在本地运行了 Qwen2.5-Coder，并通过 HTTP API 获得了模型返回。这次的目标是继续向前一步：让 Python 向模型发送 Houdini 任务，将返回的代码交给 Houdini 执行，并把整个过程放进一个可以一键启动的 Shelf Tool。

目前跑通的最小流程是：

```text
自然语言 Prompt
  ↓
Python 调用本地 LLM API
  ↓
提取并清理 Houdini Python 代码
  ↓
Houdini 执行代码
  ↓
创建节点
```

## 简化模型启动流程

模型文件的路径很长，每次手动输入完整的 `llama-server` 命令会产生大量重复操作。为此，我先编写了一个 Shell Script，把模型路径和启动参数集中管理：

```bash
#!/bin/bash

MODEL="/transfer/huggingface/hub/models--unsloth--Qwen2.5-Coder-7B-Instruct-GGUF/snapshots/0ecf11859560b2bf42e703207f9371186d02245f/Qwen2.5-Coder-7B-Instruct-Q4_K_M.gguf"

# 也可以在这里切换其他模型：
# MODEL="/transfer/huggingface/hub/models--unsloth--Qwen3-8B-GGUF/snapshots/a6adef130ffb23ddaf1a62fec9dced968c9bc482/Qwen3-8B-UD-Q4_K_XL.gguf"

llama-server \
  --api-key 12345 \
  -c 0 \
  -ngl 999 \
  -m "$MODEL"
```

保存为 `start_qwen.sh` 后，为脚本添加执行权限：

```bash
chmod +x /home/s5803453/Desktop/MasterProject/scripts/start_qwen.sh
```

再将脚本目录加入 `~/.zshrc`：

```bash
export PATH=/home/s5803453/Desktop/MasterProject/scripts:$PATH
```

重新载入 shell 配置后，就可以直接运行：

```bash
start_qwen.sh
```

这样既缩短了启动命令，也方便以后切换模型或调整推理参数。如果使用 `&` 将 Server 放到后台运行，还需要额外管理进程；后续可以补充一个 `stop_server.sh`，避免遗留多个服务实例。

## 通过 Python 请求本地模型

上一篇使用 `curl` 验证了 API，这次将请求逻辑整理成一个可以被其他脚本复用的 Python 函数。`test_llm_request.py` 的最小版本如下：

```python
#!/usr/bin/env python3

import json
import requests

API_URL = "http://127.0.0.1:8080/v1/chat/completions"
API_KEY = "12345"


def ask_model(prompt: str) -> str:
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": "Qwen2.5-Coder-7B-Instruct-Q4_K_M.gguf",
        "messages": [
            {
                "role": "system",
                "content": "You are a Houdini Python assistant. Output only code.",
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        "temperature": 0.1,
    }

    response = requests.post(
        API_URL,
        headers=headers,
        json=payload,
        timeout=120,
    )
    response.raise_for_status()

    data = response.json()

    print("Full JSON response:")
    print(json.dumps(data, indent=2))

    return data["choices"][0]["message"]["content"]


if __name__ == "__main__":
    prompt = "Generate Houdini Python code that creates a box node under /obj."
    result = ask_model(prompt)

    print("\nModel content:")
    print(result)
```

![Python 脚本打印出的完整 JSON 响应与模型生成代码](/assets/blog-houdini-agent-python-response.png)

返回的 JSON 中，当前最关心的是以下字段：

- `choices`：模型生成的候选结果列表。
- `message`：一次对话响应中的消息对象。
- `content`：模型真正生成的文本，也就是之后需要执行的代码。
- `usage`：本次请求使用的 Prompt、Completion 和总 Token 数。
- `model`：实际处理请求的模型名称。

`ask_model()` 最终只返回 `content`，这样 Houdini 端不需要理解完整的 API 响应结构。

## 在 Houdini 中执行生成代码

接下来编写 `houdini_run_llm.py`，把请求和执行连接起来：

```python
import sys
import hou

PROJECT_PYTHON_PATH = "/home/s5803453/Desktop/MasterProject/src"

if PROJECT_PYTHON_PATH not in sys.path:
    sys.path.append(PROJECT_PYTHON_PATH)

from test_llm_request import ask_model


def clean_code(text: str) -> str:
    text = text.strip()

    if text.startswith("```python"):
        text = text[len("```python"):].strip()
    elif text.startswith("```"):
        text = text[len("```"):].strip()

    if text.endswith("```"):
        text = text[:-3].strip()

    return text


prompt = """
Generate only executable Houdini Python code.
Do not use markdown code fences.

Create:
- one geometry node under /obj
- one box node inside it
- layout the nodes
"""

code = ask_model(prompt)

print("Raw code:")
print(code)

code = clean_code(code)

print("Cleaned code:")
print(code)

exec(code, {"hou": hou})
```

在 Houdini Python Shell 中，可以先用下面的命令直接测试：

```python
exec(
    open(
        "/home/s5803453/Desktop/MasterProject/src/houdini_run_llm.py"
    ).read()
)
```

### 为什么仍然需要 `clean_code()`？

即使 System Prompt 和 User Prompt 都明确要求“只输出代码”，模型有时仍然会在结果外层添加 Markdown 代码围栏，例如：

````text
```python
import hou
...
```
````

这些标记不是合法的 Python 代码，直接传入 `exec()` 会导致语法错误。`clean_code()` 是目前最小的容错处理，用于移除开头和结尾的代码围栏。

不过，它只能处理格式问题，不能保证代码本身正确。直接执行模型输出也有明显风险；后续需要加入语法检查、Houdini API 白名单或受控执行机制，而不能一直依赖裸 `exec()`。

## 用 Houdini Shelf Tool 一键运行

每次在 Python Shell 中粘贴执行命令仍然比较麻烦。因此，我在 Houdini Shelf 上右键选择 **Add Tool**，新建了一个 `Run LLM` 工具，并让它读取外部 Python 文件：

```python
import traceback

script_path = "/home/s5803453/Desktop/MasterProject/src/houdini_run_llm.py"

try:
    with open(script_path, "r", encoding="utf-8") as f:
        code = f.read()

    exec(code)
except Exception:
    traceback.print_exc()
```

![在 Houdini 中配置 Run LLM Shelf Tool](/assets/blog-houdini-agent-shelf-tool.png)

Shelf Tool 本身只负责加载和执行脚本。实际请求逻辑仍保存在项目文件中，因此修改代码后不需要反复编辑 Houdini 工具。

点击 `Run LLM` 后，模型成功返回了 Houdini Python，并在场景中创建出 Geometry Container 和 Box SOP：

![从 Shelf Tool 调用本地模型并在 Houdini 中生成 Box 节点](/assets/blog-houdini-agent-box-result.png)

## 第一次结果：流程跑通，但代码仍会出错

这次测试证明了完整链路可以工作：Shelf Tool 能够调用外部脚本，Python 能够请求本地模型，模型能够生成 Houdini 代码，Houdini 也确实创建出了 Box 节点。

但截图中同时出现了一个值得保留的错误：

```text
AttributeError: 'SopNode' object has no attribute 'setPos'
```

也就是说，模型生成的节点创建代码可以执行，但随后调用了不存在的 Houdini Python API。最终结果不是“稳定生成”，而是“部分成功”：节点已经出现，脚本却没有完整执行结束。

这个问题也暴露了当前方案的核心限制：

- 模型知道大致的 Houdini 节点创建流程，但不一定准确记得每一个 API。
- Prompt 约束可以改善输出格式，却不能验证方法是否真实存在。
- 代码围栏清理只能解决文本格式，不能解决 API 幻觉。
- `exec()` 前需要增加检查、修复或重试步骤。

## 总结与下一步

这次完成了从自然语言 Prompt 到 Houdini 节点生成的第一条端到端链路：

```text
Shelf Tool
  ↓
Python Request
  ↓
Local Qwen Server
  ↓
Generated Houdini Python
  ↓
Houdini Node
```

和上一篇相比，系统已经从“能与模型对话”推进到“能让模型影响 Houdini 场景”。但 `setPos` 报错说明，下一阶段的重点不能只是生成更多代码，而应该是让代码变得可验证、可修复和可控。

下一步我会尝试为模型补充更准确的 Houdini API 上下文，并在执行前增加验证流程；如果代码运行失败，也可以把报错返回给模型，让它根据错误信息修正代码，逐步形成最基础的反馈循环。
