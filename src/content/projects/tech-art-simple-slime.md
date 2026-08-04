---
title: "A Simple Slime Mold Sim"
year: 2026
category: "Technical Art"
summary: "使用 Python、OpenGL 和 Qt 实现的实时黏菌 agent-based simulation。"
role: ["Technical Artist", "Graphics Programmer"]
tools: ["Python", "OpenGL", "GLSL", "Qt", "NumPy"]
cover: "/assets/simple-slime-trails.png"
featured: false
order: 17
links:
  - label: "返回 Tech Art 2026"
    url: "/work/cave-projects"
  - label: "GitHub Repository"
    url: "https://github.com/adalek/aseassignment25-26-adalek/tree/main/SimpleSlimeProject"
media:
  - type: "video"
    src: "https://www.youtube.com/embed/avj0BHz2Csc"
    caption: "Simple Slime Mold simulation demo。"
---

## 项目介绍

这个项目使用 Python、OpenGL 和 Qt 实现实时黏菌模拟。每个 agent 保存位置和方向，并在每一帧分别向前、向左和向右采样轨迹纹理。粒子根据三个方向中最强的值调整朝向，再继续向前移动，许多个体由此形成类似黏菌的群体路径。

粒子位置与方向在 CPU 上更新，轨迹的绘制、累积、衰减和扩散交给 GPU。项目使用 NumPy 保存和批量计算粒子数据，再通过 VBO 和 VAO 送入 OpenGL。

## Agent 感知与运动

粒子位置从归一化坐标映射到 trail texture 的像素坐标。程序根据当前 heading 计算 forward、left 和 right 三个探测方向，并用 probe length 得到采样点。比较三个采样结果后，粒子向轨迹值更强的方向旋转，同时加入 noise strength，避免所有 agent 完全沿同一路径移动。

位置更新后，越过边界的粒子会从另一侧继续出现。项目提供 circle、center 和 random 三种初始化方式；切换模式或改变粒子数量时会重新初始化 simulation。

![早期粒子输出图。](/assets/simple-slime-particles.png)

*开发早期的粒子与轨迹测试输出。*

## Ping-pong FBO

轨迹保存在一对 framebuffer texture 中。每一帧先读取上一张纹理，将 decay 与 diffusion 结果写入另一张纹理，再把当前粒子绘制到目标 framebuffer，最后交换读写索引。这样 shader 不需要在同一次 pass 中同时读写同一张 texture。

Decay shader 会采样中心像素及周围八个邻居，先在当前值和邻域平均值之间做 diffusion，再乘以 decay。粒子 pass 使用 OpenGL points 把新轨迹写入 framebuffer，最终用 full-screen triangle 显示 trail texture。

## 实时控制

`SlimeFinal.py` 通过键盘控制 simulation。运行时可以切换生成模式，增减粒子数量，调整 probe length、noise strength、smoothing、particle speed、trail decay 和 trail diffuse，也可以重置粒子或清空 trail buffer。参数在程序内设置范围，避免数值进入明显不稳定的区域。

项目也制作了 `widget.py` 和 Qt Designer UI，把同一组参数接到图形界面控件上。

## 当前限制

最终仓库保留两个运行入口。`SlimeFinal.py` 中的 simulation、decay 和 diffusion 可以工作；`widget.py` 完成了 GUI 参数连接，但 FBO shader pass 的 decay / diffusion 没有正常迁移到 MainWidget。README 推测问题可能与 texture size 和 window size 的关系有关，但没有把这一点写成已经确认的原因。
