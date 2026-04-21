import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
export const canvas = document.getElementById("bg");

// --- 1. Renderer ---
export const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 0.9;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// --- 2. Scene & Environment ---
export const scene = new THREE.Scene();
const HAZE_COLOR = new THREE.Color("#355865"); // muted grey-teal — airy, not cyan, matches reference atmospheric haze
scene.background = HAZE_COLOR;
scene.fog = new THREE.Fog(HAZE_COLOR, 4, 14);

// --- 3. Camera ---
export const camera = new THREE.PerspectiveCamera(
  38,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(0, 0.4, 5);
camera.lookAt(0, 0, 0);

// --- 4. Lights ---
// Moderate warm ambient — flat diffuse lighting without blowing out ring material
const ambientLight = new THREE.AmbientLight("#ffffff", 2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xe8d6ff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);
