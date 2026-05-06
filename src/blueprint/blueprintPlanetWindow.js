import * as THREE from "three";
import { mountIridescentHud, unmountIridescentHud } from "./blueprintIridescentHud.js";

let root         = null;
let miniRenderer = null;
let miniRaf      = null;
let enterCb      = null;
let mountIridescentCb = null;
let currentDisc  = null;
let isMaximized  = false;
let savedOnBack  = null;

function _onKeyDown(e) {
  if (e.key === "Escape" && !isMaximized) closePlanetWindow();
}

// ─── Mini canvas glyph ────────────────────────────────────────────────────

function buildMiniGlyph(kind, scale, parent) {
  const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 });

  function lineFromPoints(pts, closed = true) {
    const arr = [];
    for (const p of pts) arr.push(p[0], p[1], 0);
    if (closed) arr.push(pts[0][0], pts[0][1], 0);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
    return new THREE.Line(geo, mat);
  }

  const r = scale;
  if (kind === "triangle") {
    parent.add(lineFromPoints(Array.from({ length: 3 }, (_, i) => {
      const a = -Math.PI / 2 + (i / 3) * Math.PI * 2;
      return [Math.cos(a) * r, Math.sin(a) * r];
    })));
  } else if (kind === "diamond") {
    parent.add(lineFromPoints([[0, r], [r, 0], [0, -r], [-r, 0]]));
  } else if (kind === "hex") {
    parent.add(lineFromPoints(Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2;
      return [Math.cos(a) * r, Math.sin(a) * r];
    })));
  } else if (kind === "plus") {
    parent.add(lineFromPoints([[-r, 0], [r, 0]], false));
    parent.add(lineFromPoints([[0, -r], [0, r]], false));
  } else {
    parent.add(lineFromPoints(Array.from({ length: 25 }, (_, i) => {
      const a = (i / 24) * Math.PI * 2;
      return [Math.cos(a) * r, Math.sin(a) * r];
    }), false));
  }
}

// ─── Mini canvas Three.js scene ───────────────────────────────────────────

function buildMiniScene(disc) {
  const colorHex = disc.userData.planetColor ?? 0xffffff;
  const glyph    = disc.userData.planetGlyph  ?? null;

  const scene  = new THREE.Scene();
  scene.background = new THREE.Color(0x040810);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
  camera.position.set(0, 0, 4.5);
  camera.lookAt(0, 0, 0);

  const group = new THREE.Group();
  scene.add(group);

  const ringCount = 24;
  for (let i = 0; i < ringCount; i++) {
    const t       = i / (ringCount - 1);
    const r       = 0.08 + Math.pow(t, 1.3) * 1.1;
    const partial = i % 3 === 1;
    const startA  = partial ? (i * 0.7) % (Math.PI * 2) : 0;
    const endA    = partial ? startA + Math.PI * (1.1 + (i % 4) * 0.2) : Math.PI * 2;
    const segs    = Math.max(48, Math.floor(r * 100));
    const pts     = [];
    for (let s = 0; s <= segs; s++) {
      const a = startA + (endA - startA) * (s / segs);
      pts.push(Math.cos(a) * r, Math.sin(a) * r, 0);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.3 + t * 0.5,
    }));
    line.rotation.z = (i * 0.4) % (Math.PI * 2);
    group.add(line);
  }

  const orbitPivot = new THREE.Group();
  group.add(orbitPivot);

  const dot = new THREE.Mesh(
    new THREE.CircleGeometry(0.055, 24),
    new THREE.MeshBasicMaterial({ color: colorHex, side: THREE.DoubleSide }),
  );
  dot.position.x = 1.35;
  orbitPivot.add(dot);

  if (glyph) {
    const glyphGroup = new THREE.Group();
    glyphGroup.position.set(1.35, 0.18, 0);
    buildMiniGlyph(glyph, 0.07, glyphGroup);
    orbitPivot.add(glyphGroup);
  }

  const orbitPts = [];
  for (let i = 0; i <= 128; i++) {
    const a = (i / 128) * Math.PI * 2;
    orbitPts.push(Math.cos(a) * 1.35, Math.sin(a) * 1.35, 0);
  }
  const orbitGeo = new THREE.BufferGeometry();
  orbitGeo.setAttribute("position", new THREE.Float32BufferAttribute(orbitPts, 3));
  group.add(new THREE.Line(orbitGeo, new THREE.LineBasicMaterial({
    color: 0xffffff, transparent: true, opacity: 0.18,
  })));

  return { scene, camera, group, orbitPivot };
}

