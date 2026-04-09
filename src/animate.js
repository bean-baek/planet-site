import { composer } from "./composer.js";
import { controls } from "./controls.js";

let lastTime = performance.now();

// Rotation speeds in radians/second (framerate-independent)
const PLANET_ROT_Y = 0.3;
const STARS_ROT_Y = 0.03;
const GLITTER_ROT_Y = 0.05;

export function animate(planet, rings, stars, glitter) {
  requestAnimationFrame(() => animate(planet, rings, stars, glitter));

  const now = performance.now();
  const delta = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  planet.rotation.y += PLANET_ROT_Y * delta;
  stars.rotation.y += STARS_ROT_Y * delta;
  glitter.rotation.y += GLITTER_ROT_Y * delta;

  // Each ring drifts at a slightly different rate for a parallax shimmer
  rings.forEach((ring) => {
    ring.rotation.z += 4 * delta;
  });

  controls.update();
  composer.render();
}
