import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

// 💡 새롭게 추가할 패스와 셰이더들 Import
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { HueSaturationShader } from "three/addons/shaders/HueSaturationShader.js";
import { BrightnessContrastShader } from "three/addons/shaders/BrightnessContrastShader.js";

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
  // ShaderPass들은 내부적으로 해상도(resolution)를 크게 타지 않아서
  // 별도로 setSize를 해주지 않아도 괜찮습니다.
}

export function disposeComposer() {
  composer.dispose();
}