// ─── Property rows builder ─────────────────────────────────────────────────

function hexToCSS(hex) {
  return "#" + hex.toString(16).padStart(6, "0").toUpperCase();
}

function buildPropertyRows(disc) {
  const label  = disc.userData.planetLabel     ?? "—";
  const orbitR = disc.userData.planetOrbitR    ?? "—";
  const speed  = disc.userData.planetSpeed     ?? "—";
  const color  = disc.userData.planetColor     ?? 0xffffff;
  const data   = disc.userData.planetData      ?? "";
  const glyph  = disc.userData.planetGlyph     ?? "—";
  const ticks  = disc.userData.planetTickCount ?? "—";
  const hasSat = disc.userData.planetSatellite ? "1" : "0";
  const orbit  = disc.userData.planetOrbitStyle ?? "—";

  const rows = [
    ["DESIGNATION",  label],
    ["ORBITAL.R",    `${orbitR} AU`],
    ["ORBITAL.SPD",  `${speed} rad/s`],
    ["COLOR.THEME",  hexToCSS(color)],
    ["STABILITY",    data.split(": ")[1] ?? "—"],
    null,
    ["GLYPH",        glyph.toUpperCase()],
    ["RIM.TICKS",    String(ticks)],
    ["SAT.COUNT",    hasSat],
    ["ORBIT.STYLE",  orbit.toUpperCase()],
    null,
    ["RING.COUNT",   "100"],
    ["RING.PALETTE", "8 pastel tracks"],
    ["GLITTER",      "5 000 particles"],
    ["FLOWERS",      "120 instances"],
    ["BUBBLES",      "100 spheres"],
    ["PETALS",       "320 blossom"],
  ];

  return rows.map((r) => {
    if (!r) return `<div class="bp-pw-divider">// IRIDESCENT PROPERTIES</div>`;
    const [k, v] = r;
    const colorDot = k === "COLOR.THEME"
      ? `<span class="bp-pw-dot" style="background:${v}"></span>`
      : "";
    return `<div class="bp-pw-row"><span class="bp-pw-key">${k}</span><span class="bp-pw-val">${colorDot}${v}</span></div>`;
  }).join("");
}

// ─── Maximize sequence ─────────────────────────────────────────────────────

function startMaximize() {
  if (!root) return;
  const disc = currentDisc;
  isMaximized = true;

  // Block further interaction immediately
  root.style.pointerEvents = "none";

  // Fade out the entire planet window — iridescent will cross-fade in behind it
  requestAnimationFrame(() => {
    root.style.transition = "opacity 0.45s ease";
    root.style.opacity    = "0";
  });

  // Short delay so fade starts before GPU work; keeps JS thread free during the fade
  setTimeout(async () => {
    if (!isMaximized) return; // force-closed during the 150ms window

    if (miniRaf)      { cancelAnimationFrame(miniRaf); miniRaf = null; }
    if (miniRenderer) { miniRenderer.dispose(); miniRenderer = null; }

    if (mountIridescentCb) {
      savedOnBack = await mountIridescentCb();
    }

    // Remove planet window DOM (already invisible by now)
    if (root) { root.remove(); root = null; }
    window.removeEventListener("keydown", _onKeyDown);

    if (disc && savedOnBack) {
      const onBackFn       = typeof savedOnBack === "function" ? savedOnBack : (savedOnBack.onBack ?? savedOnBack);
      const onCanvasResize = savedOnBack.onCanvasResize ?? null;
      const winDims        = savedOnBack.winDims        ?? null;

      mountIridescentHud(disc, () => {
        unmountIridescentHud();
        _forceClose();
        onBackFn();
      }, { onResize: onCanvasResize, winDims });
    }
  }, 150);
}

