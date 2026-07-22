---
title: "Houdini AI Agent 开发尝试：环境搭建"
date: 2026-07-22
summary: "从零搭建 Houdini AI Agent 的本地开发环境：使用 llama.cpp 运行 Qwen2.5-Coder，并通过 Server 与 HTTP API 完成首次调用。"
tags: ["Houdini", "AI Agent", "llama.cpp", "Qwen", "Local LLM"]
draft: false
---

## 项目动机

最近出现了越来越多的 MCP 和 Agent 项目，但我对大语言模型的了解还很有限。因此，我想借毕业设计的机会，从零搭建一个简单的 Agent 工作流——即使它最终不一定是一个完整的 Agent 系统。

毕业设计的目标是：输入自然语言，生成某一类型、且具有可控参数的 Houdini 模型。具体如何实现，目前还没有最终答案；我希望在开发过程中逐步探索建筑生成的约束条件、RAG、Skills、循环工作流和 LoRA 等概念。

目前设想的流程是：

```text
GPT 语义分析
  ↓ 输出 JSON
本地 Qwen Server
  ↓ 生成 Houdini Python
Houdini Python Panel / Shelf Tool / MCP Server
  ↓
在 Houdini 中执行代码
```

## 如何开始

我参考了老师 Jon Macey 的 Agent 开发博客，在实验室电脑上进行了初始环境测试。使用的设备是一台联想工作站：Intel Core i7-13700、64 GB 内存、NVIDIA GeForce RTX 4080 16 GB 显卡，以及 Red Hat Linux 系统。

### llama.cpp

实验室电脑已经安装了 llama.cpp。它是流行的本地大语言模型推理框架之一，可以在个人电脑上运行 Qwen、Llama 和 DeepSeek 等模型。它使用 C/C++ 编写，重点是高性能和较低的资源占用。

关于使用 llama.cpp 运行模型，我参考了 [IBM 的介绍视频](https://youtu.be/P8m5eHAyrFM?si=BNJHy5GYhhS4g-mY)。首先检查命令行工具与 Server 是否可用：

```bash
which llama-server
which llama-cli
llama-server --help
llama-cli --help
```

### 设置环境变量 PATH

最开始 zsh 无法找到 `llama-cli`，因此需要将安装目录添加到 `PATH`。在 `~/.zshrc` 中加入：

```bash
export PATH=/public/devel/25-26/llama.cpp/bin:$PATH
```

然后重新载入配置：

```bash
source ~/.zshrc
```

此外，由于账户的默认磁盘是联网存储，不方便进行大量数据传输，我也将 Hugging Face 的模型下载目录改到本地指定位置：

```bash
export HF_HOME=/transfer/huggingface
```

可以用下面的命令确认路径：

```bash
echo $HF_HOME
# /transfer/huggingface
```

这些环境变量会在每次打开 zsh 时从 `~/.zshrc` 自动读取。

## 下载模型

这次使用的是 Hugging Face 上的 `Qwen2.5-Coder-7B-Instruct-GGUF`：

![Hugging Face 上的 Qwen2.5-Coder-7B-Instruct-GGUF 模型页面](/assets/blog-houdini-agent-model.png)

```bash
llama-cli -hf unsloth/Qwen2.5-Coder-7B-Instruct-GGUF
```

下载完成后，可以查找本地的 GGUF 模型文件：

```bash
find /transfer/huggingface -name "*.gguf"

# /transfer/huggingface/hub/models--unsloth--Qwen2.5-Coder-7B-Instruct-GGUF/
# snapshots/0ecf11859560b2bf42e703207f9371186d02245f/
# Qwen2.5-Coder-7B-Instruct-Q4_K_M.gguf
```

## 启动模型

### Interactive Mode

先使用 `llama-cli` 在终端中启动交互模式：

```bash
llama-cli \
  -m "/transfer/huggingface/hub/models--unsloth--Qwen2.5-Coder-7B-Instruct-GGUF/snapshots/0ecf11859560b2bf42e703207f9371186d02245f/Qwen2.5-Coder-7B-Instruct-Q4_K_M.gguf"
```

![通过 llama-cli 与本地 Qwen 模型对话](/assets/blog-houdini-agent-cli.png)

### Server Mode

接下来启动本地 Server：

```bash
llama-server \
  --api-key 12345 \
  -c 0 \
  -ngl 999 \
  -m /transfer/huggingface/hub/models--unsloth--Qwen2.5-Coder-7B-Instruct-GGUF/snapshots/0ecf11859560b2bf42e703207f9371186d02245f/Qwen2.5-Coder-7B-Instruct-Q4_K_M.gguf
```

参数说明：

- `-m`：指定模型文件路径。
- `-c 0`：使用模型支持的最大上下文长度。
- `-ngl 999`：尽可能将模型层卸载到 RTX 4080 GPU 上运行。
- `--api-key 12345`：设置供 Zed 或其他客户端连接使用的 API Key。

启动后，可以打开 Server 提供的网页对话界面，输入刚才设置的 API Key 开始对话。

![llama.cpp Server 启动后的终端输出](/assets/blog-houdini-agent-server.png)

![llama.cpp 的本地网页对话界面](/assets/blog-houdini-agent-chat.png)

### 通过 curl 发送 HTTP 请求

Server 启动后，在另一个终端窗口中发送请求：

```bash
curl http://127.0.0.1:8080/v1/chat/completions \
  -H "Authorization: Bearer 12345" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Hello"
      }
    ]
  }'
```

请求成功后，Server 会以 JSON 形式返回模型生成的内容：

![使用 curl 调用本地模型后返回的 JSON 响应](/assets/blog-houdini-agent-curl.png)

## 总结与下一步

这次测试完成了最基础的一步：使用 llama.cpp 在本地运行 Qwen2.5-Coder 模型，并分别通过命令行、网页界面和 HTTP API 获得模型返回。

下一步，我会在 Python 脚本中实现与本地模型的通信，让它生成能够在 Houdini Python Shell 中运行的代码，并继续探索如何让生成过程更加稳定、可控。
