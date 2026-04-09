import "./style.css";
import { scene, camera, renderer } from "./scene.js";
import { loadTextures } from "./loader.js";
import { createPlanet } from "./planet.js";
import { createRings } from "./rings.js";
import { stars } from "./stars.js";
import { glitter } from "./glitter.js";
import { resizeComposer } from "./composer.js";
import { animate } from "./animate.js";
import { showScene } from "./ui.js";

const { planetTexture } = await loadTextures();

const planet = createPlanet(planetTexture);
const rings = createRings();

scene.add(planet, ...rings, stars, glitter);

window.addEventListener("resize", () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  resizeComposer(w, h);
});

showScene();
animate(planet, rings, stars, glitter);
