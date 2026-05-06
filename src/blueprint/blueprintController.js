import * as THREE from "three";
import { renderer } from "../scene.js";
import {
  createBlueprintScene,
  getBlueprintScene,
  setViewport,
  deferDisposeBlueprintScene,
} from "./blueprintScene.js";
import { createIrisPlanet, updateIrisResolution, clearIrisMats } from "./blueprintIris.js";
import { createDiscNode, updateNodesResolution, clearNodeMats } from "./blueprintNodes.js";
import {
  createBlueprintRings,
  updateBlueprintRings,
  updateRingsResolution,
  clearRingMats,
} from "./blueprintRings.js";
import {
  createSystemPlanets,
  showSystemPlanets,
  hideSystemPlanets,
  updateSystemPlanets,
  updateSysMatsResolution,
  clearSysMats,
} from "./blueprintSystemPlanets.js";
import {
  mountAnnotationLayer,
  buildAnnotations,
  updateAnnotations,
  unmountAnnotationLayer,
} from "./blueprintAnnotations.js";
import {
  mountBlueprintUI,
  unmountBlueprintUI,
  updateFocusPanel,
  clearFocusPanel,
  setRightPane,
  getLabelLayer,
  setUIOpacity,
  setPlanetHintVisible,
} from "./blueprintUI.js";
import { initLabels, setFocusLabels, clearLabels, updateLabels } from "./blueprintLabels.js";
import { pushSample, renderGraphs, ensureGraphsInDOM } from "./blueprintGraphs.js";
import { openPlanetWindow, closePlanetWindow, forceClosePlanetWindow } from "./blueprintPlanetWindow.js";
import {
  getMode,
  setMode,
  updateMode,
  getFocusTarget,
  getFocusProgress,
  getDissolveProgress,
  resetModeState,
  BLUEPRINT_IDLE,
  BLUEPRINT_FOCUS,
  BLUEPRINT_TO_IRIDESCENT,
  IRIDESCENT,
  onModeChange,
} from "../modeState.js";
import { controls } from "../controls.js";

const Z_DEFAULT = 7;
const Z_FOCUS = 4.5;

const NODE_DEFS = [
  { id: "PROJECT_ALPHA", type: "iris", position: new THREE.Vector3(-1.6,  0.5, 0), scale: 0.85, seed: 1  },
  { id: "PROJECT_BETA",  type: "iris", position: new THREE.Vector3( 1.8, -0.4, 0), scale: 0.70, seed: 42 },
  { id: "SENSOR_GRID",   type: "disc", position: new THREE.Vector3(-0.8, -1.3, 0), radius: 0.12 },
  { id: "SYSTEM_LOG",    type: "disc", position: new THREE.Vector3( 2.0,  0.9, 0), radius: 0.09 },
];

let bpCamera = null;
let bpNodes = [];
let ringsGroup = null;
let rafId = null;
let completeCb = null;
let mountIridescentFn = null;
let running = false;
let lastTime = 0;
let overlayEl = null;
let lastFocusedNode = null;
let hoveredPlanet = null;
let _removeModeListener = null;

const cameraLookAt = new THREE.Vector3(0, 0, 0);
const cameraTarget = new THREE.Vector3(0, 0, Z_DEFAULT);
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

