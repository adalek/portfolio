---
title: "Enmeshed Tinge"
year: 2022
category: "Creative Coding"
summary: "A traffic-data-driven light installation that translates real-time Shanghai congestion data into a poetic spatial experience."
role: ["Programmer", "Designer"]
tools: ["Arduino", "ESP32", "MQTT", "Node-RED", "Baidu Map API", "NeoPixel"]
cover: "/assets/enm1.jpg"
background: "https://media.giphy.com/media/RV4j4cZR76nZhoTu6m/giphy.gif"
featured: true
order: 6
links:
  - label: "Video Documentation"
    url: "https://drive.google.com/file/d/1o-Er3HEzYuMhvMgeIVKbbNaM-pV96M1V/view?usp=sharing"
media:
  - type: "image"
    src: "/assets/enm1.jpg"
    caption: "Installation view."
  - type: "image"
    src: "/assets/enm2.jpg"
    caption: "Installation detail."
  - type: "image"
    src: "/assets/enm3.jpg"
    caption: "Installation detail."
  - type: "image"
    src: "/assets/GIF1.gif"
    caption: "Light pattern animation."
  - type: "image"
    src: "/assets/enm4.jpg"
    caption: "Physical construction."
  - type: "image"
    src: "/assets/enm5.jpg"
    caption: "Physical construction."
  - type: "image"
    src: "/assets/enm6.jpg"
    caption: "Physical construction."
  - type: "image"
    src: "/assets/enm7.png"
    caption: "Node-RED traffic data workflow."
  - type: "image"
    src: "/assets/enm9.png"
    caption: "MQTT data pipeline."
  - type: "image"
    src: "/assets/enm8.png"
    caption: "Arduino lighting control function."
---

## Overview

Enmeshed Tinge takes an artistic approach to visually depict Shanghai's real-time traffic data in the form of a light installation. By exploring the relationship between environment and data, the installation creates a dynamic, fluid visual space that reflects poetically on the city's urban ambience.

Open data extracted from governmental sources becomes the main medium of creation, proposing an environment that engages with layers of the city's grid. The serpentine structure of the metal wire mesh mirrors the complexity of traffic data and the physical intersections of roads, while different light patterns illustrate distinct degrees of congestion across Shanghai districts.

As a creative visualization of real-time data, the project offers a new perception of space by showing how an architectural environment can stay in conversation with the outside world.

## Technical System

Traffic data is requested through the Baidu Map API in Node-RED, then sent through MQTT. The MQTT broker receives the data and sends it through WiFi to a FireBeetle ESP32. The Arduino function controlling the NeoPixel light patterns uses the traffic data as its parameters, turning congestion values into changes in color, rhythm, and movement.

## Technical Materials

- Arduino IDE
- FireBeetle ESP32
- NeoPixel strips
- MQTT and HiveMQ Cloud
- Node-RED
- Baidu Map API for real-time Shanghai traffic data

## Installation Materials

- Clear wires
- Metal wire mesh
- White diffusive fabric and paper
- Wood pieces

## Contribution

- Made the moodboard and designed the appearance of the installation
- Participated in building the physical structure
- Chose and purchased fabric
- Programmed the light patterns in Arduino
- Tested the Baidu Map API with Node-RED
- Debugged the Node-RED data flow
