import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

import { renderer, scene, camera } from "./scene.js";

export const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85,
);
bloomPass.threshold = 0.75; // only bright highlights bloom
bloomPass.strength = 0.75; // gentle soft glow
bloomPass.radius = 0.9; // wide soft falloff

export const composer = new EffectComposer(renderer);

// 1. 기본 씬 렌더링
composer.addPass(new RenderPass(scene, camera));

// 2. 몽환적인 블룸 효과 먼저 적용
composer.addPass(bloomPass);

// Call from the resize handler
export function resizeComposer(w, h) {
  composer.setSize(w, h);
  bloomPass.setSize(w, h);
}

export function disposeComposer() {
  composer.dispose();
}
