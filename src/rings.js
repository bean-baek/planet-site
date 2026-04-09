import * as THREE from "three";

const ELLIPSE_RATIO = 1; // X stretch — increase for more oval

class EllipsePath extends THREE.Curve {
  constructor(rx, ry) {
    super();
    this.rx = rx;
    this.ry = ry;
  }
  getPoint(t) {
    const a = t * Math.PI * 2;
    return new THREE.Vector3(this.rx * Math.cos(a), this.ry * Math.sin(a), 0);
  }
}

function makeRing(inner, outer, color, opacity) {
  const r = (inner + outer) / 2;
  const tubeRadius = (outer - inner) * 0.08;
  const path = new EllipsePath(r * ELLIPSE_RATIO, r);
  const geo = new THREE.TubeGeometry(path, 256, tubeRadius, 64, true);
  const mat = new THREE.MeshPhysicalMaterial({
    color,
    transparent: true,
    iridescence: 1.0,
    iridescenceIOR: 1.5,
    roughness: 0.1,
    metalness: 0.7,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = Math.PI / 2 + 0.2;
  return mesh;
}

// ~20 fine concentric rings spanning r=1.22–2.30, matching the dense Saturn-like banding in the reference
export function createRings() {
  const defs = [
    [1.22, 1.25, 0xffe8cc, 2.2],
    [1.27, 1.3, 0xffd4a8, 2.35],
    [1.32, 1.36, 0xffeedd, 1.3],
    [1.38, 1.42, 0xffd8f0, 2.5],
    [1.44, 1.46, 0xfff0cc, 1.22],
    [1.48, 1.55, 0xffe0cc, 2.55],
    [1.57, 1.6, 0xcceeee, 2.28],
    [1.62, 1.66, 0xffd4a8, 2.45],
    [1.68, 1.7, 0xffeedd, 1.2],
    [1.72, 1.78, 0xffd0e8, 2.5],
    [1.8, 1.82, 0xfff0cc, 2.22],
    [1.84, 1.89, 0xffe8cc, 2.4],
    [1.91, 1.93, 0xeeddff, 1.18],
    [1.95, 2.0, 0xffd8e8, 2.38],
    [2.02, 2.04, 0xfff0dd, 2.15],
    [1.22, 1.25, 0xffe8cc, 2.2],
    [1.27, 1.3, 0xffd4a8, 2.35],
    [1.32, 1.36, 0xffeedd, 1.3],
    [1.38, 1.42, 0xffd8f0, 2.5],
    [1.44, 1.46, 0xfff0cc, 1.22],
    [1.48, 1.55, 0xffe0cc, 2.55],
    [1.57, 1.6, 0xcceeee, 2.28],
    [1.62, 1.66, 0xffd4a8, 2.45],
    [1.68, 1.7, 0xffeedd, 1.2],
    [1.72, 1.78, 0xffd0e8, 2.5],
    [1.8, 1.82, 0xfff0cc, 2.22],
    [1.84, 1.89, 0xffe8cc, 2.4],
    [1.91, 1.93, 0xeeddff, 1.18],
    [1.95, 2.0, 0xffd8e8, 2.38],
    [2.02, 2.04, 0xfff0dd, 2.15],
    [1.22, 1.25, 0xffe8cc, 2.2],
    [1.27, 1.3, 0xffd4a8, 2.35],
    [1.32, 1.36, 0xffeedd, 1.3],
    [1.38, 1.42, 0xffd8f0, 2.5],
    [1.44, 1.46, 0xfff0cc, 1.22],
    [1.48, 1.55, 0xffe0cc, 2.55],
    [1.57, 1.6, 0xcceeee, 2.28],
    [1.62, 1.66, 0xffd4a8, 2.45],
    [1.68, 1.7, 0xffeedd, 1.2],
    [1.72, 1.78, 0xffd0e8, 2.5],
    [1.8, 1.82, 0xfff0cc, 2.22],
    [1.84, 1.89, 0xffe8cc, 2.4],
    [1.91, 1.93, 0xeeddff, 1.18],
    [1.95, 2.0, 0xffd8e8, 2.38],
    [2.02, 2.04, 0xfff0dd, 2.15],
  ];

  return defs.map(([inner, outer, color, opacity]) =>
    makeRing(inner, outer, color, opacity),
  );
}