// ─── Internal cleanup ─────────────────────────────────────────────────────

function _forceClose() {
  if (miniRaf)      { cancelAnimationFrame(miniRaf); miniRaf = null; }
  if (miniRenderer) { miniRenderer.dispose(); miniRenderer = null; }
  if (root)         { root.remove(); root = null; }
  window.removeEventListener("keydown", _onKeyDown);
  isMaximized       = false;
  currentDisc       = null;
  mountIridescentCb = null;
  enterCb           = null;
  savedOnBack       = null;
}

// ─── Public API ───────────────────────────────────────────────────────────

export function isPlanetWindowMaximized() { return isMaximized; }

export function openPlanetWindow(disc, cbOrObj) {
  if (root) closePlanetWindow();

  if (typeof cbOrObj === "function") {
    enterCb           = cbOrObj;
    mountIridescentCb = null;
  } else {
    enterCb           = cbOrObj?.onEnter         ?? null;
    mountIridescentCb = cbOrObj?.mountIridescent  ?? null;
  }

  currentDisc = disc;
  isMaximized = false;
  savedOnBack = null;
  const label = disc.userData.planetLabel ?? "PLANET";

  root = document.createElement("div");
  root.className = "bp-pw-root";
  root.innerHTML = `
    <div class="bp-pw-panel">
      <div class="bp-pw-header">
        <span class="bp-pw-header-id">${label}</span>
        <div class="bp-pw-header-actions">
          <button class="bp-pw-enter">▶ ENTER</button>
          <button class="bp-pw-close" aria-label="close">✕</button>
        </div>
      </div>
      <div class="bp-pw-body">
        <div class="bp-pw-left">
          ${buildPropertyRows(disc)}
        </div>
        <div class="bp-pw-right">
          <div class="bp-pw-canvas-wrap">
            <canvas class="bp-pw-canvas" width="280" height="280"></canvas>
            <div class="bp-pw-vp-frame">
              <i class="bp-pw-vp-c tl"></i>
              <i class="bp-pw-vp-c tr"></i>
              <i class="bp-pw-vp-c bl"></i>
              <i class="bp-pw-vp-c br"></i>
              <span class="bp-pw-vp-label">SYS.VIEWPORT</span>
            </div>
            <div class="bp-pw-canvas-hint">▶ ENTER SYSTEM</div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  root.addEventListener("click", (e) => {
    e.stopPropagation();
    if (e.target === root) closePlanetWindow();
  });

  function triggerEnter(e) {
    e.stopPropagation();
    if (mountIridescentCb) {
      startMaximize();
    } else {
      const cb = enterCb;
      closePlanetWindow();
      cb?.();
    }
  }

  root.querySelector(".bp-pw-close").addEventListener("click", (e) => {
    e.stopPropagation();
    closePlanetWindow();
  });
  root.querySelector(".bp-pw-enter").addEventListener("click", triggerEnter);

  window.addEventListener("keydown", _onKeyDown);

  const canvas = root.querySelector(".bp-pw-canvas");
  miniRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  miniRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  miniRenderer.setSize(280, 280, false);

  const { scene, camera, group, orbitPivot } = buildMiniScene(disc);

  canvas.style.cursor = "pointer";
  canvas.addEventListener("click", triggerEnter);

  let t = 0;
  function tick() {
    if (!miniRenderer) return;
    miniRaf = requestAnimationFrame(tick);
    t += 0.008;
    group.rotation.z      = t * 0.12;
    orbitPivot.rotation.z = t;
    miniRenderer.render(scene, camera);
  }
  tick();
}

export function closePlanetWindow() {
  if (!root) return;
  if (isMaximized) return;
  _forceClose();
}

export function forceClosePlanetWindow() {
  _forceClose();
}
