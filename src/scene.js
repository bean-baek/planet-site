import * as THREE from "three";

export const canvas = document.getElementById("bg");

// --- Renderer ---
export const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.1;

// --- Scene ---
export const scene = new THREE.Scene();
scene.background = new THREE.Color("#001a1a");

// --- Camera ---
export const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.z = 5;

// --- Lights ---

// Warm golden key light — upper-right front, creates the strong specular highlight on the planet
const keyLight = new THREE.DirectionalLight(0xfff2cc, 0.9);
keyLight.position.set(3, 6, 4);
scene.add(keyLight);

// Soft pink fill from left
const fillLight = new THREE.DirectionalLight(0xffd0e8, 1.1);
fillLight.position.set(-4, 2, 3);
scene.add(fillLight);

// Cool blue-teal back/rim light
const rimLight = new THREE.DirectionalLight(0xaaddee, 0.8);
rimLight.position.set(-2, 8, -6);
scene.add(rimLight);

// Ambient — keep dark teal mood
const ambientLight = new THREE.AmbientLight(0x1a2a35, 0.8);
scene.add(ambientLight);
