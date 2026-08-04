---
title: "Rendering a Coca-Cola Can with RenderMan"
year: 2026
category: "Technical Art"
summary: "使用 RenderMan 26.3 与 Python API 完成的产品级罐体建模、材质和灯光练习。"
role: ["Technical Artist", "Look Development Artist", "Python Developer"]
tools: ["RenderMan 26.3", "Python API", "PxrSurface", "OSL"]
cover: "/assets/renderman-coke-cover.png"
featured: false
order: 14
links:
  - label: "返回 Tech Art 2026"
    url: "/work/cave-projects"
media:
  - type: "image"
    src: "/assets/renderman-coke-two-can.png"
    caption: "最终双罐构图：木质表面上的产品渲染。"
  - type: "pdf"
    src: "/assets/tech-art-2026-renderman-coke.pdf"
    caption: "Rendering a Coca-Cola Can with RenderMan 原始报告。"
---

## 项目介绍

这个项目使用 RenderMan 26.3 和 Python API 重建可口可乐罐。虽然主体是简单的圆柱形，但真实感依赖罐口与罐底的收窄、卷边铝制边缘、带环形凹槽与拉环压痕的顶盖、红色印刷涂层、划痕以及环境反射等细节。

项目涵盖 RenderMan primitive 与 polygon mesh 的混合建模、基于物理的材质、纹理与 bump mapping、程序化表面变化、HDRI 灯光和相机景深，最终输出 1080p 产品渲染。

## 技术要点

- 主体使用稳定的 RenderMan `Cylinder`，上下卷边由 profile rings 生成 `PointsPolygons` mesh，顶盖使用独立 UV disk mesh，以便单独控制 bump detail。
- 初版罐口 taper 的 profile rings 太少且半径变化过急，高光会暴露 faceting。增加垂直 rings 后，轮廓和高光更连续。项目也测试了 Catmull-Clark subdivision，但重叠 rings、极薄 quads、相同高度或退化面会触发 invalid bounds，因此最终保留更稳定的混合方案。
- 罐身以 PxrSurface、label texture 和 specular reflection 表现红色印刷铝材；裸露的顶部和底部使用 metallic Fresnel、roughness 与 bump detail 表现更粗糙的拉丝金属反射。
- 早期圆柱标签测试出现水平翻转、垂直倒置、重复和压缩。最终通过 `PxrManifold2D` 的 `scaleS`、`offsetS`、`scaleT`、`offsetT` 与 `invertT` 控制方向和位置。
- 普通矩形 bump 在 disk 的极坐标式 UV 上会向中心拉伸，因此重新绘制了适配 disk UV 的 radial texture，使环形凹槽和拉环压痕更自然地对齐。
- OSL scratch/noise 用于打破过于干净的 CG 反射。输出主要连接到 roughness，也可用很小的强度驱动 bump。
- HDRI / dome light 提供自然户外反射，木质地面提供接触阴影和尺度参照；景深与背景虚化让画面更接近产品摄影。

![木质表面上的双罐最终构图。](/assets/renderman-coke-two-can.png)

*Final render 2：双罐构图。*

## 限制与后续

报告指出三个主要改进方向：手动细化 AI 生成的顶盖 bump，以提高凹槽深度、边缘锐度和拉环位置的准确性；增强红色涂层的金属闪点与 specular variation，可能加入 anisotropic reflection；继续增加程序化灰尘、指纹、污渍和细小划痕，减少表面过于干净的问题。
