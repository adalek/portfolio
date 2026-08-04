---
title: "Local 3D Asset Database"
year: 2026
category: "Technical Art"
summary: "面向本地制作流程的三维资产数据库，连接浏览器界面、SQLite 与 Blender / Houdini 转换工具。"
role: ["Technical Artist", "Pipeline Tool Developer"]
tools: ["Python", "Flask", "SQLite", "Blender", "Houdini", "Podman"]
cover: "/assets/asset-database-cover.png"
featured: false
order: 15
links:
  - label: "返回 Tech Art 2026"
    url: "/work/cave-projects"
  - label: "GitHub Repository"
    url: "https://github.com/adalek/pipelineproject-adalek"
media: []
---

## 项目介绍

Local 3D Asset Database 是一个在本地运行的三维资产管理工具。浏览器界面用于上传、浏览、搜索、筛选、标记、编辑、下载和删除资产；原始文件保存在磁盘中，SQLite 只记录名称、格式、大小、路径、标签、说明、预览和缩略图等元数据。

项目支持 `.glb`、`.obj`、`.fbx` 和 `.blend`。GLB 可以直接在详情页中预览，其他格式可以在本地通过 Blender 或 Houdini 转换成独立的 GLB preview。工具也能接收用户上传的缩略图，或调用 Blender 从 front、side、top 三个角度生成缩略图。

## 数据与文件结构

数据库、原始文件、预览和缩略图各自存放在独立位置：

- `data/assets.db` 保存 SQLite 数据库。
- `storage/assets/` 保存上传的原始资产。
- `storage/previews/` 保存转换生成的 GLB。
- `storage/thumbnails/` 保存上传或自动渲染的缩略图。

数据库连接统一启用 `sqlite3.Row` 和 foreign keys。旧数据库启动时会补充 `preview_path`、`thumbnail_path` 和 `file_size` 字段，并把项目内部的绝对路径转换为相对路径，减少跨系统移动时的路径问题。

## 浏览与管理

首页按卡片显示资产缩略图、名称、格式和文件大小。资产可以按名称搜索，以 tag 和文件格式筛选，并按创建时间或文件大小排序。分页数量也可以调整。

Tag 使用独立的 `tags` 与 `asset_tags` 表维护。输入的标签会先清理空格并转为小写，同一个标签可以被多个资产复用。资产详情页提供原文件下载、元数据编辑和删除入口。

![资产上传页面，包含标签、说明、缩略图、渲染角度、转换器和资产文件选项。](/assets/asset-database-upload.png)

*上传时可以选择 preview converter，并决定是否自动生成缩略图。*

## DCC 转换流程

转换模块以命令行方式调用 Blender 或 Houdini，不把 DCC 逻辑写进 Flask route。Blender 后端根据源文件类型生成后台 Python 脚本，支持 `.blend`、`.fbx` 和 `.obj` 导入，再导出 GLB。Houdini 后端调用同目录下的 `hython`，建立临时 geometry network，并使用可用的 glTF export node 输出预览。

程序会先检查配置的 DCC executable 是否存在。路径由 `.env` 中的 `BLENDER_PATH` 和 `HOUDINI_EXECUTABLE` 提供，以适应 Linux、WSL 和 Windows。开发记录中特别提到，早期把 Houdini executable 写入 `HOUDINI_PATH` 会干扰 Houdini 自己的 package search path，因此后来把可执行文件路径改为单独的环境变量，并在启动 subprocess 时清理冲突值。

缩略图渲染会计算所有 mesh 的 bounding box，自动确定中心、尺寸和正交相机距离。资产统一使用浅色 clay emission 材质与 Freestyle 轮廓，输出 320 × 200 PNG。

![资产详情页中的 GLB 浏览器预览和元数据卡片。](/assets/asset-database-detail.png)

*详情页读取转换后的 GLB，同时保留原始资产的下载和管理入口。*

## 本地模式与容器模式

本地运行时可以访问 Blender 和 Houdini，因此具备上传、转换、缩略图渲染、预览和管理等完整功能。Podman container 用于提供一致的 Flask 运行环境，并通过 volume 保留 `data/` 和 `storage/`；除非容器内另外安装或挂载 DCC，它主要负责浏览、搜索、标记、上传、下载和管理现有资产。

## 开发方式与限制

项目把功能拆成可测试的小阶段，并为数据库、转换模块和 Flask routes 编写 pytest。测试中的 DCC 转换使用 mock，不要求真正启动 Blender 或 Houdini。

当前转换和缩略图流程依赖本机 DCC 的安装位置，不同系统的 PATH 格式仍需要正确配置。容器本身也不会自动获得宿主机上的 Blender 或 Houdini，这是容器模式与本地完整模式之间的主要区别。
