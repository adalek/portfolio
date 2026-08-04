---
title: "Houdini Garden Builder"
year: 2026
category: "Technical Art"
summary: "帮助艺术家快速生成并定制花园的 Houdini Digital Asset。"
role: ["Technical Artist", "HDA Designer", "Tool Developer"]
tools: ["Houdini", "HDA", "VEX", "L-System"]
cover: "/assets/tech-art-2026-houdini-garden-cover.png"
featured: false
order: 13
links:
  - label: "返回 Tech Art 2026"
    url: "/work/cave-projects"
media:
  - type: "video"
    src: "https://www.youtube.com/embed/v0__Rk_G-r4?si=dMRHDiu8r1sGLQHs"
    caption: "Houdini Garden Builder 工具演示。"
  - type: "pdf"
    src: "/assets/tech-art-2026-houdini-garden.pdf"
    caption: "Houdini Garden Builder 原始技术报告。"
---

## 项目介绍

Houdini Garden Builder 是一个帮助艺术家快速生成花园资产的 Houdini Digital Asset。工具可以创建不同的花园形状，在绘制区域生成道路，并散布花朵、树木等自定义基础资产；现有功能包含 fence builder、road builder 与 grass assets。

设计从两条线展开：一是通过花园参考图理解常见结构与用途，二是从游戏 world-building 的程序化工作流出发，思考边界形状、不同道路层级、道路连接和生物资产之间的关系。目标是让资产根据彼此关系自动调整，减少艺术家的手工修改。

## 技术要点

- 土地边缘的点号因复杂几何而不连续，无法直接形成有序 edge loop。工具先计算中心点，再用四象限反正切 `atan2` 得到每个点的弧度属性，并按属性排序。
- Sort 后，Connect Adjacent Pieces / Connect Line 仍会参考原始点序。为此增加 Attribute Wrangle 创建排序列表，并循环该列表连接线段；最后比较相邻点距离，决定道路处的断线位置。
- 用 Ray node 检测落在地面上的区域并返回 hit point group。为避免按点删除产生尖锐边缘和残留点，通过 Attribute Promote 把点属性提升到 primitive，并以 `name` 作为 Piece Attribute、以 Minimum 作为提升方式，把删除信息传递给整块道路几何。
- 树木生成使用 SideFX 的树生成工具；报告同时研究 Houdini L-System 在植物、分形结构以及未来花卉和花园迷宫生成中的可能性。
- 工具暴露了大量可调参数，但报告明确指出，如何命名参数、选择真正需要暴露的控制项，以及如何让界面直观，仍需要继续验证。

![围栏边界点在排序前的状态。](/assets/houdini-garden-edge-points.png)

*报告 Figure 2：复杂几何上的边界点编号并不连续。*

![按弧度属性排序并连接后的曲线。](/assets/houdini-garden-sorted-line.png)

*报告 Figure 4：创建排序列表后连接出的围栏曲线。*

![道路几何使用 Attribute Promote 处理后的结果。](/assets/houdini-garden-attribute-promote.png)

*报告 Figure 7：将命中信息提升至整块 primitive 后，道路块得到清晰分离。*

## 评估与后续

当前版本完成了可自动调整的围栏和道路，但尚未制作足够多的资产来形成完整花园，也没有进行用户测试或大规模生成的性能测试。报告提出的后续方向包括程序化灌木图案、程序化纹理、进一步实现 L-System、改善三维环境中的道路绘制方式，以及为工具加入交互式引导。
