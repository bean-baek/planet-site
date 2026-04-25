import * as THREE from "three";
import "./style.css";
import { scene, camera, renderer } from "./scene.js";
import { loadTextures } from "./loader.js";
import { createPlanet, disposePlanet, AURORA } from "./planet.js";
import { createRings, disposeRings } from "./rings.js";
import { stars, disposeStars } from "./stars.js";
import { glitter, disposeGlitter } from "./glitter.js";
import { bubbles, disposeBubbles } from "./bubbles.js";
import { createFlowers, disposeFlowers } from "./flowers.js";
import { petals, disposePetals } from "./petals.js";
import { createAstrophage } from "./astrophage.js";
import { createMist } from "./mist.js";
import { createSpores } from "./spores.js";
import {
  createLandscape,
  createLandscapeLights,
  disposeLandscape,
} from "./landscape.js";
import { resizeComposer, disposeComposer } from "./composer.js";
import { animate, cancelAnimation } from "./animate.js";
import { controls } from "./controls.js";
import { showScene } from "./ui.js";
import { startBlueprint } from "./blueprint/blueprintController.js";

const assets = await loadTextures();

const planet = createPlanet({
  ...AURORA,
  textures: {
    albedo: assets.sphereAlbedo,
    normal: assets.sphereNormal,
    roughness: assets.sphereRoughness,
  },
});
const rings = createRings();
const flowers = await createFlowers();
const astrophage = createAstrophage();
const mist = createMist();
const spores = createSpores();
const landscapeLights = createLandscapeLights();

// 카메라를 씬에 추가 (자식 오브젝트인 조명을 렌더링하기 위함)
scene.add(camera);
camera.add(landscapeLights);

// 나머지 요소는 기존대로 씬에 추가
scene.add(
  planet,
  ...rings,
  stars,
  glitter,
  bubbles,
  flowers,
  petals,
  astrophage,
  mist,
  spores,
);

function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  resizeComposer(w, h);
}
window.addEventListener("beforeunload", () => {
  cancelAnimation();
  disposeRings(rings);
  disposePlanet(planet);
  disposeStars();
  disposeGlitter();
  disposeBubbles();
  disposeFlowers(flowers);
  disposePetals();
  disposeLandscape();
  disposeComposer();
  controls.dispose();
});

function startIridescent() {
  controls.enabled = true;

  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  resizeComposer(w, h);

  // Guard against duplicate listeners on re-entry
  window.removeEventListener("resize", onResize);
  window.addEventListener("resize", onResize);

  // Restore iridescent overlay (was hidden during blueprint)
  const iridescentOverlay = document.getElementById("overlay");
  if (iridescentOverlay) iridescentOverlay.style.display = "";

  showScene();

  animate(
    planet,
    rings,
    stars,
    glitter,
    bubbles,
    flowers,
    petals,
    astrophage,
    mist,
    spores,
    landscapeLights,
    returnToBlueprint,
  );
}

function returnToBlueprint() {
  cancelAnimation();
  window.removeEventListener("resize", onResize);

  // Full controls reset
  controls.enabled = false;
  controls.target.set(0, 0, 0);
  controls.minDistance = 1.1;
  controls.maxDistance = 12;
  controls.zoomSpeed = 1;
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI;

  // Camera snap back to default orbital position
  camera.position.set(0, 0.4, 7);
  camera.lookAt(0, 0, 0);

  // Clean up landscape so it recreates fresh next entry
  disposeLandscape();

  const iridescentOverlay = document.getElementById("overlay");
  if (iridescentOverlay) iridescentOverlay.style.display = "none";

  startBlueprint(startIridescent);
}

startBlueprint(startIridescent);
