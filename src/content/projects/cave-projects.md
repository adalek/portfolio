---
title: "Tech Art 2026"
year: 2026
category: "Technical Art"
summary: "2026 年技术美术项目合集：程序化环境、Houdini 工具、实时图形与制作管线。"
role: ["Technical Artist", "Environment & Pipeline Director", "Tool Developer"]
tools: ["Houdini", "Unreal Engine 5", "Maya", "PyMEL"]
cover: "/assets/tech-art-2026-houdini-garden-cover.png"
background: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExcmR0azZlZW1rbjh6aGkyaHB0bDA1bXpneGlqb3N3cWtlazAzcHg1bCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/4XjJJnDaKt0wXNXKFI/giphy.gif"
featured: true
order: 1
media: []
---

## 项目索引

这一页不再平铺报告，而是作为 Tech Art 2026 的项目入口。以下介绍与技术要点均根据现有报告整理；点击项目可查看完整拆解、视频与原始报告。

### [Broken Horizons →](/work/tech-art-broken-horizons)

[![Broken Horizons 中的 Roy Dog 石雕场景](/assets/broken-horizons-cover-v2.jpeg)](/work/tech-art-broken-horizons)

团队在 Unreal Engine 5 中重建 Tout Quarry Sculpture Park 的 “Circle of Stones” 区域。我负责环境与管线方向、场景工作及工具开发。

### [Houdini AI Agent（进行中）→](/work/tech-art-houdini-ai-agent)

[![Houdini AI Agent 生成的程序化楼梯](/assets/blog-houdini-agent-service-staircase-result.png)](/work/tech-art-houdini-ai-agent)

正在进行的硕士毕业设计，使用本地 Qwen、云端 DeepSeek、RAG 与 FastAPI 探索可控的 Houdini 程序化建模工作流，目前已完成带检索信息、代码预览和人工执行确认的 PySide6 MVP。

### [Houdini Garden Builder →](/work/tech-art-houdini-garden)

[![Houdini Garden Builder 最终效果](/assets/tech-art-2026-houdini-garden-cover.png)](/work/tech-art-houdini-garden)

面向艺术家的 Houdini Digital Asset，可生成花园形状、道路、围栏、草地，并散布花朵和树木等自定义资产。

### [Rendering a Coca-Cola Can with RenderMan →](/work/tech-art-renderman-coke)

[![RenderMan 可口可乐罐产品渲染](/assets/renderman-coke-cover.png)](/work/tech-art-renderman-coke)

使用 RenderMan 26.3 与 Python API 完成的产品渲染练习，覆盖混合建模、PxrSurface 材质、纹理与凹凸映射、OSL 表面变化、HDRI 灯光和景深。

### [Local 3D Asset Database →](/work/tech-art-asset-database)

[![Local 3D Asset Database 浏览界面](/assets/asset-database-cover.png)](/work/tech-art-asset-database)

使用 Flask 与 SQLite 构建的本地三维资产管理工具，可上传、整理、搜索、标记、预览和下载资产，并通过 Blender 或 Houdini 生成 GLB 预览。

### [Cage Within →](/work/tech-art-cage-within)

[![Cage Within 最终构图](/assets/tech-art-2026-cage-within-cover.png)](/work/tech-art-cage-within)

以埃舍尔不可能阶梯为灵感的三维错觉动画，结合 Houdini 程序化楼梯、PyMEL 弹跳动画与 Maya Arnold AiToon 渲染。

### [A Simple Slime Mold Sim →](/work/tech-art-simple-slime)

[![Slime Mold simulation 生成的轨迹图案](/assets/simple-slime-trails.png)](/work/tech-art-simple-slime)

使用 Python、OpenGL 和 Qt 制作的实时 agent-based simulation。粒子在 CPU 上感知并移动，轨迹通过 GPU 上的 ping-pong FBO、衰减与扩散 shader 累积成图案。

### [Real-Time SPH Fluid Simulation →](/work/tech-art-sph-fluid)

[![Unity URP 中的实时 SPH 流体模拟](/assets/sph-fluid-cover.png)](/work/tech-art-sph-fluid)

基于参考项目完成的学习性实现，在 Unity 6 URP 中迁移并扩展 GPU SPH 粒子流体模拟，使用 GPU Instancing 和 SDF Raymarching 展示调试粒子与连续流体表面。

## 后续更新

之后新增的 Tech Art 2026 项目可以沿用同一结构：在本页增加入口，每个项目拥有独立的中文介绍、职责、技术要点、配图、视频和原始报告。
