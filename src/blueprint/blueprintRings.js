import * as THREE from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";

const allRingMats = [];

function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function ellipsePositions(rx, ry, startAngle, endAngle, segments) {
  const arr = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const a = startAngle + (endAngle - startAngle) * t;
    arr.push(Math.cos(a) * rx, Math.sin(a) * ry, 0);
  }
  return arr;
}

export function createBlueprintRings({ count = 32, seed = 42 } = {}) {
  const group = new THREE.Group();
  group.userData = { isBlueprintRings: true };
  const rand = seeded(seed);
  const lineMaterials = [];
  const rings = [];

  for (let i = 0; i < count; i++) {
    const radius = 1.5 + rand() * 2.2;
    const ecc = 0.75 + rand() * 0.3;
    const rx = radius;
    const ry = radius * ecc;

    const isPartial = rand() < 0.55;
    let sa = 0;
    let ea = Math.PI * 2;
    if (isPartial) {
      const span = (0.35 + rand() * 0.95) * Math.PI * 2;
      sa = rand() * Math.PI * 2;
      ea = sa + span;
    }

    const segments = Math.max(96, Math.floor(radius * 80));
    const geom = new LineGeometry();
    geom.setPositions(ellipsePositions(rx, ry, sa, ea, segments));

    const weight = 0.5 + Math.pow(rand(), 2) * 2.0;
    const opacity = 0.25 + rand() * 0.55;

    const mat = new LineMaterial({
      color: 0xffffff,
      linewidth: weight,
      transparent: true,
      opacity,
    });
    mat.resolution.set(window.innerWidth, window.innerHeight);
    allRingMats.push(mat);
    lineMaterials.push(mat);

    const line = new Line2(geom, mat);
    line.computeLineDistances();

    line.rotation.x = (rand() - 0.5) * Math.PI * 0.9;
    line.rotation.y = (rand() - 0.5) * Math.PI * 0.9;
    line.rotation.z = rand() * Math.PI * 2;
    line.position.z = (rand() - 0.5) * 0.2;

    line.userData.baseOpacity = opacity;
    line.userData.spin = (rand() - 0.5) * 0.05;
    line.userData.spinAxis = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();

    group.add(line);
    rings.push(line);
  }

  group.userData.lineMaterials = lineMaterials;
  group.userData.rings = rings;
  return group;
}

export function updateBlueprintRings(group, delta) {
  if (!group) return;
  for (const ring of group.userData.rings) {
    ring.rotateOnAxis(ring.userData.spinAxis, ring.userData.spin * delta);
  }
}

export function updateRingsResolution(w, h) {
  for (const m of allRingMats) m.resolution.set(w, h);
}

export function clearRingMats() {
  allRingMats.length = 0;
}
