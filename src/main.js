import * as THREE from "three";
import "./style.css";
import { scene, camera, renderer } from "./scene.js";
import { loadTextures } from "./loader.js";
import { createPlanet, disposePlanet } from "./planet.js";
import { createRings, disposeRings } from "./rings.js";
import { stars, disposeStars } from "./stars.js";
import { glitter, disposeGlitter } from "./glitter.js";
import { bubbles, disposeBubbles } from "./bubbles.js";
import { createFlowers, disposeFlowers } from "./flowers.js";
import { petals, disposePetals } from "./petals.js";
import { createAstrophage } from "./astrophage.js";
import { createMist } from "./mist.js";
import { createSpores } from "./spores.js";
import { createLandscape, createLandscapeLights, disposeLandscape } from "./landscape.js";
import { resizeComposer, disposeComposer } from "./composer.js";
import { animate } from "./animate.js";
import { controls } from "./controls.js";
import { showScene } from "./ui.js";

const assets = await loadTextures();

const planet = createPlanet(assets);
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
scene.add(planet, ...rings, stars, glitter, bubbles, flowers, petals, astrophage, mist, spores);

function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  resizeComposer(w, h);
}
window.addEventListener("resize", onResize);

window.addEventListener("beforeunload", () => {
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

showScene();

// 모든 인자를 빠짐없이 전달 (특히 landscapeLights)
animate(planet, rings, stars, glitter, bubbles, flowers, petals, astrophage, mist, spores, landscapeLights);
