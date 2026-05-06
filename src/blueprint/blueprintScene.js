import * as THREE from "three";

let bpScene = null;
let viewport = { w: 1, h: 1 };

export function createBlueprintScene() {
  if (bpScene) return bpScene;
  bpScene = new THREE.Scene();
  bpScene.background = new THREE.Color(0x0c1014);
  bpScene.fog = new THREE.FogExp2(0x0c1014, 0.055);

  const ambient = new THREE.AmbientLight(0xffffff, 1.0);
  const hemi = new THREE.HemisphereLight(0xe8d6ff, 0x060c10, 0.14);
  bpScene.add(ambient, hemi);

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

export function deferDisposeBlueprintScene() {
  const scene = bpScene;
  bpScene = null; // release reference immediately so createBlueprintScene() can start fresh
  if (!scene) return;
  requestAnimationFrame(() => {
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => m.dispose?.());
      }
    });
  });
}
