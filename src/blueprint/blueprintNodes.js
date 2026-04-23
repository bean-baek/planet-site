import * as THREE from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";

const allNodeMats = [];

function arcPositions(radius, startAngle, endAngle, segments) {
  const arr = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const a = startAngle + (endAngle - startAngle) * t;
    arr.push(Math.cos(a) * radius, Math.sin(a) * radius, 0);
  }
  return arr;
}

function makeMat(linewidth, opacity) {
  const mat = new LineMaterial({
    color: 0xffffff,
    linewidth,
    transparent: true,
    opacity,
  });
  mat.resolution.set(window.innerWidth, window.innerHeight);
  allNodeMats.push(mat);
  return mat;
}

function makeLine({ radius, startAngle = 0, endAngle = Math.PI * 2, linewidth = 1, opacity = 1, segments = 64 }) {
  const geom = new LineGeometry();
  geom.setPositions(arcPositions(radius, startAngle, endAngle, segments));
  const mat = makeMat(linewidth, opacity);
  const line = new Line2(geom, mat);
  line.computeLineDistances();
  line.userData.baseOpacity = opacity;
  return { line, mat };
}

export function createDiscNode({ id, nodeType = "disc", radius = 0.08, position = new THREE.Vector3() }) {
  const group = new THREE.Group();
  group.userData = { nodeId: id, nodeType, isDiscNode: true };
  group.position.copy(position);

  const lineMaterials = [];

  // Filled core disc
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1, side: THREE.DoubleSide });
  const core = new THREE.Mesh(new THREE.CircleGeometry(radius, 32), coreMat);
  core.userData.baseOpacity = 1;
  group.add(core);
  group.userData.coreMesh = core;
  group.userData.coreMat = coreMat;

  // Inner pupil (black)
  const pupil = new THREE.Mesh(
    new THREE.CircleGeometry(radius * 0.42, 24),
    new THREE.MeshBasicMaterial({ color: 0x050505, side: THREE.DoubleSide }),
  );
  pupil.position.z = 0.001;
  group.add(pupil);

  // Inner bright dot
  const innerDot = new THREE.Mesh(
    new THREE.CircleGeometry(radius * 0.16, 16),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
  );
  innerDot.position.z = 0.002;
  group.add(innerDot);

  const rings = [
    { r: radius * 1.35, lw: 1.3, o: 0.95 },
    { r: radius * 1.75, lw: 0.9, o: 0.6, partial: true },
    { r: radius * 2.4, lw: 0.7, o: 0.35, partial: true },
  ];
  rings.forEach((cfg, i) => {
    let sa = 0;
    let ea = Math.PI * 2;
    if (cfg.partial) {
      const span = (0.4 + i * 0.15) * Math.PI * 2;
      sa = (i * 1.7) % (Math.PI * 2);
      ea = sa + span;
    }
    const { line, mat } = makeLine({
      radius: cfg.r,
      startAngle: sa,
      endAngle: ea,
      linewidth: cfg.lw,
      opacity: cfg.o,
      segments: Math.max(48, Math.floor(cfg.r * 180)),
    });
    lineMaterials.push(mat);
    group.add(line);
  });

  // Crosshair ticks
  const tickLen = radius * 1.9;
  const makeTick = (x1, y1, x2, y2) => {
    const geom = new LineGeometry();
    geom.setPositions([x1, y1, 0, x2, y2, 0]);
    const mat = makeMat(0.7, 0.5);
    lineMaterials.push(mat);
    const line = new Line2(geom, mat);
    line.computeLineDistances();
    line.userData.baseOpacity = 0.5;
    group.add(line);
  };
  makeTick(-tickLen, 0, -radius * 1.45, 0);
  makeTick(radius * 1.45, 0, tickLen, 0);

  group.userData.lineMaterials = lineMaterials;
  group.userData.baseScale = 1;
  return group;
}

export function updateNodesResolution(w, h) {
  for (const m of allNodeMats) m.resolution.set(w, h);
}

export function clearNodeMats() {
  allNodeMats.length = 0;
}
