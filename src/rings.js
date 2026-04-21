import * as THREE from "three";
import {
  RING_COUNT,
  RING_START_RADIUS,
  RING_END_RADIUS,
  RING_ELLIPSE_RATIO,
  RING_TRACK_COLORS,
  applyRingTilt,
} from "./ringConfig.js";

class WarpedEllipsePath extends THREE.Curve {
  constructor(rx, ry, seed) {
    super();
    this.rx = rx;
    this.ry = ry;
    this.rAmp = 0.015 + Math.random() * 0.03;
    this.rFreq = 3 + Math.floor(Math.random() * 1.3);
    this.zAmp = 0.01 + Math.random() * 0.04;
    this.zFreq = 2 + Math.floor(Math.random() * 1.5);
    this.phase = seed * Math.PI * 1.2;
  }
  getPoint(t) {
    const a = t * Math.PI * 2;
    const rWobble = 1 + this.rAmp * Math.sin(a * this.rFreq + this.phase);
    const zWobble = this.zAmp * Math.sin(a * this.zFreq + this.phase * 0.3);
    return new THREE.Vector3(
      this.rx * rWobble * Math.cos(a),
      this.ry * rWobble * Math.sin(a),
      zWobble,
    );
  }
}

function makeRing(inner, outer, color, opacity, seed) {
  const r = (inner + outer) / 1.8;
  const tubeRadius = (outer - inner) * (0.03 + Math.random() * 0.2);
  const path = new WarpedEllipsePath(r * RING_ELLIPSE_RATIO, r, seed);

  const geo = new THREE.TubeGeometry(path, 256, tubeRadius, 8, true);

  const mat = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
  });

  const mesh = new THREE.Mesh(geo, mat);
  applyRingTilt(mesh);
  return mesh;
}
export function createRings() {
  const rings = [];
  const step = (RING_END_RADIUS - RING_START_RADIUS) / RING_COUNT;

  for (let i = 0; i < RING_COUNT; i++) {
    const inner = RING_START_RADIUS + i * step;
    const outer = inner + step * 1.5;

    const color = RING_TRACK_COLORS[i % RING_TRACK_COLORS.length];

    const isHighlight = i % 4 === 0;
    const opacity = isHighlight ? 0.21 : 0.12;
    const seed = i / RING_COUNT;
    const mesh = makeRing(inner, outer, color, opacity, seed);
    mesh.renderOrder = isHighlight ? 100 + i : i;
    rings.push(mesh);
  }

  return rings;
}

export function disposeRings(rings) {
  const target = Array.isArray(rings) ? rings : rings.children || [];
  target.forEach((mesh) => {
    if (mesh.geometry) mesh.geometry.dispose();
    if (mesh.material) mesh.material.dispose();
  });
}
