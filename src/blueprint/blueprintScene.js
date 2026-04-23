import * as THREE from "three";

let bpScene = null;
let viewport = { w: 1, h: 1 };

export function createBlueprintScene() {
  if (bpScene) return bpScene;
  bpScene = new THREE.Scene();
  bpScene.background = new THREE.Color(0x050505);
  bpScene.fog = new THREE.FogExp2(0x050505, 0.055);

  const ambient = new THREE.AmbientLight(0xffffff, 1.0);
  bpScene.add(ambient);

  return bpScene;
}

export function getBlueprintScene() {
  return bpScene;
}

export function setViewport(w, h) {
  viewport.w = w;
  viewport.h = h;
}

export function getViewport() {
  return viewport;
}

export function disposeBlueprintScene() {
  if (!bpScene) return;
  bpScene.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((m) => m.dispose?.());
    }
  });
  bpScene = null;
}
