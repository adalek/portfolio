---
title: "Cage Within"
year: 2026
category: "Technical Art"
summary: "以埃舍尔不可能阶梯为核心的三维错觉动画与工具开发实验。"
role: ["Technical Artist", "3D Artist", "Tool Developer"]
tools: ["Maya", "PyMEL", "Houdini", "Arnold AiToon"]
cover: "/assets/tech-art-2026-cage-within-cover.png"
featured: false
order: 16
links:
  - label: "返回 Tech Art 2026"
    url: "/work/cave-projects"
media:
  - type: "video"
    src: "https://player.vimeo.com/video/1176352270?badge=0&autopause=0&player_id=0&app_id=58479"
    caption: "Cage Within / Bouncing Ball 动画影像。"
  - type: "pdf"
    src: "/assets/tech-art-2026-bouncing-ball.pdf"
    caption: "Cage Within 原始项目报告。"
---

## 项目介绍

Cage Within 是一个受埃舍尔不可能阶梯启发的三维错觉动画。作品把无尽阶梯与鸟、插画式线条等母题结合，表达“困住我们的往往是自己”：看似无法逃离的笼子和循环并不真实存在。

制作流程涉及 Maya、PyMEL 与 Houdini，同时测试了 AI 辅助生成工具在完整三维流程不同阶段中的作用。视觉上参考 Jinil Park 的 Drawing Series，以轻盈、线性、近似手绘的结构配合不可能空间。

## 技术要点

- 在 Houdini 中先以 curve 定义楼梯整体形状和比例，再通过 resample 控制台阶数量与密度；使用 `@ptnum` 逐级控制每个台阶的缩放与向上位移。
- 中空结构分别测试了 Cube + PolyWire 与矩形 profile + Sweep。前者会产生不对称几何和低面数转角缝隙，后者整体更干净，但尖角处可能出现边重叠；最终选择需要结合 Toon Shader 的画面效果权衡。
- PyMEL 脚本控制球体的垂直运动、弹性形变、接地时间、不同材质表现与能量衰减，并加入楼梯高度参数，使球能够沿台阶移动。场景中由 `move_anim` 控制 translateY，`squash_stretch_anim` 控制 scaleY。
- 生成图先被用作视觉参考，再转为三维模型。针对生成模型错误填实中空结构的问题，先强化负空间、降低线条密度；面对数十万面资产，则在 Houdini 中使用 VDB remeshing 与 polygon reduction。
- 报告记录了模型降至约 10,000 面时出现明显 mesh artifacts，并提出分阶段减面、按视觉重要性划分不同密度区域作为后续方案。
- 最终在 Maya 中使用 Arnold AiToon Shader 调整轮廓与明暗，完成插画式画面。

![Houdini 中的程序化楼梯节点与生成结果。](/assets/cage-within-stair-generation.png)

*程序化楼梯的节点网络与阶梯布局。*

![Maya Graph Editor 中的弹跳与衰减曲线。](/assets/cage-within-bounce-curves.png)

*PyMEL 脚本生成的弹跳动画曲线。*

![Arnold AiToon Shader 参数界面。](/assets/cage-within-aitoon-settings.png)

*用于手绘轮廓和明暗效果的 AiToon Shader 设置。*

## 范围与取舍

原计划还包括移动镜头揭示错觉机制，以及鸟的飞行动画，但受时间限制未完整实现。最终把重点放在固定镜头的错觉构图、程序化楼梯、弹跳脚本和手绘渲染上，也避免加入会削弱概念清晰度的额外建筑元素。