export function startBlueprint(onComplete, mountIridescent) {
  // Always reset mode state so re-entry from iridescent starts clean
  resetModeState();

  completeCb        = onComplete;
  mountIridescentFn = mountIridescent ?? null;
  running = true;
  lastFocusedNode = null;
  hoveredPlanet = null;
  cameraTarget.set(0, 0, Z_DEFAULT);
  cameraLookAt.set(0, 0, 0);

  const w = window.innerWidth;
  const h = window.innerHeight;

  // Ensure renderer draws at full screen resolution — it may have been left at
  // the smaller windowed iridescent size after returning from planet view.
  renderer.setSize(w, h);

  const bpScene = createBlueprintScene();
  setViewport(w, h);

  bpCamera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
  bpCamera.position.set(0, 0, Z_DEFAULT);
  bpCamera.lookAt(0, 0, 0);

  ringsGroup = createBlueprintRings({ count: 28, seed: 42 });
  bpScene.add(ringsGroup);

  bpNodes = [];
  for (const def of NODE_DEFS) {
    let node;
    if (def.type === "iris") {
      node = createIrisPlanet({ id: def.id, position: def.position, scale: def.scale, seed: def.seed });
      const sysEntries = createSystemPlanets(def.id, node);
      node.userData.systemEntries = sysEntries;
    } else {
      node = createDiscNode({ id: def.id, nodeType: def.type, radius: def.radius, position: def.position });
    }
    bpScene.add(node);
    bpNodes.push(node);
  }

  mountAnnotationLayer(document.body);
  buildAnnotations({ nodes: bpNodes });

  mountBlueprintUI({ onMenuClick: handleMenuClick });
  initLabels(getLabelLayer());

  updateIrisResolution(w, h);
  updateNodesResolution(w, h);
  updateRingsResolution(w, h);
  updateSysMatsResolution(w, h);

  controls.enabled = false;

  const iridescentOverlay = document.getElementById("overlay");
  if (iridescentOverlay) iridescentOverlay.style.display = "none";
  document.getElementById("loader")?.classList.add("hidden");

  // Remove any stale overlay from a previous session
  document.getElementById("bp-overlay")?.remove();
  overlayEl = document.createElement("div");
  overlayEl.id = "bp-overlay";
  overlayEl.style.cssText = "position:fixed;inset:0;z-index:20;background:#0c1014;opacity:0;pointer-events:none;transition:none;";
  document.body.appendChild(overlayEl);

  _removeModeListener = onModeChange((next) => {
    if (next === IRIDESCENT) {
      _removeModeListener?.();
      _removeModeListener = null;
      stopBlueprint();
      completeCb?.();
    }
  });

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("click", onClick);
  window.addEventListener("resize", onResize);

  // Prime lastTime so the first frame has a normal ~16ms delta, not 0
  lastTime = performance.now() - 16;
  loop();
}

// ─── Menu / button handlers ────────────────────────────────────────────────

function handleMenuClick(item) {
  if (item.kind === "planet") {
    const node = bpNodes.find((n) => n.userData.nodeId === item.id);
    if (node) focusNode(node);
  } else {
    setRightPane(item.id === "SENSOR_GRID" ? "sensor" : "log");
  }
}

// ─── Return to idle (defocus) ─────────────────────────────────────────────

function returnToIdle() {
  if (lastFocusedNode) {
    if (lastFocusedNode.userData.systemEntries) hideSystemPlanets(lastFocusedNode.userData.systemEntries);
    if (lastFocusedNode.userData.detailGroup) lastFocusedNode.userData.detailGroup.visible = false;
    lastFocusedNode = null;
  }
  hoveredPlanet = null;
  setMode(BLUEPRINT_IDLE);
  cameraTarget.set(0, 0, Z_DEFAULT);
  cameraLookAt.set(0, 0, 0);
  clearLabels?.();
  clearFocusPanel();
  setPlanetHintVisible(false);
}

// ─── Focus a system node ──────────────────────────────────────────────────

function focusNode(node) {
  if (getMode() === BLUEPRINT_FOCUS && getFocusTarget() === node) return;

  if (lastFocusedNode && lastFocusedNode.userData.systemEntries) {
    hideSystemPlanets(lastFocusedNode.userData.systemEntries);
    lastFocusedNode.userData.detailGroup && (lastFocusedNode.userData.detailGroup.visible = false);
  }

  lastFocusedNode = node;
  hoveredPlanet = null;
  setMode(BLUEPRINT_FOCUS, { target: node });
  updateFocusPanel(node.userData.nodeId);

  const p = node.position;
  cameraTarget.set(p.x * 0.62, p.y * 0.5, Z_FOCUS);
  cameraLookAt.set(p.x, p.y, 0);

  if (node.userData.detailGroup) node.userData.detailGroup.visible = true;
  if (node.userData.systemEntries) showSystemPlanets(node.userData.systemEntries);

  setFocusLabels([
    {
      head: "SAT_ID: " + node.userData.nodeId.replace("PROJECT_", "") + "_1",
      lines: ["STATUS: CORE ANALYSIS", "orbit.r: 120km", "calc_integrity(" + node.userData.nodeId.toLowerCase() + "_core)"],
      anchorWorld: p.clone().add(new THREE.Vector3(0.5, 0.15, 0)),
      offset: { x: 0, y: -25 },
      side: "right",
    },
    {
      head: "RING.DATA",
      lines: ["PERIOD: 11.2d", "ω=2π/T", "COUNT: 42"],
      anchorWorld: p.clone().add(new THREE.Vector3(-0.55, -0.2, 0)),
      offset: { x: 0, y: 10 },
      side: "left",
    },
  ]);

  setPlanetHintVisible(true);
  ensureGraphsInDOM();
}

// ─── Per-frame: scale + fade all nodes based on focus state ──────────────

