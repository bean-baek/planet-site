import * as THREE from "three";
import { composer, bloomPass } from "./composer.js";
import { controls, setControlsMode, updateCameraMovement } from "./controls.js";
import { renderer, scene, camera } from "./scene.js";
import {
  update as updateState,
  getState,
  getProgress,
  captureAtmosphere,
  captureBaseOpacities,
  applyTransitionFade,
  applyAtmosphere,
  restoreAtmosphere,
  ORBITAL,
  LANDSCAPE,
} from "./sceneState.js";
import { createLandscape, getLandscape, updateLandscape } from "./landscape.js";
import { updateMist } from "./mist.js";
import { updateSpores } from "./spores.js";
import { updateOverlay } from "./ui.js";

let lastTime = performance.now();
export let rafId = null;

// Rotation speeds in radians/second (framerate-independent)
const PLANET_ROT_Y = 0.3;
const STARS_ROT_Y = 0.03;

const RING_BASE_ROT_Z = 0.3; // 링의 기본 회전 속도
const RING_PARALLAX_STEP = 0.006;

// Find the ambient light in the scene (added in scene.js)
let ambientLight = null;
scene.traverse((obj) => {
  if (obj.isAmbientLight && !ambientLight) ambientLight = obj;
});

let prevState = ORBITAL;
let landscapeCreated = false;

export function animate(planet, rings, stars, glitter, bubbles, flowers, petals, astrophage, mist, spores, landscapeLights) {
  // Capture base values on first call (before any transition)
  captureBaseOpacities(planet, rings, stars, glitter, bubbles, flowers, petals);
  captureAtmosphere(scene, bloomPass, ambientLight);

  function loop() {
    rafId = requestAnimationFrame(loop);

    // Skip work while the tab is hidden
    if (document.hidden) {
      lastTime = performance.now();
      return;
    }

    const now = performance.now();
    const delta = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    // --- State machine update ---
    const camDist = camera.position.distanceTo(controls.target);
    updateState(camDist, delta);

    const state = getState();
    const progress = getProgress();

    // --- Transition handling ---
    if (progress > 0) {
      // Lazy-create landscape on first transition
      if (!landscapeCreated) {
        createLandscape(scene);
        landscapeCreated = true;
      }

      // Fade orbital objects
      applyTransitionFade(planet, rings, stars, glitter, bubbles, flowers, petals);

      // Landscape visibility & Lighting Sync
      const landscape = getLandscape();
      if (landscape) {
        const landscapeAlpha = THREE.MathUtils.smoothstep(progress, 0.9, 1.0);
        landscape.visible = landscapeAlpha > 0;
        landscape.material.opacity = landscapeAlpha;
        landscape.material.transparent = landscapeAlpha < 1;
        
        // [최적화] 시선 추적 조명 동기화 (카메라에 부착됨)
        if (landscapeLights) {
          landscapeLights.visible = landscapeAlpha > 0;
          
          landscapeLights.children.forEach(light => {
            if (light.isDirectionalLight) {
              const hex = light.color.getHex();
              const baseInt = (hex === 0xffffff) ? 0.4 : (hex === 0xe8d6ff ? 0.3 : 0.4);
              light.intensity = baseInt * landscapeAlpha;
            }
          });
        }
      }

      // Atmosphere interpolation
      applyAtmosphere(scene, bloomPass, ambientLight);
      
      updateMist(delta, progress);
      updateSpores(spores, delta, progress);
    } else {
      // Fully orbital — restore everything exactly
      applyTransitionFade(planet, rings, stars, glitter, bubbles, flowers, petals);
      restoreAtmosphere(scene, bloomPass, ambientLight);

      const landscape = getLandscape();
      if (landscape) landscape.visible = false;
      if (mist) mist.visible = false;
      if (spores) spores.visible = false;
      if (landscapeLights) landscapeLights.visible = false;
    }

    // --- UI overlay ---
    updateOverlay(progress);

    // --- Controls mode switch on state change ---
    if (state === LANDSCAPE && prevState !== LANDSCAPE) {
      setControlsMode("landscape");
    } else if (state === ORBITAL && prevState !== ORBITAL) {
      setControlsMode("orbital");
    }
    prevState = state;

    // --- 상태별 전용 업데이트 (성능 최적화 및 레이어 분리) ---
    if (state !== LANDSCAPE) {
      // 1. 행성 궤도 및 트렌지션 요소 업데이트
      planet.rotation.y += PLANET_ROT_Y * delta;
      stars.rotation.y += STARS_ROT_Y * delta;
      glitter.material.uniforms.uTime.value += delta;
      bubbles.material.uniforms.uTime.value += delta;

      flowers.children.forEach((orbit) => {
        orbit.rotation.z += orbit.userData.speed * delta;
      });

      rings.forEach((ring, index) => {
        const parallaxSpeed = RING_BASE_ROT_Z + index * RING_PARALLAX_STEP;
        ring.rotation.z += parallaxSpeed * delta;
      });

      // 2. 파티클 업데이트 (트렌지션 구간에서만)
      if (astrophage) {
        if (progress > 0 && progress < 0.99) {
          astrophage.visible = true;
          astrophage.material.uniforms.uTime.value += delta;
          astrophage.material.uniforms.uProgress.value = progress;
        } else {
          astrophage.visible = false;
        }
      }
    } else {
      // 3. 지표면(Landscape) 전용 업데이트
      if (astrophage) astrophage.visible = false;
      
      // [탐험 시스템] 키보드 이동 실행
      updateCameraMovement(delta);
      
      // [핵심] 조명은 이미 카메라 자식이므로 가시성만 보장
      if (landscapeLights) landscapeLights.visible = true;

      updateLandscape(delta);
      updateMist(delta, progress);
      updateSpores(spores, delta, progress);
    }

    controls.update();
    composer.render();
  }

  rafId = requestAnimationFrame(loop);
}
