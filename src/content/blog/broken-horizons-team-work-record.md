---
title: "Broken Horizons: Team Work and Project Management Record"
date: 2026-03-19
summary: "A factual record of the Broken Horizons team roles, weekly production tasks, Unreal Engine asset rules, integration workflow, and final milestones."
tags: ["Broken Horizons", "Unreal Engine", "Houdini", "Team Production", "Project Management"]
draft: false
---

Broken Horizons was organised through regular meetings, weekly task records, shared project files, and Unreal Engine asset-management rules. This post records the team roles, weekly work, integration rules, and dated milestones documented during production.

## Project Setup

The first meeting agenda covered:

- Project introduction
- Team member roles
- Producer and note-taker roles
- Pre-production and tutorials
- Teams, folders, and other logistics
- Unreal Engine version
- Real-location references
- Technical task areas

The technical areas discussed included landscape, foliage, lighting, procedural textures, rocks and walls, Niagara VFX, Chaos destruction, sculpture modelling, and decay.

Location references included Tout Quarry Sculpture Park and Swanage Amphitheatre. [SideFX Project Titan](https://www.sidefx.com/titan/) was also saved as a procedural-environment reference.

## Team Roles

| Member | Recorded role or work area |
| --- | --- |
| Osher | Producer; foliage; Houdini Digital Assets |
| Josh / Joshua | Note taker; lighting; atmosphere; cinematics; rendering |
| Jessica | Landscape; environment blockout; Unreal PCG; scene integration |
| David | Wind effect; grass interaction; later dog model, sculpture and procedural stones |
| Kyle | Materials research; Niagara effects; destruction; bird flocking |

## Week 1 — First Meeting, 10 February 2026

### Jessica — Landscape and Environment Blockout

Jessica built the project landscape, presented an early mountainous terrain blockout, and continued landscape-material research. Her next tasks were dressing the scene with grass and adding more plants and trees.

### Osher — Procedural Foliage

Osher developed a procedural foliage system in Houdini and installed the required plugin. The system was intended to apply foliage over environment surfaces. The next areas to explore were grass workflows, Blueprint placement and control, and prototype trees.

### David — Wind Animation and Foliage Motion

David implemented a wind-effect test using plant and leaf assets. The next task was to attempt foliage interaction and collision-style response.

### Kyle — Tools, Niagara, and Materials

Kyle researched tools and workflows that could be integrated into the project, and collected and tested free online material assets. Planned work included Niagara techniques such as butterfly swarms.

### Josh / Joshua — Lighting and Atmospherics

Josh completed basic lighting tutorials and tested Sky Atmosphere and Exponential Height Fog. The next tasks were researching Lumen and beginning project lighting tests.

## Weekly Record — Week Commencing 2 February

The shared weekly sheet contained Weekly Tasks, Notes, a place to share work, and video or image evidence. It also reminded the team to contact IT and install the Houdini plugin before the next meeting.

### Jessica

Jessica created a landscape with Gaea, which could export heightmaps, river maps, snow maps, and other data. She set up the Gaea plugin for Unreal, created a landscape master material, and added paintable material layers. A texture-size mismatch was recorded as a problem.

### Osher

Osher created a procedural foliage tool in Houdini, set up the Houdini plugin in Unreal, and uploaded the HDA. The tool could use an object as input and cover it with foliage. Controls included leaf size, branch count, layout on the object, and leaf model.

### Josh

Josh followed lighting tutorials and applied visual-effects techniques to an environment. Recorded tests included Exponential Height Fog and Sky Atmosphere.

### David

David created a foliage wind-field effect using an HLSL noise shader, Blueprints, and vertex displacement.

### Kyle

Kyle researched Project Titan tools and textures, created a landscape test, and used free environment materials found online.

## Meeting Week 2

General topics included the showcase format, character interaction with grass, Houdini landscape-process learning, and weather-system integration with wind, grass, and a possible wet shader.

- Jessica made first-person landscape tests, researched Unreal Engine PCG Graph, studied landscape textures, and worked on PCG biomes and rocks.
- Osher continued vegetation-system work, including grass workflows and prototype trees.
- Joshua organised a setup for interactive gameplay and cinematics, comparing Lumen, Hardware Ray Tracing, and Path Tracing.
- Kyle tested environment materials and created a Niagara butterfly effect.
- David added character collision to grass, improved the wind effect, and implemented grass interaction using vertex displacement.

### Goals for Week 3

| Member | Goal |
| --- | --- |
| Jessica | Make a PCG scene with grass |
| Osher | Research how to scatter a Houdini asset in Unreal and control its size |
| Joshua | Research rain illumination |
| Kyle | Add more destruction effects and learn more project features |
| David | Research rain effects and weather systems |

## Weekly Record — Week Commencing 9 February

Jessica fixed the Gaea texture-size issue and continued work on PCG biomes and rocks. She used the First Person level template for testing. Recorded questions covered differences between Gaea, Unreal, and Houdini landscape pipelines; post-processing eye adaptation; and performance topics such as open worlds, GPU instancing, and LOD.

Josh researched an interactive and cinematic lighting setup. The recorded dynamic weather and day/night pipeline included sky and atmosphere, volumetric clouds, fog, shadows, and TSR. He also summarised performance-versus-quality guidelines.

David continued grass collision and wind-field improvements. Kyle created Butterfly and Fire Niagara tests and tested them with environment day/night and lighting.

## Meeting Week 3

Two additional production topics were recorded:

1. A pipeline for migrating files, including folder structure and naming conventions.
2. An exact location reference and a smaller whitebox level layout.

The recorded work was:

- Jessica set up a workable landscape.
- Osher tested HDA-based scattering in Unreal and created grass logic.
- Joshua researched a lighting and rendering pipeline for rain and overcast weather.
- Kyle created destruction and explosion effects, and worked on a crow or flocking Niagara example.

### Goals for Week 4

| Member | Goal |
| --- | --- |
| Jessica | Create a smaller landscape |
| Osher | Continue working on HDAs |
| Joshua | Cinematics in Unreal |
| Kyle | Explosions |
| David | Sculpture modelling |

## Weekly Record — Week Commencing 16 February

### Landscape

Jessica downloaded and tested a landscape auto-material with the previous Gaea landscape. Tests included materials driven by height and slope, custom material layers, automatic grass, snow, and puddles. The landscape was recorded as 1009 × 1009, approximately one kilometre. Open World Partition was noted as a possible future expansion method. She also planned to explore Google Maps data for heightmap generation and shared the UE5.6 project as a ZIP.

### Instancing HDA

Osher created an instancing HDA that could place assets at a chosen Unreal location. User controls included a guiding curve, target surface, point count, offset, rotation, and scale.

### Lighting and Rendering

Josh researched rain and overcast lighting, Material Parameter Collections for global wetness and puddles, TSR, Lumen scalability, and Niagara scalability. He also reviewed a higher-quality cinematic workflow using Path Tracing and Movie Render Queue.

### Niagara and Destruction

Kyle created explosion effects, tested breaking objects with Fracture features, and created a moving bird flock recorded as incomplete.

The project notes also saved the Genshin Impact Anime Concept Trailer and Red Dead Redemption 2 Trailer as cinematic references.

## Unreal Project Structure Rules

The team documented a shared folder structure:

```text
Content/
    _Shared/
    Art_Name/
    FX_Name/
    Lighting_Name/
    Blueprint_Name/
```

The rules were:

- `_Shared` contained common assets such as master materials, global textures, and common meshes.
- Personal folders contained only each member's own assets.
- Members should not modify another member's folder without permission.
- Assets should not be placed directly under `Content/`.

## Naming Convention

The general naming format was:

```text
Prefix_AssetName_Descriptor
```

| Type | Prefix | Example |
| --- | --- | --- |
| Static Mesh | `SM_` | `SM_Rock_Cliff01` |
| Material | `M_` | `M_Rock_Master` |
| Material Instance | `MI_` | `MI_Rock_Wet` |
| Texture | `T_` | `T_Rock_Albedo` |
| Blueprint | `BP_` | `BP_Enemy_AI` |
| Niagara System | `NS_` | `NS_Smoke` |
| Niagara Emitter | `NE_` | `NE_Fire` |
| HDA | `HDA_` | `HDA_CliffGenerator` |

The recorded purpose of this convention was to avoid overwrite conflicts during migration.

## Asset Migration Workflow

### Prepare the Source

Before migration, members fixed redirectors, saved all work, and confirmed that assets were inside their personal folder.

### Migrate

The documented process was:

1. Right-click the main asset.
2. Select **Migrate**.
3. Review the Asset Report and dependencies.
4. Select `TargetProject/Content/` as the destination.
5. Move migrated assets into the member's named folder.

The notes specify selecting the `Content` folder rather than the project root.

### Handle Duplicate Assets

- **Overwrite** was used only when updating an agreed shared asset.
- **Skip** was used when the target version needed to remain.
- `_Shared` assets were not overwritten without team agreement.

The recorded integration strategy was to maintain one Master Project and migrate all members' work into it. The team notes advised against copying assets through File Explorer, renaming `.uasset` files outside Unreal, or editing Unreal assets directly in Windows folders.

## Cleaning the Project Before Upload

The project-management notes specified keeping:

```text
Config/
Content/
Source/   # if the project contains C++
.uproject
```

Generated folders that could be removed before upload were:

```text
Binaries/
DerivedDataCache/
Intermediate/
Saved/
.vs/
```

## Integration and Production Milestones

### Before 3 March

- Josh: finish the camera and upload the Unreal project.
- Osher: add HDAs to Unreal and upload the project.
- David: upload and test the current dog model, upload the project, and set up Houdini 21.
- Jessica: test HDA performance, save the final project, import assets into one scene, and continue landscape study.
- Kyle: import the butterfly effect and upload the project.

A Week 5 file named `BrokenHorizonsW5.zip` was shared. The dog model scale was recorded as too small.

### 3 March Milestone

The targets were a view of the final artefact or import test, a camera sequence, and two HDA tests.

### 9 March Milestone

The targets were:

1. A scene containing all main assets and no placeholder cubes.
2. The grass HDA implemented in the scene.
3. Initial render tests with and without grass.
4. A lighting environment.

Tasks included lighting, weather, fog, directional light, global illumination, HDA grass placement, dog-model integration, procedural stones, landscape textures, sculpture assets, and flocking birds.

### Tasks Recorded After 9 March

- Josh: post-processing, colour correction where needed, camera effects, different lighting for shots, and rendering.
- Osher: apply foliage to Unreal objects.
- David: add procedural stones or alternative stone assets, and implement wind for required foliage and grass.
- Jessica: arrange background assets, integrate work into one scene, and check asset optimisation.
- Kyle: implement birds in Unreal.

### 17 March — Finish

The recorded targets were a scene with finished foreground and background assets, post-processing, optimisation settings including Nanite and Lumen, different render settings, and initial rendered results.

### 19 March — Finish Artefact

The recorded targets were to finish the render, create a video from the renders, and begin individual work.

| Member | Final task |
| --- | --- |
| Josh | Export the finished rendering |
| Osher | Make the video |
| David | Support rendering and remaining tasks |
| Jessica | Support rendering and remaining tasks |
| Kyle | Support rendering and remaining tasks |

## Recorded Production Resources

External references explicitly included in the notes were:

- [SideFX Project Titan](https://www.sidefx.com/titan/)
- [Genshin Impact Anime Concept Trailer](https://youtu.be/6jY2f6OkpBo?si=mPVRV2RMRSSEk2i4)
- [Red Dead Redemption 2 Trailer](https://www.youtube.com/watch?v=gmA6MrX81z4)

The weekly records also referenced internal progress files including landscape tests, foliage tests, lighting studies, wind and grass interaction, Niagara tests, and weekly ZIP archives.

## Recorded Project Management Practices

The supplied records document the use of:

- Regular team meetings
- Weekly task assignment and progress notes
- Video and image evidence
- Recorded tool inputs, outputs, and user controls
- Shared folder and naming rules
- Unreal asset-migration rules
- A Master Project integration strategy
- Project-cleaning rules before upload
- Dated production milestones
- Individual responsibility lists for integration and final delivery
