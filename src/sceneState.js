import * as THREE from "three";

// Distance thresholds (camera distance from controls.target)
const TRANSITION_START = 1.8;
const TRANSITION_END = 1.15;

// Smoothing factor for progress (higher = snappier, lower = more cinematic)
const DAMP_FACTOR = 4;

// States
export const ORBITAL = "ORBITAL";
export const TRANSITION_IN = "TRANSITION_IN";
export const LANDSCAPE = "LANDSCAPE";
export const TRANSITION_OUT = "TRANSITION_OUT";

// --- State ---
let current = ORBITAL;
let rawProgress = 0; // instant, unsmoothed
let progress = 0; // smoothed 0..1 (0 = orbital, 1 = landscape)

// Orbital "base" opacities — captured once so we can restore exactly.
const baseOpacities = {
  rings: [], // filled on first call to captureBaseOpacities
  planet: 0,
  petals: 0,
  glitterOpacity: 0,
  starsOpacity: 0,
};
let captured = false;

// Orbital atmosphere originals — captured at init from live scene.
let baseAtmosphere = null;

// ---- helpers ----

function inverseLerp(a, b, v) {
  return Math.max(0, Math.min(1, (v - a) / (b - a)));
}

// Map progress into a sub-range, returning 0..1 within that window.
function subRange(p, start, end) {
  return Math.max(0, Math.min(1, (p - start) / (end - start)));
}

// ---- public API ----

export function getState() {
  return current;
}
export function getProgress() {
  return progress;
}

/**
 * Capture the orbital atmosphere values once so we can restore them perfectly.
 * Called from animate.js on first frame.
 */
export function captureAtmosphere(scene, bloomPass, ambientLight) {
  if (baseAtmosphere) return;
  baseAtmosphere = {
    bgColor: scene.background.clone(),
    fogNear: scene.fog.near,
    fogFar: scene.fog.far,
    bloomStrength: bloomPass.strength,
    ambientIntensity: ambientLight.intensity,
  };
}

// Landscape target atmosphere
const LANDSCAPE_SKY = new THREE.Color("#5a8a9a");
const LANDSCAPE_FOG_NEAR = 8;
const LANDSCAPE_FOG_FAR = 50;
const LANDSCAPE_BLOOM_STRENGTH = 0.15;
const LANDSCAPE_AMBIENT_INTENSITY = 1.4; // 1.2 -> 1.4 초미세 상향

/**
 * Call every frame with the current camera distance.
 */
export function update(cameraDistance, delta) {
  rawProgress = 1 - inverseLerp(TRANSITION_END, TRANSITION_START, cameraDistance);

  // Smooth toward raw target
  progress = THREE.MathUtils.damp(progress, rawProgress, DAMP_FACTOR, delta);

  // Snap to boundaries to avoid float drift
  if (progress < 0.001) progress = 0;
  if (progress > 0.999) progress = 1;

  // Derive state from progress
  if (progress === 0) {
    current = ORBITAL;
  } else if (progress === 1) {
    current = LANDSCAPE;
  } else if (rawProgress > progress) {
    current = TRANSITION_IN;
  } else {
    current = TRANSITION_OUT;
  }
}

/**
 * Capture base opacities from live objects (called once).
 */
export function captureBaseOpacities(planet, rings, stars, glitter, bubbles, flowers, petals) {
  if (captured) return;
  captured = true;

  baseOpacities.planet = planet.material.opacity;
  baseOpacities.petals = petals.material.opacity;
  baseOpacities.glitterOpacity = glitter.material.uniforms.uOpacity.value;
  baseOpacities.starsOpacity = stars.material.uniforms.uOpacity.value;

  rings.forEach((r) => {
    baseOpacities.rings.push(r.material.opacity);
  });
}

/**
 * Apply transition fading to all orbital objects based on current progress.
 * Restores exact base values when progress === 0.
 */
