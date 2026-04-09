import * as THREE from "three";

const RING_TILT = Math.PI; // must match ring rotation.x
const COUNT = 1500;

// Scatter bright sparkle points within the ring disk plane
function buildGlitterPositions() {
  const pos = new Float32Array(COUNT * 3);
  const sizes = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    // Polar coords in the ring plane, then tilt to match ring angle
    const r = 1.22 + Math.random() * 1; // between inner and outer ring
    const theta = Math.random() * Math.PI * 2;
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    const y = (Math.random() - 0.5) * 0.08; // thin disk

    // Apply the same tilt as the rings
    const cy = Math.cos(RING_TILT);
    const sy = Math.sin(RING_TILT);
    pos[i * 3 + 0] = x;
    pos[i * 3 + 1] = y * cy - z * sy;
    pos[i * 3 + 2] = y * sy + z * cy;

    sizes[i] = 0.5 + Math.random() * 2.5;
  }
  return { pos, sizes };
}

const { pos, sizes } = buildGlitterPositions();

const geo = new THREE.BufferGeometry();
geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

const mat = new THREE.PointsMaterial({
  size: 0.018,
  color: 0xfff0cc,
  transparent: true,
  opacity: 0.7,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

export const glitter = new THREE.Points(geo, mat);
