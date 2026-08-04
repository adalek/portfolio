---
title: "Broken Horizons"
year: 2026
category: "Technical Art"
summary: "在 Unreal Engine 5 中重建 Tout Quarry Sculpture Park 的程序化环境项目。"
role: ["Director (Environment & Pipeline)", "Environment Artist", "Tool Developer"]
tools: ["Unreal Engine 5", "Houdini", "Houdini Engine", "DTM / Heightmap"]
cover: "/assets/tech-art-2026-broken-horizons-cover.jpg"
featured: false
order: 11
links:
  - label: "返回 Tech Art 2026"
    url: "/work/cave-projects"
  - label: "Development Notes"
    url: "https://www.notion.so/Broken-Horizons-32826f793ca780f9b108c23ed82ee6c3?source=copy_link"
media:
  - type: "video"
    src: "https://www.youtube.com/embed/8yoFtxA9YDI?si=5-OOQaLY3UOujUHu"
    caption: "Broken Horizons 项目影像。"
  - type: "pdf"
    src: "/assets/tech-art-2026-broken-horizons.pdf"
    caption: "Broken Horizons 原始个人贡献报告。"
---

## 项目介绍

Broken Horizons 是一个团队环境项目。我们前往 Tout Quarry Sculpture Park 拍摄参考素材，并在 Unreal Engine 5 中重建 “Circle of Stones” 区域。最终场景覆盖约 1,500 平方米，包含石雕、石结构与自然植被，并以约 1.5 分钟的 cinematic video 展示成果。

项目希望在真实地点重建中探索更高效的技术美术工作流。团队参考了《Death Stranding》的自然环境表现，以及 SideFX Project Pegasus 的程序化开放世界流程；考虑到两个月的时间范围，目标被收敛为一组可完成的程序化功能和较简化的环境演示。

![Broken Horizons 在 Unreal Engine 5 中完成的环境场景。](/assets/broken-horizons-environment.png)

## 我的职责

我担任 Environment & Pipeline Director，负责三部分工作：团队管线与工作流程、环境制作、工具开发。我与 producer 设计每周记录表和 milestones，检查并整合成员提交到 Unreal 项目中的工作；由于学校没有提供版本控制工具，团队以命名文件夹和 migration 的方式协作。

## 技术要点

- 比较 Gaea、Unreal 雕刻工具、Houdini 与 DTM heightmap 后，选择下载英格兰 1 米分辨率 LIDAR Composite DTM 数据，在 Houdini 中处理并导出灰度高度图，再用于 Unreal Landscape。
- 结合实地照片与 Google Earth 的测量功能，测量石块之间的距离并在 Unreal 中搭建布局。
- 使用 Landscape auto material 和自定义图层快速铺设地面与草地；为石雕制作无缝纹理，并通过 Lerp 混合两张 diffuse texture，使雕塑更自然地融入环境。
- 处理成员工具或资产无法直接进入 Unreal 的问题，包括调整纹理颜色与参数，以及增加 ID mask 以支持其他成员制作的 HDA。
- Ruinify HDA 将输入模型转换为 VDB，结合 Voronoi、Copy to Points、VDB Combine 等节点生成受损版本，再转回 polygon；参数可控制 fracture 与破损程度，并通过 Houdini Engine 在 Unreal 中实时编辑。
- 针对断开法线造成的硬边阴影，在 Houdini 中使用 Normal SOP，并将 Cusp Angle 设为 180 度以重新计算共享面的 vertex normal。

## 项目结果

项目完成了真实地点的环境重建、团队资产整合流程和可在 Unreal 中调整的 Ruinify 工具。报告也明确记录了时间与技术范围的取舍：没有复刻 Project Pegasus 的完整规模，而是选择对最终场景有效的流程与工具。

## 开发笔记：模型进入 Unreal

项目中的模型在 Houdini 与 Unreal 之间传递时，需要处理单位、坐标、拆分方式和导入设置。笔记记录的换算是从厘米到米，并需要根据 z-up / y-up 的差异绕 X 轴旋转 90°。FBX 导入 Unreal 时要合并 mesh，否则组件会被拆开并散落；从 Unreal 批量导出 asset 时，则要关闭 collision mesh 的导出。

Ruinify 流程使用 VDB 处理几何。由于 VDB from Polygons 生成的是 SDF，带空腔的模型需要启用填充内部的选项，否则 voxel 只覆盖模型表面。

## 法线与材质问题

岩石材质应用后曾出现明显的光照断裂和黑色三角面。UV Edit 中可以看到硬边，检查后发现顶点法线没有平均平滑。模型在 Houdini 中 remesh，再以 Normal SOP 将 Cusp Angle 设为 180° 后，硬边消失。重新导入 Unreal 时还要关闭 compute normal 和 compute tangent，避免引擎重新计算 cusp normal。笔记同时记录了一个实际操作问题：如果之前保留了错误的 reimport 设置，后续重新导入仍会沿用旧设置，只能删除 mesh 后重新导入。

另一个问题来自 normal map 的格式。项目中使用的 EXR 法线贴图被 Unreal 自动按 HDR 方式压缩，导致 normal space 错误，旋转模型时可以看到阴影方向不正确。解决方式是把 Compression Settings 改为 Normalmap（BC5），并在材质 sampler 中使用 normal 采样类型。

![项目资产与材质在 Unreal Engine 5 中的测试画面。](/assets/broken-horizons-material-tests.png)

## 草地与实时性能

当相机距离很远时，草地 mesh 在屏幕上的尺寸过小，会停止渲染。项目分别在 Landscape Grass Type 和 Foliage Mode 的 mesh instance 中检查 distance culling，并在 static mesh 面板中调整 screen size LOD。

开发笔记也记录了动态阴影的成本：草的风动会持续改变阴影，太阳角度变化同样会触发动态阴影；当太阳光设为 Movable 时，光照按动态方式计算。性能检查使用 `stat FPS`、`stat unit` 和 visualizer。

Landscape 部分使用 auto material 与自定义 layers。笔记记录了高度、斜率和距离混合用于减少重复感，layer weight blend 用于材质混合，edit layer 用于分开保存地形编辑，并通过 visualizer layer 检查各 layer 的绘制区域。

## Houdini Engine 工作流

Session Sync 打开后，可以通过 rebuild 把 Unreal 中的状态同步到 Houdini。HDA 可以右键选择 Apply to Selected，也可以在 Details 中选择 World，再使用当前选择。笔记记录的 HDA 制作步骤是从 file node 后方 collapse subnet，再创建 digital asset。

## 团队协作反思

作为 Environment & Pipeline Director，我除了完成自己的工具和环境工作，也花了大量时间了解成员的工具与资产、安装插件、排查导入问题，并把不同成员的交付整合进最终场景。开发笔记认为 producer 与进度跟进非常重要，面对面开会和共同工作效率最高；任务困难如果能及时公开，团队还可以调整替代方案。

这次项目也暴露了进度预估与交付验证的问题。成员对完成时间的判断经常偏乐观，而部分任务虽然完成了指定步骤，却没有先验证最终引擎画面是否可用。我的反思是，安排任务时需要更明确地定义可交付结果，尽早产出 visual 来证明方案可行，并提前准备 Plan B。小组决策和文件同步也应尽量放在公共渠道，减少私下沟通造成的信息二次转发。

## 尚未形成结论的研究

笔记中还保留了 UE PCG、instance 原理、World Partition、地形数据与 layer 优化、Lumen、UE 架构等 research 标题或关键词。这些部分没有写下足够的实验过程或结论，因此本页不继续扩写。
