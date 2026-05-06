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
import { startBlueprint, abortBlueprint, getBpCamera } from "./blueprint/blueprintController.js";
import { getBlueprintScene } from "./blueprint/blueprintScene.js";
import { forceClosePlanetWindow } from "./blueprint/blueprintPlanetWindow.js";
import { unmountIridescentHud } from "./blueprint/blueprintIridescentHud.js";

const assets = await loadTextures();
const _bgCanvas = document.getElementById("bg");

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

scene.add(camera);
camera.add(landscapeLights);

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

const IRI_TITLEBAR_H = 34;
const IRI_STATUSBAR_H = 32;
let _iriBackdrop = null;

function _getIriWinDims() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const w = Math.min(900, Math.floor(vw * 0.88));
  const h = Math.min(620, Math.floor(vh * 0.82));
  return { l: Math.floor((vw - w) / 2), t: Math.floor((vh - h) / 2), w, h };
}

function _positionIriCanvas({ left, top, width, height }, deferComposer = false) {
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
  // On initial entry the canvas is opacity:0 — defer the expensive bloom resize to avoid
  // blocking the JS thread synchronously (which causes the visible freeze before popup).
  // On fullscreen toggle the canvas is visible, so resize immediately.
  if (deferComposer) {
    requestAnimationFrame(() => resizeComposer(width, height));
  } else {
    resizeComposer(width, height);
  }
  Object.assign(_bgCanvas.style, {
    position: "fixed",
    left:     left   + "px",
    top:      top    + "px",
    width:    width  + "px",
    height:   height + "px",
  });
  controls.update();
}

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

// Called from planet window ENTER: renders iridescent into a windowed rect.
async function mountIridescentInRect() {
  // Snapshot the blueprint canvas BEFORE stopping it — use as blurred backdrop.
  // Force one explicit render so the drawing buffer is guaranteed to be populated,
  // then read it synchronously (before the buffer can be swapped/cleared).
  if (_iriBackdrop) { _iriBackdrop.remove(); _iriBackdrop = null; }
  const _bpCam = getBpCamera();
  const _bpScn = getBlueprintScene();
  if (_bpCam && _bpScn) {
    renderer.render(_bpScn, _bpCam);          // explicit render → fills drawing buffer
    const snapshot = _bgCanvas.toDataURL("image/jpeg", 0.88);
    _iriBackdrop = document.createElement("div");
    _iriBackdrop.className = "bp-iri-backdrop";
    _iriBackdrop.style.backgroundImage = `url(${snapshot})`;
    document.body.appendChild(_iriBackdrop);
  }

  abortBlueprint();

  // Hide canvas immediately (no transition) before any sizing — prevents frozen/stretched frame
  _bgCanvas.style.transition = "none";
  _bgCanvas.style.opacity    = "0";
  _bgCanvas.style.zIndex     = "36";

  camera.position.set(0, 0.4, 7);
  camera.lookAt(0, 0, 0);
  controls.target.set(0, 0, 0);
  controls.enabled = true;

  const winDims = _getIriWinDims();
  _positionIriCanvas({
    left:   winDims.l,
    top:    winDims.t + IRI_TITLEBAR_H,
    width:  winDims.w,
    height: winDims.h - IRI_TITLEBAR_H - IRI_STATUSBAR_H,
  }, true);

  // Planet window path: overlay stays hidden, no intro text (window frame serves as UI)
  animate(
    planet, rings, stars, glitter, bubbles, flowers, petals,
    astrophage, mist, spores, landscapeLights,
    returnToBlueprint,
  );

  // Kick off fade-in after 2 frames — fire-and-forget so caller can sync cross-fade
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      _bgCanvas.style.transition = "opacity 0.4s ease";
      _bgCanvas.style.opacity    = "1";
      setTimeout(() => { _bgCanvas.style.transition = ""; }, 400);
    });
  });

  return { onBack: returnToBlueprint, onCanvasResize: _positionIriCanvas, winDims };
}

function startIridescent() {
  controls.enabled = true;

  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  resizeComposer(w, h);

  window.removeEventListener("resize", onResize);
  window.addEventListener("resize", onResize);

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

  // Clean up planet window, HUD, and backdrop
  unmountIridescentHud();
  forceClosePlanetWindow();
  if (_iriBackdrop) { _iriBackdrop.remove(); _iriBackdrop = null; }

  // Clear all inline canvas styles (restores CSS default: position:fixed; inset:0)
  _bgCanvas.style.cssText = "";

  controls.enabled = false;
  controls.target.set(0, 0, 0);
  controls.minDistance = 1.1;
  controls.maxDistance = 12;
  controls.zoomSpeed = 1;
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI;
  controls.update();

  camera.position.set(0, 0.4, 7);
  camera.lookAt(0, 0, 0);

  disposeLandscape();

  // Reset intro text state so next startIridescent animates cleanly
  document.getElementById("title-group")?.classList.remove("visible", "fading");
  document.getElementById("hint-text")?.classList.remove("dismissed");

  const iridescentOverlay = document.getElementById("overlay");
  if (iridescentOverlay) iridescentOverlay.style.display = "none";

  startBlueprint(startIridescent, mountIridescentInRect);
}

startBlueprint(startIridescent, mountIridescentInRect);
