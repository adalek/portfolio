---
title: "Real-Time SPH Fluid Simulation"
year: 2026
category: "Technical Art"
summary: "基于参考项目完成的 Unity 6 URP 学习性实现，包含 GPU SPH 流体与 SDF Raymarching 可视化。"
role: ["Technical Artist", "Graphics Programmer", "Simulation Developer"]
tools: ["Unity 6 URP", "C#", "Compute Shader", "HLSL", "SDF Raymarching"]
cover: "/assets/sph-fluid-cover.png"
featured: false
order: 18
links:
  - label: "返回 Tech Art 2026"
    url: "/work/cave-projects"
  - label: "GitHub Repository"
    url: "https://github.com/adalek/My-SPH"
media:
  - type: "pdf"
    src: "/assets/tech-art-2026-sph-fluid.pdf"
    caption: "Real-Time SPH Fluid Simulation and SDF Raymarching in Unity URP 原始报告。"
---

## 项目介绍

这个项目在 Unity 6 URP 中实现 Smoothed Particle Hydrodynamics（SPH），用于学习粒子流体模拟、GPU compute shader、GPU instancing 与 SDF raymarching。流体不是固定 mesh，而是一组携带 position、velocity、density 和 pressure 等数据的运动粒子。

项目是在 AJTech2002 的 SPH base project 基础上完成的 Unity 6 URP migration 与扩展。模拟、调试球体和 raymarched 流体表面共享同一个 GPU particle buffer，使 compute shader 更新后的粒子位置可以直接被渲染阶段读取，而不必每帧拷回 CPU。

## 系统结构

- `SPH_Compute.cs` 创建粒子和 GPU buffer，dispatch SPH kernels，并绘制调试球体。
- `SPHComputeShader.compute` 依次更新 density、pressure、force、velocity 与 position。
- `GridParticle.shader` 通过 instance ID 从共享 buffer 读取粒子位置，一次 indirect draw 绘制大量调试球体。
- `FluidRayMarchingFeature.cs` 在 URP 中执行 screen-space render pass。
- `Raymarching.compute` 读取同一粒子 buffer，将粒子融合为连续的 SDF 流体表面。

## 技术要点

- 以 smoothing kernel 对邻域粒子质量进行加权求和估算 density，并根据当前 density 与 rest density 的差计算 pressure。
- 压力项把粒子从高密度区域推开，viscosity 平滑邻居之间的速度差，gravity 作为外力；随后以显式 timestep 更新 velocity 和 position。
- 模拟拆为 `ComputeDensityPressure`、`ComputeForces` 和 `Integrate` 三个 kernels，避免同一阶段读取到部分更新的数据。
- 一个 GPU thread 处理一个粒子。报告使用每组 100 threads，并由 C# 根据 particle count 计算 dispatch group 数量；group size 是性能选择，不是物理参数。
- 模拟和两个渲染路径都使用 `_particlesBuffer`，减少 CPU 与 GPU 之间的数据往返。
- 运行时可选择 box、sphere 或 cylinder；碰撞判断在容器 local space 中执行，再把 collision normal 转回 world space。
- 每个粒子视为 signed distance sphere，并用 smooth minimum 融合多个 SDF；沿相机射线步进到表面后，在 screen space 中计算光照与折射。
- 界面暴露 boundary damping、viscosity、particle mass、gas constant、rest density、timestep、boundary shape、调试球显示和 reset。

![模拟开始时由 C# 创建并上传到 GPU buffer 的粒子布局。](/assets/sph-fluid-initial-layout.png)

*报告 Figure 2：初始粒子布局。*

![流体粒子与球形障碍物发生碰撞。](/assets/sph-fluid-sphere-collision.png)

*报告 Figure 3：球形障碍物碰撞测试。*

## 结果与限制

项目实现了 GPU SPH 模拟、兼容 URP 的 raymarching pass、运行时参数调节、多种容器形状，以及原始粒子与平滑流体表面的对照显示。

当前 solver 的邻居搜索仍是 brute-force，每个粒子会检查所有其他粒子，因此复杂度为 O(n²)；raymarching 也会遍历全部粒子，高分辨率下成本较高。报告提出以 spatial hash 或 grid-based neighbour search 提升可扩展性，以 particle culling 或 adaptive raymarching 降低渲染成本，并进一步研究移动容器、表面重建和更真实的水材质。