export function applyTransitionFade(planet, rings, stars, glitter, bubbles, flowers, petals) {
  const p = progress;

  if (p === 0) {
    // Restore originals exactly
    planet.material.opacity = baseOpacities.planet;
    planet.visible = true;
    petals.material.opacity = baseOpacities.petals;
    petals.visible = true;
    glitter.material.uniforms.uOpacity.value = baseOpacities.glitterOpacity;
    glitter.visible = true;
    stars.material.uniforms.uOpacity.value = baseOpacities.starsOpacity;
    stars.visible = true;
    bubbles.material.uniforms.uFade.value = 1;
    bubbles.visible = true;
    flowers.visible = true;
    flowers.traverse((obj) => {
      if (obj.isMesh && obj.material) {
        obj.material.opacity = 1;
      }
    });
    rings.forEach((r, i) => {
      r.material.opacity = baseOpacities.rings[i];
      r.visible = true;
    });
    return;
  }

  // Compute per-layer fade (each mapped to its sub-range)
  const starsFade = 1 - subRange(p, 0.0, 0.4);
  const ringsFade = 1 - subRange(p, 0.0, 0.6);
  const glitterFade = 1 - subRange(p, 0.0, 0.6);
  const bubblesFade = 1 - subRange(p, 0.0, 0.5);
  const flowersFade = 1 - subRange(p, 0.0, 0.6);
  const petalsFade = 1 - subRange(p, 0.0, 0.6);
  const planetFade = 1 - subRange(p, 0.5, 0.6);

  // Stars
  stars.material.uniforms.uOpacity.value = baseOpacities.starsOpacity * starsFade;
  stars.visible = starsFade > 0;

  // Rings
  rings.forEach((r, i) => {
    r.material.opacity = baseOpacities.rings[i] * ringsFade;
    r.visible = ringsFade > 0;
  });

  // Glitter
  glitter.material.uniforms.uOpacity.value = baseOpacities.glitterOpacity * glitterFade;
  glitter.visible = glitterFade > 0;

  // Bubbles
  bubbles.material.uniforms.uFade.value = bubblesFade;
  bubbles.visible = bubblesFade > 0;

  // Flowers
  flowers.visible = flowersFade > 0;
  if (flowers.visible) {
    flowers.traverse((obj) => {
      if (obj.isMesh && obj.material) {
        obj.material.opacity = flowersFade;
      }
    });
  }

  // Petals
  petals.material.opacity = baseOpacities.petals * petalsFade;
  petals.visible = petalsFade > 0;

  // Planet (last to disappear)
  planet.material.opacity = baseOpacities.planet * planetFade;
  planet.visible = planetFade > 0;
}

/**
 * Interpolate atmosphere between orbital and landscape values.
 * Only called when progress > 0; at progress === 0 originals are already set.
 */
export function applyAtmosphere(scene, bloomPass, ambientLight) {
  if (!baseAtmosphere || progress === 0) return;

  const p = progress;

  scene.background.copy(baseAtmosphere.bgColor).lerp(LANDSCAPE_SKY, p);
  scene.fog.near = THREE.MathUtils.lerp(baseAtmosphere.fogNear, LANDSCAPE_FOG_NEAR, p);
  scene.fog.far = THREE.MathUtils.lerp(baseAtmosphere.fogFar, LANDSCAPE_FOG_FAR, p);
  
  // Create a transition glow peak (dreamy pass-through effect)
  // Shift peak to the very end and make it explode, then vanish at 1.0
  const transitionGlow = Math.pow(p, 6.0) * 15.0; 
  const finalFade = THREE.MathUtils.smoothstep(p, 0.9, 1.0); // 0.9부터 1.0까지 0으로 수렴
  
  bloomPass.strength = THREE.MathUtils.lerp(
    baseAtmosphere.bloomStrength,
    LANDSCAPE_BLOOM_STRENGTH,
    p,
  ) + (transitionGlow * (1.0 - finalFade));

  ambientLight.intensity = THREE.MathUtils.lerp(
    baseAtmosphere.ambientIntensity,
    LANDSCAPE_AMBIENT_INTENSITY,
    p,
  );
}

/**
 * Restore atmosphere to exact orbital originals. Called when progress hits 0.
 */
export function restoreAtmosphere(scene, bloomPass, ambientLight) {
  if (!baseAtmosphere) return;
  scene.background.copy(baseAtmosphere.bgColor);
  scene.fog.near = baseAtmosphere.fogNear;
  scene.fog.far = baseAtmosphere.fogFar;
  bloomPass.strength = baseAtmosphere.bloomStrength;
  ambientLight.intensity = baseAtmosphere.ambientIntensity;
}
