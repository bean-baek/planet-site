import * as THREE from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";

const SYSTEM_CONFIGS = {
  PROJECT_ALPHA: [
    { colorHex: 0xffe4e8, r: 1.05, speed: 0.28, size: 0.055, label: "ALPHA-I",   orbitR: 1.05, data: "ORBITAL_STABILITY: 99.1%" },
    { colorHex: 0xe8d6ff, r: 1.32, speed: 0.16, size: 0.042, label: "ALPHA-II",  orbitR: 1.32, data: "ORBITAL_STABILITY: 97.4%" },
    { colorHex: 0xd6fff2, r: 1.62, speed: 0.09, size: 0.05,  label: "ALPHA-III", orbitR: 1.62, data: "ORBITAL_STABILITY: 94.8%" },
  ],
  PROJECT_BETA: [
    { colorHex: 0xd6e6ff, r: 1.05, speed: 0.30, size: 0.048, label: "BETA-I",  orbitR: 1.05, data: "ORBITAL_STABILITY: 98.2%" },
    { colorHex: 0xe8f6ff, r: 1.36, speed: 0.14, size: 0.055, label: "BETA-II", orbitR: 1.36, data: "ORBITAL_STABILITY: 95.6%" },
  ],
};

const allSysMats = [];

function makeArc(radius, opacity = 0.2, segments = 256) {
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push(Math.cos(a) * radius, Math.sin(a) * radius, 0);
  }
  const geom = new LineGeometry();
  geom.setPositions(pts);
  const mat = new LineMaterial({
    color: 0xffffff,
    linewidth: 0.55,
    transparent: true,
    opacity,
  });
  mat.resolution.set(window.innerWidth, window.innerHeight);
  allSysMats.push(mat);
  const line = new Line2(geom, mat);
  line.computeLineDistances();
  line.userData.baseOrbitOpacity = opacity;
  return { line, mat };
}

export function createSystemPlanets(nodeId, irisGroup) {
  const configs = SYSTEM_CONFIGS[nodeId];
  if (!configs) return [];

  const entries = [];

  configs.forEach((cfg, i) => {
    const { line: arc, mat: arcMat } = makeArc(cfg.r, 0);
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
      speed: cfg.speed,
      label: cfg.label,
      colorHex: cfg.colorHex,
      orbitR: cfg.orbitR,
      size: cfg.size,
      data: cfg.data,
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
  }
}

const _damp = THREE.MathUtils.damp;

export function updateSystemPlanets(entries, delta, fp, hoveredDisc = null) {
  for (const e of entries) {
    const slow = e.disc === hoveredDisc ? 0.06 : 1.0;
    e.pivot.rotation.z += e.speed * slow * delta;
    e.discMat.opacity = _damp(e.discMat.opacity, fp * 0.95, 5, delta);
    e.arcMat.opacity = _damp(e.arcMat.opacity, fp * 0.22, 5, delta);
    e.rimMat.opacity = _damp(e.rimMat.opacity, fp * 0.7, 5, delta);
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
