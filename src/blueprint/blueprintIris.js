import * as THREE from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { makeLineMat } from "./blueprintMaterials.js";

// Module-level material tracking so updateIrisResolution actually updates them
const allIrisMats = [];

function makeArcPositions(radius, startAngle, endAngle, segments) {
  const arr = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const a = startAngle + (endAngle - startAngle) * t;
    arr.push(Math.cos(a) * radius, Math.sin(a) * radius, 0);
  }
  return arr;
}

function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function makeMat(linewidth, opacity) {
  return makeLineMat(linewidth, opacity, allIrisMats);
}

export function createIrisPlanet({ id = "ALPHA", position = new THREE.Vector3(), scale = 1, seed = 1 } = {}) {
  const group = new THREE.Group();
  group.userData = { nodeId: id, nodeType: "planet", isIris: true };
  group.position.copy(position);

  const rand = seeded(seed);
  const lineMaterials = [];

  // Base dark disc to prevent back-ring bleed
  const backing = new THREE.Mesh(
    new THREE.CircleGeometry(1.15 * scale, 64),
    new THREE.MeshBasicMaterial({ color: 0x020202, transparent: true, opacity: 0.95, side: THREE.DoubleSide }),
  );
  backing.userData.baseOpacity = 0.95;
  backing.position.z = -0.02;
  group.add(backing);
  group.userData.backingMesh = backing;

  const ringCount = 42;
  for (let i = 0; i < ringCount; i++) {
    const tBase = i / (ringCount - 1);
    const r = (0.06 + Math.pow(tBase, 1.4) * 1.14) * scale;

    const isPartial = rand() < 0.45;
    let startA = 0;
    let endA = Math.PI * 2;
    if (isPartial) {
      const span = (0.25 + rand() * 0.8) * Math.PI * 2;
      startA = rand() * Math.PI * 2;
      endA = startA + span;
    }

    const segments = Math.max(64, Math.floor(r * 120));
    const positions = makeArcPositions(r, startA, endA, segments);
    const geom = new LineGeometry();
    geom.setPositions(positions);

    const weight = 0.8 + rand() * 1.8;
    const opacity = 0.45 + rand() * 0.5;
    const mat = makeMat(weight, opacity);
    lineMaterials.push(mat);

    const line = new Line2(geom, mat);
    line.computeLineDistances();
    line.position.z = (rand() - 0.5) * 0.08 * scale;
    line.rotation.x = (rand() - 0.5) * 0.18;
    line.rotation.y = (rand() - 0.5) * 0.18;
    line.rotation.z = rand() * Math.PI * 2;
    line.userData.baseOpacity = opacity;
    group.add(line);
  }

  // Detail sub-group (tick marks + inner rings) — shown only at focus
  const detailGroup = new THREE.Group();
  detailGroup.visible = false;
  const tickRadius = 0.55 * scale;
  const tickCount = 48;
  for (let i = 0; i < tickCount; i++) {
    const a = (i / tickCount) * Math.PI * 2;
    const len = 0.035 * scale * (0.6 + rand() * 0.8);
    const r1 = tickRadius;
    const r2 = tickRadius + len;
    const geom = new LineGeometry();
    geom.setPositions([
      Math.cos(a) * r1, Math.sin(a) * r1, 0.01,
      Math.cos(a) * r2, Math.sin(a) * r2, 0.01,
    ]);
    const mat = makeMat(1.1, 0.85);
    lineMaterials.push(mat);
    const seg = new Line2(geom, mat);
    seg.computeLineDistances();
    seg.userData.baseOpacity = 0.85;
    detailGroup.add(seg);
  }
  for (let k = 0; k < 6; k++) {
    const r = (0.12 + k * 0.04) * scale;
    const positions = makeArcPositions(r, 0, Math.PI * 2, 128);
    const geom = new LineGeometry();
    geom.setPositions(positions);
    const mat = makeMat(0.9, 0.7);
    lineMaterials.push(mat);
    const line = new Line2(geom, mat);
    line.computeLineDistances();
    line.userData.baseOpacity = 0.7;
    detailGroup.add(line);
  }
  group.add(detailGroup);

  group.userData.detailGroup = detailGroup;
  group.userData.lineMaterials = lineMaterials;
  group.userData.baseScale = scale;

  return group;
}

export function updateIrisResolution(w, h) {
  for (const m of allIrisMats) m.resolution.set(w, h);
}

export function clearIrisMats() {
  allIrisMats.length = 0;
}