function applyFocusAnimation(focusedNode, fp, delta) {
  bpNodes.forEach((node) => {
    const isFocused = node === focusedNode;
    const baseScale = node.userData.baseScale ?? 1;
    const targetScale = baseScale * (fp > 0.01 ? (isFocused ? 1.75 : 0.72) : 1.0);
    node.scale.x = THREE.MathUtils.damp(node.scale.x, targetScale, 4, delta);
    node.scale.y = THREE.MathUtils.damp(node.scale.y, targetScale, 4, delta);
    node.scale.z = THREE.MathUtils.damp(node.scale.z, targetScale, 4, delta);

    const targetOp = fp > 0.01 ? (isFocused ? 1.0 : 0.09) : 1.0;
    node.traverse((child) => {
      if (!child.material) return;
      if (child.userData.isPlanet || child.userData.isRim || child.userData.isInnerDisc) return;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((m) => {
        const base = child.userData.baseOpacity ?? 1.0;
        const t = base * targetOp;
        m.opacity = THREE.MathUtils.damp(m.opacity, t, 4, delta);
        if (m.transparent === false && m.opacity < 0.999) m.transparent = true;
      });
    });
  });

  if (ringsGroup) {
    ringsGroup.userData.rings?.forEach((ring) => {
      const baseOp = ring.userData.baseOpacity ?? 0.4;
      const t = fp > 0.01 ? baseOp * 0.06 : baseOp;
      if (ring.material) ring.material.opacity = THREE.MathUtils.damp(ring.material.opacity, t, 4, delta);
    });
  }

}

// ─── Mouse events ──────────────────────────────────────────────────────────

function getHitObjects() {
  raycaster.setFromCamera(mouse, bpCamera);
  // Filter to Mesh only — THREE.Line has a default threshold of 1 world-unit
  // which intercepts clicks hundreds of pixels away from glyph/tick lines.
  return raycaster.intersectObjects(bpNodes, true).filter(h => h.object.isMesh);
}

function onMouseMove(e) {
  mouse.set(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1,
  );
  const mode = getMode();
  if (mode !== BLUEPRINT_IDLE && mode !== BLUEPRINT_FOCUS) return;

  const hits = getHitObjects();
  if (hits.length === 0) {
    document.body.style.cursor = "";
    hoveredPlanet = null;
    return;
  }

  let obj = hits[0].object;

  if (mode === BLUEPRINT_FOCUS) {
    // inner disc sits in front of outer disc — normalise to outer
    if (obj.userData.isInnerDisc) {
      obj = obj.parent?.children.find((c) => c.userData.isPlanet) ?? obj;
    }
    if (obj.userData.isPlanet) {
      document.body.style.cursor = "pointer";
      hoveredPlanet = obj;
    } else {
      document.body.style.cursor = "";
      hoveredPlanet = null;
    }
    return;
  }

  while (obj && !obj.userData.nodeId) obj = obj.parent;
  document.body.style.cursor = obj?.userData.nodeId ? "pointer" : "";
}

function onClick(e) {
  const mode = getMode();

  if (mode === BLUEPRINT_IDLE) {
    mouse.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1,
    );
    const hits = getHitObjects();
    if (hits.length === 0) return;
    let obj = hits[0].object;
    while (obj && !obj.userData.nodeId) obj = obj.parent;
    if (obj?.userData.nodeId) {
      const node = bpNodes.find((n) => n.userData.nodeId === obj.userData.nodeId);
      if (node) focusNode(node);
    }
    return;
  }

  if (mode === BLUEPRINT_FOCUS) {
    mouse.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1,
    );
    const hits = getHitObjects();

    // Click empty space → back to IDLE
    if (hits.length === 0) {
      returnToIdle();
      return;
    }

    let obj = hits[0].object;
    // inner disc sits in front — normalise to outer disc
    if (obj.userData.isInnerDisc) {
      obj = obj.parent?.children.find((c) => c.userData.isPlanet) ?? obj;
    } else if (!obj.userData.isPlanet) {
      // Satellite dot or other non-disc mesh — try parent pivot for sibling disc
      const disc = obj.parent?.parent?.children?.find((c) => c.userData.isPlanet);
      if (disc) obj = disc;
    }
    if (obj.userData.isPlanet) {
      openPlanetWindow(obj, {
        onEnter: () => setMode(BLUEPRINT_TO_IRIDESCENT),
        mountIridescent: mountIridescentFn,
      });
    } else {
      // Clicked iris background (backing mesh etc.) → back to IDLE
      returnToIdle();
    }
  }
}

