import * as THREE from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { makeLineMat } from "./blueprintMaterials.js";

const SYSTEM_CONFIGS = {
  PROJECT_ALPHA: [
    { colorHex: 0xffe4e8, r: 1.05, speed: 0.28, size: 0.055, label: "ALPHA-I",   orbitR: 1.05, data: "ORBITAL_STABILITY: 99.1%",
      glyph: "triangle", tickCount: 4, satellite: { rOrbit: 1.3, speed: 1.4, size: 0.18 }, orbitStyle: "solid" },
    { colorHex: 0xe8d6ff, r: 1.32, speed: 0.16, size: 0.042, label: "ALPHA-II",  orbitR: 1.32, data: "ORBITAL_STABILITY: 97.4%",
      glyph: "diamond",  tickCount: 6, satellite: null,                                       orbitStyle: "dashed" },
    { colorHex: 0xd6fff2, r: 1.62, speed: 0.09, size: 0.05,  label: "ALPHA-III", orbitR: 1.62, data: "ORBITAL_STABILITY: 94.8%",
      glyph: "hex",      tickCount: 8, satellite: { rOrbit: 1.4, speed: 1.1, size: 0.18 }, orbitStyle: "solid" },
  ],
  PROJECT_BETA: [
    { colorHex: 0xd6e6ff, r: 1.05, speed: 0.30, size: 0.048, label: "BETA-I",  orbitR: 1.05, data: "ORBITAL_STABILITY: 98.2%",
      glyph: "plus",     tickCount: 6, satellite: null,                                       orbitStyle: "dotted" },
    { colorHex: 0xe8f6ff, r: 1.36, speed: 0.14, size: 0.055, label: "BETA-II", orbitR: 1.36, data: "ORBITAL_STABILITY: 95.6%",
      glyph: "ring-dot", tickCount: 4, satellite: { rOrbit: 1.3, speed: 1.6, size: 0.18 }, orbitStyle: "solid" },
  ],
};

const SIG_OPACITY = 0.55;       // signature fade target (relative to fp)
const SIG_HOVER_OPACITY = 0.85; // glyph boost on hover

const allSysMats = [];

function makeArc(radius, opacity = 0.2, segments = 256, style = "solid") {
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push(Math.cos(a) * radius, Math.sin(a) * radius, 0);
  }
  const geom = new LineGeometry();
  geom.setPositions(pts);
  const extra = {};
  if (style === "dashed") {
    extra.dashed = true; extra.dashSize = 0.06; extra.gapSize = 0.04;
  } else if (style === "dotted") {
    extra.dashed = true; extra.dashSize = 0.012; extra.gapSize = 0.04;
  }
  const mat = makeLineMat(0.55, opacity, allSysMats, extra);
  const line = new Line2(geom, mat);
  line.computeLineDistances();
  line.userData.baseOrbitOpacity = opacity;
  return { line, mat };
}

// ─── Glyph builders ─────────────────────────────────────────────────────────
// Each returns an array of THREE.Line / THREE.Mesh; the caller positions them.

function buildGlyph(kind, scale) {
  const mat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
  });
  const meshes = [];

  function lineFromPoints(pts, closed = true) {
    const arr = [];
    for (const p of pts) arr.push(p[0], p[1], 0);
    if (closed) arr.push(pts[0][0], pts[0][1], 0);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
    return new THREE.Line(geo, mat);
  }

  if (kind === "triangle") {
    const r = scale;
    const verts = [];
    for (let i = 0; i < 3; i++) {
      const a = -Math.PI / 2 + (i / 3) * Math.PI * 2;
      verts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    meshes.push(lineFromPoints(verts));
  } else if (kind === "diamond") {
    const r = scale;
    meshes.push(lineFromPoints([[0, r], [r, 0], [0, -r], [-r, 0]]));
  } else if (kind === "hex") {
    const r = scale;
    const verts = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      verts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    meshes.push(lineFromPoints(verts));
  } else if (kind === "plus") {
    const r = scale;
    meshes.push(lineFromPoints([[-r, 0], [r, 0]], false));
    meshes.push(lineFromPoints([[0, -r], [0, r]], false));
  } else if (kind === "ring-dot") {
    const r = scale;
    const verts = [];
    const segs = 24;
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      verts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    meshes.push(lineFromPoints(verts, false));
    // Centre filled dot
    const dotMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const dot = new THREE.Mesh(new THREE.CircleGeometry(scale * 0.22, 16), dotMat);
    meshes.push(dot);
    return { meshes, mats: [mat, dotMat] };
  }

  return { meshes, mats: [mat] };
}

