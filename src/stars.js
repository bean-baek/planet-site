import * as THREE from "three";

const COUNT = 1000;
const positions = new Float32Array(COUNT * 3);
for (let i = 0; i < COUNT * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 20;
}

const geo = new THREE.BufferGeometry();
geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

const mat = new THREE.PointsMaterial({
  size: 0.02,
  color: 0xffffff,
  transparent: true,
  opacity: 1.0,
});

export const stars = new THREE.Points(geo, mat);