// ─── Resize ────────────────────────────────────────────────────────────────

function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (bpCamera) { bpCamera.aspect = w / h; bpCamera.updateProjectionMatrix(); }
  renderer.setSize(w, h);
  setViewport(w, h);
  updateIrisResolution(w, h);
  updateNodesResolution(w, h);
  updateRingsResolution(w, h);
  updateSysMatsResolution(w, h);
}

// ─── Render loop ───────────────────────────────────────────────────────────

function loop() {
  if (!running) return;
  rafId = requestAnimationFrame(loop);

  const now = performance.now();
  const delta = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  const mode = getMode();
  updateMode(delta);
  if (!running) return;

  const w = window.innerWidth;
  const h = window.innerHeight;
  const fp = getFocusProgress();
  const focusedNode = getFocusTarget();

  if (mode !== BLUEPRINT_TO_IRIDESCENT) {
    bpCamera.position.x = THREE.MathUtils.damp(bpCamera.position.x, cameraTarget.x, 3, delta);
    bpCamera.position.y = THREE.MathUtils.damp(bpCamera.position.y, cameraTarget.y, 3, delta);
    bpCamera.position.z = THREE.MathUtils.damp(bpCamera.position.z, cameraTarget.z, 3, delta);

    const _lx = THREE.MathUtils.damp(bpCamera.userData._lx ?? 0, cameraLookAt.x, 3, delta);
    const _ly = THREE.MathUtils.damp(bpCamera.userData._ly ?? 0, cameraLookAt.y, 3, delta);
    bpCamera.userData._lx = _lx;
    bpCamera.userData._ly = _ly;
    bpCamera.lookAt(_lx, _ly, 0);
  }

  updateBlueprintRings(ringsGroup, delta);
  applyFocusAnimation(focusedNode, fp, delta);

  // Clear hover when not in focus mode
  if (mode !== BLUEPRINT_FOCUS) hoveredPlanet = null;

  if (mode === BLUEPRINT_FOCUS && focusedNode?.userData?.systemEntries) {
    updateSystemPlanets(focusedNode.userData.systemEntries, delta, fp, hoveredPlanet);

    // Inner disc hover fade
    for (const e of focusedNode.userData.systemEntries) {
      const target = e.disc === hoveredPlanet ? 0.9 : 0;
      e.innerMat.opacity = THREE.MathUtils.damp(e.innerMat.opacity, target, 6, delta);
    }
  }

  if (mode === BLUEPRINT_FOCUS) {
    pushSample("camDist", bpCamera.position.length());
    pushSample("orbitPhase", (now / 12000) % 1);
    pushSample("frameTime", delta * 1000);
    pushSample("bloomStrength", fp);
    renderGraphs();
  }

  const panelMargin = 220;
  const annoOpacity = mode === BLUEPRINT_FOCUS ? Math.max(0.12, 1 - fp * 0.85) : 1;
  updateAnnotations(bpCamera, w, h, annoOpacity, panelMargin);

  if (mode === BLUEPRINT_FOCUS) updateLabels(bpCamera, w, h, fp);

  if (mode === BLUEPRINT_TO_IRIDESCENT && overlayEl) {
    const dp = getDissolveProgress();
    overlayEl.style.opacity = String(dp);
    setUIOpacity(Math.max(0, 1 - dp * 1.5));
  }

  renderer.render(getBlueprintScene(), bpCamera);
}

// ─── Cleanup ───────────────────────────────────────────────────────────────

function stopBlueprint(closeWindow = true) {
  running = false;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;

  _removeModeListener?.();
  _removeModeListener = null;

  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("click", onClick);
  window.removeEventListener("resize", onResize);

  document.body.style.cursor = "";
  clearLabels?.();
  if (closeWindow) forceClosePlanetWindow();

  unmountBlueprintUI();
  unmountAnnotationLayer();
  // Defer GPU disposal to next frame — RAF is cancelled so nothing renders.
  // Keeps the JS thread free so the popup appears without stutter.
  deferDisposeBlueprintScene();
  clearIrisMats();
  clearNodeMats();
  clearRingMats();
  clearSysMats();
  bpNodes = [];
  ringsGroup = null;
  lastFocusedNode = null;
  hoveredPlanet = null;
  overlayEl?.remove();
  overlayEl = null;
}

// Stops blueprint cleanly without destroying the planet window DOM.
// Used when iridescent mounts inside the expanding planet window.
export function abortBlueprint() {
  stopBlueprint(false);
}

export function getBpCamera() { return bpCamera; }