// ─── Rim ticks ──────────────────────────────────────────────────────────────

function buildRimTicks(count, sizeBase) {
  const innerR = sizeBase * 1.55;
  const outerR = sizeBase * 1.85;
  const mats = [];
  const lines = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const arr = [
      Math.cos(a) * innerR, Math.sin(a) * innerR, 0,
      Math.cos(a) * outerR, Math.sin(a) * outerR, 0,
    ];
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
    const mat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
    });
    mats.push(mat);
    lines.push(new THREE.Line(geo, mat));
  }
  return { lines, mats };
}

// ─── Satellite ──────────────────────────────────────────────────────────────

function buildSatellite(cfg) {
  const sat = cfg.satellite;
  if (!sat) return null;
  const pivot = new THREE.Group();
  const dotR = cfg.size * sat.size;
  const orbitR = cfg.size * sat.rOrbit;
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
  });
  const dot = new THREE.Mesh(new THREE.CircleGeometry(dotR, 16), mat);
  dot.position.set(orbitR, 0, 0.001);
  pivot.add(dot);
  return { pivot, mat, speed: sat.speed };
}

// ─── Public API ─────────────────────────────────────────────────────────────

export function createSystemPlanets(nodeId, irisGroup) {
  const configs = SYSTEM_CONFIGS[nodeId];
  if (!configs) return [];

  const entries = [];

  configs.forEach((cfg, i) => {
    const { line: arc, mat: arcMat } = makeArc(cfg.r, 0, 256, cfg.orbitStyle);
    irisGroup.add(arc);

    const pivot = new THREE.Group();
    pivot.rotation.z = (i / configs.length) * Math.PI * 2;
    pivot.visible = false;
    irisGroup.add(pivot);

    // Outer white disc
    const discMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(cfg.size, 32),
      discMat,
    );
    disc.position.x = cfg.r;
    disc.userData.isPlanet = true;
    disc.userData.planetColor = cfg.colorHex;
    disc.userData.planetLabel = cfg.label;
    disc.userData.planetData = cfg.data;
    disc.userData.planetOrbitR = cfg.orbitR;
    disc.userData.planetSpeed = cfg.speed;
    disc.userData.planetSize = cfg.size;
    disc.userData.planetGlyph = cfg.glyph;
    disc.userData.planetTickCount = cfg.tickCount;
    disc.userData.planetSatellite = cfg.satellite;
    disc.userData.planetOrbitStyle = cfg.orbitStyle;
    disc.userData.baseOpacity = 0.95;
    pivot.add(disc);

    // Inner colored disc (hover reveal)
    const innerMat = new THREE.MeshBasicMaterial({
      color: cfg.colorHex,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const inner = new THREE.Mesh(
      new THREE.CircleGeometry(cfg.size * 0.6, 32),
      innerMat,
    );
    inner.position.x = cfg.r;
    inner.position.z = 0.001;
    inner.userData.isInnerDisc = true;
    pivot.add(inner);

    // Rim around the outer disc
    const { line: rim, mat: rimMat } = makeArc(cfg.size * 1.7, 0, 32);
    rim.position.x = cfg.r;
    pivot.add(rim);
    rim.userData.isRim = true;

    // Glyph above the disc
    const { meshes: glyphMeshes, mats: glyphMats } = buildGlyph(cfg.glyph, cfg.size * 0.55);
    const glyphGroup = new THREE.Group();
    glyphGroup.position.set(cfg.r, cfg.size * 1.7, 0.001);
    for (const m of glyphMeshes) glyphGroup.add(m);
    pivot.add(glyphGroup);

    // Rim ticks
    const { lines: tickLines, mats: tickMats } = buildRimTicks(cfg.tickCount, cfg.size);
    const tickGroup = new THREE.Group();
    tickGroup.position.set(cfg.r, 0, 0.001);
    for (const l of tickLines) tickGroup.add(l);
    pivot.add(tickGroup);

    // Satellite
    const sat = buildSatellite(cfg);
    if (sat) {
      sat.pivot.position.set(cfg.r, 0, 0.001);
      pivot.add(sat.pivot);
    }

    entries.push({
      pivot,
      disc,
      discMat,
      inner,
      innerMat,
      arc,
      arcMat,
      rim,
      rimMat,
      glyphGroup,
      glyphMats,
      tickGroup,
      tickMats,
      satellitePivot: sat?.pivot ?? null,
      satelliteMat: sat?.mat ?? null,
      satelliteSpeed: sat?.speed ?? 0,
      speed: cfg.speed,
      label: cfg.label,
      colorHex: cfg.colorHex,
      orbitR: cfg.orbitR,
      size: cfg.size,
      data: cfg.data,
      glyph: cfg.glyph,
      tickCount: cfg.tickCount,
      satellite: cfg.satellite,
      orbitStyle: cfg.orbitStyle,
    });
  });

  return entries;
}

export function showSystemPlanets(entries) {
  for (const e of entries) {
    e.pivot.visible = true;
  }
}

export function hideSystemPlanets(entries) {
  for (const e of entries) {
    e.pivot.visible = false;
    e.discMat.opacity = 0;
    e.arcMat.opacity = 0;
    e.rimMat.opacity = 0;
    e.innerMat.opacity = 0;
    for (const m of e.glyphMats) m.opacity = 0;
    for (const m of e.tickMats) m.opacity = 0;
    if (e.satelliteMat) e.satelliteMat.opacity = 0;
  }
}

const _damp = THREE.MathUtils.damp;

export function updateSystemPlanets(entries, delta, fp, hoveredDisc = null) {
  for (const e of entries) {
    const slow = e.disc === hoveredDisc ? 0.06 : 1.0;
    e.pivot.rotation.z += e.speed * slow * delta;

    if (e.satellitePivot) {
      e.satellitePivot.rotation.z += e.satelliteSpeed * slow * delta;
    }

    e.discMat.opacity = _damp(e.discMat.opacity, fp * 0.95, 5, delta);
    e.arcMat.opacity = _damp(e.arcMat.opacity, fp * 0.22, 5, delta);
    e.rimMat.opacity = _damp(e.rimMat.opacity, fp * 0.7, 5, delta);

    const isHovered = e.disc === hoveredDisc;
    const glyphTarget = fp * (isHovered ? SIG_HOVER_OPACITY : SIG_OPACITY);
    for (const m of e.glyphMats) {
      m.opacity = _damp(m.opacity, glyphTarget, 6, delta);
    }
    const tickTarget = fp * SIG_OPACITY;
    for (const m of e.tickMats) {
      m.opacity = _damp(m.opacity, tickTarget, 5, delta);
    }
    if (e.satelliteMat) {
      e.satelliteMat.opacity = _damp(e.satelliteMat.opacity, fp * SIG_OPACITY, 5, delta);
    }
  }
}

export function getSystemPlanetMeshes(entries) {
  return entries.map((e) => e.disc);
}

export function updateSysMatsResolution(w, h) {
  for (const m of allSysMats) m.resolution.set(w, h);
}

export function clearSysMats() {
  allSysMats.length = 0;
}
