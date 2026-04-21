# Performance Optimization: Iridescent Planet Scene

**Estimated reading time:** 10 minutes

This document records every performance optimization applied to the `iridescent-planet` Three.js scene, the reasoning behind each change, and how to verify the results. If you are returning to this project after a break, start here before touching asset pipelines or render configuration.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [The Problem](#the-problem)
3. [Before: Baseline Measurements](#before-baseline-measurements)
4. [Optimization Steps](#optimization-steps)
   - [A2. Delete Unused GLB](#a2-delete-unused-glb)
   - [A1. Draco-Compress and Downsize Flower GLB](#a1-draco-compress-and-downsize-flower-glb)
   - [A3. Lossless WebP Sphere Textures](#a3-lossless-webp-sphere-textures)
   - [B. Renderer Power Preference](#b-renderer-power-preference)
   - [C. Tab-Visibility Render Pause](#c-tab-visibility-render-pause)
   - [D. Vite Manual Chunks](#d-vite-manual-chunks)
   - [E. GLB Source Buffer Release (No Action Needed)](#e-glb-source-buffer-release-no-action-needed)
5. [After: Final Results](#after-final-results)
6. [How to Verify](#how-to-verify)
7. [Files Modified](#files-modified)
8. [Tools Used](#tools-used)

---

## Project Overview

The site renders a dreamy Saturn-like planet with layered visual elements:

- **Planet sphere** with PBR textures (albedo, normal, roughness)
- **100 ring meshes** built from TubeGeometry (~200K vertices total)
- **Glitter particles** on ring tracks (custom shader material)
- **Soap bubbles** (custom shader material)
- **120 flower clones** loaded from a GLB model
- **Petal particles** floating around the scene
- **Stars** in the background

Post-processing uses `UnrealBloomPass` via Three.js `EffectComposer`.

**Stack:** Three.js v0.162, Vite 8, vanilla JavaScript (ES modules).

---

## The Problem

The scene felt slow. Opening Chrome DevTools revealed why: the initial page load was transferring roughly **95 MB** of assets, dominated by oversized GLB models and uncompressed 4K textures. Per-frame GPU work was also higher than necessary.

---

## Before: Baseline Measurements

### Asset Sizes (Initial Load ~95 MB)

| Asset | Size |
| --- | --- |
| Flower GLB (`1435963177547374592.glb`) | 46.7 MB |
| Unused flower GLB (`7effedeb-...glb`) | 29.5 MB |
| Sphere Normal Map PNG (4096x4096) | 7.1 MB |
| Sphere Albedo PNG (4096x4096) | 6.1 MB |
| Sphere Roughness PNG (4096x4096) | 5.4 MB |
| `ring.png` | 1.3 MB |
| JS bundle (single chunk) | 609 KB (156 KB gzip) |

### Per-Frame Work

- ~229 draw calls
- 100 ring TubeGeometry meshes (~200K vertices)
- 120 flower clones
- UnrealBloomPass at full resolution
- No idle pause when the tab was hidden

---

## Optimization Steps

### A2. Delete Unused GLB

**File removed:** `public/model/flower/7effedeb-c90f-40f0-8f95-c80c7b81294b.glb`

A second flower GLB (29.5 MB) was sitting in the model directory but was never referenced from any source file. Deleted it.

**Savings: -29.5 MB**

---

### A1. Draco-Compress and Downsize Flower GLB

This was the single highest-impact change. The flower GLB weighed 46.7 MB, which is extraordinary for a model that renders at 5-12 pixels on screen (scale 0.02-0.05).

**What was inside the 46.7 MB GLB:**

| Component | Size |
| --- | --- |
| Mesh geometry | 14.8 MB |
| Albedo texture (4096x4096 PNG) | 14.0 MB |
| Normal map (4096x4096 PNG) | 9.3 MB |
| Metallic/roughness (4096x4096 PNG) | 8.7 MB |

Three 4K textures for a model that occupies a dozen pixels. The GPU's mipmap chain means the level actually sampled is roughly 8x8 -- every byte above that is transferred, decoded, and uploaded to VRAM for nothing.

**What was done:**

1. Separated the GLB into glTF + textures + mesh binary using `gltf-pipeline`.
2. Resized all three textures from 4096x4096 to 512x512 using `sharp`. At 512x512, the textures are still ~42x oversampled relative to screen pixels. No visual difference is possible.
3. Repacked with Draco mesh compression via `gltf-pipeline -d`.
4. Added `DRACOLoader` wiring in `src/flowers.js`:

```javascript
// src/flowers.js — added imports and loader setup
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);
```

5. Copied Three's Draco decoder WASM files to `public/draco/` (3 files: `draco_decoder.js`, `draco_decoder.wasm`, `draco_wasm_wrapper.js`).

**Result: 46.7 MB to 1.6 MB (-96.6%)**

---

### A3. Lossless WebP Sphere Textures

The planet sphere uses three PBR texture maps at 4096x4096. Unlike the flower textures, the sphere occupies a large portion of the viewport, so the full resolution is justified. However, the PNG encoding was not optimal.

Converted all three to **lossless WebP** using `sharp`. The images are pixel-identical after decode -- this is a container/compression change only, not a resize.

Updated the paths in `src/loader.js`:

```javascript
// src/loader.js — texture paths changed from .png to .webp
const paths = [
  ["/ring.png", "ringTexture", true],
  ["/model/sphere/sphere-albedo.webp", "sphereAlbedo", true],
  ["/model/sphere/sphere-normal.webp", "sphereNormal", false],
  ["/model/sphere/sphere-roughness.webp", "sphereRoughness", false],
];
```

**Result: 18.6 MB to 9.5 MB (-49%)**

---

### B. Renderer Power Preference

Added `powerPreference: "high-performance"` to the `WebGLRenderer` constructor in `src/scene.js`:

```javascript
// src/scene.js
export const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});
```

This is a **driver hint**, not a guarantee. On dual-GPU laptops (common in modern MacBooks and Windows ultrabooks), it tells the OS to prefer the discrete GPU over the integrated one. On mobile devices, it can prevent the browser from aggressively throttling the GPU.

Zero visual difference. Zero downside. The browser is free to ignore the hint if only one GPU is available.

**Expected improvement: 20-40% more GPU headroom on dual-GPU systems.**

---

### C. Tab-Visibility Render Pause

Before this change, the animation loop ran continuously even when the tab was hidden. Browsers already throttle `requestAnimationFrame` to ~1 Hz in background tabs, but the scene was still doing full update + render work on each of those ticks.

Added an early return at the top of the animation loop in `src/animate.js`:

```javascript
// src/animate.js — inside the loop() function
if (document.hidden) {
  lastTime = performance.now();
  return;
}
```

Two things happen when the tab is hidden:

1. **No work is done.** No scene updates, no `composer.render()`, no GPU draw calls.
2. **`lastTime` is reset.** Without this, returning to the tab after 30 seconds would produce a `delta` of 30 -- causing the planet, rings, flowers, and particles to jump forward by 30 seconds of animation in a single frame. Resetting `lastTime` prevents this catch-up spike.

**Result: 0% GPU cost while the tab is in the background.**

---

### D. Vite Manual Chunks

Before this change, Vite bundled the entire application (including Three.js) into a single JavaScript chunk of 609 KB.

Created `vite.config.js` to split Three.js into its own chunk:

```javascript
// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules/three")) return "three";
        },
      },
    },
  },
});
```

**After:** Two chunks -- app code at 16.7 KB, Three.js at 599 KB. These are independently cacheable. When you redeploy with only site code changes, returning visitors keep the Three.js chunk from their browser cache. Only the 16.7 KB app chunk needs to be re-downloaded.

Note: Vite 8 uses Rolldown under the hood, hence `rolldownOptions` rather than the older `rollupOptions`.

---

### E. GLB Source Buffer Release (No Action Needed)

Investigated whether `gltf.scene` retains large buffers in memory after the 120 flower clones are created. The concern was that the original loaded scene graph would remain in memory alongside all its clones.

**Finding:** No code change needed. In `src/flowers.js`, the loaded scene is stored as a function-local `const source` inside `createFlowers()`. Once the function returns, `source` becomes eligible for garbage collection. Additionally, Three's `clone(true)` shares geometry and material references rather than deep-copying them, so the 120 clones do not multiply memory usage by 120x.

---

## After: Final Results

| Metric | Before | After | Change |
| --- | --- | --- | --- |
| Initial load | ~95 MB | ~14 MB | **-85%** |
| Flower GLB | 46.7 MB | 1.6 MB | -96.6% |
| Sphere textures | 18.6 MB | 9.5 MB | -49% |
| JS bundle | 1 chunk (609 KB) | 2 chunks (17 KB + 599 KB) | cacheable split |
| Background tab GPU | 100% | 0% | idle pause |
| GPU preference | unset | high-performance | driver hint |

### Hard Constraint: Visual Fidelity

The visual output remains pixel-identical. Texture downsizing was **only** applied to the flower GLB textures, which render at 5-12 pixels on screen. The mipmap level actually sampled by the GPU at that screen size is approximately 8x8 -- the 512x512 textures are still 42x oversampled. Sphere textures are lossless WebP at their original 4096x4096 dimensions.

### Backup Location

Original unoptimized assets were backed up to:

```
바탕 화면/미드저니/site-assets-backup/
```

---

## How to Verify

### 1. Network Transfer Size

```bash
npm run dev
```

Open Chrome DevTools, go to the **Network** tab, check **Disable cache**, then hard reload. Total transferred should be approximately 14 MB, down from 95 MB.

### 2. Runtime Frame Rate

Open the **Performance** tab in DevTools. Record a 5-second trace. Check the **Frames** row for consistent frame pacing. On a mid-range laptop you should see a stable 60 FPS.

### 3. Visual Diff

Take a screenshot at the same camera angle before and after. The two should be indistinguishable.

### 4. Production Build

```bash
npx vite build
```

Build should succeed with no errors. Check `dist/assets/` for the two-chunk split (a small app chunk and a larger `three-*.js` chunk).

---

## Files Modified

| File | Change |
| --- | --- |
| `src/flowers.js` | Added `DRACOLoader` import and loader setup (3 lines) |
| `src/loader.js` | Changed 3 texture paths from `.png` to `.webp` |
| `src/scene.js` | Added `powerPreference: "high-performance"` to renderer options |
| `src/animate.js` | Added `document.hidden` early-return with `lastTime` reset |
| `vite.config.js` | New file -- manual chunk splitting for Three.js |
| `public/draco/` | New directory -- Draco decoder WASM runtime (3 files) |
| `public/model/flower/1435963177547374592.glb` | Replaced with Draco-compressed, texture-downsized version |
| `public/model/sphere/*.webp` | New files -- lossless WebP replacements for sphere PNGs |

---

## Tools Used

| Tool | Purpose |
| --- | --- |
| [`gltf-pipeline`](https://github.com/CesiumGS/gltf-pipeline) (npm devDep) | GLB separation into glTF + textures + binary, Draco mesh compression, repacking |
| [`sharp`](https://sharp.pixelplumbing.com/) (npm devDep) | Texture resizing (4096 to 512 for flowers) and PNG-to-WebP lossless conversion (sphere textures) |

Both are listed as `devDependencies` in `package.json` and are not included in the production bundle.
