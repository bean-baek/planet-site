# Iridescent Planet

An interactive 3D planet visualization built with Three.js, featuring two distinct viewing modes with animated transitions.

## Demo

> Live at: 

## Features

### Blueprint Mode
A technical schematic view of the planet system — glowing beams, orbital graphs, annotated nodes, and ring structures rendered in a cool blue-tinted aesthetic.

### Iridescent Mode
A lush, dreamlike planet scene featuring:
- Iridescent planet with multi-layered rings
- Dynamic star field and glitter particles
- Floating bubbles, flowers, and petals
- Atmospheric mist and spores
- Astrophage organisms
- Explorable landscape with custom lighting

### Transitions
Smooth dissolve/tunnel transition between Blueprint and Iridescent modes, driven by a shared mode state machine (`BLUEPRINT_IDLE → BLUEPRINT_FOCUS → BLUEPRINT_TO_IRIDESCENT → IRIDESCENT`).

## Tech Stack

- **Three.js** `^0.162.0` — 3D rendering
- **Vite** `^8.0.1` — build tool and dev server
- Post-processing: `UnrealBloomPass`, `EffectComposer`, `ShaderPass`
- Camera: `OrbitControls`

## Getting Started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── main.js               # Entry point, scene assembly
├── modeState.js          # Mode state machine
├── scene.js              # Three.js scene / camera / renderer setup
├── animate.js            # Animation loop
├── composer.js           # Post-processing pipeline
├── controls.js           # OrbitControls
├── planet.js             # Planet mesh
├── rings.js / ringConfig.js
├── stars.js / glitter.js / bubbles.js
├── flowers.js / petals.js
├── astrophage.js / mist.js / spores.js
├── landscape.js          # Explorable terrain
├── loader.js             # Texture loading
├── ui.js                 # UI overlay
└── blueprint/            # Blueprint mode subsystem
    ├── blueprintController.js
    ├── blueprintScene.js
    ├── blueprintBeams.js
    ├── blueprintGraphs.js
    ├── blueprintLabels.js
    ├── blueprintNodes.js
    ├── blueprintRings.js
    ├── blueprintAnnotations.js
    ├── blueprintSystemPlanets.js
    ├── blueprintPlanetWindow.js
    ├── blueprintIris.js
    └── blueprintUI.js
```
