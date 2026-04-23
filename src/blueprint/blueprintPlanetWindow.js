import * as THREE from "three";

let root = null;
let miniRenderer = null;
let miniRaf = null;
let enterCb = null;

function _onKeyDown(e) {
  if (e.key === "Escape") closePlanetWindow();
}

// ─── Mini canvas blueprint planet preview ─────────────────────────────────

function buildMiniScene(colorHex) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
  camera.position.set(0, 0, 4.5);
  camera.lookAt(0, 0, 0);

  const group = new THREE.Group();
  scene.add(group);

  // Concentric arcs — simplified iris style using LineBasicMaterial
  const ringCount = 24;
  for (let i = 0; i < ringCount; i++) {
    const t = i / (ringCount - 1);
    const r = 0.08 + Math.pow(t, 1.3) * 1.1;
    const isPartial = i % 3 === 1;
    const startA = isPartial ? (i * 0.7) % (Math.PI * 2) : 0;
    const endA = isPartial ? startA + Math.PI * (1.1 + (i % 4) * 0.2) : Math.PI * 2;
    const segs = Math.max(48, Math.floor(r * 100));

    const pts = [];
    for (let s = 0; s <= segs; s++) {
      const a = startA + (endA - startA) * (s / segs);
      pts.push(Math.cos(a) * r, Math.sin(a) * r, 0);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    const mat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3 + t * 0.5,
    });
    const line = new THREE.Line(geo, mat);
    line.rotation.z = (i * 0.4) % (Math.PI * 2);
    group.add(line);
  }

  // Orbit dot using the planet's actual color
  const orbitPivot = new THREE.Group();
  group.add(orbitPivot);
  const dotMat = new THREE.MeshBasicMaterial({ color: colorHex, side: THREE.DoubleSide });
  const dot = new THREE.Mesh(new THREE.CircleGeometry(0.055, 24), dotMat);
  dot.position.x = 1.35;
  orbitPivot.add(dot);

  // Orbit ring around the dot
  const orbitPts = [];
  for (let i = 0; i <= 128; i++) {
    const a = (i / 128) * Math.PI * 2;
    orbitPts.push(Math.cos(a) * 1.35, Math.sin(a) * 1.35, 0);
  }
  const orbitGeo = new THREE.BufferGeometry();
  orbitGeo.setAttribute("position", new THREE.Float32BufferAttribute(orbitPts, 3));
  const orbitMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18 });
  group.add(new THREE.Line(orbitGeo, orbitMat));

  return { scene, camera, group, orbitPivot };
}

// ─── Property list builder ─────────────────────────────────────────────────

function hexToCSS(hex) {
  return "#" + hex.toString(16).padStart(6, "0").toUpperCase();
}

function buildPropertyRows(disc) {
  const label  = disc.userData.planetLabel  ?? "—";
  const orbitR = disc.userData.planetOrbitR ?? "—";
  const speed  = disc.userData.planetSpeed  ?? "—";
  const color  = disc.userData.planetColor  ?? 0xffffff;
  const data   = disc.userData.planetData   ?? "";

  const rows = [
    ["DESIGNATION",  label],
    ["ORBITAL.R",    `${orbitR} AU`],
    ["ORBITAL.SPD",  `${speed} rad/s`],
    ["COLOR.THEME",  hexToCSS(color)],
    ["STABILITY",    data.split(": ")[1] ?? "—"],
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

// ─── Public API ───────────────────────────────────────────────────────────

export function openPlanetWindow(disc, onEnter) {
  if (root) closePlanetWindow();

  enterCb = onEnter;
  const colorHex = disc.userData.planetColor ?? 0xffffff;
  const label    = disc.userData.planetLabel ?? "PLANET";

  // DOM structure
  root = document.createElement("div");
  root.className = "bp-pw-root";
  root.innerHTML = `
    <div class="bp-pw-panel">
      <div class="bp-pw-header">
        <span class="bp-pw-header-id">${label}</span>
        <button class="bp-pw-close" aria-label="close">✕</button>
      </div>
      <div class="bp-pw-body">
        <div class="bp-pw-left">
          ${buildPropertyRows(disc)}
        </div>
        <div class="bp-pw-right">
          <div class="bp-pw-canvas-wrap" title="Click to enter iridescent view">
            <canvas class="bp-pw-canvas" width="260" height="260"></canvas>
            <div class="bp-pw-canvas-hint">// CLICK TO ENTER</div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(root);

  // All clicks inside the window must NOT reach the blueprint canvas below
  root.addEventListener("click", (e) => {
    e.stopPropagation();
    if (e.target === root) closePlanetWindow();
  });

  // Close button
  root.querySelector(".bp-pw-close").addEventListener("click", (e) => {
    e.stopPropagation();
    closePlanetWindow();
  });

  window.addEventListener("keydown", _onKeyDown);

  // Mini Three.js renderer on the canvas
  const canvas = root.querySelector(".bp-pw-canvas");
  miniRenderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  miniRenderer.setPixelRatio(window.devicePixelRatio);
  miniRenderer.setSize(260, 260, false);

  const { scene, camera, group, orbitPivot } = buildMiniScene(colorHex);

  // Click canvas → enter (capture cb before close clears it)
  canvas.style.cursor = "pointer";
  canvas.addEventListener("click", (e) => {
    e.stopPropagation();
    const cb = enterCb;
    closePlanetWindow();
    cb?.();
  });

  let t = 0;
  function tick() {
    if (!miniRenderer) return;
    miniRaf = requestAnimationFrame(tick);
    t += 0.008;
    group.rotation.z = t * 0.12;
    orbitPivot.rotation.z = t;
    miniRenderer.render(scene, camera);
  }
  tick();
}

export function closePlanetWindow() {
  if (!root) return;
  if (miniRaf) { cancelAnimationFrame(miniRaf); miniRaf = null; }
  if (miniRenderer) { miniRenderer.dispose(); miniRenderer = null; }
  root.remove();
  root = null;
  enterCb = null;
  // Clean up ESC listener that was added per-open
  window.removeEventListener("keydown", _onKeyDown);
}
