import * as THREE from "three";
import { RING_TILT_X, RING_TILT_Y } from "./ringConfig.js";

const COUNT = 320;
const INNER_R = 1.8;
const OUTER_R = 3.6;

const PALETTE = [
  0xffb5c5, // rose pink
  0xffc9d6, // pale blossom
  0xff9fb0, // deeper pink
  0xffe0e4, // almost white
  0xffa89c, // coral
].map((hex) => new THREE.Color(hex));

function createFlowerTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const flowerTexture = createFlowerTexture();

function buildPetalAttributes() {
  const pos = new Float32Array(COUNT * 3);
  const sizes = new Float32Array(COUNT);
  const colors = new Float32Array(COUNT * 3);

  for (let i = 0; i < COUNT; i++) {
    const r = INNER_R + Math.random() * (OUTER_R - INNER_R);
    // 3:1 weighted sample — most petals in lower half (foreground debris),
    // but a few scatter into the upper half like the reference's sparse
    // upper-right cluster.
    const inLowerHalf = Math.random() < 0.78;
    const theta = inLowerHalf
      ? Math.PI + Math.random() * Math.PI
      : Math.random() * Math.PI;
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    const z = (Math.random() - 0.5) * 0.5;

    pos[i * 3 + 0] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;

    const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    colors[i * 3 + 0] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    // Varied sizes — some large blossoms, some small buds
    sizes[i] = 0.5 + Math.random() * 2.0;
  }
  return { pos, sizes, colors };
}

const { pos, sizes, colors } = buildPetalAttributes();

const geo = new THREE.BufferGeometry();
geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

const mat = new THREE.PointsMaterial({
  size: 0.18,
  map: flowerTexture,
  vertexColors: true,
  transparent: true,
  opacity: 0.85,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  fog: false,
});

export const petals = new THREE.Points(geo, mat);

// Match ring plane tilt
petals.rotation.x = RING_TILT_X;
petals.rotation.y = RING_TILT_Y;

export function disposePetals() {
  geo.dispose();
  mat.dispose();
  flowerTexture.dispose();
}
