import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { renderer, scene, camera } from "./scene.js";

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85,
);
bloomPass.threshold = 0.25;  // higher threshold lets iridescent colors show through
bloomPass.strength = 0.85;   // softer bloom so pastel bands aren't blown out
bloomPass.radius = 0.6;

export const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(bloomPass);

// Call from the resize handler — must happen after renderer.setSize()
// UnrealBloomPass stores its own internal render targets; setSize() on both
// the composer and the bloom pass keeps their buffers in sync with the viewport.
export function resizeComposer(w, h) {
  composer.setSize(w, h);
  bloomPass.setSize(w, h);
}
